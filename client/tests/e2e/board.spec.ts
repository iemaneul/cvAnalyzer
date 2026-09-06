import { expect, test } from '@playwright/test';
import { analysis, authenticate, paginated } from './fixtures';

test('moves an application between board stages', async ({ page }) => {
  await authenticate(page); let current = { ...analysis };
  await page.route('**/api/analyses?*', (route) => route.fulfill({ json: paginated([current]) }));
  await page.route('**/api/analyses/analysis-1/status', async (route) => { current = { ...current, applicationStatus: (await route.request().postDataJSON()).status }; return route.fulfill({ json: { data: current } }); });
  await page.goto('/board');
  await expect(page.getByRole('heading', { name: /Application board/ })).toBeVisible();
  await page.getByLabel(`Move ${analysis.jobTitle}`).selectOption('interview');
  await expect.poll(() => current.applicationStatus).toBe('interview');
});
