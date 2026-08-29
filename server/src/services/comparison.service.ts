export interface ComparableAnalysis {
  id: string;
  fileName: string;
  createdAt: Date;
  score: number;
  matchedSkills: unknown;
  missingSkills: unknown;
  evidenceQuality: number | null;
  experienceAlignment: number | null;
  structure: unknown;
  qualifications: unknown;
  competencies: unknown;
  actionPlan: unknown;
}

const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
const records = (value: unknown): Record<string, unknown>[] => Array.isArray(value)
  ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object') : [];
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const numberAt = (value: unknown, key: string): number | null => {
  const candidate = object(value)[key]; return typeof candidate === 'number' ? candidate : null;
};
const delta = (current: number | null, previous: number | null) => current === null || previous === null ? null : current - previous;
const difference = (left: string[], right: string[]) => left.filter((item) => !new Set(right).has(item));

export function compareAnalyses(current: ComparableAnalysis, previous: ComparableAnalysis) {
  const currentMatched = strings(current.matchedSkills), previousMatched = strings(previous.matchedSkills);
  const currentMissing = strings(current.missingSkills), previousMissing = strings(previous.missingSkills);
  const currentStructure = numberAt(current.structure, 'score'), previousStructure = numberAt(previous.structure, 'score');
  const currentQualifications = numberAt(current.qualifications, 'alignment'), previousQualifications = numberAt(previous.qualifications, 'alignment');
  const currentCompetencies = numberAt(current.competencies, 'alignment'), previousCompetencies = numberAt(previous.competencies, 'alignment');
  const issueCodes = (value: unknown) => records(object(value).issues).map((item) => item.code).filter((item): item is string => typeof item === 'string');
  const actionIds = (value: unknown) => records(value).map((item) => item.id).filter((item): item is string => typeof item === 'string');
  return {
    current: { id: current.id, fileName: current.fileName, createdAt: current.createdAt, score: current.score },
    previous: { id: previous.id, fileName: previous.fileName, createdAt: previous.createdAt, score: previous.score },
    deltas: {
      score: current.score - previous.score,
      evidenceQuality: delta(current.evidenceQuality, previous.evidenceQuality),
      experienceAlignment: delta(current.experienceAlignment, previous.experienceAlignment),
      structure: delta(currentStructure, previousStructure),
      qualifications: delta(currentQualifications, previousQualifications),
      competencies: delta(currentCompetencies, previousCompetencies),
    },
    skills: {
      newlyMatched: difference(currentMatched, previousMatched),
      noLongerMatched: difference(previousMatched, currentMatched),
      resolvedMissing: difference(previousMissing, currentMissing),
      newMissing: difference(currentMissing, previousMissing),
    },
    structure: {
      resolvedIssues: difference(issueCodes(previous.structure), issueCodes(current.structure)),
      newIssues: difference(issueCodes(current.structure), issueCodes(previous.structure)),
    },
    actions: {
      resolved: difference(actionIds(previous.actionPlan), actionIds(current.actionPlan)),
      added: difference(actionIds(current.actionPlan), actionIds(previous.actionPlan)),
    },
  };
}

