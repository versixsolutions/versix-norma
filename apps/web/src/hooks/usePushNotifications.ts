// ============================================================
// VERSIX NORMA - PUSH NOTIFICATIONS HOOK
// Gerenciamento de permissões e registro de push
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================
export type NotificationPermission = 'default' | 'granted' | 'denied';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// VAPID KEY (Firebase ou Web Push)
// ============================================
// Em produção, use variável de ambiente
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// ============================================
// HELPERS
// ============================================
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ============================================
// usePushNotifications
// ============================================
export function usePushNotifications() {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    subscription: null,
    isLoading: true,
    error: null,
  });

  // Verificar suporte e status inicial
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 
        'serviceWorker' in navigator && 
        'PushManager' in window &&
        'Notification' in window;

      if (!isSupported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
        }));
        return;
      }

      const permission = Notification.permission as NotificationPermission;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        setState({
          isSupported: true,
          isSubscribed: !!subscription,
          permission,
          subscription,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSupported: true,
          isLoading: false,
          error: 'Erro ao verificar status de notificações',
        }));
      }
    };

    checkSupport();
  }, []);

  // Solicitar permissão
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission: permission as NotificationPermission,
      }));

      return permission === 'granted';
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao solicitar permissão',
      }));
      return false;
    }
  }, [state.isSupported]);

  // Inscrever para push
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Verificar permissão primeiro
      if (Notification.permission === 'default') {
        const granted = await requestPermission();
        if (!granted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Permissão negada',
          }));
          return false;
        }
      }

      if (Notification.permission === 'denied') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Notificações bloqueadas. Habilite nas configurações do navegador.',
        }));
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Salvar no backend
      await saveSubscription(subscription);

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao ativar notificações',
      }));
      return false;
    }
  }, [state.isSupported, requestPermission]);

  // Cancelar inscrição
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) return true;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Cancelar no push manager
      await state.subscription.unsubscribe();

      // Remover do backend
      await removeSubscription(state.subscription);

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao desativar notificações',
      }));
      return false;
    }
  }, [state.subscription]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

// ============================================
// BACKEND FUNCTIONS
// ============================================
async function saveSubscription(subscription: PushSubscription): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const subscriptionData = subscription.toJSON();

  // Salvar no banco via RPC
  const { error } = await supabase.rpc('registrar_push_token', {
    p_usuario_id: user.id,
    p_token: JSON.stringify(subscriptionData),
    p_device_type: getDeviceType(),
    p_device_name: getDeviceName(),
  });

  if (error) throw error;
}

async function removeSubscription(subscription: PushSubscription): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const subscriptionData = subscription.toJSON();

  // Remover do banco
  await supabase
    .from('usuarios_canais_preferencias')
    .update({
      push_tokens: supabase.rpc('array_remove_element', {
        arr: 'push_tokens',
        element: JSON.stringify(subscriptionData)
      })
    })
    .eq('usuario_id', user.id);
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'macos';
  if (/Linux/.test(ua)) return 'linux';
  return 'unknown';
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  
  // Tentar extrair nome do dispositivo
  const match = ua.match(/\(([^)]+)\)/);
  if (match) {
    return match[1].split(';')[0].trim();
  }
  
  return navigator.platform || 'Unknown Device';
}

// ============================================
// useNotificationPermission
// ============================================
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  const request = useCallback(async () => {
    if (!('Notification' in window)) return 'denied' as NotificationPermission;

    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermission);
    return result as NotificationPermission;
  }, []);

  return { permission, request };
}

// ============================================
// useLocalNotifications
// ============================================
export function useLocalNotifications() {
  const { permission, request } = useNotificationPermission();

  const show = useCallback(async (
    title: string,
    options?: NotificationOptions
  ) => {
    if (permission === 'default') {
      const result = await request();
      if (result !== 'granted') return null;
    }

    if (permission === 'denied') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });
      return true;
    } catch {
      // Fallback para Notification API
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options,
      });
      return notification;
    }
  }, [permission, request]);

  return { show, permission };
}
