// ============================================
// VERSIX NORMA - TIPOS MÓDULO COMUNICAÇÃO
// Sprint 7: Comunicação Multicanal
// ============================================
// PADRÃO: Todos os tipos base vêm de database.types.ts
// Extensões adicionadas apenas para campos computados/joins
// ============================================

import type { Database } from '../../database.types';

type Tables = Database['public']['Tables'];

// ============================================
// TIPOS BASE DO BANCO (Sem duplicação)
// ============================================

// ENUMs - Valores que vêm do banco
export type CanalNotificacao = 'push' | 'email' | 'whatsapp' | 'sms' | 'voz' | 'mural';
export type PrioridadeComunicado = 'baixa' | 'normal' | 'alta' | 'critica';
export type StatusEntrega = 'pendente' | 'enviado' | 'entregue' | 'lido' | 'falhou';
export type DigestFrequencia = string; // VARCHAR no banco, sem ENUM
export type TipoEmergencia = string; // VARCHAR no banco, sem ENUM

// Aliases para tipos base
export type NotificacoesConfigRow = Tables['notificacoes_config']['Row'];
export type UsuarioCanaisPreferenciasRow = Tables['usuarios_canais_preferencias']['Row'];
export type NotificacaoRow = Tables['notificacoes']['Row'];
export type NotificacaoEntregaRow = Tables['notificacoes_entregas']['Row'];
// export type NotificacaoDashboardRow = Tables['notificacoes_dashboard']['Row']; // Tabela não existe no banco
// export type MuralGeradoRow = Tables['mural_gerado']['Row']; // Tabela não existe no banco
export type EmergenciaLogRow = Tables['emergencias_log']['Row'];
// export type ContatoInvalidoRow = Tables['contatos_invalidos']['Row']; // Tabela não existe no banco
// export type NotificacaoUsuarioRow = Tables['notificacoes_usuarios']['Row']; // Tabela não existe no banco

// ============================================
// CONFIG - Tipo estendido com computados
// ============================================
export interface NotificacoesConfig extends NotificacoesConfigRow {
  // Campos computados/auxiliares podem ser adicionados aqui se necessário
}

export interface UpdateNotificacoesConfigInput extends Partial<NotificacoesConfigRow> {
  // Type seguro para Updates
}

// ============================================
// PREFERÊNCIAS DO USUÁRIO
// ============================================
export interface UsuarioCanaisPreferencias extends UsuarioCanaisPreferenciasRow {
  // Tipo base vem do banco, extensões aqui se necessário
}

export interface UpdatePreferenciasInput extends Partial<UsuarioCanaisPreferenciasRow> {
  // Type seguro para Updates
}

// ============================================
// NOTIFICAÇÃO
// ============================================
export interface Notificacao extends NotificacaoRow {
  // Joins adicionados como campos opcionais
  entregas?: NotificacaoEntregaRow[];
  dashboard?: NotificacaoDashboard; // Tipo computed/calculado
}

export type CreateNotificacaoInput = Tables['notificacoes']['Insert'];

// ============================================
// ENTREGA
// ============================================
export interface NotificacaoEntrega extends NotificacaoEntregaRow {
  // Joins adicionados como campos opcionais
  notificacao?: NotificacaoRow;
}

// ============================================
// DASHBOARD (Tipo Computed - não existe tabela)
// ============================================
export interface NotificacaoDashboard {
  id: string;
  condominio_id: string;
  titulo: string;
  prioridade: string;
  tipo: string;
  created_at: string;
  total_destinatarios: number;
  total_lidos: number;
  total_entregues: number;
  total_falhas: number;
  percentual_leitura: number;
  lidos_push: number;
  lidos_email: number;
  lidos_whatsapp: number;
}

// ============================================
// MURAL (Tipo Computed - não existe tabela)
// ============================================
export interface MuralGerado {
  id: string;
  condominio_id: string;
  notificacao_id: string | null;
  titulo: string;
  comunicados_ids: string[];
  pdf_path: string;
  qr_code_url: string | null;
  valido_de: string;
  valido_ate: string;
  impresso: boolean;
  impresso_em: string | null;
  impresso_por: string | null;
  created_at: string;
}

// ============================================
// EMERGÊNCIA
// ============================================
export interface EmergenciaLog extends EmergenciaLogRow {
  // Tipo estendido com dados do banco
}

export type DispararEmergenciaInput = Tables['emergencias_log']['Insert'];

// ============================================
// CONTATO INVÁLIDO (Tipo Computed - não existe tabela)
// ============================================
export interface ContatoInvalido {
  id: string;
  usuario_id: string;
  tipo: string;
  valor: string;
  motivo: string;
  detectado_em: string;
  usuario_notificado: boolean;
  notificado_em: string | null;
  corrigido: boolean;
  corrigido_em: string | null;
  // Joins adicionados como campos opcionais
  usuario?: { nome: string; unidade?: { identificador: string } };
}

// ============================================
// VIEW DE NOTIFICAÇÕES DO USUÁRIO (Tipo Computed - view não existe)
// ============================================
export interface NotificacaoUsuario {
  entrega_id: string;
  usuario_id: string;
  canal: CanalNotificacao;
  status: StatusEntrega;
  lido_em: string | null;
  notificacao_id: string;
  tipo: string;
  titulo: string;
  corpo: string;
  corpo_resumo: string | null;
  prioridade: PrioridadeComunicado;
  referencia_tipo: string | null;
  referencia_id: string | null;
  created_at: string;
}

// ============================================
// FILTROS
// ============================================
export interface NotificacoesFilters {
  tipo?: string;
  prioridade?: PrioridadeComunicado;
  status?: StatusEntrega;
  data_inicio?: string;
  data_fim?: string;
}
