import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAuthDto,
  ConfirmEmailDto,
  ResendEmailDto,
  ResetPasswordDto,
} from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }

  @Post('resend')
  resendVerificationEmail(@Body() resendEmailDto: ResendEmailDto) {
    return this.authService.resendVerificationEmail(resendEmailDto);
  }

  @Post('verifyEmail')
  verifyEmail(@Body() ConfirmEmailDto: ConfirmEmailDto) {
    return this.authService.verifyEmail(ConfirmEmailDto);
  }

  @Post('signin')
  signin(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signin(createAuthDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() resendEmailDto: ResendEmailDto) {
    return this.authService.forgotPassword(resendEmailDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
