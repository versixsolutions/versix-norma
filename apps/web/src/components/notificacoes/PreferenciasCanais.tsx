'use client';

import type { UpdatePreferenciasInput, UsuarioCanaisPreferencias } from '@versix/shared/types/comunicacao';
import { useState } from 'react';

// ============================================
// TYPE DEFINITIONS
// ============================================
type ToggleKey = keyof Pick<UpdatePreferenciasInput,
  | 'push_habilitado'
  | 'email_habilitado'
  | 'whatsapp_habilitado'
  | 'sms_habilitado'
  | 'voz_emergencia_habilitado'
>;

interface CanalConfig {
  key: ToggleKey;
  label: string;
  icon: string;
  desc: string;
}

interface PreferenciasCanaisProps {
  preferencias: UsuarioCanaisPreferencias;
  onSave: (input: UpdatePreferenciasInput) => Promise<boolean>;
  loading?: boolean;
}

export function PreferenciasCanais({ preferencias, onSave, loading }: PreferenciasCanaisProps) {
  const [form, setForm] = useState<UpdatePreferenciasInput>({
    push_habilitado: preferencias.push_habilitado,
    email_habilitado: preferencias.email_habilitado,
    whatsapp_habilitado: preferencias.whatsapp_habilitado,
    sms_habilitado: preferencias.sms_habilitado,
    voz_emergencia_habilitado: preferencias.voz_emergencia_habilitado,
    receber_digest: preferencias.receber_digest,
    digest_frequencia: preferencias.digest_frequencia,
    digest_horario: preferencias.digest_horario
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof UpdatePreferenciasInput, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(form);
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const canais: CanalConfig[] = [
    { key: 'push_habilitado', label: 'Push Notifications', icon: 'notifications', desc: 'Notificações no celular' },
    { key: 'email_habilitado', label: 'Email', icon: 'email', desc: 'Receber por email' },
    { key: 'whatsapp_habilitado', label: 'WhatsApp', icon: 'chat', desc: 'Mensagens no WhatsApp' },
    { key: 'sms_habilitado', label: 'SMS', icon: 'sms', desc: 'Mensagens de texto' },
    { key: 'voz_emergencia_habilitado', label: 'Ligação (Emergência)', icon: 'call', desc: 'Ligação em casos críticos' }
  ];

  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined">tune</span>
          Preferências de Notificação
        </h3>
        <p className="text-sm text-gray-500 mt-1">Escolha como deseja receber as notificações</p>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {canais.map(canal => (
          <div key={canal.key} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">{canal.icon}</span>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{canal.label}</p>
                <p className="text-sm text-gray-500">{canal.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form[canal.key]}
                onChange={e => handleChange(canal.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Digest */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">Resumo Diário</p>
            <p className="text-sm text-gray-500">Receber um email com resumo das notificações</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.receber_digest}
              onChange={e => handleChange('receber_digest', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {form.receber_digest && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500">Frequência</label>
              <select
                value={form.digest_frequencia}
                onChange={e => handleChange('digest_frequencia', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-none"
              >
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500">Horário</label>
              <input
                type="time"
                value={form.digest_horario}
                onChange={e => handleChange('digest_horario', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botão Salvar */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            <span className="material-symbols-outlined">check</span>
          ) : (
            <span className="material-symbols-outlined">save</span>
          )}
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Preferências'}
        </button>
      </div>
    </div>
  );
}
