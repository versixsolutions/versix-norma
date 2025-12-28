# VERSIX NORMA - Detalhamento Técnico: Sprint 0 (The Launchpad)
**Duração Estimada:** 48 Horas
**Prioridade:** Bloqueadores P0 (Críticos para Produção)

---

## 1. Task Force: Mensageria & Notificações
**Objetivo:** Ativar o motor de comunicação multicanal do sistema.

### Tarefa 0.1: Implementação da Edge Function `send-email`
*   **Descrição:** Criar a função no Supabase para disparar e-mails via SendGrid.
*   **Ações Técnicas:**
    *   Configurar o client do SendGrid dentro da função.
    *   Implementar o template de e-mail padrão da Versix (HTML/CSS).
    *   Integrar com a tabela `notificacoes_entregas` para atualizar o status após o envio.
*   **Responsável Sugerido:** Backend Developer (Especialista em Node.js/Deno).
*   **Critério de Sucesso:** E-mail de boas-vindas recebido em < 5 segundos após o cadastro.

### Tarefa 0.2: Implementação da Edge Function `send-sms` & `send-push`
*   **Descrição:** Ativar o envio de SMS (Twilio) e Push Notifications (Firebase Cloud Messaging).
*   **Ações Técnicas:**
    *   Configurar SDK do Twilio para alertas urgentes (SOS).
    *   Configurar o Firebase Admin SDK para notificações em tempo real no PWA.
*   **Responsável Sugerido:** Backend Developer / DevOps.
*   **Critério de Sucesso:** Notificação Push aparecendo no dispositivo móvel em modo background.

---

## 2. Task Force: Estrutura & Roteamento
**Objetivo:** Corrigir erros de navegação e inconsistências de diretórios.

### Tarefa 0.3: Refatoração do Módulo de Observabilidade
*   **Descrição:** Corrigir o erro de digitação e a estrutura de rotas do Next.js App Router.
*   **Ações Técnicas:**
    *   `mv apps/web/src/app/admin/observalidade apps/web/src/app/admin/observabilidade`.
    *   Renomear `observabilidade.tsx` para `page.tsx` dentro do novo diretório.
    *   Atualizar todos os imports que referenciam o caminho antigo.
*   **Responsável Sugerido:** Frontend Developer (Senior).
*   **Critério de Sucesso:** Acesso direto via URL `/admin/observabilidade` renderizando o dashboard sem erros.

---

## 3. Task Force: Configuração & Assets
**Objetivo:** Garantir que o ambiente de produção tenha todos os recursos necessários.

### Tarefa 0.4: Provisionamento de Variáveis de Ambiente (Secrets)
*   **Descrição:** Configurar o cofre de chaves para o ambiente de produção.
*   **Ações Técnicas:**
    *   Adicionar `SENDGRID_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `FCM_SERVER_KEY`.
    *   Configurar `NEXT_PUBLIC_SENTRY_DSN` no Vercel/Supabase.
*   **Responsável Sugerido:** Tech Lead / DevOps.
*   **Critério de Sucesso:** Build de produção concluído com sucesso e logs do Sentry ativos.

### Tarefa 0.5: Finalização de Assets PWA
*   **Descrição:** Incluir imagens de branding faltantes para instalação do app.
*   **Ações Técnicas:**
    *   Adicionar `home.png` (1280x720) e `mobile.png` (750x1334) em `apps/web/public/screenshots/`.
    *   Validar o `manifest.json` usando o Chrome DevTools (Application Tab).
*   **Responsável Sugerido:** UI/UX Designer ou Frontend Developer.
*   **Critério de Sucesso:** "Install App" disponível no navegador com preview das telas.

---

## Resumo de Alocação (Sprint 0)

| Responsável | Carga Horária Est. | Tarefas |
| :--- | :---: | :--- |
| **Backend Dev** | 16h | 0.1, 0.2 |
| **Frontend Dev** | 8h | 0.3, 0.5 |
| **Tech Lead / DevOps** | 8h | 0.4 |

---
**Atenção:** Esta Sprint deve ser executada em regime de "War Room". Qualquer impedimento deve ser escalado imediatamente para o Tech Lead.
