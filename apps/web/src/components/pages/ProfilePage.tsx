'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProfilePageProps {
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export default function ProfilePage({ onScroll }: ProfilePageProps) {
  const router = useRouter();

  return (
    <div
      className="hide-scroll relative z-0 flex-1 animate-slide-up space-y-6 overflow-y-auto px-6 pb-32 pt-6"
      onScroll={onScroll}
    >
      {/* Avatar Section */}
      <div className="flex flex-col items-center pt-2">
        <div className="group relative mb-3 h-24 w-24 cursor-pointer overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-card-dark">
          <Image
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80"
            alt="Igor"
            fill
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="material-symbols-outlined text-white">edit</span>
          </div>
        </div>
        <h2 className="font-display text-xl font-bold text-primary dark:text-white">Igor Santos</h2>
        <p className="text-sm font-medium text-text-sub">Condomínio Pinheiro Park</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            Bloco A - 302
          </span>
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
            <span className="material-symbols-outlined text-[10px]">check_circle</span>
            Adimplente
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-card-dark">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-xl">qr_code_2</span>
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Meu QR Code</span>
        </button>
        <button className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-card-dark">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-xl">manage_accounts</span>
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Editar Dados</span>
        </button>
      </div>

      {/* Unit Info */}
      <div className="rounded-home-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-card-dark">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-800 dark:text-white">
          Minha Unidade
        </h3>

        {/* Residents */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-bold text-text-sub">Moradores & Agregados</p>
          <div className="hide-scroll flex gap-3 overflow-x-auto pb-2">
            {['Ana (Esposa)', 'Pedro (Filho)', 'Maria (Mãe)'].map((name, i) => (
              <div key={i} className="flex min-w-[60px] flex-col items-center gap-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-gray-500 shadow-sm dark:border-gray-600 dark:bg-gray-700">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <span className="text-center text-[9px] font-medium leading-tight text-gray-600 dark:text-gray-400">
                  {name}
                </span>
              </div>
            ))}
            <div className="flex min-w-[60px] cursor-pointer flex-col items-center gap-1 opacity-60 transition-opacity hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400">
                <span className="material-symbols-outlined">add</span>
              </div>
              <span className="text-center text-[9px] font-medium text-gray-500">Adicionar</span>
            </div>
          </div>
        </div>

        {/* Vehicles & Pets */}
        <div>
          <p className="mb-2 text-xs font-bold text-text-sub">Veículos & Pets</p>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-[10px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <span className="material-symbols-outlined text-sm">directions_car</span>
              Honda Civic (PIX-9988)
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-[10px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <span className="material-symbols-outlined text-sm">pets</span>
              Rex (Golden)
            </span>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <h3 className="mb-4 font-display text-lg font-bold text-gray-800 dark:text-white">
          Últimas Interações
        </h3>
        <div className="space-y-4">
          {[
            {
              icon: 'build',
              color: 'bg-blue-100 text-blue-600',
              title: 'Chamado Aberto',
              desc: 'Torneira do jardim vazando.',
              status: 'Em Análise',
              time: 'Hoje, 08:30',
            },
            {
              icon: 'how_to_vote',
              color: 'bg-purple-100 text-purple-600',
              title: 'Voto Confirmado',
              desc: 'Assembleia Extraordinária de Pintura.',
              time: '15/12/2025',
            },
            {
              icon: 'check_circle',
              color: 'bg-green-100 text-green-600',
              title: 'Boleto Pago',
              desc: 'Condomínio Dezembro/2025.',
              time: '10/12/2025',
            },
          ].map((item, i) => (
            <div key={i} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full ${item.color} z-10 flex shrink-0 items-center justify-center`}
                >
                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                </div>
                {i < 2 && (
                  <div className="absolute top-8 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
              <div className="pb-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">{item.title}</h4>
                <p className="text-xs text-text-sub">
                  {item.desc}{' '}
                  {item.status && <span className="font-bold text-amber-500">{item.status}</span>}
                </p>
                <span className="text-[10px] text-gray-400">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pb-4 pt-2">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-xs font-bold text-text-sub transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined text-sm">settings</span>
          Configurações de Privacidade
        </button>
        <button
          onClick={() => router.push('/login')}
          className="w-full rounded-xl py-3 text-xs font-bold text-brand-danger transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          Sair do App
        </button>
      </div>
    </div>
  );
}
