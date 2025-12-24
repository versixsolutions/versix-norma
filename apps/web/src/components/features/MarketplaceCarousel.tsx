'use client';

import Image from 'next/image';
import { useRef } from 'react';

const items = [
  {
    id: 1,
    title: 'Limpeza Pós-Obra',
    discount: '15% OFF',
    image:
      'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&q=80&w=400',
    color: 'from-blue-600 to-indigo-700',
    partner: 'CleanFast',
  },
  {
    id: 2,
    title: 'Pet Walker',
    discount: '1º Passeio Grátis',
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400',
    color: 'from-orange-500 to-red-500',
    partner: 'DogHero',
  },
  {
    id: 3,
    title: 'Manutenção Ar',
    discount: 'R$ 50 OFF',
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
    color: 'from-cyan-500 to-blue-600',
    partner: 'FrioMax',
  },
  {
    id: 4,
    title: 'Marmitas Fit',
    discount: 'Combo Semanal',
    image:
      'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=400',
    color: 'from-green-500 to-emerald-600',
    partner: 'GreenFood',
  },
];

export default function MarketplaceCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="animation-delay-300 animate-slide-up px-0">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between px-6">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold text-gray-800 dark:text-white">
            Clube de Vantagens
          </h3>
          <span className="rounded bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
            NOVO
          </span>
        </div>
        <button className="text-xs font-bold uppercase tracking-wide text-secondary hover:text-blue-600 dark:hover:text-blue-400">
          Ver todos
        </button>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="hide-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative h-32 w-64 flex-shrink-0 cursor-pointer snap-center overflow-hidden rounded-xl shadow-md transition-transform active:scale-95"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-80 mix-blend-multiply`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 text-white">
              <div className="flex items-start justify-between">
                <span className="rounded border border-white/10 bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md">
                  {item.partner}
                </span>
                <div className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-gray-900 shadow-sm">
                  {item.discount}
                </div>
              </div>
              <div>
                <h4 className="mb-1 text-lg font-bold leading-tight drop-shadow-md">
                  {item.title}
                </h4>
                <div className="flex items-center text-xs font-medium opacity-90">
                  <span>Resgatar agora</span>
                  <span className="material-symbols-outlined ml-1 text-sm transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Business Card */}
        <div className="relative flex h-32 w-24 flex-shrink-0 cursor-pointer snap-center flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined mb-1 text-2xl text-gray-400">
            add_business
          </span>
          <span className="px-2 text-center text-[10px] font-bold text-gray-500">
            Anuncie
            <br />
            Aqui
          </span>
        </div>
      </div>
    </div>
  );
}
