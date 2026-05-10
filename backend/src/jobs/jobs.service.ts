import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

/**
 * Serwis obsługujący logikę biznesową dla projektów (Jobs).
 * Obejmuje m.in. auto-generację numeracji (JOB-XXX) i bezpieczne usuwanie.
 */
@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Pobiera wszystkie projekty posortowane rosnąco po numerze projektu.
   * @returns {Promise<any[]>} Lista dostępnych projektów.
   */
  async findAll() {
    return await this.prisma.job.findMany({
      orderBy: { jobNumber: 'asc' },
    });
  }

  /**
   * Tworzy nowy projekt.
   * Logika biznesowa: Automatycznie wyszukuje ostatni numer JOB-XXX,
   * inkrementuje go o 1 i przypisuje do nowego projektu (np. JOB-005 -> JOB-006).
   * * @param createJobDto - Dane wejściowe z kontrolera.
   * @returns {Promise<any>} Rekord nowo utworzonego projektu.
   */
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

  /**
   * Bezpiecznie usuwa projekt.
   * Logika biznesowa: Blokuje usunięcie projektu, jeśli są już do niego
   * przypisane jakiekolwiek wpisy czasu pracy (zapobieganie utracie danych).
   * * @param jobNumber - Unikalny identyfikator projektu (np. "JOB-001").
   * @throws {BadRequestException} Gdy projekt ma powiązane timesheety.
   * @returns {Promise<any>} Wiadomość o sukcesie.
   */
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

  /**
   * Przełącza status projektu między 'active' (aktywny) a 'closed' (zamknięty).
   * Zamknięty projekt nie przyjmuje nowych wpisów od AI.
   * * @param jobNumber - Unikalny identyfikator projektu.
   * @throws {NotFoundException} Gdy projekt o podanym numerze nie istnieje.
   * @returns {Promise<any>} Zaktualizowany rekord projektu.
   */
  async toggleStatus(jobNumber: string) {
    const job = await this.prisma.job.findUnique({
      where: { jobNumber },
    });

    if (!job) {
      throw new NotFoundException(`Projekt ${jobNumber} nie istnieje`);
    }

    const newStatus = job.status === 'active' ? 'closed' : 'active';

    return await this.prisma.job.update({
      where: { jobNumber },
      data: { status: newStatus },
    });
  }
}