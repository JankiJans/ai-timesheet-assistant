import { type Request, type Response, Router } from 'express';
import { prisma } from '../prisma.js'; // Importujemy bazę

export const timesheetRouter = Router();

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