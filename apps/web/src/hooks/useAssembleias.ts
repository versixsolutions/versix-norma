'use client';

import { getSupabaseClient } from '@/lib/supabase';
import type { Assembleia, AssembleiaFilters, AssembleiaStatus, CreateAssembleiaInput, CreatePautaInput, Pauta, Presenca, QuorumInfo, UpdateAssembleiaInput } from '@versix/shared/types/assembleias';
import { useCallback, useState } from 'react';

/**
 * Hook para gerenciamento de assembleias condominiais
 * Permite buscar assembleias, pautas, presenças e atualizar informações.
 * @returns Métodos e estados de assembleias
 */
export function useAssembleias() {
  const supabase = getSupabaseClient();
  const [assembleias, setAssembleias] = useState<Assembleia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssembleias = useCallback(async (condominioId: string, filters?: AssembleiaFilters): Promise<Assembleia[]> => {
    setLoading(true);
    try {
      let query = supabase.from('assembleias').select('*, pautas:assembleia_pautas(*)').eq('condominio_id', condominioId).order('data_primeira_convocacao', { ascending: false });
      if (filters?.tipo) query = query.eq('tipo', filters.tipo);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.ano) query = query.gte('data_primeira_convocacao', `${filters.ano}-01-01`).lt('data_primeira_convocacao', `${filters.ano + 1}-01-01`);

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setAssembleias((data || []) as Assembleia[]);
      return (data || []) as Assembleia[];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const getAssembleia = useCallback(async (id: string): Promise<Assembleia | null> => {
    try {
      const { data, error: fetchError } = await supabase.from('assembleias').select(`*, pautas:assembleia_pautas(*, opcoes:assembleia_pauta_opcoes(*)), presencas:assembleia_presencas(*, usuario:usuario_id(nome, avatar_url), unidades_habitacionais:unidade_id(numero, blocos:bloco_id(nome)))`).eq('id', id).single();
      if (fetchError) throw fetchError;

      // Buscar quorum
      const { data: quorum } = await supabase.from('v_assembleia_quorum').select('*').eq('assembleia_id', id).single();

      return { ...data, quorum } as unknown as Assembleia;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    }
  }, [supabase]);

  const createAssembleia = useCallback(async (condominioId: string, criadoPor: string, input: CreateAssembleiaInput): Promise<Assembleia | null> => {
    setLoading(true);
    try {
      const { data, error: insertError } = await supabase.from('assembleias').insert({ condominio_id: condominioId, criado_por: criadoPor, ...input }).select().single();
      if (insertError) throw insertError;
      setAssembleias(prev => [data as Assembleia, ...prev]);
      return data as Assembleia;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateAssembleia = useCallback(async (input: UpdateAssembleiaInput): Promise<Assembleia | null> => {
    setLoading(true);
    try {
      const { id, ...updates } = input;
      const { data, error: updateError } = await supabase.from('assembleias').update(updates).eq('id', id).select().single();
      if (updateError) throw updateError;
      setAssembleias(prev => prev.map(a => a.id === id ? data as Assembleia : a));
      return data as Assembleia;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteAssembleia = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.from('assembleias').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setAssembleias(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    }
  }, [supabase]);

  // Ações de workflow
  const convocarAssembleia = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data, error: rpcError } = await supabase.rpc('convocar_assembleia' as any, { p_assembleia_id: id });
      if (rpcError) throw rpcError;
      setAssembleias(prev => prev.map(a => a.id === id ? { ...a, status: 'convocada' as AssembleiaStatus } : a));
      return Boolean(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    }
  }, [supabase]);

  const iniciarAssembleia = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data, error: rpcError } = await supabase.rpc('iniciar_assembleia' as any, { p_assembleia_id: id });
      if (rpcError) throw rpcError;
      setAssembleias(prev => prev.map(a => a.id === id ? { ...a, status: 'em_andamento' as AssembleiaStatus } : a));
      return Boolean(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    }
  }, [supabase]);

  const encerrarAssembleia = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data, error: rpcError } = await supabase.rpc('encerrar_assembleia', { p_assembleia_id: id });
      if (rpcError) throw rpcError;
      setAssembleias(prev => prev.map(a => a.id === id ? { ...a, status: 'encerrada' as AssembleiaStatus } : a));
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    }
  }, [supabase]);

  // Pautas
  const addPauta = useCallback(async (assembleiaId: string, input: CreatePautaInput): Promise<Pauta | null> => {
    try {
      const { data, error: insertError } = await supabase.from('assembleia_pautas').insert({ assembleia_id: assembleiaId, ...input }).select().single();
      if (insertError) throw insertError;
      return data as Pauta;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    }
  }, [supabase]);

  const removePauta = useCallback(async (pautaId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.from('assembleia_pautas').delete().eq('id', pautaId);
      if (deleteError) throw deleteError;
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    }
  }, [supabase]);

  // Realtime quorum
  const subscribeToQuorum = useCallback((assembleiaId: string, onUpdate: (quorum: QuorumInfo) => void) => {
    const channel = supabase.channel(`quorum-${assembleiaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assembleia_presencas', filter: `assembleia_id=eq.${assembleiaId}` }, async () => {
        const { data } = await supabase.from('v_assembleia_quorum').select('*').eq('assembleia_id', assembleiaId).single();
        if (data) onUpdate(data as unknown as QuorumInfo);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return {
    assembleias, loading, error,
    fetchAssembleias, getAssembleia, createAssembleia, updateAssembleia, deleteAssembleia,
    convocarAssembleia, iniciarAssembleia, encerrarAssembleia,
    addPauta, removePauta, subscribeToQuorum
  };
}

export type { Assembleia, AssembleiaFilters, CreateAssembleiaInput, CreatePautaInput, Pauta, Presenca, QuorumInfo, UpdateAssembleiaInput };

