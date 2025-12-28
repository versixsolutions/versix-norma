# VERSIX NORMA - Detalhamento Técnico: Sprint 2 (Intelligence & Scale)
**Duração Estimada:** 7 Dias Úteis
**Prioridade:** Ativação da IA e Diferenciação Competitiva

---

## 1. Task Force: IA & RAG (Retrieval-Augmented Generation)
**Objetivo:** Dar "cérebro" à Norma, permitindo que ela responda com base em documentos reais.

### Tarefa 2.1: Implementação da Edge Function `ask-norma`
*   **Descrição:** Desenvolver o núcleo da inteligência artificial no Supabase.
*   **Ações Técnicas:**
    *   Integrar com a API do Groq (Llama 3) ou OpenAI (GPT-4o) para processamento de linguagem natural.
    *   Implementar a lógica de busca vetorial (pgvector) para recuperar trechos do regimento interno e atas.
    *   Configurar o sistema de "System Prompt" para garantir que a Norma atue como uma assistente de governança profissional.
*   **Responsável Sugerido:** AI Engineer / Backend Developer.
*   **Critério de Sucesso:** Respostas coerentes baseadas em documentos carregados no banco de dados.

### Tarefa 2.2: Pipeline de Ingestão de Documentos (Embeddings)
*   **Descrição:** Converter PDFs de regimentos e atas em vetores pesquisáveis.
*   **Ações Técnicas:**
    *   Criar uma Edge Function `process-document` que extrai texto de PDFs.
    *   Gerar embeddings (via OpenAI `text-embedding-3-small`) e salvar na tabela vetorial.
    *   Implementar o chunking inteligente para manter o contexto dos artigos e parágrafos.
*   **Responsável Sugerido:** Backend Developer.
*   **Critério de Sucesso:** Documentos novos tornam-se "conhecimento" da Norma em menos de 2 minutos após o upload.

---

## 2. Task Force: UX & Interface Inteligente
**Objetivo:** Prover uma experiência de chat moderna, fluida e transparente.

### Tarefa 2.3: Streaming de Respostas e UI de Citações
*   **Descrição:** Implementar o recebimento de mensagens em tempo real (streaming) e exibição de fontes.
*   **Ações Técnicas:**
    *   Refatorar o hook `useNormaChat.ts` para suportar Server-Sent Events (SSE).
    *   Atualizar o componente `NormaChat.tsx` para renderizar as citações e fontes de forma clicável.
    *   Adicionar animações de "digitando" mais orgânicas e feedback visual de processamento.
*   **Responsável Sugerido:** Frontend Developer (Senior).
*   **Critério de Sucesso:** Usuário vê a resposta sendo escrita palavra por palavra, com links diretos para os documentos citados.

### Tarefa 2.4: Sugestões Contextuais Dinâmicas
*   **Descrição:** Gerar botões de sugestão baseados no perfil do usuário e histórico.
*   **Ações Técnicas:**
    *   Implementar lógica que sugere "Reservar Salão" se o usuário for morador, ou "Ver Inadimplência" se for síndico.
    *   Integrar as sugestões com as rotas internas do app para navegação rápida.
*   **Responsável Sugerido:** Frontend Developer.
*   **Critério de Sucesso:** Aumento no CTR (Click-Through Rate) das sugestões iniciais do chat.

---

## 3. Task Force: Escala & Performance Final
**Objetivo:** Garantir que o sistema suporte o lançamento oficial com alta performance.

### Tarefa 2.5: Auditoria Lighthouse & Web Vitals
*   **Descrição:** Otimizar o carregamento para atingir nota máxima nos motores de busca e dispositivos móveis.
*   **Ações Técnicas:**
    *   Otimizar o bundle size do Next.js (remover dependências não utilizadas).
    *   Implementar Image Optimization para logos de condomínios e avatares.
    *   Garantir que o TBT (Total Blocking Time) seja inferior a 200ms.
*   **Responsável Sugerido:** Frontend Developer / DevOps.
*   **Critério de Sucesso:** Score > 90 em todas as categorias do Lighthouse (Mobile).

### Tarefa 2.6: Revisão Final de Segurança (RLS)
*   **Descrição:** Teste de estresse nas políticas de isolamento de dados.
*   **Ações Técnicas:**
    *   Executar scripts de teste que tentam acessar dados de Condomínio B logado como Usuário do Condomínio A.
    *   Validar se as Edge Functions respeitam o `service_role` apenas quando estritamente necessário.
*   **Responsável Sugerido:** Tech Lead / Security Specialist.
*   **Critério de Sucesso:** Zero vazamento de dados entre tenants (condomínios) em testes de penetração básicos.

---

## Resumo de Alocação (Sprint 2)

| Responsável | Carga Horária Est. | Tarefas |
| :--- | :---: | :--- |
| **AI / Backend Dev** | 24h | 2.1, 2.2 |
| **Frontend Dev (Senior)** | 20h | 2.3, 2.4, 2.5 |
| **Tech Lead** | 8h | 2.6 |

---
**Visão Final:** Ao término desta Sprint, o Versix Norma deixa de ser apenas um software de gestão e torna-se uma plataforma de governança assistida por IA, pronta para escalar e dominar o mercado.
