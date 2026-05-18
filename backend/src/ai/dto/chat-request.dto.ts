import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

/**
 * Obiekt transferu danych (DTO) dla wiadomości wysyłanej do AI.
 * Definiuje, jakiego formatu żądania backend oczekuje od frontendu (widżetu czatu).
 */
export class ChatRequestDto {
  /**
   * Treść wiadomości od użytkownika.
   * @example "Dodaj 5 godzin do projektu hokej"
   */
  @IsString({ message: 'Wiadomość musi być tekstem' })
  @IsNotEmpty({ message: 'Wiadomość jest wymagana!' })
  message!: string;

  /**
   * Aktualny stan formularza po stronie frontendu (pamięć czatu).
   * @example { job: "JOB-001", hours: null, date: "2026-05-10" }
   */
  @IsOptional()
  @IsObject()
  currentState?: Record<string, any>;

  @IsString()
  @IsOptional()
  currentBot?: string;
}