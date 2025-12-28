-- VERSIX NORMA - Configuração pg_cron
-- Sprint 1 - Tarefa 1.5: Configurar pg_cron para automação

-- 1. Habilitar a extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Conceder permissões necessárias
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- 3. Configurar job para limpeza de dados antigos (diariamente às 2:00)
SELECT cron.schedule(
  'daily-data-cleanup',
  '0 2 * * *', -- Todos os dias às 2:00
  $$
  -- Limpar notificações lidas há mais de 30 dias
  DELETE FROM notificacoes
  WHERE lida = true
    AND updated_at < NOW() - INTERVAL '30 days';

  -- Limpar logs de auditoria antigos (mais de 90 dias)
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- Limpar tokens expirados
  DELETE FROM user_sessions
  WHERE expires_at < NOW();
  $$
);

-- 4. Configurar job para cálculo de inadimplência (diariamente às 6:00)
SELECT cron.schedule(
  'daily-inadimplencia-calculation',
  '0 6 * * *', -- Todos os dias às 6:00
  $$
  -- Atualizar status de inadimplência baseado em pagamentos atrasados
  UPDATE assembleias
  SET status = 'INADIMPLENTE'
  WHERE id IN (
    SELECT DISTINCT a.id
    FROM assembleias a
    JOIN financeiro_cobrancas fc ON fc.assembleia_id = a.id
    WHERE fc.status = 'PENDENTE'
      AND fc.vencimento < NOW() - INTERVAL '30 days'
      AND fc.valor > 0
  );

  -- Calcular estatísticas de inadimplência por assembleia
  INSERT INTO financeiro_estatisticas (assembleia_id, tipo, valor, periodo)
  SELECT
    a.id,
    'TAXA_INADIMPLENCIA',
    (COUNT(CASE WHEN fc.status = 'PENDENTE' AND fc.vencimento < NOW() - INTERVAL '30 days' THEN 1 END) * 100.0 / COUNT(*)) as taxa,
    DATE_TRUNC('month', NOW())
  FROM assembleias a
  LEFT JOIN financeiro_cobrancas fc ON fc.assembleia_id = a.id
  WHERE fc.created_at >= DATE_TRUNC('month', NOW())
  GROUP BY a.id;
  $$
);

-- 5. Configurar job para backup de métricas (semanalmente às domingos às 3:00)
SELECT cron.schedule(
  'weekly-metrics-backup',
  '0 3 * * 0', -- Todos os domingos às 3:00
  $$
  -- Criar snapshot das métricas semanais
  INSERT INTO metrics_snapshots (tipo, dados, created_at)
  SELECT
    'weekly_summary',
    json_build_object(
      'total_assembleias', COUNT(DISTINCT a.id),
      'total_usuarios', COUNT(DISTINCT u.id),
      'taxa_inadimplencia_geral', AVG(fe.valor),
      'receita_total', SUM(fc.valor)
    ),
    NOW()
  FROM assembleias a
  CROSS JOIN auth.users u
  LEFT JOIN financeiro_estatisticas fe ON fe.tipo = 'TAXA_INADIMPLENCIA' AND fe.periodo >= NOW() - INTERVAL '7 days'
  LEFT JOIN financeiro_cobrancas fc ON fc.status = 'PAGO' AND fc.updated_at >= NOW() - INTERVAL '7 days';
  $$
);

-- 6. Configurar job para notificações automáticas (diariamente às 9:00)
SELECT cron.schedule(
  'daily-notifications',
  '0 9 * * *', -- Todos os dias às 9:00
  $$
  -- Notificar usuários sobre pagamentos próximos do vencimento (3 dias)
  INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, dados)
  SELECT
    u.id,
    'COBRANCA_VENCENDO',
    'Pagamento próximo do vencimento',
    'Você tem uma cobrança no valor de ' || fc.valor || ' vencendo em ' || fc.vencimento,
    json_build_object('cobranca_id', fc.id, 'valor', fc.valor, 'vencimento', fc.vencimento)
  FROM auth.users u
  JOIN assembleias_usuarios au ON au.usuario_id = u.id
  JOIN financeiro_cobrancas fc ON fc.assembleia_id = au.assembleia_id
  WHERE fc.status = 'PENDENTE'
    AND fc.vencimento BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM notificacoes n
      WHERE n.usuario_id = u.id
        AND n.tipo = 'COBRANCA_VENCENDO'
        AND n.dados->>'cobranca_id' = fc.id::text
        AND n.created_at >= NOW() - INTERVAL '24 hours'
    );
  $$
);

-- 7. Verificar jobs configurados
SELECT * FROM cron.job ORDER BY jobname;
