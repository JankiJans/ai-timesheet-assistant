// backend/src/routes/timesheet.ts
import { type Request, type Response, Router } from 'express';
import { TIMESHEETS, PROCESSED_KEYS } from '../data/mockTimesheets.js';

export const timesheetRouter = Router();

timesheetRouter.post('/create', (req: Request, res: Response): any => {
  const { timesheetData, idempotencyKey } = req.body;

  if (!idempotencyKey) {
    return res.status(400).json({ error: "Idempotency key jest wymagany!" });
  }

  // --- LOGIKA IDEMPOTENCJI (Punkt 5.2) ---
  if (PROCESSED_KEYS.has(idempotencyKey)) {
    console.log(`[Idempotency] Ignoruję duplikat dla klucza: ${idempotencyKey}`);
    return res.status(200).json({ 
      message: "Timesheet już istnieje (odrzucono duplikat)", 
      status: "duplicate" 
    });
  }

  // Symulacja zapisu do bazy danych
  const newEntry = {
    id: `TS-${Date.now()}`, // Generujemy unikalne ID wpisu w bazie
    ...timesheetData,
    createdAt: new Date().toISOString()
  };
  
  TIMESHEETS.push(newEntry);
  PROCESSED_KEYS.add(idempotencyKey); // Zapisujemy klucz, by zablokować kolejne próby

  console.log("✅ Nowy wpis w systemie:", newEntry);

  return res.status(201).json({ 
    message: "Timesheet zapisany pomyślnie", 
    status: "created", 
    data: newEntry 
  });
});