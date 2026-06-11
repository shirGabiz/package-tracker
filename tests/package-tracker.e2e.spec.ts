import { expect, test } from '@playwright/test';

test('adds a package from the browser flow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Package Tracker' })).toBeVisible();
  await page.getByRole('button', { name: /add package/i }).click();

  await expect(page.getByRole('heading', { name: /add a new package/i })).toBeVisible();
  await page.getByRole('textbox').fill('Dog food delivery from Amazon');
  await page.getByRole('button', { name: /save package/i }).click();

  await expect(page.getByText('Dog food delivery from Amazon')).toBeVisible();
});
