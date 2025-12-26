'use client';

import { OfflineIndicator, UpdatePrompt, useServiceWorker } from '@/hooks/useServiceWorker';
import { useEffect, useState, type ReactNode } from 'react';

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showResetPrompt, setShowResetPrompt] = useState(false);
  const { clearCache } = useServiceWorker();

  useEffect(() => {
    setMounted(true);

    // Listener para o prompt de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Mostra o prompt após 30 segundos se o usuário não instalou
      setTimeout(() => {
        const hasInstalled = localStorage.getItem('pwa-installed');
        const hasDismissed = localStorage.getItem('pwa-dismissed');

        if (!hasInstalled && !hasDismissed) {
          setShowInstallPrompt(true);
        }
      }, 30000);
    };

    // Listener para instalação bem-sucedida
    const handleAppInstalled = () => {
      console.log('[PWA] App installed');
      localStorage.setItem('pwa-installed', 'true');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Detectar carregamento lento (mais de 10 segundos)
    const loadingTimeout = setTimeout(() => {
      if (!document.readyState || document.readyState === 'loading') {
        console.warn('[PWA] Slow loading detected, offering reset option');
        setShowResetPrompt(true);
      }
    }, 10000);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(loadingTimeout);
    };
  }, []);

  const handleReset = async () => {
    try {
      // Clear service worker cache
      clearCache();

      // Clear local storage (selective)
      const keysToKeep = ['pwa-installed', 'pwa-dismissed'];
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('[PWA] Reset failed:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  const handleDismissReset = () => {
    setShowResetPrompt(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log('[PWA] User choice:', outcome);

    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
    }

    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', 'true');
    setShowInstallPrompt(false);
  };

  if (!mounted) return <>{children}</>;

  return (
    <>
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Update Available Prompt */}
      <UpdatePrompt />

      {/* Reset Prompt for slow loading */}
      {showResetPrompt && (
        <ResetPrompt onReset={handleReset} onDismiss={handleDismissReset} />
      )}

      {/* Install Prompt */}
      {showInstallPrompt && deferredPrompt && (
        <InstallPrompt onInstall={handleInstall} onDismiss={handleDismiss} />
      )}

      {children}
    </>
  );
}

// ============================================
// RESET PROMPT COMPONENT
// ============================================
interface ResetPromptProps {
  onReset: () => void;
  onDismiss: () => void;
}

function ResetPrompt({ onReset, onDismiss }: ResetPromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-3xl">
              warning
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Carregamento lento detectado
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            O aplicativo está demorando para carregar. Isso pode ser causado por dados em cache corrompidos.
            Deseja limpar o cache e reiniciar?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Continuar esperando
            </button>
            <button
              onClick={onReset}
              className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Limpar e reiniciar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// INSTALL PROMPT COMPONENT
// ============================================
interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-splash-primary p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <span className="text-4xl font-display font-bold">N</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Instalar Norma</h3>
              <p className="text-sm text-blue-200">Acesse de forma mais rápida</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">offline_bolt</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-800 dark:text-white">Funciona offline</h4>
              <p className="text-xs text-gray-500">Acesse mesmo sem internet</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">notifications_active</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-800 dark:text-white">Notificações push</h4>
              <p className="text-xs text-gray-500">Receba alertas importantes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">speed</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-800 dark:text-white">Mais rápido</h4>
              <p className="text-xs text-gray-500">Carregamento instantâneo</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Agora não
          </button>
          <button
            onClick={onInstall}
            className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
