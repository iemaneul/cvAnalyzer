import { expect, test } from '@playwright/test';
import { analysis, authenticate } from './fixtures';

test('submits a resume analysis and renders its score', async ({ page }) => {
  await authenticate(page);
  await page.route('**/api/analyze', (route) => route.fulfill({ status: 201, json: { data: analysis } }));
  await page.goto('/');
  await page.getByLabel(/Job title/).fill(analysis.jobTitle); await page.getByLabel('Job description').fill(analysis.jobDescription);
  await page.locator('input[type=file]').setInputFiles({ name: 'resume.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF test') });
  await page.getByRole('button', { name: 'Analyze Resume' }).click();
  await expect(page.getByText('82%').first()).toBeVisible(); await expect(page.getByText('Good Match')).toBeVisible();
});
