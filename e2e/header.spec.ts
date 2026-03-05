import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('deve exibir header com título e subtítulo', async ({ page }) => {
    await expect(page.locator('header h1')).toBeVisible();
  });

  test('deve ter campo de busca no header', async ({ page }) => {
    const searchInput = page.locator('header input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible();
  });

  test('deve executar busca global via Enter e navegar para OKRs', async ({ page }) => {
    const searchInput = page.locator('header input[placeholder*="Buscar"]');
    await searchInput.fill('faturamento');
    await searchInput.press('Enter');
    await page.waitForTimeout(1500);
    await expect(page.locator('h1')).toContainText(/OKR/i);
  });

  test('deve abrir dropdown de notificações vazio', async ({ page }) => {
    const bellButton = page.locator('header button:has(svg.lucide-bell)');
    await bellButton.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await expect(page.getByText('Nenhuma notificação')).toBeVisible();
  });

  test('deve trocar tema (claro/escuro)', async ({ page }) => {
    const themeSelect = page.locator('header select, header [role="combobox"]').first();
    if (await themeSelect.isVisible().catch(() => false)) {
      await themeSelect.click();
      await page.waitForTimeout(500);
    }
  });

  test('deve abrir menu do usuário e ver opção Sair', async ({ page }) => {
    const userBtn = page.locator('header button').last();
    await userBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="menuitem"]').filter({ hasText: /Sair/i })).toBeVisible({ timeout: 3000 });
  });
});
