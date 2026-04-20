import { IsString, IsNotEmpty } from 'class-validator';

export class CreateJobDto {
  @IsString({ message: 'Nazwa projektu musi być tekstem.' })
  @IsNotEmpty({ message: 'Brakuje nazwy projektu! Proszę podać tytuł.' })
  title!: string;
}