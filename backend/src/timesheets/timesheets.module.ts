import { Module } from '@nestjs/common';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetsService } from './timesheets.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Moduł funkcjonalny (Feature Module) zarządzający czasem pracy.
 * Zamyka w sobie logikę wpisów timesheet i eksponuje odpowiednie endpointy (kontrolery).
 * Wymaga importu `PrismaModule` do połączeń z bazą danych.
 */
@Module({
  imports: [PrismaModule],
  controllers: [TimesheetsController],
  providers: [TimesheetsService]
})
export class TimesheetsModule {}