// ============================================
// DATABASE TYPES - Versix Norma
// Gerado automaticamente via supabase gen types
// ============================================

// Temporário: definir Database como any até resolver import
export type Database = any;

// Enums customizados (não gerados automaticamente)
export type TierType = 'starter' | 'professional' | 'enterprise';
export type RoleType = 'superadmin' | 'admin_master' | 'sindico' | 'subsindico' | 'conselheiro' | 'morador' | 'porteiro' | 'zelador';
export type StatusType = 'ativo' | 'inativo' | 'pendente' | 'suspenso' | 'bloqueado';
export type TipoUnidade = 'apartamento' | 'casa' | 'sala_comercial' | 'loja' | 'garagem' | 'deposito';
export type TipoVinculo = 'proprietario' | 'inquilino' | 'morador' | 'dependente' | 'funcionario';
export type TipoLancamento = 'receita' | 'despesa' | 'transferencia';
export type StatusLancamento = 'pendente' | 'pago' | 'atrasado' | 'cancelado' | 'estornado';
export type TipoAssembleia = 'ordinaria' | 'extraordinaria';
export type StatusAssembleia = 'agendada' | 'convocada' | 'em_andamento' | 'encerrada' | 'cancelada';
export type TipoVoto = 'sim' | 'nao' | 'abstencao' | 'nulo';
export type StatusChamado = 'aberto' | 'em_andamento' | 'aguardando' | 'resolvido' | 'cancelado';
export type PrioridadeChamado = 'baixa' | 'media' | 'alta' | 'urgente';

// Tipos financeiros
export interface Lancamento {
  id: string;
  condominio_id: string;
  usuario_id: string;
  categoria_id: string;
  conta_id: string;
  unidade_id?: string;
  tipo: TipoLancamento;
  status: StatusLancamento;
  valor: number;
  descricao: string;
  data_vencimento: string;
  data_pagamento?: string;
  numero_documento?: string;
  observacoes?: string;
  anexos?: any[];
  created_at: string;
  updated_at: string;
}
