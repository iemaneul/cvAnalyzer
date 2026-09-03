import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { compareAnalysisVersions, createAnalysis, deleteAnalysis, downloadAnalysisReport, getAnalysis, getAnalysisDashboard, listAnalyses, previewResumeText, updateAnalysisContext, updateApplicationStatus } from '../controllers/analysis.controller.js';
import { upload } from '../middlewares/upload.js';

export const analysisRouter = Router();
analysisRouter.post('/analyze', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8' }), upload.single('resume'), createAnalysis);
analysisRouter.post('/extract', upload.single('resume'), previewResumeText);
analysisRouter.get('/analyses', listAnalyses);
analysisRouter.get('/analyses/dashboard', getAnalysisDashboard);
analysisRouter.get('/analyses/:id/compare/:previousId', compareAnalysisVersions);
analysisRouter.get('/analyses/:id/report', downloadAnalysisReport);
analysisRouter.get('/analyses/:id', getAnalysis);
analysisRouter.patch('/analyses/:id/context', updateAnalysisContext);
analysisRouter.patch('/analyses/:id/status', updateApplicationStatus);
analysisRouter.delete('/analyses/:id', deleteAnalysis);
