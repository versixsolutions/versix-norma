
import { logger } from '@/lib/logger';
// ============================================
// VERSIX NORMA - PWA UTILITIES
// Sprint 9: Service Worker, Install Prompt, Online Status
// ============================================

import { useCallback, useEffect, useState } from 'react';

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker não suportado');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    // Verificar atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Nova versão disponível - dispatch evento customizado
          window.dispatchEvent(new CustomEvent('sw-update-available', { detail: registration }));
        }
      });
    });

    // Registrar periodic sync para dados críticos
    if ('periodicSync' in registration) {
      try {
        await (registration as any).periodicSync.register('update-critical-data', {
          minInterval: 12 * 60 * 60 * 1000 // 12 horas
        });
      } catch {
        logger.log('Periodic sync não disponível');
      }
    }

    logger.log('Service Worker registrado com sucesso');
    return registration;
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
    return null;
  }
}

// Forçar atualização do SW
export function updateServiceWorker(registration: ServiceWorkerRegistration): void {
  registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
}

// ============================================
// HOOK: useOnlineStatus
// ============================================
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ============================================
// HOOK: useInstallPrompt
// ============================================
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Detectar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Capturar evento de install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar instalação bem-sucedida
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    isIOS,
    promptInstall
  };
}

// ============================================
// HOOK: useServiceWorkerUpdate
// ============================================
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent<ServiceWorkerRegistration>) => {
      setUpdateAvailable(true);
      setRegistration(e.detail);
    };

    window.addEventListener('sw-update-available', handler as EventListener);

    return () => {
      window.removeEventListener('sw-update-available', handler as EventListener);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (registration) {
      updateServiceWorker(registration);
    }
  }, [registration]);

  return { updateAvailable, applyUpdate };
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications não suportadas');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export async function subscribeToPush(registration: ServiceWorkerRegistration, vapidPublicKey: string): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
    });
    return subscription;
  } catch (error) {
    console.error('Erro ao assinar push:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ============================================
// STORAGE ESTIMATE
// ============================================
export async function getStorageEstimate(): Promise<{ used: number; quota: number; percent: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percent = quota > 0 ? Math.round((used / quota) * 100) : 0;
    return { used, quota, percent };
  }
  return { used: 0, quota: 0, percent: 0 };
}

// ============================================
// NETWORK INFORMATION
// ============================================
export function getNetworkInfo(): { effectiveType: string; downlink: number; rtt: number; saveData: boolean } {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (connection) {
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false
    };
  }

  return { effectiveType: 'unknown', downlink: 0, rtt: 0, saveData: false };
}

// ============================================
// BACKGROUND SYNC REQUEST
// ============================================
export async function requestBackgroundSync(tag: string): Promise<boolean> {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
