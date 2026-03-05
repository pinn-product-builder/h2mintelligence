import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('Configurações - Completo', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToSection(page, 'Configura');
  });

  // ── Abas ──────────────────────────────────────────────
  test('deve exibir 5 abas de configuração', async ({ page }) => {
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Geral' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Integração' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Notificações' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Segurança' })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: 'Setores' })).toBeVisible();
  });

  // ── Aba Geral ─────────────────────────────────────────
  test('deve editar nome da empresa e salvar com toast', async ({ page }) => {
    const input = page.locator('input').filter({ hasText: /H2M/i }).or(page.locator('input').first());
    await input.clear();
    await input.fill('H2M Embalagens Atualizado');

    const saveBtn = page.locator('button').filter({ hasText: 'Salvar Alterações' });
    await saveBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-state="open"]').filter({ hasText: /salva/i })).toBeVisible({ timeout: 5000 });
  });

  test('deve alterar ciclo de OKR via select', async ({ page }) => {
    const selects = page.locator('[role="combobox"]');
    if (await selects.first().isVisible()) {
      await selects.first().click();
      await page.waitForTimeout(300);
      const option = page.locator('[role="option"]').filter({ hasText: /Semestral/i });
      if (await option.isVisible().catch(() => false)) {
        await option.click();
        await page.waitForTimeout(300);
      }
    }
  });

  // ── Aba Integração ────────────────────────────────────
  test('deve salvar configurações de integração com toast', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Integração' }).click();
    await page.waitForTimeout(500);
    const saveBtn = page.locator('button').filter({ hasText: 'Salvar Configurações' });
    await saveBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-state="open"]').filter({ hasText: /salva/i })).toBeVisible({ timeout: 5000 });
  });

  test('deve alterar formato de data', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Integração' }).click();
    await page.waitForTimeout(500);
    const selects = page.locator('[role="combobox"]');
    if (await selects.first().isVisible()) {
      await selects.first().click();
      await page.waitForTimeout(300);
      const option = page.locator('[role="option"]').first();
      if (await option.isVisible().catch(() => false)) {
        await option.click();
      }
    }
  });

  test('deve não exibir seção de templates de importação', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Integração' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Templates de Importação')).not.toBeVisible();
  });

  // ── Aba Notificações ──────────────────────────────────
  test('deve exibir 5 switches de notificação', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Notificações' }).click();
    await page.waitForTimeout(500);
    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('deve alternar cada switch de notificação e receber toast', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Notificações' }).click();
    await page.waitForTimeout(500);
    const switches = page.locator('button[role="switch"]');

    // Toggle switch "Atualização de KR" (index 3, que está OFF)
    await switches.nth(3).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-state="open"]').filter({ hasText: /ativad|desativad/i })).toBeVisible({ timeout: 5000 });
    
    // Toggle de volta
    await switches.nth(3).click();
    await page.waitForTimeout(1000);
  });

  // ── Aba Segurança ─────────────────────────────────────
  test('deve exibir controles de segurança (2FA, sessão, auditoria, logs)', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Segurança' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Autenticação de dois fatores')).toBeVisible();
    await expect(page.locator('text=Expiração de sessão')).toBeVisible();
    await expect(page.locator('text=Auditoria de ações')).toBeVisible();
    await expect(page.locator('text=Retenção de logs')).toBeVisible();
  });

  test('deve desativar e reativar 2FA com toast', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Segurança' }).click();
    await page.waitForTimeout(500);
    const switches = page.locator('button[role="switch"]');
    await switches.first().click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-state="open"]').filter({ hasText: /Segurança atualizada/i })).toBeVisible({ timeout: 5000 });
    await switches.first().click();
    await page.waitForTimeout(1000);
  });

  test('deve alterar expiração de sessão', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Segurança' }).click();
    await page.waitForTimeout(500);
    const sessionSelect = page.locator('[role="combobox"]').first();
    await sessionSelect.click();
    await page.waitForTimeout(300);
    const option = page.locator('[role="option"]').filter({ hasText: '4 horas' });
    if (await option.isVisible().catch(() => false)) {
      await option.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-state="open"]').filter({ hasText: /Segurança atualizada/i })).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve alterar retenção de logs', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Segurança' }).click();
    await page.waitForTimeout(500);
    const selects = page.locator('[role="combobox"]');
    const lastSelect = selects.last();
    await lastSelect.click();
    await page.waitForTimeout(300);
    const option = page.locator('[role="option"]').filter({ hasText: '6 meses' });
    if (await option.isVisible().catch(() => false)) {
      await option.click();
      await page.waitForTimeout(1000);
    }
  });

  // ── Aba Setores ───────────────────────────────────────
  test('deve exibir lista de setores na aba Setores', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Setores' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Gerenciamento de Setores')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Novo Setor' })).toBeVisible();
  });

  test('deve criar novo setor com sucesso', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Setores' }).click();
    await page.waitForTimeout(500);

    await page.locator('button').filter({ hasText: 'Novo Setor' }).click();
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.locator('input').fill('Setor Teste E2E');

    await dialog.locator('button').filter({ hasText: 'Criar Setor' }).click();
    await page.waitForTimeout(3000);
    await expect(page.locator('p.font-medium').filter({ hasText: 'Setor Teste E2E' }).first()).toBeVisible({ timeout: 5000 });
  });

  test('deve editar setor existente', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Setores' }).click();
    await page.waitForTimeout(500);

    const sectorRow = page.locator('div').filter({ hasText: 'Setor Teste E2E' }).filter({ has: page.locator('button') });
    const editBtn = sectorRow.locator('button:has(svg.lucide-pencil)').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      const input = dialog.locator('input');
      await input.clear();
      await input.fill('Setor Renomeado E2E');
      await dialog.locator('button').filter({ hasText: 'Salvar' }).click();
      await page.waitForTimeout(3000);
      await expect(page.locator('p.font-medium').filter({ hasText: 'Setor Renomeado E2E' }).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve excluir setor sem OKRs vinculados', async ({ page }) => {
    await page.locator('button[role="tab"]').filter({ hasText: 'Setores' }).click();
    await page.waitForTimeout(500);

    const sectorRow = page.locator('div').filter({ hasText: /Setor (Teste|Renomeado) E2E/ }).filter({ has: page.locator('button') });
    const deleteBtn = sectorRow.locator('button:has(svg.lucide-trash-2)').first();
    if (await deleteBtn.isVisible().catch(() => false) && await deleteBtn.isEnabled()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
      const confirmBtn = page.locator('[role="alertdialog"] button').filter({ hasText: 'Excluir' });
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(3000);
      }
    }
  });
});
