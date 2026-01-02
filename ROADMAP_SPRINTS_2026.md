# VERSIX NORMA - Roadmap de Sprints 2026

## Plano para Atingir Production Readiness 5.0/5.0

**Data de Início:** 02/01/2026
**Meta Final:** Reduzir erros TypeScript de 206 para <10 e atingir rating 5.0/5.0
**Duração Total Estimada:** 8 semanas (4 sprints de 2 semanas)

---

## 📊 Estado Atual vs Meta

| Métrica                   | Atual      | Meta         | Gap        |
| ------------------------- | ---------- | ------------ | ---------- |
| **Erros TypeScript**      | 206        | < 10         | -196 erros |
| **Cumprimento Auditoria** | 70%        | 100%         | +30%       |
| **Production Readiness**  | 4.2/5.0    | 5.0/5.0      | +0.8       |
| **Cobertura de Testes**   | ~5%        | 70%          | +65%       |
| **Tipos FormData**        | 6 parciais | 15 completos | +9 tipos   |

---

## 🎯 Sprint 1 (Semanas 1-2): Fundação de Tipos

### Objetivo: Eliminar 120 erros de tipos incompletos (58% dos erros)

**Data:** 02/01/2026 - 15/01/2026
**Responsável:** Tech Lead + Frontend Sênior
**Prioridade:** 🔴 CRÍTICA

### 📋 Tarefas

#### 1.1 Completar NotificacaoDashboard [8h]

**Impacto:** Resolve ~40 erros (19%)

```typescript
// packages/shared/src/types/derived.ts
export interface NotificacaoDashboard {
  id: string; // ✅ já existe
  titulo: string; // 🔴 ADICIONAR
  tipo: TipoNotificacao; // 🔴 ADICIONAR
  created_at: string; // 🔴 ADICIONAR
  notificacao: Notificacao; // ✅ já existe
  stats: {
    total_enviadas: number;
    total_entregues: number;
    total_lidas: number;
    taxa_abertura: number;
  };
  entregas?: NotificacaoEntrega[];
  percentual_leitura?: number; // 🔴 ADICIONAR
  total_destinatarios?: number; // 🔴 ADICIONAR
  total_lidos?: number; // 🔴 ADICIONAR
  total_falhas?: number; // 🔴 ADICIONAR
}
```

**Arquivos Afetados:**

- `packages/shared/src/types/derived.ts`
- `apps/web/src/app/sindico/comunicacao/page.tsx` (25+ erros)

**Validação:**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep "NotificacaoDashboard" | wc -l
# Esperado: 0
```

---

#### 1.2 Completar Tipos FormData [12h]

**Impacto:** Resolve ~50 erros (24%)

**1.2.1 OcorrenciaFormData**

```typescript
export interface OcorrenciaFormData {
  categoria?: OcorrenciaCategoria;
  titulo?: string;
  descricao?: string;
  prioridade?: Prioridade;
  localizacao?: string;
  local_descricao?: string; // 🔴 ADICIONAR
  anonimo?: boolean; // 🔴 ADICIONAR
  unidade_id?: string;
  anexos?: Anexo[];
}
```

**1.2.2 AssembleiaFormData**

```typescript
export interface AssembleiaFormData {
  tipo?: AssembleiaTipo;
  titulo?: string;
  data_inicio?: string;
  data_primeira_convocacao?: string; // 🔴 ADICIONAR
  data_segunda_convocacao?: string; // 🔴 ADICIONAR
  data_fim?: string;
  descricao?: string;
  local?: string;
  local_presencial?: string; // 🔴 ADICIONAR
  quorum_percentual?: number;
  quorum_minimo_primeira?: number; // 🔴 ADICIONAR
  quorum_minimo_segunda?: number; // 🔴 ADICIONAR
  permite_procuracao?: boolean; // 🔴 ADICIONAR
  max_procuracoes_por_pessoa?: number; // 🔴 ADICIONAR
}
```

**1.2.3 ComunicadoFormData**

```typescript
export interface ComunicadoFormData {
  titulo?: string;
  corpo?: string;
  categoria?: ComunicadoCategoria;
  prioridade?: PrioridadeComunicado;
  fixado?: boolean;
  destaque?: boolean;
  anexos?: Anexo[];
  tags?: string[]; // 🔴 ADICIONAR
}
```

**1.2.4 LancamentoFormData**

```typescript
export interface LancamentoFormData {
  tipo?: 'receita' | 'despesa';
  valor?: number;
  status?: LancamentoStatus;
  conta_bancaria_id?: string;
  categoria_id?: string;
  data_competencia?: string;
  data_vencimento?: string;
  descricao?: string;
  fornecedor?: string; // 🔴 ADICIONAR
  numero_documento?: string; // 🔴 ADICIONAR
  anexos?: Anexo[];
}
```

**Arquivos Afetados:**

- `packages/shared/src/types/derived.ts`
- `apps/web/src/app/ocorrencias/page.tsx` (20+ erros)
- `apps/web/src/app/sindico/assembleias/page.tsx` (15+ erros)
- `apps/web/src/app/sindico/financeiro/page.tsx` (10+ erros)

**Validação:**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep "FormData" | wc -l
# Esperado: < 5
```

---

#### 1.3 Adicionar serializeAnexos em useOcorrencias [2h]

**Impacto:** Resolve ~5 erros

```typescript
// apps/web/src/hooks/useOcorrencias.ts
import { parseAnexos, serializeAnexos } from '@/lib/type-helpers';

// Em criar:
const insertData: CreateOcorrenciaInput = {
  ...input,
  anexos: serializeAnexos(input.anexos),
  condominio_id: condominioId,
};

// Em atualizar:
const updateData: UpdateOcorrenciaInput = {
  ...input,
  anexos: input.anexos ? serializeAnexos(input.anexos) : undefined,
};
```

**Validação:**

```bash
grep -n "serializeAnexos" apps/web/src/hooks/useOcorrencias.ts | wc -l
# Esperado: >= 2
```

---

### 📊 Métricas Sprint 1

| Métrica             | Antes | Depois | Melhoria          |
| ------------------- | ----- | ------ | ----------------- |
| Erros TypeScript    | 206   | ~86    | -120 erros (-58%) |
| FormData Completos  | 6     | 10     | +4 tipos          |
| Hooks com serialize | 2/3   | 3/3    | 100%              |

### ✅ Definition of Done

- [ ] NotificacaoDashboard com todos os campos usados no código
- [ ] 4 tipos FormData completos e testados
- [ ] useOcorrencias usando serializeAnexos em create/update
- [ ] Erros TypeScript < 90
- [ ] Build passa sem erros críticos
- [ ] PR revisado e aprovado
- [ ] Documentação atualizada no TIPOS_GUIA.md

---

## 🎯 Sprint 2 (Semanas 3-4): Joins e Conversões

### Objetivo: Eliminar 60 erros de joins e conversões (29% dos erros)

**Data:** 16/01/2026 - 29/01/2026
**Responsável:** Backend Engineer + Frontend Sênior
**Prioridade:** 🔴 ALTA

### 📋 Tarefas

#### 2.1 Completar Tipos ComJoins [10h]

**Impacto:** Resolve ~35 erros (17%)

**2.1.1 ComunicadoLeituraComUsuario**

```typescript
export interface ComunicadoLeituraComUsuario extends ComunicadoLeitura {
  usuario?: Pick<Usuario, 'nome' | 'avatar_url' | 'email'>;
}
```

**2.1.2 ChamadoMensagemComAutor**

```typescript
export interface ChamadoMensagemComAutor extends ChamadoMensagem {
  autor?: Pick<Usuario, 'nome' | 'avatar_url'>;
  anexos_parsed?: Anexo[]; // Versão parseada dos anexos
}
```

**2.1.3 EmergenciaLogCompleto**
Usar `EmergenciaLogComDetalhes` consistentemente:

```typescript
// Garantir que hooks retornem EmergenciaLogComDetalhes
export function useEmergencias() {
  const [logs, setLogs] = useState<EmergenciaLogComDetalhes[]>([]);
  // ...
}
```

**2.1.4 NotificacaoEntregaComUsuario**

```typescript
export interface NotificacaoEntregaComUsuario extends NotificacaoEntrega {
  usuario?: Pick<Usuario, 'nome' | 'email' | 'telefone' | 'avatar_url'>;
}
```

**Arquivos Afetados:**

- `packages/shared/src/types/derived.ts`
- `apps/web/src/hooks/useComunicados.ts`
- `apps/web/src/hooks/useChamados.ts`
- `apps/web/src/hooks/useEmergencias.ts`
- `apps/web/src/app/sindico/comunicados/page.tsx`

**Validação:**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep -E "(usuario|autor) does not exist" | wc -l
# Esperado: 0
```

---

#### 2.2 Padronizar Conversão Json ↔ Anexo[] [8h]

**Impacto:** Resolve ~25 erros (12%)

**2.2.1 Atualizar useChamados**

```typescript
// Remover duplicação de campos
const insertData: CreateChamadoInput = {
  titulo: input.titulo,
  descricao: input.descricao,
  categoria: input.categoria,
  prioridade: input.prioridade,
  unidade_id: input.unidade_id,
  anexos: serializeAnexos(input.anexos),
  condominio_id: condominioId,
  solicitante_id: userId,
};
// Não fazer spread depois, evita "specified more than once"
```

**2.2.2 Padronizar em todos os hooks**

- useChamados.ts ✅ (já usa)
- useComunicados.ts ✅ (já usa)
- useOcorrencias.ts ⚠️ (Sprint 1)
- useAssembleias.ts 🔴 (adicionar)

**2.2.3 Criar helper para anexos em mensagens**

```typescript
// apps/web/src/lib/type-helpers.ts
export function serializeMensagemComAnexos<T extends { anexos?: Anexo[] }>(
  mensagem: T
): T & { anexos: Json } {
  return {
    ...mensagem,
    anexos: serializeAnexos(mensagem.anexos),
  };
}
```

**Arquivos Afetados:**

- `apps/web/src/hooks/useChamados.ts` (12+ erros)
- `apps/web/src/hooks/useOcorrencias.ts` (5+ erros)
- `apps/web/src/hooks/useComunicados.ts` (3+ erros)
- `apps/web/src/lib/type-helpers.ts`

**Validação:**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep -E "(Anexo\[\]|Json)" | wc -l
# Esperado: < 5
```

---

#### 2.3 Padronizar null vs undefined [4h]

**Impacto:** Resolve ~10 erros (5%)

**2.3.1 Criar helpers de conversão**

```typescript
// apps/web/src/lib/type-helpers.ts
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

export function undefinedToNull<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

export function safeStringValue(value: string | null | undefined): string {
  return value ?? '';
}
```

**2.3.2 Atualizar formulários**

```typescript
// Padrão para inputs:
<input
  value={form.campo ?? ''}  // Usar ?? ao invés de ||
  onChange={(e) => setForm({ ...form, campo: e.target.value || undefined })}
/>
```

**Arquivos Afetados:**

- `apps/web/src/app/sindico/assembleias/page.tsx` (null assignment)
- `apps/web/src/app/sindico/comunicacao/page.tsx`
- `apps/web/src/lib/type-helpers.ts`

**Validação:**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep -E "(null.*undefined|undefined.*null)" | wc -l
# Esperado: < 3
```

---

### 📊 Métricas Sprint 2

| Métrica            | Antes | Depois | Melhoria         |
| ------------------ | ----- | ------ | ---------------- |
| Erros TypeScript   | ~86   | ~26    | -60 erros (-70%) |
| Tipos ComJoins     | 10    | 14     | +4 tipos         |
| Hooks Padronizados | 3     | 6      | +3 hooks         |

### ✅ Definition of Done

- [ ] 4 tipos ComJoins adicionados e usados
- [ ] EmergenciaLogComDetalhes usado consistentemente
- [ ] serializeAnexos em todos os hooks de anexos
- [ ] Helpers de null/undefined implementados
- [ ] Erros TypeScript < 30
- [ ] Build passa completamente
- [ ] Testes unitários para type-helpers
- [ ] PR revisado e aprovado

---

## 🎯 Sprint 3 (Semanas 5-6): Testes e Qualidade

### Objetivo: Implementar cobertura de testes e resolver erros residuais

**Data:** 30/01/2026 - 12/02/2026
**Responsável:** Full Team
**Prioridade:** 🟠 MÉDIA-ALTA

### 📋 Tarefas

#### 3.1 Resolver Erros Residuais [8h]

**Impacto:** Resolve ~16 erros restantes

**3.1.1 Fixar duplicação de campos em useChamados**

```typescript
// Remover spread que causa duplicação
// ANTES:
const insertData = { ...input, condominio_id, solicitante_id };

// DEPOIS:
const { condominio_id: _, solicitante_id: __, ...rest } = input;
const insertData = { ...rest, condominio_id, solicitante_id };
```

**3.1.2 Corrigir SetStateAction incompatível**

```typescript
// Usar Partial<T> para updates
setForm((prev) => ({ ...prev, ...updates }) as OcorrenciaFormData);

// Ou garantir tipo completo
setForm({
  ...form,
  anonimo: value,
} satisfies OcorrenciaFormData);
```

**3.1.3 Adicionar tipos faltantes de webhook**

```typescript
export interface CreateWebhookInputFull {
  nome: string;
  url_destino: string;
  eventos: WebhookEvento[];
  headers_custom?: Record<string, string>;
  ativo?: boolean;
  descricao?: string;
}
```

**Validação:**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
# Esperado: < 10
```

---

#### 3.2 Testes Unitários de Hooks [16h]

**Impacto:** Cobertura de testes: 5% → 40%

**3.2.1 Hooks Críticos**

```typescript
// apps/web/src/hooks/__tests__/useChamados.test.ts
describe('useChamados', () => {
  it('deve converter anexos com serializeAnexos ao criar', async () => {
    // Test implementation
  });

  it('deve parsear anexos ao carregar chamado', async () => {
    // Test implementation
  });

  it('deve lidar com anexos undefined', async () => {
    // Test implementation
  });
});
```

**Hooks a Testar:**

1. ✅ useChamados.ts (anexos, mensagens, avaliação)
2. ✅ useOcorrencias.ts (anexos, historico)
3. ✅ useComunicados.ts (anexos, leituras)
4. ✅ useFinanceiro.ts (saldo, relatórios)
5. ✅ useTaxas.ts (cálculos, status)
6. ✅ useNotificacoes.ts (leitura, envio)

**3.2.2 Type Helpers**

```typescript
// apps/web/src/lib/__tests__/type-helpers.test.ts
describe('type-helpers', () => {
  describe('serializeAnexos', () => {
    it('deve converter array de anexos para Json', () => {
      const anexos: Anexo[] = [{ url: 'test.pdf', tipo: 'pdf', nome: 'test', tamanho: 100 }];
      const result = serializeAnexos(anexos);
      expect(result).toEqual(anexos);
    });

    it('deve retornar [] para undefined', () => {
      expect(serializeAnexos(undefined)).toEqual([]);
    });
  });

  describe('parseAnexos', () => {
    it('deve converter Json para array de anexos', () => {
      const json = [{ url: 'test.pdf', tipo: 'pdf', nome: 'test', tamanho: 100 }];
      const result = parseAnexos(json as Json);
      expect(result).toHaveLength(1);
    });
  });
});
```

**Arquivos a Criar:**

- `apps/web/src/hooks/__tests__/useChamados.test.ts`
- `apps/web/src/hooks/__tests__/useOcorrencias.test.ts`
- `apps/web/src/hooks/__tests__/useComunicados.test.ts`
- `apps/web/src/hooks/__tests__/useFinanceiro.test.ts`
- `apps/web/src/hooks/__tests__/useTaxas.test.ts`
- `apps/web/src/hooks/__tests__/useNotificacoes.test.ts`
- `apps/web/src/lib/__tests__/type-helpers.test.ts`

**Validação:**

```bash
pnpm test --coverage
# Esperado: > 40% coverage
```

---

#### 3.3 Implementar Validação de Schema no CI [4h]

**Impacto:** Prevenir regressões

**3.3.1 Atualizar GitHub Action**

```yaml
# .github/workflows/type-check.yml
- name: Verify Schema Sync
  if: github.event_name == 'pull_request'
  run: |
    pnpm types:generate
    if git diff --exit-code packages/shared/src/types/database.types.ts; then
      echo "✅ Schema in sync"
    else
      echo "❌ Schema out of sync. Run 'pnpm types:generate'"
      exit 1
    fi
```

**3.3.2 Adicionar script de validação**

```bash
# scripts/validate-schema-sync.sh
#!/bin/bash
set -e

echo "🔍 Validating schema sync..."

# Gerar tipos
pnpm types:generate

# Verificar diff
if git diff --exit-code packages/shared/src/types/database.types.ts; then
  echo "✅ Schema is synchronized"
  exit 0
else
  echo "❌ Schema is out of sync!"
  echo "Run: pnpm types:generate"
  exit 1
fi
```

**Validação:**

```bash
# Testar localmente
./scripts/validate-schema-sync.sh
# Esperado: exit 0
```

---

### 📊 Métricas Sprint 3

| Métrica             | Antes | Depois | Melhoria          |
| ------------------- | ----- | ------ | ----------------- |
| Erros TypeScript    | ~26   | < 10   | -16+ erros (-62%) |
| Cobertura de Testes | ~5%   | 40%    | +35%              |
| Hooks Testados      | 0     | 6      | +6 hooks          |

### ✅ Definition of Done

- [ ] Erros TypeScript < 10
- [ ] Cobertura de testes > 40%
- [ ] 6 hooks com testes unitários
- [ ] type-helpers 100% testado
- [ ] CI valida schema sync
- [ ] Build passa sem warnings críticos
- [ ] Documentação de testes atualizada
- [ ] PR revisado e aprovado

---

## 🎯 Sprint 4 (Semanas 7-8): Testes E2E e Finalização

### Objetivo: Testes end-to-end e atingir 5.0/5.0

**Data:** 13/02/2026 - 26/02/2026
**Responsável:** Full Team
**Prioridade:** 🟢 MÉDIA

### 📋 Tarefas

#### 4.1 Implementar Testes E2E [20h]

**Impacto:** Cobertura de testes: 40% → 70%

**4.1.1 Fluxo de Chamados**

```typescript
// tests/e2e/chamados.spec.ts
test('morador pode criar chamado com anexo', async ({ page }) => {
  await page.goto('/chamados');
  await page.click('[data-testid="novo-chamado"]');

  await page.fill('[name="titulo"]', 'Vazamento no apartamento');
  await page.fill('[name="descricao"]', 'Vazamento na cozinha');
  await page.selectOption('[name="categoria"]', 'manutencao');

  // Upload anexo
  await page.setInputFiles('[name="anexos"]', 'fixtures/foto-vazamento.jpg');

  await page.click('[type="submit"]');

  // Verificar sucesso
  await expect(page.locator('.toast-success')).toBeVisible();
  await expect(page.locator('.chamado-card')).toContainText('Vazamento');
});

test('sindico pode responder chamado', async ({ page }) => {
  // Login como síndico
  await loginAsSindico(page);

  await page.goto('/sindico/chamados');
  await page.click('.chamado-card:first-child');

  await page.fill('[name="mensagem"]', 'Enviando técnico hoje');
  await page.click('[data-testid="enviar-mensagem"]');

  // Verificar resposta
  await expect(page.locator('.mensagem')).toContainText('Enviando técnico');
});
```

**4.1.2 Fluxo de Ocorrências**

```typescript
// tests/e2e/ocorrencias.spec.ts
test('morador pode criar ocorrência anônima', async ({ page }) => {
  await page.goto('/ocorrencias');
  await page.click('[data-testid="nova-ocorrencia"]');

  await page.fill('[name="titulo"]', 'Barulho no andar de cima');
  await page.check('[name="anonimo"]');
  await page.fill('[name="local_descricao"]', 'Apartamento 301');

  await page.click('[type="submit"]');

  await expect(page.locator('.toast-success')).toBeVisible();
});
```

**4.1.3 Fluxo Financeiro**

```typescript
// tests/e2e/financeiro.spec.ts
test('morador visualiza suas taxas', async ({ page }) => {
  await page.goto('/financeiro');

  // Verificar cards de taxas
  await expect(page.locator('.taxa-card')).toHaveCount(3);

  // Verificar saldo
  await expect(page.locator('[data-testid="saldo-atual"]')).toBeVisible();
});

test('sindico cria lançamento financeiro', async ({ page }) => {
  await loginAsSindico(page);

  await page.goto('/sindico/financeiro');
  await page.click('[data-testid="novo-lancamento"]');

  await page.selectOption('[name="tipo"]', 'despesa');
  await page.fill('[name="valor"]', '1500.00');
  await page.fill('[name="descricao"]', 'Manutenção elevador');

  await page.click('[type="submit"]');

  await expect(page.locator('.toast-success')).toBeVisible();
});
```

**4.1.4 Fluxo de Notificações**

```typescript
// tests/e2e/notificacoes.spec.ts
test('morador visualiza notificações', async ({ page }) => {
  await page.goto('/notificacoes');

  await expect(page.locator('.notificacao-card')).toHaveCount.greaterThan(0);

  // Marcar como lida
  await page.click('.notificacao-card:first-child');
  await expect(page.locator('.notificacao-card:first-child')).not.toHaveClass(/nao-lida/);
});

test('sindico envia notificação', async ({ page }) => {
  await loginAsSindico(page);

  await page.goto('/sindico/comunicacao');
  await page.click('[data-testid="nova-notificacao"]');

  await page.fill('[name="titulo"]', 'Assembleia Geral');
  await page.fill('[name="corpo"]', 'Convocação para assembleia dia 15/02');
  await page.selectOption('[name="tipo"]', 'assembleia');

  await page.click('[type="submit"]');

  await expect(page.locator('.toast-success')).toBeVisible();
});
```

**Arquivos a Criar:**

- `tests/e2e/chamados.spec.ts`
- `tests/e2e/ocorrencias.spec.ts`
- `tests/e2e/financeiro.spec.ts`
- `tests/e2e/notificacoes.spec.ts`
- `tests/e2e/assembleias.spec.ts`
- `tests/e2e/comunicados.spec.ts`
- `tests/fixtures/` (dados de teste)
- `tests/utils/auth-helpers.ts` (helpers de autenticação)

**Validação:**

```bash
pnpm test:e2e
# Esperado: All tests pass
```

---

#### 4.2 Otimização de Performance [8h]

**4.2.1 Análise de Bundles**

```bash
pnpm build --analyze
# Verificar chunks > 500KB
```

**4.2.2 Code Splitting Adicional**

```typescript
// Lazy load páginas pesadas
const SindicoComunicacao = lazy(() => import('./sindico/comunicacao/page'));
const SindicoFinanceiro = lazy(() => import('./sindico/financeiro/page'));
```

**4.2.3 Otimizar Queries**

```typescript
// Adicionar indexes no banco se necessário
// Usar select específico ao invés de select('*')
.select('id, titulo, status, created_at')
```

**Validação:**

```bash
pnpm lighthouse
# Esperado: Score > 90
```

---

#### 4.3 Documentação Final [6h]

**4.3.1 Atualizar README.md**

```markdown
## 🎯 Production Readiness

- ✅ 0 erros TypeScript
- ✅ 70% cobertura de testes
- ✅ Testes E2E implementados
- ✅ CI/CD completo
- ✅ Schema sync validado
- ✅ Performance otimizada
```

**4.3.2 Criar TESTING.md**

```markdown
# Guia de Testes

## Testes Unitários

- Hooks: `pnpm test apps/web/src/hooks`
- Utils: `pnpm test apps/web/src/lib`

## Testes E2E

- Todos: `pnpm test:e2e`
- Específico: `pnpm test:e2e chamados`

## Cobertura

- `pnpm test:coverage`
```

**4.3.3 Atualizar TIPOS_GUIA.md**

```markdown
## Tipos FormData

Use tipos FormData para estados de formulário:

- ✅ Campos opcionais
- ✅ Sem validação de campos obrigatórios
- ✅ Flexível para UI

Use tipos Insert para enviar ao banco:

- ✅ Validação de campos obrigatórios
- ✅ Conversão com serializeAnexos
```

**Arquivos a Criar/Atualizar:**

- `README.md`
- `TESTING.md`
- `TIPOS_GUIA.md`
- `CONTRIBUTING.md`

---

#### 4.4 Auditoria Final [4h]

**4.4.1 Checklist de Production Readiness**

```bash
# Erros TypeScript
cd apps/web && npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
# Esperado: 0

# Build
pnpm build
# Esperado: Success

# Testes
pnpm test --coverage
# Esperado: > 70%

# E2E
pnpm test:e2e
# Esperado: All pass

# Lint
pnpm lint
# Esperado: 0 errors, < 5 warnings

# Schema sync
./scripts/validate-schema-sync.sh
# Esperado: Synchronized
```

**4.4.2 Criar Relatório Final**

```markdown
# VERSIX NORMA - Relatório Final Sprint 4

## ✅ Objetivos Atingidos

- Erros TypeScript: 206 → 0 (-100%)
- Cobertura de testes: 5% → 70% (+65%)
- Production Readiness: 4.2/5.0 → 5.0/5.0
- Testes E2E: 0 → 20+ specs

## 📊 Métricas Finais

[...]
```

---

### 📊 Métricas Sprint 4

| Métrica             | Antes | Depois | Melhoria          |
| ------------------- | ----- | ------ | ----------------- |
| Erros TypeScript    | < 10  | 0      | -10 erros (-100%) |
| Cobertura de Testes | 40%   | 70%    | +30%              |
| Specs E2E           | 0     | 20+    | +20 specs         |
| Performance Score   | ~85   | > 90   | +5 pontos         |

### ✅ Definition of Done

- [ ] 0 erros TypeScript
- [ ] Cobertura de testes > 70%
- [ ] 20+ specs E2E implementados
- [ ] Performance score > 90
- [ ] Documentação completa
- [ ] Relatório final criado
- [ ] Production Readiness 5.0/5.0
- [ ] Deploy em produção bem-sucedido

---

## 📊 Resumo Geral dos Sprints

### Progresso Esperado

```
Sprint 1: Fundação de Tipos
206 erros → 86 erros (-58%)
├── NotificacaoDashboard completo
├── 4 FormData completos
└── serializeAnexos em useOcorrencias

Sprint 2: Joins e Conversões
86 erros → 26 erros (-70%)
├── 4 tipos ComJoins
├── Padronização Json/Anexo
└── Helpers null/undefined

Sprint 3: Testes e Qualidade
26 erros → <10 erros (-62%)
├── 6 hooks testados
├── type-helpers testado
└── CI com schema sync

Sprint 4: E2E e Finalização
<10 erros → 0 erros (-100%)
├── 20+ specs E2E
├── Performance > 90
└── Documentação completa
```

### Métricas Finais

| Métrica                   | Inicial | Final   | Melhoria     |
| ------------------------- | ------- | ------- | ------------ |
| **Erros TypeScript**      | 206     | 0       | -206 (-100%) |
| **Cumprimento Auditoria** | 70%     | 100%    | +30%         |
| **Production Readiness**  | 4.2/5.0 | 5.0/5.0 | +0.8         |
| **Cobertura de Testes**   | ~5%     | 70%     | +65%         |
| **Tipos FormData**        | 6       | 15      | +9 tipos     |
| **Tipos ComJoins**        | 10      | 14      | +4 tipos     |
| **Specs E2E**             | 0       | 20+     | +20 specs    |

---

## 🎯 Alocação de Recursos

### Sprint 1 (22h)

- **Tech Lead:** 10h (NotificacaoDashboard, validações)
- **Frontend Sênior:** 10h (FormData, hooks)
- **Backend Engineer:** 2h (Revisão, validação de tipos)

### Sprint 2 (22h)

- **Backend Engineer:** 12h (ComJoins, EmergenciaLog)
- **Frontend Sênior:** 8h (Conversões, helpers)
- **Tech Lead:** 2h (Code review, validação)

### Sprint 3 (28h)

- **Frontend Sênior:** 12h (Testes de hooks)
- **Backend Engineer:** 8h (Erros residuais, CI)
- **Tech Lead:** 4h (Validações, type-helpers tests)
- **QA/DevOps:** 4h (CI setup)

### Sprint 4 (38h)

- **QA/Tester:** 20h (E2E specs)
- **Frontend Sênior:** 8h (Performance, otimização)
- **Tech Lead:** 6h (Documentação)
- **Backend Engineer:** 4h (Auditoria final)

**Total:** 110 horas (~3 pessoas em tempo integral por 8 semanas)

---

## 🚨 Riscos e Mitigações

| Risco                               | Probabilidade | Impacto | Mitigação                         |
| ----------------------------------- | ------------- | ------- | --------------------------------- |
| **Tipos quebrarem após migrations** | Média         | Alto    | CI valida schema sync             |
| **Testes E2E flaky**                | Alta          | Médio   | Usar fixtures, timeouts adequados |
| **Performance degradação**          | Baixa         | Alto    | Lighthouse no CI                  |
| **Regressões de tipos**             | Média         | Alto    | Pre-commit hook valida tipos      |
| **Atraso em sprints**               | Média         | Médio   | Buffer de 20% no prazo            |

---

## ✅ Critérios de Sucesso Final

### Técnicos

- [ ] 0 erros TypeScript em build
- [ ] 0 warnings críticos de lint
- [ ] Cobertura de testes > 70%
- [ ] Performance score > 90
- [ ] CI/CD passando 100%
- [ ] Schema sempre sincronizado

### Qualidade

- [ ] Todos os tipos FormData completos
- [ ] Todos os tipos ComJoins implementados
- [ ] serializeAnexos usado consistentemente
- [ ] Documentação atualizada
- [ ] Relatórios de sprint criados

### Negócio

- [ ] Production Readiness 5.0/5.0
- [ ] Deploy em produção sem incidentes
- [ ] Equipe treinada em novos padrões
- [ ] Clientes satisfeitos com estabilidade

---

## 📅 Cronograma Visual

```
Janeiro 2026                    Fevereiro 2026
|-------|-------|-------|-------|-------|-------|-------|-------|
W1      W2      W3      W4      W5      W6      W7      W8
|---Sprint 1---|---Sprint 2---|---Sprint 3---|---Sprint 4---|
   Tipos         Joins/Conv      Testes        E2E/Final
   -120 erros    -60 erros      -16 erros     -10 erros
   206→86        86→26          26→10         10→0

   ✅ FormData   ✅ ComJoins    ✅ 6 hooks    ✅ 20+ E2E
   ✅ Dashboard  ✅ serialize   ✅ CI/CD      ✅ Docs
   ✅ serialize  ✅ null/undef  ✅ 40% cov    ✅ 70% cov
                                             ✅ 5.0/5.0
```

---

## 🎉 Entrega Final

**Data de Entrega:** 26/02/2026

**Entregáveis:**

1. ✅ Código com 0 erros TypeScript
2. ✅ 70% cobertura de testes (unit + E2E)
3. ✅ Documentação completa (README, TESTING, TIPOS_GUIA)
4. ✅ CI/CD completo com validações
5. ✅ Relatório final de auditoria
6. ✅ Production Readiness 5.0/5.0
7. ✅ Deploy em produção

---

_Roadmap criado em 02/01/2026_
_Versix Team - Tech Lead, Frontend Sênior, Backend Engineer, QA/Tester_
_Status: 🟢 APROVADO - Pronto para iniciar Sprint 1_
