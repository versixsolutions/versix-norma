'use client';

import { getSupabaseClient } from '@/lib/supabase';
import type { Lancamento, StatusLancamento, TipoLancamento } from '@/types/database';
import { useCallback, useEffect, useState } from 'react';

// ============================================
// TYPES
// ============================================
interface DashboardFinanceiro {
  saldo_total: number;
  receitas_mes: number;
  despesas_mes: number;
  inadimplencia_percent: number;
  fundo_reserva: number;
}

interface ContaBancaria {
  id: string;
  nome: string;
  banco: string;
  saldo_atual: number;
  is_principal: boolean;
}

interface LancamentoComDetalhes extends Lancamento {
  categoria_nome?: string;
  unidade_identificador?: string;
}

interface UseFinancialOptions {
  condominioId: string | null;
  mesReferencia?: Date;
}

interface UseFinancialReturn {
  // Data
  dashboard: DashboardFinanceiro | null;
  contas: ContaBancaria[];
  lancamentos: LancamentoComDetalhes[];
  inadimplentes: {
    unidade_id: string;
    identificador: string;
    valor_devido: number;
    meses_atraso: number;
  }[];

  // State
  loading: boolean;
  error: Error | null;

  // Methods
  refresh: () => Promise<void>;
  createLancamento: (data: CreateLancamentoInput) => Promise<{ success: boolean; error?: Error }>;
  updateLancamento: (id: string, data: Partial<Lancamento>) => Promise<{ success: boolean; error?: Error }>;
  registrarPagamento: (lancamentoId: string, dataPagamento?: Date) => Promise<{ success: boolean; error?: Error }>;
}

interface CreateLancamentoInput {
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  data_competencia: string;
  data_vencimento: string;
  categoria_id?: string;
  unidade_id?: string;
  conta_id: string;
}

// ============================================
// HOOK
// ============================================
export function useFinancial({ condominioId, mesReferencia }: UseFinancialOptions): UseFinancialReturn {
  const supabase = getSupabaseClient();

  const [dashboard, setDashboard] = useState<DashboardFinanceiro | null>(null);
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [lancamentos, setLancamentos] = useState<LancamentoComDetalhes[]>([]);
  const [inadimplentes, setInadimplentes] = useState<UseFinancialReturn['inadimplentes']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const mes = mesReferencia || new Date();
  const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1).toISOString();
  const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).toISOString();

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchDashboard = useCallback(async () => {
    if (!condominioId) return;

    try {
      // Buscar view de dashboard ou calcular
      const { data, error } = await supabase
        .from('vw_dashboard_financeiro')
        .select('*')
        .eq('condominio_id', condominioId)
        .single();

      if (error) {
        // Fallback: calcular manualmente
        const { data: contasData } = await supabase
          .from('contas_bancarias')
          .select('saldo_atual')
          .eq('condominio_id', condominioId)
          .eq('status', 'ativo');

        const saldoTotal = contasData?.reduce((sum, c) => sum + (c.saldo_atual || 0), 0) || 0;

        // Receitas do mês
        const { data: receitas } = await supabase
          .from('lancamentos')
          .select('valor')
          .eq('condominio_id', condominioId)
          .eq('tipo', 'receita')
          .eq('status', 'pago')
          .gte('data_competencia', inicioMes)
          .lte('data_competencia', fimMes);

        const receitasMes = receitas?.reduce((sum, l) => sum + (l.valor || 0), 0) || 0;

        // Despesas do mês
        const { data: despesas } = await supabase
          .from('lancamentos')
          .select('valor')
          .eq('condominio_id', condominioId)
          .eq('tipo', 'despesa')
          .eq('status', 'pago')
          .gte('data_competencia', inicioMes)
          .lte('data_competencia', fimMes);

        const despesasMes = despesas?.reduce((sum, l) => sum + Math.abs(l.valor || 0), 0) || 0;

        setDashboard({
          saldo_total: saldoTotal,
          receitas_mes: receitasMes,
          despesas_mes: despesasMes,
          inadimplencia_percent: 8, // TODO: calcular real
          fundo_reserva: saldoTotal * 0.3, // TODO: conta específica
        });
      } else {
        setDashboard(data);
      }
    } catch (err) {
      console.error('Erro ao buscar dashboard:', err);
    }
  }, [condominioId, supabase, inicioMes, fimMes]);

  const fetchContas = useCallback(async () => {
    if (!condominioId) return;

    const { data, error } = await supabase
      .from('contas_bancarias')
      .select('id, nome, banco, saldo_atual, is_principal')
      .eq('condominio_id', condominioId)
      .eq('status', 'ativo')
      .order('is_principal', { ascending: false });

    if (!error && data) {
      setContas(data);
    }
  }, [condominioId, supabase]);

  const fetchLancamentos = useCallback(async () => {
    if (!condominioId) return;

    const { data, error } = await supabase
      .from('lancamentos')
      .select(`
        *,
        categorias:categoria_id (nome),
        unidades:unidade_id (identificador)
      `)
      .eq('condominio_id', condominioId)
      .gte('data_competencia', inicioMes)
      .lte('data_competencia', fimMes)
      .order('data_vencimento', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLancamentos(data.map((l: any) => ({
        ...l,
        categoria_nome: l.categorias?.nome,
        unidade_identificador: l.unidades?.identificador,
      })));
    }
  }, [condominioId, supabase, inicioMes, fimMes]);

  const fetchInadimplentes = useCallback(async () => {
    if (!condominioId) return;

    const { data, error } = await supabase
      .from('lancamentos')
      .select(`
        unidade_id,
        valor,
        data_vencimento,
        unidades:unidade_id (identificador)
      `)
      .eq('condominio_id', condominioId)
      .eq('tipo', 'receita')
      .eq('status', 'atrasado')
      .not('unidade_id', 'is', null);

    if (!error && data) {
      // Agrupar por unidade
      const grouped = data.reduce((acc: any, l: any) => {
        const key = l.unidade_id;
        if (!acc[key]) {
          acc[key] = {
            unidade_id: key,
            identificador: l.unidades?.identificador || '',
            valor_devido: 0,
            meses_atraso: 0,
          };
        }
        acc[key].valor_devido += l.valor;
        acc[key].meses_atraso += 1;
        return acc;
      }, {});

      setInadimplentes(Object.values(grouped));
    }
  }, [condominioId, supabase]);

  // ============================================
  // REFRESH ALL
  // ============================================
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchDashboard(),
        fetchContas(),
        fetchLancamentos(),
        fetchInadimplentes(),
      ]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchDashboard, fetchContas, fetchLancamentos, fetchInadimplentes]);

  // Initial load
  useEffect(() => {
    const checkAndLoad = async () => {
      if (!condominioId) {
        setLoading(false);
        return;
      }

      // Verificar se há sessão válida
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setLoading(false);
        return;
      }

      refresh();
    };

    checkAndLoad();
  }, [condominioId, refresh]);

  // ============================================
  // MUTATIONS
  // ============================================
  const createLancamento = async (data: CreateLancamentoInput) => {
    if (!condominioId) return { success: false, error: new Error('Condomínio não selecionado') };

    try {
      const { error } = await supabase
        .from('lancamentos')
        .insert({
          condominio_id: condominioId,
          ...data,
          status: 'pendente',
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
        });

      if (error) throw error;

      await refresh();
      return { success: true };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  const updateLancamento = async (id: string, data: Partial<Lancamento>) => {
    try {
      const { error } = await supabase
        .from('lancamentos')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await refresh();
      return { success: true };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  const registrarPagamento = async (lancamentoId: string, dataPagamento?: Date) => {
    try {
      const { error } = await supabase
        .from('lancamentos')
        .update({
          status: 'pago' as StatusLancamento,
          data_pagamento: (dataPagamento || new Date()).toISOString(),
        })
        .eq('id', lancamentoId);

      if (error) throw error;

      await refresh();
      return { success: true };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  return {
    dashboard,
    contas,
    lancamentos,
    inadimplentes,
    loading,
    error,
    refresh,
    createLancamento,
    updateLancamento,
    registrarPagamento,
  };
}
