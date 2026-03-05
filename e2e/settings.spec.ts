import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('Configurações', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToSection(page, 'Configura');
  });

  test('deve exibir abas de configuração', async ({ page }) => {
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Geral' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Integração' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Notificações' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Segurança' })).toBeVisible();
  });

  test('deve salvar alterações da aba Geral', async ({ page }) => {
    const saveBtn = page.locator('button').filter({ hasText: 'Salvar Alterações' });
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click({ force: true });
    await page.waitForTimeout(1500);
  });

  test('deve navegar para aba Integração e salvar', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Integração' }).click();
    await page.waitForTimeout(500);
    const saveBtn = page.locator('button').filter({ hasText: 'Salvar Configurações' });
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click({ force: true });
    await page.waitForTimeout(1500);
  });

  test('deve clicar em template de importação sem erro', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Integração' }).click();
    await page.waitForTimeout(500);

    const templateBtn = page.locator('button').filter({ hasText: 'Faturamento' });
    await expect(templateBtn).toBeVisible({ timeout: 5000 });
    await templateBtn.click({ force: true });
    await page.waitForTimeout(1500);

    const templates = ['Custos Operacionais', 'Estoque', 'Metas OKR', 'Leads Marketing'];
    for (const t of templates) {
      const btn = page.locator('button').filter({ hasText: t });
      await expect(btn).toBeVisible();
    }
  });

  test('deve alternar switches de notificação', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Notificações' }).click();
    await page.waitForTimeout(500);

    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(5);

    await switches.first().click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('deve alternar switches de segurança', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Segurança' }).click();
    await page.waitForTimeout(500);

    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(2);

    await switches.first().click({ force: true });
    await page.waitForTimeout(1000);
  });
});
