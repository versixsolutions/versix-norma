# Runbook: Falha no Sistema de Emergências

## Versix Norma - Incident Response

**Severidade:** 🔴 P0 (Critical)
**Tempo de Resposta:** 5 minutos
**Stakeholders:** Tech Lead, Product Manager, CEO, Legal

---

## ⚠️ ATENÇÃO CRÍTICA

**Este sistema lida com emergências reais (incêndio, invasão, médica, etc.). Falhas podem colocar vidas em risco.**

**PRIORIDADE MÁXIMA:** Restaurar funcionalidade em < 15 minutos ou ativar plano de contingência manual.

---

## 1. Sintomas

- ❌ Botão de emergência não responde
- ❌ Alertas não chegando ao síndico/portaria
- ❌ SMS/notificações de emergência não sendo enviados
- ❌ Logs de emergência não sendo gravados
- ❌ Timeout na tela de emergências

---

## 2. Diagnóstico URGENTE (2 min)

### 2.1 Verificar Estado do Sistema

```sql
-- 1. Emergências ativas nas últimas 2 horas
SELECT
  e.id,
  e.tipo,
  e.status,
  e.created_at,
  e.respondida_em,
  u.nome as morador,
  u.unidade,
  c.nome as condominio
FROM emergencias e
JOIN usuarios u ON u.id = e.usuario_id
JOIN condominios c ON c.id = e.condominio_id
WHERE e.created_at > NOW() - INTERVAL '2 hours'
ORDER BY e.created_at DESC;

-- 2. Emergências NÃO RESPONDIDAS (CRÍTICO)
SELECT
  e.id,
  e.tipo,
  e.created_at,
  NOW() - e.created_at as tempo_sem_resposta,
  u.nome,
  u.telefone,
  c.nome as condominio
FROM emergencias e
JOIN usuarios u ON u.id = e.usuario_id
JOIN condominios c ON c.id = e.condominio_id
WHERE e.status = 'aberta'
  AND e.respondida_em IS NULL
ORDER BY e.created_at ASC;

-- 3. Verificar notificações de emergência enviadas
SELECT
  e.id as emergencia_id,
  n.id as notificacao_id,
  n.canal,
  n.status,
  n.enviado_em
FROM emergencias e
LEFT JOIN notificacoes n ON n.referencia_id = e.id::text
WHERE e.created_at > NOW() - INTERVAL '1 hour'
  AND e.tipo != 'teste';
```

### 2.2 Identificar Escopo Crítico

| Pergunta                                 | Ação Imediata                                                    |
| ---------------------------------------- | ---------------------------------------------------------------- |
| **Há emergências abertas SEM resposta?** | 🚨 ACIONAR PLANO DE CONTINGÊNCIA MANUAL                          |
| **Botão não responde para todos?**       | Verificar Edge Function + RLS                                    |
| **Notificações não sendo enviadas?**     | Ver runbook [NOTIFICATION_FAILURE.md](./NOTIFICATION_FAILURE.md) |
| **Apenas um condomínio afetado?**        | Verificar configuração específica                                |

---

## 3. PLANO DE CONTINGÊNCIA MANUAL

### 3.1 Se Sistema Não Responde (< 5 min para restaurar)

```bash
# 1. URGENTE: Ligar IMEDIATAMENTE para condomínios afetados
# Usar lista de contatos de emergência

# 2. Query de contatos de emergência
psql $DATABASE_URL <<EOF
SELECT
  c.nome as condominio,
  c.telefone_emergencia,
  c.telefone_portaria,
  u.nome as sindico,
  u.telefone as telefone_sindico
FROM condominios c
LEFT JOIN usuarios u ON u.id = c.sindico_id
WHERE c.ativo = true
ORDER BY c.nome;
EOF

# 3. Enviar SMS massivo via CLI (Twilio)
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
  --data-urlencode "Body=ALERTA VERSIX: Sistema de emergências temporariamente indisponível. Contatar portaria via telefone em caso de emergência: [TELEFONE]" \
  --data-urlencode "From=$TWILIO_PHONE" \
  --data-urlencode "To=+55..." \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

### 3.2 Ativar Modo de Fallback

```sql
-- 1. Ativar modo de emergência (bypass de validações)
UPDATE configuracao_global
SET valor = jsonb_set(
  valor,
  '{emergencias,modo_fallback}',
  'true'::jsonb
)
WHERE chave = 'sistema';

-- 2. Simplificar fluxo (pular validações não-críticas)
UPDATE configuracao_global
SET valor = jsonb_set(
  valor,
  '{emergencias,validacoes_obrigatorias}',
  '["tipo"]'::jsonb  -- apenas validar tipo
)
WHERE chave = 'sistema';

-- 3. Gravar emergências direto (sem Edge Function)
CREATE OR REPLACE FUNCTION criar_emergencia_fallback(
  p_usuario_id uuid,
  p_tipo text,
  p_descricao text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_emergencia_id uuid;
BEGIN
  INSERT INTO emergencias (usuario_id, condominio_id, tipo, descricao, status)
  SELECT p_usuario_id, u.condominio_id, p_tipo, p_descricao, 'aberta'
  FROM usuarios u WHERE u.id = p_usuario_id
  RETURNING id INTO v_emergencia_id;

  RETURN v_emergencia_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. Investigação Técnica (10 min)

### 4.1 Verificar Edge Function

```bash
# Logs da Edge Function de emergências
npx supabase functions logs criar-emergencia --tail 200

# Test invoke manual
npx supabase functions invoke criar-emergencia \
  --data '{
    "usuario_id": "TEST_USER_ID",
    "tipo": "teste",
    "descricao": "Test incident"
  }'

# Status do Deno Deploy
curl https://api.deno.com/v1/deployments/$DEPLOYMENT_ID \
  -H "Authorization: Bearer $DENO_ACCESS_TOKEN"
```

### 4.2 Verificar RLS Policies

```sql
-- 1. Testar INSERT de emergência (simular usuário)
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "USER_UUID", "role": "authenticated"}';

INSERT INTO emergencias (usuario_id, condominio_id, tipo, descricao)
VALUES (
  'USER_UUID'::uuid,
  (SELECT condominio_id FROM usuarios WHERE id = 'USER_UUID'::uuid),
  'teste',
  'Test RLS'
) RETURNING id;

-- 2. Verificar policies ativas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'emergencias';

-- 3. Se RLS bloqueando, bypass temporário (APENAS EMERGÊNCIA)
ALTER TABLE emergencias DISABLE ROW LEVEL SECURITY;
-- IMPORTANTE: Re-ativar após fix!
```

### 4.3 Verificar Banco de Dados

```sql
-- 1. Saúde do banco
SELECT
  pid,
  usename,
  application_name,
  state,
  query_start,
  state_change,
  wait_event_type,
  wait_event,
  LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE datname = current_database()
  AND state != 'idle'
ORDER BY query_start;

-- 2. Locks bloqueando emergências
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted
  AND blocked_activity.query LIKE '%emergencias%';

-- 3. Se necessário, matar query travada
SELECT pg_terminate_backend(PID_DA_QUERY_TRAVADA);
```

### 4.4 Verificar Notificações

```sql
-- Notificações de emergência que falharam
SELECT
  e.id as emergencia_id,
  e.tipo,
  e.created_at,
  n.canal,
  n.status,
  n.erro_detalhe
FROM emergencias e
LEFT JOIN notificacoes n ON n.referencia_id = e.id::text AND n.tipo = 'emergencia'
WHERE e.created_at > NOW() - INTERVAL '1 hour'
  AND (n.id IS NULL OR n.status = 'erro');
```

---

## 5. Resolução

### 5.1 Se Foi Edge Function

```bash
# 1. Redeploy da Edge Function
cd supabase/functions/criar-emergencia
supabase functions deploy criar-emergencia

# 2. Verificar se deploy funcionou
supabase functions invoke criar-emergencia --data '{"tipo": "teste"}'

# 3. Se falhar, rollback para versão anterior
git log --oneline supabase/functions/criar-emergencia
git revert COMMIT_SHA
supabase functions deploy criar-emergencia
```

### 5.2 Se Foi RLS

```sql
-- 1. Re-ativar RLS com policy simplificada
ALTER TABLE emergencias ENABLE ROW LEVEL SECURITY;

-- 2. Criar policy de emergência (bypass de validações)
DROP POLICY IF EXISTS "emergencias_insert_emergency_mode" ON emergencias;
CREATE POLICY "emergencias_insert_emergency_mode"
ON emergencias FOR INSERT
TO authenticated
WITH CHECK (true);  -- PERMITE TUDO (apenas durante incidente)

-- 3. Após resolução, restaurar policy original
-- (ver schema original)
```

### 5.3 Se Foi Banco de Dados

```bash
# 1. Verificar conexões do Supabase
# Dashboard -> Database -> Connections

# 2. Se pool esgotado, aumentar limite temporariamente
# Dashboard -> Database -> Settings -> Max Connections

# 3. Reiniciar pooler (último recurso)
# Dashboard -> Database -> Restart Pooler
```

---

## 6. Pós-Incidente CRÍTICO

### 6.1 Checklist Legal/Compliance

- [ ] Documentar TODAS as emergências afetadas (horário, tipo, resolução)
- [ ] Verificar se houve emergências reais não atendidas
- [ ] Se houve vítimas ou danos, CONTATAR LEGAL IMEDIATAMENTE
- [ ] Notificar condôminos afetados sobre o incidente
- [ ] Preparar relatório para LGPD/compliance (se aplicável)
- [ ] Revisar apólice de seguro (responsabilidade civil)

### 6.2 Comunicação de Crise

```sql
-- 1. Identificar todos afetados
SELECT DISTINCT
  c.id as condominio_id,
  c.nome,
  c.telefone_emergencia,
  COUNT(e.id) as emergencias_durante_incidente
FROM condominios c
LEFT JOIN emergencias e ON e.condominio_id = c.id
  AND e.created_at BETWEEN 'INICIO_INCIDENTE' AND 'FIM_INCIDENTE'
GROUP BY c.id;

-- 2. Enviar comunicado oficial
INSERT INTO comunicados (
  condominio_id,
  titulo,
  corpo,
  tipo,
  urgente,
  criado_por
)
SELECT
  id,
  '⚠️ Incidente no Sistema de Emergências - Resolvido',
  'Informamos que o sistema de emergências apresentou instabilidade entre [HORÁRIO INÍCIO] e [HORÁRIO FIM]. O problema foi resolvido e o sistema está operacional. Pedimos desculpas pelo transtorno e reforçamos nosso compromisso com a segurança.',
  'importante',
  true,
  (SELECT id FROM usuarios WHERE email = 'admin@versixnorma.com.br')
FROM condominios;
```

### 6.3 Post-Mortem Obrigatório

```markdown
## POST-MORTEM CRÍTICO: INC-EMG-XXXXX

**⚠️ Este foi um incidente de severidade MÁXIMA envolvendo sistema de segurança.**

### Resumo Executivo

[Para CEO/Board: Impacto, causa raiz, ações tomadas]

### Timeline Detalhado

- [HH:MM:SS] Primeiro alerta / emergência afetada
- [HH:MM:SS] Incidente detectado
- [HH:MM:SS] Plano de contingência ativado
- [HH:MM:SS] Causa raiz identificada
- [HH:MM:SS] Fix aplicado
- [HH:MM:SS] Sistema restaurado
- [HH:MM:SS] Verificação completa

### Impacto Real

- Número de emergências afetadas: [X]
- Condôminos impactados: [Y]
- Duração total: [Z minutos]
- Houve emergências reais? [SIM/NÃO]
- Houve vítimas ou danos? [SIM/NÃO]

### Causa Raiz

[Análise técnica detalhada]

### Ações Imediatas (< 24h)

1. [ ] [Ação 1]
2. [ ] [Ação 2]

### Ações de Longo Prazo

1. [ ] [Ação 1]
2. [ ] [Ação 2]

### Lições Aprendidas

[O que funcionou / O que não funcionou / O que melhorar]

---

**Aprovado por:** CEO, CTO, Legal
**Data:** [DATA]
```

---

## 7. Prevenção e Redundância

### 7.1 Alertas Críticos

```sql
-- Emergência aberta sem resposta em > 2 minutos
CREATE OR REPLACE FUNCTION alerta_emergencia_sem_resposta()
RETURNS void AS $$
DECLARE
  v_emergencia record;
BEGIN
  FOR v_emergencia IN
    SELECT
      e.id,
      e.tipo,
      u.nome,
      u.telefone,
      c.nome as condominio,
      c.telefone_emergencia
    FROM emergencias e
    JOIN usuarios u ON u.id = e.usuario_id
    JOIN condominios c ON c.id = e.condominio_id
    WHERE e.status = 'aberta'
      AND e.respondida_em IS NULL
      AND e.created_at < NOW() - INTERVAL '2 minutes'
  LOOP
    -- Disparar alerta CRÍTICO
    PERFORM net.http_post(
      url := 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
      body := jsonb_build_object(
        'text', '🚨🚨🚨 EMERGÊNCIA SEM RESPOSTA: ' || v_emergencia.tipo || ' - ' || v_emergencia.condominio,
        'urgency', 'critical'
      )
    );

    -- Ligar para síndico (via Twilio)
    PERFORM net.http_post(
      url := 'https://api.twilio.com/2010-04-01/Accounts/' || current_setting('app.twilio_account_sid') || '/Calls.json',
      body := 'Twiml=' || urlencode('<Response><Say language="pt-BR">Atenção! Nova emergência do tipo ' || v_emergencia.tipo || ' aguardando resposta.</Say></Response>')
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar a cada 1 minuto
SELECT cron.schedule(
  'alerta-emergencia-sem-resposta',
  '* * * * *',
  $$ SELECT alerta_emergencia_sem_resposta(); $$
);
```

### 7.2 Sistema de Fallback Redundante

```sql
-- Tabela de backup offline-first
CREATE TABLE IF NOT EXISTS emergencias_fallback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  tipo text NOT NULL,
  descricao text,
  localizacao jsonb,
  created_at timestamptz DEFAULT NOW(),
  sincronizado boolean DEFAULT false
);

-- Sincronizar com tabela principal quando sistema voltar
CREATE OR REPLACE FUNCTION sincronizar_emergencias_fallback()
RETURNS void AS $$
BEGIN
  INSERT INTO emergencias (id, usuario_id, condominio_id, tipo, descricao, created_at)
  SELECT
    ef.id,
    ef.usuario_id,
    u.condominio_id,
    ef.tipo,
    ef.descricao,
    ef.created_at
  FROM emergencias_fallback ef
  JOIN usuarios u ON u.id = ef.usuario_id
  WHERE ef.sincronizado = false;

  UPDATE emergencias_fallback SET sincronizado = true WHERE sincronizado = false;
END;
$$ LANGUAGE plpgsql;
```

### 7.3 Testes de Drill (Simulação)

```sql
-- Criar emergência de teste mensal
INSERT INTO emergencias (usuario_id, condominio_id, tipo, descricao, status)
VALUES (
  (SELECT id FROM usuarios WHERE email = 'test@versixnorma.com.br'),
  (SELECT id FROM condominios WHERE nome = 'Teste'),
  'teste_mensal',
  'Drill test - ' || NOW(),
  'teste'
);

-- Agendar drill mensal
SELECT cron.schedule(
  'drill-emergencias',
  '0 9 1 * *',  -- Dia 1 de cada mês às 9h
  $$
    INSERT INTO emergencias (usuario_id, condominio_id, tipo, descricao, status)
    SELECT id, condominio_id, 'teste_mensal', 'Drill automático', 'teste'
    FROM usuarios WHERE papel = 'sindico' LIMIT 1;
  $$
);
```

---

## 8. Contatos de Escalação URGENTE

| Role                 | Nome   | Telefone | Disponibilidade                  |
| -------------------- | ------ | -------- | -------------------------------- |
| **On-Call Engineer** | [NOME] | +55...   | 24/7                             |
| **Tech Lead**        | [NOME] | +55...   | 24/7                             |
| **CTO**              | [NOME] | +55...   | 24/7                             |
| **CEO**              | [NOME] | +55...   | 24/7                             |
| **Legal**            | [NOME] | +55...   | Business hours (emergência: CEO) |

**PROTOCOLO:** Em caso de emergência real não atendida, escalar para CEO IMEDIATAMENTE.

---

## 9. Referências

- [Dashboard de Emergências](https://app.versixnorma.com.br/admin/emergencias)
- [Sentry - Emergências](https://sentry.io/...)
- [Supabase Dashboard](https://supabase.com/dashboard/project/...)
- [Post-Mortems Anteriores](../docs/post-mortems/)
- [Política de Resposta a Incidentes](../docs/INCIDENT_RESPONSE_POLICY.md)

---

**Última Atualização:** 02/01/2026
**Versão:** 1.0
**Owner:** Tech Lead + Legal
**Revisão:** Mensal (obrigatória)
