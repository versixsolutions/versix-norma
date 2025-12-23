// ============================================================
// VERSIX NORMA - PWA INSTALL PROMPT
// Componente para instalação do PWA
// ============================================================

import { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '@/hooks/usePWA';
import { 
  Download, 
  Smartphone, 
  X, 
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

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
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 
                    bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 
                    dark:border-gray-700 p-4 z-50 animate-slide-up">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Instalar Versix Norma
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Acesse rapidamente direto da sua tela inicial, mesmo offline!
          </p>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                       rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {isInstalling ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Instalar
            </button>
            
            <button
              onClick={() => setIsDismissed(true)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm"
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
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white py-2 px-4 
                    text-center text-sm font-medium z-50 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
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
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-600 dark:text-green-400">Online</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 bg-amber-500 rounded-full" />
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
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 
                    bg-gradient-to-r from-green-500 to-emerald-500 text-white 
                    rounded-xl shadow-2xl p-4 z-50">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 text-white/70 hover:text-white"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white/20 rounded-lg">
          <RefreshCw className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold">Nova versão disponível!</h3>
          <p className="text-sm text-white/80 mt-1">
            Atualize para ter acesso às últimas melhorias.
          </p>
          
          <button
            onClick={onUpdate}
            className="mt-3 px-4 py-2 bg-white text-green-600 rounded-lg 
                     hover:bg-green-50 text-sm font-medium"
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
  const isStandalone = (navigator as any).standalone === true;

  if (!isIOS || isStandalone) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 
                   rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <Download className="w-4 h-4" />
        Instalar App
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-md p-6 
                          animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Instalar no iPhone/iPad
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg 
                              flex items-center justify-center text-blue-600 font-bold">
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
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg 
                              flex items-center justify-center text-blue-600 font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Role e toque em "Adicionar à Tela de Início"
                  </p>
                  <p className="text-sm text-gray-500">
                    Pode estar mais abaixo no menu
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg 
                              flex items-center justify-center text-blue-600 font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Toque em "Adicionar"
                  </p>
                  <p className="text-sm text-gray-500">
                    O app aparecerá na sua tela inicial
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl 
                       font-medium hover:bg-blue-700"
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                    dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Status do App
      </h3>

      <div className="space-y-3">
        {/* Instalação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Instalado
            </span>
          </div>
          {isInstalled ? (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Sim
            </span>
          ) : isInstallable ? (
            <button
              onClick={install}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              Instalar
            </button>
          ) : (
            <span className="text-gray-400 text-sm">Não disponível</span>
          )}
        </div>

        {/* Conexão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-gray-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Conexão
            </span>
          </div>
          <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-amber-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Notificações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 text-center">🔔</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Notificações
            </span>
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
