import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, SendgridService, JwtStrategy],
})
export class AuthModule {}
