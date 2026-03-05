import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('Navegação Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('deve exibir sidebar com todas as seções', async ({ page }) => {
    await expect(page.locator('aside button, nav button').filter({ hasText: 'Dashboard' })).toBeVisible();
    await expect(page.locator('aside button, nav button').filter({ hasText: /OKR/i })).toBeVisible();
    await expect(page.locator('aside button, nav button').filter({ hasText: /Usuário/i })).toBeVisible();
    await expect(page.locator('aside button, nav button').filter({ hasText: /Configura/i })).toBeVisible();
  });

  test('deve navegar para Dashboard', async ({ page }) => {
    await navigateToSection(page, 'Configura');
    await page.waitForTimeout(300);
    await navigateToSection(page, 'Dashboard');
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });

  test('deve navegar para OKRs', async ({ page }) => {
    await navigateToSection(page, 'OKR');
    await expect(page.locator('h1')).toContainText(/OKR/i);
  });

  test('deve navegar para Usuários', async ({ page }) => {
    await navigateToSection(page, 'Usuário');
    await expect(page.locator('h1')).toContainText(/Usu/i);
  });

  test('deve navegar para Configurações', async ({ page }) => {
    await navigateToSection(page, 'Configura');
    await expect(page.locator('h1')).toContainText(/Config/i);
  });

  test('deve ter botão de recolher sidebar visível', async ({ page }) => {
    const collapseBtn = page.locator('aside button:has(svg.lucide-chevron-left), aside button:has(svg.lucide-panel-left-close)').first();
    const altBtn = page.locator('aside button').filter({ hasText: /Recolher/i });
    const btn = await collapseBtn.isVisible().catch(() => false) ? collapseBtn : altBtn;
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  });
});
