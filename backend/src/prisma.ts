import { PrismaClient } from '@prisma/client';

// Prisma automatycznie odczyta DATABASE_URL z procesu (z Dockera lub .env)
export const prisma = new PrismaClient();