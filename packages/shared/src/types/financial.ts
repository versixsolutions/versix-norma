// ============================================
// VERSIX NORMA - TIPOS MÓDULO FINANCEIRO
// Sprint 4: Transparência Financeira
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
export type CategoriaTipo = 'receita' | 'despesa';
export type LancamentoTipo = 'receita' | 'despesa' | 'transferencia';
export type LancamentoStatus = 'pendente' | 'confirmado' | 'cancelado';
export type PrestacaoStatus = 'rascunho' | 'em_revisao' | 'aprovado' | 'rejeitado' | 'publicado';
export type TaxaTipo = 'ordinaria' | 'extra' | 'fundo_reserva' | 'multa' | 'juros' | 'outros';
export type CobrancaStatus = 'pendente' | 'pago' | 'atrasado' | 'negociado' | 'cancelado';

// Aliases para tipos base
export type CategoriaFinanceiraRow = Tables['categorias_financeiras']['Row'];
export type LancamentoFinanceiroRow = Tables['lancamentos_financeiros']['Row'];
export type ContaBancariaRow = Tables['contas_bancarias']['Row'];
// export type ConfiguracaoFinanceiraRow = Tables['configuracao_financeira']['Row']; // Tabela não existe no banco
export type PrestacaoConta = Tables['prestacao_contas']['Row'];
// export type CobrancaRow = Tables['cobrancas']['Row']; // Tabela não existe no banco
// export type TaxaRow = Tables['taxas']['Row']; // Tabela não existe no banco (existe taxas_unidades)

// ============================================
// CATEGORIAS FINANCEIRAS
// ============================================
export interface CategoriaFinanceira extends CategoriaFinanceiraRow {
  // Computed
  children?: CategoriaFinanceira[];
  total_orcado?: number;
  total_realizado?: number;
}

export type CreateCategoriaInput = Tables['categorias_financeiras']['Insert'];

export interface UpdateCategoriaInput extends Partial<CategoriaFinanceiraRow> {
  id: string;
  ativo?: boolean;
}

// ============================================
// CONTAS BANCÁRIAS
// ============================================
export interface ContaBancaria extends ContaBancariaRow {
  // Tipo estendido com dados do banco
}

export type CreateContaBancariaInput = Tables['contas_bancarias']['Insert'];

export interface UpdateContaBancariaInput extends Partial<ContaBancariaRow> {
  id: string;
  ativo?: boolean;
}

// ============================================
// LANÇAMENTOS FINANCEIROS
// ============================================
export interface Comprovante {
  url: string;
  nome: string;
  tipo: string;
  tamanho: number;
}

export interface LancamentoFinanceiro extends LancamentoFinanceiroRow {
  // Joins adicionados como campos opcionais
  categoria?: { codigo: string; nome: string };
  categorias?: { nome: string };
  conta_bancaria?: { nome_exibicao: string };
  criador?: { nome: string };
}

export type CreateLancamentoInput = Tables['lancamentos_financeiros']['Insert'];

export interface UpdateLancamentoInput extends Partial<LancamentoFinanceiroRow> {
  id: string;
}

// ============================================
// PRESTAÇÃO DE CONTAS
// ============================================
export interface PrestacaoContas {
  id: string;
  condominio_id: string;
  mes_referencia: string;
  saldo_anterior: number;
  total_receitas: number;
  total_despesas: number;
  saldo_atual: number;
  status: PrestacaoStatus;
  revisado_por: string | null;
  revisado_em: string | null;
  parecer_conselho: string | null;
  publicado_por: string | null;
  publicado_em: string | null;
  observacoes_sindico: string | null;
  criado_por: string;
  created_at: string;
  updated_at: string;
  // Computed
  lancamentos?: LancamentoFinanceiro[];
  lancamentos_por_categoria?: Record<string, { receitas: number; despesas: number }>;
}

export interface CreatePrestacaoInput {
  mes_referencia: string;
  observacoes_sindico?: string;
}

export interface UpdatePrestacaoInput {
  id: string;
  status?: PrestacaoStatus;
  parecer_conselho?: string;
  observacoes_sindico?: string;
}

// ============================================
// TAXAS DE UNIDADES
// ============================================
export interface TaxaUnidade {
  id: string;
  condominio_id: string;
  unidade_id: string;
  mes_referencia: string;
  tipo: TaxaTipo;
  valor_base: number;
  desconto: number;
  acrescimo: number;
  valor_final: number;
  data_vencimento: string;
  data_pagamento: string | null;
  valor_pago: number | null;
  status: CobrancaStatus;
  boleto_id: string | null;
  boleto_url: string | null;
  linha_digitavel: string | null;
  descricao: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  unidade?: { identificador: string; bloco?: { nome: string } };
  morador?: { nome: string; email: string };
}

export interface CreateTaxaInput {
  unidade_id: string;
  mes_referencia: string;
  tipo?: TaxaTipo;
  valor_base: number;
  desconto?: number;
  acrescimo?: number;
  data_vencimento: string;
  descricao?: string;
}

export interface UpdateTaxaInput {
  id: string;
  status?: CobrancaStatus;
  data_pagamento?: string;
  valor_pago?: number;
  desconto?: number;
  acrescimo?: number;
}

// ============================================
// CONFIGURAÇÕES FINANCEIRAS
// ============================================
export interface ConfiguracaoFinanceira {
  id: string;
  condominio_id: string;
  dia_vencimento: number;
  taxa_ordinaria_base: number;
  fundo_reserva_percentual: number;
  multa_atraso_percentual: number;
  juros_dia_percentual: number;
  desconto_antecipacao_percentual: number;
  dias_antecipacao_desconto: number;
  texto_boleto: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateConfiguracaoInput {
  dia_vencimento?: number;
  taxa_ordinaria_base?: number;
  fundo_reserva_percentual?: number;
  multa_atraso_percentual?: number;
  juros_dia_percentual?: number;
  desconto_antecipacao_percentual?: number;
  dias_antecipacao_desconto?: number;
  texto_boleto?: string;
}

// ============================================
// DASHBOARD E ESTATÍSTICAS
// ============================================
export interface SaldoPeriodo {
  saldo_anterior: number;
  total_receitas: number;
  total_despesas: number;
  saldo_atual: number;
}

export interface DashboardFinanceiro {
  saldo_atual: number;
  receitas_mes: number;
  despesas_mes: number;
  inadimplencia: {
    total_unidades: number;
    unidades_inadimplentes: number;
    valor_em_aberto: number;
    percentual: number;
  };
  contas: ContaBancaria[];
  ultimos_lancamentos: LancamentoFinanceiro[];
  despesas_por_categoria: { categoria: string; valor: number; percentual: number }[];
}

export interface RelatorioMensal {
  mes_referencia: string;
  saldo_anterior: number;
  receitas: { categoria: string; valor: number }[];
  despesas: { categoria: string; valor: number }[];
  total_receitas: number;
  total_despesas: number;
  saldo_final: number;
}

// ============================================
// FILTROS
// ============================================
export interface LancamentoFilters {
  page?: number;
  pageSize?: number;
  tipo?: LancamentoTipo;
  categoria_id?: string;
  conta_bancaria_id?: string;
  status?: LancamentoStatus;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
}

export interface TaxaFilters {
  page?: number;
  pageSize?: number;
  unidade_id?: string;
  mes_referencia?: string;
  status?: CobrancaStatus;
  tipo?: TaxaTipo;
}
