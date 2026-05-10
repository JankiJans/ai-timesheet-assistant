import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';
import { JobsModule } from './jobs/jobs.module';
import { TimesheetsModule } from './timesheets/timesheets.module';

/**
 * Główny moduł aplikacji (Root Module) w architekturze NestJS.
 * Działa jako punkt centralny ("korzeń" drzewa), który rejestruje kontrolery, 
 * serwisy oraz spina ze sobą wszystkie mniejsze moduły domenowe (Feature Modules).
 * * Zaimportowane moduły strukturalne:
 * - `PrismaModule`: Zapewnia globalny dostęp do klienta bazy danych (Prisma ORM).
 * - `AiModule`: Hermetyzuje logikę komunikacji z API Google Gemini.
 * - `JobsModule`: Udostępnia logikę zarządzania projektami (operacje CRUD).
 * - `TimesheetsModule`: Zarządza operacjami związanymi z wpisami czasu pracy.
 */
@Module({
  imports: [
    PrismaModule, 
    AiModule, 
    JobsModule, 
    TimesheetsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}