import { type Request, type Response, Router } from 'express';
import { prisma } from '../prisma.js';

export const jobRouter = Router();

// Endpoint do pobierania wszystkich projektów
jobRouter.get('/list', async (req: Request, res: Response): Promise<any> => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { jobNumber: 'asc' } // Sortujemy alfabetycznie po nazwie
    });
    return res.status(200).json(jobs);
  } catch (error) {
    console.error("❌ Błąd pobierania projektów:", error);
    return res.status(500).json({ error: "Błąd serwera" });
  }
});

// Endpoint do tworzenia nowego projektu
// ZAKTUALIZOWANY Endpoint do tworzenia nowego projektu
jobRouter.post('/create', async (req: Request, res: Response): Promise<any> => {
  const { title } = req.body;

  // Sprawdzamy tylko, czy podano nazwę
  if (!title) {
    return res.status(400).json({ error: "Brakuje nazwy projektu!" });
  }

  try {
    // 1. Znajdujemy projekt z najwyższym numerem w bazie
    const lastJob = await prisma.job.findFirst({
      orderBy: { jobNumber: 'desc' }
    });

    // 2. Generujemy nowy numer
    let nextNumber = 1;
    if (lastJob && lastJob.jobNumber.startsWith('JOB-')) {
      const lastIdParts = lastJob.jobNumber.split('-');
      const lastIdNumber = parseInt(lastIdParts[1] || '', 10);
      if (!isNaN(lastIdNumber)) {
        nextNumber = lastIdNumber + 1;
      }
    }

    // 3. Formatujemy nowy numer (np. z 6 robi JOB-006)
    const newJobNumber = `JOB-${nextNumber.toString().padStart(3, '0')}`;

    // 4. Zapisujemy do bazy
    const newJob = await prisma.job.create({
      data: {
        jobNumber: newJobNumber,
        title: title,
        status: 'active'
      }
    });

    console.log(`✅ Dodano nowy projekt automatycznie: ${newJobNumber} - ${title}`);
    return res.status(201).json(newJob);

  } catch (error) {
    console.error("❌ Błąd dodawania projektu:", error);
    return res.status(500).json({ error: "Błąd podczas zapisu do bazy" });
  }
});

// Endpoint do usuwania projektu
jobRouter.delete('/delete/:jobNumber', async (req: Request, res: Response): Promise<any> => {
  const jobNumber = req.params.jobNumber as string;

  try {
    // BEZPIECZEŃSTWO: Sprawdzamy, czy projekt ma już jakieś przypisane wpisy czasu pracy
    const timesheetsCount = await prisma.timesheet.count({
      where: { jobNumber: jobNumber }
    });

    if (timesheetsCount > 0) {
      // Jeśli są wpisy, blokujemy usunięcie
      return res.status(400).json({ 
        error: `Nie można usunąć projektu! Ma on już ${timesheetsCount} przypisanych wpisów czasu pracy.` 
      });
    }

    // Jeśli wpisów nie ma, bezpiecznie usuwamy projekt
    await prisma.job.delete({
      where: { jobNumber: jobNumber }
    });

    console.log(`🗑️ Usunięto projekt: ${jobNumber}`);
    return res.status(200).json({ message: "Projekt usunięty pomyślnie" });

  } catch (error) {
    console.error("❌ Błąd usuwania projektu:", error);
    return res.status(500).json({ error: "Błąd serwera podczas usuwania projektu" });
  }
});

jobRouter.patch('/toggle-status/:jobNumber', async (req: Request, res: Response): Promise<any> => {
  const jobNumber  = req.params.jobNumber as string;

  try {
    const job = await prisma.job.findUnique({
      where: { jobNumber: jobNumber }
    });

    if (!job) return res.status(404).json({ error: "Nie znaleziono projektu" });

    const newStatus = job.status === 'active' ? 'inactive' : 'active';

    const updatedJob = await prisma.job.update({
      where: { jobNumber: jobNumber },
      data: { status: newStatus }
    });

    console.log(`🔄 Zmieniono status projektu ${jobNumber} na: ${newStatus}`);
    return res.status(200).json(updatedJob);
  } catch (error) {
    return res.status(500).json({ error: "Błąd serwera podczas zmiany statusu" });
  }
});