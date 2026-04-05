import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateTimesheetDto {
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @IsOptional()
  job?: any; 

  @IsOptional()
  date?: any; 

  @IsOptional()
  hours?: any; 

  @IsOptional()
  taskType?: any;

  @IsOptional()
  billable?: any;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  timesheetData?: any;
}