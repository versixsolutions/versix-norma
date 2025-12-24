'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProfilePageProps {
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function ProfilePage({ onScroll }: ProfilePageProps) {
  const router = useRouter();

  return (
    <div
      className="flex-1 overflow-y-auto hide-scroll pb-32 pt-6 relative z-0 px-6 animate-slide-up space-y-6"
      onScroll={onScroll}
    >
      {/* Avatar Section */}
      <div className="flex flex-col items-center pt-2">
        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-card-dark shadow-lg overflow-hidden mb-3 relative group cursor-pointer">
          <Image
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80"
            alt="Igor"
            fill
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white">edit</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-primary dark:text-white font-display">Igor Santos</h2>
        <p className="text-sm text-text-sub font-medium">Condomínio Pinheiro Park</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Bloco A - 302
          </span>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px]">check_circle</span>
            Adimplente
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-xl">qr_code_2</span>
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Meu QR Code</span>
        </button>
        <button className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-xl">manage_accounts</span>
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Editar Dados</span>
        </button>
      </div>

      {/* Unit Info */}
      <div className="bg-white dark:bg-card-dark p-5 rounded-home-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide mb-4">
          Minha Unidade
        </h3>

        {/* Residents */}
        <div className="mb-5">
          <p className="text-xs text-text-sub font-bold mb-2">Moradores & Agregados</p>
          <div className="flex gap-3 overflow-x-auto hide-scroll pb-2">
            {['Ana (Esposa)', 'Pedro (Filho)', 'Maria (Mãe)'].map((name, i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 border-2 border-white dark:border-gray-600 shadow-sm">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <span className="text-[9px] text-center text-gray-600 dark:text-gray-400 font-medium leading-tight">
                  {name}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined">add</span>
              </div>
              <span className="text-[9px] text-center text-gray-500 font-medium">Adicionar</span>
            </div>
          </div>
        </div>

        {/* Vehicles & Pets */}
        <div>
          <p className="text-xs text-text-sub font-bold mb-2">Veículos & Pets</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-[10px] font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1 border border-gray-100 dark:border-gray-700">
              <span className="material-symbols-outlined text-sm">directions_car</span>
              Honda Civic (PIX-9988)
            </span>
            <span className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-[10px] font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1 border border-gray-100 dark:border-gray-700">
              <span className="material-symbols-outlined text-sm">pets</span>
              Rex (Golden)
            </span>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white font-display mb-4">
          Últimas Interações
        </h3>
        <div className="space-y-4">
          {[
            { icon: 'build', color: 'bg-blue-100 text-blue-600', title: 'Chamado Aberto', desc: 'Torneira do jardim vazando.', status: 'Em Análise', time: 'Hoje, 08:30' },
            { icon: 'how_to_vote', color: 'bg-purple-100 text-purple-600', title: 'Voto Confirmado', desc: 'Assembleia Extraordinária de Pintura.', time: '15/12/2025' },
            { icon: 'check_circle', color: 'bg-green-100 text-green-600', title: 'Boleto Pago', desc: 'Condomínio Dezembro/2025.', time: '10/12/2025' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center shrink-0 z-10`}>
                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                </div>
                {i < 2 && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 absolute top-8" />}
              </div>
              <div className="pb-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">{item.title}</h4>
                <p className="text-xs text-text-sub">
                  {item.desc}{' '}
                  {item.status && <span className="text-amber-500 font-bold">{item.status}</span>}
                </p>
                <span className="text-[10px] text-gray-400">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 pb-4 space-y-3">
        <button className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-text-sub hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-sm">settings</span>
          Configurações de Privacidade
        </button>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 text-brand-danger text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
        >
          Sair do App
        </button>
      </div>
    </div>
  );
}
