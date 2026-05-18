import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { KeywordsInterceptor } from './keywords/keywords.interceptor';

/**
 * Kontroler obsługujący zapytania tekstowe do asystenta AI.
 * Zabezpieczony interceptorem weryfikującym proste komendy systemowe.
 */
@Controller('api/chat')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Wysyła wiadomość do Google Gemini w celu wyciągnięcia danych (Timesheet Entities).
   * * Endpoint: POST /api/chat
   * @param chatRequest - Zwalidowany obiekt zawierający wiadomość i historię konwersacji.
   * @returns {Promise<GeminiResponseDto>} Odpowiedź zawierająca tekst od asystenta i wyciągnięte zmienne.
   */
  @Post()
  @UseInterceptors(KeywordsInterceptor)
  async handleChat(@Body() chatRequest: ChatRequestDto) {
    const { message, currentState, currentBot } = chatRequest;
    return await this.aiService.processChat(message, currentState, currentBot || 'gemini');
  }
}