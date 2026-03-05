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

  test('deve salvar alterações da aba Geral com toast', async ({ page }) => {
    const saveBtn = page.locator('button').filter({ hasText: 'Salvar Alterações' });
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-state="open"]').filter({ hasText: /salva/i })).toBeVisible({ timeout: 5000 });
  });

  test('deve salvar configurações da aba Integração com toast', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Integração' }).click();
    await page.waitForTimeout(500);
    const saveBtn = page.locator('button').filter({ hasText: 'Salvar Configurações' });
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-state="open"]').filter({ hasText: /salva/i })).toBeVisible({ timeout: 5000 });
  });

  test('deve clicar em template de importação sem erro', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Integração' }).click();
    await page.waitForTimeout(500);

    const templateBtn = page.locator('button').filter({ hasText: 'Faturamento' });
    await expect(templateBtn).toBeVisible({ timeout: 5000 });
    await templateBtn.click();
    await page.waitForTimeout(1500);

    const templates = ['Custos Operacionais', 'Estoque', 'Metas OKR', 'Leads Marketing'];
    for (const t of templates) {
      const btn = page.locator('button').filter({ hasText: t });
      await expect(btn).toBeVisible();
    }
  });

  test('deve alternar switch de notificação e exibir toast', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Notificações' }).click();
    await page.waitForTimeout(500);

    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(5);

    await switches.nth(3).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-state="open"]').filter({ hasText: /ativad|desativad/i })).toBeVisible({ timeout: 5000 });
  });

  test('deve alternar switch de segurança (2FA) e exibir toast', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Segurança' }).click();
    await page.waitForTimeout(500);

    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(2);

    await switches.first().click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-state="open"]').filter({ hasText: /Segurança atualizada/i })).toBeVisible({ timeout: 5000 });
  });

  test('deve criar novo setor na aba Setores', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Setores' }).click();
    await page.waitForTimeout(500);

    await page.locator('button').filter({ hasText: 'Novo Setor' }).click();
    await page.waitForTimeout(500);

    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    const input = page.locator('[role="dialog"] input');
    await input.fill('Setor Teste E2E');

    await page.locator('[role="dialog"] button').filter({ hasText: 'Criar Setor' }).click();
    await page.waitForTimeout(2000);

    await expect(page.locator('text=Setor Teste E2E')).toBeVisible({ timeout: 5000 });
  });

  test('deve editar setor existente', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Setores' }).click();
    await page.waitForTimeout(500);

    const sectorRow = page.locator('div').filter({ hasText: 'Setor Teste E2E' }).first();
    const editBtn = sectorRow.locator('button').filter({ has: page.locator('svg.lucide-pencil') });
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      const input = dialog.locator('input');
      await input.clear();
      await input.fill('Setor Renomeado E2E');
      await dialog.locator('button').filter({ hasText: 'Salvar' }).click();
      await page.waitForTimeout(2000);
      await expect(page.locator('text=Setor Renomeado E2E')).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve excluir setor sem OKRs', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Setores' }).click();
    await page.waitForTimeout(500);

    const sectorRow = page.locator('div').filter({ hasText: /Setor (Teste|Renomeado) E2E/ }).first();
    const deleteBtn = sectorRow.locator('button.text-destructive, button:has(svg.lucide-trash-2)');
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
      const confirmBtn = page.locator('[role="alertdialog"] button').filter({ hasText: 'Excluir' });
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
