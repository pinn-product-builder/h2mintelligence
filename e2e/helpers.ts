import { Page, expect } from '@playwright/test';

export const TEST_USER = {
  email: 'admin@h2m.com',
  password: '123456',
};

export async function login(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const emailInput = page.locator('input[type="email"]');
  const isLoginPage = await emailInput.isVisible({ timeout: 3000 }).catch(() => false);

  if (isLoginPage) {
    await emailInput.fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
  }

  await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
}

export async function navigateToSection(page: Page, sectionName: string) {
  const sidebarButton = page.locator('aside button, nav button, [role="button"]').filter({ hasText: sectionName });
  await sidebarButton.first().click();
  await page.waitForTimeout(800);
}
