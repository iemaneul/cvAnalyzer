import type { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import { prisma } from '../lib/prisma.js';
import { jobDescriptionSchema } from '../schemas/analysis.js';
import { analyzeWithPython } from '../services/python.service.js';
import { AppError } from '../utils/AppError.js';

export async function createAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(400, 'A PDF resume is required.');
    const jobDescription = jobDescriptionSchema.parse(req.body.jobDescription);
    const result = await analyzeWithPython(req.file, jobDescription);
    const analysis = await prisma.analysis.create({ data: {
      fileName: path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_'), jobDescription,
      score: result.score, resumeSkills: result.resumeSkills, jobSkills: result.jobSkills,
      matchedSkills: result.matchedSkills, missingSkills: result.missingSkills, suggestions: result.suggestions,
    }});
    res.status(201).json({ data: analysis });
  } catch (error) { next(error); }
}

export async function listAnalyses(_req: Request, res: Response, next: NextFunction) {
  try { res.json({ data: await prisma.analysis.findMany({ orderBy: { createdAt: 'desc' } }) }); }
  catch (error) { next(error); }
}

export async function getAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const analysis = await prisma.analysis.findUnique({ where: { id } });
    if (!analysis) throw new AppError(404, 'Analysis not found.');
    res.json({ data: analysis });
  } catch (error) { next(error); }
}

export async function deleteAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const found = await prisma.analysis.findUnique({ where: { id } });
    if (!found) throw new AppError(404, 'Analysis not found.');
    await prisma.analysis.delete({ where: { id } });
    res.status(204).send();
  } catch (error) { next(error); }
}
