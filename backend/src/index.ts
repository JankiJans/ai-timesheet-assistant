import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

//testowa BAZA DANYCH PROJEKTÓW Punkt 3.2
const MOCK_JOBS = [
  { jobNumber: "JOB-001", title: "Brand X", status: "active" },
  { jobNumber: "JOB-002", title: "System logowania", status: "active" },
  { jobNumber: "JOB-003", title: "Strona WWW", status: "closed" }
];

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
    const today = now.toISOString().split('T')[0];

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `Jesteś asystentem AI do raportowania czasu pracy. 
      DZISIAJ JEST: ${today}.
      
      OBECNY STAN WYPEŁNIENIA DANYCH:
      ${JSON.stringify(currentState)}
      
      Zadania:
      1. Przeanalizuj wiadomość. Zaktualizuj OBECNY STAN o nowe informacje (nie usuwaj starych).
      2. Formatuj daty jako YYYY-MM-DD. Zakaz raportowania w przyszłość.
      3. W polu "replyToUser" zapytaj o BRAKUJĄCE pola (np. jeśli brak godzin, zapytaj ile czasu to zajęło). 
      4. Jeśli wszystkie kluczowe pola są podane, zapytaj "Czy chcesz, abym zapisał ten wpis?".
      
      Odpowiadaj WYŁĄCZNIE w JSON:
      {
        "intent": "CREATE_TIMESHEET",
        "entities": {
          "job": string | null,
          "date": string | null,
          "hours": number | null,
          "taskType": string | null,
          "billable": boolean | null,
          "description": string | null
        },
        "replyToUser": string
      }`,
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(userMessage);
    const text = await result.response.text();

    try {
      const aiParsedResponse = JSON.parse(text);

      //WARSTWA NARZĘDZI I REGUŁ BIZNESOWYCH (Punkt 2.1 i 4) ---
      if (aiParsedResponse.entities && aiParsedResponse.entities.job) {
        
        // Sprawdzamy, czy to już jest ID (żeby nie szukać w kółko)
        if (!aiParsedResponse.entities.job.startsWith("JOB-")) {
          
          // Szukamy projektu w naszej bazie po tytule wyciągniętym przez AI
          const foundJob = MOCK_JOBS.find(j => 
            j.title.toLowerCase().includes(aiParsedResponse.entities.job.toLowerCase())
          );

          if (foundJob) {
            // Reguła biznesowa: Brak możliwości raportowania do zamkniętych JOBów
            if (foundJob.status === "closed") {
              aiParsedResponse.entities.job = null; // Czyścimy projekt, bo jest zły
              aiParsedResponse.replyToUser = `Projekt "${foundJob.title}" jest już ZAMKNIĘTY. Nie możesz dodawać do niego czasu. Podaj inny projekt.`;
            } else {
              //Zamieniamy "Brand X" na "JOB-001"
              aiParsedResponse.entities.job = foundJob.jobNumber;
            }
          } else {
            // Jeśli AI wymyśliło projekt, którego nie ma w bazie
            aiParsedResponse.entities.job = null;
            aiParsedResponse.replyToUser = `Niestety nie znalazłem projektu o nazwie "${aiParsedResponse.entities.job}". Dostępne projekty to np. Brand X, System logowania.`;
          }
        }
      }

      if (aiParsedResponse.entities && aiParsedResponse.entities.hours !== null) {
        if (aiParsedResponse.entities.hours > 8) {
          aiParsedResponse.entities.hours = null; // Czyścimy błędną wartość
          aiParsedResponse.replyToUser = "Regulamin zabrania raportowania nadgodzin (więcej niż 8 godzin dziennie). Podaj poprawną wartość.";
        }
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