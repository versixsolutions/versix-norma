'use client';

interface TransparencyPageProps {
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export default function TransparencyPage({ onScroll }: TransparencyPageProps) {
  return (
    <div
      className="hide-scroll relative z-0 flex-1 animate-slide-up space-y-6 overflow-y-auto px-6 pb-32 pt-6"
      onScroll={onScroll}
    >
      {/* Header */}
      <div>
        <h2 className="mb-1 font-display text-xl font-bold text-gray-800 dark:text-white">
          Transparência Financeira
        </h2>
        <p className="text-sm text-text-sub">Acompanhe as finanças do condomínio</p>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-splash-primary p-5 text-white shadow-lg">
        <p className="mb-1 text-xs opacity-80">Saldo Disponível</p>
        <h3 className="font-display text-3xl font-bold">R$ 45.230,00</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
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
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-card-dark">
          <span className="material-symbols-outlined mb-1 text-2xl text-accent-green">
            trending_up
          </span>
          <p className="text-lg font-bold text-gray-800 dark:text-white">92%</p>
          <p className="text-[10px] text-text-sub">Adimplência</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-card-dark">
          <span className="material-symbols-outlined mb-1 text-2xl text-accent-blue">savings</span>
          <p className="text-lg font-bold text-gray-800 dark:text-white">R$ 15k</p>
          <p className="text-[10px] text-text-sub">Fundo Reserva</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-card-dark">
          <span className="material-symbols-outlined mb-1 text-2xl text-accent-purple">
            receipt_long
          </span>
          <p className="text-lg font-bold text-gray-800 dark:text-white">24</p>
          <p className="text-[10px] text-text-sub">Transações</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="mb-4 font-display text-lg font-bold text-gray-800 dark:text-white">
          Últimas Movimentações
        </h3>
        <div className="space-y-3">
          {[
            {
              icon: 'arrow_downward',
              title: 'Taxa Condominial',
              value: '+R$ 8.500',
              color: 'text-green-500 bg-green-50',
              date: '15/12',
            },
            {
              icon: 'arrow_upward',
              title: 'Manutenção Elevador',
              value: '-R$ 1.200',
              color: 'text-red-500 bg-red-50',
              date: '14/12',
            },
            {
              icon: 'arrow_downward',
              title: 'Multa - Apto 302',
              value: '+R$ 150',
              color: 'text-green-500 bg-green-50',
              date: '12/12',
            },
            {
              icon: 'arrow_upward',
              title: 'Conta de Água',
              value: '-R$ 890',
              color: 'text-red-500 bg-red-50',
              date: '10/12',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-card-dark"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full ${item.color} flex items-center justify-center`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-text-sub">{item.date}</p>
                </div>
              </div>
              <span
                className={`font-bold ${item.value.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Download Reports */}
      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
        <h4 className="mb-3 text-sm font-bold text-gray-800 dark:text-white">Relatórios</h4>
        <div className="flex gap-2">
          <button className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-card-dark dark:text-gray-300">
            <span className="material-symbols-outlined text-sm">download</span>
            Balancete
          </button>
          <button className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-card-dark dark:text-gray-300">
            <span className="material-symbols-outlined text-sm">download</span>
            Prestação
          </button>
        </div>
      </div>
    </div>
  );
}
