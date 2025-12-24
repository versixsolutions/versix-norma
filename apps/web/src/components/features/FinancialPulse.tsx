'use client';

export function FinancialPulse() {
  return (
    <div className="px-6 animate-slide-up animation-delay-100">
      <div className="w-full bg-gradient-to-r from-accent-green/10 to-emerald-500/10 dark:from-green-900/20 dark:to-emerald-900/20 rounded-home-xl shadow-sm border border-brand-success/20 p-5 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform">
        {/* Decorative */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-success/10 rounded-full blur-2xl" />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-success">
                Saúde Financeira
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight font-display">
              Contas em Dia
            </h3>
            <p className="text-xs text-text-sub dark:text-text-sub-dark mt-1">
              Última auditoria GRC:{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">15/12/2025</span>
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/50 dark:bg-white/10 p-2 rounded-xl inline-flex items-center justify-center mb-1 backdrop-blur-sm shadow-sm">
              <span className="material-symbols-outlined text-brand-success text-2xl">
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
          <span className="text-secondary text-xs font-bold flex items-center group-hover:translate-x-1 transition-transform uppercase tracking-wide">
            Ver Balancete
            <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
          </span>
        </div>
      </div>
    </div>
  );
}
