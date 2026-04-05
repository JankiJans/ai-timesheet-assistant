import { IsString, IsOptional, IsNumber, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class AiEntitiesDto {
  @IsOptional()
  @IsString()
  job?: string | null;

  @IsOptional()
  @IsNumber()
  hours?: number | null;
}

export class GeminiResponseDto {
  @IsString()
  @IsDefined()
  replyToUser!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AiEntitiesDto)
  entities?: AiEntitiesDto;
}