'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface OfflineFallbackProps {
  message?: string;
}

export function OfflineFallback({ message }: OfflineFallbackProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle className="text-warning mx-auto mb-4 h-12 w-12" />
        <h2 className="mb-2 text-xl font-semibold">Sem conexão</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {message || 'Você está offline. Verifique sua conexão com a internet.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary-foreground rounded-md bg-primary px-4 py-2 text-sm font-medium hover:bg-primary/90"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export function useOnlineStatus() {
  useEffect(() => {
    const handleOnline = () => {
      console.log('Conectado');
      // Opcional: mostrar toast de sucesso
    };

    const handleOffline = () => {
      console.warn('Desconectado');
      // Opcional: mostrar toast de aviso
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}
