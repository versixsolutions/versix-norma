# Versix Norma - CI/CD Setup

## 🔐 Secrets Necessários no GitHub

Para que o CI/CD funcione corretamente, adicione estes secrets no GitHub:

**Settings → Secrets and variables → Actions → New repository secret**

### Secrets OBRIGATÓRIOS:
```
VERCEL_TOKEN=5YRHbVBV5TVFsdR9NnQL5d0C
VERCEL_ORG_ID=team_lNqNbfRVjG1TSb57laOCzfWd
VERCEL_PROJECT_ID=prj_ZJNJraYsEoF3yyAH76RYsZkd2zmt
NEXT_PUBLIC_SUPABASE_URL=https://udryfalkvulhzoahgvqc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcnlmYWxrdnVsaHpvYWhndnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMDU1NjksImV4cCI6MjA4MTg4MTU2OX0.KT-uZUchS43ZiAK54OOFAmSX8TF6HTqsU4Qg6WM927c
```

### Secrets RECOMENDADOS:
```
NEXT_PUBLIC_APP_URL=https://app.versixnorma.com.br
NEXT_PUBLIC_APP_NAME=Versix Norma
NEXT_PUBLIC_DEMO_CONDOMINIO_ID=your_demo_condominio_id
NEXT_PUBLIC_DEMO_CODIGO_CONVITE=your_demo_code
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_NORMA_AI=true
```

## 🚀 Como Testar

Após adicionar os secrets, faça um push para a branch `main` para testar o workflow:

```bash
git commit --allow-empty -m "test: trigger ci/cd pipeline"
git push origin main
```

## 📊 Pipeline CI/CD

O workflow executa 4 jobs em sequência:

1. **Lint & Type Check** - Validação de código
2. **Build** - Compilação da aplicação
3. **Deploy Preview** - Deploy para PRs
4. **Deploy Production** - Deploy para produção (main)

## 🔍 Monitoramento

- **GitHub Actions**: [github.com/versixsolutions/versix-norma/actions](https://github.com/versixsolutions/versix-norma/actions)
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

## 🛡️ Segurança

✅ Credenciais removidas do código
✅ Secrets armazenados de forma segura
✅ Variáveis de ambiente validadas
✅ Build isolado com artifacts