import { sanitizeSearchQuery } from '@/lib/sanitize';
'use client';

import { getErrorMessage } from '@/lib/errors';
import { getSupabaseClient } from '@/lib/supabase';
import type { CreateOcorrenciaInput, Ocorrencia, OcorrenciaCategoria, OcorrenciaFilters, OcorrenciaHistorico, OcorrenciaStats, OcorrenciaStatus, PaginatedResponse, Prioridade, UpdateOcorrenciaInput } from '@versix/shared';
import { Database } from '@versix/shared';
import { useCallback, useState } from 'react';

export function useOcorrencias() {
  const supabase = getSupabaseClient();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0, hasMore: false });

  const fetchOcorrencias = useCallback(async (condominioId: string, filters?: OcorrenciaFilters): Promise<PaginatedResponse<Ocorrencia>> => {
    setLoading(true);
    setError(null);
    try {
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from('ocorrencias').select(`*, reportado_por_usuario:reportado_por (nome, avatar_url), responsavel:responsavel_id (nome), unidade:unidade_relacionada_id (identificador, bloco:bloco_id (nome))`, { count: 'exact' })
        .eq('condominio_id', condominioId).is('deleted_at', null).order(filters?.orderBy || 'created_at', { ascending: filters?.orderDir === 'asc' }).range(from, to);

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.categoria) query = query.eq('categoria', filters.categoria);
      if (filters?.prioridade) query = query.eq('prioridade', filters.prioridade);
      if (filters?.responsavel_id) query = query.eq('responsavel_id', filters.responsavel_id);
      if (filters?.busca) {
        const buscaSanitizada = sanitizeSearchQuery(filters.busca);
        if (buscaSanitizada)
          query = query.or(`titulo.ilike.%${buscaSanitizada}%,descricao.ilike.%${buscaSanitizada}%`);
      }

      const { data, error: fetchError, count } = await query;
      if (fetchError) throw fetchError;

      const total = count || 0;
      const result: PaginatedResponse<Ocorrencia> = {
        data: data || [],
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: to < total - 1 }
      };
      setOcorrencias(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao carregar ocorrências');
      return { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0, hasMore: false } };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const getOcorrencia = useCallback(async (id: string): Promise<Ocorrencia | null> => {
    try {
      const { data, error: fetchError } = await supabase.from('ocorrencias').select(`*, reportado_por_usuario:reportado_por (nome, avatar_url), responsavel:responsavel_id (nome), unidade:unidade_relacionada_id (identificador, bloco:bloco_id (nome))`).eq('id', id).single();
      if (fetchError) throw fetchError;
      // Buscar histórico
      const { data: historico } = await supabase.from('ocorrencias_historico').select(`*, usuario:usuario_id (nome)`).eq('ocorrencia_id', id).order('created_at', { ascending: true });
      return { ...data, historico: historico || [] };
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, [supabase]);

  const createOcorrencia = useCallback(async (condominioId: string, reportadoPor: string, input: CreateOcorrenciaInput): Promise<Ocorrencia | null> => {
    setLoading(true);
    try {
      const { data, error: insertError } = await supabase.from('ocorrencias').insert({ condominio_id: condominioId, reportado_por: reportadoPor, ...input }).select().single();
      if (insertError) throw insertError;
      setOcorrencias(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao criar ocorrência');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateOcorrencia = useCallback(async (input: UpdateOcorrenciaInput, userId?: string): Promise<Ocorrencia | null> => {
    setLoading(true);
    try {
      // Setar user_id para o trigger de histórico
      if (userId) await supabase.rpc('set_app_user_id', { user_id: userId }).catch(() => {});

      const { id, ...updates } = input;
      // Se resolvendo, definir campos de resolução
      if (updates.status === 'resolvida' && !updates.resolucao) updates.resolucao = 'Resolvida';
      type OcorrenciaUpdate = Database['public']['Tables']['ocorrencias']['Update'];
      const updateData: Partial<OcorrenciaUpdate> = { ...updates };
      if (updates.status === 'resolvida') {
        updateData.resolvido_em = new Date().toISOString();
        updateData.resolvido_por = userId;
      }
      const { data, error: updateError } = await supabase.from('ocorrencias').update(updateData).eq('id', id).select().single();
      if (updateError) throw updateError;
      setOcorrencias(prev => prev.map(o => o.id === id ? data : o));
      return data;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao atualizar ocorrência');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteOcorrencia = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error: deleteError } = await supabase.from('ocorrencias').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (deleteError) throw deleteError;
      setOcorrencias(prev => prev.filter(o => o.id !== id));
      return true;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao excluir ocorrência');
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const getStats = useCallback(async (condominioId: string): Promise<OcorrenciaStats | null> => {
    try {
      const { data } = await supabase.from('ocorrencias').select('status, categoria, prioridade, created_at, resolvido_em').eq('condominio_id', condominioId).is('deleted_at', null);
      if (!data) return null;
      type EstatisticasOcorrencias = {
        total: number;
        abertas: number;
        em_andamento: number;
        resolvidas: number;
        por_categoria: Record<string, number>;
        por_prioridade: Record<string, number>;
        tempo_medio_resolucao_horas: number | null;
      };
      const stats: EstatisticasOcorrencias = {
        total: data.length, abertas: data.filter(o => o.status === 'aberta').length,
        em_andamento: data.filter(o => ['em_analise', 'em_andamento'].includes(o.status)).length,
        resolvidas: data.filter(o => o.status === 'resolvida').length,
        por_categoria: {}, por_prioridade: {}, tempo_medio_resolucao_horas: null
      };
      data.forEach(o => {
        stats.por_categoria[o.categoria] = (stats.por_categoria[o.categoria] || 0) + 1;
        stats.por_prioridade[o.prioridade] = (stats.por_prioridade[o.prioridade] || 0) + 1;
      });
      const resolvidas = data.filter(o => o.resolvido_em);
      if (resolvidas.length > 0) {
        const tempos = resolvidas.map(o => (new Date(o.resolvido_em!).getTime() - new Date(o.created_at).getTime()) / 3600000);
        stats.tempo_medio_resolucao_horas = tempos.reduce((a, b) => a + b, 0) / tempos.length;
      }
      return stats;
    } catch { return null; }
  }, [supabase]);

  return { ocorrencias, loading, error, pagination, fetchOcorrencias, getOcorrencia, createOcorrencia, updateOcorrencia, deleteOcorrencia, getStats };
}

export type { CreateOcorrenciaInput, Ocorrencia, OcorrenciaCategoria, OcorrenciaFilters, OcorrenciaHistorico, OcorrenciaStatus, Prioridade, UpdateOcorrenciaInput };

