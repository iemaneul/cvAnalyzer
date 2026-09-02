import { describe, expect, it } from 'vitest';
import { buildDashboard, type DashboardAnalysis } from './dashboard.service.js';

const item = (id: string, score: number, date: string, jobTitle = 'Developer', company: string | null = 'Acme'): DashboardAnalysis => ({
  id, score, jobTitle, company, createdAt: new Date(date),
});

describe('buildDashboard', () => {
  it('calculates summary, ranking, and chronological trend', () => {
    const dashboard = buildDashboard([
      item('new', 90, '2026-09-02', 'Backend Developer'),
      item('old', 50, '2026-08-01'),
      item('middle', 70, '2026-08-15'),
    ]);
    expect(dashboard.summary).toEqual({ total: 3, averageScore: 70, bestScore: 90, improvement: 40 });
    expect(dashboard.bestAnalysis?.id).toBe('new');
    expect(dashboard.trend.map((entry) => entry.id)).toEqual(['old', 'middle', 'new']);
    expect(dashboard.topCompanies[0]).toEqual({ name: 'Acme', count: 3 });
    expect(dashboard.topJobTitles[0]).toEqual({ name: 'Developer', count: 2 });
  });

  it('returns a safe empty dashboard', () => {
    expect(buildDashboard([])).toMatchObject({ summary: { total: 0, averageScore: 0, bestScore: 0, improvement: 0 }, bestAnalysis: null, trend: [] });
  });
});
