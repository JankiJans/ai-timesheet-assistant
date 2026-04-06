import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';
import { JobsModule } from './jobs/jobs.module';
import { TimesheetsModule } from './timesheets/timesheets.module';

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