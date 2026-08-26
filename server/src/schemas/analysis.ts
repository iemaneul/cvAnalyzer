import { z } from 'zod';

export const analysisResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  resumeSkills: z.array(z.string()),
  jobSkills: z.array(z.string()),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  suggestions: z.array(z.string()),
  warning: z.string().nullable().optional(),
});

export const jobDescriptionSchema = z.string().trim().min(50, 'Job description must be at least 50 characters.');
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

