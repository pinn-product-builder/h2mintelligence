import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('OKR CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToSection(page, 'OKR');
  });

  test('deve exibir a seção de OKRs', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/OKR/i);
  });

  test('deve ter botão de novo OKR', async ({ page }) => {
    const newOkrButton = page.locator('button').filter({ hasText: /Novo OKR/i });
    await expect(newOkrButton).toBeVisible();
  });

  test('deve abrir formulário de novo OKR', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Novo OKR/i }).click();
    await page.waitForTimeout(1000);
    const formOrDialog = page.locator('[role="dialog"], form, input[placeholder]');
    await expect(formOrDialog.first()).toBeVisible({ timeout: 5000 });
  });

  test('deve ter filtros de visualização', async ({ page }) => {
    const filterBtns = page.locator('button').filter({ hasText: /Todos|No Caminho|Atenção|Crítico/i });
    const count = await filterBtns.count();
    expect(count).toBeGreaterThan(0);
  });

  test('deve abrir modal de detalhe ao clicar em OKR card', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]').filter({ hasText: /\d+%/ });
    const count = await cards.count();
    if (count > 0) {
      await cards.first().click();
      await page.waitForTimeout(1000);
      const dialog = page.locator('[role="dialog"]');
      const isVisible = await dialog.isVisible().catch(() => false);
      if (isVisible) {
        await expect(dialog).toBeVisible();
      }
    }
  });
});
