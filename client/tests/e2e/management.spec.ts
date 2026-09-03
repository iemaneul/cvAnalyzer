import { expect, test } from '@playwright/test';
import { analysis, authenticate, paginated } from './fixtures';

test('edits and deletes a saved application', async ({ page }) => {
  await authenticate(page); let current = { ...analysis };
  await page.route(/\/api\/analyses\/analysis-1$/, (route) => route.request().method() === 'GET' ? route.fulfill({ json: { data: current } }) : route.continue());
  await page.route('**/api/analyses?*', (route) => route.fulfill({ json: paginated([current]) }));
  await page.route('**/api/analyses/analysis-1/context', async (route) => { current = { ...current, ...(await route.request().postDataJSON()) }; return route.fulfill({ json: { data: current } }); });
  await page.goto('/history/analysis-1');
  await page.getByRole('button', { name: 'Edit details' }).click(); await page.getByLabel(/Job title/).fill('Platform Engineer'); await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Platform Engineer' }).first()).toBeVisible();
  await page.route('**/api/analyses/analysis-1', (route) => route.fulfill({ status: 204 })); page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click(); await expect(page).toHaveURL(/\/history$/);
});
