'use client';

import type { IntegracaoDashboard } from '@versix/shared/src/validators/integracoes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IntegracaoCardProps {
  integracao: IntegracaoDashboard;
  onClick?: () => void;
}

const TIPO_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  api: { icon: 'api', label: 'API REST', color: 'bg-blue-100 text-blue-700' },
  webhook: { icon: 'webhook', label: 'Webhook', color: 'bg-purple-100 text-purple-700' },
  conector: { icon: 'hub', label: 'Conector', color: 'bg-green-100 text-green-700' }
};

const STATUS_CONFIG: Record<string, { icon: string; color: string }> = {
  ativa: { icon: 'check_circle', color: 'text-green-500' },
  pausada: { icon: 'pause_circle', color: 'text-amber-500' },
  erro: { icon: 'error', color: 'text-red-500' },
  desativada: { icon: 'cancel', color: 'text-gray-400' }
};

export function IntegracaoCard({ integracao, onClick }: IntegracaoCardProps) {
  const tipo = TIPO_CONFIG[integracao.tipo] || TIPO_CONFIG.api;
  const status = STATUS_CONFIG[integracao.status] || STATUS_CONFIG.ativa;

  const ultimoUso = integracao.ultimo_uso
    ? formatDistanceToNow(new Date(integracao.ultimo_uso), { addSuffix: true, locale: ptBR })
    : 'Nunca usado';

  const taxaSucesso = integracao.total_requests > 0
    ? Math.round((1 - integracao.total_erros / integracao.total_requests) * 100)
    : 100;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tipo.color}`}>
            <span className="material-symbols-outlined">{tipo.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">{integracao.nome}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${tipo.color}`}>{tipo.label}</span>
          </div>
        </div>
        <span className={`material-symbols-outlined ${status.color}`}>{status.icon}</span>
      </div>

      {/* Eventos (webhook) */}
      {integracao.tipo === 'webhook' && integracao.eventos && (
        <div className="flex flex-wrap gap-1 mb-3">
          {(integracao.eventos.flat().slice(0, 3) as string[]).map((ev, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
              {ev.split('.')[0]}
            </span>
          ))}
          {integracao.eventos.flat().length > 3 && (
            <span className="text-xs text-gray-500">+{integracao.eventos.flat().length - 3}</span>
          )}
        </div>
      )}

      {/* Conector */}
      {integracao.tipo === 'conector' && integracao.conector && (
        <div className="mb-3">
          <span className="text-sm text-gray-500">
            {integracao.conector === 'google_calendar' && '📅 Google Calendar'}
            {integracao.conector === 'asaas' && '💳 Asaas'}
            {integracao.conector === 's3_backup' && '☁️ S3 Backup'}
          </span>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 dark:border-gray-700 pt-3">
        <div>
          <p className="text-lg font-bold text-gray-800 dark:text-white">{integracao.total_requests}</p>
          <p className="text-xs text-gray-500">Requests</p>
        </div>
        <div>
          <p className={`text-lg font-bold ${taxaSucesso >= 95 ? 'text-green-600' : taxaSucesso >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
            {taxaSucesso}%
          </p>
          <p className="text-xs text-gray-500">Sucesso</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{ultimoUso}</p>
          <p className="text-xs text-gray-500">Último uso</p>
        </div>
      </div>
    </button>
  );
}
