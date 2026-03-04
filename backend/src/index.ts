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
// stała po klucz (TypeScript tego wymaga)
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

    //model "Flash" - idealny do szybkich zadań
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    //wysyłka wiadomość do AI
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    
    //Pobieram tekst odpowiedzi
    const text = response.text();

    //odsyłka wiadomości do testów na Thunder Client
    res.json({ reply: text || "Brak odpowiedzi od AI" });

  } catch (error) {
    console.error("Błąd AI:", error);
    res.status(500).json({ error: "Błąd podczas komunikacji z AI" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});