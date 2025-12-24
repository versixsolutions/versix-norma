'use client';

export default function MuralDigital() {
  return (
    <div className="animation-delay-300 animate-slide-up px-6">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between px-1">
        <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white">
          Mural Digital
        </h3>
        <span className="cursor-pointer text-xs font-bold uppercase tracking-wide text-secondary">
          Ver tudo
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {/* Maintenance Card */}
        <div className="rounded-2xl border border-l-4 border-gray-100 border-l-brand-danger bg-white p-5 shadow-sm transition-transform active:scale-[0.99] dark:border-gray-700 dark:bg-card-dark">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-danger">
                Manutenção
              </span>
            </div>
            <span className="text-xs text-text-sub">Hoje, 09:30</span>
          </div>
          <h4 className="mb-2 font-bold text-gray-800 dark:text-white">
            Manutenção Elevador Social
          </h4>
          <p className="mb-3 text-sm leading-relaxed text-text-sub dark:text-gray-400">
            O elevador social do Bloco B estará em manutenção preventiva nesta quinta-feira das 14h
            às 16h.
          </p>
          <div className="flex items-center gap-2 border-t border-gray-50 pt-2 dark:border-gray-700/50">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <span className="material-symbols-outlined text-xs text-text-sub">engineering</span>
            </div>
            <span className="text-xs font-medium text-text-sub">Síndico Geral</span>
          </div>
        </div>

        {/* Social Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform active:scale-[0.99] dark:border-gray-700 dark:bg-card-dark">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wide text-blue-500">
                Social
              </span>
            </div>
            <span className="text-xs text-text-sub">Ontem</span>
          </div>
          <h4 className="mb-2 font-bold text-gray-800 dark:text-white">
            Assembleia Extraordinária
          </h4>
          <p className="mb-3 text-sm leading-relaxed text-text-sub dark:text-gray-400">
            Convocação para aprovação do rateio da pintura. Dia 20/12 às 19h (Híbrida).
          </p>
          <div className="mt-2 flex gap-3">
            <button className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary/90">
              Confirmar
            </button>
            <button className="flex-1 rounded-lg bg-gray-100 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
              Ler Pauta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
