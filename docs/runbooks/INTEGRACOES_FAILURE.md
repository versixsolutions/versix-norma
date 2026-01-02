# Runbook: Falha em Integrações Externas

## Versix Norma - Incident Response

**Severidade:** 🔴 P1 (Critical) / 🟡 P2 (High)
**Tempo de Resposta:** 15 minutos
**Stakeholders:** Tech Lead, Backend Engineer, Product Manager

---

## 1. Sintomas

- ❌ Webhooks não estão sendo entregues
- ❌ Conectores de API (Asaas, Pagar.me) retornam erro
- ❌ Timeout em chamadas externas
- ❌ Aumento súbito de erros 5xx em integrações

---

## 2. Diagnóstico Inicial (5 min)

### 2.1 Verificar Status da Integração

```bash
# 1. Acessar dashboard de integrações
https://app.versixnorma.com.br/sindico/integracoes

# 2. Verificar logs recentes
SELECT * FROM integracoes_log
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 50;

# 3. Verificar status do provedor externo
# - Asaas: https://status.asaas.com/
# - Pagar.me: https://status.pagar.me/
```

### 2.2 Identificar Escopo

| Pergunta                      | Ação                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------- |
| Afeta todos os condomínios?   | Query: `SELECT DISTINCT condominio_id FROM integracoes_log WHERE status = 'erro'` |
| Afeta um provedor específico? | Filtrar por `provider`                                                            |
| Erro é intermitente ou total? | Verificar taxa de sucesso/falha                                                   |

---

## 3. Respostas Imediatas

### 3.1 Se Provedor Está Offline (P2)

```sql
-- 1. Pausar tentativas automáticas
UPDATE integracoes
SET status = 'pausada',
    pausada_em = NOW(),
    motivo_pausa = 'Provedor offline - Incident INC-XXXXX'
WHERE provider = 'asaas'
  AND status = 'ativa';

-- 2. Notificar síndicos afetados
INSERT INTO notificacoes (titulo, corpo, tipo, condominio_id)
SELECT
  'Integração temporariamente pausada',
  'A integração com [PROVEDOR] está temporariamente indisponível. Estamos monitorando e reativaremos assim que normalizar.',
  'sistema',
  condominio_id
FROM integracoes
WHERE provider = 'asaas';
```

### 3.2 Se Erro de Configuração (P1)

```sql
-- 1. Verificar API keys inválidas
SELECT i.id, i.nome, i.provider, c.nome as condominio
FROM integracoes i
JOIN condominios c ON c.id = i.condominio_id
WHERE i.status = 'erro'
  AND i.ultimo_erro LIKE '%401%' OR i.ultimo_erro LIKE '%403%';

-- 2. Re-validar credenciais via RPC
SELECT validar_credenciais_integracao(integration_id);

-- 3. Se validação falhar, marcar como 'requer_reautenticacao'
UPDATE integracoes
SET status = 'requer_reautenticacao',
    requer_acao_usuario = true
WHERE id = 'INTEGRATION_ID';
```

### 3.3 Se Rate Limit (P2)

```sql
-- 1. Verificar volume de requests
SELECT
  provider,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status = 'erro' AND erro_tipo = 'rate_limit') as rate_limit_errors
FROM integracoes_log
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY provider;

-- 2. Implementar backoff exponencial
UPDATE integracoes_config
SET retry_strategy = jsonb_set(
  retry_strategy,
  '{backoff_multiplier}',
  '2'::jsonb
)
WHERE provider IN ('asaas', 'pagarme');
```

---

## 4. Investigação Profunda (15 min)

### 4.1 Análise de Logs

```bash
# Sentry
https://sentry.io/organizations/versix/issues/?query=is%3Aunresolved+integracao

# Supabase Logs
SELECT
  il.*,
  i.nome,
  i.provider
FROM integracoes_log il
JOIN integracoes i ON i.id = il.integracao_id
WHERE il.created_at > NOW() - INTERVAL '6 hours'
  AND il.status = 'erro'
ORDER BY il.created_at DESC;

# Edge Function Logs
npx supabase functions logs webhook-handler --tail 100
```

### 4.2 Verificar Conectividade

```bash
# Test webhook endpoint
curl -X POST https://api.asaas.com/v3/webhooks \
  -H "access_token: YOUR_TOKEN" \
  -d '{"url": "https://app.versixnorma.com.br/api/webhooks/asaas"}'

# Test network from Edge Function
curl -v https://api.asaas.com/v3/customers
```

---

## 5. Resolução

### 5.1 Se Foi Configuração

```sql
-- Reativar integrações após fix
UPDATE integracoes
SET status = 'ativa',
    pausada_em = NULL,
    ultimo_erro = NULL
WHERE status = 'pausada'
  AND motivo_pausa LIKE '%INC-%';
```

### 5.2 Se Foi Provedor

```sql
-- Aguardar confirmação do provedor
-- Monitorar status page
-- Reativar gradualmente (10% -> 50% -> 100%)

-- Reativar 10% primeiro
WITH sample AS (
  SELECT id FROM integracoes
  WHERE status = 'pausada' AND provider = 'asaas'
  ORDER BY RANDOM()
  LIMIT (SELECT COUNT(*) * 0.1 FROM integracoes WHERE status = 'pausada')
)
UPDATE integracoes
SET status = 'ativa'
WHERE id IN (SELECT id FROM sample);
```

---

## 6. Pós-Incidente

### 6.1 Checklist

- [ ] Notificar síndicos que o serviço foi restaurado
- [ ] Documentar causa raiz no incident report
- [ ] Atualizar runbook com learnings
- [ ] Revisar alertas (foram efetivos?)
- [ ] Agendar post-mortem (se P1)

### 6.2 Post-Mortem Template

```markdown
## Incident Report: INC-XXXXX

**Data:** [DATA]
**Duração:** [X minutos]
**Impacto:** [Y condomínios afetados]

### Timeline

- [HH:MM] Alerta disparado
- [HH:MM] Investigação iniciada
- [HH:MM] Causa raiz identificada
- [HH:MM] Fix aplicado
- [HH:MM] Serviço restaurado

### Causa Raiz

[Descrição detalhada]

### Ações de Melhoria

1. [ ] [Ação 1]
2. [ ] [Ação 2]
```

---

## 7. Contatos de Escalação

| Role                 | Nome   | Canal          | SLA    |
| -------------------- | ------ | -------------- | ------ |
| **On-Call Engineer** | [NOME] | Slack: @oncall | 5 min  |
| **Tech Lead**        | [NOME] | Phone: +55...  | 15 min |
| **Product Manager**  | [NOME] | Slack: @pm     | 30 min |

---

## 8. Referências

- [Documentação Asaas API](https://docs.asaas.com/)
- [Documentação Pagar.me](https://docs.pagar.me/)
- [Dashboard de Integrações](https://app.versixnorma.com.br/sindico/integracoes)
- [Sentry - Integrações](https://sentry.io/...)
- [Supabase Dashboard](https://supabase.com/dashboard/project/...)

---

**Última Atualização:** 02/01/2026
**Versão:** 1.0
**Owner:** Tech Lead
