# Runbook: Falha em Notificações

## Versix Norma - Incident Response

**Severidade:** 🟡 P2 (High)
**Tempo de Resposta:** 30 minutos
**Stakeholders:** Tech Lead, Product Manager

---

## 1. Sintomas

- ❌ Push notifications não chegando
- ❌ E-mails não sendo enviados
- ❌ SMS de emergência não sendo entregues
- ❌ Notificações in-app não aparecendo
- ❌ Backlog de notificações crescendo

---

## 2. Diagnóstico Inicial (5 min)

### 2.1 Verificar Pipeline de Notificações

```sql
-- 1. Notificações pendentes nas últimas 2 horas
SELECT
  n.id,
  n.tipo,
  n.canal,
  n.status,
  n.tentativas,
  n.created_at,
  n.enviado_em,
  c.nome as condominio
FROM notificacoes n
LEFT JOIN condominios c ON c.id = n.condominio_id
WHERE n.created_at > NOW() - INTERVAL '2 hours'
  AND n.status IN ('pendente', 'processando', 'erro')
ORDER BY n.created_at DESC
LIMIT 100;

-- 2. Taxa de entrega nas últimas 24h
SELECT
  canal,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'enviado') as enviados,
  COUNT(*) FILTER (WHERE status = 'erro') as erros,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'enviado') / COUNT(*), 2) as taxa_entrega
FROM notificacoes
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY canal;

-- 3. Backlog acumulado
SELECT
  COUNT(*) as backlog_total,
  MIN(created_at) as mais_antiga
FROM notificacoes
WHERE status = 'pendente';
```

### 2.2 Identificar Canal Afetado

| Canal      | Check                                    |
| ---------- | ---------------------------------------- |
| **Push**   | Verificar Firebase Cloud Messaging (FCM) |
| **Email**  | Verificar provedor (SendGrid/Resend)     |
| **SMS**    | Verificar provedor (Twilio)              |
| **In-App** | Verificar tabela `notificacoes_entrega`  |

---

## 3. Respostas Imediatas

### 3.1 Se Provedor Externo Offline (P2)

```sql
-- 1. Pausar envios para o canal afetado
UPDATE configuracao_global
SET valor = jsonb_set(
  valor,
  '{notificacoes,canais_ativos}',
  (valor->'notificacoes'->'canais_ativos') - 'push'::text  -- remover canal
)
WHERE chave = 'sistema';

-- 2. Redirecionar para canal alternativo (se crítico)
UPDATE notificacoes
SET canal = 'email',
    status = 'pendente',
    tentativas = 0
WHERE status = 'erro'
  AND canal = 'push'
  AND urgente = true;  -- apenas notificações urgentes
```

### 3.2 Se Rate Limit / Cota Excedida (P2)

```sql
-- 1. Verificar volume de envios
SELECT
  DATE_TRUNC('hour', created_at) as hora,
  canal,
  COUNT(*) as total
FROM notificacoes
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hora, canal
ORDER BY hora DESC;

-- 2. Priorizar notificações críticas
UPDATE notificacoes
SET prioridade = CASE
  WHEN tipo IN ('emergencia', 'pagamento') THEN 1
  WHEN tipo IN ('comunicado_urgente') THEN 2
  ELSE 3
END
WHERE status = 'pendente';

-- 3. Processar por prioridade
SELECT processar_notificacoes_por_prioridade(limite := 1000);
```

### 3.3 Se Erro de Configuração (P1)

```sql
-- 1. Verificar tokens/credenciais inválidas
SELECT DISTINCT
  erro_detalhe
FROM notificacoes
WHERE status = 'erro'
  AND created_at > NOW() - INTERVAL '1 hour'
  AND erro_detalhe LIKE '%401%' OR erro_detalhe LIKE '%403%';

-- 2. Validar configurações de canal
SELECT * FROM configuracao_global WHERE chave = 'notificacoes';

-- 3. Se necessário, regenerar tokens
-- (via Supabase Dashboard -> Settings -> API)
```

---

## 4. Investigação Profunda (15 min)

### 4.1 Análise por Canal

#### Push Notifications (FCM)

```bash
# Verificar status do Firebase
curl -X POST https://fcm.googleapis.com/v1/projects/YOUR_PROJECT/messages:send \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{"validate_only": true, "message": {"token": "test"}}'

# Logs do Supabase Edge Function
npx supabase functions logs enviar-notificacao --tail 100
```

```sql
-- Tokens inválidos (precisa refresh)
SELECT
  u.id,
  u.nome,
  u.push_token,
  n.erro_detalhe
FROM usuarios u
JOIN notificacoes n ON n.usuario_id = u.id
WHERE n.status = 'erro'
  AND n.canal = 'push'
  AND n.erro_detalhe LIKE '%token%invalid%';
```

#### Email (SendGrid/Resend)

```bash
# Verificar status do SendGrid
curl -X GET https://api.sendgrid.com/v3/alerts \
  -H "Authorization: Bearer $SENDGRID_API_KEY"

# Test send
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@versixnorma.com.br"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```

```sql
-- E-mails bounced/spam
SELECT
  u.email,
  COUNT(*) as erros,
  MAX(n.erro_detalhe) as ultimo_erro
FROM usuarios u
JOIN notificacoes n ON n.usuario_id = u.id
WHERE n.status = 'erro'
  AND n.canal = 'email'
  AND n.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.email
HAVING COUNT(*) > 3;
```

#### SMS (Twilio)

```bash
# Verificar status do Twilio
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json?PageSize=20" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

```sql
-- SMS não entregues
SELECT
  u.telefone,
  COUNT(*) as erros
FROM usuarios u
JOIN notificacoes n ON n.usuario_id = u.id
WHERE n.status = 'erro'
  AND n.canal = 'sms'
  AND n.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.telefone;
```

### 4.2 Verificar Integridade de Dados

```sql
-- 1. Notificações órfãs (sem usuário/condomínio)
SELECT n.*
FROM notificacoes n
LEFT JOIN usuarios u ON u.id = n.usuario_id
WHERE n.usuario_id IS NOT NULL
  AND u.id IS NULL;

-- 2. Usuários sem preferências de notificação
SELECT u.*
FROM usuarios u
LEFT JOIN notificacoes_preferencias np ON np.usuario_id = u.id
WHERE np.id IS NULL
  AND u.created_at < NOW() - INTERVAL '7 days';

-- 3. Dead letter queue (notificações com >5 tentativas)
SELECT COUNT(*) as dlq_size
FROM notificacoes
WHERE status = 'erro'
  AND tentativas >= 5;
```

---

## 5. Resolução

### 5.1 Reprocessar Notificações Falhadas

```sql
-- 1. Resetar notificações para retry (máximo 500 por vez)
WITH a_reprocessar AS (
  SELECT id FROM notificacoes
  WHERE status = 'erro'
    AND tentativas < 5
    AND created_at > NOW() - INTERVAL '24 hours'
  ORDER BY
    CASE
      WHEN urgente THEN 1
      WHEN tipo = 'emergencia' THEN 2
      ELSE 3
    END,
    created_at DESC
  LIMIT 500
)
UPDATE notificacoes
SET status = 'pendente',
    proximo_retry = NOW()
WHERE id IN (SELECT id FROM a_reprocessar);

-- 2. Monitorar taxa de sucesso
SELECT
  COUNT(*) as total_reprocessadas,
  COUNT(*) FILTER (WHERE status = 'enviado') as sucesso,
  COUNT(*) FILTER (WHERE status = 'erro') as falha
FROM notificacoes
WHERE updated_at > NOW() - INTERVAL '10 minutes';
```

### 5.2 Limpar Dead Letter Queue

```sql
-- Notificações com >5 tentativas movidas para auditoria
INSERT INTO notificacoes_auditoria (
  notificacao_id,
  motivo_falha,
  tentativas,
  dados_originais
)
SELECT
  id,
  'Falha após 5 tentativas - DLQ',
  tentativas,
  to_jsonb(notificacoes.*)
FROM notificacoes
WHERE status = 'erro'
  AND tentativas >= 5;

-- Deletar da tabela principal
DELETE FROM notificacoes
WHERE status = 'erro'
  AND tentativas >= 5
  AND created_at < NOW() - INTERVAL '7 days';
```

### 5.3 Refresh de Tokens Inválidos

```sql
-- 1. Marcar tokens inválidos para refresh
UPDATE usuarios
SET push_token_valido = false,
    push_token_refresh_em = NOW()
WHERE id IN (
  SELECT DISTINCT usuario_id
  FROM notificacoes
  WHERE status = 'erro'
    AND canal = 'push'
    AND erro_detalhe LIKE '%token%invalid%'
);

-- 2. App fará refresh automático no próximo login
```

---

## 6. Pós-Incidente

### 6.1 Checklist

- [ ] Confirmar que backlog foi processado (< 100 pendentes)
- [ ] Verificar taxa de entrega normalizada (> 95%)
- [ ] Limpar DLQ
- [ ] Atualizar configurações de rate limit se necessário
- [ ] Documentar causa raiz
- [ ] Revisar alertas de monitoramento

### 6.2 Relatório de Impacto

```sql
-- Relatório de notificações perdidas
SELECT
  canal,
  tipo,
  COUNT(*) as total_perdidas,
  COUNT(DISTINCT usuario_id) as usuarios_afetados
FROM notificacoes
WHERE created_at BETWEEN 'INICIO_INCIDENTE' AND 'FIM_INCIDENTE'
  AND status = 'erro'
  AND tentativas >= 5
GROUP BY canal, tipo;
```

---

## 7. Prevenção

### 7.1 Alertas

```sql
-- Taxa de erro > 10% em 15 minutos
CREATE OR REPLACE FUNCTION alerta_notificacoes_erro()
RETURNS trigger AS $$
DECLARE
  taxa_erro numeric;
BEGIN
  SELECT
    100.0 * COUNT(*) FILTER (WHERE status = 'erro') / NULLIF(COUNT(*), 0)
  INTO taxa_erro
  FROM notificacoes
  WHERE created_at > NOW() - INTERVAL '15 minutes';

  IF taxa_erro > 10 THEN
    PERFORM net.http_post(
      url := 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
      body := jsonb_build_object(
        'text', '⚠️ Taxa de erro em notificações: ' || taxa_erro || '%'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Retry Strategy

```typescript
// apps/web/src/lib/notification-retry.ts
const retryConfig = {
  maxAttempts: 5,
  backoff: [1, 5, 15, 60, 300], // segundos

  async retry(fn: () => Promise<any>, attempt = 0) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= this.maxAttempts) {
        // Enviar para DLQ
        throw error;
      }

      const delay = this.backoff[attempt] * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retry(fn, attempt + 1);
    }
  },
};
```

---

## 8. Contatos de Escalação

| Role                 | Nome   | Canal          | SLA    |
| -------------------- | ------ | -------------- | ------ |
| **On-Call Engineer** | [NOME] | Slack: @oncall | 15 min |
| **Tech Lead**        | [NOME] | Phone: +55...  | 30 min |
| **Product Manager**  | [NOME] | Slack: @pm     | 1 hora |

---

## 9. Referências

- [Firebase Console](https://console.firebase.google.com/)
- [SendGrid Dashboard](https://app.sendgrid.com/)
- [Twilio Console](https://console.twilio.com/)
- [Dashboard de Notificações](https://app.versixnorma.com.br/admin/notificacoes)
- [Sentry - Notificações](https://sentry.io/...)

---

**Última Atualização:** 02/01/2026
**Versão:** 1.0
**Owner:** Tech Lead
