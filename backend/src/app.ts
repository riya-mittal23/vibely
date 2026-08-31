import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { SPECTRUMS } from './game/spectrums.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://vibelyr.vercel.app'
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ''));
}

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'vibely-backend' });
});

// Serve spectrums
app.get('/api/spectrums', (req, res) => {
  res.json(SPECTRUMS);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
