import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Moduł funkcjonalny (Feature Module) odpowiedzialny za projekty (Jobs).
 * Spina ze sobą kontroler oraz serwis logiki biznesowej.
 */
@Module({
  imports: [PrismaModule],
  controllers: [JobsController],
  providers: [JobsService]
})
export class JobsModule {}