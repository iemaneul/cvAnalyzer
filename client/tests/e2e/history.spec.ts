import { expect, test } from '@playwright/test';
import { analysis, authenticate, paginated } from './fixtures';

test('shows mobile history cards and sends filters to the API', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await authenticate(page);
  const requests: string[] = [];
  await page.route('**/api/analyses?*', (route) => { requests.push(route.request().url()); return route.fulfill({ json: paginated() }); });
  await page.goto('/history');
  await expect(page.locator('article').getByText(analysis.jobTitle)).toBeVisible();
  await page.getByLabel('Filter by application status').selectOption('interview');
  await expect.poll(() => requests.some((url) => url.includes('status=interview'))).toBeTruthy();
  await expect(page.locator('table')).toBeHidden();
});
