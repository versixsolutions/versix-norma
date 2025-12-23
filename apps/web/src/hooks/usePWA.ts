// ============================================================
// VERSIX NORMA - PWA HOOKS
// Gerenciamento de instalação, atualização e status do PWA
// ============================================================

import { useState, useEffect, useCallback } from 'react';

// ============================================
// TYPES
// ============================================
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  displayMode: 'browser' | 'standalone' | 'fullscreen' | 'minimal-ui';
}

// ============================================
// usePWAInstall
// ============================================
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInApp = (navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInApp);
    };
    
    checkInstalled();

    // Listener para prompt de instalação
    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      return false;
    }
  }, [installPrompt]);

  return {
    isInstallable,
    isInstalled,
    install,
  };
}

// ============================================
// useOnlineStatus
// ============================================
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

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
// useServiceWorker
// ============================================
export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker não suportado');
      return;
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        setRegistration(reg);
        setIsRegistered(true);

        // Verificar por atualizações
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true);
            }
          });
        });

        // Verificar atualizações periodicamente
        setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000); // 1 hora

      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    };

    registerSW();
  }, []);

  const update = useCallback(async () => {
    if (!registration?.waiting) return;

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Recarregar quando o novo SW assumir
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, [registration]);

  const checkForUpdates = useCallback(async () => {
    if (registration) {
      await registration.update();
    }
  }, [registration]);

  return {
    isRegistered,
    isUpdateAvailable,
    update,
    checkForUpdates,
    registration,
  };
}

// ============================================
// usePWAStatus
// ============================================
export function usePWAStatus(): PWAStatus {
  const { isInstallable, isInstalled } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const { isUpdateAvailable } = useServiceWorker();

  const [displayMode, setDisplayMode] = useState<PWAStatus['displayMode']>('browser');

  useEffect(() => {
    const getDisplayMode = (): PWAStatus['displayMode'] => {
      if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
      if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
      if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
      return 'browser';
    };

    setDisplayMode(getDisplayMode());

    const handleChange = () => setDisplayMode(getDisplayMode());
    
    const mediaQueries = [
      window.matchMedia('(display-mode: standalone)'),
      window.matchMedia('(display-mode: fullscreen)'),
      window.matchMedia('(display-mode: minimal-ui)'),
    ];

    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange));
    };
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    displayMode,
  };
}

// ============================================
// useBackgroundSync
// ============================================
export function useBackgroundSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const requestSync = useCallback(async (tag: string) => {
    if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
      console.warn('Background Sync não suportado');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      setIsSyncing(true);
      return true;
    } catch (error) {
      console.error('Erro ao registrar sync:', error);
      return false;
    }
  }, []);

  const syncCriticalData = useCallback(() => {
    return requestSync('sync-critical-data');
  }, [requestSync]);

  const syncOfflineActions = useCallback(() => {
    return requestSync('sync-offline-actions');
  }, [requestSync]);

  useEffect(() => {
    // Listener para quando sync completar
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        setIsSyncing(false);
        setLastSync(new Date());
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
    isSyncing,
    lastSync,
    syncCriticalData,
    syncOfflineActions,
    requestSync,
  };
}

// ============================================
// usePeriodicSync
// ============================================
export function usePeriodicSync() {
  const [isSupported, setIsSupported] = useState(false);
  const [registeredTags, setRegisteredTags] = useState<string[]>([]);

  useEffect(() => {
    const checkSupport = async () => {
      if ('periodicSync' in ServiceWorkerRegistration.prototype) {
        setIsSupported(true);
        
        // Verificar tags registradas
        const registration = await navigator.serviceWorker.ready;
        const tags = await (registration as any).periodicSync.getTags();
        setRegisteredTags(tags);
      }
    };

    checkSupport();
  }, []);

  const register = useCallback(async (tag: string, minIntervalMs: number) => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Verificar permissão
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as PermissionName,
      });

      if (status.state === 'granted') {
        await (registration as any).periodicSync.register(tag, {
          minInterval: minIntervalMs,
        });
        
        setRegisteredTags(prev => [...prev, tag]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao registrar periodic sync:', error);
      return false;
    }
  }, [isSupported]);

  const unregister = useCallback(async (tag: string) => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).periodicSync.unregister(tag);
      setRegisteredTags(prev => prev.filter(t => t !== tag));
    } catch (error) {
      console.error('Erro ao desregistrar periodic sync:', error);
    }
  }, [isSupported]);

  return {
    isSupported,
    registeredTags,
    register,
    unregister,
  };
}

// ============================================
// useDisplayMode
// ============================================
export function useDisplayMode() {
  const [displayMode, setDisplayMode] = useState<'browser' | 'standalone' | 'pwa'>('browser');

  useEffect(() => {
    const checkDisplayMode = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setDisplayMode('standalone');
      } else if ((navigator as any).standalone === true) {
        // iOS Safari
        setDisplayMode('pwa');
      } else {
        setDisplayMode('browser');
      }
    };

    checkDisplayMode();

    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkDisplayMode);

    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkDisplayMode);
    };
  }, []);

  return displayMode;
}
