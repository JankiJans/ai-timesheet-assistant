import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';

/**
 * Interceptor (Przechwytywacz) działający jak pierwsza linia obrony przed odpytaniem AI.
 * Przechwytuje żądanie HTTP, sprawdza czy użytkownik wpisał specjalną komendę (np. "pomoc")
 * i jeśli tak - natychmiast zwraca gotową odpowiedź, omijając kosztowne zapytanie do Google Gemini.
 */
@Injectable()
export class KeywordsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const message: string = request.body?.message?.toLowerCase().trim() || '';

    // Hardcoded response dla prośby o pomoc
    if (message === 'pomoc' || message === 'help') {
      return of({
        replyToUser: 'Jestem asystentem AI. Podaj mi projekt i czas pracy, a ja dodam to do systemu. Np. "Pracowałem 8 godzin nad aplikacją mobilną".',
        entities: null,
      });
    }

    // Hardcoded response dla czyszczenia pamięci
    if (message === 'anuluj' || message === 'wyczyść' || message === 'reset') {
      return of({
        replyToUser: 'Gotowe. Wyczyszczono obecny formularz. Od czego zaczynamy?',
        entities: { job: null, hours: null }, 
      });
    }

    // Jeśli to nie jest komenda specjalna, przekaż żądanie dalej do kontrolera (do AiService)
    return next.handle();
  }
}