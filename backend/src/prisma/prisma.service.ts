import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Ta metoda odpali się automatycznie przy starcie aplikacji
  async onModuleInit() {
    await this.$connect();
  }
}