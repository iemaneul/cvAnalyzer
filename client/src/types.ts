export interface Analysis {
  id: string; fileName: string; jobDescription: string; score: number;
  resumeSkills: string[]; jobSkills: string[]; matchedSkills: string[];
  missingSkills: string[]; suggestions: string[]; createdAt: string;
  skillRequirements?: Array<{ skill: string; importance: 'required' | 'standard' | 'preferred'; weight: number; matched: boolean; yearsRequired: number | null }>;
  evidence?: Array<{ skill: string; excerpts: string[]; section: string; years: number | null; strength: number }>;
  evidenceQuality?: number;
  experienceComparisons?: Array<{ skill: string; requiredYears: number; resumeYears: number | null; status: 'met' | 'gap' | 'unknown' }>;
  experienceAlignment?: number | null;
  qualifications?: {
    alignment: number | null;
    education: { required: { level: string; rank: number } | null; resume: { level: string; rank: number } | null; status: 'met' | 'gap' | 'missing' | null };
    languages: Array<{ language: string; requiredLevel: string | null; resumeLevel: string | null; status: 'met' | 'gap' | 'missing' | 'unknown' }>;
    certifications: Array<{ certification: string; status: 'met' | 'missing' }>;
    resumeLanguages: Array<{ language: string; level: string | null; rank: number | null }>;
    resumeCertifications: string[];
  };
  actionPlan?: Array<{
    id: string; priority: 'high' | 'medium' | 'low'; category: string;
    subject: string; title: string; description: string;
  }>;
  scoreBreakdown?: { required: number; standard: number; preferred: number };
}
