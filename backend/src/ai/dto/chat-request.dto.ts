import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class ChatRequestDto {
  @IsString({ message: 'Wiadomość musi być tekstem' })
  @IsNotEmpty({ message: 'Wiadomość jest wymagana!' })
  message!: string;

  @IsOptional()
  @IsObject()
  currentState?: Record<string, any>;
}