import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ConfirmEmailDto {
  @IsNotEmpty()
  token: string;
}

export class ResendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  token: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
