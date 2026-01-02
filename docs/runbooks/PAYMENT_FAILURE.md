# Runbook: Falha em Pagamentos

## Versix Norma - Incident Response

**Severidade:** 🔴 P0 (Critical)
**Tempo de Resposta:** 10 minutos
**Stakeholders:** Tech Lead, Finance Lead, Product Manager, CEO

---

## 1. Sintomas

- ❌ Pagamentos não sendo processados
- ❌ Webhooks de confirmação não chegando
- ❌ Boletos/Pix não sendo gerados
- ❌ Erros na tela de checkout
- ❌ Moradores relatando cobranças duplicadas

---

## 2. Diagnóstico Inicial (3 min)

### 2.1 Verificar Pipeline de Pagamentos

```sql
-- 1. Pagamentos pendentes nas últimas 2 horas
SELECT
  p.id,
  p.status,
  p.valor,
  p.metodo,
  p.provider,
  p.created_at,
  c.nome as condominio,
  u.nome as morador
FROM pagamentos p
JOIN condominios c ON c.id = p.condominio_id
JOIN usuarios u ON u.id = p.usuario_id
WHERE p.created_at > NOW() - INTERVAL '2 hours'
  AND p.status IN ('pendente', 'processando', 'erro')
ORDER BY p.created_at DESC;

-- 2. Taxa de falha nas últimas 24h
SELECT
  DATE_TRUNC('hour', created_at) as hora,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'erro') as erros,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'erro') / COUNT(*), 2) as taxa_erro
FROM pagamentos
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hora
ORDER BY hora DESC;
```

### 2.2 Identificar Escopo

| Pergunta                              | Query                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| Afeta todos os métodos?               | `SELECT metodo, COUNT(*) FROM pagamentos WHERE status = 'erro' GROUP BY metodo`     |
| Afeta um provedor?                    | `SELECT provider, COUNT(*) FROM pagamentos WHERE status = 'erro' GROUP BY provider` |
| É erro de validação ou processamento? | Verificar campo `erro_detalhe`                                                      |

---

## 3. Respostas Imediatas

### 3.1 Se Provedor de Pagamento Está Offline (P0)

```sql
-- 1. URGENTE: Ativar fallback de pagamento
UPDATE configuracao_global
SET valor = jsonb_set(
  valor,
  '{pagamentos,fallback_enabled}',
  'true'::jsonb
)
WHERE chave = 'sistema';

-- 2. Redirecionar para provedor secundário
UPDATE configuracao_global
SET valor = jsonb_set(
  valor,
  '{pagamentos,provider_prioritario}',
  '"pagarme"'::jsonb  -- ou "asaas" dependendo do fallback
)
WHERE chave = 'sistema';

-- 3. Notificar síndicos IMEDIATAMENTE
INSERT INTO notificacoes (titulo, corpo, tipo, urgente, condominio_id)
SELECT
  '⚠️ Sistema de pagamentos em manutenção',
  'Estamos com instabilidade temporária no processamento de pagamentos. Pagamentos serão processados assim que normalizar. Nenhuma cobrança será perdida.',
  'sistema',
  true,
  id
FROM condominios;
```

### 3.2 Se Erro de Validação (P1)

```sql
-- 1. Identificar validações falhando
SELECT
  erro_detalhe,
  COUNT(*) as ocorrencias
FROM pagamentos
WHERE status = 'erro'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY erro_detalhe
ORDER BY ocorrencias DESC;

-- 2. Se erro de CPF/CNPJ inválido
UPDATE pagamentos
SET status = 'requer_correcao',
    erro_detalhe = 'Documento inválido - aguardando correção do usuário'
WHERE status = 'erro'
  AND erro_detalhe LIKE '%cpf%' OR erro_detalhe LIKE '%cnpj%';

-- 3. Notificar usuários para corrigir dados
-- (via job background)
```

### 3.3 Se Duplicação de Cobrança (P0)

```sql
-- 1. URGENTE: Identificar duplicatas
WITH duplicatas AS (
  SELECT
    usuario_id,
    lancamento_id,
    COUNT(*) as qtd
  FROM pagamentos
  WHERE created_at > NOW() - INTERVAL '24 hours'
    AND status IN ('aprovado', 'processando')
  GROUP BY usuario_id, lancamento_id
  HAVING COUNT(*) > 1
)
SELECT
  p.*,
  u.nome,
  u.email
FROM duplicatas d
JOIN pagamentos p ON p.usuario_id = d.usuario_id AND p.lancamento_id = d.lancamento_id
JOIN usuarios u ON u.id = p.usuario_id;

-- 2. Cancelar pagamentos duplicados (manter o primeiro)
WITH duplicatas AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY usuario_id, lancamento_id ORDER BY created_at) as rn
  FROM pagamentos
  WHERE created_at > NOW() - INTERVAL '24 hours'
    AND status IN ('aprovado', 'processando')
)
UPDATE pagamentos
SET status = 'cancelado',
    cancelado_em = NOW(),
    motivo_cancelamento = 'Cobrança duplicada - Incident INC-XXXXX'
WHERE id IN (SELECT id FROM duplicatas WHERE rn > 1);

-- 3. Iniciar processo de estorno imediato
-- (acionar equipe financeira)
```

---

## 4. Investigação Profunda (10 min)

### 4.1 Análise de Logs

```bash
# Sentry - Erros de pagamento
https://sentry.io/organizations/versix/issues/?query=is%3Aunresolved+pagamento

# Supabase Edge Function Logs
npx supabase functions logs processar-pagamento --tail 200

# Logs do provider
# Asaas: https://www.asaas.com/api/v3/payments?status=ERROR
# Pagar.me: Dashboard -> Transações -> Filtrar por "failed"
```

### 4.2 Verificar Integridade de Dados

```sql
-- 1. Pagamentos órfãos (sem lançamento)
SELECT p.*
FROM pagamentos p
LEFT JOIN lancamentos l ON l.id = p.lancamento_id
WHERE l.id IS NULL
  AND p.created_at > NOW() - INTERVAL '7 days';

-- 2. Pagamentos sem webhook de confirmação (> 5 min)
SELECT p.*
FROM pagamentos p
LEFT JOIN webhooks_log w ON w.referencia_id = p.id::text
WHERE p.status = 'processando'
  AND p.created_at < NOW() - INTERVAL '5 minutes'
  AND w.id IS NULL;

-- 3. Valores inconsistentes
SELECT
  p.*,
  l.valor as valor_lancamento
FROM pagamentos p
JOIN lancamentos l ON l.id = p.lancamento_id
WHERE ABS(p.valor - l.valor) > 0.01;
```

### 4.3 Verificar Conectividade com Providers

```bash
# Test Asaas API
curl -X GET https://www.asaas.com/api/v3/payments \
  -H "access_token: $ASAAS_API_KEY" \
  -H "Content-Type: application/json"

# Test Pagar.me API
curl -X GET https://api.pagar.me/core/v5/orders \
  -H "Authorization: Bearer $PAGARME_API_KEY" \
  -H "Content-Type: application/json"

# Test network from Edge Function
npx supabase functions invoke processar-pagamento --data '{"test": true}'
```

---

## 5. Resolução

### 5.1 Se Foi Provedor

```sql
-- 1. Aguardar confirmação de normalização
-- 2. Reprocessar pagamentos que falharam

-- Reprocessar em lote (máximo 100 por vez)
WITH a_reprocessar AS (
  SELECT id FROM pagamentos
  WHERE status = 'erro'
    AND provider = 'asaas'
    AND created_at > NOW() - INTERVAL '2 hours'
  ORDER BY created_at DESC
  LIMIT 100
)
UPDATE pagamentos
SET status = 'pendente',
    tentativas = COALESCE(tentativas, 0) + 1,
    proximo_retry = NOW()
WHERE id IN (SELECT id FROM a_reprocessar);

-- 3. Monitorar taxa de sucesso
```

### 5.2 Se Foi Código

```sql
-- 1. Deploy do fix
git pull origin main
npm run build
npm run deploy

-- 2. Verificar se fix resolveu
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'aprovado') as aprovados,
  COUNT(*) FILTER (WHERE status = 'erro') as erros
FROM pagamentos
WHERE created_at > NOW() - INTERVAL '10 minutes';

-- 3. Se erro persistir, rollback imediato
git revert HEAD
npm run deploy
```

### 5.3 Se Foi Webhook

```sql
-- 1. Reprocessar webhooks perdidos
SELECT processar_webhooks_perdidos(
  provider := 'asaas',
  desde := NOW() - INTERVAL '2 hours'
);

-- 2. Verificar se pagamentos foram atualizados
SELECT COUNT(*)
FROM pagamentos
WHERE status = 'processando'
  AND created_at < NOW() - INTERVAL '10 minutes';
```

---

## 6. Pós-Incidente

### 6.1 Checklist Financeiro

- [ ] Validar que TODOS os pagamentos foram processados corretamente
- [ ] Verificar se há duplicatas para estornar
- [ ] Conferir se cobranças foram geradas para todos os lançamentos
- [ ] Notificar usuários afetados
- [ ] Reconciliar valores com providers (relatório de fechamento)
- [ ] Atualizar documentação financeira

### 6.2 Comunicação

```sql
-- Notificar síndicos quando resolvido
INSERT INTO notificacoes (titulo, corpo, tipo, condominio_id)
SELECT
  '✅ Sistema de pagamentos normalizado',
  'O sistema de pagamentos foi restaurado. Todos os pagamentos pendentes foram processados com sucesso.',
  'sistema',
  id
FROM condominios;
```

### 6.3 Relatório de Impacto

```sql
-- Gerar relatório de impacto
SELECT
  'Total de pagamentos afetados' as metrica,
  COUNT(*) as valor
FROM pagamentos
WHERE created_at BETWEEN 'INICIO_INCIDENTE' AND 'FIM_INCIDENTE'
  AND status IN ('erro', 'cancelado')
UNION ALL
SELECT
  'Valor total (R$)' as metrica,
  SUM(valor) as valor
FROM pagamentos
WHERE created_at BETWEEN 'INICIO_INCIDENTE' AND 'FIM_INCIDENTE'
  AND status IN ('erro', 'cancelado')
UNION ALL
SELECT
  'Condomínios impactados' as metrica,
  COUNT(DISTINCT condominio_id) as valor
FROM pagamentos
WHERE created_at BETWEEN 'INICIO_INCIDENTE' AND 'FIM_INCIDENTE'
  AND status IN ('erro', 'cancelado');
```

---

## 7. Prevenção

### 7.1 Alertas Críticos

```sql
-- Configurar alertas no Supabase
-- Taxa de erro > 5% em 5 minutos
CREATE OR REPLACE FUNCTION alerta_pagamentos_erro()
RETURNS trigger AS $$
DECLARE
  taxa_erro numeric;
BEGIN
  SELECT
    100.0 * COUNT(*) FILTER (WHERE status = 'erro') / COUNT(*)
  INTO taxa_erro
  FROM pagamentos
  WHERE created_at > NOW() - INTERVAL '5 minutes';

  IF taxa_erro > 5 THEN
    -- Disparar alerta (webhook para Slack/PagerDuty)
    PERFORM net.http_post(
      url := 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
      body := jsonb_build_object(
        'text', '🚨 ALERTA: Taxa de erro em pagamentos: ' || taxa_erro || '%'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Circuit Breaker

```typescript
// apps/web/src/lib/payment-circuit-breaker.ts
const circuitBreaker = {
  failures: 0,
  threshold: 5,
  timeout: 60000, // 1 minuto
  state: 'closed', // closed | open | half-open

  async execute(fn: () => Promise<any>) {
    if (this.state === 'open') {
      throw new Error('Circuit breaker está aberto - fallback ativado');
    }

    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.state = 'open';
        setTimeout(() => (this.state = 'half-open'), this.timeout);
      }
      throw error;
    }
  },
};
```

---

## 8. Contatos de Escalação

| Role                 | Nome   | Canal         | SLA      |
| -------------------- | ------ | ------------- | -------- |
| **On-Call Engineer** | [NOME] | Phone: +55... | IMEDIATO |
| **Tech Lead**        | [NOME] | Phone: +55... | 5 min    |
| **Finance Lead**     | [NOME] | Phone: +55... | 10 min   |
| **CEO**              | [NOME] | Phone: +55... | 15 min   |

**IMPORTANTE:** Incidentes de pagamento são P0. Acordar qualquer pessoa necessária.

---

## 9. Referências

- [Dashboard Financeiro](https://app.versixnorma.com.br/sindico/financeiro)
- [Asaas Dashboard](https://www.asaas.com/)
- [Pagar.me Dashboard](https://dashboard.pagar.me/)
- [Sentry - Pagamentos](https://sentry.io/...)
- [Documentação Interna - Fluxo de Pagamentos](../docs/PAYMENT_FLOW.md)

---

**Última Atualização:** 02/01/2026
**Versão:** 1.0
**Owner:** Finance Lead + Tech Lead
