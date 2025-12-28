import { expect, test } from '@playwright/test';

test('login happy path', async ({ page }) => {
  // Go to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('/home');

  // Verify we're on the dashboard
  await expect(page).toHaveURL('/home');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});

test('visualizar dashboard após login', async ({ page }) => {
  // Assume user is logged in, go to home
  await page.goto('/home');

  // Check for key dashboard elements
  await expect(page.locator('text=Bem-vindo')).toBeVisible();
  await expect(page.locator('text=Norma')).toBeVisible();
});
