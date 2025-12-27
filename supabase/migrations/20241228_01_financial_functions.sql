-- ============================================
-- VERSIX NORMA - FUNCTIONS FINANCEIRO
-- ============================================

-- Função para calcular saldo do período
CREATE OR REPLACE FUNCTION public.calcular_saldo_periodo(p_condominio_id UUID, p_mes_referencia DATE)
RETURNS TABLE (saldo_anterior DECIMAL(12,2), total_receitas DECIMAL(12,2), total_despesas DECIMAL(12,2), saldo_atual DECIMAL(12,2)) AS $$
DECLARE
  v_saldo_anterior DECIMAL(12,2);
  v_receitas DECIMAL(12,2);
  v_despesas DECIMAL(12,2);
BEGIN
  SELECT COALESCE(pc.saldo_atual, 0) INTO v_saldo_anterior
  FROM public.prestacao_contas pc
  WHERE pc.condominio_id = p_condominio_id AND pc.mes_referencia = (p_mes_referencia - INTERVAL '1 month')::DATE AND pc.status = 'publicado';

  IF v_saldo_anterior IS NULL THEN
    SELECT COALESCE(SUM(cb.saldo_inicial), 0) INTO v_saldo_anterior
    FROM public.contas_bancarias cb WHERE cb.condominio_id = p_condominio_id AND cb.deleted_at IS NULL;
  END IF;

  SELECT COALESCE(SUM(lf.valor), 0) INTO v_receitas
  FROM public.lancamentos_financeiros lf
  WHERE lf.condominio_id = p_condominio_id AND lf.data_competencia >= p_mes_referencia
    AND lf.data_competencia < (p_mes_referencia + INTERVAL '1 month')::DATE
    AND lf.tipo = 'receita' AND lf.status = 'confirmado' AND lf.deleted_at IS NULL;

  SELECT COALESCE(SUM(lf.valor), 0) INTO v_despesas
  FROM public.lancamentos_financeiros lf
  WHERE lf.condominio_id = p_condominio_id AND lf.data_competencia >= p_mes_referencia
    AND lf.data_competencia < (p_mes_referencia + INTERVAL '1 month')::DATE
    AND lf.tipo = 'despesa' AND lf.status = 'confirmado' AND lf.deleted_at IS NULL;

  RETURN QUERY SELECT v_saldo_anterior, v_receitas, v_despesas, v_saldo_anterior + v_receitas - v_despesas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar saldo da conta bancária
CREATE OR REPLACE FUNCTION public.atualizar_saldo_conta()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmado' AND NEW.conta_bancaria_id IS NOT NULL THEN
    IF NEW.tipo = 'receita' THEN
      UPDATE public.contas_bancarias SET saldo_atual = saldo_atual + NEW.valor, data_saldo = NOW() WHERE id = NEW.conta_bancaria_id;
    ELSIF NEW.tipo = 'despesa' THEN
      UPDATE public.contas_bancarias SET saldo_atual = saldo_atual - NEW.valor, data_saldo = NOW() WHERE id = NEW.conta_bancaria_id;
    END IF;
  END IF;

  IF NEW.status = 'cancelado' AND OLD.status = 'confirmado' AND NEW.conta_bancaria_id IS NOT NULL THEN
    IF NEW.tipo = 'receita' THEN
      UPDATE public.contas_bancarias SET saldo_atual = saldo_atual - NEW.valor, data_saldo = NOW() WHERE id = NEW.conta_bancaria_id;
    ELSIF NEW.tipo = 'despesa' THEN
      UPDATE public.contas_bancarias SET saldo_atual = saldo_atual + NEW.valor, data_saldo = NOW() WHERE id = NEW.conta_bancaria_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_atualizar_saldo
  AFTER UPDATE ON public.lancamentos_financeiros
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.atualizar_saldo_conta();

-- Função para atualizar taxas atrasadas
CREATE OR REPLACE FUNCTION public.atualizar_taxas_atrasadas()
RETURNS INTEGER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.taxas_unidades SET status = 'atrasado', updated_at = NOW()
  WHERE status = 'pendente' AND data_vencimento < CURRENT_DATE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar taxas do mês
CREATE OR REPLACE FUNCTION public.gerar_taxas_mes(p_condominio_id UUID, p_mes_referencia DATE)
RETURNS INTEGER AS $$
DECLARE
  v_config public.configuracoes_financeiras%ROWTYPE;
  v_count INTEGER := 0;
  v_unidade RECORD;
  v_valor_base DECIMAL(10,2);
  v_valor_fundo DECIMAL(10,2);
  v_data_vencimento DATE;
BEGIN
  SELECT * INTO v_config FROM public.configuracoes_financeiras WHERE condominio_id = p_condominio_id;
  IF v_config.id IS NULL THEN RAISE EXCEPTION 'Configuração financeira não encontrada'; END IF;

  v_data_vencimento := (p_mes_referencia + INTERVAL '1 month')::DATE;
  v_data_vencimento := make_date(
    EXTRACT(YEAR FROM v_data_vencimento)::INTEGER,
    EXTRACT(MONTH FROM v_data_vencimento)::INTEGER,
    LEAST(v_config.dia_vencimento, EXTRACT(DAY FROM (date_trunc('month', v_data_vencimento) + INTERVAL '1 month - 1 day'))::INTEGER)
  );

  FOR v_unidade IN SELECT uh.id, uh.fracao_ideal FROM public.unidades_habitacionais uh WHERE uh.condominio_id = p_condominio_id AND uh.ativo = true
  LOOP
    v_valor_base := v_config.taxa_ordinaria_base;

    IF NOT EXISTS (SELECT 1 FROM public.taxas_unidades WHERE unidade_id = v_unidade.id AND mes_referencia = p_mes_referencia AND tipo = 'ordinaria') THEN
      INSERT INTO public.taxas_unidades (condominio_id, unidade_id, mes_referencia, tipo, valor_base, valor_final, data_vencimento)
      VALUES (p_condominio_id, v_unidade.id, p_mes_referencia, 'ordinaria', v_valor_base, v_valor_base, v_data_vencimento);
      v_count := v_count + 1;

      IF v_config.fundo_reserva_percentual > 0 THEN
        v_valor_fundo := v_valor_base * (v_config.fundo_reserva_percentual / 100);
        INSERT INTO public.taxas_unidades (condominio_id, unidade_id, mes_referencia, tipo, valor_base, valor_final, data_vencimento)
        VALUES (p_condominio_id, v_unidade.id, p_mes_referencia, 'fundo_reserva', v_valor_fundo, v_valor_fundo, v_data_vencimento);
      END IF;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar período fechado (Soft Lock)
CREATE OR REPLACE FUNCTION public.check_periodo_fechado()
RETURNS TRIGGER AS $$
DECLARE
  v_mes_referencia DATE;
  v_periodo_status public.prestacao_status;
BEGIN
  IF TG_OP = 'DELETE' THEN v_mes_referencia := date_trunc('month', OLD.data_competencia)::DATE;
  ELSE v_mes_referencia := date_trunc('month', NEW.data_competencia)::DATE;
  END IF;

  SELECT pc.status INTO v_periodo_status FROM public.prestacao_contas pc
  WHERE pc.condominio_id = COALESCE(NEW.condominio_id, OLD.condominio_id) AND pc.mes_referencia = v_mes_referencia;

  IF v_periodo_status IN ('aprovado', 'publicado') THEN
    IF current_setting('app.force_closed_period', true) = 'true' THEN
      RAISE WARNING 'Alteração forçada em período fechado por SuperAdmin';
      RETURN COALESCE(NEW, OLD);
    END IF;
    RAISE EXCEPTION 'Período % está fechado (%). Não é permitido alterar lançamentos.', to_char(v_mes_referencia, 'MM/YYYY'), v_periodo_status;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_check_periodo_fechado
  BEFORE INSERT OR UPDATE OR DELETE ON public.lancamentos_financeiros
  FOR EACH ROW EXECUTE FUNCTION public.check_periodo_fechado();

-- Criar snapshot mensal
CREATE OR REPLACE FUNCTION public.criar_snapshot_mensal(p_condominio_id UUID, p_mes_referencia DATE)
RETURNS BOOLEAN AS $$
DECLARE
  v_conta RECORD;
  v_saldo_inicial DECIMAL(12,2);
  v_entradas DECIMAL(12,2);
  v_saidas DECIMAL(12,2);
  v_count INTEGER := 0;
BEGIN
  FOR v_conta IN SELECT id FROM public.contas_bancarias WHERE condominio_id = p_condominio_id AND deleted_at IS NULL
  LOOP
    SELECT COALESCE(cbh.saldo_final, cb.saldo_inicial) INTO v_saldo_inicial
    FROM public.contas_bancarias cb
    LEFT JOIN public.contas_bancarias_historico cbh ON cbh.conta_bancaria_id = cb.id AND cbh.mes_referencia = (p_mes_referencia - INTERVAL '1 month')::DATE
    WHERE cb.id = v_conta.id;

    SELECT COALESCE(SUM(valor), 0) INTO v_entradas FROM public.lancamentos_financeiros
    WHERE conta_bancaria_id = v_conta.id AND tipo = 'receita' AND status = 'confirmado'
      AND data_competencia >= p_mes_referencia AND data_competencia < (p_mes_referencia + INTERVAL '1 month')::DATE AND deleted_at IS NULL;

    SELECT COALESCE(SUM(valor), 0) INTO v_saidas FROM public.lancamentos_financeiros
    WHERE conta_bancaria_id = v_conta.id AND tipo = 'despesa' AND status = 'confirmado'
      AND data_competencia >= p_mes_referencia AND data_competencia < (p_mes_referencia + INTERVAL '1 month')::DATE AND deleted_at IS NULL;

    INSERT INTO public.contas_bancarias_historico (conta_bancaria_id, condominio_id, mes_referencia, saldo_inicial, total_entradas, total_saidas, saldo_final)
    VALUES (v_conta.id, p_condominio_id, p_mes_referencia, v_saldo_inicial, v_entradas, v_saidas, v_saldo_inicial + v_entradas - v_saidas)
    ON CONFLICT (conta_bancaria_id, mes_referencia) DO UPDATE SET
      saldo_inicial = EXCLUDED.saldo_inicial, total_entradas = EXCLUDED.total_entradas,
      total_saidas = EXCLUDED.total_saidas, saldo_final = EXCLUDED.saldo_final;
    v_count := v_count + 1;
  END LOOP;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger ao publicar prestação
CREATE OR REPLACE FUNCTION public.on_prestacao_publicada()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'publicado' AND (OLD.status IS NULL OR OLD.status != 'publicado') THEN
    PERFORM public.criar_snapshot_mensal(NEW.condominio_id, NEW.mes_referencia);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_prestacao_publicada
  AFTER UPDATE ON public.prestacao_contas FOR EACH ROW
  WHEN (NEW.status = 'publicado') EXECUTE FUNCTION public.on_prestacao_publicada();

-- Calcular saldo otimizado (usa snapshot)
CREATE OR REPLACE FUNCTION public.calcular_saldo_periodo_otimizado(p_condominio_id UUID, p_mes_referencia DATE)
RETURNS TABLE (saldo_anterior DECIMAL(12,2), total_receitas DECIMAL(12,2), total_despesas DECIMAL(12,2), saldo_atual DECIMAL(12,2)) AS $$
DECLARE
  v_saldo_anterior DECIMAL(12,2);
  v_receitas DECIMAL(12,2);
  v_despesas DECIMAL(12,2);
BEGIN
  SELECT SUM(cbh.saldo_final) INTO v_saldo_anterior
  FROM public.contas_bancarias_historico cbh
  WHERE cbh.condominio_id = p_condominio_id AND cbh.mes_referencia = (p_mes_referencia - INTERVAL '1 month')::DATE;

  IF v_saldo_anterior IS NULL THEN
    RETURN QUERY SELECT * FROM public.calcular_saldo_periodo(p_condominio_id, p_mes_referencia);
    RETURN;
  END IF;

  SELECT COALESCE(SUM(lf.valor), 0) INTO v_receitas FROM public.lancamentos_financeiros lf
  WHERE lf.condominio_id = p_condominio_id AND lf.data_competencia >= p_mes_referencia
    AND lf.data_competencia < (p_mes_referencia + INTERVAL '1 month')::DATE
    AND lf.tipo = 'receita' AND lf.status = 'confirmado' AND lf.deleted_at IS NULL;

  SELECT COALESCE(SUM(lf.valor), 0) INTO v_despesas FROM public.lancamentos_financeiros lf
  WHERE lf.condominio_id = p_condominio_id AND lf.data_competencia >= p_mes_referencia
    AND lf.data_competencia < (p_mes_referencia + INTERVAL '1 month')::DATE
    AND lf.tipo = 'despesa' AND lf.status = 'confirmado' AND lf.deleted_at IS NULL;

  RETURN QUERY SELECT v_saldo_anterior, v_receitas, v_despesas, v_saldo_anterior + v_receitas - v_despesas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de updated_at
DROP TRIGGER IF EXISTS tr_cat_fin_updated ON public.categorias_financeiras;
DROP TRIGGER IF EXISTS tr_contas_bancarias_updated ON public.contas_bancarias;
DROP TRIGGER IF EXISTS tr_lancamentos_updated ON public.lancamentos_financeiros;
DROP TRIGGER IF EXISTS tr_prestacao_updated ON public.prestacao_contas;
DROP TRIGGER IF EXISTS tr_taxas_updated ON public.taxas_unidades;
DROP TRIGGER IF EXISTS tr_config_fin_updated ON public.configuracoes_financeiras;

CREATE TRIGGER tr_cat_fin_updated BEFORE UPDATE ON public.categorias_financeiras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_contas_bancarias_updated BEFORE UPDATE ON public.contas_bancarias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_lancamentos_updated BEFORE UPDATE ON public.lancamentos_financeiros FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_prestacao_updated BEFORE UPDATE ON public.prestacao_contas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_taxas_updated BEFORE UPDATE ON public.taxas_unidades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_config_fin_updated BEFORE UPDATE ON public.configuracoes_financeiras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
