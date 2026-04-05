import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('list')
  async findAll() {
    return await this.jobsService.findAll();
  }

  @Post('create')
  async create(@Body() createJobDto: CreateJobDto) {
    return await this.jobsService.create(createJobDto);
  }

  @Delete(':delete/:jobNumber')
  async remove(@Param('jobNumber') jobNumber: string) {
    return await this.jobsService.remove(jobNumber);
  }

  @Patch('toggle-status/:jobNumber')
  async toggleStatus(@Param('jobNumber') jobNumber: string) {
    return await this.jobsService.toggleStatus(jobNumber);
  }
}