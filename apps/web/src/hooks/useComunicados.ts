'use client';

import { getSupabaseClient } from '@/lib/supabase';
import type { Comunicado } from '@/types/database';
import { useCallback, useEffect, useState } from 'react';

// ============================================
// TYPES
// ============================================
interface ComunicadoComLeitura extends Comunicado {
  lido: boolean;
  autor_nome?: string;
}

interface UseComunicadosOptions {
  condominioId: string | null;
  userId: string | null;
}

interface UseComunicadosReturn {
  comunicados: ComunicadoComLeitura[];
  naoLidos: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  marcarComoLido: (comunicadoId: string) => Promise<void>;
  marcarTodosComoLidos: () => Promise<void>;
}

// ============================================
// HOOK
// ============================================
export function useComunicados({ condominioId, userId }: UseComunicadosOptions): UseComunicadosReturn {
  const supabase = getSupabaseClient();

  const [comunicados, setComunicados] = useState<ComunicadoComLeitura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComunicados = useCallback(async () => {
    if (!condominioId) {
      setLoading(false);
      return;
    }

    try {
      // Buscar comunicados
      const { data: comunicadosData, error: comError } = await supabase
        .from('comunicados')
        .select(`
          *,
          usuarios:created_by (nome)
        `)
        .eq('condominio_id', condominioId)
        .gte('data_publicacao', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // últimos 90 dias
        .or(`data_expiracao.is.null,data_expiracao.gte.${new Date().toISOString()}`)
        .order('is_fixado', { ascending: false })
        .order('data_publicacao', { ascending: false });

      if (comError) throw comError;

      // Buscar leituras do usuário
      let leituras: string[] = [];
      if (userId) {
        const { data: leiturasData } = await supabase
          .from('comunicados_leituras')
          .select('comunicado_id')
          .eq('usuario_id', userId);

        leituras = leiturasData?.map((l) => l.comunicado_id) || [];
      }

      const comunicadosComLeitura = (comunicadosData || []).map((c: any) => ({
        ...c,
        lido: leituras.includes(c.id),
        autor_nome: c.usuarios?.nome,
      }));

      setComunicados(comunicadosComLeitura);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [condominioId, userId, supabase]);

  useEffect(() => {
    const checkAndFetch = async () => {
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

      fetchComunicados();
    };

    checkAndFetch();
  }, [fetchComunicados, condominioId, supabase]);

  // Realtime subscription
  useEffect(() => {
    if (!condominioId) return;

    const channel = supabase
      .channel('comunicados-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comunicados',
          filter: `condominio_id=eq.${condominioId}`,
        },
        () => {
          fetchComunicados();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [condominioId, supabase, fetchComunicados]);

  const marcarComoLido = async (comunicadoId: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('comunicados_leituras')
        .upsert({
          comunicado_id: comunicadoId,
          usuario_id: userId,
          lido_em: new Date().toISOString(),
        });

      setComunicados((prev) =>
        prev.map((c) =>
          c.id === comunicadoId ? { ...c, lido: true } : c
        )
      );
    } catch (err) {
      console.error('Erro ao marcar como lido:', err);
    }
  };

  const marcarTodosComoLidos = async () => {
    if (!userId) return;

    try {
      const naoLidosIds = comunicados.filter((c) => !c.lido).map((c) => c.id);

      if (naoLidosIds.length === 0) return;

      await supabase
        .from('comunicados_leituras')
        .upsert(
          naoLidosIds.map((id) => ({
            comunicado_id: id,
            usuario_id: userId,
            lido_em: new Date().toISOString(),
          }))
        );

      setComunicados((prev) =>
        prev.map((c) => ({ ...c, lido: true }))
      );
    } catch (err) {
      console.error('Erro ao marcar todos como lidos:', err);
    }
  };

  const naoLidos = comunicados.filter((c) => !c.lido).length;

  return {
    comunicados,
    naoLidos,
    loading,
    error,
    refresh: fetchComunicados,
    marcarComoLido,
    marcarTodosComoLidos,
  };
}
