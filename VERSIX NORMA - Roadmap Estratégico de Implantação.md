# VERSIX NORMA - Roadmap Estratégico de Implantação
**Objetivo:** Atingir 100% Production Readiness e Lançamento do MVP
**Equipe Responsável:** Versix Development Team
**Supervisão Técnica:** Google Senior Standards

---

## 1. Estratégia de Execução
Para garantir agilidade e segurança, o roadmap está dividido em **3 Sprints de curta duração**. O foco inicial é a remoção de bloqueadores técnicos, seguido pela estabilização da qualidade e, por fim, a ativação do diferencial competitivo (IA).

---

## 2. Sprint 0: "The Launchpad" (Duração: 48 Horas)
**Foco:** Bloqueadores P0 e Correções Estruturais Imediatas.

### Tarefas Críticas:
*   **[Infra] Mensageria Real:** Implementar as Edge Functions `send-email` (SendGrid), `send-sms` (Twilio) e `send-push` (Firebase/WebPush).
*   **[Fix] Roteamento Admin:** Renomear diretório `observalidade` -> `observabilidade` e converter `observabilidade.tsx` em `page.tsx`.
*   **[DevOps] Secrets Management:** Configurar `SENTRY_DSN`, `SENDGRID_API_KEY` e chaves de integração no dashboard do Supabase.
*   **[PWA] Assets:** Gerar e incluir `home.png` e `mobile.png` no diretório public para conformidade do manifesto.

**Critério de Aceite:** Notificações de teste recebidas com sucesso; Rota `/admin/observabilidade` acessível sem erros 404.

---

## 3. Sprint 1: "Stability & Trust" (Duração: 5 Dias)
**Foco:** Qualidade de Código, Segurança de Tipos e Monitoramento.

### Tarefas Críticas:
*   **[Refactor] Type Safety:** Executar `supabase gen types` e substituir todos os `any` nos hooks de `Financeiro`, `Auth` e `Notificações`.
*   **[QA] Smoke Tests:** Implementar suíte inicial de testes E2E (Playwright) cobrindo:
    *   Fluxo de Login/Signup.
    *   Criação de Comunicado.
    *   Lançamento Financeiro simples.
*   **[Infra] Automação Postgres:** Configurar `pg_cron` para execução automática de `collect-metrics` (1h) e `uptime-check` (5min).
*   **[Observability] Sentry Full Setup:** Configurar Source Maps no build do Next.js para debug preciso em produção.

**Critério de Aceite:** Cobertura de testes > 20% (fluxos críticos); Zero erros de lint/typescript no build de produção.

---

## 4. Sprint 2: "Intelligence & Scale" (Duração: 7 Dias)
**Foco:** Ativação da IA Norma e Polimento de UX.

### Tarefas Críticas:
*   **[AI] Norma Brain:** Implementar a Edge Function `ask-norma` integrando com o provedor de LLM (Groq/OpenAI) e contexto RAG.
*   **[UX] Feedback de IA:** Adicionar estados de "streaming" e citações de documentos reais no componente `NormaChat.tsx`.
*   **[Perf] Lighthouse Audit:** Otimizar imagens e scripts para garantir Score > 90 em Performance e Acessibilidade.
*   **[Security] Final Audit:** Revisão final de todas as RLS Policies para garantir isolamento total entre condomínios.

**Critério de Aceite:** Norma Chat respondendo com base no regimento interno do condomínio; Lighthouse Score verde em todas as categorias.

---

## 5. Matriz de Responsabilidades (RAC)

| Atividade | Responsável | Apoio | Aprovação |
| :--- | :--- | :--- | :--- |
| Edge Functions | Backend Dev | DevOps | Tech Lead |
| Refatoração de Tipos | Frontend Dev | - | Tech Lead |
| Testes E2E | QA/Dev | - | Tech Lead |
| Integração IA | AI Specialist | Backend | CTO |

---

## 6. Próximos Passos Imediatos
1.  **Kick-off da Sprint 0:** Início imediato das Edge Functions de comunicação.
2.  **Sync Diária:** Reuniões de 15 min para remover impedimentos técnicos.
3.  **Go/No-Go Meeting:** Ao final da Sprint 1 para decidir a data oficial de lançamento.

---
*Este roadmap é um documento vivo e deve ser atualizado conforme o progresso das tarefas.*
