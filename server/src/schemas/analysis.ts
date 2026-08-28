import { z } from 'zod';

export const analysisResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  resumeSkills: z.array(z.string()),
  jobSkills: z.array(z.string()),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  suggestions: z.array(z.string()),
  skillRequirements: z.array(z.object({
    skill: z.string(), importance: z.enum(['required', 'standard', 'preferred']),
    weight: z.number().int(), matched: z.boolean(), yearsRequired: z.number().int().nullable(),
  })),
  evidence: z.array(z.object({
    skill: z.string(), excerpts: z.array(z.string()), section: z.string(),
    years: z.number().int().nullable(), strength: z.number().int().min(0).max(100),
  })),
  evidenceQuality: z.number().int().min(0).max(100),
  experienceComparisons: z.array(z.object({
    skill: z.string(), requiredYears: z.number().int(), resumeYears: z.number().int().nullable(),
    status: z.enum(['met', 'gap', 'unknown']),
  })),
  experienceAlignment: z.number().int().min(0).max(100).nullable(),
  qualifications: z.object({
    alignment: z.number().int().min(0).max(100).nullable(),
    education: z.object({
      required: z.object({ level: z.string(), rank: z.number().int() }).nullable(),
      resume: z.object({ level: z.string(), rank: z.number().int() }).nullable(),
      status: z.enum(['met', 'gap', 'missing']).nullable(),
    }),
    languages: z.array(z.object({
      language: z.string(), requiredLevel: z.string().nullable(), resumeLevel: z.string().nullable(),
      status: z.enum(['met', 'gap', 'missing', 'unknown']),
    })),
    certifications: z.array(z.object({ certification: z.string(), status: z.enum(['met', 'missing']) })),
    resumeLanguages: z.array(z.object({ language: z.string(), level: z.string().nullable(), rank: z.number().int().nullable() })),
    resumeCertifications: z.array(z.string()),
  }),
  scoreBreakdown: z.object({ required: z.number(), standard: z.number(), preferred: z.number() }),
  warning: z.string().nullable().optional(),
});

export const jobDescriptionSchema = z.string().trim().min(50, 'Job description must be at least 50 characters.');
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
