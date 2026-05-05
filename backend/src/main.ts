import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- 1. Import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // <-- 2. Włączamy globalną walidację
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatycznie usuwa z JSON-a pola, których nie ma w DTO (bezpieczeństwo!)
    transform: true, // Automatycznie konwertuje typy (np. string '5' na liczbę 5)
  }));

  // Pamiętasz o CORS z Twojego starego kodu? Tu też go włączamy:
  app.enableCors({ origin: 'http://localhost:5173' });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();