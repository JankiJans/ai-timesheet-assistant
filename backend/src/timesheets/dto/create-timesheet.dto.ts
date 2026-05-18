import { IsOptional, IsString, IsNotEmpty, IsNumber, IsDateString, Min, Max, IsUUID } from 'class-validator';

/**
 * Obiekt transferu danych (DTO) dla tworzenia nowego wpisu czasu pracy.
 * Definiuje strukturę i zasady walidacji dla żądań przychodzących od klienta.
 * Automatycznie sprawdzany przez globalny ValidationPipe.
 */
export class CreateTimesheetDto {
  /**
   * Unikalny klucz zapobiegający podwójnemu dodaniu tego samego wpisu (np. przy błędzie sieci).
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsUUID('4', { message: 'Klucz idempotencji musi być poprawnym UUID.' })
  @IsNotEmpty()
  idempotencyKey!: string;

  /**
   * Unikalny numer przypisanego projektu.
   * @example "JOB-001"
   */
  @IsString({ message: 'Projekt musi być tekstem.' })
  @IsNotEmpty({ message: 'Brakuje przypisanego projektu.' })
  job!: string; 

  /**
   * Data wykonania pracy.
   * @example "2026-05-10"
   */
  @IsDateString({}, { message: 'Data musi być w poprawnym formacie YYYY-MM-DD.' })
  @IsNotEmpty({ message: 'Brakuje daty.' })
  date!: string; 

  /**
   * Liczba przepracowanych godzin (z dokładnością do ułamków, np. 1.5).
   * @example 4.5
   */
  @IsNumber({}, { message: 'Godziny muszą być liczbą.' })
  @Min(0.1, { message: 'Czas pracy musi być większy niż 0.' })
  @Max(24, { message: 'Czas pracy nie może przekroczyć 24 godzin w ciągu doby.' })
  @IsNotEmpty({ message: 'Brakuje liczby godzin.' })
  hours!: number; 

  /**
   * Kategoria wykonywanego zadania (opcjonalnie).
   * @example "Development"
   */
  @IsOptional()
  taskType?: any;

  /**
   * Flaga określająca, czy czas podlega fakturowaniu (opcjonalnie).
   * @example true
   */
  @IsOptional()
  billable?: any;

  /**
   * Krótki opis tego, co zostało zrobione (opcjonalnie).
   * @example "Naprawa błędu z logowaniem użytkownika."
   */
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  currentBot!: string;
}