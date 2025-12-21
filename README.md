# Versix Norma

> Gestão Inteligente de Condomínios | SaaS Multi-tenant | PWA Offline-First | IA Integrada

```
██╗   ██╗███████╗██████╗ ███████╗██╗██╗  ██╗
██║   ██║██╔════╝██╔══██╗██╔════╝██║╚██╗██╔╝
██║   ██║█████╗  ██████╔╝███████╗██║ ╚███╔╝
╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██║ ██╔██╗
 ╚████╔╝ ███████╗██║  ██║███████║██║██╔╝ ██╗
  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝

███╗   ██╗ ██████╗ ██████╗ ███╗   ███╗ █████╗
████╗  ██║██╔═══██╗██╔══██╗████╗ ████║██╔══██╗
██╔██╗ ██║██║   ██║██████╔╝██╔████╔██║███████║
██║╚██╗██║██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║
██║ ╚████║╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║
╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝
```

## 🎯 Sobre

**Versix Norma** é uma plataforma completa de gestão condominial que combina:

- 🏢 **Governança Digital** — Assembleias híbridas, votação auditável, transparência financeira
- 🤖 **IA Assistente (Norma)** — Atendimento 24/7, RAG contextual, multicanal
- 📱 **PWA Offline-First** — Modo Pânico, push notifications, biometria
- 🔌 **Integrações** — Portarias, contabilidade, calendários, webhooks
- 📊 **Observabilidade** — Métricas, alertas, tracing distribuído

## 🛠️ Stack Tecnológica

| Camada             | Tecnologia                                               |
| ------------------ | -------------------------------------------------------- |
| **Frontend**       | Next.js 14+, React 18, Tailwind CSS, shadcn/ui           |
| **Backend**        | Supabase (PostgreSQL, Auth, Storage, Realtime)           |
| **Edge Functions** | Deno (Supabase Edge Functions)                           |
| **IA**             | Groq (LLM), HuggingFace (Embeddings), Qdrant (Vector DB) |
| **Infra**          | Vercel, GitHub Actions                                   |
| **Monorepo**       | Turborepo + pnpm                                         |

## 📁 Estrutura do Projeto

```
versix-norma/
├── apps/
│   └── web/                    # Frontend Next.js (Sprint 9+)
├── packages/
│   ├── database/               # Tipos gerados do Supabase
│   └── shared/                 # Constantes, utils, validators
├── supabase/
│   ├── functions/              # Edge Functions
│   ├── migrations/             # SQL migrations
│   └── config.toml             # Configuração local
├── docs/                       # Documentação técnica
└── .github/workflows/          # CI/CD
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- pnpm 8+
- Docker Desktop (para Supabase local)
- Conta Supabase

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/versix/versix-norma.git
cd versix-norma

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# 4. Verifique o ambiente
pnpm doctor

# 5. Inicie o Supabase local (requer Docker)
pnpm supabase:start

# 6. Rode o projeto
pnpm dev
```

### Scripts Disponíveis

| Script                    | Descrição                            |
| ------------------------- | ------------------------------------ |
| `pnpm dev`                | Inicia ambiente de desenvolvimento   |
| `pnpm build`              | Build de produção                    |
| `pnpm lint`               | Verifica código com ESLint           |
| `pnpm type-check`         | Verifica tipos TypeScript            |
| `pnpm format`             | Formata código com Prettier          |
| `pnpm doctor`             | Verifica ambiente de desenvolvimento |
| `pnpm supabase:start`     | Inicia Supabase local                |
| `pnpm supabase:gen-types` | Gera tipos do banco                  |

## 📚 Documentação

A documentação completa está na pasta `/docs`:

| Sprint | Descrição              | Status |
| ------ | ---------------------- | ------ |
| 0      | Fundação (Setup)       | ✅     |
| 1      | Schema Core            | 🔄     |
| 2      | Auth & SuperAdmin      | ⏳     |
| 3      | Assembleias            | ⏳     |
| 4      | Financeiro             | ⏳     |
| 5      | IA (Norma)             | ⏳     |
| 6      | Biblioteca & Chamados  | ⏳     |
| 7      | Comunicação Multicanal | ⏳     |
| 8      | Integrações            | ⏳     |
| 9      | Mobile & PWA           | ⏳     |
| 10     | Observabilidade        | ⏳     |

## 🔐 Segurança

- **RLS (Row Level Security)** em todas as tabelas
- **Multi-tenant** com isolamento por `condominio_id`
- **Auditoria** completa de ações
- **LGPD** compliance

## 🤝 Contribuição

Este é um projeto privado da Versix Solutions.

## 📄 Licença

Proprietária - Todos os direitos reservados.

---

**Versix Norma** v1.0.1 | © 2024 Versix Solutions
