# VERSIX NORMA - Detalhamento Técnico: Sprint 1 (Stability & Trust)
**Duração Estimada:** 5 Dias Úteis
**Prioridade:** Qualidade de Código e Estabilização (P1)

---

## 1. Task Force: Segurança de Tipos (Type Safety)
**Objetivo:** Eliminar o uso de `any` e garantir integridade de dados entre Frontend e Banco de Dados.

### Tarefa 1.1: Sincronização de Tipos com Supabase
*   **Descrição:** Automatizar a geração de tipos TypeScript a partir do schema do banco de dados.
*   **Ações Técnicas:**
    *   Configurar o script `pnpm supabase:gen-types` no `package.json` da raiz.
    *   Gerar o arquivo `database.types.ts` e movê-lo para `@versix/shared`.
    *   Substituir as definições manuais em `apps/web/src/types/database.ts` pela versão gerada.
*   **Responsável Sugerido:** Frontend Developer (Senior).
*   **Critério de Sucesso:** Build do projeto sem erros de tipagem ao alterar colunas no banco.

### Tarefa 1.2: Refatoração de Hooks Críticos
*   **Descrição:** Remover `as any` e tipar corretamente os retornos dos hooks de negócio.
*   **Ações Técnicas:**
    *   Refatorar `useFinanceiro.ts`, `useAuth.ts` e `useNotificacoes.ts`.
    *   Garantir que as chamadas `supabase.from().select()` utilizem os tipos genéricos da base.
    *   Tipar corretamente os payloads das RPCs (Remote Procedure Calls).
*   **Responsável Sugerido:** Frontend Developer.
*   **Critério de Sucesso:** Zero ocorrências de `any` nos diretórios `hooks/` e `lib/`.

---

## 2. Task Force: Automação de Testes (QA)
**Objetivo:** Criar uma rede de segurança contra regressões em fluxos críticos.

### Tarefa 1.3: Setup de Testes E2E com Playwright
*   **Descrição:** Configurar o framework de testes de ponta a ponta.
*   **Ações Técnicas:**
    *   Instalar `@playwright/test` no app web.
    *   Configurar o ambiente de teste para usar o banco de dados de staging/local.
    *   Criar o primeiro "Happy Path": Login -> Visualizar Dashboard -> Logout.
*   **Responsável Sugerido:** QA Engineer ou Fullstack Developer.
*   **Critério de Sucesso:** Teste de login executando com sucesso em ambiente de CI (GitHub Actions).

### Tarefa 1.4: Testes de Integração de Lógica Financeira
*   **Descrição:** Validar cálculos de saldo e inadimplência.
*   **Ações Técnicas:**
    *   Criar testes unitários para as funções de cálculo em `packages/shared/utils`.
    *   Validar se o hook `useFinanceiro` processa corretamente os dados retornados pela RPC `calcular_saldo_periodo_otimizado`.
*   **Responsável Sugerido:** Backend Developer.
*   **Critério de Sucesso:** 100% de cobertura nas funções de utilitários financeiros.

---

## 3. Task Force: Infraestrutura & Monitoramento
**Objetivo:** Automatizar rotinas de manutenção e garantir visibilidade de erros.

### Tarefa 1.5: Configuração de Cron Jobs (pg_cron)
*   **Descrição:** Ativar rotinas agendadas no banco de dados.
*   **Ações Técnicas:**
    *   Habilitar a extensão `pg_cron` no Supabase.
    *   Agendar `collect-metrics` para rodar a cada 1 hora.
    *   Agendar `uptime-check` para rodar a cada 5 minutos.
*   **Responsável Sugerido:** DevOps / Backend Developer.
*   **Critério de Sucesso:** Logs de execução visíveis na tabela de histórico do `pg_cron`.

### Tarefa 1.6: Tunelamento e Sourcemaps no Sentry
*   **Descrição:** Melhorar a precisão do monitoramento de erros.
*   **Ações Técnicas:**
    *   Configurar o upload de Sourcemaps durante o build no CI/CD.
    *   Implementar o tunelamento de eventos do Sentry para evitar bloqueio por AdBlockers.
*   **Responsável Sugerido:** DevOps.
*   **Critério de Sucesso:** Erros em produção exibindo a linha exata do código original (não minificado).

---

## Resumo de Alocação (Sprint 1)

| Responsável | Carga Horária Est. | Tarefas |
| :--- | :---: | :--- |
| **Frontend Dev (Senior)** | 20h | 1.1, 1.2 |
| **Backend / DevOps** | 12h | 1.5, 1.6 |
| **QA / Fullstack** | 8h | 1.3, 1.4 |

---
**Nota:** Esta Sprint foca em "limpar a casa". Embora não entregue novas funcionalidades visíveis ao usuário final, ela é o que garante que o sistema não falhe sob carga ou durante manutenções futuras.
