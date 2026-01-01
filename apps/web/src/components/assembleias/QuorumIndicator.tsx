'use client';

import type { QuorumInfo } from '@versix/shared';

interface QuorumIndicatorProps {
  quorum: QuorumInfo;
  quorumMinimo?: number;
  compact?: boolean;
}

export function QuorumIndicator({ quorum, quorumMinimo = 50, compact }: QuorumIndicatorProps) {
  const percentual = quorum.quorum_percentual || 0;
  const atingido = percentual >= quorumMinimo;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all ${atingido ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(percentual, 100)}%` }}
          />
        </div>
        <span className={`text-sm font-bold ${atingido ? 'text-green-600' : 'text-amber-600'}`}>
          {percentual.toFixed(1)}%
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-card-dark">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
          <span className="material-symbols-outlined">groups</span>
          Quórum
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${atingido ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
        >
          {atingido ? 'Atingido' : 'Aguardando'}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="relative mb-4">
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${atingido ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(percentual, 100)}%` }}
          />
        </div>
        {/* Marcador de quórum mínimo */}
        <div
          className="absolute top-0 flex h-full items-center"
          style={{ left: `${quorumMinimo}%` }}
        >
          <div className="-mt-1 h-6 w-0.5 bg-gray-400" />
        </div>
      </div>

      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className={`text-3xl font-bold ${atingido ? 'text-green-600' : 'text-amber-600'}`}>
            {percentual.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">Fração ideal representada</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {quorum.unidades_presentes}/{quorum.total_unidades}
          </p>
          <p className="text-xs text-gray-500">Unidades presentes</p>
        </div>
      </div>

      {/* Breakdown por tipo */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <p className="text-lg font-bold text-blue-600">{quorum.online || 0}</p>
          <p className="text-xs text-gray-500">Online</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <p className="text-lg font-bold text-green-600">{quorum.presenciais || 0}</p>
          <p className="text-xs text-gray-500">Presencial</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <p className="text-lg font-bold text-purple-600">{quorum.procuracoes || 0}</p>
          <p className="text-xs text-gray-500">Procuração</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <p className="text-lg font-bold text-amber-600">{quorum.votos_antecipados || 0}</p>
          <p className="text-xs text-gray-500">Antecipado</p>
        </div>
      </div>
    </div>
  );
}
