export interface DashboardAnalysis {
  id: string;
  jobTitle: string | null;
  company: string | null;
  score: number;
  createdAt: Date;
}

const rankValues = (values: Array<string | null>) => {
  const counts = new Map<string, number>();
  values.forEach((value) => { if (value?.trim()) counts.set(value, (counts.get(value) ?? 0) + 1); });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5);
};

export function buildDashboard(analyses: DashboardAnalysis[]) {
  const chronological = [...analyses].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const best = analyses.reduce<DashboardAnalysis | null>((current, item) => !current || item.score > current.score ? item : current, null);
  const averageScore = analyses.length ? Math.round((analyses.reduce((sum, item) => sum + item.score, 0) / analyses.length) * 10) / 10 : 0;
  return {
    summary: {
      total: analyses.length,
      averageScore,
      bestScore: best?.score ?? 0,
      improvement: chronological.length > 1 ? chronological.at(-1)!.score - chronological[0].score : 0,
    },
    bestAnalysis: best ? { id: best.id, jobTitle: best.jobTitle, company: best.company, score: best.score, createdAt: best.createdAt } : null,
    trend: chronological.slice(-12).map(({ id, jobTitle, company, score, createdAt }) => ({ id, jobTitle, company, score, createdAt })),
    topJobTitles: rankValues(analyses.map((item) => item.jobTitle)),
    topCompanies: rankValues(analyses.map((item) => item.company)),
  };
}
