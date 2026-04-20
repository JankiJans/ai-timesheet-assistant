import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';

@Injectable()
export class TimesheetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.timesheet.findMany({
      orderBy: { createdAt: 'desc' },
      include: { job: true },
    });
  }

async create(data: CreateTimesheetDto) {
    const existingEntry = await this.prisma.timesheet.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });

    if (existingEntry) {
      console.log(`[Idempotency] Ignoruję duplikat dla klucza: ${data.idempotencyKey}`);
      return { message: "Timesheet już istnieje (odrzucono duplikat)", status: "duplicate" };
    }

    const jobRecord = await this.prisma.job.findUnique({
      where: { jobNumber: data.job },
    });

    if (!jobRecord || jobRecord.status !== 'active') {
      throw new BadRequestException(`Nie można dodać wpisu! Projekt o numerze ${data.job} jest nieaktywny lub nie istnieje.`);
    }

    return await this.prisma.timesheet.create({
      data: {
        idempotencyKey: data.idempotencyKey,
        jobNumber: data.job,
        date: data.date,
        hours: data.hours,
        taskType: data.taskType || 'Inne',
        billable: data.billable !== undefined && data.billable !== null ? Boolean(data.billable) : true,
        description: data.description || '',
      },
    });
  }

  async remove(id: string) {
    await this.prisma.timesheet.delete({
      where: { id: id },
    });
    return { message: 'Wpis usunięty pomyślnie' };
  }
}