import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Obiekt transferu danych (DTO) dla tworzenia nowego projektu.
 * Weryfikuje poprawność danych wejściowych z frontendu (np. w Panelu Admina).
 */
export class CreateJobDto {
  /**
   * Tytuł/Nazwa nowego projektu.
   * @example "Nowa strona internetowa"
   */
  @IsString({ message: 'Nazwa projektu musi być tekstem.' })
  @IsNotEmpty({ message: 'Brakuje nazwy projektu! Proszę podać tytuł.' })
  title!: string;
}