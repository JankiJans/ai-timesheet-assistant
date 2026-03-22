import { type Request, type Response, Router } from 'express';
import { prisma } from '../prisma.js'; // Importujemy bazę

export const timesheetRouter = Router();

timesheetRouter.get('/list', async (req: Request, res: Response): Promise<any> => {
  try {
    // Pobieramy wpisy z bazy, sortując od najnowszego. 
    // include: { job: true } sprawia, że Prisma od razu dociągnie nam nazwę projektu z tabeli Job!
    const timesheets = await prisma.timesheet.findMany({
      orderBy: { createdAt: 'desc' },
      include: { job: true } 
    });

    return res.status(200).json(timesheets);
  } catch (error) {
    console.error("❌ Błąd pobierania wpisów:", error);
    return res.status(500).json({ error: "Wystąpił błąd podczas pobierania historii" });
  }
});

timesheetRouter.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;

  if (!id) {
    return res.status(400).json({ error: "Nieprawidłowe ID wpisu" });
  }

  try {
    await prisma.timesheet.delete({
      where: { 
        id: id
      }
    });

    console.log(`🗑️ Usunięto wpis czasu pracy o ID: ${id}`);
    return res.status(200).json({ message: "Wpis usunięty pomyślnie" });

  } catch (error) {
    console.error("❌ Błąd usuwania wpisu:", error);
    return res.status(500).json({ error: "Błąd serwera podczas usuwania wpisu" });
  }
});

// Dodajemy "async", bo operacje na bazie wymagają czekania (await)
timesheetRouter.post('/create', async (req: Request, res: Response): Promise<any> => {
  const { timesheetData, idempotencyKey } = req.body;

  if (!idempotencyKey) {
    return res.status(400).json({ error: "Idempotency key jest wymagany!" });
  }

  try {
    // --- LOGIKA IDEMPOTENCJI (Szukamy klucza w MySQL) ---
    const existingEntry = await prisma.timesheet.findUnique({
      where: { idempotencyKey: idempotencyKey }
    });

    if (existingEntry) {
      console.log(`[Idempotency] Ignoruję duplikat dla klucza: ${idempotencyKey}`);
      return res.status(200).json({ 
        message: "Timesheet już istnieje (odrzucono duplikat)", 
        status: "duplicate" 
      });
    }

    // --- ZAPIS DO BAZY MYSQL ---
    const newEntry = await prisma.timesheet.create({
      data: {
        idempotencyKey: idempotencyKey,
        jobNumber: timesheetData.job,
        date: timesheetData.date,
        hours: timesheetData.hours,
        taskType: timesheetData.taskType,
        billable: timesheetData.billable,
        description: timesheetData.description
      }
    });

    console.log("✅ Nowy wpis w MySQL:", newEntry);

    return res.status(201).json({ 
      message: "Timesheet zapisany pomyślnie", 
      status: "created", 
      data: newEntry 
    });

  } catch (error) {
    console.error("❌ Błąd zapisu do bazy:", error);
    return res.status(500).json({ error: "Wystąpił błąd podczas zapisu" });
  }
});