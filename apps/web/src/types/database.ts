// ============================================
// DATABASE TYPES - Versix Norma
// Baseado nos schemas dos Sprints 0-8
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums
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

// ============================================
// DATABASE SCHEMA
// ============================================
export interface Database {
  public: {
    Tables: {
      // Core
      organizacoes: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          documento: string | null;
          tier: TierType;
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizacoes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizacoes']['Insert']>;
      };
      
      condominios: {
        Row: {
          id: string;
          organizacao_id: string;
          nome: string;
          slug: string;
          endereco: Json;
          config: Json;
          status: StatusType;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['condominios']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['condominios']['Insert']>;
      };
      
      blocos: {
        Row: {
          id: string;
          condominio_id: string;
          nome: string;
          descricao: string | null;
          ordem: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blocos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['blocos']['Insert']>;
      };
      
      unidades: {
        Row: {
          id: string;
          bloco_id: string;
          identificador: string;
          tipo: TipoUnidade;
          area_privativa: number | null;
          fracao_ideal: number | null;
          status: StatusType;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['unidades']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['unidades']['Insert']>;
      };
      
      usuarios: {
        Row: {
          id: string;
          auth_id: string;
          nome: string;
          email: string;
          telefone: string | null;
          documento: string | null;
          avatar_url: string | null;
          config: Json;
          status: StatusType;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>;
      };
      
      usuario_condominios: {
        Row: {
          id: string;
          usuario_id: string;
          condominio_id: string;
          unidade_id: string | null;
          role: RoleType;
          tipo_vinculo: TipoVinculo;
          is_responsavel_financeiro: boolean;
          data_inicio: string;
          data_fim: string | null;
          status: StatusType;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usuario_condominios']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['usuario_condominios']['Insert']>;
      };
      
      // Financeiro
      contas_bancarias: {
        Row: {
          id: string;
          condominio_id: string;
          nome: string;
          banco: string;
          agencia: string;
          conta: string;
          tipo: string;
          saldo_atual: number;
          is_principal: boolean;
          status: StatusType;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contas_bancarias']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['contas_bancarias']['Insert']>;
      };
      
      lancamentos: {
        Row: {
          id: string;
          condominio_id: string;
          conta_id: string;
          categoria_id: string | null;
          tipo: TipoLancamento;
          descricao: string;
          valor: number;
          data_competencia: string;
          data_vencimento: string;
          data_pagamento: string | null;
          status: StatusLancamento;
          unidade_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lancamentos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lancamentos']['Insert']>;
      };
      
      // Assembleias
      assembleias: {
        Row: {
          id: string;
          condominio_id: string;
          titulo: string;
          descricao: string | null;
          tipo: TipoAssembleia;
          data_primeira: string;
          data_segunda: string | null;
          local: string;
          is_hibrida: boolean;
          link_virtual: string | null;
          quorum_minimo: number;
          status: StatusAssembleia;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assembleias']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assembleias']['Insert']>;
      };
      
      pautas: {
        Row: {
          id: string;
          assembleia_id: string;
          titulo: string;
          descricao: string | null;
          ordem: number;
          requires_quorum: boolean;
          quorum_especial: number | null;
          resultado: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pautas']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['pautas']['Insert']>;
      };
      
      votos: {
        Row: {
          id: string;
          pauta_id: string;
          unidade_id: string;
          usuario_id: string;
          voto: TipoVoto;
          peso: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['votos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['votos']['Insert']>;
      };
      
      // Comunicação
      comunicados: {
        Row: {
          id: string;
          condominio_id: string;
          titulo: string;
          conteudo: string;
          tipo: string;
          prioridade: string;
          data_publicacao: string;
          data_expiracao: string | null;
          is_fixado: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comunicados']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['comunicados']['Insert']>;
      };
      
      chamados: {
        Row: {
          id: string;
          condominio_id: string;
          unidade_id: string | null;
          usuario_id: string;
          categoria: string;
          titulo: string;
          descricao: string;
          prioridade: PrioridadeChamado;
          status: StatusChamado;
          responsavel_id: string | null;
          data_resolucao: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chamados']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['chamados']['Insert']>;
      };
      
      // IA Norma
      documentos_norma: {
        Row: {
          id: string;
          condominio_id: string;
          titulo: string;
          tipo: string;
          conteudo: string;
          embedding: number[] | null;
          versao: number;
          is_ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documentos_norma']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['documentos_norma']['Insert']>;
      };
      
      conversas_norma: {
        Row: {
          id: string;
          usuario_id: string;
          condominio_id: string;
          mensagens: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['conversas_norma']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['conversas_norma']['Insert']>;
      };
    };
    
    Views: {
      vw_dashboard_financeiro: {
        Row: {
          condominio_id: string;
          saldo_total: number;
          receitas_mes: number;
          despesas_mes: number;
          inadimplencia_percent: number;
          fundo_reserva: number;
        };
      };
      
      vw_unidades_completas: {
        Row: {
          unidade_id: string;
          identificador: string;
          bloco_nome: string;
          condominio_nome: string;
          proprietario_nome: string | null;
          status: StatusType;
        };
      };
    };
    
    Functions: {
      get_user_condominios: {
        Args: { p_user_id: string };
        Returns: {
          condominio_id: string;
          nome: string;
          role: RoleType;
          unidade_id: string | null;
        }[];
      };
      
      registrar_voto: {
        Args: {
          p_pauta_id: string;
          p_unidade_id: string;
          p_usuario_id: string;
          p_voto: TipoVoto;
        };
        Returns: { success: boolean; message: string };
      };
      
      calcular_rateio: {
        Args: {
          p_condominio_id: string;
          p_valor_total: number;
          p_mes_referencia: string;
        };
        Returns: {
          unidade_id: string;
          valor: number;
          fracao: number;
        }[];
      };
    };
  };
}

// ============================================
// HELPER TYPES
// ============================================
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row'];

// Aliases comuns
export type Usuario = Tables<'usuarios'>;
export type Condominio = Tables<'condominios'>;
export type Unidade = Tables<'unidades'>;
export type Lancamento = Tables<'lancamentos'>;
export type Assembleia = Tables<'assembleias'>;
export type Comunicado = Tables<'comunicados'>;
export type Chamado = Tables<'chamados'>;
