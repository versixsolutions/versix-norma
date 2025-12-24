'use client';

export default function FinancialPulse() {
  return (
    <div className="animation-delay-100 animate-slide-up px-6">
      <div className="group relative w-full cursor-pointer overflow-hidden rounded-home-xl border border-brand-success/20 bg-gradient-to-r from-accent-green/10 to-emerald-500/10 p-5 shadow-sm transition-transform active:scale-[0.98] dark:from-green-900/20 dark:to-emerald-900/20">
        {/* Decorative */}
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-success/10 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-success">
                Saúde Financeira
              </span>
            </div>
            <h3 className="font-display text-lg font-bold leading-tight text-gray-800 dark:text-white">
              Contas em Dia
            </h3>
            <p className="mt-1 text-xs text-text-sub dark:text-text-sub-dark">
              Última auditoria GRC:{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">15/12/2025</span>
            </p>
          </div>
          <div className="text-right">
            <div className="mb-1 inline-flex items-center justify-center rounded-xl bg-white/50 p-2 shadow-sm backdrop-blur-sm dark:bg-white/10">
              <span className="material-symbols-outlined text-2xl text-brand-success">
                verified_user
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-brand-success/10 pt-3">
          <div className="flex items-center gap-1 text-xs text-text-sub dark:text-text-sub-dark">
            <span className="material-symbols-outlined text-base">account_balance_wallet</span>
            Fundo Reserva: OK
          </div>
          <span className="flex items-center text-xs font-bold uppercase tracking-wide text-secondary transition-transform group-hover:translate-x-1">
            Ver Balancete
            <span className="material-symbols-outlined ml-0.5 text-sm">arrow_forward</span>
          </span>
        </div>
      </div>
    </div>
  );
}
