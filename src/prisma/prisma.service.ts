import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { config } from 'process';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://postgres:123@localhost:5432/arihant?schema=public',
        },
      },
    });
  }
}
