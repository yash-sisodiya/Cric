import { IsNotEmpty, isNumber, IsOptional } from '@nestjs/class-validator';

export class User {}

export class UserEntities {
  @IsNotEmpty()
  @IsOptional()
  pageNumber: number;

  @IsNotEmpty()
  @IsOptional()
  limit: number;
}

export class IdEntities {
  @IsNotEmpty()
  id: number;
}
