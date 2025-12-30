'use client';

import { getSupabaseClient } from '@/lib/supabase';
import type { CreateExportacaoInput, Exportacao, ExportacaoFormato, ExportacaoTipo } from '@versix/shared';
import { useCallback, useState } from 'react';

export function useExportacoes() {
  const supabase = getSupabaseClient();
  const [exportacoes, setExportacoes] = useState<Exportacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar exportações
  const fetchExportacoes = useCallback(async (condominioId: string): Promise<Exportacao[]> => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase.from('exportacoes').select('*').eq('condominio_id', condominioId).order('created_at', { ascending: false }).limit(20);
      if (fetchError) throw fetchError;
      setExportacoes(data || []);
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Criar exportação
  const criarExportacao = useCallback(async (condominioId: string, input: CreateExportacaoInput): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('criar_exportacao', {
        p_condominio_id: condominioId,
        p_tipo: input.tipo,
        p_formato: input.formato,
        p_periodo_inicio: input.periodo_inicio || null,
        p_periodo_fim: input.periodo_fim || null,
        p_filtros: input.filtros || null
      });
      if (rpcError) throw rpcError;

      // Recarregar lista
      await fetchExportacoes(condominioId);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchExportacoes]);

  // Verificar status da exportação
  const verificarStatus = useCallback(async (id: string): Promise<Exportacao | null> => {
    try {
      const { data, error: fetchError } = await supabase.from('exportacoes').select('*').eq('id', id).single();
      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    }
  }, [supabase]);

  // Baixar exportação
  const baixarExportacao = useCallback(async (exportacao: Exportacao): Promise<string | null> => {
    if (!exportacao.arquivo_path) return null;

    try {
      const { data, error: downloadError } = await supabase.storage.from('exportacoes').createSignedUrl(exportacao.arquivo_path, 3600);
      if (downloadError) throw downloadError;
      return data.signedUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    }
  }, [supabase]);

  return {
    exportacoes, loading, error,
    fetchExportacoes, criarExportacao, verificarStatus, baixarExportacao
  };
}

export type { CreateExportacaoInput, Exportacao, ExportacaoFormato, ExportacaoTipo };

