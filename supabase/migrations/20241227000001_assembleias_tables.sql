-- ============================================
-- VERSIX NORMA - MÓDULO ASSEMBLEIAS DIGITAIS
-- Sprint 6: Democracia Digital
-- ============================================

-- ============================================
-- ENUMS
-- ============================================
DO $$ BEGIN
    CREATE TYPE public.assembleia_tipo AS ENUM ('AGO', 'AGE', 'permanente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.assembleia_status AS ENUM ('rascunho', 'convocada', 'em_andamento', 'votacao', 'encerrada', 'arquivada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.pauta_tipo_votacao AS ENUM ('aprovacao', 'escolha_unica', 'escolha_multipla', 'eleicao', 'informativo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.pauta_status AS ENUM ('pendente', 'em_votacao', 'encerrada', 'aprovada', 'rejeitada', 'sem_quorum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.quorum_especial AS ENUM ('maioria_simples', 'maioria_absoluta', '2/3_fracoes', 'unanimidade');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.presenca_tipo AS ENUM ('presencial', 'online', 'procuracao', 'voto_antecipado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.assinatura_tipo AS ENUM ('presidente', 'secretario', 'sindico', 'testemunha');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.comentario_tipo AS ENUM ('comentario', 'pergunta', 'resposta', 'moderacao');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABELA: assembleias
-- ============================================
CREATE TABLE IF NOT EXISTS public.assembleias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  tipo public.assembleia_tipo NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  numero_sequencial INTEGER,
  data_primeira_convocacao TIMESTAMPTZ,
  data_segunda_convocacao TIMESTAMPTZ,
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  permite_voto_antecipado BOOLEAN DEFAULT false,
  data_limite_voto_antecipado TIMESTAMPTZ,
  permite_procuracao BOOLEAN DEFAULT true,
  max_procuracoes_por_pessoa INTEGER DEFAULT 2,
  quorum_minimo_primeira DECIMAL(5,2) DEFAULT 50,
  quorum_minimo_segunda DECIMAL(5,2) DEFAULT 0,
  quorum_atingido DECIMAL(5,2) DEFAULT 0,
  local_presencial VARCHAR(255),
  link_video VARCHAR(500),
  status public.assembleia_status NOT NULL DEFAULT 'rascunho',
  ata_texto TEXT,
  ata_pdf_path VARCHAR(500),
  ata_hash VARCHAR(64),
  criado_por UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  encerrada_em TIMESTAMPTZ,
  arquivada_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_assembleias_condominio ON public.assembleias(condominio_id);
CREATE INDEX IF NOT EXISTS idx_assembleias_status ON public.assembleias(status);
CREATE INDEX IF NOT EXISTS idx_assembleias_data ON public.assembleias(data_primeira_convocacao);

COMMENT ON TABLE public.assembleias IS 'Assembleias do condomínio (AGO, AGE, permanente)';

-- ============================================
-- TABELA: assembleia_pautas
-- ============================================
CREATE TABLE IF NOT EXISTS public.assembleia_pautas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assembleia_id UUID NOT NULL REFERENCES public.assembleias(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo_votacao public.pauta_tipo_votacao NOT NULL DEFAULT 'aprovacao',
  voto_secreto BOOLEAN DEFAULT false,
  quorum_especial public.quorum_especial DEFAULT 'maioria_simples',
  permite_abstencao BOOLEAN DEFAULT true,
  cargo VARCHAR(100),
  max_eleitos INTEGER DEFAULT 1,
  bloqueia_inadimplentes BOOLEAN DEFAULT true,
  status public.pauta_status NOT NULL DEFAULT 'pendente',
  resultado JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pautas_assembleia ON public.assembleia_pautas(assembleia_id, ordem);

COMMENT ON TABLE public.assembleia_pautas IS 'Itens da pauta com configuração de votação';

-- ============================================
-- TABELA: assembleia_pauta_opcoes
-- ============================================
CREATE TABLE IF NOT EXISTS public.assembleia_pauta_opcoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pauta_id UUID NOT NULL REFERENCES public.assembleia_pautas(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  candidato_id UUID REFERENCES public.usuarios(id),
  votos_count INTEGER DEFAULT 0,
  votos_fracao DECIMAL(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opcoes_pauta ON public.assembleia_pauta_opcoes(pauta_id, ordem);

-- ============================================
-- TABELA: assembleia_presencas
-- ============================================
CREATE TABLE IF NOT EXISTS public.assembleia_presencas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assembleia_id UUID NOT NULL REFERENCES public.assembleias(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id),
  unidade_id UUID NOT NULL REFERENCES public.unidades_habitacionais(id),
  tipo public.presenca_tipo NOT NULL DEFAULT 'online',
  representante_id UUID REFERENCES public.usuarios(id),
  procuracao_path VARCHAR(500),
  fracao_ideal DECIMAL(10,6) NOT NULL,
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  UNIQUE(assembleia_id, unidade_id)
);

CREATE INDEX IF NOT EXISTS idx_presencas_assembleia ON public.assembleia_presencas(assembleia_id);
CREATE INDEX IF NOT EXISTS idx_presencas_usuario ON public.assembleia_presencas(usuario_id);

COMMENT ON TABLE public.assembleia_presencas IS 'Registro de presença (presencial, online, procuração)';

-- ============================================
-- TABELA: assembleia_votos
-- ============================================
CREATE TABLE IF NOT EXISTS public.assembleia_votos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pauta_id UUID NOT NULL REFERENCES public.assembleia_pautas(id) ON DELETE CASCADE,
  presenca_id UUID NOT NULL REFERENCES public.assembleia_presencas(id),
  opcao_id UUID REFERENCES public.assembleia_pauta_opcoes(id),
  voto VARCHAR(20) CHECK (voto IN ('sim', 'nao', 'abstencao', 'opcao')),
  fracao_ideal DECIMAL(10,6) NOT NULL,
  usuario_id UUID REFERENCES public.usuarios(id),
  unidade_id UUID REFERENCES public.unidades_habitacionais(id),
  voto_hash VARCHAR(64),
  votado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  UNIQUE(pauta_id, presenca_id)
);

CREATE INDEX IF NOT EXISTS idx_votos_pauta ON public.assembleia_votos(pauta_id);
CREATE INDEX IF NOT EXISTS idx_votos_presenca ON public.assembleia_votos(presenca_id);

COMMENT ON TABLE public.assembleia_votos IS 'Registro de votos (auditável)';

-- ============================================
-- TABELA: assembleia_comentarios
-- ============================================
CREATE TABLE IF NOT EXISTS public.assembleia_comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pauta_id UUID NOT NULL REFERENCES public.assembleia_pautas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id),
  conteudo TEXT NOT NULL,
  tipo public.comentario_tipo NOT NULL DEFAULT 'comentario',
  parent_id UUID REFERENCES public.assembleia_comentarios(id),
  visivel BOOLEAN DEFAULT true,
  moderado_por UUID REFERENCES public.usuarios(id),
  moderado_em TIMESTAMPTZ,
  motivo_moderacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comentarios_pauta ON public.assembleia_comentarios(pauta_id);

-- ============================================
-- TABELA: assembleia_assinaturas
-- ============================================
CREATE TABLE IF NOT EXISTS public.assembleia_assinaturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assembleia_id UUID NOT NULL REFERENCES public.assembleias(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id),
  tipo public.assinatura_tipo NOT NULL,
  assinatura_hash VARCHAR(64) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  assinado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assembleia_id, usuario_id, tipo)
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_assembleia ON public.assembleia_assinaturas(assembleia_id);

-- ============================================
-- TABELA: assembleia_logs
-- ============================================
CREATE TABLE IF NOT EXISTS public.assembleia_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assembleia_id UUID NOT NULL REFERENCES public.assembleias(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES public.usuarios(id),
  acao VARCHAR(50) NOT NULL,
  detalhes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_assembleia ON public.assembleia_logs(assembleia_id, created_at);

COMMENT ON TABLE public.assembleia_logs IS 'Log de auditoria de todas as ações';

-- ============================================
-- Triggers de updated_at
-- ============================================
CREATE TRIGGER tr_assembleias_updated BEFORE UPDATE ON public.assembleias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
