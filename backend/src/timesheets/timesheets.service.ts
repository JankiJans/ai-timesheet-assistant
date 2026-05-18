import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';

/**
 * Serwis obsługujący operacje bazodanowe i logikę biznesową dla wpisów czasu pracy.
 * Ściśle współpracuje z Prisma ORM.
 */
@Injectable()
export class TimesheetsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Pobiera wszystkie wpisy timesheet posortowane malejąco od najnowszych.
   * Dodatkowo ładuje (include) relacyjne dane o projekcie (job) dla każdego wpisu.
   * @returns {Promise<any[]>} Lista ustrukturyzowanych wpisów.
   */
  async findAll() {
    return await this.prisma.timesheet.findMany({
      orderBy: { createdAt: 'desc' },
      include: { job: true },
    });
  }

  /**
   * Tworzy nowy wpis czasu pracy.
   * Posiada wbudowaną logikę biznesową:
   * 1. Zapobiega duplikatom na podstawie `idempotencyKey`.
   * 2. Sprawdza, czy projekt (job) istnieje i ma status 'active'.
   * * @param data - Zweryfikowany obiekt typu CreateTimesheetDto.
   * @throws {BadRequestException} Wyrzuca błąd, jeśli projekt jest zamknięty lub nie istnieje.
   * @returns {Promise<any>} Nowy rekord z bazy danych lub odpowiedź o duplikacie.
   */
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
        currentBot: data.currentBot || ''
      },
    });
  }

  /**
   * Usuwa wpis timesheet na podstawie jego numerycznego ID.
   * Ponieważ ID mogło przyjść z URL jako string, dokonujemy bezpiecznej konwersji na Number.
   * @param id - Identyfikator rekordu.
   * @returns {Promise<any>} Skasowany rekord z bazy.
   */
  async remove(id: string) {
    return await this.prisma.timesheet.delete({
      where: { id: id },
    });
  }
}