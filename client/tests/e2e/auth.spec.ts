import { expect, test } from '@playwright/test';
import { user } from './fixtures';

test('redirects guests and signs in', async ({ page }) => {
  await page.route('**/api/auth/login', (route) => route.fulfill({ json: { data: { user, token: 'signed-token' } } }));
  await page.goto('/history');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'cvAnalyzer' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('cv-analyzer:access-token'))).toBe('signed-token');
});

test('creates a new account', async ({ page }) => {
  await page.route('**/api/auth/register', (route) => route.fulfill({ status: 201, json: { data: { user, token: 'new-token' } } }));
  await page.goto('/login');
  await page.getByRole('button', { name: 'New here? Create an account' }).click();
  await page.getByLabel('Name').fill(user.name); await page.getByLabel('Email').fill(user.email); await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});
