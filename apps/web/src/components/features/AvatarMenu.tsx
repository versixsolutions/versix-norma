'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface AvatarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarMenu({ isOpen, onClose }: AvatarMenuProps) {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (!isOpen) return null;

  const handleLogout = () => {
    // TODO: Integrar com Supabase Auth
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="absolute top-16 right-4 z-50 w-64 bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slide-down">
        {/* User Info */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">IS</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white">Igor Santos</h4>
              <p className="text-xs text-text-sub">Bloco A - 302</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-gray-500">person</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Meu Perfil</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-gray-500">settings</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Configurações</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-gray-500">
                {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {resolvedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              </span>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors ${
                resolvedTheme === 'dark' ? 'bg-secondary' : 'bg-gray-200'
              } relative`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  resolvedTheme === 'dark' ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-gray-500">help</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Ajuda</span>
          </button>
        </div>

        {/* Logout */}
        <div className="p-2 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-brand-danger"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}
