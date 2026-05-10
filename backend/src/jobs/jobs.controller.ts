import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

/**
 * Kontroler zarządzający żądaniami HTTP dla projektów (Jobs).
 * Obsługuje operacje CRUD pod bazowym adresem `/api/jobs`.
 */
@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * Pobiera listę wszystkich projektów z bazy danych.
   * * Endpoint: GET /api/jobs
   * @returns {Promise<any[]>} Tablica wszystkich projektów (aktywnych i zamkniętych).
   */
  @Get()
  async findAll() {
    return await this.jobsService.findAll();
  }

  /**
   * Dodaje nowy projekt do systemu.
   * * Endpoint: POST /api/jobs
   * @param createJobDto - Zwalidowany obiekt zawierający tytuł projektu.
   * @returns {Promise<any>} Nowo utworzony projekt z przypisanym numerem JOB-XXX.
   */
  @Post()
  async create(@Body() createJobDto: CreateJobDto) {
    return await this.jobsService.create(createJobDto);
  }

  /**
   * Usuwa projekt z systemu na podstawie jego numeru.
   * * Endpoint: DELETE /api/jobs/:jobNumber
   * @param jobNumber - Unikalny numer projektu (np. "JOB-001").
   * @returns {Promise<any>} Obiekt potwierdzający usunięcie.
   */
  @Delete(':jobNumber')
  async remove(@Param('jobNumber') jobNumber: string) {
    return await this.jobsService.remove(jobNumber);
  }

  /**
   * Zmienia status projektu (np. z "active" na "closed").
   * * Endpoint: PATCH /api/jobs/:jobNumber/toggle-status
   * @param jobNumber - Unikalny numer projektu do modyfikacji.
   * @returns {Promise<any>} Zmodyfikowany obiekt projektu.
   */
  @Patch(':jobNumber/toggle-status')
  async toggleStatus(@Param('jobNumber') jobNumber: string) {
    return await this.jobsService.toggleStatus(jobNumber);
  }
}