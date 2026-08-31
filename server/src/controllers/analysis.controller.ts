import type { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { jobDescriptionSchema, paginationSchema } from '../schemas/analysis.js';
import { analyzeWithPython, extractTextWithPython, generateReportWithPython } from '../services/python.service.js';
import { AppError } from '../utils/AppError.js';
import { compareAnalyses, type ComparableAnalysis } from '../services/comparison.service.js';
import { shouldSaveAnalysis } from '../utils/privacy.js';

export async function createAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(400, 'A PDF resume is required.');
    const jobDescription = jobDescriptionSchema.parse(req.body.jobDescription);
    const result = await analyzeWithPython(req.file, jobDescription);
    const fileName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!shouldSaveAnalysis(req.body.saveAnalysis)) {
      res.status(200).json({ data: {
        id: `private-${randomUUID()}`, fileName, jobDescription, ...result,
        createdAt: new Date().toISOString(), isSaved: false,
      }});
      return;
    }
    const analysis = await prisma.analysis.create({ data: {
      fileName, jobDescription, extractionMethod: result.extractionMethod,
      score: result.score, resumeSkills: result.resumeSkills, jobSkills: result.jobSkills,
      matchedSkills: result.matchedSkills, missingSkills: result.missingSkills, suggestions: result.suggestions,
      skillRequirements: result.skillRequirements, evidence: result.evidence,
      scoreBreakdown: result.scoreBreakdown,
      evidenceQuality: result.evidenceQuality,
      experienceComparisons: result.experienceComparisons,
      experienceAlignment: result.experienceAlignment,
      qualifications: result.qualifications,
      actionPlan: result.actionPlan,
      competencies: result.competencies,
      structure: result.structure,
    }});
    res.status(201).json({ data: { ...analysis, isSaved: true } });
  } catch (error) { next(error); }
}

export async function listAnalyses(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const [items, total] = await Promise.all([
      prisma.analysis.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.analysis.count(),
    ]);
    res.json({ data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  }
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

export async function compareAnalysisVersions(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const previousId = Array.isArray(req.params.previousId) ? req.params.previousId[0] : req.params.previousId;
    if (id === previousId) throw new AppError(400, 'Choose two different analyses to compare.');
    const [current, previous] = await Promise.all([
      prisma.analysis.findUnique({ where: { id } }), prisma.analysis.findUnique({ where: { id: previousId } }),
    ]);
    if (!current || !previous) throw new AppError(404, 'One or both analyses were not found.');
    res.json({ data: compareAnalyses(current as unknown as ComparableAnalysis, previous as unknown as ComparableAnalysis) });
  } catch (error) { next(error); }
}

export async function downloadAnalysisReport(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const analysis = await prisma.analysis.findUnique({ where: { id } });
    if (!analysis) throw new AppError(404, 'Analysis not found.');
    const report = await generateReportWithPython(analysis);
    const safeName = analysis.fileName.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}-analysis.pdf"`);
    res.send(report);
  } catch (error) { next(error); }
}

export async function previewResumeText(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(400, 'A PDF resume is required.');
    res.json({ data: await extractTextWithPython(req.file) });
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
