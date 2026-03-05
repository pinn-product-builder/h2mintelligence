import { test as setup, expect } from '@playwright/test';
import { TEST_USER } from './helpers';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 10000 });

  await emailInput.fill(TEST_USER.email);
  await page.locator('input[type="password"]').fill(TEST_USER.password);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.context().storageState({ path: authFile });
});
