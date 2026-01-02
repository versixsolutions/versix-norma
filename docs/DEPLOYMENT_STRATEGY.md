# Estratégia de Deployment - Versix Norma

## Rollout Gradual e Seguro para Produção

**Objetivo:** Minimizar riscos no lançamento de novas versões através de deployment gradual, monitoramento contínuo e rollback rápido.

---

## 1. Estratégia: Canary Deployment

### 1.1 Fases do Rollout

```
┌────────────┐
│ Feature    │  Desenvolvimento e testes
│ Branch     │  (dev environment)
└──────┬─────┘
       │
       v
┌────────────┐
│ Staging    │  Validação final
│ 100%       │  (staging environment)
└──────┬─────┘
       │
       v
┌────────────┐
│ Canary     │  10% dos usuários
│ 10%        │  (production - canary)
└──────┬─────┘  Duração: 2 horas
       │         Monitoramento: intensivo
       v
┌────────────┐
│ Gradual    │  50% dos usuários
│ 50%        │  (production - gradual)
└──────┬─────┘  Duração: 6 horas
       │         Monitoramento: ativo
       v
┌────────────┐
│ Full       │  100% dos usuários
│ 100%       │  (production - full)
└────────────┘  Monitoramento: contínuo
```

### 1.2 Configuração no Vercel

```json
{
  "deployments": [
    {
      "name": "production-canary",
      "target": "production",
      "regions": ["gru1"],
      "env": {
        "NEXT_PUBLIC_CANARY_ENABLED": "true",
        "NEXT_PUBLIC_CANARY_PERCENTAGE": "10"
      }
    },
    {
      "name": "production-stable",
      "target": "production",
      "regions": ["gru1"],
      "env": {
        "NEXT_PUBLIC_CANARY_ENABLED": "false"
      }
    }
  ]
}
```

---

## 2. Feature Flags

### 2.1 Tabela de Feature Flags

```sql
-- Supabase: migrations/YYYYMMDDHHMMSS_create_feature_flags.sql
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text UNIQUE NOT NULL,
  descricao text,
  ativo boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  rollout_target jsonb, -- { "condominios": [...], "usuarios": [...] }
  metadata jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_select_all"
ON feature_flags FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "feature_flags_manage_admin"
ON feature_flags FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid()
    AND papel = 'admin'
  )
);

-- Índices
CREATE INDEX idx_feature_flags_chave ON feature_flags(chave);
CREATE INDEX idx_feature_flags_ativo ON feature_flags(ativo) WHERE ativo = true;

-- Feature flags iniciais
INSERT INTO feature_flags (chave, descricao, ativo, rollout_percentage) VALUES
  ('novo_dashboard', 'Novo dashboard de síndico', false, 0),
  ('pagamento_pix', 'Pagamento via Pix', true, 100),
  ('chat_ai', 'Chat com assistente AI', false, 10),
  ('app_mobile_v2', 'Nova versão do app mobile', false, 0);
```

### 2.2 Hook useFeatureFlag

```typescript
// apps/web/src/hooks/useFeatureFlag.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FeatureFlag {
  chave: string;
  ativo: boolean;
  rollout_percentage: number;
  rollout_target?: {
    condominios?: string[];
    usuarios?: string[];
  };
}

/**
 * Hook para verificar se feature flag está ativa para o usuário atual
 */
export function useFeatureFlag(chave: string): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    async function checkFeatureFlag() {
      try {
        // 1. Buscar feature flag
        const { data: flag, error } = await supabase
          .from('feature_flags')
          .select('*')
          .eq('chave', chave)
          .single();

        if (error || !flag) {
          setIsEnabled(false);
          return;
        }

        // 2. Se não está ativo, retornar false
        if (!flag.ativo) {
          setIsEnabled(false);
          return;
        }

        // 3. Se rollout é 100%, retornar true
        if (flag.rollout_percentage >= 100) {
          setIsEnabled(true);
          return;
        }

        // 4. Verificar target específico
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setIsEnabled(false);
          return;
        }

        // 4.1 Verificar se usuário está na lista de targets
        if (flag.rollout_target?.usuarios?.includes(user.id)) {
          setIsEnabled(true);
          return;
        }

        // 4.2 Verificar se condomínio está na lista de targets
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('condominio_id')
          .eq('id', user.id)
          .single();

        if (
          usuario?.condominio_id &&
          flag.rollout_target?.condominios?.includes(usuario.condominio_id)
        ) {
          setIsEnabled(true);
          return;
        }

        // 5. Rollout baseado em % (determinístico por usuário)
        const hash = hashString(user.id);
        const userPercentile = hash % 100;
        setIsEnabled(userPercentile < flag.rollout_percentage);
      } catch (error) {
        console.error('Error checking feature flag:', error);
        setIsEnabled(false);
      }
    }

    checkFeatureFlag();
  }, [chave]);

  return isEnabled;
}

/**
 * Hash simples para determinar % de rollout de forma determinística
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
```

### 2.3 Exemplo de Uso

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export function Dashboard() {
  const novoDashboardEnabled = useFeatureFlag('novo_dashboard');

  if (novoDashboardEnabled) {
    return <NovoDashboard />;
  }

  return <DashboardLegado />;
}
```

---

## 3. Plano de Rollback

### 3.1 Triggers de Rollback Automático

```typescript
// apps/web/src/lib/rollback-triggers.ts

interface RollbackTrigger {
  metric: string;
  threshold: number;
  window: number; // minutos
  severity: 'warning' | 'critical';
}

export const ROLLBACK_TRIGGERS: RollbackTrigger[] = [
  {
    metric: 'error_rate',
    threshold: 5, // % de erros
    window: 5,
    severity: 'critical',
  },
  {
    metric: 'response_time_p95',
    threshold: 3000, // ms
    window: 10,
    severity: 'warning',
  },
  {
    metric: 'payment_failure_rate',
    threshold: 10, // % de falhas
    window: 5,
    severity: 'critical',
  },
  {
    metric: 'auth_failure_rate',
    threshold: 15, // % de falhas
    window: 5,
    severity: 'critical',
  },
  {
    metric: 'emergency_system_downtime',
    threshold: 1, // qualquer downtime
    window: 1,
    severity: 'critical',
  },
];
```

### 3.2 Script de Rollback Manual

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

echo "🔄 Iniciando rollback..."

# 1. Identificar deployment anterior
PREVIOUS_DEPLOYMENT=$(vercel ls --prod -t $VERCEL_TOKEN | grep "READY" | head -n 2 | tail -n 1 | awk '{print $1}')

if [ -z "$PREVIOUS_DEPLOYMENT" ]; then
  echo "❌ Erro: Não foi possível identificar deployment anterior"
  exit 1
fi

echo "📌 Deployment anterior: $PREVIOUS_DEPLOYMENT"

# 2. Promover deployment anterior para produção
echo "⏳ Promovendo deployment anterior..."
vercel promote $PREVIOUS_DEPLOYMENT --prod -t $VERCEL_TOKEN

# 3. Desativar todas as feature flags canary
echo "🚫 Desativando feature flags canary..."
psql $DATABASE_URL <<EOF
UPDATE feature_flags
SET rollout_percentage = 0,
    ativo = false,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{rollback_at}',
      to_jsonb(NOW()::text)
    )
WHERE ativo = true
  AND rollout_percentage < 100;
EOF

# 4. Notificar equipe
echo "📢 Notificando equipe..."
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d "{
    \"text\": \"🔄 ROLLBACK realizado para deployment \`$PREVIOUS_DEPLOYMENT\`\",
    \"username\": \"Versix Norma Bot\",
    \"icon_emoji\": \":warning:\"
  }"

echo "✅ Rollback concluído!"
echo "🔍 Verificar: https://app.versixnorma.com.br"
```

### 3.3 Rollback via Vercel Dashboard

1. Acessar: https://vercel.com/seu-projeto/deployments
2. Identificar deployment estável anterior
3. Clicar em "..." → "Promote to Production"
4. Confirmar rollback
5. Monitorar métricas por 15 minutos

---

## 4. Métricas de Sucesso

### 4.1 KPIs de Deployment

| Métrica                     | Objetivo | Threshold Rollback |
| --------------------------- | -------- | ------------------ |
| **Error Rate**              | < 0.5%   | > 5%               |
| **Response Time (P95)**     | < 1000ms | > 3000ms           |
| **Apdex Score**             | > 0.95   | < 0.80             |
| **Disponibilidade**         | > 99.9%  | < 99%              |
| **Payment Success Rate**    | > 98%    | < 90%              |
| **Auth Success Rate**       | > 99%    | < 85%              |
| **Emergency System Uptime** | 100%     | < 100%             |

### 4.2 Dashboard de Monitoramento

```sql
-- Query para dashboard de deployment
CREATE OR REPLACE FUNCTION deployment_health_metrics(
  p_since timestamptz DEFAULT NOW() - INTERVAL '15 minutes'
)
RETURNS jsonb AS $$
DECLARE
  v_metrics jsonb;
BEGIN
  SELECT jsonb_build_object(
    'error_rate', (
      SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE nivel = 'error') / NULLIF(COUNT(*), 0), 2)
      FROM logs
      WHERE created_at > p_since
    ),
    'payment_success_rate', (
      SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'aprovado') / NULLIF(COUNT(*), 0), 2)
      FROM pagamentos
      WHERE created_at > p_since
    ),
    'auth_success_rate', (
      SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE sucesso = true) / NULLIF(COUNT(*), 0), 2)
      FROM auth_logs
      WHERE created_at > p_since
    ),
    'emergencies_open', (
      SELECT COUNT(*)
      FROM emergencias
      WHERE status = 'aberta'
        AND respondida_em IS NULL
    ),
    'active_users', (
      SELECT COUNT(DISTINCT usuario_id)
      FROM sessoes
      WHERE ultima_atividade > p_since
    )
  ) INTO v_metrics;

  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Checklist de Deployment

### 5.1 Pré-Deployment

- [ ] Todos os testes passando (unit + integration + e2e)
- [ ] 0 erros TypeScript
- [ ] Build local bem-sucedido
- [ ] Code review aprovado (2+ aprovações)
- [ ] Documentação atualizada
- [ ] Changelog atualizado
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Backup do banco realizado
- [ ] Feature flags configuradas (rollout = 0%)
- [ ] Equipe on-call notificada

### 5.2 Durante Canary (10%)

- [ ] Deploy realizado
- [ ] Health check endpoint respondendo (200)
- [ ] Métricas em verde por 30 minutos
- [ ] Sem alertas críticos
- [ ] Feedback de usuários canary coletado
- [ ] Taxa de erro < 1%
- [ ] Response time < 1500ms
- [ ] Zero incidentes de pagamento
- [ ] Zero incidentes de emergência

### 5.3 Durante Gradual (50%)

- [ ] Feature flag atualizada (rollout = 50%)
- [ ] Métricas em verde por 2 horas
- [ ] Sem alertas críticos
- [ ] Taxa de erro < 0.5%
- [ ] Response time < 1200ms
- [ ] Payment success rate > 98%
- [ ] Capacidade do servidor < 70%

### 5.4 Pós-Full Rollout (100%)

- [ ] Feature flag atualizada (rollout = 100%)
- [ ] Métricas em verde por 6 horas
- [ ] Sem alertas críticos
- [ ] Documentação de runbooks atualizada
- [ ] Post-mortem (se houve incidentes)
- [ ] Retrospectiva de deployment agendada
- [ ] Limpeza de feature flags antigas

---

## 6. Configuração de Alertas

### 6.1 Alertas no Sentry

```javascript
// sentry.config.js
export function getSentryConfig() {
  return {
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      // Alertar apenas em produção
      if (process.env.NODE_ENV === 'production') {
        // Critical errors disparam alerta imediato
        if (event.level === 'fatal' || event.level === 'error') {
          // Enviar para Slack
          notifySlack({
            text: `🚨 Erro crítico detectado: ${event.message}`,
            channel: '#alerts-production',
          });
        }
      }
      return event;
    },
  };
}
```

### 6.2 Alertas no Vercel

Configurar no Vercel Dashboard:

- **Error Rate > 5%**: Email + Slack (crítico)
- **Response Time P95 > 3s**: Slack (warning)
- **Deployment Failed**: Email + Slack (crítico)
- **Function Timeout > 10s**: Slack (warning)

### 6.3 Alertas no Supabase

Configurar em Database → Cron Jobs:

```sql
-- Alerta de emergências não respondidas (1 minuto)
SELECT cron.schedule(
  'alerta-emergencias',
  '* * * * *',
  $$ SELECT alerta_emergencia_sem_resposta(); $$
);

-- Alerta de taxa de erro em pagamentos (5 minutos)
SELECT cron.schedule(
  'alerta-pagamentos',
  '*/5 * * * *',
  $$ SELECT alerta_pagamentos_erro(); $$
);
```

---

## 7. Comunicação

### 7.1 Template de Anúncio de Deploy

```markdown
## 🚀 Deploy Agendado - [FEATURE NAME]

**Data:** [DATA]
**Horário:** [HORÁRIO]
**Duração estimada:** 2-8 horas
**Impacto:** Baixo (rollout gradual)

### O que vai mudar?

- [Mudança 1]
- [Mudança 2]

### Rollout:

- 10% usuários: [HORÁRIO]
- 50% usuários: [HORÁRIO]
- 100% usuários: [HORÁRIO]

### Monitoramento:

Dashboard: [URL]

### Contatos:

On-call: @oncall no Slack
```

---

**Última Atualização:** 02/01/2026
**Versão:** 1.0
**Owner:** Tech Lead + DevOps
