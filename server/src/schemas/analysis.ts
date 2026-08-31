import { z } from 'zod';

export const analysisResultSchema = z.object({
  extractionMethod: z.enum(['native', 'ocr']),
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
  actionPlan: z.array(z.object({
    id: z.string(), priority: z.enum(['high', 'medium', 'low']), category: z.string(),
    subject: z.string(), title: z.string(), description: z.string(),
  })),
  competencies: z.object({
    alignment: z.number().int().min(0).max(100).nullable(),
    resumeCompetencies: z.array(z.string()),
    requirements: z.array(z.object({
      competency: z.string(), category: z.string(),
      importance: z.enum(['required', 'standard', 'preferred']), matched: z.boolean(),
    })),
    matched: z.array(z.string()), missing: z.array(z.string()),
    evidence: z.array(z.object({ competency: z.string(), category: z.string(), excerpts: z.array(z.string()) })),
  }),
  structure: z.object({
    score: z.number().int().min(0).max(100),
    sections: z.array(z.object({ key: z.string(), label: z.string(), detected: z.boolean() })),
    missingSections: z.array(z.string()),
    contacts: z.object({ email: z.boolean(), linkedin: z.boolean(), github: z.boolean() }),
    wordCount: z.number().int(), estimatedPages: z.number().int(), bulletCount: z.number().int(),
    quantifiedAchievements: z.number().int(),
    issues: z.array(z.object({ severity: z.enum(['high', 'medium', 'low']), code: z.string(), message: z.string() })),
  }),
  scoreBreakdown: z.object({ required: z.number(), standard: z.number(), preferred: z.number() }),
  warning: z.string().nullable().optional(),
});

export const jobDescriptionSchema = z.string().trim().min(50, 'Job description must be at least 50 characters.');
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
