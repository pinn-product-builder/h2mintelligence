import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('Usuários', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToSection(page, 'Usuário');
  });

  test('deve exibir seção de usuários', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Usu/i);
  });

  test('deve ter campo de busca de usuários', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="usuário"]');
    await expect(searchInput).toBeVisible();
  });

  test('deve ter botão de novo usuário', async ({ page }) => {
    const newUserBtn = page.locator('button').filter({ hasText: /Novo Usu/i });
    await expect(newUserBtn).toBeVisible();
  });

  test('deve abrir dialog de novo usuário', async ({ page }) => {
    await page.locator('button').filter({ hasText: /Novo Usu/i }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('deve buscar usuários', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="usuário"]');
    await searchInput.fill('admin');
    await page.waitForTimeout(500);
  });
});
