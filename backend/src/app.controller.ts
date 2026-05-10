import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Główny kontroler aplikacji (Root Controller).
 * Służy do obsługi podstawowych żądań na głównym adresie URL API.
 * W profesjonalnych projektach pełni zazwyczaj rolę prostego punktu sprawdzającego 
 * status serwera (tzw. Health Check).
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Obsługuje zapytanie typu GET na bazowy adres serwera ('/').
   * Weryfikuje, czy aplikacja została poprawnie podniesiona i odpowiada na żądania.
   * * @returns {string} Zwraca prostą wiadomość tekstową świadczącą o działaniu serwera.
   * * @example
   * // Wywołanie w przeglądarce lub przez cURL:
   * // GET http://localhost:5000/
   * // Odpowiedź: "Hello World!"
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}