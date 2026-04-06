import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { KeywordsInterceptor } from './keywords/keywords.interceptor';

@Controller('api/chat')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  @UseInterceptors(KeywordsInterceptor)
  async handleChat(@Body() chatRequest: ChatRequestDto) {
    const { message, currentState } = chatRequest;
    return await this.aiService.processChat(message, currentState || {});
  }
}