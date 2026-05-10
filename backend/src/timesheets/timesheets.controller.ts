import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';

/**
 * Kontroler zarządzający żądaniami HTTP dotyczącymi wpisów czasu pracy.
 * Udostępnia endpointy pod bazowym adresem `/api/timesheet`.
 */
@Controller('api/timesheet')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  /**
   * Pobiera pełną historię wpisów czasu pracy z bazy danych.
   * * Endpoint: GET /api/timesheet
   * @returns {Promise<any[]>} Tablica wpisów timesheet wraz ze szczegółami projektów.
   */
  @Get()
  async findAll() {
    return await this.timesheetsService.findAll();
  }

  /**
   * Tworzy nowy wpis czasu pracy na podstawie zweryfikowanych danych.
   * * Endpoint: POST /api/timesheet
   * @param createTimesheetDto - Obiekt z danymi wpisu (zwalidowany automatycznie).
   * @returns {Promise<any>} Utworzony obiekt wpisu lub informacja o zignorowaniu duplikatu.
   */
  @Post() 
  async create(@Body() createTimesheetDto: CreateTimesheetDto) {
    return await this.timesheetsService.create(createTimesheetDto);
  }

  /**
   * Usuwa konkretny wpis czasu pracy z bazy danych.
   * * Endpoint: DELETE /api/timesheet/:id
   * @param id - Unikalny identyfikator wpisu do usunięcia.
   * @returns {Promise<any>} Obiekt potwierdzający usunięcie rekordu.
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.timesheetsService.remove(id);
  }
}