import { describe, expect, it } from 'vitest';
import { compareAnalyses, type ComparableAnalysis } from './comparison.service.js';

const analysis = (overrides: Partial<ComparableAnalysis>): ComparableAnalysis => ({
  id: 'id', fileName: 'resume.pdf', createdAt: new Date('2026-08-29T10:00:00Z'), score: 70,
  matchedSkills: ['React'], missingSkills: ['AWS'], evidenceQuality: 60, experienceAlignment: null,
  structure: { score: 70, issues: [{ code: 'missing_projects' }] },
  qualifications: { alignment: 50 }, competencies: { alignment: 40 },
  actionPlan: [{ id: 'missing_skill:aws' }], ...overrides,
});

describe('compareAnalyses', () => {
  it('calculates score dimensions and resolved gaps', () => {
    const previous = analysis({ id: 'old' });
    const current = analysis({
      id: 'new', score: 85, matchedSkills: ['React', 'AWS'], missingSkills: [], evidenceQuality: 80,
      structure: { score: 90, issues: [] }, actionPlan: [],
    });
    const result = compareAnalyses(current, previous);
    expect(result.deltas.score).toBe(15);
    expect(result.deltas.structure).toBe(20);
    expect(result.skills.newlyMatched).toEqual(['AWS']);
    expect(result.skills.resolvedMissing).toEqual(['AWS']);
    expect(result.structure.resolvedIssues).toEqual(['missing_projects']);
  });

  it('keeps unavailable dimension deltas nullable', () => {
    const result = compareAnalyses(analysis({ evidenceQuality: null }), analysis({ id: 'old' }));
    expect(result.deltas.evidenceQuality).toBeNull();
  });
});

