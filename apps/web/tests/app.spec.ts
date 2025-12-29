import { expect } from '@playwright/test';
import test from './fixtures/test-user';

// Teste 6: Visualização de comunicado

test('usuário visualiza comunicado', async ({ page, testUser }) => {
  await page.goto('/login');
  await page.fill('input[placeholder="Digite seu e-mail"]', testUser.email);
  await page.fill('input[placeholder="Digite sua senha"]', testUser.password);
  await page.click('button:has-text("Entrar")');
  await expect(page.locator('text=Bem-vindo')).toBeVisible({ timeout: 10000 });
  await page.click('[data-testid="nav-comunicados"], [data-testid="quickaccess-comunicados"]');
  await expect(page.locator('h1')).toHaveText(/Comunicados/i);
  await expect(page.locator('.comunicado-item')).toBeVisible();
});

// Teste 7: Visualização de taxas

test('usuário visualiza taxas', async ({ page, testUser }) => {
  await page.goto('/login');
  await page.fill('input[placeholder="Digite seu e-mail"]', testUser.email);
  await page.fill('input[placeholder="Digite sua senha"]', testUser.password);
  await page.click('button:has-text("Entrar")');
  await expect(page.locator('text=Bem-vindo')).toBeVisible({ timeout: 10000 });
  await page.click('[data-testid="nav-taxas"], [data-testid="quickaccess-taxas"]');
  await expect(page.locator('h1')).toHaveText(/Taxas/i);
  await expect(page.locator('.taxa-item')).toBeVisible();
});

// Teste 8: Visualização de prestação de contas

test('usuário visualiza prestação de contas', async ({ page, testUser }) => {
  await page.goto('/login');
  await page.fill('input[placeholder="Digite seu e-mail"]', testUser.email);
  await page.fill('input[placeholder="Digite sua senha"]', testUser.password);
  await page.click('button:has-text("Entrar")');
  await expect(page.locator('text=Bem-vindo')).toBeVisible({ timeout: 10000 });
  await page.click('[data-testid="nav-prestacao-contas"], [data-testid="quickaccess-prestacao-contas"]');
  await expect(page.locator('h1')).toHaveText(/Prestação de Contas/i);
  await expect(page.locator('.prestacao-item')).toBeVisible();
});

// Teste 9: Visualização de ocorrências

test('usuário visualiza ocorrências', async ({ page, testUser }) => {
  await page.goto('/login');
  await page.fill('input[placeholder="Digite seu e-mail"]', testUser.email);
  await page.fill('input[placeholder="Digite sua senha"]', testUser.password);
  await page.click('button:has-text("Entrar")');
  await expect(page.locator('text=Bem-vindo')).toBeVisible({ timeout: 10000 });
  await page.click('[data-testid="nav-ocorrencias"], [data-testid="quickaccess-ocorrencias"]');
  await expect(page.locator('h1')).toHaveText(/Ocorrências/i);
  await expect(page.locator('.ocorrencia-item')).toBeVisible();
});

// Teste 10: Visualização de integrações

test('usuário visualiza integrações', async ({ page, testUser }) => {
  await page.goto('/login');
  await page.fill('input[placeholder="Digite seu e-mail"]', testUser.email);
  await page.fill('input[placeholder="Digite sua senha"]', testUser.password);
  await page.click('button:has-text("Entrar")');
  await expect(page.locator('text=Bem-vindo')).toBeVisible({ timeout: 10000 });
  await page.click('[data-testid="nav-integracoes"], [data-testid="quickaccess-integracoes"]');
  await expect(page.locator('h1')).toHaveText(/Integrações/i);
  await expect(page.locator('.integracao-item')).toBeVisible();
});
