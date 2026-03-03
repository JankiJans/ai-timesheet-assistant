import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Wczytujemy zmienne z pliku .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Pozwala serwerowi rozumieć format JSON

// Nasz pierwszy "endpoint" (punkt styku)
app.get('/', (req: Request, res: Response) => {
  res.send('AI Timesheet Assistant API is running! 🚀');
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});