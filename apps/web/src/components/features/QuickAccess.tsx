'use client';

const quickItems = [
  {
    id: 'assemblies',
    icon: 'groups',
    title: 'Assembleias',
    desc: 'Participe e Vote',
    badge: '1 aberta',
    bgColor: 'bg-blue-50/80 dark:bg-card-dark',
    borderColor: 'border-blue-100 dark:border-gray-700',
    iconBg: 'bg-white dark:bg-blue-900/30',
    iconColor: 'text-blue-500',
    badgeColor: 'bg-blue-100 text-blue-600',
    decorColor: 'bg-blue-200/20',
  },
  {
    id: 'comunicados',
    icon: 'campaign',
    title: 'Comunicados',
    desc: 'Avisos Oficiais',
    badge: '100% lido',
    bgColor: 'bg-accent-orange/10 dark:bg-card-dark',
    borderColor: 'border-orange-100 dark:border-gray-700',
    iconBg: 'bg-white dark:bg-orange-900/30',
    iconColor: 'text-accent-orange',
    badgeColor: 'bg-orange-100 text-orange-600',
    decorColor: 'bg-accent-orange/20',
  },
  {
    id: 'faqs',
    icon: 'quiz',
    title: 'FAQs',
    desc: 'Tire suas Dúvidas',
    badge: '01 novo',
    bgColor: 'bg-accent-green/10 dark:bg-card-dark',
    borderColor: 'border-green-100 dark:border-gray-700',
    iconBg: 'bg-white dark:bg-green-900/30',
    iconColor: 'text-accent-green',
    badgeColor: 'bg-green-100 text-green-600',
    decorColor: 'bg-accent-green/20',
  },
  {
    id: 'bibliotecas',
    icon: 'library_books',
    title: 'Bibliotecas',
    desc: 'Documentos e Atas',
    badge: 'novo doc',
    bgColor: 'bg-accent-purple/10 dark:bg-card-dark',
    borderColor: 'border-purple-100 dark:border-gray-700',
    iconBg: 'bg-white dark:bg-purple-900/30',
    iconColor: 'text-accent-purple',
    badgeColor: 'bg-purple-100 text-purple-600',
    decorColor: 'bg-accent-purple/20',
  },
];

export default function QuickAccess() {
  return (
    <div className="animation-delay-200 animate-slide-up px-6">
      <div className="mb-4 flex items-end justify-between px-1">
        <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white">
          Acesso Rápido
        </h3>
        <button className="text-xs font-bold uppercase tracking-wide text-secondary hover:text-blue-600 dark:hover:text-blue-400">
          Editar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {quickItems.map((item) => (
          <div
            key={item.id}
            className={`${item.bgColor} rounded-home-xl border p-4 shadow-sm ${item.borderColor} group relative flex h-32 cursor-pointer flex-col justify-center gap-2 overflow-hidden transition-all duration-200 active:scale-95`}
          >
            {/* Decorative corner */}
            <div
              className={`absolute right-0 top-0 h-16 w-16 ${item.decorColor} -mr-2 -mt-2 rounded-bl-[3rem] transition-transform group-hover:scale-110`}
            />

            <div className="relative z-10 flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor} shadow-sm`}
              >
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>
              <h4 className="font-bold text-gray-800 dark:text-white">{item.title}</h4>
            </div>

            <p className="relative z-10 pl-1 text-xs text-text-sub dark:text-text-sub-dark">
              {item.desc}
            </p>

            {/* Badge */}
            <div className="absolute bottom-2 right-2">
              <span className={`${item.badgeColor} rounded-md px-1.5 py-0.5 text-[9px] font-bold`}>
                {item.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
