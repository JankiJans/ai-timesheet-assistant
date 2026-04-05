import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class KeywordsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 1. Wyciągamy wiadomość od użytkownika
    const request = context.switchToHttp().getRequest();
    const message: string = request.body?.message?.toLowerCase().trim() || '';

    // 2. WARSTWA SŁÓW KLUCZOWYCH (Hardcoded responses)
    if (message === 'pomoc' || message === 'help') {
      // Zwracamy odpowiedź NATYCHMIAST, omijając AI
      return of({
        replyToUser: 'Jestem asystentem AI. Podaj mi projekt i czas pracy, a ja dodam to do systemu. Np. "Pracowałem 8 godzin nad aplikacją mobilną".',
        entities: null,
      });
    }

    if (message === 'anuluj' || message === 'wyczyść' || message === 'reset') {
      return of({
        replyToUser: 'Gotowe. Wyczyszczono obecny formularz. Od czego zaczynamy?',
        entities: { job: null, hours: null }, // Frontend nadpisze stan na puste wartości
      });
    }

    // 3. Jeśli użytkownik wpisał normalne zdanie, puszczamy go dalej do AiController i serwisu Gemini
    return next.handle();
  }
}