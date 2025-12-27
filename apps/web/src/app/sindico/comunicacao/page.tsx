'use client';

import { AuthGuard, useAuthContext } from '@/contexts/AuthContext';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { usePreferenciasCanais } from '@/hooks/usePreferenciasCanais';
import { useEmergencias } from '@/hooks/useEmergencias';
import { EmergenciaButton } from '@/components/notificacoes/EmergenciaButton';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { NotificacaoDashboard, CreateNotificacaoInput, PrioridadeComunicado } from '@versix/shared/types/comunicacao';

export default function SindicoComunicacaoPage() {
  const { profile } = useAuthContext();
  const { loading, enviarNotificacao, fetchDashboard } = useNotificacoes();
  const { config, fetchConfigCondominio, updateConfig } = usePreferenciasCanais();
  const { emergencias, fetchEmergencias, dispararEmergencia } = useEmergencias();
  
  const [dashboard, setDashboard] = useState<NotificacaoDashboard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'enviar' | 'historico' | 'config' | 'emergencias'>('enviar');
  const [form, setForm] = useState<CreateNotificacaoInput>({
    tipo: 'comunicado',
    titulo: '',
    corpo: '',
    prioridade: 'normal',
    destinatarios_tipo: 'todos',
    gerar_mural: false
  });
  const [submitting, setSubmitting] = useState(false);

  const condominioId = profile?.condominio_atual?.id;

  useEffect(() => {
    if (condominioId) {
      fetchDashboard(condominioId).then(setDashboard);
      fetchConfigCondominio(condominioId);
      fetchEmergencias(condominioId);
    }
  }, [condominioId, fetchDashboard, fetchConfigCondominio, fetchEmergencias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId) return;
    if (form.titulo.length < 3) { toast.error('Título muito curto'); return; }
    if (form.corpo.length < 10) { toast.error('Corpo muito curto'); return; }

    setSubmitting(true);
    const id = await enviarNotificacao(condominioId, form);
    if (id) {
      toast.success('Notificação enviada com sucesso!');
      setForm({ tipo: 'comunicado', titulo: '', corpo: '', prioridade: 'normal', destinatarios_tipo: 'todos', gerar_mural: false });
      fetchDashboard(condominioId).then(setDashboard);
    }
    setSubmitting(false);
  };

  const handleEmergencia = async (tipo: any, descricao: string) => {
    if (!condominioId) return;
    const id = await dispararEmergencia(condominioId, { tipo, descricao });
    if (id) {
      toast.success('Emergência disparada!');
      fetchEmergencias(condominioId);
    }
  };

  return (
    <AuthGuard requiredRoles={['sindico']}>
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <header className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/home" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Central de Comunicação</h1>
                <p className="text-sm text-gray-500">{profile?.condominio_atual?.nome}</p>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {(['enviar', 'historico', 'config', 'emergencias'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${tab === t ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                  {t === 'enviar' ? '📤 Enviar' : t === 'historico' ? '📊 Histórico' : t === 'config' ? '⚙️ Config' : '🚨 Emergências'}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">
          {tab === 'enviar' && (
            <div className="max-w-2xl">
              <form onSubmit={handleSubmit} className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold mb-4">Nova Notificação</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none">
                      <option value="comunicado">Comunicado</option>
                      <option value="cobranca">Cobrança</option>
                      <option value="assembleia">Assembleia</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="aviso">Aviso</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Título *</label>
                    <input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none"
                      placeholder="Ex: Manutenção programada dos elevadores" required />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Mensagem *</label>
                    <textarea value={form.corpo} onChange={e => setForm({ ...form, corpo: e.target.value })}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none resize-none" rows={5}
                      placeholder="Escreva a mensagem completa..." required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Prioridade</label>
                      <select value={form.prioridade} onChange={e => setForm({ ...form, prioridade: e.target.value as PrioridadeComunicado })}
                        className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none">
                        <option value="baixa">🟢 Baixa</option>
                        <option value="normal">🔵 Normal</option>
                        <option value="alta">🟡 Alta</option>
                        <option value="critica">🔴 Crítica</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Destinatários</label>
                      <select value={form.destinatarios_tipo} onChange={e => setForm({ ...form, destinatarios_tipo: e.target.value })}
                        className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none">
                        <option value="todos">Todos</option>
                        <option value="bloco">Por Bloco</option>
                        <option value="role">Por Perfil</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={form.gerar_mural} onChange={e => setForm({ ...form, gerar_mural: e.target.checked })}
                      className="w-5 h-5" />
                    <div>
                      <span className="font-medium">Gerar Mural (PDF)</span>
                      <p className="text-sm text-gray-500">Criar versão para impressão</p>
                    </div>
                  </label>

                  <button type="submit" disabled={submitting}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined">send</span>}
                    {submitting ? 'Enviando...' : 'Enviar Notificação'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tab === 'historico' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Histórico de Envios</h2>
              {dashboard.length === 0 ? (
                <p className="text-gray-500">Nenhuma notificação enviada ainda</p>
              ) : (
                <div className="grid gap-4">
                  {dashboard.map(n => (
                    <div key={n.id} className="bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{n.titulo}</h3>
                          <p className="text-sm text-gray-500">{n.tipo} • {new Date(n.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${n.percentual_leitura >= 80 ? 'bg-green-100 text-green-700' : n.percentual_leitura >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {n.percentual_leitura}% leram
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-sm">
                        <div><p className="font-bold text-gray-800 dark:text-white">{n.total_destinatarios}</p><p className="text-gray-500 text-xs">Destino</p></div>
                        <div><p className="font-bold text-green-600">{n.total_lidos}</p><p className="text-gray-500 text-xs">Lidos</p></div>
                        <div><p className="font-bold text-blue-600">{n.total_entregues}</p><p className="text-gray-500 text-xs">Entregues</p></div>
                        <div><p className="font-bold text-red-600">{n.total_falhas}</p><p className="text-gray-500 text-xs">Falhas</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'config' && config && (
            <div className="max-w-2xl space-y-4">
              <h2 className="text-lg font-bold">Configurações de Canais</h2>
              <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-4">
                {[
                  { key: 'push_habilitado', label: 'Push Notifications', icon: 'notifications' },
                  { key: 'email_habilitado', label: 'Email', icon: 'email' },
                  { key: 'whatsapp_habilitado', label: 'WhatsApp', icon: 'chat' },
                  { key: 'sms_habilitado', label: 'SMS', icon: 'sms' },
                  { key: 'voz_habilitado', label: 'Ligação TTS', icon: 'call' }
                ].map(canal => (
                  <div key={canal.key} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-500">{canal.icon}</span>
                      <span>{canal.label}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={(config as any)[canal.key]}
                        onChange={e => condominioId && updateConfig(condominioId, { [canal.key]: e.target.checked })}
                        className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-3">Créditos Disponíveis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-2xl font-bold text-primary">{config.creditos_sms}</p>
                    <p className="text-sm text-gray-500">SMS</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-2xl font-bold text-primary">{config.creditos_voz}</p>
                    <p className="text-sm text-gray-500">Minutos Voz</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'emergencias' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Histórico de Emergências</h2>
              {emergencias.length === 0 ? (
                <p className="text-gray-500">Nenhuma emergência registrada</p>
              ) : (
                <div className="space-y-3">
                  {emergencias.map(e => (
                    <div key={e.id} className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">{e.tipo.toUpperCase()}</span>
                          <p className="font-medium mt-2">{e.descricao}</p>
                          <p className="text-sm text-gray-500 mt-1">{new Date(e.disparado_em).toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p><strong>{e.total_destinatarios}</strong> notificados</p>
                          {e.total_ligacoes && <p>{e.total_atendidas}/{e.total_ligacoes} atendidas</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        <EmergenciaButton onDisparar={handleEmergencia} />
      </div>
    </AuthGuard>
  );
}
