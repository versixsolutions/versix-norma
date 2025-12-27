-- ============================================
-- VERSIX NORMA - RLS MÓDULO FINANCEIRO
-- ============================================

-- Habilitar RLS
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_bancarias_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestacao_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxas_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_financeiras ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas antes de criar as novas
DROP POLICY IF EXISTS "superadmin_all_categorias" ON public.categorias_financeiras;
DROP POLICY IF EXISTS "sindico_manage_categorias" ON public.categorias_financeiras;
DROP POLICY IF EXISTS "users_view_categorias" ON public.categorias_financeiras;
DROP POLICY IF EXISTS "superadmin_all_contas" ON public.contas_bancarias;
DROP POLICY IF EXISTS "sindico_manage_contas" ON public.contas_bancarias;
DROP POLICY IF EXISTS "superadmin_all_hist_contas" ON public.contas_bancarias_historico;
DROP POLICY IF EXISTS "sindico_view_hist_contas" ON public.contas_bancarias_historico;
DROP POLICY IF EXISTS "superadmin_all_lancamentos" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "sindico_manage_lancamentos" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "users_view_lancamentos_publicados" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "superadmin_all_prestacao" ON public.prestacao_contas;
DROP POLICY IF EXISTS "sindico_manage_prestacao" ON public.prestacao_contas;
DROP POLICY IF EXISTS "conselho_aprovar_prestacao" ON public.prestacao_contas;
DROP POLICY IF EXISTS "users_view_prestacao_publicada" ON public.prestacao_contas;
DROP POLICY IF EXISTS "superadmin_all_taxas" ON public.taxas_unidades;
DROP POLICY IF EXISTS "sindico_manage_taxas" ON public.taxas_unidades;
DROP POLICY IF EXISTS "morador_own_taxas" ON public.taxas_unidades;
DROP POLICY IF EXISTS "superadmin_all_config_fin" ON public.configuracoes_financeiras;
DROP POLICY IF EXISTS "sindico_manage_config_fin" ON public.configuracoes_financeiras;
DROP POLICY IF EXISTS "users_view_config_fin" ON public.configuracoes_financeiras;

-- ============================================
-- RLS: categorias_financeiras
-- ============================================
CREATE POLICY "superadmin_full_cat_fin" ON public.categorias_financeiras FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_cat_fin" ON public.categorias_financeiras FOR ALL TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL)
  WITH CHECK (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "read_cat_fin" ON public.categorias_financeiras FOR SELECT TO authenticated
  USING (condominio_id = public.get_my_condominio_id() AND ativo = true AND deleted_at IS NULL);

-- ============================================
-- RLS: contas_bancarias
-- ============================================
CREATE POLICY "superadmin_full_contas" ON public.contas_bancarias FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_contas" ON public.contas_bancarias FOR ALL TO authenticated
  USING (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL)
  WITH CHECK (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "read_contas_gestao" ON public.contas_bancarias FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('subsindico', 'conselheiro') AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL);

-- ============================================
-- RLS: contas_bancarias_historico
-- ============================================
CREATE POLICY "superadmin_full_cb_historico" ON public.contas_bancarias_historico FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_read_cb_historico" ON public.contas_bancarias_historico FOR SELECT TO authenticated
  USING (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "gestao_read_cb_historico" ON public.contas_bancarias_historico FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('subsindico', 'conselheiro') AND condominio_id = public.get_my_condominio_id());

-- ============================================
-- RLS: lancamentos_financeiros
-- ============================================
CREATE POLICY "superadmin_full_lancamentos" ON public.lancamentos_financeiros FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_lancamentos" ON public.lancamentos_financeiros FOR ALL TO authenticated
  USING (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL)
  WITH CHECK (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "subsindico_lancamentos" ON public.lancamentos_financeiros FOR SELECT TO authenticated
  USING (public.get_my_role() = 'subsindico' AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL);

CREATE POLICY "subsindico_create_lancamentos" ON public.lancamentos_financeiros FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'subsindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "conselho_read_lancamentos" ON public.lancamentos_financeiros FOR SELECT TO authenticated
  USING (public.get_my_role() = 'conselheiro' AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL);

CREATE POLICY "morador_read_lancamentos" ON public.lancamentos_financeiros FOR SELECT TO authenticated
  USING (public.get_my_role() = 'morador' AND condominio_id = public.get_my_condominio_id() AND status = 'confirmado' AND deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM public.prestacao_contas pc WHERE pc.condominio_id = lancamentos_financeiros.condominio_id
      AND pc.mes_referencia = date_trunc('month', lancamentos_financeiros.data_competencia)::DATE AND pc.status = 'publicado'));

-- ============================================
-- RLS: prestacao_contas
-- ============================================
CREATE POLICY "superadmin_full_prestacao" ON public.prestacao_contas FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_prestacao" ON public.prestacao_contas FOR ALL TO authenticated
  USING (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id())
  WITH CHECK (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "subsindico_read_prestacao" ON public.prestacao_contas FOR SELECT TO authenticated
  USING (public.get_my_role() = 'subsindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "conselho_read_prestacao" ON public.prestacao_contas FOR SELECT TO authenticated
  USING (public.get_my_role() = 'conselheiro' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "conselho_update_prestacao" ON public.prestacao_contas FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'conselheiro' AND condominio_id = public.get_my_condominio_id() AND status = 'em_revisao')
  WITH CHECK (public.get_my_role() = 'conselheiro' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "morador_read_prestacao" ON public.prestacao_contas FOR SELECT TO authenticated
  USING (public.get_my_role() = 'morador' AND condominio_id = public.get_my_condominio_id() AND status = 'publicado');

-- ============================================
-- RLS: taxas_unidades
-- ============================================
CREATE POLICY "superadmin_full_taxas" ON public.taxas_unidades FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_taxas" ON public.taxas_unidades FOR ALL TO authenticated
  USING (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id())
  WITH CHECK (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "subsindico_read_taxas" ON public.taxas_unidades FOR SELECT TO authenticated
  USING (public.get_my_role() = 'subsindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "conselho_read_taxas" ON public.taxas_unidades FOR SELECT TO authenticated
  USING (public.get_my_role() = 'conselheiro' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "morador_own_taxas" ON public.taxas_unidades FOR SELECT TO authenticated
  USING (public.get_my_role() = 'morador' AND EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.unidade_id = taxas_unidades.unidade_id AND u.id = public.get_my_user_id() AND u.deleted_at IS NULL));

-- ============================================
-- RLS: configuracoes_financeiras
-- ============================================
CREATE POLICY "superadmin_full_config_fin" ON public.configuracoes_financeiras FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_config_fin" ON public.configuracoes_financeiras FOR ALL TO authenticated
  USING (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id())
  WITH CHECK (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "read_config_fin" ON public.configuracoes_financeiras FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('subsindico', 'conselheiro') AND condominio_id = public.get_my_condominio_id());

-- ============================================
-- STORAGE: Bucket para comprovantes
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('comprovantes', 'comprovantes', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "user_upload_comprovantes" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'comprovantes' AND (storage.foldername(name))[1] = public.get_my_condominio_id()::TEXT
    AND public.get_my_role() IN ('sindico', 'subsindico'));

CREATE POLICY "user_read_comprovantes" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'comprovantes' AND (storage.foldername(name))[1] = public.get_my_condominio_id()::TEXT);

CREATE POLICY "sindico_delete_comprovantes" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'comprovantes' AND public.get_my_role() = 'sindico'
    AND (storage.foldername(name))[1] = public.get_my_condominio_id()::TEXT);
