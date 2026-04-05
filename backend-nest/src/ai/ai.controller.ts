import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@Controller('api/chat') // Zastępuje app.post('/api/chat', ...)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  async handleChat(@Body() chatRequest: ChatRequestDto) {
    // 1. Odbieramy dane (już zwalidowane przez ChatRequestDto!)
    const { message, currentState } = chatRequest;

    // 2. Przekazujemy do naszego serwisu, gdzie dzieje się cała "magia" AI
    const result = await this.aiService.processChat(message, currentState || {});

    // 3. Zwracamy gotowy JSON do frontendu
    return result;
  }
}