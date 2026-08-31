import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error.js';
import { analysisRouter } from './routes/analysis.routes.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { checkReadiness } from './services/readiness.service.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(requestLogger);
app.use(express.json({ limit: '100kb' }));
app.get('/health', (_req, res) => res.json({ data: { status: 'ok' } }));
app.get('/health/ready', async (_req, res) => {
  const readiness = await checkReadiness();
  res.status(readiness.ready ? 200 : 503).json({ data: { status: readiness.ready ? 'ready' : 'not_ready', ...readiness } });
});
app.use('/api', analysisRouter);
app.use(errorHandler);
