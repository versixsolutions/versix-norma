'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import type { Chamado, StatusChamado, PrioridadeChamado } from '@/types/database';

// ============================================
// TYPES
// ============================================
interface ChamadoComDetalhes extends Chamado {
  unidade_identificador?: string;
  responsavel_nome?: string;
  total_comentarios: number;
}

interface ComentarioChamado {
  id: string;
  chamado_id: string;
  usuario_id: string;
  usuario_nome: string;
  conteudo: string;
  is_interno: boolean;
  created_at: string;
}

interface UseChamadosOptions {
  condominioId: string | null;
  userId: string | null;
  unidadeId?: string | null;
  apenasMinhaUnidade?: boolean;
}

interface UseChamadosReturn {
  chamados: ChamadoComDetalhes[];
  meusChamados: ChamadoComDetalhes[];
  abertos: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  criarChamado: (data: CriarChamadoInput) => Promise<{ success: boolean; id?: string; error?: Error }>;
  atualizarStatus: (chamadoId: string, status: StatusChamado) => Promise<{ success: boolean; error?: Error }>;
  adicionarComentario: (chamadoId: string, conteudo: string) => Promise<{ success: boolean; error?: Error }>;
  buscarComentarios: (chamadoId: string) => Promise<ComentarioChamado[]>;
}

interface CriarChamadoInput {
  categoria: string;
  titulo: string;
  descricao: string;
  prioridade?: PrioridadeChamado;
  unidade_id?: string;
}

// ============================================
// HOOK
// ============================================
export function useChamados({ 
  condominioId, 
  userId, 
  unidadeId,
  apenasMinhaUnidade = false 
}: UseChamadosOptions): UseChamadosReturn {
  const supabase = getSupabaseClient();
  
  const [chamados, setChamados] = useState<ChamadoComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChamados = useCallback(async () => {
    if (!condominioId) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('chamados')
        .select(`
          *,
          unidades:unidade_id (identificador),
          responsavel:responsavel_id (nome)
        `)
        .eq('condominio_id', condominioId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (apenasMinhaUnidade && unidadeId) {
        query = query.eq('unidade_id', unidadeId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Contar comentários para cada chamado
      const chamadosComDetalhes: ChamadoComDetalhes[] = await Promise.all(
        (data || []).map(async (c: any) => {
          const { count } = await supabase
            .from('chamados_comentarios')
            .select('*', { count: 'exact', head: true })
            .eq('chamado_id', c.id);

          return {
            ...c,
            unidade_identificador: c.unidades?.identificador,
            responsavel_nome: c.responsavel?.nome,
            total_comentarios: count || 0,
          };
        })
      );

      setChamados(chamadosComDetalhes);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [condominioId, unidadeId, apenasMinhaUnidade, supabase]);

  useEffect(() => {
    fetchChamados();
  }, [fetchChamados]);

  // Realtime subscription
  useEffect(() => {
    if (!condominioId) return;

    const channel = supabase
      .channel('chamados-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chamados',
          filter: `condominio_id=eq.${condominioId}`,
        },
        () => {
          fetchChamados();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [condominioId, supabase, fetchChamados]);

  const criarChamado = async (data: CriarChamadoInput) => {
    if (!condominioId || !userId) {
      return { success: false, error: new Error('Dados incompletos') };
    }

    try {
      const { data: novoChamado, error } = await supabase
        .from('chamados')
        .insert({
          condominio_id: condominioId,
          usuario_id: userId,
          unidade_id: data.unidade_id || unidadeId || null,
          categoria: data.categoria,
          titulo: data.titulo,
          descricao: data.descricao,
          prioridade: data.prioridade || 'media',
          status: 'aberto',
        })
        .select('id')
        .single();

      if (error) throw error;

      await fetchChamados();
      return { success: true, id: novoChamado?.id };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  const atualizarStatus = async (chamadoId: string, status: StatusChamado) => {
    try {
      const updateData: any = { status };
      
      if (status === 'resolvido') {
        updateData.data_resolucao = new Date().toISOString();
      }

      const { error } = await supabase
        .from('chamados')
        .update(updateData)
        .eq('id', chamadoId);

      if (error) throw error;

      await fetchChamados();
      return { success: true };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  const adicionarComentario = async (chamadoId: string, conteudo: string) => {
    if (!userId) {
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      const { error } = await supabase
        .from('chamados_comentarios')
        .insert({
          chamado_id: chamadoId,
          usuario_id: userId,
          conteudo,
          is_interno: false,
        });

      if (error) throw error;

      await fetchChamados();
      return { success: true };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  const buscarComentarios = async (chamadoId: string): Promise<ComentarioChamado[]> => {
    try {
      const { data, error } = await supabase
        .from('chamados_comentarios')
        .select(`
          *,
          usuarios:usuario_id (nome)
        `)
        .eq('chamado_id', chamadoId)
        .eq('is_interno', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((c: any) => ({
        ...c,
        usuario_nome: c.usuarios?.nome || 'Usuário',
      }));
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
      return [];
    }
  };

  const meusChamados = chamados.filter((c) => c.usuario_id === userId);
  const abertos = chamados.filter((c) => c.status === 'aberto' || c.status === 'em_andamento').length;

  return {
    chamados,
    meusChamados,
    abertos,
    loading,
    error,
    refresh: fetchChamados,
    criarChamado,
    atualizarStatus,
    adicionarComentario,
    buscarComentarios,
  };
}
