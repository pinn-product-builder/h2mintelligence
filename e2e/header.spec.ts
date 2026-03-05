import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('deve exibir o header com título', async ({ page }) => {
    await expect(page.locator('header h1')).toBeVisible();
  });

  test('deve ter campo de busca no header', async ({ page }) => {
    const searchInput = page.locator('header input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible();
  });

  test('deve executar busca via Enter', async ({ page }) => {
    const searchInput = page.locator('header input[placeholder*="Buscar"]');
    await searchInput.fill('faturamento');
    await searchInput.press('Enter');
    await page.waitForTimeout(1500);
    await expect(page.locator('h1')).toContainText(/OKR/i);
  });

  test('deve abrir dropdown de notificações ao clicar no sino', async ({ page }) => {
    const bellButton = page.locator('header button:has(svg.lucide-bell)');
    const altBell = page.locator('header button').filter({ has: page.locator('svg') }).first();
    const btn = await bellButton.isVisible().catch(() => false) ? bellButton : altBell;
    await btn.click();
    await page.waitForTimeout(1000);
    const menuVisible = await page.locator('[role="menu"], [role="menuitem"]').first().isVisible().catch(() => false);
    expect(menuVisible).toBeTruthy();
  });

  test('deve abrir menu do usuário e ver opção Sair', async ({ page }) => {
    const userBtn = page.locator('header button').last();
    await userBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="menuitem"]').filter({ hasText: /Sair/i })).toBeVisible({ timeout: 3000 });
  });
});
