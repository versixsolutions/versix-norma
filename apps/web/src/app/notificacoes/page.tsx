'use client';

import { EmergenciaButton } from '@/components/notificacoes/EmergenciaButton';
import { NotificacaoCard } from '@/components/notificacoes/NotificacaoCard';
import { PreferenciasCanais } from '@/components/notificacoes/PreferenciasCanais';
import { AuthGuard, useAuthContext } from '@/contexts/AuthContext';
import { useEmergencias } from '@/hooks/useEmergencias';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { usePreferenciasCanais } from '@/hooks/usePreferenciasCanais';
import type { NotificacaoUsuario } from '@versix/shared/types/comunicacao';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function NotificacoesPage() {
  const { profile } = useAuthContext();
  const { notificacoes, naoLidas, loading, fetchMinhasNotificacoes, marcarComoLida, marcarTodasComoLidas, subscribeToNotificacoes } = useNotificacoes();
  const { preferencias, fetchMinhasPreferencias, updatePreferencias } = usePreferenciasCanais();
  const { dispararEmergencia } = useEmergencias();

  const [tab, setTab] = useState<'todas' | 'nao_lidas' | 'config'>('todas');
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState<NotificacaoUsuario | null>(null);

  const condominioId = profile?.condominio_atual?.id;

  useEffect(() => {
    fetchMinhasNotificacoes();
    fetchMinhasPreferencias();
  }, [fetchMinhasNotificacoes, fetchMinhasPreferencias]);

  useEffect(() => {
    if (!profile?.id) return;
    const unsubscribe = subscribeToNotificacoes(profile.id, (notif) => {
      toast.info(notif.titulo, { description: notif.corpo_resumo || '' });
    });
    return unsubscribe;
  }, [profile?.id, subscribeToNotificacoes]);

  const handleMarcarLida = async (notif: NotificacaoUsuario) => {
    await marcarComoLida(notif.notificacao_id);
    setNotificacaoSelecionada(notif);
  };

  const handleMarcarTodasLidas = async () => {
    const count = await marcarTodasComoLidas();
    if (count > 0) toast.success(`${count} notificações marcadas como lidas`);
  };

  const handleEmergencia = async (tipo: any, descricao: string) => {
    if (!condominioId) return;
    const id = await dispararEmergencia(condominioId, { tipo, descricao });
    if (id) toast.success('Emergência disparada com sucesso!');
  };

  const notificacoesFiltradas = tab === 'nao_lidas' ? notificacoes.filter(n => n.status !== 'lido') : notificacoes;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <header className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link href="/home" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">Notificações</h1>
                  {naoLidas > 0 && <p className="text-sm text-primary">{naoLidas} não lida(s)</p>}
                </div>
              </div>
              {naoLidas > 0 && tab !== 'config' && (
                <button onClick={handleMarcarTodasLidas} className="text-sm text-primary font-medium">
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {(['todas', 'nao_lidas', 'config'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                  {t === 'todas' ? 'Todas' : t === 'nao_lidas' ? `Não Lidas (${naoLidas})` : 'Configurações'}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto">
          {tab === 'config' ? (
            <div className="p-4">
              {preferencias && <PreferenciasCanais preferencias={preferencias} onSave={updatePreferencias} />}
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notificacoesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-gray-400 mb-3">notifications_off</span>
              <h3 className="text-lg font-semibold mb-1">Nenhuma notificação</h3>
              <p className="text-gray-500">{tab === 'nao_lidas' ? 'Todas as notificações foram lidas' : 'Você ainda não recebeu notificações'}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-card-dark">
              {notificacoesFiltradas.map(notif => (
                <NotificacaoCard key={notif.entrega_id} notificacao={notif} onClick={() => handleMarcarLida(notif)} />
              ))}
            </div>
          )}
        </main>

        {notificacaoSelecionada && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                <h2 className="font-bold">{notificacaoSelecionada.tipo}</h2>
                <button onClick={() => setNotificacaoSelecionada(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{notificacaoSelecionada.titulo}</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{notificacaoSelecionada.corpo}</p>
                <p className="text-sm text-gray-400 mt-4">{new Date(notificacaoSelecionada.created_at).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        )}

        {profile?.condominio_atual?.role === 'sindico' && <EmergenciaButton onDisparar={handleEmergencia} />}
      </div>
    </AuthGuard>
  );
}
