// ============================================================
// VERSIX NORMA - PWA INSTALL PROMPT
// Componente para instalação do PWA
// ============================================================

import { CheckCircle, Download, RefreshCw, Smartphone, Wifi, WifiOff, X } from 'lucide-react';
import { useState } from 'react';
import { useOnlineStatus, usePWAInstall } from '../../hooks/usePWA';

// ============================================
// PWA Install Banner
// ============================================
export function PWAInstallBanner() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await install();
    setIsInstalling(false);

    if (!success) {
      // Mostrar instruções manuais
    }
  };

  return (
    <div className="animate-slide-up fixed bottom-20 left-4 right-4 z-50 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl md:left-auto md:right-4 md:w-96 dark:border-gray-700 dark:bg-gray-800">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
          <Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">Instalar Versix Norma</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Acesse rapidamente direto da sua tela inicial, mesmo offline!
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isInstalling ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Instalar
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Offline Indicator
// ============================================
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
      <WifiOff className="h-4 w-4" />
      <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
    </div>
  );
}

// ============================================
// Online Status Badge
// ============================================
export function OnlineStatusBadge({ className = '' }: { className?: string }) {
  const isOnline = useOnlineStatus();

  return (
    <div className={`flex items-center gap-1.5 text-sm ${className}`}>
      {isOnline ? (
        <>
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-green-600 dark:text-green-400">Online</span>
        </>
      ) : (
        <>
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-amber-600 dark:text-amber-400">Offline</span>
        </>
      )}
    </div>
  );
}

// ============================================
// Update Available Banner
// ============================================
interface UpdateBannerProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateAvailableBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white shadow-2xl md:left-auto md:right-4 md:w-96">
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 p-1 text-white/70 hover:text-white"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-white/20 p-2">
          <RefreshCw className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">Nova versão disponível!</h3>
          <p className="mt-1 text-sm text-white/80">
            Atualize para ter acesso às últimas melhorias.
          </p>

          <button
            onClick={onUpdate}
            className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
          >
            Atualizar agora
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// iOS Install Instructions
// ============================================
export function IOSInstallInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  // Detectar iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;

  if (!isIOS || isStandalone) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <Download className="h-4 w-4" />
        Instalar App
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="animate-slide-up w-full max-w-md rounded-t-2xl bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Instalar no iPhone/iPad
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-600 dark:bg-blue-900/30">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Toque no botão Compartilhar
                  </p>
                  <p className="text-sm text-gray-500">
                    O ícone de quadrado com seta para cima na barra inferior
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-600 dark:bg-blue-900/30">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Role e toque em &quot;Adicionar à Tela de Início&quot;
                  </p>
                  <p className="text-sm text-gray-500">Pode estar mais abaixo no menu</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-600 dark:bg-blue-900/30">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Toque em &quot;Adicionar&quot;
                  </p>
                  <p className="text-sm text-gray-500">O app aparecerá na sua tela inicial</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// PWA Status Card (para settings)
// ============================================
export function PWAStatusCard() {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Status do App</h3>

      <div className="space-y-3">
        {/* Instalação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Instalado</span>
          </div>
          {isInstalled ? (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Sim
            </span>
          ) : isInstallable ? (
            <button
              onClick={install}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Instalar
            </button>
          ) : (
            <span className="text-sm text-gray-400">Não disponível</span>
          )}
        </div>

        {/* Conexão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-gray-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">Conexão</span>
          </div>
          <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-amber-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Notificações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 text-center">🔔</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Notificações</span>
          </div>
          <span className="text-sm">
            {typeof Notification !== 'undefined' && Notification.permission === 'granted' ? (
              <span className="text-green-600">Ativas</span>
            ) : typeof Notification !== 'undefined' && Notification.permission === 'denied' ? (
              <span className="text-red-600">Bloqueadas</span>
            ) : (
              <span className="text-gray-400">Não configuradas</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
