"use client";

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline - Norma',
  description: 'Você está offline',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-splash-primary text-white p-6">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="text-7xl mb-6 animate-pulse">📡</div>
        
        {/* Title */}
        <h1 className="text-3xl font-display font-bold mb-4">
          Você está offline
        </h1>
        
        {/* Description */}
        <p className="text-lg text-blue-200 mb-8 leading-relaxed">
          Parece que sua conexão com a internet foi interrompida. 
          Algumas funcionalidades podem estar temporariamente indisponíveis.
        </p>
        
        {/* What's available */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-blue-200">
            O que você pode fazer:
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                ✓
              </span>
              Ver dados em cache
            </li>
            <li className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                ✓
              </span>
              Consultar documentos salvos
            </li>
            <li className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                ⏳
              </span>
              Criar chamados (sincroniza depois)
            </li>
          </ul>
        </div>
        
        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-secondary text-white font-bold rounded-xl shadow-lg hover:bg-secondary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">refresh</span>
          Tentar novamente
        </button>
        
        {/* Go home */}
        <a
          href="/home"
          className="block mt-4 text-sm text-blue-200 hover:text-white transition-colors"
        >
          Voltar para o início
        </a>
      </div>
    </div>
  );
}
