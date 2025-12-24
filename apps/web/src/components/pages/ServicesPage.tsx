'use client';

import Image from 'next/image';

interface ServicesPageProps {
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'cleaning', label: 'Limpeza' },
  { id: 'maintenance', label: 'Manutenção' },
  { id: 'pet', label: 'Pet' },
  { id: 'food', label: 'Alimentação' },
];

const partners = [
  {
    id: 1,
    title: 'CleanFast Limpeza',
    desc: 'Limpeza pós-obra, vidros e fachadas. Atendimento 24h.',
    rating: 4.9,
    discount: '15% OFF',
    img: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 2,
    title: 'FrioMax Ar Condicionado',
    desc: 'Instalação, manutenção e limpeza de splits e centrais.',
    rating: 4.8,
    discount: 'R$ 50 OFF',
    img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 3,
    title: 'DogHero Pet Walker',
    desc: 'Passeios, hospedagem e creche para seu pet.',
    rating: 5.0,
    discount: '1º Grátis',
    img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=200',
  },
];

export default function ServicesPage({ onScroll }: ServicesPageProps) {
  return (
    <div
      className="hide-scroll relative z-0 flex-1 animate-slide-up space-y-6 overflow-y-auto px-6 pb-32 pt-6"
      onScroll={onScroll}
    >
      {/* Header */}
      <div>
        <h2 className="mb-1 font-display text-xl font-bold text-gray-800 dark:text-white">
          Serviços
        </h2>
        <p className="text-sm text-text-sub">Parceiros exclusivos para moradores</p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar serviços..."
          className="w-full rounded-xl border border-gray-100 bg-white py-3 pl-12 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-secondary dark:border-gray-700 dark:bg-card-dark"
        />
      </div>

      {/* Categories */}
      <div className="hide-scroll flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
              cat.id === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Partners */}
      <div>
        <h3 className="mb-4 font-display text-lg font-bold text-gray-800 dark:text-white">
          Parceiros em Destaque
        </h3>
        <div className="space-y-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex cursor-pointer gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-transform active:scale-[0.99] dark:border-gray-700 dark:bg-card-dark"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={partner.img}
                  alt={partner.title}
                  fill
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                    {partner.title}
                  </h4>
                  <span className="flex items-center gap-0.5 rounded bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                    <span className="material-symbols-outlined text-[10px]">star</span>
                    {partner.rating}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-sub">
                  {partner.desc}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-secondary dark:bg-blue-900/20">
                    {partner.discount}
                  </span>
                  <button className="text-xs font-bold text-primary transition-colors hover:text-secondary">
                    Ver Oferta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggest Partner */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary to-blue-800 p-5 text-white shadow-lg">
        <div>
          <h4 className="mb-1 text-sm font-bold">Indique um Parceiro</h4>
          <p className="max-w-[150px] text-[10px] text-blue-100">
            Conhece um serviço top? Indique e ganhe descontos na taxa.
          </p>
        </div>
        <button className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-primary shadow transition-colors hover:bg-gray-100">
          Indicar
        </button>
      </div>
    </div>
  );
}
