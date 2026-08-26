import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createAnalysis, deleteAnalysis, getAnalysis, listAnalyses } from '../controllers/analysis.controller.js';
import { upload } from '../middlewares/upload.js';

export const analysisRouter = Router();
analysisRouter.post('/analyze', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8' }), upload.single('resume'), createAnalysis);
analysisRouter.get('/analyses', listAnalyses);
analysisRouter.get('/analyses/:id', getAnalysis);
analysisRouter.delete('/analyses/:id', deleteAnalysis);

