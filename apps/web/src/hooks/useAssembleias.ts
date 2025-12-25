'use client';

import { getSupabaseClient } from '@/lib/supabase';
import type { Assembleia, TipoVoto } from '@/types/database';
import { useCallback, useEffect, useState } from 'react';

// ============================================
// TYPES
// ============================================
interface Pauta {
  id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  requires_quorum: boolean;
  quorum_especial: number | null;
  resultado: {
    sim: number;
    nao: number;
    abstencao: number;
    total_votos: number;
    aprovada: boolean | null;
  } | null;
  meu_voto: TipoVoto | null;
}

interface AssembleiaComDetalhes extends Assembleia {
  pautas: Pauta[];
  total_presentes: number;
  minha_presenca: 'confirmada' | 'pendente' | 'ausente';
}

interface UseAssembleiasOptions {
  condominioId: string | null;
  userId: string | null;
  unidadeId: string | null;
}

interface UseAssembleiasReturn {
  assembleias: AssembleiaComDetalhes[];
  proxima: AssembleiaComDetalhes | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  confirmarPresenca: (assembleiaId: string) => Promise<{ success: boolean; error?: Error }>;
  registrarVoto: (pautaId: string, voto: TipoVoto) => Promise<{ success: boolean; error?: Error }>;
}

// ============================================
// HOOK
// ============================================
export function useAssembleias({ condominioId, userId, unidadeId }: UseAssembleiasOptions): UseAssembleiasReturn {
  const supabase = getSupabaseClient();

  const [assembleias, setAssembleias] = useState<AssembleiaComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssembleias = useCallback(async () => {
    if (!condominioId) {
      setLoading(false);
      return;
    }

    try {
      // Buscar assembleias
      const { data: assembleiasData, error: assError } = await supabase
        .from('assembleias')
        .select('*')
        .eq('condominio_id', condominioId)
        .in('status', ['agendada', 'convocada', 'em_andamento', 'encerrada'])
        .order('data_primeira', { ascending: false })
        .limit(20);

      if (assError) throw assError;

      // Para cada assembleia, buscar pautas e votos
      const assembleiasComDetalhes: AssembleiaComDetalhes[] = await Promise.all(
        (assembleiasData || []).map(async (ass: any) => {
          // Buscar pautas
          const { data: pautasData } = await supabase
            .from('pautas')
            .select('*')
            .eq('assembleia_id', ass.id)
            .order('ordem');

          // Buscar meus votos
          let meusVotos: Record<string, TipoVoto> = {};
          if (unidadeId) {
            const { data: votosData } = await supabase
              .from('votos')
              .select('pauta_id, voto')
              .eq('unidade_id', unidadeId);

            meusVotos = (votosData || []).reduce((acc, v: any) => {
              acc[v.pauta_id] = v.voto as TipoVoto;
              return acc;
            }, {} as Record<string, TipoVoto>);
          }

          // Buscar presença
          let minhaPresenca: 'confirmada' | 'pendente' | 'ausente' = 'pendente';
          if (userId) {
            const { data: presencaData } = await supabase
              .from('assembleias_presencas')
              .select('status')
              .eq('assembleia_id', ass.id)
              .eq('usuario_id', userId)
              .single();

            if (presencaData) {
              minhaPresenca = (presencaData as any).status === 'confirmada' ? 'confirmada' : 'ausente';
            }
          }

          // Contar presentes
          const { count: totalPresentes } = await supabase
            .from('assembleias_presencas')
            .select('*', { count: 'exact', head: true })
            .eq('assembleia_id', ass.id)
            .eq('status', 'confirmada');

          const pautas: Pauta[] = (pautasData || []).map((p) => ({
            id: p.id,
            titulo: p.titulo,
            descricao: p.descricao,
            ordem: p.ordem,
            requires_quorum: p.requires_quorum,
            quorum_especial: p.quorum_especial,
            resultado: p.resultado as Pauta['resultado'],
            meu_voto: meusVotos[p.id] || null,
          }));

          return {
            ...ass,
            pautas,
            total_presentes: totalPresentes || 0,
            minha_presenca: minhaPresenca,
          };
        })
      );

      setAssembleias(assembleiasComDetalhes);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [condominioId, userId, unidadeId, supabase]);

  useEffect(() => {
    fetchAssembleias();
  }, [fetchAssembleias]);

  // Realtime para votos durante assembleia em andamento
  useEffect(() => {
    if (!condominioId) return;

    const emAndamento = assembleias.find((a) => a.status === 'em_andamento');
    if (!emAndamento) return;

    const channel = supabase
      .channel('votos-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votos',
        },
        () => {
          fetchAssembleias();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [condominioId, assembleias, supabase, fetchAssembleias]);

  const confirmarPresenca = async (assembleiaId: string) => {
    if (!userId || !unidadeId) {
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      const { error } = await supabase
        .from('assembleias_presencas')
        .upsert({
          assembleia_id: assembleiaId,
          usuario_id: userId,
          unidade_id: unidadeId,
          status: 'confirmada',
          confirmado_em: new Date().toISOString(),
        });

      if (error) throw error;

      await fetchAssembleias();
      return { success: true };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  const registrarVoto = async (pautaId: string, voto: TipoVoto) => {
    if (!userId || !unidadeId) {
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      // Usar RPC para validações de quorum etc
      const { data, error } = await supabase.rpc('registrar_voto', {
        p_pauta_id: pautaId,
        p_unidade_id: unidadeId,
        p_usuario_id: userId,
        p_voto: voto,
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || 'Erro ao registrar voto');

      await fetchAssembleias();
      return { success: true };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  const proxima = assembleias.find(
    (a) => a.status === 'agendada' || a.status === 'convocada' || a.status === 'em_andamento'
  ) || null;

  return {
    assembleias,
    proxima,
    loading,
    error,
    refresh: fetchAssembleias,
    confirmarPresenca,
    registrarVoto,
  };
}
