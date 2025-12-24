'use client';

interface BottomNavProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

const navItems = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'transparency', icon: 'pie_chart', label: 'Transparência' },
  { id: 'community', icon: 'groups', label: 'Convivência' },
  { id: 'services', icon: 'storefront', label: 'Serviços' },
  { id: 'profile', icon: 'person', label: 'Meu Perfil' },
];

export default function BottomNav({ activeNav, setActiveNav }: BottomNavProps) {
  return (
    <div className="absolute bottom-0 z-30 w-full rounded-t-[2.5rem] bg-white px-4 pb-5 pt-3 shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.05)] dark:bg-card-dark">
      <div className="flex items-end justify-between">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="group relative flex h-14 w-16 flex-col items-center justify-end"
            >
              <span
                className={`material-symbols-outlined mb-0.5 text-[26px] transition-all duration-300 ease-out ${
                  isActive
                    ? '-translate-y-1 text-primary'
                    : 'text-gray-300 group-hover:text-gray-400'
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[9px] font-semibold tracking-tight transition-all duration-300 ${
                  isActive ? 'translate-y-0 text-primary opacity-100' : 'text-gray-400 opacity-80'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
