export interface Analysis {
  id: string; fileName: string; jobDescription: string; score: number;
  resumeSkills: string[]; jobSkills: string[]; matchedSkills: string[];
  missingSkills: string[]; suggestions: string[]; createdAt: string;
}

