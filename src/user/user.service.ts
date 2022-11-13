import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ConfirmEmailDto } from 'src/auth/dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { UserEntities } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  async findAll(query: UserEntities) {
    try {
      let limit = query.limit ? Number(query.limit) : 10;
      let page = query.pageNumber ? Number(query.pageNumber) : 1;
      let skip = Number((page - 1) * limit);
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          country: true,
          disable: true,
          phoneNumber: true,
          phoneCode: true,
          userRole: true,
        },
        skip: skip,
        take: limit,
      });
      const totalCount = await this.prisma.user.count();
      return {
        result: {
          rows: users,
          totalCount: totalCount,
        },
        status: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      let user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      delete user.hash;
      return {
        result: user,
        status: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      let user = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          country: updateUserDto.country,
          phoneNumber: updateUserDto.phoneNumber,
          phoneCode: updateUserDto.phoneCode,
        },
      });
      delete user.hash;
      return {
        result: user,
        status: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async disable(id: number) {
    try {
      let user = await this.prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          disable: true,
        },
      });
      delete user.hash;
      return {
        result: user,
        status: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      let user = await this.prisma.user.delete({
        where: {
          id: Number(id),
        },
      });
      return {
        message: 'User deleted successfully',
        status: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async getProfile(dto: ConfirmEmailDto) {
    try {
      //decode the token
      let data: any = this.jwt.decode(dto.token);
      console.log(
        '🚀 ~ file: user.service.ts ~ line 127 ~ UserService ~ getProfile ~ data',
        data,
        Date.now(),
      );
      //Check token Validity
      if (data.exp < Date.now())
        throw new UnauthorizedException('Token expired');
      // find the user by email
      const user = await this.prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(dto: ChangePasswordDto, id: number) {
    try {
      let user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      // if user does not exist throw exception
      if (!user) throw new NotFoundException('User not found');

      // compare password
      const pwMatches = await argon.verify(user.hash, dto.password);
      // if password incorrect throw exception
      if (!pwMatches) throw new ForbiddenException('Incorrect Old Password');
      // generate the password hash
      const newHash = await argon.hash(dto.newPassword);
      let updatedUser = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          hash: newHash,
        },
      });
      return {
        message: 'Password Changed successfully',
        status: 'success',
      };
    } catch (error) {
      throw error;
    }
  }
}
