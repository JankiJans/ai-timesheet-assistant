import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Inicjalizacja klienta Gemini
// stała po klucz
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.get('/', (req: Request, res: Response) => {
  res.send('AI Timesheet Assistant API is running! 🚀');
});

//endpoint do czatu
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      res.status(400).json({ error: "Wiadomość jest wymagana!" });
      return; 
    }

    // --- LOGIKA DATY (Punkt 3.1 i 4) ---
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `Jesteś asystentem AI do raportowania czasu pracy. 
      DZISIAJ JEST: ${today}.
      
      Zadania:
      1. Wyciągnij encje z wiadomości.
      2. ZAWSZE zamieniaj daty relatywne (wczoraj, dzisiaj, poniedziałek) na format YYYY-MM-DD.
      3. Jeśli użytkownik poda datę z przyszłości (późniejszą niż ${today}), ustaw date: null i w replyToUser napisz, że nie można raportować czasu w przyszłość (Zgodnie z Punktem 4 regulaminu).
      
      Odpowiadaj WYŁĄCZNIE w JSON:
      {
        "intent": "CREATE_TIMESHEET",
        "entities": { "job": string, "date": string, "hours": number, "taskType": string, "billable": boolean, "description": string },
        "replyToUser": string
      }`,
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    try {
      const aiParsedResponse = JSON.parse(text);
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