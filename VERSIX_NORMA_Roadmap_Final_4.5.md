# VERSIX NORMA — Roadmap Final de Correções

## Objetivo: Rating 3.9 → 4.5/5.0

**Data:** 30 de Dezembro de 2024  
**Versão Base:** v1.0.1 (atualizada)  
**Rating Atual:** 3.9/5.0  
**Rating Alvo:** 4.5/5.0  
**Delta Necessário:** +0.6 pontos (+15.4%)

---

## 📋 Sumário

1. [Sprint 1 — Type Safety em Edge Functions](#sprint-1--type-safety-em-edge-functions)
2. [Sprint 2 — Documentação Crítica](#sprint-2--documentação-crítica)
3. [Sprint 3 — Cobertura de Testes E2E](#sprint-3--cobertura-de-testes-e2e)
4. [Sprint 4 — Acessibilidade e Resiliência](#sprint-4--acessibilidade-e-resiliência)
5. [Checklist Final de Validação](#checklist-final-de-validação)
6. [Resumo do Roadmap Global](#-resumo-do-roadmap-global)

---

## Sprint 1 — Type Safety em Edge Functions

| Atributo | Valor |
|----------|-------|
| **Duração** | 2-3 horas |
| **Prioridade** | P0 (Bloqueador) |
| **Impacto no Rating** | +0.1 (Qualidade de Código: 3.7 → 3.8) |
| **Arquivos Afetados** | 3 |
| **Ocorrências a Corrigir** | 12 |

### 1.1 health/index.ts (9 ocorrências)

**Arquivo:** `supabase/functions/health/index.ts`

#### Problema Identificado

O arquivo utiliza `any` em três contextos:
1. Parâmetro `supabase` nas funções de check (linhas 81, 95, 105)
2. Catch blocks com `e: any` (linhas 90, 100, 113, 128, 141)
3. Nota: linha 67 contém `anyError` que é uma variável, não um tipo — **não precisa correção**

#### Código Atual (Incorreto)

```typescript
// Linha 81 - Parâmetro sem tipagem
async function checkDatabase(supabase: any): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('condominios').select('id').limit(1);
    return {
      status: error ? 'error' : 'ok',
      latencyMs: Date.now() - start,
      message: error?.message,
    };
  } catch (e: any) {  // Linha 90 - catch com any
    return { status: 'error', latencyMs: Date.now() - start, message: e.message };
  }
}
```

#### Código Corrigido Completo

```typescript
// =====================================================
// SPRINT 10: Health Check Edge Function
// Verifica status de todos os serviços
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, CheckResult>;
  timestamp: string;
  version: string;
}

interface CheckResult {
  status: 'ok' | 'degraded' | 'error';
  latencyMs: number;
  message?: string;
}

// ============================================
// HELPER: Extração segura de mensagem de erro
// ============================================
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unknown error occurred';
}

const APP_VERSION = Deno.env.get('APP_VERSION') || '1.0.0';

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const checks: Record<string, CheckResult> = {};

  checks.database = await checkDatabase(supabase);
  checks.auth = await checkAuth(supabase);
  checks.storage = await checkStorage(supabase);
  
  if (Deno.env.get('GROQ_API_KEY')) {
    checks.groq = await checkGroq();
  }
  
  if (Deno.env.get('QDRANT_URL')) {
    checks.qdrant = await checkQdrant();
  }

  const allChecks = Object.values(checks);
  const hasError = allChecks.some(c => c.status === 'error');
  const allOk = allChecks.every(c => c.status === 'ok');

  const response: HealthStatus = {
    status: hasError ? 'unhealthy' : allOk ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
  };

  return new Response(JSON.stringify(response), {
    status: response.status === 'unhealthy' ? 503 : 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

// ============================================
// CHECK FUNCTIONS - Todas tipadas corretamente
// ============================================

async function checkDatabase(supabase: SupabaseClient): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('condominios').select('id').limit(1);
    return {
      status: error ? 'error' : 'ok',
      latencyMs: Date.now() - start,
      message: error?.message,
    };
  } catch (e: unknown) {
    return { status: 'error', latencyMs: Date.now() - start, message: getErrorMessage(e) };
  }
}

async function checkAuth(supabase: SupabaseClient): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { error } = await supabase.auth.getSession();
    return { status: error ? 'error' : 'ok', latencyMs: Date.now() - start, message: error?.message };
  } catch (e: unknown) {
    return { status: 'error', latencyMs: Date.now() - start, message: getErrorMessage(e) };
  }
}

async function checkStorage(supabase: SupabaseClient): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { error } = await supabase.storage.listBuckets();
    return { status: error ? 'degraded' : 'ok', latencyMs: Date.now() - start, message: error?.message };
  } catch (e: unknown) {
    return { status: 'degraded', latencyMs: Date.now() - start, message: getErrorMessage(e) };
  }
}

async function checkGroq(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': \`Bearer \${Deno.env.get('GROQ_API_KEY')}\` },
    });
    return { status: response.ok ? 'ok' : 'degraded', latencyMs: Date.now() - start };
  } catch (e: unknown) {
    return { status: 'degraded', latencyMs: Date.now() - start, message: getErrorMessage(e) };
  }
}

async function checkQdrant(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetch(\`\${Deno.env.get('QDRANT_URL')}/healthz\`);
    return { status: response.ok ? 'ok' : 'degraded', latencyMs: Date.now() - start };
  } catch (e: unknown) {
    return { status: 'degraded', latencyMs: Date.now() - start, message: getErrorMessage(e) };
  }
}
```

#### Tabela de Mudanças

| Linha | Antes | Depois |
|-------|-------|--------|
| Import | `createClient` | `createClient, SupabaseClient` |
| Novo | — | `getErrorMessage(error: unknown): string` |
| 67 | `anyError` | `hasError` (clareza) |
| 81 | `supabase: any` | `supabase: SupabaseClient` |
| 90 | `catch (e: any)` | `catch (e: unknown)` |
| 95 | `supabase: any` | `supabase: SupabaseClient` |
| 100 | `catch (e: any)` | `catch (e: unknown)` |
| 105 | `supabase: any` | `supabase: SupabaseClient` |
| 113 | `catch (e: any)` | `catch (e: unknown)` |
| 128 | `catch (e: any)` | `catch (e: unknown)` |
| 141 | `catch (e: any)` | `catch (e: unknown)` |

---

### 1.2 uptime-check/index.ts (1 ocorrência)

**Arquivo:** `supabase/functions/uptime-check/index.ts`

#### Código Atual (Incorreto)

```typescript
// Linha 30
} catch (e: any) {
  status = e.name === 'TimeoutError' ? 'timeout' : 'error';
  erro = e.message;
}
```

#### Código Corrigido

```typescript
// Adicionar no início do arquivo:
interface FetchError {
  name?: string;
  message?: string;
}

function isFetchError(error: unknown): error is FetchError {
  return typeof error === 'object' && error !== null;
}

// Substituir o catch block (linha 30):
} catch (e: unknown) {
  if (isFetchError(e)) {
    status = e.name === 'TimeoutError' ? 'timeout' : 'error';
    erro = e.message || 'Unknown error';
  } else {
    status = 'error';
    erro = 'Unknown error occurred';
  }
}
```

---

### 1.3 PreferenciasCanais.tsx (2 ocorrências)

**Arquivo:** `apps/web/src/components/notificacoes/PreferenciasCanais.tsx`

#### Código Atual (Incorreto)

```typescript
// Linhas 74-75
checked={(form as any)[canal.key]}
onChange={e => handleChange(canal.key as any, e.target.checked)}
```

#### Código Corrigido

```typescript
// Adicionar tipo específico:
type ToggleKey = 
  | 'push_habilitado' 
  | 'email_habilitado' 
  | 'whatsapp_habilitado' 
  | 'sms_habilitado' 
  | 'voz_emergencia_habilitado';

interface CanalConfig {
  key: ToggleKey;
  label: string;
  icon: string;
  desc: string;
}

// Tipar o array de canais:
const canais: CanalConfig[] = [
  { key: 'push_habilitado', label: 'Push Notifications', icon: 'notifications', desc: 'Notificações no celular' },
  // ... resto dos canais
];

// Corrigir linhas 74-75:
checked={form[canal.key]}
onChange={e => handleToggle(canal.key, e.target.checked)}
```

---

### 1.4 Validação Sprint 1

```bash
# Verificar eliminação de 'any'
grep -rn ": any" ./supabase/functions --include="*.ts"
# Resultado esperado: 0 ocorrências

grep -rn "as any" ./apps/web/src --include="*.tsx"
# Resultado esperado: 0 ocorrências
```

### 📊 Rating Global após Sprint 1: **3.9 → 4.0** (+0.1)

---

## Sprint 2 — Documentação Crítica

| Atributo | Valor |
|----------|-------|
| **Duração** | 4-6 horas |
| **Prioridade** | P0 (Bloqueador) |
| **Impacto no Rating** | +0.15 (Documentação: 2.5 → 3.4) |
| **Arquivos a Criar** | 2 |

### 2.1 README.md (Substituir Completamente)

> ⚠️ **CRÍTICO:** O README atual é do Supabase CLI. Substituir completamente.

**Arquivo:** `README.md` (raiz do projeto)

```markdown
# Versix Norma

![Version](https://img.shields.io/badge/version-1.0.1-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

**Plataforma de Governança Condominial Inteligente**

Versix Norma é um sistema SaaS completo para gestão de condomínios, com assistente de IA integrado (Norma), módulos financeiros, assembleias digitais, e comunicação multicanal.

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20.x ou superior
- pnpm 8.x ou superior
- Docker (para Supabase local)

### Instalação

\`\`\`bash
# Clone o repositório
git clone https://github.com/versix/norma.git
cd norma

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp apps/web/.env.example apps/web/.env.local

# Inicie o servidor de desenvolvimento
pnpm dev
\`\`\`

Acesse [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Arquitetura

\`\`\`
versix-norma/
├── apps/
│   └── web/                      # Next.js 14 App Router
│       ├── src/
│       │   ├── app/              # Páginas (App Router)
│       │   ├── components/       # Componentes React
│       │   ├── hooks/            # Custom Hooks
│       │   └── lib/              # Utilitários
│       └── tests/                # Testes E2E (Playwright)
├── packages/
│   └── shared/                   # Tipos, validators compartilhados
├── supabase/
│   ├── functions/                # Edge Functions (Deno)
│   └── migrations/               # SQL Migrations
└── public/                       # Assets estáticos, PWA
\`\`\`

### Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript 5, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **AI** | Groq API, pgvector, RAG |
| **Testes** | Playwright (E2E), Vitest (Unit) |
| **Infra** | Vercel, Supabase Cloud, Sentry |

---

## 🔧 Configuração

### Variáveis de Ambiente

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

---

## 🧪 Testes

\`\`\`bash
pnpm test:e2e      # Testes E2E
pnpm test:unit     # Testes unitários
pnpm test:coverage # Cobertura
\`\`\`

---

## 📦 Deploy

Deploy automatizado via GitHub Actions para Vercel.

---

## 📚 Documentação

- [Guia de Contribuição](./CONTRIBUTING.md)

---

## 📄 Licença

Proprietário © 2024 Versix Solutions. Todos os direitos reservados.
```

---

### 2.2 CONTRIBUTING.md

**Arquivo:** `CONTRIBUTING.md` (raiz do projeto)

```markdown
# Guia de Contribuição — Versix Norma

## 📋 Padrões de Código

### TypeScript

- **NUNCA use \`any\`** — use \`unknown\` se necessário
- Defina interfaces para todas as props
- Exporte tipos junto com componentes

### React

- Componentes funcionais com hooks
- Props sempre tipadas com interface
- Acessibilidade: \`aria-*\`, \`role\`, \`tabIndex\`

### Commits (Conventional Commits)

\`\`\`
feat: nova funcionalidade
fix: correção de bug
docs: documentação
test: testes
refactor: refatoração
\`\`\`

## 🔄 Workflow

1. Crie branch a partir de \`develop\`
2. Desenvolva com commits frequentes
3. Abra PR para \`develop\`
4. Aguarde code review

## 🧪 Testes

- Use \`data-testid\` para seletores E2E
- Teste fluxos completos do usuário
- Cobertura mínima: 30%

---

*Última atualização: Dezembro 2024*
```

---

### 2.3 Validação Sprint 2

```bash
head -1 README.md | grep -i "versix norma"
# Resultado esperado: match encontrado

ls CONTRIBUTING.md
# Resultado esperado: arquivo existe
```

### 📊 Rating Global após Sprint 2: **4.0 → 4.15** (+0.15)

---

## Sprint 3 — Cobertura de Testes E2E

| Atributo | Valor |
|----------|-------|
| **Duração** | 8-10 horas |
| **Prioridade** | P1 (Importante) |
| **Impacto no Rating** | +0.15 (Testes: 2.5 → 3.3) |
| **Arquivos a Criar** | 5 |

### 3.1 Helper de Autenticação

**Arquivo:** `apps/web/tests/helpers/auth-helpers.ts`

```typescript
import { Page } from '@playwright/test';

export type UserRole = 'sindico' | 'morador' | 'admin';

const CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  sindico: { email: 'sindico@demo.versix.com.br', password: 'demo123' },
  morador: { email: 'morador@demo.versix.com.br', password: 'demo123' },
  admin: { email: 'admin@demo.versix.com.br', password: 'demo123' },
};

export async function loginAsUser(page: Page, role: UserRole): Promise<void> {
  const creds = CREDENTIALS[role];
  await page.goto('/login');
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(home|sindico|admin)/, { timeout: 15000 });
}
```

### 3.2 Arquivos de Teste E2E a Criar

| Arquivo | Fluxos Cobertos |
|---------|-----------------|
| `financeiro.spec.ts` | Dashboard, lançamentos, criar/editar, prestação de contas |
| `assembleias.spec.ts` | Listar, votar, quórum, resultado |
| `chamados.spec.ts` | Criar, listar, responder, atribuir |
| `comunicados.spec.ts` | Listar, criar, editar, publicar |

### 3.3 Exemplo: financeiro.spec.ts

```typescript
import { test, expect } from '@playwright/test';
import { loginAsUser } from './helpers/auth-helpers';

test.describe('Módulo Financeiro', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'sindico');
  });

  test('deve exibir dashboard financeiro', async ({ page }) => {
    await page.goto('/sindico/financeiro');
    await expect(page.getByText(/saldo atual/i)).toBeVisible();
    await expect(page.getByText(/receitas/i)).toBeVisible();
    await expect(page.getByText(/despesas/i)).toBeVisible();
  });

  test('deve criar novo lançamento', async ({ page }) => {
    await page.goto('/sindico/financeiro/lancamentos');
    await page.click('button:has-text("Novo")');
    await page.fill('input[name="descricao"]', 'Teste E2E');
    await page.fill('input[name="valor"]', '1500.00');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/sucesso/i)).toBeVisible();
  });
});
```

### 3.4 Validação Sprint 3

```bash
pnpm test:e2e
# Resultado esperado: todos os testes passando

find ./apps/web/tests -name "*.spec.ts" | wc -l
# Resultado esperado: >= 7
```

### 📊 Rating Global após Sprint 3: **4.15 → 4.3** (+0.15)

---

## Sprint 4 — Acessibilidade e Resiliência

| Atributo | Valor |
|----------|-------|
| **Duração** | 5-6 horas |
| **Prioridade** | P1 (Importante) |
| **Impacto no Rating** | +0.2 (Acessibilidade + Observabilidade) |
| **Arquivos Afetados** | 4 |

### 4.1 ErrorBoundary Global

**Arquivo:** `apps/web/src/components/ClientProviders.tsx`

```typescript
'use client';

import { ErrorBoundary } from '@/components/observabilidade/ErrorBoundary';
// ... outros imports

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* ... resto dos providers */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

### 4.2 SkipLink Component

**Arquivo:** `apps/web/src/components/ui/SkipLink.tsx`

```typescript
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white 
                 focus:rounded-lg focus:outline-none focus:ring-2"
    >
      Pular para o conteúdo principal
    </a>
  );
}
```

### 4.3 Atualizar layout.tsx

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <SkipLink />
        <ClientProviders>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
```

### 4.4 Validação Sprint 4

```bash
grep -n "ErrorBoundary" ./apps/web/src/components/ClientProviders.tsx
# Resultado esperado: linhas com import e uso

ls ./apps/web/src/components/ui/SkipLink.tsx
# Resultado esperado: arquivo existe

grep -rn "aria-" --include="*.tsx" ./apps/web/src | wc -l
# Resultado esperado: >= 40
```

### 📊 Rating Global após Sprint 4: **4.3 → 4.5** (+0.2)

---

## Checklist Final de Validação

```bash
echo "=== VALIDAÇÃO FINAL ==="

echo "1. Type Safety..."
ANY_COUNT=$(grep -rn ": any\|as any" ./supabase/functions ./apps/web/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "   Ocorrências de 'any': $ANY_COUNT (esperado: 0)"

echo "2. Documentação..."
README_OK=$(head -1 README.md | grep -ci "versix norma")
echo "   README.md válido: $README_OK (esperado: 1)"
CONTRIB_OK=$(ls CONTRIBUTING.md 2>/dev/null | wc -l)
echo "   CONTRIBUTING.md existe: $CONTRIB_OK (esperado: 1)"

echo "3. Testes..."
TEST_COUNT=$(find ./apps/web/tests -name "*.spec.ts" 2>/dev/null | wc -l)
echo "   Arquivos de teste: $TEST_COUNT (esperado: >= 7)"

echo "4. Acessibilidade..."
ARIA_COUNT=$(grep -rn "aria-" --include="*.tsx" ./apps/web/src 2>/dev/null | wc -l)
echo "   Atributos aria-*: $ARIA_COUNT (esperado: >= 40)"

echo ""
if [ "$ANY_COUNT" -eq 0 ] && [ "$README_OK" -ge 1 ] && [ "$TEST_COUNT" -ge 7 ]; then
  echo "✅ VALIDAÇÕES OK - Rating: 4.5/5.0"
else
  echo "⚠️ PENDÊNCIAS ENCONTRADAS"
fi
```

---

## 📊 Resumo do Roadmap Global

| Sprint | Foco | Esforço | Rating Antes | Rating Depois | Delta |
|--------|------|---------|--------------|---------------|-------|
| **Sprint 1** | Type Safety | 2-3h | 3.9 | 4.0 | +0.1 |
| **Sprint 2** | Documentação | 4-6h | 4.0 | 4.15 | +0.15 |
| **Sprint 3** | Testes E2E | 8-10h | 4.15 | 4.3 | +0.15 |
| **Sprint 4** | Acessibilidade | 5-6h | 4.3 | 4.5 | +0.2 |
| **TOTAL** | — | **~21h** | **3.9** | **4.5** | **+0.6** |

---

## 🎯 Meta Final

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   RATING INICIAL:     3.9 / 5.0                              ║
║   RATING ALVO:        4.5 / 5.0                              ║
║   INCREMENTO:         +0.6 pontos (+15.4%)                   ║
║                                                              ║
║   STATUS:             PRODUCTION READY (Alta Maturidade)     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

*Documento gerado em 30 de Dezembro de 2024*  
*Versix Team Developers*
