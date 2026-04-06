import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GeminiResponseDto } from './dto/gemini-response.dto';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly prisma: PrismaService) {
    // Inicjalizujemy Gemini (pamiętaj, żeby mieć GEMINI_API_KEY w .env!)
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  // Przeniesiony z Twojego prompts.ts (zostawiamy w klasie dla wygody)
  private getSystemInstruction(today: string, currentState: any, availableJobs: string): string {
    return `Jesteś asystentem AI do raportowania czasu pracy. 
    DZISIAJ JEST: ${today}.
    
    OBECNY STAN WYPEŁNIENIA DANYCH:
    ${JSON.stringify(currentState)}
    
    WAŻNE ZASADY DOTYCZĄCE PROJEKTÓW (pole job):
    1. Aktualnie dostępne, aktywne projekty w bazie to: [${availableJobs}].
    2. Użytkownik może robić literówki. Domyśl się, o który projekt chodzi i ZAWSZE zwracać w polu "job" DOKŁADNĄ nazwę z naszej listy.
    3. Jeśli projektu nie ma na liście, zwróć w polu "job" to co wpisał użytkownik.
    
    Zadania:
    1. Formatuj daty jako YYYY-MM-DD. Zakaz raportowania w przyszłość.
    2. Zawsze zwracaj odpowiedź w formacie JSON, zawierającym "replyToUser" oraz obiekt "entities".`;
  }

  async processChat(userMessage: string, currentState: any) {
    const today = new Date().toISOString().split('T')[0];

    // Pobieramy aktywne projekty z bazy
    const allJobs = await this.prisma.job.findMany();
    const availableJobNames = allJobs
      .filter((j) => j.status === 'active')
      .map((j) => j.title)
      .join(', ');

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: this.getSystemInstruction(today, currentState, availableJobNames),
      generationConfig: { responseMimeType: 'application/json' },
    });

    // Pętla retry - maksymalnie 3 próby!
    let attempt = 0;
    const maxAttempts = 3;
    let currentPrompt = userMessage;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const result = await model.generateContent(currentPrompt);
        const text = result.response.text();
        
        // 1. Próbujemy sparsować JSON
        const parsedJson = JSON.parse(text);

        // 2. W magiczny sposób konwertujemy zwykły JSON na naszą klasę DTO
        const dtoInstance = plainToInstance(GeminiResponseDto, parsedJson);

        // 3. Odpalamy walidację class-validator
        const errors = await validate(dtoInstance);

        if (errors.length > 0) {
          // AI ZEPSUŁO FORMAT! Łapiemy błędy i każemy mu poprawić.
          const errorMessages = errors.map(e => Object.values(e.constraints || {})).flat().join(', ');
          console.warn(`[Próba ${attempt}] Gemini zwróciło zły format: ${errorMessages}`);
          
          // Zmieniamy prompt na reprymendę dla AI
          currentPrompt = `Twój poprzedni JSON był niepoprawny. Złamałeś te reguły: ${errorMessages}. 
          Oryginalna wiadomość użytkownika to: "${userMessage}". Odpowiedz jeszcze raz, ZACHOWUJĄC POPRAWNY FORMAT JSON.`;
          continue; // Wracamy na początek pętli
        }

        // --- WARSTWA TWOICH REGUŁ BIZNESOWYCH (przeniesiona z index.ts) ---
        if (dtoInstance.entities) { // <-- TypeScript od teraz wie, że entities na 100% istnieje

          if (dtoInstance.entities.job && !dtoInstance.entities.job.startsWith('JOB-')) {
            const extractedJobName = dtoInstance.entities.job;
            const foundJob = allJobs.find(j => j.title.toLowerCase() === extractedJobName.toLowerCase());

            if (foundJob) {
              if (foundJob.status === 'closed') {
                dtoInstance.entities.job = null;
                dtoInstance.replyToUser = `Projekt "${foundJob.title}" jest już ZAMKNIĘTY. Nie możesz dodawać do niego czasu.`;
              } else {
                dtoInstance.entities.job = foundJob.jobNumber;
              }
            } else {
              dtoInstance.replyToUser = `Niestety nie znalazłem projektu o nazwie "${extractedJobName}". Dostępne projekty to: ${availableJobNames}.`;
              dtoInstance.entities.job = null;
            }
          }

          if (dtoInstance.entities.hours !== null && dtoInstance.entities.hours !== undefined && dtoInstance.entities.hours > 8) {
            dtoInstance.entities.hours = null;
            dtoInstance.replyToUser = 'Regulamin zabrania raportowania nadgodzin (więcej niż 8 godzin dziennie). Podaj poprawną wartość.';
          }

        }

        return dtoInstance;

      } catch (error) {
        console.error(`[Próba ${attempt}] Błąd parsowania JSON:`, error);
        currentPrompt = `Zwróciłeś niepoprawny JSON (błąd parsowania). Zwróć tylko czysty format JSON. Użytkownik pytał o: ${userMessage}`;
      }
    }

    // Jeśli pętla wykona się 3 razy i nadal jest błąd:
    throw new InternalServerErrorException('AI ma dzisiaj gorszy dzień i nie potrafi zwrócić poprawnych danych.');
  }
}