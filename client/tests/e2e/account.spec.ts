import { expect, test } from '@playwright/test';
import { authenticate, user } from './fixtures';

test('updates profile and changes password', async ({ page }) => {
  await authenticate(page);
  await page.route('**/api/auth/profile', async (route) => route.fulfill({ json: { data: { user: { ...user, ...(await route.request().postDataJSON()) }, token: 'updated-token' } } }));
  await page.route('**/api/auth/password', (route) => route.fulfill({ status: 204 }));
  await page.goto('/account');
  await page.getByLabel('Name').fill('Emanuel Costa'); await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Profile updated successfully.')).toBeVisible();
  await page.getByLabel('Current password').fill('old-password'); await page.getByLabel('New password', { exact: true }).fill('new-password'); await page.getByLabel('Confirm new password').fill('new-password');
  await page.getByRole('button', { name: 'Update password' }).click();
  await expect(page.getByText('Password updated successfully.')).toBeVisible();
});
