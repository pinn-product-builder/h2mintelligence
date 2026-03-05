import { test, expect } from '@playwright/test';
import { login, navigateToSection } from './helpers';

test.describe('Navegação', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('deve navegar para seção OKRs via sidebar', async ({ page }) => {
    await navigateToSection(page, 'OKR');
    await expect(page.locator('h1')).toContainText(/OKR/i);
  });

  test('deve navegar para seção Data Source via sidebar', async ({ page }) => {
    await navigateToSection(page, 'Data Source');
    await expect(page.locator('h1')).toContainText(/Data Source/i);
  });

  test('deve navegar para seção Usuários via sidebar', async ({ page }) => {
    await navigateToSection(page, 'Usuário');
    await expect(page.locator('h1')).toContainText(/Usu/i);
  });

  test('deve navegar para seção Configurações via sidebar', async ({ page }) => {
    await navigateToSection(page, 'Configura');
    await expect(page.locator('h1')).toContainText(/Config/i);
  });

  test('deve voltar ao Dashboard via sidebar', async ({ page }) => {
    await navigateToSection(page, 'Configura');
    await page.waitForTimeout(300);
    await navigateToSection(page, 'Dashboard');
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });
});
