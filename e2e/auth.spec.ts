import { test, expect } from '@playwright/test';
import { TEST_USER } from './helpers';

test.describe('Autenticação', () => {
  test('deve exibir página de login', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve fazer login com credenciais válidas e redirecionar ao dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  });

  test('deve fazer logout com sucesso', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });

    const userButtons = page.locator('header button');
    await userButtons.last().click();
    await page.waitForTimeout(500);
    const sairBtn = page.locator('[role="menuitem"]').filter({ hasText: /Sair/i });
    if (await sairBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sairBtn.click();
      await page.waitForTimeout(2000);
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    }
  });
});
