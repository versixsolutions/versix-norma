'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

interface AvatarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarMenu({ isOpen, onClose }: AvatarMenuProps) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  if (!isOpen) return null;

  const handleLogout = () => {
    // TODO: Integrar com Supabase Auth
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Menu */}
      <div className="absolute right-4 top-16 z-50 w-64 animate-slide-down overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-card-dark">
        {/* User Info */}
        <div className="border-b border-gray-100 p-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <span className="text-lg font-bold text-white">IS</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white">Igor Santos</h4>
              <p className="text-xs text-text-sub">Bloco A - 302</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined text-gray-500">person</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Meu Perfil</span>
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined text-gray-500">settings</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Configurações</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
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
              className={`h-6 w-10 rounded-full transition-colors ${
                resolvedTheme === 'dark' ? 'bg-secondary' : 'bg-gray-200'
              } relative`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  resolvedTheme === 'dark' ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined text-gray-500">help</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">Ajuda</span>
          </button>
        </div>

        {/* Logout */}
        <div className="border-t border-gray-100 p-2 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-brand-danger transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}
