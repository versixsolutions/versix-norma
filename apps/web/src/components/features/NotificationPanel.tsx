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

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute top-16 right-4 z-50 w-80 bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slide-down">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-white">Notificações</h3>
          <button className="text-xs text-secondary font-bold hover:underline">
            Marcar todas como lidas
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full ${notif.color} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-xl">{notif.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-gray-800 dark:text-white truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-xs text-text-sub dark:text-text-sub-dark mt-0.5">
                    {notif.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
          <button className="w-full py-2 text-xs font-bold text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            Ver todas as notificações
          </button>
        </div>
      </div>
    </>
  );
}
