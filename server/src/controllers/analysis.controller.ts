import type { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { analysisListQuerySchema, applicationDetailsSchema, applicationStatusSchema, jobContextSchema, jobDescriptionSchema } from '../schemas/analysis.js';
import { analyzeWithPython, extractTextWithPython, generateReportWithPython } from '../services/python.service.js';
import { AppError } from '../utils/AppError.js';
import { compareAnalyses, type ComparableAnalysis } from '../services/comparison.service.js';
import { buildDashboard } from '../services/dashboard.service.js';
import { shouldSaveAnalysis } from '../utils/privacy.js';

export async function createAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(400, 'A PDF resume is required.');
    const jobDescription = jobDescriptionSchema.parse(req.body.jobDescription);
    const { jobTitle, company } = jobContextSchema.parse(req.body);
    const result = await analyzeWithPython(req.file, jobDescription);
    const fileName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!shouldSaveAnalysis(req.body.saveAnalysis)) {
      res.status(200).json({ data: {
        id: `private-${randomUUID()}`, fileName, jobTitle, company: company ?? null, jobDescription, ...result,
        createdAt: new Date().toISOString(), isSaved: false,
      }});
      return;
    }
    const analysis = await prisma.analysis.create({ data: {
      fileName, jobTitle, company, userId: req.user!.id, jobDescription, extractionMethod: result.extractionMethod,
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
    const { page, limit, search, status, minScore, maxScore, dateFrom, dateTo } = analysisListQuerySchema.parse(req.query);
    const dateToExclusive = dateTo ? new Date(`${dateTo}T00:00:00.000Z`) : undefined;
    dateToExclusive?.setUTCDate(dateToExclusive.getUTCDate() + 1);
    const where: Prisma.AnalysisWhereInput = {
      userId: req.user!.id,
      ...(search && { OR: [
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ] }),
      ...(status && { applicationStatus: status }),
      ...((minScore !== undefined || maxScore !== undefined) && { score: { gte: minScore, lte: maxScore } }),
      ...((dateFrom || dateTo) && { createdAt: {
        ...(dateFrom && { gte: new Date(`${dateFrom}T00:00:00.000Z`) }),
        ...(dateToExclusive && { lt: dateToExclusive }),
      } }),
    };
    const [items, total] = await Promise.all([
      prisma.analysis.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.analysis.count({ where }),
    ]);
    res.json({ data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  }
  catch (error) { next(error); }
}

export async function getAnalysisDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const analyses = await prisma.analysis.findMany({
      where: { userId: req.user!.id },
      select: { id: true, jobTitle: true, company: true, score: true, createdAt: true },
    });
    res.json({ data: buildDashboard(analyses) });
  } catch (error) { next(error); }
}

export async function getAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const analysis = await prisma.analysis.findFirst({ where: { id, userId: req.user!.id } });
    if (!analysis) throw new AppError(404, 'Analysis not found.');
    res.json({ data: analysis });
  } catch (error) { next(error); }
}

export async function updateAnalysisContext(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { jobTitle, company } = jobContextSchema.parse(req.body);
    const found = await prisma.analysis.findFirst({ where: { id, userId: req.user!.id }, select: { id: true } });
    if (!found) throw new AppError(404, 'Analysis not found.');
    const analysis = await prisma.analysis.update({ where: { id }, data: { jobTitle, company: company ?? null } });
    res.json({ data: analysis });
  } catch (error) { next(error); }
}

export async function updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = applicationStatusSchema.parse(req.body);
    const found = await prisma.analysis.findFirst({ where: { id, userId: req.user!.id }, select: { id: true } });
    if (!found) throw new AppError(404, 'Analysis not found.');
    const analysis = await prisma.analysis.update({ where: { id }, data: { applicationStatus: status } });
    res.json({ data: analysis });
  } catch (error) { next(error); }
}

export async function updateApplicationDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const details = applicationDetailsSchema.parse(req.body);
    const found = await prisma.analysis.findFirst({ where: { id, userId: req.user!.id }, select: { id: true } });
    if (!found) throw new AppError(404, 'Analysis not found.');
    const analysis = await prisma.analysis.update({ where: { id }, data: {
      jobUrl: details.jobUrl ?? null, salary: details.salary ?? null,
      workMode: details.workMode ?? null, notes: details.notes ?? null,
    } });
    res.json({ data: analysis });
  } catch (error) { next(error); }
}

export async function compareAnalysisVersions(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const previousId = Array.isArray(req.params.previousId) ? req.params.previousId[0] : req.params.previousId;
    if (id === previousId) throw new AppError(400, 'Choose two different analyses to compare.');
    const [current, previous] = await Promise.all([
      prisma.analysis.findFirst({ where: { id, userId: req.user!.id } }), prisma.analysis.findFirst({ where: { id: previousId, userId: req.user!.id } }),
    ]);
    if (!current || !previous) throw new AppError(404, 'One or both analyses were not found.');
    res.json({ data: compareAnalyses(current as unknown as ComparableAnalysis, previous as unknown as ComparableAnalysis) });
  } catch (error) { next(error); }
}

export async function downloadAnalysisReport(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const analysis = await prisma.analysis.findFirst({ where: { id, userId: req.user!.id } });
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
    const found = await prisma.analysis.findFirst({ where: { id, userId: req.user!.id } });
    if (!found) throw new AppError(404, 'Analysis not found.');
    await prisma.analysis.delete({ where: { id } });
    res.status(204).send();
  } catch (error) { next(error); }
}
