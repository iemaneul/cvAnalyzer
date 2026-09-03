import type { Page } from '@playwright/test';

export const user = { id: 'user-1', name: 'Manu', email: 'manu@example.com' };
export const analysis = {
  id: 'analysis-1', fileName: 'resume.pdf', jobTitle: 'Backend Developer', company: 'Acme',
  jobDescription: 'A sufficiently long job description for a backend developer using TypeScript and PostgreSQL.',
  score: 82, resumeSkills: ['TypeScript'], jobSkills: ['TypeScript', 'PostgreSQL'], matchedSkills: ['TypeScript'],
  missingSkills: ['PostgreSQL'], suggestions: ['Add supported PostgreSQL experience.'], createdAt: '2026-09-03T12:00:00.000Z',
  applicationStatus: 'applied', jobUrl: null, salary: null, workMode: null, notes: null,
};

export async function authenticate(page: Page) {
  await page.addInitScript(() => localStorage.setItem('cv-analyzer:access-token', 'test-token'));
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { data: user } }));
}

export const paginated = (items = [analysis]) => ({ data: items, meta: { page: 1, limit: 10, total: items.length, totalPages: 1 } });
