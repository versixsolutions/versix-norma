'use client';

import { getSupabaseClient } from '@/lib/supabase';
import type { Chamado, DBRow, PrioridadeChamado, StatusChamado } from '@/types/database';
import { useCallback, useEffect, useState } from 'react';

// ============================================
// TYPES
// ============================================
interface ChamadoComDetalhes extends Chamado {
  unidade_identificador?: string | null;
  responsavel_nome?: string | null;
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
  criarChamado: (
    data: CriarChamadoInput
  ) => Promise<{ success: boolean; id?: string; error?: Error }>;
  atualizarStatus: (
    chamadoId: string,
    status: StatusChamado
  ) => Promise<{ success: boolean; error?: Error }>;
  adicionarComentario: (
    chamadoId: string,
    conteudo: string
  ) => Promise<{ success: boolean; error?: Error }>;
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
export function useChamados({
  condominioId,
  userId,
  unidadeId: _unidadeId,
  apenasMinhaUnidade = false,
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
        .select(
          `
          *,
          solicitante:solicitante_id (nome, unidade_id),
          atendente:atendente_id (nome)
        `
        )
        .eq('condominio_id', condominioId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (apenasMinhaUnidade && userId) {
        query = query.eq('solicitante_id', userId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const chamadosComDetalhes: ChamadoComDetalhes[] = await Promise.all(
        (data || []).map(
          async (
            c: DBRow<'chamados'> & {
              solicitante?: { unidade_id?: string };
              atendente?: { nome?: string };
            }
          ) => {
            const { count } = await supabase
              .from('chamados_mensagens')
              .select('*', { count: 'exact', head: true })
              .eq('chamado_id', c.id);

            return {
              ...c,
              unidade_identificador: c.solicitante?.unidade_id || null,
              responsavel_nome: c.atendente?.nome || null,
              total_comentarios: count || 0,
            };
          }
        )
      );

      setChamados(chamadosComDetalhes);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [condominioId, apenasMinhaUnidade, supabase, userId]);

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
          solicitante_id: userId,
          categoria: data.categoria,
          titulo: data.titulo,
          descricao: data.descricao,
          prioridade: data.prioridade || 'media',
          status: 'novo',
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
      const updateData: Partial<{ status: StatusChamado; data_resolucao?: string }> = { status };

      if (status === 'resolvido') {
        updateData.data_resolucao = new Date().toISOString();
      }

      const { error } = await supabase.from('chamados').update(updateData).eq('id', chamadoId);

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
      const { error } = await supabase.from('chamados_mensagens').insert({
        chamado_id: chamadoId,
        autor_id: userId,
        mensagem: conteudo,
        interno: false,
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
        .from('chamados_mensagens')
        .select(
          `
          *,
          usuarios:autor_id (nome)
        `
        )
        .eq('chamado_id', chamadoId)
        .eq('interno', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(
        (c: DBRow<'chamados_mensagens'> & { usuarios?: { nome?: string } }) => ({
          id: c.id,
          chamado_id: c.chamado_id,
          usuario_id: c.autor_id,
          usuario_nome: c.usuarios?.nome || 'Usuário',
          conteudo: c.mensagem,
          is_interno: c.interno,
          created_at: c.created_at,
        })
      );
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
      return [];
    }
  };

  const meusChamados = chamados.filter((c) => c.solicitante_id === userId);
  const abertos = chamados.filter(
    (c) =>
      c.status === 'novo' || c.status === 'em_atendimento' || c.status === 'aguardando_resposta'
  ).length;

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
