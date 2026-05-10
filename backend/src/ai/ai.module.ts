import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PrismaModule } from 'src/prisma/prisma.module';

/**
 * Moduł funkcjonalny odpowiedzialny za sztuczną inteligencję.
 * Posiada dostęp do PrismaModule w celu pobierania aktualnej listy projektów dla asystenta.
 */
@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService]
})
export class AiModule {}