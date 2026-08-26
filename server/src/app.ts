import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error.js';
import { analysisRouter } from './routes/analysis.routes.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.get('/health', (_req, res) => res.json({ data: { status: 'ok' } }));
app.use('/api', analysisRouter);
app.use(errorHandler);

