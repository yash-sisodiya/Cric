import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  Res,
  HttpCode,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { IdEntities, UserEntities } from './entities/user.entity';
import { ConfirmEmailDto } from 'src/auth/dto/create-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwt: JwtService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: UserEntities) {
    return this.userService.findAll(query);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Query() dto: ConfirmEmailDto) {
    return this.userService.getProfile(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch('disable')
  @UseGuards(JwtAuthGuard)
  disable(@Query() query: IdEntities) {
    return this.userService.disable(query.id);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() dto: ChangePasswordDto, @Req() request: Request) {
    const jwtToken = request.headers.authorization.replace('Bearer ', '');
    //decode the token
    let data: any = this.jwt.decode(jwtToken);
    return this.userService.changePassword(dto, +data.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
