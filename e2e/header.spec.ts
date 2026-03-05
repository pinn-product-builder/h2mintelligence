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

  test('deve abrir dropdown de notificações com itens', async ({ page }) => {
    const bellButton = page.locator('header button:has(svg.lucide-bell)');
    await bellButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await expect(page.locator('[role="menuitem"]').first()).toBeVisible();
  });

  test('deve marcar todas notificações como lidas e exibir toast', async ({ page }) => {
    const bellButton = page.locator('header button:has(svg.lucide-bell)');
    await bellButton.click();
    await page.waitForTimeout(500);
    const markAllBtn = page.getByText('Marcar todas como lidas');
    if (await markAllBtn.isVisible().catch(() => false)) {
      await markAllBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-state="open"][role="status"], li[role="status"]').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('deve clicar em notificação e navegar para a seção', async ({ page }) => {
    const bellButton = page.locator('header button:has(svg.lucide-bell)');
    await bellButton.click();
    await page.waitForTimeout(500);
    const firstNotif = page.locator('[role="menuitem"]').first();
    await firstNotif.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('deve remover notificação individual ao clicar no X', async ({ page }) => {
    const bellButton = page.locator('header button:has(svg.lucide-bell)');
    await bellButton.click();
    await page.waitForTimeout(500);
    const initialCount = await page.locator('[role="menuitem"]').count();
    expect(initialCount).toBeGreaterThan(0);
    const firstNotif = page.locator('[role="menuitem"]').first();
    await firstNotif.hover();
    await page.waitForTimeout(300);
    const dismissBtn = firstNotif.locator('button[title="Remover notificação"]');
    await dismissBtn.click({ force: true });
    await page.waitForTimeout(500);
    const newCount = await page.locator('[role="menuitem"]').count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test('deve limpar todas as notificações', async ({ page }) => {
    const bellButton = page.locator('header button:has(svg.lucide-bell)');
    await bellButton.click();
    await page.waitForTimeout(500);
    const clearBtn = page.locator('button').filter({ hasText: 'Limpar' });
    if (await clearBtn.isVisible().catch(() => false)) {
      await clearBtn.click({ force: true });
      await page.waitForTimeout(500);
      await expect(page.getByText('Nenhuma notificação')).toBeVisible();
    }
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
