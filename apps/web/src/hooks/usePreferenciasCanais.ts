'use client';

import { getSupabaseClient } from '@/lib/supabase';
import { useCallback, useState } from 'react';
import type { UsuarioCanaisPreferencias, UpdatePreferenciasInput, NotificacoesConfig, UpdateNotificacoesConfigInput } from '@versix/shared/types/comunicacao';

export function usePreferenciasCanais() {
  const supabase = getSupabaseClient();
  const [preferencias, setPreferencias] = useState<UsuarioCanaisPreferencias | null>(null);
  const [config, setConfig] = useState<NotificacoesConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar preferências do usuário
  const fetchMinhasPreferencias = useCallback(async (): Promise<UsuarioCanaisPreferencias | null> => {
    setLoading(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return null;

      const { data, error: fetchError } = await supabase.from('usuarios_canais_preferencias').select('*').eq('usuario_id', userId).single();
      
      if (fetchError && fetchError.code === 'PGRST116') {
        // Não existe, criar padrão
        const { data: newData, error: insertError } = await supabase.from('usuarios_canais_preferencias').insert({ usuario_id: userId }).select().single();
        if (insertError) throw insertError;
        setPreferencias(newData);
        return newData;
      }
      if (fetchError) throw fetchError;
      setPreferencias(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Atualizar preferências
  const updatePreferencias = useCallback(async (input: UpdatePreferenciasInput): Promise<boolean> => {
    setLoading(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error: updateError } = await supabase.from('usuarios_canais_preferencias').update(input).eq('usuario_id', userId).select().single();
      if (updateError) throw updateError;
      setPreferencias(data);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Registrar FCM token
  const registrarFcmToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error: rpcError } = await supabase.rpc('registrar_fcm_token', { p_usuario_id: userId, p_token: token });
      if (rpcError) throw rpcError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [supabase]);

  // Remover FCM token
  const removerFcmToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error: rpcError } = await supabase.rpc('remover_fcm_token', { p_usuario_id: userId, p_token: token });
      if (rpcError) throw rpcError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [supabase]);

  // Buscar config do condomínio (síndico)
  const fetchConfigCondominio = useCallback(async (condominioId: string): Promise<NotificacoesConfig | null> => {
    try {
      const { data, error: fetchError } = await supabase.from('notificacoes_config').select('*').eq('condominio_id', condominioId).single();
      if (fetchError) throw fetchError;
      setConfig(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [supabase]);

  // Atualizar config (síndico)
  const updateConfig = useCallback(async (condominioId: string, input: UpdateNotificacoesConfigInput): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error: updateError } = await supabase.from('notificacoes_config').update(input).eq('condominio_id', condominioId).select().single();
      if (updateError) throw updateError;
      setConfig(data);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    preferencias, config, loading, error,
    fetchMinhasPreferencias, updatePreferencias,
    registrarFcmToken, removerFcmToken,
    fetchConfigCondominio, updateConfig
  };
}

export type { UsuarioCanaisPreferencias, UpdatePreferenciasInput, NotificacoesConfig, UpdateNotificacoesConfigInput };
