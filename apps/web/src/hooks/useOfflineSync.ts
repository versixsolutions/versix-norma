'use client';

import {
    cacheNotifications,
    getLastSyncTime,
    getPendingActions,
    incrementActionRetry,
    removePendingAction,
    saveCondominioInfo,
    saveEmergencyContacts,
    saveUserProfile,
    saveVulnerableResidents,
    type CachedCondominioInfo,
    type CachedUserProfile,
    type EmergencyContact,
    type PendingAction,
    type VulnerableResident
} from '@/lib/offline-db';
import { requestBackgroundSync, useOnlineStatus } from '@/lib/pwa';
import { getSupabaseClient } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

const MAX_RETRIES = 5;

export function useOfflineSync() {
  const supabase = getSupabaseClient();
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Atualizar contagem de ações pendentes
  const updatePendingCount = useCallback(async () => {
    const actions = await getPendingActions();
    setPendingCount(actions.length);
  }, []);

  // Sincronizar dados críticos do servidor
  const syncCriticalData = useCallback(async (condominioId: string) => {
    if (!isOnline) return false;
    setSyncing(true);

    try {
      // 1. Buscar telefones de emergência
      const { data: contacts } = await supabase
        .from('telefones_emergencia')
        .select('*')
        .eq('condominio_id', condominioId)
        .order('ordem');

      if (contacts) {
        await saveEmergencyContacts(contacts.map(c => ({
          id: c.id,
          tipo: c.tipo,
          nome: c.nome,
          telefone: c.telefone,
          ordem: c.ordem
        })));
      }

      // 2. Buscar moradores vulneráveis (síndico only)
      const { data: vulnerable } = await supabase
        .from('moradores_vulneraveis')
        .select('*, unidade:unidades_habitacionais(identificador, bloco)')
        .eq('condominio_id', condominioId);

      if (vulnerable) {
        await saveVulnerableResidents(vulnerable.map((v) => ({
          id: v.id,
          nome: v.nome,
          unidade: v.unidade?.identificador || '',
          bloco: v.unidade?.bloco || '',
          tipo: v.tipo,
          observacoes: v.observacoes || '',
          contato_emergencia: v.contato_emergencia
        })));
      }

      // 3. Info do condomínio
      const { data: condo } = await supabase
        .from('condominios')
        .select('id, nome, endereco_completo, telefone_portaria, telefone_sindico')
        .eq('id', condominioId)
        .single();

      if (condo) {
        await saveCondominioInfo({
          id: condo.id,
          nome: condo.nome,
          endereco: condo.endereco_completo || '',
          telefone_portaria: condo.telefone_portaria,
          telefone_sindico: condo.telefone_sindico,
          cached_at: Date.now()
        });
      }

      // 4. Últimas notificações
      const { data: notifs } = await supabase
        .from('v_usuario_notificacoes')
        .select('*')
        .limit(30);

      if (notifs) {
        await cacheNotifications(notifs.map((n) => ({
          id: n.notificacao_id,
          titulo: n.titulo,
          corpo: n.corpo,
          tipo: n.tipo,
          prioridade: n.prioridade,
          created_at: new Date(n.created_at).getTime(),
          lido: n.status === 'lido'
        })));
      }

      setLastSync(new Date());
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar dados críticos:', error);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [supabase, isOnline]);

  // Sincronizar perfil do usuário
  const syncUserProfile = useCallback(async (userId: string) => {
    if (!isOnline) return false;

    try {
      const { data } = await supabase
        .from('usuarios')
        .select('*, unidade:unidades_habitacionais(identificador, bloco)')
        .eq('id', userId)
        .single();

      if (data) {
        await saveUserProfile({
          id: data.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone || '',
          unidade: data.unidade?.identificador || '',
          bloco: data.unidade?.bloco || '',
          role: data.role,
          avatar_url: data.avatar_url,
          cached_at: Date.now()
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao sincronizar perfil:', error);
      return false;
    }
  }, [supabase, isOnline]);

  // Processar ações pendentes (offline queue)
  const processPendingActions = useCallback(async () => {
    if (!isOnline) return { processed: 0, failed: 0 };

    const actions = await getPendingActions();
    let processed = 0;
    let failed = 0;

    for (const action of actions) {
      if (action.retries >= MAX_RETRIES) {
        await removePendingAction(action.id);
        failed++;
        continue;
      }

      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.body)
        });

        if (response.ok) {
          await removePendingAction(action.id);
          processed++;
        } else {
          await incrementActionRetry(action.id);
          failed++;
        }
      } catch {
        await incrementActionRetry(action.id);
        failed++;
      }
    }

    await updatePendingCount();
    return { processed, failed };
  }, [isOnline, updatePendingCount]);

  // Solicitar background sync
  const requestSync = useCallback(async () => {
    const success = await requestBackgroundSync('sync-critical-data');
    if (!success && isOnline) {
      // Fallback: sincronizar diretamente
      // Precisa do condominioId - seria obtido do contexto
    }
    return success;
  }, [isOnline]);

  // Verificar última sincronização
  useEffect(() => {
    getLastSyncTime('emergency-contacts').then(setLastSync);
    updatePendingCount();
  }, [updatePendingCount]);

  // Auto-sync quando voltar online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      processPendingActions();
    }
  }, [isOnline, pendingCount, processPendingActions]);

  return {
    isOnline,
    syncing,
    lastSync,
    pendingCount,
    syncCriticalData,
    syncUserProfile,
    processPendingActions,
    requestSync,
    updatePendingCount
  };
}

export type { CachedCondominioInfo, CachedUserProfile, EmergencyContact, PendingAction, VulnerableResident };

