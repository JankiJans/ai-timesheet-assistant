import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.job.findMany({
      orderBy: { jobNumber: 'asc' },
    });
  }

  async create(createJobDto: CreateJobDto) {
    const lastJob = await this.prisma.job.findFirst({
      orderBy: { jobNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastJob && lastJob.jobNumber.startsWith('JOB-')) {
      const lastNumberStr = lastJob.jobNumber.split('-')[1];
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    const newJobNumber = `JOB-${nextNumber.toString().padStart(3, '0')}`;

    return await this.prisma.job.create({
      data: {
        jobNumber: newJobNumber,
        title: createJobDto.title,
        status: 'active',
      },
    });
  }

  async remove(jobNumber: string) {
    const timesheetsCount = await this.prisma.timesheet.count({
      where: { jobNumber: jobNumber },
    });

    if (timesheetsCount > 0) {
      throw new BadRequestException(`Nie można usunąć projektu! Ma on już ${timesheetsCount} przypisanych wpisów czasu pracy.`);
    }

    await this.prisma.job.delete({
      where: { jobNumber: jobNumber },
    });

    return { message: 'Projekt usunięty pomyślnie' };
  }

  async toggleStatus(jobNumber: string) {
    const job = await this.prisma.job.findUnique({
      where: { jobNumber: jobNumber },
    });

    if (!job) {
      throw new NotFoundException('Nie znaleziono projektu');
    }

    const newStatus = job.status === 'active' ? 'inactive' : 'active';

    return await this.prisma.job.update({
      where: { jobNumber: jobNumber },
      data: { status: newStatus },
    });
  }
}