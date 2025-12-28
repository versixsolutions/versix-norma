-- ============================================
-- VERSIX NORMA - RLS MÓDULO ASSEMBLEIAS
-- ============================================

-- Habilitar RLS
ALTER TABLE public.assembleias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleia_pautas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleia_pauta_opcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleia_presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleia_votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleia_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleia_assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleia_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS: assembleias
-- ============================================
CREATE POLICY "superadmin_full_assembleias" ON public.assembleias FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_assembleias" ON public.assembleias FOR ALL TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id())
  WITH CHECK (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "morador_read_assembleias" ON public.assembleias FOR SELECT TO authenticated
  USING (condominio_id = public.get_my_condominio_id() AND status != 'rascunho');

-- ============================================
-- RLS: assembleia_pautas
-- ============================================
CREATE POLICY "superadmin_full_pautas" ON public.assembleia_pautas FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_pautas" ON public.assembleia_pautas FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assembleias a WHERE a.id = assembleia_id AND a.condominio_id = public.get_my_condominio_id() AND public.get_my_role() = 'sindico'));

CREATE POLICY "morador_read_pautas" ON public.assembleia_pautas FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assembleias a WHERE a.id = assembleia_id AND a.condominio_id = public.get_my_condominio_id() AND a.status != 'rascunho'));

-- ============================================
-- RLS: assembleia_pauta_opcoes
-- ============================================
CREATE POLICY "superadmin_full_opcoes" ON public.assembleia_pauta_opcoes FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_opcoes" ON public.assembleia_pauta_opcoes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assembleia_pautas p JOIN public.assembleias a ON a.id = p.assembleia_id WHERE p.id = pauta_id AND a.condominio_id = public.get_my_condominio_id() AND public.get_my_role() = 'sindico'));

CREATE POLICY "morador_read_opcoes" ON public.assembleia_pauta_opcoes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assembleia_pautas p JOIN public.assembleias a ON a.id = p.assembleia_id WHERE p.id = pauta_id AND a.condominio_id = public.get_my_condominio_id()));

-- ============================================
-- RLS: assembleia_presencas
-- ============================================
CREATE POLICY "superadmin_full_presencas" ON public.assembleia_presencas FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_read_presencas" ON public.assembleia_presencas FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assembleias a WHERE a.id = assembleia_id AND a.condominio_id = public.get_my_condominio_id() AND public.get_my_role() IN ('sindico', 'subsindico')));

CREATE POLICY "morador_own_presenca" ON public.assembleia_presencas FOR SELECT TO authenticated
  USING (usuario_id = public.get_my_user_id() OR representante_id = public.get_my_user_id());

CREATE POLICY "morador_insert_presenca" ON public.assembleia_presencas FOR INSERT TO authenticated
  WITH CHECK (usuario_id = public.get_my_user_id());

-- ============================================
-- RLS: assembleia_votos
-- ============================================
DROP POLICY IF EXISTS "superadmin_full_votos" ON public.assembleia_votos;
DROP POLICY IF EXISTS "votos_read" ON public.assembleia_votos;
DROP POLICY IF EXISTS "votos_insert" ON public.assembleia_votos;

CREATE POLICY "superadmin_full_votos" ON public.assembleia_votos FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "votos_read" ON public.assembleia_votos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assembleia_pautas p JOIN public.assembleias a ON a.id = p.assembleia_id
    WHERE p.id = pauta_id AND a.condominio_id = public.get_my_condominio_id()
    AND (NOT p.voto_secreto OR usuario_id = public.get_my_user_id())));

CREATE POLICY "votos_insert" ON public.assembleia_votos FOR INSERT TO authenticated
  WITH CHECK (presenca_id IN (SELECT id FROM public.assembleia_presencas WHERE usuario_id = public.get_my_user_id() OR representante_id = public.get_my_user_id()));

-- ============================================
-- RLS: assembleia_comentarios
-- ============================================
CREATE POLICY "superadmin_full_comentarios" ON public.assembleia_comentarios FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_comentarios" ON public.assembleia_comentarios FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assembleia_pautas p JOIN public.assembleias a ON a.id = p.assembleia_id WHERE p.id = pauta_id AND a.condominio_id = public.get_my_condominio_id() AND public.get_my_role() = 'sindico'));

CREATE POLICY "morador_read_comentarios" ON public.assembleia_comentarios FOR SELECT TO authenticated
  USING (visivel = true AND EXISTS (SELECT 1 FROM public.assembleia_pautas p JOIN public.assembleias a ON a.id = p.assembleia_id WHERE p.id = pauta_id AND a.condominio_id = public.get_my_condominio_id()));

CREATE POLICY "morador_insert_comentarios" ON public.assembleia_comentarios FOR INSERT TO authenticated
  WITH CHECK (usuario_id = public.get_my_user_id() AND EXISTS (SELECT 1 FROM public.assembleia_pautas p JOIN public.assembleias a ON a.id = p.assembleia_id WHERE p.id = pauta_id AND a.condominio_id = public.get_my_condominio_id() AND a.status IN ('em_andamento', 'votacao')));

-- ============================================
-- RLS: assembleia_assinaturas
-- ============================================
CREATE POLICY "superadmin_full_assinaturas" ON public.assembleia_assinaturas FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "read_assinaturas" ON public.assembleia_assinaturas FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assembleias a WHERE a.id = assembleia_id AND a.condominio_id = public.get_my_condominio_id()));

CREATE POLICY "insert_assinaturas" ON public.assembleia_assinaturas FOR INSERT TO authenticated
  WITH CHECK (usuario_id = public.get_my_user_id());

-- ============================================
-- RLS: assembleia_logs
-- ============================================
CREATE POLICY "superadmin_full_logs" ON public.assembleia_logs FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_read_logs" ON public.assembleia_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assembleias a WHERE a.id = assembleia_id AND a.condominio_id = public.get_my_condominio_id() AND public.get_my_role() IN ('sindico', 'subsindico')));

-- ============================================
-- STORAGE: Bucket para documentos de assembleia
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assembleias', 'assembleias', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "user_upload_assembleias" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assembleias' AND (storage.foldername(name))[1] = public.get_my_condominio_id()::TEXT);

CREATE POLICY "user_read_assembleias" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'assembleias' AND (storage.foldername(name))[1] = public.get_my_condominio_id()::TEXT);

CREATE POLICY "sindico_delete_assembleias" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'assembleias' AND public.get_my_role() = 'sindico' AND (storage.foldername(name))[1] = public.get_my_condominio_id()::TEXT);
