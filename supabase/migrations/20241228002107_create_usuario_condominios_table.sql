-- ============================================
-- VERSIX NORMA - MIGRAÇÃO: TABELA USUARIO_CONDOMINIOS
-- ============================================
-- Criação da tabela de relacionamento entre usuários e condomínios
-- ============================================

-- ============================================
-- TABELA: usuario_condominios
-- ============================================
CREATE TABLE public.usuario_condominios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES public.unidades_habitacionais(id) ON DELETE SET NULL,

  -- Relacionamento e permissões
  role public.user_role NOT NULL DEFAULT 'morador',
  tipo_vinculo public.tipo_residente NOT NULL DEFAULT 'proprietario_residente',
  is_responsavel_financeiro BOOLEAN NOT NULL DEFAULT false,

  -- Período de vínculo
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,

  -- Status
  status public.user_status NOT NULL DEFAULT 'active',

  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT uq_usuario_condominio UNIQUE (usuario_id, condominio_id),
  CONSTRAINT check_data_fim CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);
-- Índices
CREATE INDEX idx_usuario_condominios_usuario ON public.usuario_condominios(usuario_id);
CREATE INDEX idx_usuario_condominios_condominio ON public.usuario_condominios(condominio_id);
CREATE INDEX idx_usuario_condominios_unidade ON public.usuario_condominios(unidade_id);
CREATE INDEX idx_usuario_condominios_role ON public.usuario_condominios(role);
CREATE INDEX idx_usuario_condominios_status ON public.usuario_condominios(status);
CREATE INDEX idx_usuario_condominios_ativo ON public.usuario_condominios(condominio_id, status) WHERE status = 'active';
-- Trigger para updated_at
CREATE TRIGGER update_usuario_condominios_updated_at
  BEFORE UPDATE ON public.usuario_condominios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Comentários
COMMENT ON TABLE public.usuario_condominios IS 'Relacionamento entre usuários e condomínios com roles e permissões';
COMMENT ON COLUMN public.usuario_condominios.role IS 'Papel do usuário no condomínio (sindico, subsindico, conselheiro, morador)';
COMMENT ON COLUMN public.usuario_condominios.tipo_vinculo IS 'Tipo de vínculo (proprietario, inquilino, dependente)';
COMMENT ON COLUMN public.usuario_condominios.is_responsavel_financeiro IS 'Indica se o usuário é responsável financeiro da unidade';
