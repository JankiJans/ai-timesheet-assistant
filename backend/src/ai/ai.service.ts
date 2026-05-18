import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service'; 
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GeminiResponseDto } from './dto/gemini-response.dto';
import { OpenAI } from 'openai';
/**
 * Główny serwis odpowiedzialny za komunikację z modelem językowym Google Gemini.
 * Obejmuje skomplikowaną logikę inżynierii promptów (Prompt Engineering),
 * walidację zwracanego JSON-a, pętlę powtórek (retry loop) w przypadku halucynacji AI
 * oraz twarde reguły biznesowe nakładane na odpowiedź asystenta.
 */
@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private genGpt: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.genGpt = new OpenAI({apiKey: process.env.OPENAI_API_KEY || ''});
  }

  /**
   * Główna funkcja orkiestrująca cały proces rozmowy z AI.
   * Pobiera kontekst bazy danych, rozmawia z Gemini i nakłada reguły biznesowe.
   * * @param userMessage - Tekst wpisany przez użytkownika.
   * @param currentState - Pamięć czatu przekazana z frontendu.
   * @returns {Promise<GeminiResponseDto>} W pełni sformatowana i poprawna odpowiedź do klienta.
   */
  async processChat(userMessage: string, currentState: any, currentBot: string): Promise<GeminiResponseDto> {
    const { allJobs, availableJobNames } = await this.fetchJobData();

    let dtoInstance: GeminiResponseDto

    if (currentBot === 'chatgpt') {
      dtoInstance = await this.getValidatedGptResponse(userMessage, currentState, availableJobNames);
    } else {
      dtoInstance = await this.getValidatedAiResponse(userMessage, currentState, availableJobNames);
    }

    this.applyBusinessRules(dtoInstance, allJobs, availableJobNames);

    if (dtoInstance.entities) {
      dtoInstance.entities.currentBot = currentBot; 
    }
    return dtoInstance;
  }

  /**
   * Prywatna metoda pobierająca aktualną listę projektów z bazy danych.
   * Stanowi dynamiczny kontekst wstrzykiwany do Promptu dla AI.
   */
  private async fetchJobData() {
    const allJobs = await this.prisma.job.findMany();
    const availableJobNames = allJobs
      .filter((j) => j.status === 'active')
      .map((j) => j.title)
      .join(', ');
      
    return { allJobs, availableJobNames };
  }

  /**
   * Funkcja komunikująca się z API Google Gemini.
   * Zawiera system powtórek (Retry) - jeśli AI zwróci niepoprawny JSON lub złamie strukturę DTO,
   * wysyła żądanie o autokorektę do maksymalnie 3 razy.
   */
  private async getValidatedAiResponse(userMessage: string, currentState: any, availableJobNames: string): Promise<GeminiResponseDto> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    let currentMessage = userMessage;

    const todayDate = new Date().toISOString().split('T')[0];

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const prompt = `
          Jesteś asystentem AI ds. czasu pracy. Twoim zadaniem jest parsowanie wiadomości i uzupełnianie JSONa.
          Aktualny stan formularza: ${JSON.stringify(currentState)}
          Dostępne AKTYWNE projekty w bazie to: [${availableJobNames}].
          Dzisiejsza data to: ${todayDate}.
          
          ZASADY:
          1. Zwróć obiekt JSON pasujący DOKŁADNIE do tego schematu (zawsze zwracaj wszystkie pola w entities!): 
          { 
            "replyToUser": "tekst", 
            "entities": { 
              "job": "nazwa lub null", 
              "hours": liczba_lub_null, 
              "date": "YYYY-MM-DD", 
              "description": "tekst lub null",
            } 
          }
          2. Jeśli użytkownik podaje projekt, MUSI on pasować do jednego z dostępnych.
          3. Pamiętaj obecny stan! Jeśli w aktualnym stanie formularza są już jakieś dane (np. projekt), PRZEPISZ JE do nowej odpowiedzi, chyba że użytkownik wyraźnie prosi o ich zmianę.
          4. POLE DATE JEST OBOWIĄZKOWE. Jeśli użytkownik nie wspomniał o dacie, ZAWSZE wstawiaj dzisiejszą ("${todayDate}"). Jeśli powie "wczoraj", oblicz wczorajszą datę.
          
          Wiadomość użytkownika: "${currentMessage}"
        `;

        const result = await model.generateContent(prompt);
        let textResponse = result.response.text();
        
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsedJson = JSON.parse(textResponse);
        const dtoInstance = plainToInstance(GeminiResponseDto, parsedJson);
        const errors = await validate(dtoInstance);

        if (errors.length > 0) {
          console.warn(`[Próba ${attempt}] Błąd walidacji DTO:`, errors);
          currentMessage = `Zwróciłeś niepoprawny JSON niezgodny z wymaganym DTO. Błędy: ${JSON.stringify(errors)}. Popraw to i zwróć poprawny JSON. Wiadomość początkowa: ${userMessage}`;
          continue; 
        }

        return dtoInstance; 
      } catch (error) {
        console.warn(`[Próba ${attempt}] Błąd parsowania JSON:`, error);
        currentMessage = `Zwróciłeś niepoprawny JSON (błąd parsowania). Zwróć tylko czysty format JSON. Użytkownik pytał o: ${userMessage}`;
      }
    }

    throw new InternalServerErrorException('AI ma dzisiaj gorszy dzień i nie potrafi zwrócić poprawnych danych.');
  }

private async getValidatedGptResponse(userMessage: string, currentState: any, availableJobNames: string): Promise<GeminiResponseDto> {
    let currentMessage = userMessage;
    const todayDate = new Date().toISOString().split('T')[0];
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await this.genGpt.chat.completions.create({
          model: 'gpt-3.5-turbo',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `
              Jesteś asystentem AI ds. czasu pracy. Twoim zadaniem jest parsowanie wiadomości i uzupełnianie JSONa.
              Aktualny stan formularza: ${JSON.stringify(currentState)}
              Dostępne AKTYWNE projekty w bazie to: [${availableJobNames}].
              Dzisiejsza data to: ${todayDate}.
              
              ZASADY:
              1. Zwróć obiekt JSON pasujący DOKŁADNIE do tego schematu (zawsze zwracaj wszystkie pola w entities!): 
              { 
                "replyToUser": "tekst", 
                "entities": { 
                  "job": "nazwa lub null", 
                  "hours": liczba_lub_null, 
                  "date": "YYYY-MM-DD", 
                  "description": "tekst lub null",
                } 
              }
              2. Jeśli użytkownik podaje projekt, MUSI on pasować do jednego z dostępnych.
              3. Pamiętaj obecny stan! Jeśli w aktualnym stanie formularza są już jakieś dane (np. projekt), PRZEPISZ JE do nowej odpowiedzi, chyba że użytkownik wyraźnie prosi o ich zmianę.
              4. POLE DATE JEST OBOWIĄZKOWE. Jeśli użytkownik nie wspomniał o dacie, ZAWSZE wstawiaj dzisiejszą ("${todayDate}"). Jeśli powie "wczoraj", oblicz wczorajszą datę.
              
              Wiadomość użytkownika: "${currentMessage}"`
            },
            {
              role: 'user',
              content: `Wiadomość użytkownika: "${currentMessage}"`
            }
          ],
        });

        const textResponse = response.choices[0].message.content;
        if (!textResponse) throw new Error('OpenAI zwróciło pustą odpowiedź');

        const parsedJson = JSON.parse(textResponse);
        const dtoInstance = plainToInstance(GeminiResponseDto, parsedJson);
        const errors = await validate(dtoInstance);

        if (errors.length > 0) {
          console.warn(`[ChatGPT Próba ${attempt}] Błąd walidacji DTO:`, errors);
          currentMessage = `Zwróciłeś JSON niezgodny z DTO. Błędy: ${JSON.stringify(errors)}. Popraw to.`;
          continue;
        }
        return dtoInstance;

      } catch (error) {
        console.warn(`[ChatGPT Próba ${attempt}] Błąd parsowania JSON:`, error);
        currentMessage = `Zwróciłeś niepoprawny JSON. Zwróć tylko czysty format JSON. Użytkownik pytał o: ${userMessage}`;
      }
    }

    throw new InternalServerErrorException('ChatGPT nie działa.');
}

  /**
   * Prywatna metoda chroniąca system przed halucynacjami AI.
   * Weryfikuje i nadpisuje "wymysły" sztucznej inteligencji twardą logiką biznesową 
   * (np. zamienia nazwę projektu na jego JobNumber lub blokuje dodanie czasu do zamkniętego projektu).
   */
  private applyBusinessRules(dtoInstance: GeminiResponseDto, allJobs: any[], availableJobNames: string) {
    if (!dtoInstance.entities) return;

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

    if (dtoInstance.entities.hours !== null && dtoInstance.entities.hours !== undefined && dtoInstance.entities.hours > 24) {
      dtoInstance.entities.hours = 24;
      dtoInstance.replyToUser += " Uwaga: Maksymalny czas pracy w ciągu jednego dnia to 24 godziny. Zmniejszyłem wartość do 24.";
    }
  }
}