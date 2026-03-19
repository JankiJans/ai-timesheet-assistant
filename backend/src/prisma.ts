import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// Konfigurujemy adapter bezpośrednio dla Twojego lokalnego XAMPPa
const adapter = new PrismaMariaDb({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ai_timesheet',
  port: 3306
});

// Inicjalizujemy klienta Prisma z adapterem
export const prisma = new PrismaClient({ adapter });