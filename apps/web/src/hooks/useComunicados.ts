import { sanitizeSearchQuery } from '@/lib/sanitize';
'use client';

import { getErrorMessage } from '@/lib/errors';
import { getSupabaseClient } from '@/lib/supabase';
import type { Comunicado, ComunicadoCategoria, ComunicadoFilters, ComunicadoStatus, CreateComunicadoInput, PaginatedResponse, UpdateComunicadoInput } from '@versix/shared';
import { Database } from '@versix/shared';
import { useCallback, useState } from 'react';

export function useComunicados(_options?: { condominioId?: string | null; userId?: string | null }) {
  const supabase = getSupabaseClient();
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0, hasMore: false });
  const [naoLidos, setNaoLidos] = useState(0);

  const fetchComunicados = useCallback(async (condominioId: string, filters?: ComunicadoFilters): Promise<PaginatedResponse<Comunicado>> => {
    setLoading(true);
    setError(null);
    try {
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from('comunicados').select(`*, autor:autor_id (nome, avatar_url)`, { count: 'exact' })
        .eq('condominio_id', condominioId).is('deleted_at', null).order(filters?.orderBy || 'created_at', { ascending: filters?.orderDir === 'asc' }).range(from, to);

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.categoria) query = query.eq('categoria', filters.categoria);
      if (filters?.fixado !== undefined) query = query.eq('fixado', filters.fixado);
      if (filters?.busca) {
        const buscaSanitizada = sanitizeSearchQuery(filters.busca);
        if (buscaSanitizada)
          query = query.or(`titulo.ilike.%${buscaSanitizada}%,conteudo.ilike.%${buscaSanitizada}%`);
      }

      const { data, error: fetchError, count } = await query;
      if (fetchError) throw fetchError;

      const total = count || 0;
      const result: PaginatedResponse<Comunicado> = {
        data: data || [],
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: to < total - 1 }
      };
      setComunicados(result.data);
      setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao carregar comunicados');
      return { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0, hasMore: false } };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const getComunicado = useCallback(async (id: string): Promise<Comunicado | null> => {
    try {
      const { data, error: fetchError } = await supabase.from('comunicados').select(`*, autor:autor_id (nome, avatar_url)`).eq('id', id).single();
      if (fetchError) throw fetchError;
      // Incrementar visualização
      await supabase.rpc('increment_comunicado_views', { p_comunicado_id: id });
      return data;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, [supabase]);

  // Mapeia categoria do front para o enum do banco
  // Tipos aceitos pelo banco
  type CategoriaDb = 'urgente' | 'geral' | 'manutencao' | 'financeiro' | 'seguranca' | 'evento' | 'obras' | 'assembleia';
  function mapCategoriaToDb(categoria?: ComunicadoCategoria): CategoriaDb | undefined {
    if (!categoria) return undefined;
    if (categoria === 'aviso_geral' || categoria === 'outros') return 'geral';
    if (categoria === 'eventos') return 'evento';
    // Garantir que só retorna valores válidos
    if ([
      'urgente', 'geral', 'manutencao', 'financeiro', 'seguranca', 'evento', 'obras', 'assembleia'
    ].includes(categoria)) {
      return categoria as CategoriaDb;
    }
    return 'geral';
  }

  const createComunicado = useCallback(async (condominioId: string, autorId: string, input: CreateComunicadoInput): Promise<Comunicado | null> => {
    setLoading(true);
    try {
      const { data, error: insertError } = await supabase.from('comunicados').insert({
        condominio_id: condominioId,
        autor_id: autorId,
        ...input,
        categoria: mapCategoriaToDb(input.categoria),
        published_at: input.status === 'publicado' ? new Date().toISOString() : null
      }).select().single();
      if (insertError) throw insertError;
      setComunicados(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao criar comunicado');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateComunicado = useCallback(async (input: UpdateComunicadoInput): Promise<Comunicado | null> => {
    setLoading(true);
    try {
      const { id, ...updates } = input;
      // Mapeia categoria para o enum do banco
      const categoriaDb = mapCategoriaToDb(updates.categoria);
      // Se publicando agora, definir published_at
      if (updates.status === 'publicado') {
        const current = comunicados.find(c => c.id === id);
        type ComunicadoUpdate = Database['public']['Tables']['comunicados']['Update'] & { published_at?: string };
        const updatePayload: ComunicadoUpdate = {
          ...updates,
          categoria: categoriaDb,
          ...(current?.status !== 'publicado' && { published_at: new Date().toISOString() })
        };
        const { data, error: updateError } = await supabase.from('comunicados').update(updatePayload).eq('id', id).select().single();
        if (updateError) throw updateError;
        setComunicados(prev => prev.map(c => c.id === id ? data : c));
        return data;
      } else {
        const { data, error: updateError } = await supabase.from('comunicados').update({ ...updates, categoria: categoriaDb }).eq('id', id).select().single();
        if (updateError) throw updateError;
        setComunicados(prev => prev.map(c => c.id === id ? data : c));
        return data;
      }
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao atualizar comunicado');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase, comunicados]);

  const deleteComunicado = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error: deleteError } = await supabase.from('comunicados').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (deleteError) throw deleteError;
      setComunicados(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      setError(getErrorMessage(err) || 'Erro ao excluir comunicado');
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const marcarComoLido = useCallback(async (comunicadoId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      await supabase.rpc('mark_comunicado_read', { p_comunicado_id: comunicadoId, p_usuario_id: user.id });
      // Update local state
      setComunicados(prev => prev.map(c => c.id === comunicadoId ? { ...c, lido: true } : c));
      setNaoLidos(prev => Math.max(0, prev - 1));
      return true;
    } catch { return false; }
  }, [supabase]);

  const marcarTodosComoLidos = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const comunicadoIds = comunicados.filter(c => !c.lido).map(c => c.id);
      if (comunicadoIds.length === 0) return true;

      // Mark each as read
      for (const id of comunicadoIds) {
        await supabase.rpc('mark_comunicado_read', { p_comunicado_id: id, p_usuario_id: user.id });
      }

      // Update local state
      setComunicados(prev => prev.map(c => ({ ...c, lido: true })));
      setNaoLidos(0);
      return true;
    } catch { return false; }
  }, [supabase, comunicados]);

  const getLeituras = useCallback(async (comunicadoId: string) => {
    try {
      const { data } = await supabase.from('comunicados_leitura').select(`*, usuario:usuario_id (nome)`).eq('comunicado_id', comunicadoId).order('lido_em', { ascending: false });
      return data || [];
    } catch { return []; }
  }, [supabase]);

  return { comunicados, naoLidos, loading, error, pagination, fetchComunicados, getComunicado, createComunicado, updateComunicado, deleteComunicado, marcarComoLido, marcarTodosComoLidos, getLeituras };
}

export type { Comunicado, ComunicadoCategoria, ComunicadoFilters, ComunicadoStatus, CreateComunicadoInput, UpdateComunicadoInput };

