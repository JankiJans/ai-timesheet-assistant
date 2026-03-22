import { type Request, type Response, Router } from 'express';
import { prisma } from '../prisma.js';

export const jobRouter = Router();

// Endpoint do pobierania wszystkich projektów
jobRouter.get('/list', async (req: Request, res: Response): Promise<any> => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { title: 'asc' } // Sortujemy alfabetycznie po nazwie
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