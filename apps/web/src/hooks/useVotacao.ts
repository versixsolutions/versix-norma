'use client';

import { getSupabaseClient } from '@/lib/supabase';
import { useCallback, useState } from 'react';
import type { Voto, Presenca, PautaStatus, VotarInput, Comentario, CreateComentarioInput } from '@versix/shared/types/assembleias';

export function useVotacao() {
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registrar presença
  const registrarPresenca = useCallback(async (assembleiaId: string, tipo: 'presencial' | 'online' | 'procuracao' | 'voto_antecipado' = 'online', representanteId?: string): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('registrar_presenca', {
        p_assembleia_id: assembleiaId,
        p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
        p_tipo: tipo,
        p_representante_id: representanteId || null
      });
      if (rpcError) throw rpcError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Buscar minha presença
  const getMinhaPresenca = useCallback(async (assembleiaId: string): Promise<Presenca | null> => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error: fetchError } = await supabase.from('assembleia_presencas').select('*').eq('assembleia_id', assembleiaId).or(`usuario_id.eq.${userId},representante_id.eq.${userId}`).single();
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [supabase]);

  // Iniciar votação de pauta
  const iniciarVotacaoPauta = useCallback(async (pautaId: string): Promise<boolean> => {
    try {
      const { data, error: rpcError } = await supabase.rpc('iniciar_votacao_pauta', { p_pauta_id: pautaId });
      if (rpcError) throw rpcError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [supabase]);

  // Votar
  const votar = useCallback(async (input: VotarInput): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('registrar_voto', {
        p_pauta_id: input.pauta_id,
        p_presenca_id: input.presenca_id,
        p_voto: input.voto,
        p_opcao_id: input.opcao_id || null
      });
      if (rpcError) throw rpcError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Verificar se já votou
  const jaVotou = useCallback(async (pautaId: string, presencaId: string): Promise<boolean> => {
    try {
      const { data, error: fetchError } = await supabase.from('assembleia_votos').select('id').eq('pauta_id', pautaId).eq('presenca_id', presencaId).single();
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      return !!data;
    } catch {
      return false;
    }
  }, [supabase]);

  // Encerrar votação de pauta
  const encerrarPauta = useCallback(async (pautaId: string): Promise<any> => {
    try {
      const { data, error: rpcError } = await supabase.rpc('encerrar_pauta', { p_pauta_id: pautaId });
      if (rpcError) throw rpcError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [supabase]);

  // Buscar resultado de pauta
  const getResultadoPauta = useCallback(async (pautaId: string) => {
    try {
      const { data, error: fetchError } = await supabase.from('v_pauta_resultado').select('*').eq('pauta_id', pautaId).single();
      if (fetchError) throw fetchError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [supabase]);

  // Comentários
  const fetchComentarios = useCallback(async (pautaId: string): Promise<Comentario[]> => {
    try {
      const { data, error: fetchError } = await supabase.from('assembleia_comentarios').select('*, usuario:usuario_id(nome, avatar_url)').eq('pauta_id', pautaId).eq('visivel', true).order('created_at');
      if (fetchError) throw fetchError;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, [supabase]);

  const addComentario = useCallback(async (input: CreateComentarioInput): Promise<Comentario | null> => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error: insertError } = await supabase.from('assembleia_comentarios').insert({ ...input, usuario_id: userId }).select('*, usuario:usuario_id(nome, avatar_url)').single();
      if (insertError) throw insertError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [supabase]);

  const moderarComentario = useCallback(async (comentarioId: string, visivel: boolean, motivo?: string): Promise<boolean> => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { error: updateError } = await supabase.from('assembleia_comentarios').update({
        visivel, moderado_por: userId, moderado_em: new Date().toISOString(), motivo_moderacao: motivo
      }).eq('id', comentarioId);
      if (updateError) throw updateError;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [supabase]);

  // Realtime votos
  const subscribeToVotos = useCallback((pautaId: string, onUpdate: (resultado: any) => void) => {
    const channel = supabase.channel(`votos-${pautaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assembleia_votos', filter: `pauta_id=eq.${pautaId}` }, async () => {
        const { data } = await supabase.from('v_pauta_resultado').select('*').eq('pauta_id', pautaId).single();
        if (data) onUpdate(data);
      }).subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return {
    loading, error,
    registrarPresenca, getMinhaPresenca,
    iniciarVotacaoPauta, votar, jaVotou, encerrarPauta, getResultadoPauta,
    fetchComentarios, addComentario, moderarComentario,
    subscribeToVotos
  };
}

export type { Voto, Presenca, PautaStatus, VotarInput, Comentario, CreateComentarioInput };
