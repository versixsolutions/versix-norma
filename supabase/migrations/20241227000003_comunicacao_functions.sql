-- ============================================
-- VERSIX NORMA - VIEWS E FUNCTIONS COMUNICAÇÃO
-- ============================================

-- ============================================
-- VIEW: v_notificacoes_dashboard
-- ============================================
CREATE OR REPLACE VIEW public.v_notificacoes_dashboard AS
SELECT
  n.id,
  n.condominio_id,
  n.titulo,
  n.prioridade,
  n.tipo,
  n.created_at,
  COUNT(DISTINCT e.usuario_id) AS total_destinatarios,
  COUNT(*) FILTER (WHERE e.status = 'lido') AS total_lidos,
  COUNT(*) FILTER (WHERE e.status = 'entregue') AS total_entregues,
  COUNT(*) FILTER (WHERE e.status = 'falhou') AS total_falhas,
  ROUND(COUNT(*) FILTER (WHERE e.status = 'lido')::DECIMAL / NULLIF(COUNT(DISTINCT e.usuario_id), 0) * 100, 1) AS percentual_leitura,
  COUNT(*) FILTER (WHERE e.canal = 'push' AND e.status = 'lido') AS lidos_push,
  COUNT(*) FILTER (WHERE e.canal = 'email' AND e.status = 'lido') AS lidos_email,
  COUNT(*) FILTER (WHERE e.canal = 'whatsapp' AND e.status = 'lido') AS lidos_whatsapp
FROM public.notificacoes n
LEFT JOIN public.notificacoes_entregas e ON e.notificacao_id = n.id
GROUP BY n.id;

-- ============================================
-- VIEW: v_usuario_notificacoes
-- ============================================
DROP VIEW IF EXISTS public.v_usuario_notificacoes;
CREATE OR REPLACE VIEW public.v_usuario_notificacoes AS
SELECT
  e.id AS entrega_id,
  e.usuario_id,
  e.canal,
  e.status,
  e.lida_em,
  n.id AS notificacao_id,
  n.tipo,
  n.titulo,
  n.corpo,
  n.corpo_resumo,
  n.prioridade,
  n.referencia_tipo,
  n.referencia_id,
  n.created_at
FROM public.notificacoes_entregas e
JOIN public.notificacoes n ON n.id = e.notificacao_id
ORDER BY n.created_at DESC;

-- ============================================
-- FUNCTION: enviar_notificacao
-- ============================================
CREATE OR REPLACE FUNCTION public.enviar_notificacao(
  p_condominio_id UUID,
  p_tipo VARCHAR(50),
  p_titulo VARCHAR(255),
  p_corpo TEXT,
  p_prioridade public.prioridade_comunicado DEFAULT 'normal',
  p_destinatarios_tipo VARCHAR(50) DEFAULT 'todos',
  p_destinatarios_filtro JSONB DEFAULT NULL,
  p_referencia_tipo VARCHAR(50) DEFAULT NULL,
  p_referencia_id UUID DEFAULT NULL,
  p_gerar_mural BOOLEAN DEFAULT FALSE,
  p_criado_por UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_notificacao_id UUID;
  v_destinatarios RECORD;
  v_config public.notificacoes_config%ROWTYPE;
BEGIN
  SELECT * INTO v_config FROM public.notificacoes_config WHERE condominio_id = p_condominio_id;

  INSERT INTO public.notificacoes (
    condominio_id, tipo, titulo, corpo, corpo_resumo, prioridade, destinatarios_tipo,
    destinatarios_filtro, referencia_tipo, referencia_id, gerar_mural, criado_por, enviada_em
  ) VALUES (
    p_condominio_id, p_tipo, p_titulo, p_corpo, LEFT(p_corpo, 160), p_prioridade, p_destinatarios_tipo,
    p_destinatarios_filtro, p_referencia_tipo, p_referencia_id, p_gerar_mural, p_criado_por, NOW()
  )
  RETURNING id INTO v_notificacao_id;

  FOR v_destinatarios IN
    SELECT DISTINCT u.id AS usuario_id
    FROM public.usuarios u
    LEFT JOIN public.usuarios_unidades uu ON uu.usuario_id = u.id AND uu.ativo = true
    LEFT JOIN public.unidades_habitacionais uh ON uh.id = uu.unidade_id
    WHERE uh.condominio_id = p_condominio_id
      AND u.status = 'active'
      AND u.deleted_at IS NULL
      AND (
        p_destinatarios_tipo = 'todos'
        OR (p_destinatarios_tipo = 'bloco' AND uh.bloco_id = (p_destinatarios_filtro->>'bloco_id')::UUID)
        OR (p_destinatarios_tipo = 'role' AND u.role = (p_destinatarios_filtro->>'role')::public.user_role)
      )
  LOOP
    IF v_config IS NULL OR v_config.push_habilitado THEN
      INSERT INTO public.notificacoes_entregas (notificacao_id, usuario_id, canal, status)
      VALUES (v_notificacao_id, v_destinatarios.usuario_id, 'push', 'pendente');
    END IF;

    IF p_prioridade = 'critica' THEN
      IF v_config IS NOT NULL AND v_config.voz_habilitado THEN
        INSERT INTO public.notificacoes_entregas (notificacao_id, usuario_id, canal, status)
        VALUES (v_notificacao_id, v_destinatarios.usuario_id, 'voz', 'pendente');
      END IF;
      IF v_config IS NOT NULL AND v_config.sms_habilitado THEN
        INSERT INTO public.notificacoes_entregas (notificacao_id, usuario_id, canal, status)
        VALUES (v_notificacao_id, v_destinatarios.usuario_id, 'sms', 'pendente');
      END IF;
    END IF;
  END LOOP;

  RETURN v_notificacao_id;
END;
$$;

-- ============================================
-- FUNCTION: confirmar_leitura
-- ============================================
DROP FUNCTION IF EXISTS public.confirmar_leitura(UUID, UUID, public.canal_notificacao, INET, TEXT);
CREATE OR REPLACE FUNCTION public.confirmar_leitura(
  p_notificacao_id UUID,
  p_usuario_id UUID,
  p_canal public.canal_notificacao DEFAULT 'push',
  p_ip INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.notificacoes_entregas
  SET status = 'lido', lida_em = NOW(), ip_leitura = p_ip, user_agent_leitura = p_user_agent
  WHERE notificacao_id = p_notificacao_id AND usuario_id = p_usuario_id AND canal = p_canal AND status != 'lido';

  UPDATE public.notificacoes_cascade SET cancelado = true
  WHERE entrega_id IN (SELECT id FROM public.notificacoes_entregas WHERE notificacao_id = p_notificacao_id AND usuario_id = p_usuario_id)
    AND disparado = false;

  RETURN FOUND;
END;
$$;

-- ============================================
-- FUNCTION: marcar_todas_lidas
-- ============================================
CREATE OR REPLACE FUNCTION public.marcar_todas_lidas(p_usuario_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notificacoes_entregas
  SET status = 'lido', lida_em = NOW()
  WHERE usuario_id = p_usuario_id AND status != 'lido';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE public.notificacoes_cascade SET cancelado = true
  WHERE entrega_id IN (SELECT id FROM public.notificacoes_entregas WHERE usuario_id = p_usuario_id)
    AND disparado = false;

  RETURN v_count;
END;
$$;

-- ============================================
-- FUNCTION: processar_cascade
-- ============================================
CREATE OR REPLACE FUNCTION public.processar_cascade()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_cascade RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_cascade IN
    SELECT c.*, e.notificacao_id, e.usuario_id
    FROM public.notificacoes_cascade c
    JOIN public.notificacoes_entregas e ON e.id = c.entrega_id
    WHERE c.disparar_em <= NOW() AND c.disparado = false AND c.cancelado = false
    FOR UPDATE OF c SKIP LOCKED LIMIT 100
  LOOP
    INSERT INTO public.notificacoes_entregas (notificacao_id, usuario_id, canal, status)
    VALUES (v_cascade.notificacao_id, v_cascade.usuario_id, v_cascade.proximo_canal, 'pendente')
    ON CONFLICT (notificacao_id, usuario_id, canal) DO NOTHING;

    UPDATE public.notificacoes_cascade SET disparado = true WHERE id = v_cascade.id;
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ============================================
-- FUNCTION: agendar_cascade
-- ============================================
CREATE OR REPLACE FUNCTION public.agendar_cascade(
  p_entrega_id UUID,
  p_proximo_canal public.canal_notificacao,
  p_minutos_espera INTEGER
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_cascade_id UUID;
BEGIN
  INSERT INTO public.notificacoes_cascade (entrega_id, proximo_canal, disparar_em)
  VALUES (p_entrega_id, p_proximo_canal, NOW() + (p_minutos_espera || ' minutes')::INTERVAL)
  RETURNING id INTO v_cascade_id;

  RETURN v_cascade_id;
END;
$$;

-- ============================================
-- FUNCTION: registrar_emergencia
-- ============================================
CREATE OR REPLACE FUNCTION public.registrar_emergencia(
  p_condominio_id UUID,
  p_tipo VARCHAR(50),
  p_descricao TEXT,
  p_disparado_por UUID
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_log_id UUID;
  v_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total FROM public.usuarios u
  JOIN public.usuarios_unidades uu ON uu.usuario_id = u.id
  JOIN public.unidades_habitacionais uh ON uh.id = uu.unidade_id
  WHERE uh.condominio_id = p_condominio_id AND u.status = 'active';

  INSERT INTO public.emergencias_log (condominio_id, tipo, descricao, disparado_por, total_destinatarios, disparo_inicio)
  VALUES (p_condominio_id, p_tipo, p_descricao, p_disparado_por, v_total, NOW())
  RETURNING id INTO v_log_id;

  PERFORM public.enviar_notificacao(p_condominio_id, 'emergencia', '🚨 EMERGÊNCIA: ' || p_tipo, p_descricao, 'critica', 'todos', NULL, 'emergencias_log', v_log_id, false, p_disparado_por);

  RETURN v_log_id;
END;
$$;

-- ============================================
-- FUNCTION: get_contagem_nao_lidas
-- ============================================
CREATE OR REPLACE FUNCTION public.get_contagem_nao_lidas(p_usuario_id UUID)
RETURNS INTEGER
LANGUAGE sql STABLE AS $$
  SELECT COUNT(*)::INTEGER FROM public.notificacoes_entregas WHERE usuario_id = p_usuario_id AND status != 'lido';
$$;

-- ============================================
-- FUNCTION: registrar_fcm_token
-- ============================================
CREATE OR REPLACE FUNCTION public.registrar_fcm_token(p_usuario_id UUID, p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.usuarios_canais_preferencias (usuario_id, fcm_tokens)
  VALUES (p_usuario_id, jsonb_build_array(p_token))
  ON CONFLICT (usuario_id) DO UPDATE SET
    fcm_tokens = CASE
      WHEN usuarios_canais_preferencias.fcm_tokens ? p_token THEN usuarios_canais_preferencias.fcm_tokens
      ELSE usuarios_canais_preferencias.fcm_tokens || jsonb_build_array(p_token)
    END,
    updated_at = NOW();
  RETURN true;
END;
$$;

-- ============================================
-- FUNCTION: remover_fcm_token
-- ============================================
CREATE OR REPLACE FUNCTION public.remover_fcm_token(p_usuario_id UUID, p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.usuarios_canais_preferencias
  SET fcm_tokens = fcm_tokens - p_token, updated_at = NOW()
  WHERE usuario_id = p_usuario_id;
  RETURN FOUND;
END;
$$;
