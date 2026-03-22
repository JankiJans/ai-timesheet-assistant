import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemInstruction } from './config/prompts.js';
import { timesheetRouter } from './routes/timesheet.js';
import { prisma } from './prisma.js';
import { jobRouter } from './routes/job.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Podłączamy router do aplikacji pod nowy adres URL
app.use('/api/timesheet', timesheetRouter);
app.use('/api/jobs', jobRouter);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.get('/', (req: Request, res: Response) => {
  res.send('AI Timesheet Assistant API is running! 🚀');
});

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const userMessage = req.body.message;
    const currentState = req.body.currentState || {}; 

    if (!userMessage) {
      res.status(400).json({ error: "Wiadomość jest wymagana!" });
      return; 
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0] || '';

    //Używamy wydzielonej funkcji do wygenerowania promptu
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: getSystemInstruction(today, currentState),
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(userMessage);
    const text = await result.response.text();

    try {
      const aiParsedResponse = JSON.parse(text);

      //WARSTWA NARZĘDZI I REGUŁ BIZNESOWYCH ---
      if (aiParsedResponse.entities?.job && !aiParsedResponse.entities.job.startsWith("JOB-")) {
        const allJobs = await prisma.job.findMany();
        const foundJob = allJobs.find(j => 
        j.title.toLowerCase().includes(aiParsedResponse.entities.job.toLowerCase())
        );

        if (foundJob) {
          if (foundJob.status === "closed") {
            aiParsedResponse.entities.job = null;
            aiParsedResponse.replyToUser = `Projekt "${foundJob.title}" jest już ZAMKNIĘTY. Nie możesz dodawać do niego czasu.`;
          } else {
            aiParsedResponse.entities.job = foundJob.jobNumber;
          }
        } else {
          aiParsedResponse.entities.job = null;
          aiParsedResponse.replyToUser = `Niestety nie znalazłem projektu o nazwie "${aiParsedResponse.entities.job}".`;
        }
      }

      if (aiParsedResponse.entities?.hours !== null && aiParsedResponse.entities.hours > 8) {
        aiParsedResponse.entities.hours = null;
        aiParsedResponse.replyToUser = "Regulamin zabrania raportowania nadgodzin (więcej niż 8 godzin dziennie). Podaj poprawną wartość.";
      }

      res.json(aiParsedResponse);
    } catch (parseError) {
      res.json({ replyToUser: text });
    }

  } catch (error) {
    console.error("Błąd AI:", error);
    res.status(500).json({ error: "Błąd komunikacji" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});