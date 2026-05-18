import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


/**
 * Główna funkcja inicjalizująca i uruchamiająca serwer backendowy w frameworku NestJS.
 * Odpowiada za:
 * - Utworzenie instancji aplikacji na podstawie głównego modułu (AppModule).
 * - Konfigurację polityki CORS (Cross-Origin Resource Sharing) dla komunikacji z frontendem.
 * - Włączenie globalnych potoków walidacji (ValidationPipe) chroniących endpointy API.
 * - Uruchomienie nasłuchiwania serwera na wybranym porcie.
 * * @returns Zwraca pustą obietnicę (Promise<void>), która rozwiązuje się, gdy serwer pomyślnie wystartuje.
 * * @example
 * // Funkcja jest wywoływana automatycznie pod spodem podczas startu aplikacji.
 * // Aby uruchomić serwer lokalnie wpisz w terminalu:
 * // npm run start:dev
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // --- 1. KONFIGURACJA CORS ---
  app.enableCors({
    origin: frontendUrl, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // --- 2. GLOBALNA WALIDACJA (Tarcza ochronna API) ---
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatycznie usuwa z JSON-a pola, których nie ma w DTO (bezpieczeństwo!)
    transform: true, // Automatycznie konwertuje typy (np. string '5' na liczbę 5)
  }));

  // --- 3. START SERWERA ---
  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  
  console.log(`🚀 Serwer backendowy NestJS działa na porcie: ${port}`);
  console.log(`🌍 Akceptuję żądania CORS z adresu: ${frontendUrl}`);
}

bootstrap();