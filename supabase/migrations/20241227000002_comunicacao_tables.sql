-- ============================================
-- VERSIX NORMA - MÓDULO COMUNICAÇÃO MULTICANAL
-- Sprint 7: Push, Email, WhatsApp, SMS, Voz
-- ============================================

-- ============================================
-- ENUMS
-- ============================================
DO $$ BEGIN
    CREATE TYPE public.canal_notificacao AS ENUM ('push', 'email', 'whatsapp', 'sms', 'voz', 'mural');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.prioridade_comunicado AS ENUM ('baixa', 'normal', 'alta', 'critica');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.status_entrega AS ENUM ('pendente', 'enviado', 'entregue', 'lido', 'falhou');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABELA: notificacoes_config
-- ============================================
CREATE TABLE IF NOT EXISTS public.notificacoes_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  push_habilitado BOOLEAN DEFAULT true,
  email_habilitado BOOLEAN DEFAULT true,
  whatsapp_habilitado BOOLEAN DEFAULT false,
  sms_habilitado BOOLEAN DEFAULT false,
  voz_habilitado BOOLEAN DEFAULT false,
  tempo_espera_push_para_email INTEGER DEFAULT 60,
  tempo_espera_email_para_whatsapp INTEGER DEFAULT 1440,
  tempo_espera_whatsapp_para_sms INTEGER DEFAULT 2880,
  horario_inicio TIME DEFAULT '07:00',
  horario_fim TIME DEFAULT '22:00',
  emergencia_ignora_horario BOOLEAN DEFAULT true,
  whatsapp_phone_id VARCHAR(50),
  whatsapp_business_id VARCHAR(50),
  creditos_sms INTEGER DEFAULT 0,
  creditos_voz INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(condominio_id)
);

COMMENT ON TABLE public.notificacoes_config IS 'Configuração global de notificações por condomínio';

-- ============================================
-- TABELA: usuarios_canais_preferencias
-- ============================================
CREATE TABLE IF NOT EXISTS public.usuarios_canais_preferencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  push_habilitado BOOLEAN DEFAULT true,
  email_habilitado BOOLEAN DEFAULT true,
  whatsapp_habilitado BOOLEAN DEFAULT true,
  sms_habilitado BOOLEAN DEFAULT true,
  voz_emergencia_habilitado BOOLEAN DEFAULT true,
  receber_digest BOOLEAN DEFAULT false,
  digest_frequencia VARCHAR(20) DEFAULT 'diario',
  digest_horario TIME DEFAULT '08:00',
  fcm_tokens JSONB DEFAULT '[]'::JSONB,
  email_alternativo VARCHAR(255),
  telefone_alternativo VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id)
);

COMMENT ON TABLE public.usuarios_canais_preferencias IS 'Preferências de canal por usuário';

-- ============================================
-- TABELA: notificacoes
-- ============================================
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  referencia_tipo VARCHAR(50),
  referencia_id UUID,
  titulo VARCHAR(255) NOT NULL,
  corpo TEXT NOT NULL,
  corpo_resumo VARCHAR(500),
  prioridade public.prioridade_comunicado NOT NULL DEFAULT 'normal',
  destinatarios_tipo VARCHAR(50) DEFAULT 'todos',
  destinatarios_filtro JSONB,
  agendada_para TIMESTAMPTZ,
  enviada_em TIMESTAMPTZ,
  gerar_mural BOOLEAN DEFAULT false,
  mural_path VARCHAR(500),
  criado_por UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_condominio ON public.notificacoes(condominio_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_referencia ON public.notificacoes(referencia_tipo, referencia_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_agendamento ON public.notificacoes(agendada_para) WHERE agendada_para IS NOT NULL;

COMMENT ON TABLE public.notificacoes IS 'Cada notificação enviada';

-- ============================================
-- TABELA: notificacoes_entregas
-- ============================================
CREATE TABLE IF NOT EXISTS public.notificacoes_entregas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notificacao_id UUID NOT NULL REFERENCES public.notificacoes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  canal public.canal_notificacao NOT NULL,
  status public.status_entrega NOT NULL DEFAULT 'pendente',
  enviado_em TIMESTAMPTZ,
  entregue_em TIMESTAMPTZ,
  lido_em TIMESTAMPTZ,
  provider_message_id VARCHAR(255),
  provider_response JSONB,
  erro_mensagem TEXT,
  tentativas INTEGER DEFAULT 0,
  proxima_tentativa TIMESTAMPTZ,
  ip_leitura INET,
  user_agent_leitura TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(notificacao_id, usuario_id, canal)
);

CREATE INDEX IF NOT EXISTS idx_entregas_notificacao ON public.notificacoes_entregas(notificacao_id);
CREATE INDEX IF NOT EXISTS idx_entregas_usuario ON public.notificacoes_entregas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_entregas_status ON public.notificacoes_entregas(status);
CREATE INDEX IF NOT EXISTS idx_entregas_pendentes ON public.notificacoes_entregas(proxima_tentativa) WHERE status IN ('pendente', 'enviado');

COMMENT ON TABLE public.notificacoes_entregas IS 'Rastreamento de entrega por usuário/canal';

-- ============================================
-- TABELA: notificacoes_cascade
-- ============================================
CREATE TABLE IF NOT EXISTS public.notificacoes_cascade (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entrega_id UUID NOT NULL REFERENCES public.notificacoes_entregas(id) ON DELETE CASCADE,
  proximo_canal public.canal_notificacao NOT NULL,
  disparar_em TIMESTAMPTZ NOT NULL,
  disparado BOOLEAN DEFAULT false,
  cancelado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cascade_disparo ON public.notificacoes_cascade(disparar_em) WHERE disparado = false AND cancelado = false;

COMMENT ON TABLE public.notificacoes_cascade IS 'Fila de cascata (próximo canal se não leu)';

-- ============================================
-- TABELA: murais_gerados
-- ============================================
CREATE TABLE IF NOT EXISTS public.murais_gerados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  notificacao_id UUID REFERENCES public.notificacoes(id) ON DELETE SET NULL,
  titulo VARCHAR(255) NOT NULL,
  comunicados_ids UUID[] NOT NULL,
  pdf_path VARCHAR(500) NOT NULL,
  qr_code_url VARCHAR(500),
  valido_de DATE NOT NULL,
  valido_ate DATE NOT NULL,
  impresso BOOLEAN DEFAULT false,
  impresso_em TIMESTAMPTZ,
  impresso_por UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.murais_gerados IS 'PDFs gerados para impressão física';

-- ============================================
-- TABELA: emergencias_log
-- ============================================
CREATE TABLE IF NOT EXISTS public.emergencias_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  disparado_por UUID REFERENCES public.usuarios(id),
  disparado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_destinatarios INTEGER,
  total_ligacoes INTEGER,
  total_atendidas INTEGER,
  total_sms INTEGER,
  total_push INTEGER,
  disparo_inicio TIMESTAMPTZ,
  disparo_fim TIMESTAMPTZ,
  detalhes JSONB
);

CREATE INDEX IF NOT EXISTS idx_emergencias_condominio ON public.emergencias_log(condominio_id);
CREATE INDEX IF NOT EXISTS idx_emergencias_data ON public.emergencias_log(created_at);

COMMENT ON TABLE public.emergencias_log IS 'Log específico de emergências (auditoria crítica)';

-- ============================================
-- TABELA: contatos_invalidos
-- ============================================
CREATE TABLE IF NOT EXISTS public.contatos_invalidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL,
  valor VARCHAR(255) NOT NULL,
  motivo VARCHAR(100) NOT NULL,
  detectado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_notificado BOOLEAN DEFAULT false,
  notificado_em TIMESTAMPTZ,
  corrigido BOOLEAN DEFAULT false,
  corrigido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contatos_invalidos_usuario ON public.contatos_invalidos(usuario_id);

-- ============================================
-- Triggers de updated_at
-- ============================================
CREATE TRIGGER tr_notificacoes_config_updated BEFORE UPDATE ON public.notificacoes_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_usuarios_canais_pref_updated BEFORE UPDATE ON public.usuarios_canais_preferencias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
