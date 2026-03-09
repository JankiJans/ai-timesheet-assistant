import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173'
}));
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
    // NOWOŚĆ: Odbieramy od frontendu to, co już wiemy o timesheecie
    const currentState = req.body.currentState || {}; 

    if (!userMessage) {
      res.status(400).json({ error: "Wiadomość jest wymagana!" });
      return; 
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Zaktualizowany Prompt (Punkt 5.2 Slot Tracking)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `Jesteś asystentem AI do raportowania czasu pracy. 
      DZISIAJ JEST: ${today}.
      
      OBECNY STAN WYPEŁNIENIA DANYCH (Slot tracking):
      ${JSON.stringify(currentState)}
      
      Zadania (Krok po kroku):
      1. Przeanalizuj nową wiadomość użytkownika.
      2. Zaktualizuj OBECNY STAN o nowe informacje wyciągnięte z wiadomości. Jeśli w obecnym stanie coś już jest wypełnione, NIE USUWAJ TEGO, tylko dodaj nowe dane.
      3. Formatuj daty jako YYYY-MM-DD. Zakaz raportowania w przyszłość (ustaw date: null jeśli data jest z przyszłości).
      4. Sprawdź, jakich danych wciąż brakuje w encjach (job, date, hours, taskType, billable, description).
      5. W polu "replyToUser" zadaj naturalne pytanie o BRAKUJĄCE pola. Jeśli wszystkie kluczowe pola (job, date, hours) są wypełnione, zapytaj o potwierdzenie ("Czy zapisać wpis?").
      
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