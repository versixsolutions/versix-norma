'use client';

import type { TipoEmergencia } from '@versix/shared';
import { useState } from 'react';

interface EmergenciaButtonProps {
  onDisparar: (tipo: TipoEmergencia, descricao: string) => Promise<void>;
}

const TIPOS_EMERGENCIA: { tipo: TipoEmergencia; label: string; icon: string; color: string }[] = [
  { tipo: 'incendio', label: 'Incêndio', icon: 'local_fire_department', color: 'bg-red-600' },
  { tipo: 'vazamento', label: 'Vazamento de Gás', icon: 'propane', color: 'bg-amber-600' },
  { tipo: 'seguranca', label: 'Segurança', icon: 'shield', color: 'bg-blue-600' },
  { tipo: 'medica', label: 'Emergência Médica', icon: 'medical_services', color: 'bg-green-600' },
  { tipo: 'geral', label: 'Outra Emergência', icon: 'warning', color: 'bg-gray-600' },
];

export function EmergenciaButton({ onDisparar }: EmergenciaButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'tipo' | 'descricao' | 'confirmar'>('tipo');
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoEmergencia | null>(null);
  const [descricao, setDescricao] = useState('');
  const [disparando, setDisparando] = useState(false);

  const handleSelectTipo = (tipo: TipoEmergencia) => {
    setTipoSelecionado(tipo);
    setStep('descricao');
  };

  const handleConfirmar = () => {
    if (descricao.length >= 10) {
      setStep('confirmar');
    }
  };

  const handleDisparar = async () => {
    if (!tipoSelecionado) return;
    setDisparando(true);
    await onDisparar(tipoSelecionado, descricao);
    setDisparando(false);
    setShowModal(false);
    setStep('tipo');
    setTipoSelecionado(null);
    setDescricao('');
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      setStep('tipo');
      setTipoSelecionado(null);
      setDescricao('');
    }, 300);
  };

  const tipoConfig = TIPOS_EMERGENCIA.find((t) => t.tipo === tipoSelecionado);

  return (
    <>
      {/* Botão SOS */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 z-40 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition-colors hover:animate-none hover:bg-red-700"
      >
        <span className="material-symbols-outlined text-3xl">sos</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-t-3xl bg-white dark:bg-card-dark sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between bg-red-600 p-4 text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">emergency</span>
                <h2 className="text-lg font-bold">EMERGÊNCIA</h2>
              </div>
              <button onClick={handleClose} className="rounded-full p-1 hover:bg-red-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4">
              {step === 'tipo' && (
                <>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Selecione o tipo de emergência:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {TIPOS_EMERGENCIA.map((t) => (
                      <button
                        key={t.tipo}
                        onClick={() => handleSelectTipo(t.tipo)}
                        className={`rounded-xl p-4 ${t.color} flex flex-col items-center gap-2 text-white transition-opacity hover:opacity-90`}
                      >
                        <span className="material-symbols-outlined text-3xl">{t.icon}</span>
                        <span className="text-sm font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 'descricao' && (
                <>
                  <button
                    onClick={() => setStep('tipo')}
                    className="mb-4 flex items-center gap-1 text-gray-500"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Voltar
                  </button>

                  <div
                    className={`flex items-center gap-2 rounded-xl p-3 ${tipoConfig?.color} mb-4 text-white`}
                  >
                    <span className="material-symbols-outlined">{tipoConfig?.icon}</span>
                    <span className="font-medium">{tipoConfig?.label}</span>
                  </div>

                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descreva a emergência *
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="mt-1 w-full resize-none rounded-xl border-none bg-gray-100 px-4 py-3 dark:bg-gray-800"
                    rows={4}
                    placeholder="Ex: Fogo no apartamento 302, muito fumaça..."
                  />
                  <p className="mt-1 text-xs text-gray-400">{descricao.length}/10 mínimo</p>

                  <button
                    onClick={handleConfirmar}
                    disabled={descricao.length < 10}
                    className="mt-4 w-full rounded-xl bg-red-600 py-4 font-bold text-white disabled:opacity-50"
                  >
                    Continuar
                  </button>
                </>
              )}

              {step === 'confirmar' && (
                <>
                  <div className="py-4 text-center">
                    <span className="material-symbols-outlined animate-pulse text-6xl text-red-500">
                      warning
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">
                      Confirmar Disparo?
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Isso irá notificar <strong>TODOS</strong> os moradores por:
                    </p>
                    <div className="mt-4 flex justify-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-green-500">call</span>
                        Ligação
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-blue-500">sms</span>SMS
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-purple-500">
                          notifications
                        </span>
                        Push
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setStep('descricao')}
                      className="flex-1 rounded-xl bg-gray-200 py-4 font-medium dark:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDisparar}
                      disabled={disparando}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-4 font-bold text-white disabled:opacity-50"
                    >
                      {disparando ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <span className="material-symbols-outlined">send</span>
                      )}
                      {disparando ? 'Disparando...' : 'DISPARAR AGORA'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
