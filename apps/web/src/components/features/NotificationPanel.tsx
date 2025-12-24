'use client';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: 1,
    type: 'payment',
    icon: 'check_circle',
    color: 'text-green-500 bg-green-50',
    title: 'Boleto Pago',
    desc: 'Pagamento de Dezembro confirmado.',
    time: '2 min',
  },
  {
    id: 2,
    type: 'assembly',
    icon: 'groups',
    color: 'text-blue-500 bg-blue-50',
    title: 'Assembleia Confirmada',
    desc: 'Sua presença foi registrada.',
    time: '1h',
  },
  {
    id: 3,
    type: 'maintenance',
    icon: 'engineering',
    color: 'text-orange-500 bg-orange-50',
    title: 'Manutenção Programada',
    desc: 'Elevador do Bloco B amanhã.',
    time: '3h',
  },
];

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-4 top-16 z-50 w-80 animate-slide-down overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-card-dark">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">Notificações</h3>
          <button className="text-xs font-bold text-secondary hover:underline">
            Marcar todas como lidas
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="cursor-pointer border-b border-gray-50 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
            >
              <div className="flex gap-3">
                <div
                  className={`h-10 w-10 rounded-full ${notif.color} flex shrink-0 items-center justify-center`}
                >
                  <span className="material-symbols-outlined text-xl">{notif.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="truncate text-sm font-bold text-gray-800 dark:text-white">
                      {notif.title}
                    </h4>
                    <span className="ml-2 shrink-0 text-[10px] text-gray-400">{notif.time}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-sub dark:text-text-sub-dark">
                    {notif.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-3 dark:border-gray-700">
          <button className="w-full rounded-lg py-2 text-xs font-bold text-primary transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            Ver todas as notificações
          </button>
        </div>
      </div>
    </>
  );
}
