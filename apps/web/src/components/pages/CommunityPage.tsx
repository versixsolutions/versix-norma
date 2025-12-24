'use client';

interface CommunityPageProps {
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

const events = [
  {
    id: 1,
    title: 'Assembleia Extraordinária',
    date: '20/12',
    time: '19:00',
    type: 'assembly',
    status: 'Confirmado',
  },
  {
    id: 2,
    title: 'Festa de Natal',
    date: '24/12',
    time: '18:00',
    type: 'social',
    status: 'Pendente',
  },
  {
    id: 3,
    title: 'Reunião do Conselho',
    date: '27/12',
    time: '20:00',
    type: 'meeting',
    status: 'Pendente',
  },
];

const reservations = [
  { id: 1, space: 'Salão de Festas', date: '28/12', time: '14:00 - 22:00', user: 'Apto 501' },
  { id: 2, space: 'Churrasqueira', date: '29/12', time: '12:00 - 18:00', user: 'Apto 302' },
];

export default function CommunityPage({ onScroll }: CommunityPageProps) {
  return (
    <div
      className="hide-scroll relative z-0 flex-1 animate-slide-up space-y-6 overflow-y-auto px-6 pb-32 pt-6"
      onScroll={onScroll}
    >
      {/* Header */}
      <div>
        <h2 className="mb-1 font-display text-xl font-bold text-gray-800 dark:text-white">
          Convivência
        </h2>
        <p className="text-sm text-text-sub">Eventos e reservas do condomínio</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center gap-3 rounded-xl bg-primary p-4 text-white shadow-sm transition active:scale-95">
          <span className="material-symbols-outlined text-2xl">event</span>
          <span className="text-sm font-bold">Nova Reserva</span>
        </button>
        <button className="flex items-center gap-3 rounded-xl bg-secondary p-4 text-white shadow-sm transition active:scale-95">
          <span className="material-symbols-outlined text-2xl">report</span>
          <span className="text-sm font-bold">Ocorrência</span>
        </button>
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="mb-4 font-display text-lg font-bold text-gray-800 dark:text-white">
          Próximos Eventos
        </h3>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-card-dark"
            >
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-primary/10">
                <span className="text-lg font-bold text-primary">{event.date.split('/')[0]}</span>
                <span className="text-[10px] uppercase text-primary/70">Dez</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">{event.title}</h4>
                <p className="mt-0.5 text-xs text-text-sub">
                  {event.time} •{' '}
                  <span
                    className={event.status === 'Confirmado' ? 'text-green-500' : 'text-orange-500'}
                  >
                    {event.status}
                  </span>
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-400">chevron_right</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reservations */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white">
            Reservas da Semana
          </h3>
          <button className="text-xs font-bold uppercase text-secondary">Ver Calendário</button>
        </div>
        <div className="space-y-3">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-card-dark"
            >
              <div className="mb-2 flex items-start justify-between">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">{res.space}</h4>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
                  {res.user}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-sub">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                {res.date}
                <span className="material-symbols-outlined ml-2 text-sm">schedule</span>
                {res.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Rules */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-xl text-amber-600">info</span>
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">
              Horário de Silêncio
            </h4>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              Lembre-se: O horário de silêncio é das 22h às 08h. Colabore com seus vizinhos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
