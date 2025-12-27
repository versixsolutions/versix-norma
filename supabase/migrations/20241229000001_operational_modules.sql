-- ============================================
-- VERSIX NORMA - MÓDULOS OPERACIONAIS
-- Sprint 3: Comunicados, Ocorrências, Chamados, FAQ
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Enums already created in previous migrations

-- ============================================
-- TABELA: comunicados
-- ============================================
DROP TABLE IF EXISTS public.comunicados CASCADE;
CREATE TABLE public.comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE SET NULL,
  titulo VARCHAR(200) NOT NULL,
  conteudo TEXT NOT NULL,
  resumo VARCHAR(500),
  categoria public.comunicado_categoria NOT NULL DEFAULT 'geral',
  status public.comunicado_status NOT NULL DEFAULT 'rascunho',
  fixado BOOLEAN NOT NULL DEFAULT false,
  destaque BOOLEAN NOT NULL DEFAULT false,
  publicar_em TIMESTAMPTZ,
  expirar_em TIMESTAMPTZ,
  anexos JSONB DEFAULT '[]'::JSONB,
  visualizacoes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT check_titulo_length CHECK (char_length(titulo) >= 5),
  CONSTRAINT check_conteudo_length CHECK (char_length(conteudo) >= 10)
);

CREATE INDEX idx_comunicados_condominio ON public.comunicados(condominio_id);
CREATE INDEX idx_comunicados_autor ON public.comunicados(autor_id);
CREATE INDEX idx_comunicados_status ON public.comunicados(status);
CREATE INDEX idx_comunicados_categoria ON public.comunicados(categoria);
CREATE INDEX idx_comunicados_fixado ON public.comunicados(fixado) WHERE fixado = true;
CREATE INDEX idx_comunicados_publicar_em ON public.comunicados(publicar_em) WHERE status = 'rascunho' AND publicar_em IS NOT NULL;
CREATE INDEX idx_comunicados_active ON public.comunicados(condominio_id, status) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.comunicados IS 'Comunicados e avisos do condomínio';

-- ============================================
-- TABELA: comunicados_leitura
-- ============================================
DROP TABLE IF EXISTS public.comunicados_leitura CASCADE;
CREATE TABLE public.comunicados_leitura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunicado_id UUID NOT NULL REFERENCES public.comunicados(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  lido_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comunicado_id, usuario_id)
);

CREATE INDEX idx_leitura_comunicado ON public.comunicados_leitura(comunicado_id);
CREATE INDEX idx_leitura_usuario ON public.comunicados_leitura(usuario_id);

-- ============================================
-- TABELA: ocorrencias
-- ============================================
DROP TABLE IF EXISTS public.ocorrencias CASCADE;
CREATE TABLE public.ocorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  reportado_por UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE SET NULL,
  anonimo BOOLEAN NOT NULL DEFAULT false,
  unidade_relacionada_id UUID REFERENCES public.unidades_habitacionais(id) ON DELETE SET NULL,
  local_descricao VARCHAR(200),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  categoria public.ocorrencia_categoria NOT NULL DEFAULT 'outros',
  prioridade public.prioridade NOT NULL DEFAULT 'media',
  status public.ocorrencia_status NOT NULL DEFAULT 'aberta',
  responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  resolucao TEXT,
  resolvido_em TIMESTAMPTZ,
  resolvido_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  anexos JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT check_titulo_length CHECK (char_length(titulo) >= 5),
  CONSTRAINT check_descricao_length CHECK (char_length(descricao) >= 20)
);

CREATE INDEX idx_ocorrencias_condominio ON public.ocorrencias(condominio_id);
CREATE INDEX idx_ocorrencias_reportado ON public.ocorrencias(reportado_por);
CREATE INDEX idx_ocorrencias_status ON public.ocorrencias(status);
CREATE INDEX idx_ocorrencias_categoria ON public.ocorrencias(categoria);
CREATE INDEX idx_ocorrencias_prioridade ON public.ocorrencias(prioridade);
CREATE INDEX idx_ocorrencias_responsavel ON public.ocorrencias(responsavel_id) WHERE responsavel_id IS NOT NULL;
CREATE INDEX idx_ocorrencias_active ON public.ocorrencias(condominio_id, status) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.ocorrencias IS 'Registro de ocorrências e problemas no condomínio';

-- ============================================
-- TABELA: ocorrencias_historico
-- ============================================
DROP TABLE IF EXISTS public.ocorrencias_historico CASCADE;
CREATE TABLE public.ocorrencias_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ocorrencia_id UUID NOT NULL REFERENCES public.ocorrencias(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  status_anterior public.ocorrencia_status,
  status_novo public.ocorrencia_status NOT NULL,
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ocorrencias_hist_ocorrencia ON public.ocorrencias_historico(ocorrencia_id);
CREATE INDEX idx_ocorrencias_hist_created ON public.ocorrencias_historico(created_at DESC);

-- ============================================
-- TABELA: chamados
-- ============================================
DROP TABLE IF EXISTS public.chamados CASCADE;
CREATE TABLE public.chamados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  solicitante_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE SET NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  categoria public.chamado_categoria NOT NULL DEFAULT 'duvida',
  prioridade public.prioridade NOT NULL DEFAULT 'media',
  status public.chamado_status NOT NULL DEFAULT 'novo',
  atendente_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  resposta_final TEXT,
  resolvido_em TIMESTAMPTZ,
  avaliacao_nota INTEGER CHECK (avaliacao_nota BETWEEN 1 AND 5),
  avaliacao_comentario TEXT,
  avaliado_em TIMESTAMPTZ,
  anexos JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT check_titulo_length CHECK (char_length(titulo) >= 5),
  CONSTRAINT check_descricao_length CHECK (char_length(descricao) >= 10)
);

CREATE INDEX idx_chamados_condominio ON public.chamados(condominio_id);
CREATE INDEX idx_chamados_solicitante ON public.chamados(solicitante_id);
CREATE INDEX idx_chamados_status ON public.chamados(status);
CREATE INDEX idx_chamados_categoria ON public.chamados(categoria);
CREATE INDEX idx_chamados_atendente ON public.chamados(atendente_id) WHERE atendente_id IS NOT NULL;
CREATE INDEX idx_chamados_active ON public.chamados(condominio_id, status) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.chamados IS 'Chamados/tickets de moradores para o síndico';

-- ============================================
-- TABELA: chamados_mensagens
-- ============================================
DROP TABLE IF EXISTS public.chamados_mensagens CASCADE;
CREATE TABLE public.chamados_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chamado_id UUID NOT NULL REFERENCES public.chamados(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE SET NULL,
  mensagem TEXT NOT NULL,
  anexos JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  editado_em TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_chamados_msg_chamado ON public.chamados_mensagens(chamado_id);
CREATE INDEX idx_chamados_msg_autor ON public.chamados_mensagens(autor_id);
CREATE INDEX idx_chamados_msg_created ON public.chamados_mensagens(created_at DESC);

-- ============================================
-- TABELA: faq
-- ============================================
DROP TABLE IF EXISTS public.faq CASCADE;
CREATE TABLE public.faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  pergunta VARCHAR(500) NOT NULL,
  resposta TEXT NOT NULL,
  categoria VARCHAR(100),
  tags VARCHAR(50)[] DEFAULT '{}',
  ordem INTEGER NOT NULL DEFAULT 0,
  destaque BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  visualizacoes INTEGER NOT NULL DEFAULT 0,
  util_sim INTEGER NOT NULL DEFAULT 0,
  util_nao INTEGER NOT NULL DEFAULT 0,
  criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT check_pergunta_length CHECK (char_length(pergunta) >= 10),
  CONSTRAINT check_resposta_length CHECK (char_length(resposta) >= 20)
);

CREATE INDEX idx_faq_condominio ON public.faq(condominio_id);
CREATE INDEX idx_faq_categoria ON public.faq(categoria);
CREATE INDEX idx_faq_tags ON public.faq USING GIN(tags);
CREATE INDEX idx_faq_ordem ON public.faq(condominio_id, ordem);
CREATE INDEX idx_faq_active ON public.faq(condominio_id) WHERE ativo = true AND deleted_at IS NULL;

COMMENT ON TABLE public.faq IS 'Perguntas frequentes por condomínio';

-- ============================================
-- FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS public.increment_comunicado_views(UUID);
CREATE OR REPLACE FUNCTION public.increment_comunicado_views(p_comunicado_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.comunicados SET visualizacoes = visualizacoes + 1 WHERE id = p_comunicado_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.mark_comunicado_read(UUID, UUID);
CREATE OR REPLACE FUNCTION public.mark_comunicado_read(p_comunicado_id UUID, p_usuario_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.comunicados_leitura (comunicado_id, usuario_id)
  VALUES (p_comunicado_id, p_usuario_id)
  ON CONFLICT (comunicado_id, usuario_id) DO NOTHING;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.log_ocorrencia_status_change();
CREATE OR REPLACE FUNCTION public.log_ocorrencia_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ocorrencias_historico (ocorrencia_id, usuario_id, status_anterior, status_novo)
    VALUES (NEW.id, (current_setting('app.current_user_id', true))::UUID, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_ocorrencia_status
  AFTER UPDATE ON public.ocorrencias
  FOR EACH ROW EXECUTE FUNCTION public.log_ocorrencia_status_change();

DROP FUNCTION IF EXISTS public.publish_scheduled_comunicados();
CREATE OR REPLACE FUNCTION public.publish_scheduled_comunicados()
RETURNS INTEGER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.comunicados SET status = 'publicado', published_at = NOW(), updated_at = NOW()
  WHERE status = 'rascunho' AND publicar_em IS NOT NULL AND publicar_em <= NOW() AND deleted_at IS NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.archive_expired_comunicados();
CREATE OR REPLACE FUNCTION public.archive_expired_comunicados()
RETURNS INTEGER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.comunicados SET status = 'arquivado', updated_at = NOW()
  WHERE status = 'publicado' AND expirar_em IS NOT NULL AND expirar_em <= NOW() AND deleted_at IS NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.vote_faq_useful(UUID, BOOLEAN);
CREATE OR REPLACE FUNCTION public.vote_faq_useful(p_faq_id UUID, p_useful BOOLEAN)
RETURNS VOID AS $$
BEGIN
  IF p_useful THEN UPDATE public.faq SET util_sim = util_sim + 1 WHERE id = p_faq_id;
  ELSE UPDATE public.faq SET util_nao = util_nao + 1 WHERE id = p_faq_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de updated_at
CREATE TRIGGER tr_comunicados_updated BEFORE UPDATE ON public.comunicados FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_ocorrencias_updated BEFORE UPDATE ON public.ocorrencias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_chamados_updated BEFORE UPDATE ON public.chamados FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_faq_updated BEFORE UPDATE ON public.faq FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
