// Utilitários para criação e remoção de usuário de teste para Playwright
// Roadmap: apps/web/tests/utils/testUserUtils.ts

import { v4 as uuidv4 } from 'uuid';

export async function createTestUser(): Promise<{
  id: string;
  email: string;
  password: string;
  nome: string;
  condominio_id: string;
}> {
  // Exemplo: criar usuário via API ou diretamente no banco de dados
  const id = uuidv4();
  const email = `testuser_${id}@example.com`;
  const password = 'Test@1234';
  const nome = 'Test User';
  const condominio_id = 'test-condominio-id';
  // TODO: Implementar criação real no banco ou API
  return { id, email, password, nome, condominio_id };
}

export async function deleteTestUser(userId: string): Promise<void> {
  // TODO: Implementar remoção real no banco ou API
}
