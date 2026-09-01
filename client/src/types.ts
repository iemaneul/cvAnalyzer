export interface Analysis {
  id: string; fileName: string; jobTitle?: string | null; company?: string | null; jobDescription: string; score: number;
  extractionMethod?: 'native' | 'ocr';
  resumeSkills: string[]; jobSkills: string[]; matchedSkills: string[];
  missingSkills: string[]; suggestions: string[]; createdAt: string;
  isSaved?: boolean;
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
  competencies?: {
    alignment: number | null;
    resumeCompetencies: string[];
    requirements: Array<{ competency: string; category: string; importance: 'required' | 'standard' | 'preferred'; matched: boolean }>;
    matched: string[]; missing: string[];
    evidence: Array<{ competency: string; category: string; excerpts: string[] }>;
  };
  structure?: {
    score: number;
    sections: Array<{ key: string; label: string; detected: boolean }>;
    missingSections: string[];
    contacts: { email: boolean; linkedin: boolean; github: boolean };
    wordCount: number; estimatedPages: number; bulletCount: number; quantifiedAchievements: number;
    issues: Array<{ severity: 'high' | 'medium' | 'low'; code: string; message: string }>;
  };
  scoreBreakdown?: { required: number; standard: number; preferred: number };
}

export interface AnalysisComparison {
  current: { id: string; fileName: string; jobTitle: string | null; company: string | null; createdAt: string; score: number };
  previous: { id: string; fileName: string; jobTitle: string | null; company: string | null; createdAt: string; score: number };
  deltas: {
    score: number; evidenceQuality: number | null; experienceAlignment: number | null;
    structure: number | null; qualifications: number | null; competencies: number | null;
  };
  skills: { newlyMatched: string[]; noLongerMatched: string[]; resolvedMissing: string[]; newMissing: string[] };
  structure: { resolvedIssues: string[]; newIssues: string[] };
  actions: { resolved: string[]; added: string[] };
}

export interface PaginatedAnalyses {
  data: Analysis[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
