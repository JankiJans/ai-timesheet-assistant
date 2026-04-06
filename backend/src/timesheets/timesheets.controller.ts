import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';

@Controller('api/timesheet')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Get('list')
  async findAll() {
    return await this.timesheetsService.findAll();
  }

  @Post('create')
  async create(@Body() createTimesheetDto: CreateTimesheetDto) {
    return await this.timesheetsService.create(createTimesheetDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.timesheetsService.remove(id);
  }
}