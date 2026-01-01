'use client';

import { getErrorMessage } from '@/lib/errors';
import { getSupabaseClient } from '@/lib/supabase';
import { Database } from '@versix/shared';
import { useCallback, useState } from 'react';

// Tipos do banco
type UsuarioCanaisPreferencias =
  Database['public']['Tables']['usuarios_canais_preferencias']['Row'];
type NotificacoesConfig = Database['public']['Tables']['notificacoes_config']['Row'];

interface UpdatePreferenciasInput {
  push_habilitado?: boolean;
  email_habilitado?: boolean;
  whatsapp_habilitado?: boolean;
  sms_habilitado?: boolean;
  voz_habilitado?: boolean;
  in_app_habilitado?: boolean;
  receber_comunicados?: boolean;
  receber_avisos?: boolean;
  receber_cobrancas?: boolean;
  receber_chamados?: boolean;
  receber_ocorrencias?: boolean;
  receber_assembleias?: boolean;
  receber_alertas?: boolean;
  receber_emergencias?: boolean;
  receber_lembretes?: boolean;
  horario_inicio_preferido?: string;
  horario_fim_preferido?: string;
}

interface UpdateNotificacoesConfigInput {
  prioridade_minima?: 'baixa' | 'media' | 'alta';
  agrupar_notificacoes?: boolean;
  silencioso_ate?: string;
}

export function usePreferenciasCanais() {
  const supabase = getSupabaseClient();
  const [preferencias, setPreferencias] = useState<UsuarioCanaisPreferencias | null>(null);
  const [config, setConfig] = useState<NotificacoesConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar preferências do usuário
  const fetchMinhasPreferencias =
    useCallback(async (): Promise<UsuarioCanaisPreferencias | null> => {
      setLoading(true);
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) return null;

        const { data, error: fetchError } = await supabase
          .from('usuarios_canais_preferencias')
          .select('*')
          .eq('usuario_id', userId)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // Não existe, criar padrão
          const { data: newData, error: insertError } = await supabase
            .from('usuarios_canais_preferencias')
            .insert({ usuario_id: userId })
            .select()
            .single();
          if (insertError) throw insertError;
          setPreferencias(newData);
          return newData;
        }
        if (fetchError) throw fetchError;
        setPreferencias(data);
        return data;
      } catch (err) {
        setError(getErrorMessage(err));
        return null;
      } finally {
        setLoading(false);
      }
    }, [supabase]);

  // Atualizar preferências
  const updatePreferencias = useCallback(
    async (input: UpdatePreferenciasInput): Promise<boolean> => {
      setLoading(true);
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const { data, error: updateError } = await supabase
          .from('usuarios_canais_preferencias')
          .update(input)
          .eq('usuario_id', userId)
          .select()
          .single();
        if (updateError) throw updateError;
        setPreferencias(data);
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Registrar FCM token
  const registrarFcmToken = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const { data, error: rpcError } = await supabase.rpc('registrar_fcm_token', {
          p_usuario_id: userId,
          p_token: token,
        });
        if (rpcError) throw rpcError;
        return data;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      }
    },
    [supabase]
  );

  // Remover FCM token
  const removerFcmToken = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const { data, error: rpcError } = await supabase.rpc('remover_fcm_token', {
          p_usuario_id: userId,
          p_token: token,
        });
        if (rpcError) throw rpcError;
        return data;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      }
    },
    [supabase]
  );

  // Buscar config do condomínio (síndico)
  const fetchConfigCondominio = useCallback(
    async (condominioId: string): Promise<NotificacoesConfig | null> => {
      try {
        const { data, error: fetchError } = await supabase
          .from('notificacoes_config')
          .select('*')
          .eq('condominio_id', condominioId)
          .single();
        if (fetchError) throw fetchError;
        setConfig(data);
        return data;
      } catch (err) {
        setError(getErrorMessage(err));
        return null;
      }
    },
    [supabase]
  );

  // Atualizar config (síndico)
  const updateConfig = useCallback(
    async (condominioId: string, input: UpdateNotificacoesConfigInput): Promise<boolean> => {
      setLoading(true);
      try {
        const { data, error: updateError } = await supabase
          .from('notificacoes_config')
          .update(input)
          .eq('condominio_id', condominioId)
          .select()
          .single();
        if (updateError) throw updateError;
        setConfig(data);
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return {
    preferencias,
    config,
    loading,
    error,
    fetchMinhasPreferencias,
    updatePreferencias,
    registrarFcmToken,
    removerFcmToken,
    fetchConfigCondominio,
    updateConfig,
  };
}

export type {
  NotificacoesConfig,
  UpdateNotificacoesConfigInput,
  UpdatePreferenciasInput,
  UsuarioCanaisPreferencias,
};
