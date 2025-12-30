'use client';

import { getErrorMessage } from '@/lib/errors';
import { sanitizeSearchQuery } from '@/lib/sanitize';
import { getSupabaseClient } from '@/lib/supabase';
import type { AvaliarChamadoInput, Chamado, ChamadoCategoria, ChamadoFilters, ChamadoMensagem, ChamadoStats, ChamadoStatus, CreateChamadoInput, CreateMensagemInput, PaginatedResponse, UpdateChamadoInput } from '@versix/shared';
import { Database } from '@versix/shared';
import { useCallback, useEffect, useState } from 'react';

export function useChamados(options?: { condominioId?: string | null; userId?: string | null; apenasMinhaUnidade?: boolean }) {
  const supabase = getSupabaseClient();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [meusChamados, setMeusChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0, hasMore: false });

  const fetchChamados = useCallback(async (condominioId: string, filters?: ChamadoFilters): Promise<PaginatedResponse<Chamado>> => {
    setLoading(true);
    setError(null);
    try {
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from('chamados').select(`*, solicitante:solicitante_id (nome, avatar_url, email), atendente:atendente_id (nome)`, { count: 'exact' })
        .eq('condominio_id', condominioId).is('deleted_at', null).order(filters?.orderBy || 'created_at', { ascending: filters?.orderDir === 'asc' }).range(from, to);

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.categoria) query = query.eq('categoria', filters.categoria);
      if (filters?.prioridade) query = query.eq('prioridade', filters.prioridade);
      if (filters?.atendente_id) query = query.eq('atendente_id', filters.atendente_id);
      if (filters?.solicitante_id) query = query.eq('solicitante_id', filters.solicitante_id);
      if (filters?.busca) {
        const buscaSanitizada = sanitizeSearchQuery(filters.busca);
        if (buscaSanitizada)
          query = query.or(`titulo.ilike.%${buscaSanitizada}%,descricao.ilike.%${buscaSanitizada}%`);
      }

      const { data, error: fetchError, count } = await query;
      if (fetchError) throw fetchError;

      const total = count || 0;
      const result: PaginatedResponse<Chamado> = {
        data: data || [],
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: to < total - 1 }
      };
      setChamados(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao carregar chamados');
      return { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0, hasMore: false } };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (options?.condominioId && options?.userId) {
      const filters: ChamadoFilters = {};
      if (options.apenasMinhaUnidade) {
        filters.solicitante_id = options.userId;
      }
      fetchChamados(options.condominioId, filters).then(result => {
        setMeusChamados(result.data);
      });
    }
  }, [options, fetchChamados]);

  const getChamado = useCallback(async (id: string): Promise<Chamado | null> => {
    try {
      const { data, error: fetchError } = await supabase.from('chamados').select(`*, solicitante:solicitante_id (nome, avatar_url, email), atendente:atendente_id (nome)`).eq('id', id).single();
      if (fetchError) throw fetchError;
      // Buscar mensagens
      const { data: mensagens } = await supabase.from('chamados_mensagens').select(`*, autor:autor_id (nome, avatar_url)`).eq('chamado_id', id).is('deleted_at', null).order('created_at', { ascending: true });
      return { ...data, mensagens: mensagens || [], total_mensagens: mensagens?.length || 0 };
    } catch (err) {
      console.error('Erro ao buscar chamado:', err);
      return null;
    }
  }, [supabase]);

  const createChamado = useCallback(async (condominioId: string, solicitanteId: string, input: CreateChamadoInput): Promise<Chamado | null> => {
    setLoading(true);
    try {
      const { data, error: insertError } = await supabase.from('chamados').insert({ condominio_id: condominioId, solicitante_id: solicitanteId, ...input }).select().single();
      if (insertError) throw insertError;
      setChamados(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao criar chamado');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateChamado = useCallback(async (input: UpdateChamadoInput): Promise<Chamado | null> => {
    setLoading(true);
    try {
      const { id, ...updates } = input;
      type ChamadoUpdate = Database['public']['Tables']['chamados']['Update'];
      const updateData: Partial<ChamadoUpdate> = { ...updates };
      if (updates.status === 'resolvido') updateData.resolvido_em = new Date().toISOString();
      const { data, error: updateError } = await supabase.from('chamados').update(updateData).eq('id', id).select().single();
      if (updateError) throw updateError;
      setChamados(prev => prev.map(c => c.id === id ? data : c));
      return data;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao atualizar chamado');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteChamado = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error: deleteError } = await supabase.from('chamados').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (deleteError) throw deleteError;
      setChamados(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao excluir chamado');
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const addMensagem = useCallback(async (autorId: string, input: CreateMensagemInput): Promise<ChamadoMensagem | null> => {
    try {
      const { data, error: insertError } = await supabase.from('chamados_mensagens').insert({ autor_id: autorId, ...input }).select(`*, autor:autor_id (nome, avatar_url)`).single();
      if (insertError) throw insertError;
      return data;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao enviar mensagem');
      return null;
    }
  }, [supabase]);

  const avaliarChamado = useCallback(async (input: AvaliarChamadoInput): Promise<boolean> => {
    try {
      const { id, ...avaliacaoData } = input;
      const { error: updateError } = await supabase.from('chamados').update({ ...avaliacaoData, avaliado_em: new Date().toISOString() }).eq('id', id);
      if (updateError) throw updateError;
      setChamados(prev => prev.map(c => c.id === id ? { ...c, ...avaliacaoData, avaliado_em: new Date().toISOString() } : c));
      return true;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao avaliar chamado');
      return false;
    }
  }, [supabase]);

  const getStats = useCallback(async (condominioId: string): Promise<ChamadoStats | null> => {
    try {
      const { data } = await supabase.from('chamados').select('status, categoria, avaliacao_nota, created_at, resolvido_em').eq('condominio_id', condominioId).is('deleted_at', null);
      if (!data) return null;
      type EstatisticasChamados = {
        por_categoria: Record<string, number>;
        avaliacao_media: number | null;
        tempo_medio_resolucao_horas: number | null;
        total: number;
        novos: number;
        em_atendimento: number;
        resolvidos: number;
      };
      const stats: EstatisticasChamados = {
        total: data.length, novos: data.filter(c => c.status === 'novo').length,
        em_atendimento: data.filter(c => c.status === 'em_atendimento').length,
        resolvidos: data.filter(c => ['resolvido', 'fechado'].includes(c.status)).length,
        por_categoria: {}, avaliacao_media: null, tempo_medio_resolucao_horas: null
      };
      data.forEach(c => { stats.por_categoria[c.categoria] = (stats.por_categoria[c.categoria] || 0) + 1; });
      const comNota = data.filter(c => c.avaliacao_nota);
      if (comNota.length > 0) stats.avaliacao_media = comNota.reduce((a, c) => a + c.avaliacao_nota!, 0) / comNota.length;
      const resolvidos = data.filter(c => c.resolvido_em);
      if (resolvidos.length > 0) {
        const tempos = resolvidos.map(c => (new Date(c.resolvido_em!).getTime() - new Date(c.created_at).getTime()) / 3600000);
        stats.tempo_medio_resolucao_horas = tempos.reduce((a, b) => a + b, 0) / tempos.length;
      }
      return stats;
    } catch { return null; }
  }, [supabase]);

  return { chamados, meusChamados, loading, error, pagination, fetchChamados, getChamado, createChamado, updateChamado, deleteChamado, addMensagem, avaliarChamado, getStats };
}

export type { AvaliarChamadoInput, Chamado, ChamadoCategoria, ChamadoFilters, ChamadoMensagem, ChamadoStatus, CreateChamadoInput, CreateMensagemInput, UpdateChamadoInput };

