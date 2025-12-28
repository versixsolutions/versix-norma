-- ============================================
-- VERSIX NORMA - RLS MÓDULO COMUNICAÇÃO
-- ============================================

-- Habilitar RLS
ALTER TABLE public.notificacoes_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_canais_preferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_cascade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murais_gerados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergencias_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos_invalidos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS: notificacoes_config
-- ============================================
CREATE POLICY "superadmin_full_config" ON public.notificacoes_config FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

-- CREATE POLICY "sindico_manage_config" ON public.notificacoes_config FOR ALL TO authenticated
--   USING (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id())
--   WITH CHECK (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

-- CREATE POLICY "morador_read_config" ON public.notificacoes_config FOR SELECT TO authenticated
--   USING (condominio_id = public.get_my_condominio_id());

-- ============================================
-- RLS: usuarios_canais_preferencias
-- ============================================
CREATE POLICY "superadmin_full_prefs" ON public.usuarios_canais_preferencias FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "usuario_own_prefs" ON public.usuarios_canais_preferencias FOR ALL TO authenticated
  USING (usuario_id = public.get_my_user_id()) WITH CHECK (usuario_id = public.get_my_user_id());

-- ============================================
-- RLS: notificacoes
-- ============================================
CREATE POLICY "superadmin_full_notificacoes" ON public.notificacoes FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_notificacoes" ON public.notificacoes FOR ALL TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id())
  WITH CHECK (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "morador_read_notificacoes" ON public.notificacoes FOR SELECT TO authenticated
  USING (condominio_id = public.get_my_condominio_id());

-- ============================================
-- RLS: notificacoes_entregas
-- ============================================
CREATE POLICY "superadmin_full_entregas" ON public.notificacoes_entregas FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "usuario_own_entregas" ON public.notificacoes_entregas FOR SELECT TO authenticated
  USING (usuario_id = public.get_my_user_id());

CREATE POLICY "usuario_update_entregas" ON public.notificacoes_entregas FOR UPDATE TO authenticated
  USING (usuario_id = public.get_my_user_id()) WITH CHECK (usuario_id = public.get_my_user_id());

CREATE POLICY "sindico_read_entregas" ON public.notificacoes_entregas FOR SELECT TO authenticated
  USING (notificacao_id IN (SELECT id FROM public.notificacoes WHERE condominio_id = public.get_my_condominio_id() AND public.get_my_role() IN ('sindico', 'subsindico')));

-- ============================================
-- RLS: notificacoes_cascade
-- ============================================
CREATE POLICY "superadmin_full_cascade" ON public.notificacoes_cascade FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "service_role_cascade" ON public.notificacoes_cascade FOR ALL TO service_role USING (true);

-- ============================================
-- RLS: murais_gerados
-- ============================================
CREATE POLICY "superadmin_full_murais" ON public.murais_gerados FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_murais" ON public.murais_gerados FOR ALL TO authenticated
  USING (public.get_my_role() = 'sindico' AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "morador_read_murais" ON public.murais_gerados FOR SELECT TO authenticated
  USING (condominio_id = public.get_my_condominio_id());

-- ============================================
-- RLS: emergencias_log
-- ============================================
CREATE POLICY "superadmin_full_emergencias" ON public.emergencias_log FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_manage_emergencias" ON public.emergencias_log FOR ALL TO authenticated
  USING (public.get_my_role() IN ('sindico', 'subsindico') AND condominio_id = public.get_my_condominio_id());

CREATE POLICY "morador_read_emergencias" ON public.emergencias_log FOR SELECT TO authenticated
  USING (condominio_id = public.get_my_condominio_id());

-- ============================================
-- RLS: contatos_invalidos
-- ============================================
CREATE POLICY "superadmin_full_contatos_inv" ON public.contatos_invalidos FOR ALL TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "sindico_read_contatos_inv" ON public.contatos_invalidos FOR SELECT TO authenticated
  USING (usuario_id IN (
    SELECT u.id FROM public.usuarios u
    JOIN public.usuario_condominios uc ON uc.usuario_id = u.id
    WHERE uc.condominio_id = public.get_my_condominio_id()
  ) AND public.get_my_role() IN ('sindico', 'subsindico'));

CREATE POLICY "usuario_own_contatos_inv" ON public.contatos_invalidos FOR SELECT TO authenticated
  USING (usuario_id = public.get_my_user_id());

-- ============================================
-- Inserir config padrão para condominios existentes
-- ============================================
INSERT INTO public.notificacoes_config (condominio_id)
SELECT id FROM public.condominios WHERE id NOT IN (SELECT condominio_id FROM public.notificacoes_config)
ON CONFLICT DO NOTHING;

-- Trigger para criar config automaticamente
CREATE OR REPLACE FUNCTION public.criar_config_notificacoes_automatica()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.notificacoes_config (condominio_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_condominio_config_notificacoes
  AFTER INSERT ON public.condominios FOR EACH ROW
  EXECUTE FUNCTION public.criar_config_notificacoes_automatica();
