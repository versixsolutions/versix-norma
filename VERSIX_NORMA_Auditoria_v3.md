# VERSIX NORMA - Auditoria Final v3

## Data: 01/01/2025

---

## 📊 RESUMO EXECUTIVO

| Métrica                 | Valor        |
| ----------------------- | ------------ |
| **Total de Erros**      | 204          |
| **Arquivos Afetados**   | 34           |
| **Migração Estrutural** | ✅ CONCLUÍDA |
| **Tipos Faltantes**     | 13           |

### ✅ O QUE FOI FEITO CORRETAMENTE

1. **Estrutura de tipos migrada** - Só existe `derived.ts` agora
2. **Index.ts atualizado** - Exporta apenas do derived.ts
3. **Arquivos manuais removidos** - `financial.ts`, `operational.ts`, `assembleias.ts`, etc.

### ❌ O QUE AINDA PRECISA SER FEITO

1. **Adicionar 13 tipos faltantes** ao `derived.ts`
2. **Corrigir interfaces existentes** que estão incompletas
3. **Atualizar hooks** para usar `serializeAnexos()` ao enviar dados

---

## 🔴 ERROS POR ARQUIVO (TOP 15)

| Arquivo                      | Erros | Problema Principal                                |
| ---------------------------- | ----- | ------------------------------------------------- |
| useChamados.ts               | 19    | `Anexo[]` não é `Json`                            |
| useVotacao.ts                | 14    | Tipos `VotarInput`, `Comentario` faltando         |
| IntegracaoCard.tsx           | 14    | Campos em `IntegracaoDashboard`                   |
| useOcorrencias.ts            | 13    | Conversão de anexos                               |
| DashboardFinanceiroCards.tsx | 13    | `SaldoPeriodo` faltando                           |
| integracoes/page.tsx         | 12    | `CreateIntegracaoApiInput` incompleto             |
| comunicacao/page.tsx         | 10    | `NotificacaoDashboard`, `TipoEmergencia` faltando |
| useIntegracoes.ts            | 10    | Tipos de webhook                                  |
| useTaxas.ts                  | 8     | Campos não existentes                             |
| useNotificacoes.ts           | 7     | Tipos faltando                                    |

---

## 📝 TIPOS FALTANTES NO derived.ts

### Adicionar ao final do arquivo:

```typescript
// ============================================
// FINANCEIRO - TIPOS ADICIONAIS
// ============================================

export interface SaldoPeriodo {
  data_inicio: string;
  data_fim: string;
  saldo_inicial: number;
  saldo_final: number;
  total_receitas: number;
  total_despesas: number;
  variacao: number;
}

export interface RelatorioMensal {
  mes: number;
  ano: number;
  receitas: number;
  despesas: number;
  saldo: number;
  inadimplencia: number;
  detalhamento?: {
    categoria_id: string;
    categoria_nome: string;
    valor: number;
    tipo: 'receita' | 'despesa';
  }[];
}

// ============================================
// NOTIFICAÇÕES - TIPOS ADICIONAIS
// ============================================

export interface NotificacaoDashboard {
  notificacao: Notificacao;
  stats: {
    total_enviadas: number;
    total_entregues: number;
    total_lidas: number;
    taxa_abertura: number;
  };
  entregas?: NotificacaoEntrega[];
}

export interface NotificacaoUsuario extends Notificacao {
  lida: boolean;
  lida_em?: string;
  entrega_status?: StatusEntrega;
}

// ============================================
// EMERGÊNCIAS - TIPOS ADICIONAIS
// ============================================

export type TipoEmergencia =
  | 'incendio'
  | 'medica'
  | 'seguranca'
  | 'vazamento'
  | 'elevador'
  | 'geral';

export interface DispararEmergenciaInput {
  tipo: TipoEmergencia;
  descricao?: string;
  localizacao?: string;
}

export interface EmergenciaLogComDetalhes extends EmergenciaLog {
  descricao?: string;
  disparado_em?: string;
  total_ligacoes?: number;
  total_atendidas?: number;
  tipo_emergencia?: TipoEmergencia;
}

// ============================================
// VOTAÇÃO - TIPOS ADICIONAIS
// ============================================

export interface VotarInput {
  pauta_id: string;
  opcao_id?: string;
  voto_tipo: 'sim' | 'nao' | 'abstencao';
}

export interface Comentario {
  id: string;
  assembleia_id: string;
  pauta_id?: string;
  usuario_id: string;
  conteudo: string;
  tipo: 'comentario' | 'pergunta' | 'resposta' | 'moderacao';
  respondido_em?: string;
  resposta?: string;
  created_at: string;
  usuario?: Pick<Usuario, 'nome' | 'avatar_url'>;
}

// ============================================
// API LOGS - TIPOS ADICIONAIS
// ============================================

export interface ApiLogsFilters extends BaseFilters {
  integracao_id?: string;
  status_code?: number;
  metodo?: string;
  data_inicio?: string;
  data_fim?: string;
}
```

---

## 🔧 CORREÇÕES EM INTERFACES EXISTENTES

### 1. CreateIntegracaoApiInput - Adicionar `descricao`

```typescript
// ANTES:
export interface CreateIntegracaoApiInput {
  nome: string;
  tipo: IntegracaoTipo;
  ambiente?: IntegracaoAmbiente;
  scopes?: string[];
  ip_whitelist?: string[];
  rate_limit_minuto?: number;
}

// DEPOIS:
export interface CreateIntegracaoApiInput {
  nome: string;
  descricao?: string; // ADICIONAR
  tipo: IntegracaoTipo;
  ambiente?: IntegracaoAmbiente;
  scopes?: string[];
  ip_whitelist?: string[];
  rate_limit_minuto?: number;
}
```

### 2. IntegracaoDashboard - Adicionar `id`

```typescript
// ANTES:
export interface IntegracaoDashboard {
  integracao: Integracao;
  stats: { ... };
  eventos?: WebhookEvento[];
  conector?: Conector | null;
}

// DEPOIS:
export interface IntegracaoDashboard {
  id: string;  // ADICIONAR
  integracao: Integracao;
  stats: {
    total_requests: number;
    success_rate: number;
    last_request: string | null;
  };
  eventos?: WebhookEvento[];
  conector?: Conector | null;
}
```

### 3. AvaliarChamadoInput - Adicionar `id`

```typescript
// ANTES:
export interface AvaliarChamadoInput {
  avaliacao_nota: number;
  avaliacao_comentario?: string;
}

// DEPOIS:
export interface AvaliarChamadoInput {
  id: string; // ADICIONAR - ID do chamado
  avaliacao_nota: number;
  avaliacao_comentario?: string;
}
```

### 4. UpdateWebhookConfigInput - Já tem `nome`, verificar uso

O tipo `CreateWebhookInput` está usando `WebhookConfigInsert` que não tem `nome`. Criar alias correto:

```typescript
export interface CreateWebhookInputFull {
  nome: string;
  url_destino: string;
  eventos: WebhookEvento[];
  headers_custom?: Record<string, string>;
  ativo?: boolean;
}
```

---

## 🔄 CORREÇÕES NOS HOOKS

### 1. useChamados.ts - Linha 53, 169

**Problema:** `Anexo[]` não é atribuível a `Json`

**Solução:** Usar `serializeAnexos()` do type-helpers

```typescript
// ANTES:
anexos: data.anexos,

// DEPOIS:
import { serializeAnexos } from '@/lib/type-helpers';
// ...
anexos: serializeAnexos(data.anexos),
```

### 2. useOcorrencias.ts - Similar ao useChamados

```typescript
// Ao criar/atualizar:
anexos: serializeAnexos(data.anexos),
```

### 3. useComunicados.ts - Mesmo padrão

```typescript
anexos: serializeAnexos(data.anexos),
```

---

## 📋 CORREÇÃO DO type-helpers.ts

A função `serializeAnexos` precisa retornar `Json` corretamente:

```typescript
// ANTES:
export function serializeAnexos(anexos: Anexo[] | undefined): Json {
  if (!anexos || anexos.length === 0) return [];
  return JSON.stringify(anexos) as unknown as Json;
}

// DEPOIS:
export function serializeAnexos(anexos: Anexo[] | undefined): Json {
  if (!anexos || anexos.length === 0) return [];
  return anexos as unknown as Json; // Não precisa stringify, já é Json
}
```

---

## 🎯 PLANO DE AÇÃO (Ordem de Execução)

### Etapa 1: Adicionar tipos faltantes (5 min)

Copiar os tipos listados acima para o final de `derived.ts`

### Etapa 2: Corrigir interfaces existentes (5 min)

- `CreateIntegracaoApiInput` → adicionar `descricao`
- `IntegracaoDashboard` → adicionar `id`
- `AvaliarChamadoInput` → adicionar `id`

### Etapa 3: Corrigir type-helpers.ts (2 min)

Atualizar `serializeAnexos()`

### Etapa 4: Atualizar hooks que usam anexos (10 min)

- useChamados.ts
- useOcorrencias.ts
- useComunicados.ts

### Etapa 5: Verificar e corrigir erros restantes (15 min)

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

```bash
# 1. Adicionar tipos faltantes ao derived.ts
# 2. Corrigir interfaces
# 3. Atualizar type-helpers.ts
# 4. Rodar verificação
cd apps/web && npx tsc --noEmit

# 5. Se passar, build
pnpm build

# 6. Commit
git add -A
git commit -m "fix: adicionar tipos faltantes e corrigir interfaces"
git push
```

---

## 📊 RESULTADO ESPERADO

| Antes                  | Depois                   |
| ---------------------- | ------------------------ |
| 204 erros              | ~20-30 erros (residuais) |
| 13 tipos faltantes     | 0 tipos faltantes        |
| Interfaces incompletas | Interfaces corrigidas    |

---

_Versix Team Developers - 01/01/2025_
