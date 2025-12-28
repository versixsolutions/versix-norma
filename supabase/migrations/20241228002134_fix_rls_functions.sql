-- ============================================
-- VERSIX NORMA - CORREÇÃO DAS FUNÇÕES RLS
-- ============================================
-- Correção das funções auxiliares RLS para usar usuario_condominios
-- ============================================

-- ============================================
-- FUNCTIONS AUXILIARES CORRETAS
-- ============================================

CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT uc.role FROM public.usuario_condominios uc
          WHERE uc.usuario_id = public.get_my_user_id()
          AND uc.status = 'ativo'
          ORDER BY uc.created_at DESC
          LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
CREATE OR REPLACE FUNCTION public.get_my_condominio_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT uc.condominio_id FROM public.usuario_condominios uc
          WHERE uc.usuario_id = public.get_my_user_id()
          AND uc.status = 'ativo'
          ORDER BY uc.created_at DESC
          LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
CREATE OR REPLACE FUNCTION public.get_my_condominios()
RETURNS TABLE(condominio_id UUID, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT uc.condominio_id, uc.role::TEXT
  FROM public.usuario_condominios uc
  WHERE uc.usuario_id = public.get_my_user_id()
  AND uc.status = 'ativo';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
