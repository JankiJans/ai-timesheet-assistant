import { IsOptional, IsString, IsNotEmpty, IsNumber, IsDateString, Min, Max, IsUUID } from 'class-validator';

export class CreateTimesheetDto {
  @IsUUID('4', { message: 'Klucz idempotencji musi być poprawnym UUID.' })
  @IsNotEmpty()
  idempotencyKey!: string;

  @IsString({ message: 'Projekt musi być tekstem.' })
  @IsNotEmpty({ message: 'Brakuje przypisanego projektu.' })
  job!: string; 

  @IsDateString({}, { message: 'Data musi być w poprawnym formacie YYYY-MM-DD.' })
  @IsNotEmpty({ message: 'Brakuje daty.' })
  date!: string; 

  @IsNumber({}, { message: 'Godziny muszą być liczbą.' })
  @Min(0.1, { message: 'Czas pracy musi być większy niż 0.' })
  @Max(24, { message: 'Czas pracy nie może przekroczyć 24 godzin w ciągu doby.' })
  @IsNotEmpty({ message: 'Brakuje liczby godzin.' })
  hours!: number; 

  @IsOptional()
  taskType?: any;

  @IsOptional()
  billable?: any;

  @IsString()
  @IsOptional()
  description?: string;
}