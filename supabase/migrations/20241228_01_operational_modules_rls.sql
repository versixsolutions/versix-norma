-- ============================================
-- VERSIX NORMA - RLS MÓDULOS OPERACIONAIS
-- ============================================

-- ============================================
-- FUNCTIONS AUXILIARES
-- ============================================

CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid() AND deleted_at IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.usuarios WHERE auth_id = auth.uid() AND deleted_at IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_condominio_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT condominio_id FROM public.usuarios WHERE auth_id = auth.uid() AND deleted_at IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Habilitar RLS
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicados_leitura ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamados_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS: comunicados
-- ============================================
CREATE POLICY "superadmin_full_comunicados" ON public.comunicados FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_comunicados" ON public.comunicados FOR ALL TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL)
  WITH CHECK (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "morador_read_comunicados" ON public.comunicados FOR SELECT TO authenticated
  USING (condominio_id = public.get_my_condominio_id() AND status = 'publicado' AND deleted_at IS NULL
    AND (publicar_em IS NULL OR publicar_em <= NOW()) AND (expirar_em IS NULL OR expirar_em > NOW()));

-- ============================================
-- RLS: comunicados_leitura
-- ============================================
CREATE POLICY "superadmin_view_leitura" ON public.comunicados_leitura FOR SELECT TO authenticated
  USING (public.is_superadmin());

CREATE POLICY "sindico_view_leitura" ON public.comunicados_leitura FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND EXISTS (
    SELECT 1 FROM public.comunicados c WHERE c.id = comunicado_id AND c.condominio_id = public.get_my_condominio_id()));

CREATE POLICY "user_insert_leitura" ON public.comunicados_leitura FOR INSERT TO authenticated
  WITH CHECK (usuario_id = public.get_my_user_id() AND EXISTS (
    SELECT 1 FROM public.comunicados c WHERE c.id = comunicado_id AND c.condominio_id = public.get_my_condominio_id() AND c.status = 'publicado'));

-- ============================================
-- RLS: ocorrencias
-- ============================================
CREATE POLICY "superadmin_full_ocorrencias" ON public.ocorrencias FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_ocorrencias" ON public.ocorrencias FOR ALL TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL)
  WITH CHECK (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "conselho_read_ocorrencias" ON public.ocorrencias FOR SELECT TO authenticated
  USING (public.get_my_role() = 'conselheiro' AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL);

CREATE POLICY "conselho_create_ocorrencias" ON public.ocorrencias FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'conselheiro' AND condominio_id = public.get_my_condominio_id() AND reportado_por = public.get_my_user_id());

CREATE POLICY "morador_own_ocorrencias" ON public.ocorrencias FOR SELECT TO authenticated
  USING (public.get_my_role() = 'morador' AND condominio_id = public.get_my_condominio_id() AND reportado_por = public.get_my_user_id() AND deleted_at IS NULL);

CREATE POLICY "morador_create_ocorrencias" ON public.ocorrencias FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'morador' AND condominio_id = public.get_my_condominio_id() AND reportado_por = public.get_my_user_id());

CREATE POLICY "morador_update_own_ocorrencias" ON public.ocorrencias FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'morador' AND reportado_por = public.get_my_user_id() AND status = 'aberta' AND deleted_at IS NULL)
  WITH CHECK (reportado_por = public.get_my_user_id());

-- ============================================
-- RLS: ocorrencias_historico
-- ============================================
CREATE POLICY "superadmin_view_historico" ON public.ocorrencias_historico FOR SELECT TO authenticated
  USING (public.is_superadmin());

CREATE POLICY "sindico_view_historico" ON public.ocorrencias_historico FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND EXISTS (
    SELECT 1 FROM public.ocorrencias o WHERE o.id = ocorrencia_id AND o.condominio_id = public.get_my_condominio_id()));

CREATE POLICY "morador_view_own_historico" ON public.ocorrencias_historico FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ocorrencias o WHERE o.id = ocorrencia_id AND o.reportado_por = public.get_my_user_id()));

-- ============================================
-- RLS: chamados
-- ============================================
CREATE POLICY "superadmin_full_chamados" ON public.chamados FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_chamados" ON public.chamados FOR ALL TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL)
  WITH CHECK (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "morador_own_chamados" ON public.chamados FOR SELECT TO authenticated
  USING (condominio_id = public.get_my_condominio_id() AND solicitante_id = public.get_my_user_id() AND deleted_at IS NULL);

CREATE POLICY "morador_create_chamados" ON public.chamados FOR INSERT TO authenticated
  WITH CHECK (condominio_id = public.get_my_condominio_id() AND solicitante_id = public.get_my_user_id());

CREATE POLICY "morador_rate_chamados" ON public.chamados FOR UPDATE TO authenticated
  USING (solicitante_id = public.get_my_user_id() AND status IN ('resolvido', 'fechado') AND avaliacao_nota IS NULL AND deleted_at IS NULL)
  WITH CHECK (solicitante_id = public.get_my_user_id());

-- ============================================
-- RLS: chamados_mensagens
-- ============================================
CREATE POLICY "superadmin_full_mensagens" ON public.chamados_mensagens FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_mensagens" ON public.chamados_mensagens FOR ALL TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND EXISTS (
    SELECT 1 FROM public.chamados c WHERE c.id = chamado_id AND c.condominio_id = public.get_my_condominio_id()) AND deleted_at IS NULL)
  WITH CHECK (public.get_my_role() IN ('sindico', 'subsindico') AND EXISTS (
    SELECT 1 FROM public.chamados c WHERE c.id = chamado_id AND c.condominio_id = public.get_my_condominio_id()));

CREATE POLICY "morador_own_mensagens" ON public.chamados_mensagens FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.chamados c WHERE c.id = chamado_id AND c.solicitante_id = public.get_my_user_id()) AND deleted_at IS NULL);

CREATE POLICY "morador_create_mensagens" ON public.chamados_mensagens FOR INSERT TO authenticated
  WITH CHECK (autor_id = public.get_my_user_id() AND EXISTS (
    SELECT 1 FROM public.chamados c WHERE c.id = chamado_id AND c.solicitante_id = public.get_my_user_id() AND c.status NOT IN ('fechado')));

-- ============================================
-- RLS: faq
-- ============================================
CREATE POLICY "superadmin_full_faq" ON public.faq FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_faq" ON public.faq FOR ALL TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id() AND deleted_at IS NULL)
  WITH CHECK (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "morador_read_faq" ON public.faq FOR SELECT TO authenticated
  USING (condominio_id = public.get_my_condominio_id() AND ativo = true AND deleted_at IS NULL);

-- ============================================
-- STORAGE: Bucket para anexos
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('anexos', 'anexos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "user_upload_anexos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'anexos' AND (storage.foldername(name))[1] = public.get_my_condominio_id()::TEXT);

CREATE POLICY "user_read_anexos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'anexos' AND (storage.foldername(name))[1] = public.get_my_condominio_id()::TEXT);

CREATE POLICY "sindico_delete_anexos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'anexos' AND public.get_my_role() IN ('sindico', 'subsindico')
    AND (storage.foldername(name))[1] = public.get_my_condominio_id()::TEXT);
