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

    const payload = data.timesheetData ? data.timesheetData : data;

    const job = payload.job;
    const date = payload.date;
    const hours = payload.hours;
    const taskType = payload.taskType;
    const billable = payload.billable;
    const description = payload.description;

    // 2. Zabezpieczenie przed duplikatami
    const existingEntry = await this.prisma.timesheet.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });

    if (existingEntry) {
      console.log(`[Idempotency] Ignoruję duplikat dla klucza: ${data.idempotencyKey}`);
      return { message: "Timesheet już istnieje (odrzucono duplikat)", status: "duplicate" };
    }

    // 3. Tarcza ochronna
    if (!job) {
      throw new BadRequestException('Nie można dodać wpisu! Brakuje przypisanego projektu.');
    }
    if (!date) {
      throw new BadRequestException('Nie można dodać wpisu! Brakuje daty.');
    }
    if (hours === undefined || hours === null) {
      throw new BadRequestException('Nie można dodać wpisu! Brakuje liczby godzin.');
    }

    // 4. Walidacja projektu w bazie
    const jobRecord = await this.prisma.job.findUnique({
      where: { jobNumber: job },
    });

    if (!jobRecord || jobRecord.status !== 'active') {
      throw new BadRequestException(`Nie można dodać wpisu! Projekt o numerze ${job} jest nieaktywny lub nie istnieje.`);
    }

    // 5. Zapis do bazy
    return await this.prisma.timesheet.create({
      data: {
        idempotencyKey: data.idempotencyKey,
        jobNumber: job,
        date: date,
        hours: Number(hours),
        taskType: taskType || 'Inne',
        billable: billable !== undefined && billable !== null ? Boolean(billable) : true,
        description: description || '',
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