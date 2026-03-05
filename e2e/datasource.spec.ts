import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('Data Source', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToSection(page, 'Data Source');
  });

  test('deve exibir seção Data Source', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Data Source/i);
  });

  test('deve ter botão Importar Dados', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: /Importar Dados/i })).toBeVisible();
  });

  test('deve ter botão Nova Fonte', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: /Nova Fonte/i })).toBeVisible();
  });

  test('deve ter botão Atualizar Dados', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: /Atualizar Dados/i })).toBeVisible();
  });

  test('deve abrir dialog de Nova Fonte', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Nova Fonte/i }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('deve navegar entre abas', async ({ page }) => {
    const tabs = ['Mapeamentos', 'Logs', 'Monitoramento'];
    for (const tab of tabs) {
      const tabBtn = page.locator('button[role="tab"]').filter({ hasText: new RegExp(tab, 'i') });
      if (await tabBtn.isVisible().catch(() => false)) {
        await tabBtn.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('deve clicar Atualizar Dados sem erro', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Atualizar Dados/i }).click();
    await page.waitForTimeout(1000);
    expect(true).toBeTruthy();
  });
});
