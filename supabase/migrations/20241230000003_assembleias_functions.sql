-- ============================================
-- VERSIX NORMA - VIEWS E FUNCTIONS ASSEMBLEIAS
-- ============================================

-- ============================================
-- VIEW: v_assembleia_quorum
-- ============================================
CREATE OR REPLACE VIEW public.v_assembleia_quorum AS
SELECT 
  a.id AS assembleia_id,
  a.condominio_id,
  a.status,
  (SELECT COALESCE(SUM(fracao_ideal), 0) FROM public.unidades_habitacionais WHERE condominio_id = a.condominio_id AND ativo = true) AS total_fracoes,
  COALESCE(SUM(p.fracao_ideal), 0) AS fracoes_presentes,
  ROUND(COALESCE(SUM(p.fracao_ideal), 0) / NULLIF((SELECT SUM(fracao_ideal) FROM public.unidades_habitacionais WHERE condominio_id = a.condominio_id AND ativo = true), 0) * 100, 2) AS quorum_percentual,
  COUNT(DISTINCT p.unidade_id) AS unidades_presentes,
  (SELECT COUNT(*) FROM public.unidades_habitacionais WHERE condominio_id = a.condominio_id AND ativo = true) AS total_unidades,
  COUNT(*) FILTER (WHERE p.tipo = 'presencial') AS presenciais,
  COUNT(*) FILTER (WHERE p.tipo = 'online') AS online,
  COUNT(*) FILTER (WHERE p.tipo = 'procuracao') AS procuracoes,
  COUNT(*) FILTER (WHERE p.tipo = 'voto_antecipado') AS votos_antecipados
FROM public.assembleias a
LEFT JOIN public.assembleia_presencas p ON p.assembleia_id = a.id
GROUP BY a.id;

-- ============================================
-- VIEW: v_pauta_resultado
-- ============================================
CREATE OR REPLACE VIEW public.v_pauta_resultado AS
SELECT 
  p.id AS pauta_id,
  p.assembleia_id,
  p.titulo,
  p.tipo_votacao,
  p.quorum_especial,
  p.status,
  COUNT(v.id) AS total_votos,
  COALESCE(SUM(v.fracao_ideal), 0) AS total_fracoes_votantes,
  COUNT(*) FILTER (WHERE v.voto = 'sim') AS votos_sim,
  COUNT(*) FILTER (WHERE v.voto = 'nao') AS votos_nao,
  COUNT(*) FILTER (WHERE v.voto = 'abstencao') AS abstencoes,
  COALESCE(SUM(v.fracao_ideal) FILTER (WHERE v.voto = 'sim'), 0) AS fracoes_sim,
  COALESCE(SUM(v.fracao_ideal) FILTER (WHERE v.voto = 'nao'), 0) AS fracoes_nao,
  ROUND(COUNT(*) FILTER (WHERE v.voto = 'sim')::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE v.voto IN ('sim', 'nao')), 0) * 100, 2) AS percentual_aprovacao
FROM public.assembleia_pautas p
LEFT JOIN public.assembleia_votos v ON v.pauta_id = p.id
GROUP BY p.id;

-- ============================================
-- FUNCTION: registrar_presenca
-- ============================================
CREATE OR REPLACE FUNCTION public.registrar_presenca(
  p_assembleia_id UUID,
  p_usuario_id UUID,
  p_tipo public.presenca_tipo,
  p_representante_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_assembleia public.assembleias%ROWTYPE;
  v_unidade_id UUID;
  v_fracao_ideal DECIMAL(10,6);
  v_presenca_id UUID;
  v_procuracoes_count INTEGER;
BEGIN
  SELECT * INTO v_assembleia FROM public.assembleias WHERE id = p_assembleia_id;
  IF v_assembleia.id IS NULL THEN RAISE EXCEPTION 'Assembleia não encontrada'; END IF;
  IF v_assembleia.status NOT IN ('em_andamento', 'votacao') THEN RAISE EXCEPTION 'Assembleia não está em andamento'; END IF;
  
  SELECT uu.unidade_id, uh.fracao_ideal INTO v_unidade_id, v_fracao_ideal
  FROM public.usuarios_unidades uu
  JOIN public.unidades_habitacionais uh ON uh.id = uu.unidade_id
  WHERE uu.usuario_id = p_usuario_id AND uu.ativo = true AND uh.condominio_id = v_assembleia.condominio_id
  LIMIT 1;
  
  IF v_unidade_id IS NULL THEN RAISE EXCEPTION 'Usuário não está vinculado a uma unidade neste condomínio'; END IF;
  
  IF EXISTS (SELECT 1 FROM public.assembleia_presencas WHERE assembleia_id = p_assembleia_id AND unidade_id = v_unidade_id) THEN
    RAISE EXCEPTION 'Unidade já registrou presença nesta assembleia';
  END IF;
  
  IF p_tipo = 'procuracao' AND p_representante_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_procuracoes_count FROM public.assembleia_presencas
    WHERE assembleia_id = p_assembleia_id AND representante_id = p_representante_id AND tipo = 'procuracao';
    IF v_procuracoes_count >= v_assembleia.max_procuracoes_por_pessoa THEN
      RAISE EXCEPTION 'Limite de procurações atingido para este representante';
    END IF;
  END IF;
  
  INSERT INTO public.assembleia_presencas (assembleia_id, usuario_id, unidade_id, tipo, representante_id, fracao_ideal)
  VALUES (p_assembleia_id, p_usuario_id, v_unidade_id, p_tipo, p_representante_id, v_fracao_ideal)
  RETURNING id INTO v_presenca_id;
  
  UPDATE public.assembleias SET quorum_atingido = (SELECT quorum_percentual FROM public.v_assembleia_quorum WHERE assembleia_id = p_assembleia_id) WHERE id = p_assembleia_id;
  
  INSERT INTO public.assembleia_logs (assembleia_id, usuario_id, acao, detalhes)
  VALUES (p_assembleia_id, p_usuario_id, 'presenca_registrada', jsonb_build_object('tipo', p_tipo::TEXT, 'fracao_ideal', v_fracao_ideal));
  
  RETURN v_presenca_id;
END;
$$;

-- ============================================
-- FUNCTION: registrar_voto
-- ============================================
CREATE OR REPLACE FUNCTION public.registrar_voto(
  p_pauta_id UUID,
  p_presenca_id UUID,
  p_voto VARCHAR(20),
  p_opcao_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_pauta public.assembleia_pautas%ROWTYPE;
  v_presenca public.assembleia_presencas%ROWTYPE;
  v_voto_id UUID;
  v_voto_hash VARCHAR(64);
  v_usuario_id UUID;
  v_unidade_id UUID;
BEGIN
  SELECT * INTO v_pauta FROM public.assembleia_pautas WHERE id = p_pauta_id;
  IF v_pauta.id IS NULL THEN RAISE EXCEPTION 'Pauta não encontrada'; END IF;
  IF v_pauta.status != 'em_votacao' THEN RAISE EXCEPTION 'Votação não está aberta para esta pauta'; END IF;
  
  SELECT * INTO v_presenca FROM public.assembleia_presencas WHERE id = p_presenca_id;
  IF v_presenca.id IS NULL THEN RAISE EXCEPTION 'Presença não encontrada'; END IF;
  
  IF EXISTS (SELECT 1 FROM public.assembleia_votos WHERE pauta_id = p_pauta_id AND presenca_id = p_presenca_id) THEN
    RAISE EXCEPTION 'Esta unidade já votou nesta pauta';
  END IF;
  
  IF v_pauta.bloqueia_inadimplentes THEN
    IF EXISTS (SELECT 1 FROM public.taxas_unidades WHERE unidade_id = v_presenca.unidade_id AND status = 'atrasado') THEN
      RAISE EXCEPTION 'Unidade inadimplente não pode votar';
    END IF;
  END IF;
  
  v_voto_hash := encode(sha256((p_pauta_id || p_presenca_id || p_voto || COALESCE(p_opcao_id::TEXT, '') || NOW()::TEXT)::BYTEA), 'hex');
  
  IF NOT v_pauta.voto_secreto THEN
    v_usuario_id := v_presenca.usuario_id;
    v_unidade_id := v_presenca.unidade_id;
  END IF;
  
  INSERT INTO public.assembleia_votos (pauta_id, presenca_id, opcao_id, voto, fracao_ideal, usuario_id, unidade_id, voto_hash)
  VALUES (p_pauta_id, p_presenca_id, p_opcao_id, p_voto, v_presenca.fracao_ideal, v_usuario_id, v_unidade_id, v_voto_hash)
  RETURNING id INTO v_voto_id;
  
  IF p_opcao_id IS NOT NULL THEN
    UPDATE public.assembleia_pauta_opcoes SET votos_count = votos_count + 1, votos_fracao = votos_fracao + v_presenca.fracao_ideal WHERE id = p_opcao_id;
  END IF;
  
  RETURN v_voto_id;
END;
$$;

-- ============================================
-- FUNCTION: encerrar_pauta
-- ============================================
CREATE OR REPLACE FUNCTION public.encerrar_pauta(p_pauta_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_pauta public.assembleia_pautas%ROWTYPE;
  v_resultado RECORD;
  v_status public.pauta_status;
  v_resultado_json JSONB;
  v_total_fracoes DECIMAL(10,6);
BEGIN
  SELECT * INTO v_pauta FROM public.assembleia_pautas WHERE id = p_pauta_id;
  SELECT * INTO v_resultado FROM public.v_pauta_resultado WHERE pauta_id = p_pauta_id;
  
  IF v_pauta.tipo_votacao = 'aprovacao' THEN
    CASE v_pauta.quorum_especial
      WHEN 'unanimidade' THEN v_status := CASE WHEN v_resultado.votos_nao = 0 AND v_resultado.votos_sim > 0 THEN 'aprovada' ELSE 'rejeitada' END;
      WHEN '2/3_fracoes' THEN v_status := CASE WHEN v_resultado.fracoes_sim >= (v_resultado.total_fracoes_votantes * 0.6667) THEN 'aprovada' ELSE 'rejeitada' END;
      WHEN 'maioria_absoluta' THEN v_status := CASE WHEN v_resultado.fracoes_sim > (v_resultado.total_fracoes_votantes * 0.5) THEN 'aprovada' ELSE 'rejeitada' END;
      ELSE v_status := CASE WHEN v_resultado.votos_sim > v_resultado.votos_nao THEN 'aprovada' ELSE 'rejeitada' END;
    END CASE;
    
    v_resultado_json := jsonb_build_object(
      'votos_sim', v_resultado.votos_sim, 'votos_nao', v_resultado.votos_nao, 'abstencoes', v_resultado.abstencoes,
      'fracoes_sim', v_resultado.fracoes_sim, 'fracoes_nao', v_resultado.fracoes_nao, 'percentual_aprovacao', v_resultado.percentual_aprovacao
    );
  ELSIF v_pauta.tipo_votacao IN ('eleicao', 'escolha_unica') THEN
    v_status := 'encerrada';
    SELECT jsonb_build_object('eleitos', jsonb_agg(jsonb_build_object('opcao_id', id, 'titulo', titulo, 'votos', votos_count, 'fracoes', votos_fracao) ORDER BY votos_fracao DESC))
    INTO v_resultado_json FROM (SELECT * FROM public.assembleia_pauta_opcoes WHERE pauta_id = p_pauta_id ORDER BY votos_fracao DESC LIMIT v_pauta.max_eleitos) top;
  ELSE
    v_status := 'encerrada';
    v_resultado_json := jsonb_build_object('total_votos', v_resultado.total_votos);
  END IF;
  
  UPDATE public.assembleia_pautas SET status = v_status, resultado = v_resultado_json WHERE id = p_pauta_id;
  RETURN v_resultado_json;
END;
$$;

-- ============================================
-- FUNCTION: iniciar_votacao_pauta
-- ============================================
CREATE OR REPLACE FUNCTION public.iniciar_votacao_pauta(p_pauta_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.assembleia_pautas SET status = 'em_votacao' WHERE id = p_pauta_id AND status = 'pendente';
  IF NOT FOUND THEN RETURN false; END IF;
  
  INSERT INTO public.assembleia_logs (assembleia_id, usuario_id, acao, detalhes)
  SELECT assembleia_id, auth.uid(), 'votacao_iniciada', jsonb_build_object('pauta_id', p_pauta_id)
  FROM public.assembleia_pautas WHERE id = p_pauta_id;
  
  RETURN true;
END;
$$;

-- ============================================
-- FUNCTION: convocar_assembleia
-- ============================================
CREATE OR REPLACE FUNCTION public.convocar_assembleia(p_assembleia_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.assembleias SET status = 'convocada', updated_at = NOW() WHERE id = p_assembleia_id AND status = 'rascunho';
  IF NOT FOUND THEN RETURN false; END IF;
  
  INSERT INTO public.assembleia_logs (assembleia_id, usuario_id, acao, detalhes)
  VALUES (p_assembleia_id, auth.uid(), 'assembleia_convocada', jsonb_build_object('data', NOW()));
  
  RETURN true;
END;
$$;

-- ============================================
-- FUNCTION: iniciar_assembleia
-- ============================================
CREATE OR REPLACE FUNCTION public.iniciar_assembleia(p_assembleia_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.assembleias SET status = 'em_andamento', data_inicio = NOW(), updated_at = NOW() WHERE id = p_assembleia_id AND status = 'convocada';
  IF NOT FOUND THEN RETURN false; END IF;
  
  INSERT INTO public.assembleia_logs (assembleia_id, usuario_id, acao, detalhes)
  VALUES (p_assembleia_id, auth.uid(), 'assembleia_iniciada', jsonb_build_object('data', NOW()));
  
  RETURN true;
END;
$$;

-- ============================================
-- FUNCTION: encerrar_assembleia
-- ============================================
CREATE OR REPLACE FUNCTION public.encerrar_assembleia(p_assembleia_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.assembleia_pautas SET status = 'encerrada' WHERE assembleia_id = p_assembleia_id AND status = 'em_votacao';
  UPDATE public.assembleias SET status = 'encerrada', data_fim = NOW(), encerrada_em = NOW(), updated_at = NOW() WHERE id = p_assembleia_id AND status IN ('em_andamento', 'votacao');
  IF NOT FOUND THEN RETURN false; END IF;
  
  INSERT INTO public.assembleia_logs (assembleia_id, usuario_id, acao, detalhes)
  VALUES (p_assembleia_id, auth.uid(), 'assembleia_encerrada', jsonb_build_object('data', NOW()));
  
  RETURN true;
END;
$$;

-- ============================================
-- FUNCTION: gerar_numero_sequencial
-- ============================================
CREATE OR REPLACE FUNCTION public.gerar_numero_sequencial_assembleia()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_ano INTEGER;
  v_seq INTEGER;
BEGIN
  v_ano := EXTRACT(YEAR FROM COALESCE(NEW.data_primeira_convocacao, NOW()));
  SELECT COALESCE(MAX(numero_sequencial), 0) + 1 INTO v_seq
  FROM public.assembleias WHERE condominio_id = NEW.condominio_id AND tipo = NEW.tipo
    AND EXTRACT(YEAR FROM COALESCE(data_primeira_convocacao, created_at)) = v_ano;
  NEW.numero_sequencial := v_seq;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_assembleia_numero_sequencial
  BEFORE INSERT ON public.assembleias FOR EACH ROW
  WHEN (NEW.numero_sequencial IS NULL)
  EXECUTE FUNCTION public.gerar_numero_sequencial_assembleia();
