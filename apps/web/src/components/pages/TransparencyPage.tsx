'use client';

interface TransparencyPageProps {
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function TransparencyPage({ onScroll }: TransparencyPageProps) {
  return (
    <div
      className="flex-1 overflow-y-auto hide-scroll pb-32 pt-6 relative z-0 px-6 animate-slide-up space-y-6"
      onScroll={onScroll}
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white font-display mb-1">
          Transparência Financeira
        </h2>
        <p className="text-sm text-text-sub">Acompanhe as finanças do condomínio</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary to-splash-primary rounded-2xl p-5 text-white shadow-lg">
        <p className="text-xs opacity-80 mb-1">Saldo Disponível</p>
        <h3 className="text-3xl font-bold font-display">R$ 45.230,00</h3>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xs opacity-70">Receita Mês</p>
            <p className="text-lg font-bold">R$ 12.500</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Despesas</p>
            <p className="text-lg font-bold">R$ 8.200</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <span className="material-symbols-outlined text-accent-green text-2xl mb-1">trending_up</span>
          <p className="text-lg font-bold text-gray-800 dark:text-white">92%</p>
          <p className="text-[10px] text-text-sub">Adimplência</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <span className="material-symbols-outlined text-accent-blue text-2xl mb-1">savings</span>
          <p className="text-lg font-bold text-gray-800 dark:text-white">R$ 15k</p>
          <p className="text-[10px] text-text-sub">Fundo Reserva</p>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <span className="material-symbols-outlined text-accent-purple text-2xl mb-1">receipt_long</span>
          <p className="text-lg font-bold text-gray-800 dark:text-white">24</p>
          <p className="text-[10px] text-text-sub">Transações</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white font-display mb-4">
          Últimas Movimentações
        </h3>
        <div className="space-y-3">
          {[
            { icon: 'arrow_downward', title: 'Taxa Condominial', value: '+R$ 8.500', color: 'text-green-500 bg-green-50', date: '15/12' },
            { icon: 'arrow_upward', title: 'Manutenção Elevador', value: '-R$ 1.200', color: 'text-red-500 bg-red-50', date: '14/12' },
            { icon: 'arrow_downward', title: 'Multa - Apto 302', value: '+R$ 150', color: 'text-green-500 bg-green-50', date: '12/12' },
            { icon: 'arrow_upward', title: 'Conta de Água', value: '-R$ 890', color: 'text-red-500 bg-red-50', date: '10/12' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-text-sub">{item.date}</p>
                </div>
              </div>
              <span className={`font-bold ${item.value.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Download Reports */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
        <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-3">Relatórios</h4>
        <div className="flex gap-2">
          <button className="flex-1 bg-white dark:bg-card-dark py-2 px-3 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">download</span>
            Balancete
          </button>
          <button className="flex-1 bg-white dark:bg-card-dark py-2 px-3 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">download</span>
            Prestação
          </button>
        </div>
      </div>
    </div>
  );
}
