import { expect, test } from '@playwright/test';
import { authenticate } from './fixtures';

test('renders version comparison deltas', async ({ page }) => {
  await authenticate(page);
  await page.route('**/api/analyses/current/compare/previous', (route) => route.fulfill({ json: { data: {
    current: { id: 'current', fileName: 'new.pdf', jobTitle: 'Developer', company: 'Acme', createdAt: '2026-09-03', score: 85 }, previous: { id: 'previous', fileName: 'old.pdf', jobTitle: 'Developer', company: 'Acme', createdAt: '2026-09-01', score: 70 },
    deltas: { score: 15, evidenceQuality: 10, experienceAlignment: null, structure: 5, qualifications: 0, competencies: 3 },
    skills: { newlyMatched: ['Docker'], noLongerMatched: [], resolvedMissing: ['Docker'], newMissing: [] }, structure: { resolvedIssues: [], newIssues: [] }, actions: { resolved: [], added: [] },
  } } }));
  await page.goto('/history/current/compare/previous');
  await expect(page.getByRole('heading', { name: 'Version comparison' })).toBeVisible(); await expect(page.getByText('+15 pts')).toBeVisible(); await expect(page.getByText('Docker').first()).toBeVisible();
});
