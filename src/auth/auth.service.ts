import {
  BadRequestException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ConfirmEmailDto,
  CreateAuthDto,
  ResendEmailDto,
  ResetPasswordDto,
} from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly sendgridService: SendgridService,
    private config: ConfigService,
  ) {}
  async signup(createAuthDto: CreateAuthDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(createAuthDto.password);
      // save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: createAuthDto.email,
          hash,
        },
      });
      let token = await this.createToken(user.id, user.email);
      //create mail body
      const mail = {
        to: createAuthDto.email,
        subject: 'Hello from sendgrid',
        from: 'shubham.w@rejolut.com', // Fill it with your validated email on SendGrid account
        text: 'Hello',
        html: `<h1>Hello,Click on Below link to verify and complete Registration process <a href=http://localhost:3000/verify/${token}>link</a></h1>`,
      };
      //sending mail
      await this.sendgridService.send(mail);
      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('User Already Registered');
        }
      }
      throw error;
    }
  }

  async resendVerificationEmail(resendEmailDto: ResendEmailDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: resendEmailDto.email,
        },
      });
      if (!user) throw new BadRequestException('User not found');
      if (user.isVerified)
        throw new BadRequestException('User already verified');
      let token = await this.createToken(user.id, user.email);
      const mail = {
        to: resendEmailDto.email,
        subject: 'Hello from sendgrid',
        from: 'shubham.w@rejolut.com', // Fill it with your validated email on SendGrid account
        text: 'Hello',
        html: `<h1>Hello,Click on Below link to verify and complete Registration process <a href=http://localhost:3000/verify/${token}>link</a></h1>`,
      };
      //sending mail
      await this.sendgridService.send(mail);
      return {
        message: 'Email Sent successfully',
        status: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(confirmEmailDto: ConfirmEmailDto) {
    try {
      //decode the token
      let data: any = this.jwt.decode(confirmEmailDto.token);
      //Check token Validity
      if (data.exp < Date.now())
        throw new UnauthorizedException('Token expired');
      // find the user by email
      const user = await this.prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });
      //check if user already verified
      if (user.isVerified)
        throw new BadRequestException('Email is already verified');
      const updatedUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isVerified: true,
        },
      });
      return {
        data: { ...updatedUser },
        status: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async signin(dto: CreateAuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user does not exist throw exception
    if (!user) throw new NotFoundException('User not found');

    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);
    // if password incorrect throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    if (!user.isVerified)
      throw new UnauthorizedException(
        'Email is not verified yet Please check your inbox',
      );
    delete user.hash;
    let token = await this.createToken(user.id, user.email);
    return {
      data: { access_token: token, ...user },
      status: 'success',
    };
  }

  async forgotPassword(resendEmailDto: ResendEmailDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: resendEmailDto.email,
        },
      });
      if (!user) throw new BadRequestException('User not found');
      if (user.isVerified)
        throw new BadRequestException('User already verified');
      let token = await this.createToken(user.id, user.email);
      const mail = {
        to: resendEmailDto.email,
        subject: 'Hello from sendgrid',
        from: 'shubham.w@rejolut.com', // Fill it with your validated email on SendGrid account
        text: 'Hello',
        html: `<h1>Hello,Click on Below link to reset your password <a href=http://localhost:3000/set-password/${token}>link</a></h1>`,
      };
      //sending mail
      await this.sendgridService.send(mail);
      return {
        message: 'Email Sent successfully',
        status: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      //decode the token
      let data: any = this.jwt.decode(resetPasswordDto.token);
      //Check token Validity
      if (data.exp < Date.now())
        throw new UnauthorizedException('Token expired');
      // find the user by email
      const user = await this.prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });
      const hash = await argon.hash(resetPasswordDto.password);
      const updatedUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          hash: hash,
        },
      });
      return {
        data: { ...updatedUser },
        status: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async createToken(userId: number, email: string) {
    const secret = this.config.get('JWT_SECRET');
    let payload = { sub: userId, email };
    //create a token
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return token;
  }
}
