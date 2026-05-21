import { IsString, IsOptional, IsNumber, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Zagnieżdżony obiekt reprezentujący dane biznesowe wyciągnięte przez AI z tekstu.
 */
export class AiEntitiesDto {
  @IsOptional()
  @IsString()
  job?: string | null;

  @IsOptional()
  @IsNumber()
  hours?: number | null;

  @IsOptional()
  @IsString()
  date?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  currentBot?: string
}

/**
 * Obiekt DTO definiujący ścisłą strukturę JSON, jakiej oczekujemy od modelu Google Gemini.
 * Służy do weryfikacji, czy AI nie "zbuntowało się" i nie zwróciło niepoprawnych danych.
 */
export class GeminiResponseDto {
  /**
   * Naturalna, tekstowa odpowiedź asystenta dla użytkownika.
   * @example "Jasne, zapisałem 5 godzin w projekcie Hokej. Coś jeszcze?"
   */
  @IsString()
  @IsDefined()
  replyToUser!: string;

  /**
   * Obiekt zawierający wyekstrahowane dane gotowe do wstawienia do bazy.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => AiEntitiesDto)
  entities?: AiEntitiesDto;
}