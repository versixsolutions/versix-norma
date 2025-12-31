'use client';

import { useAnexos } from '@/hooks/useAnexos';
import type { ComunicadoCategoria, ComunicadoComJoins, ComunicadoStatus, CreateComunicadoInput } from '@versix/shared';
import { useState } from 'react';
import { toast } from 'sonner';

interface ComunicadoFormProps {
  comunicado?: ComunicadoComJoins;
  condominioId: string;
  onSubmit: (data: CreateComunicadoInput) => Promise<boolean>;
  onCancel: () => void;
}

const CATEGORIAS: { value: ComunicadoCategoria; label: string }[] = [
  { value: 'aviso_geral', label: 'Aviso Geral' }, { value: 'manutencao', label: 'Manutenção' },
  { value: 'financeiro', label: 'Financeiro' }, { value: 'assembleia', label: 'Assembleia' },
  { value: 'seguranca', label: 'Segurança' }, { value: 'eventos', label: 'Eventos' },
  { value: 'obras', label: 'Obras' }, { value: 'outros', label: 'Outros' }
];

export function ComunicadoForm({ comunicado, condominioId, onSubmit, onCancel }: ComunicadoFormProps) {
  const { uploadMultiple, uploading } = useAnexos();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateComunicadoInput>({
    titulo: comunicado?.titulo || '',
    conteudo: comunicado?.conteudo || '',
    resumo: comunicado?.resumo || '',
    categoria: comunicado?.categoria || 'aviso_geral',
    fixado: comunicado?.fixado || false,
    destaque: comunicado?.destaque || false,
    publicar_em: comunicado?.publicar_em || null,
    expirar_em: comunicado?.expirar_em || null,
    anexos: comunicado?.anexos || [],
    status: comunicado?.status || 'rascunho'
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const anexos = await uploadMultiple(condominioId, 'comunicados', files);
    setForm(prev => ({ ...prev, anexos: [...prev.anexos!, ...anexos] }));
    toast.success(`${anexos.length} arquivo(s) enviado(s)`);
  };

  const removeAnexo = (index: number) => {
    setForm(prev => ({ ...prev, anexos: prev.anexos!.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent, status?: ComunicadoStatus) => {
    e.preventDefault();
    if (form.titulo.length < 5) { toast.error('Título deve ter pelo menos 5 caracteres'); return; }
    if (form.conteudo.length < 10) { toast.error('Conteúdo deve ter pelo menos 10 caracteres'); return; }
    setLoading(true);
    const success = await onSubmit({ ...form, status: status || form.status });
    setLoading(false);
    if (success) toast.success(status === 'publicado' ? 'Comunicado publicado!' : 'Comunicado salvo!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título *</label>
        <input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-gray-700 dark:text-white" placeholder="Título do comunicado" required minLength={5} maxLength={200} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resumo (opcional)</label>
        <input type="text" value={form.resumo || ''} onChange={e => setForm({ ...form, resumo: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-gray-700 dark:text-white" placeholder="Breve resumo para preview" maxLength={500} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conteúdo *</label>
        <textarea value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-gray-700 dark:text-white resize-none" placeholder="Conteúdo completo do comunicado" rows={8} required minLength={10} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
          <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value as ComunicadoCategoria })} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-gray-700 dark:text-white">
            {CATEGORIAS.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.fixado} onChange={e => setForm({ ...form, fixado: e.target.checked })} className="w-5 h-5 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Fixar no topo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.destaque} onChange={e => setForm({ ...form, destaque: e.target.checked })} className="w-5 h-5 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Destaque</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Publicar em (opcional)</label>
          <input type="datetime-local" value={form.publicar_em?.slice(0, 16) || ''} onChange={e => setForm({ ...form, publicar_em: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expirar em (opcional)</label>
          <input type="datetime-local" value={form.expirar_em?.slice(0, 16) || ''} onChange={e => setForm({ ...form, expirar_em: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-gray-700 dark:text-white" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Anexos</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
          <input type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="anexos-input" />
          <label htmlFor="anexos-input" className="flex flex-col items-center cursor-pointer">
            <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">{uploading ? 'sync' : 'upload_file'}</span>
            <span className="text-sm text-gray-500">{uploading ? 'Enviando...' : 'Clique para adicionar arquivos'}</span>
          </label>
        </div>
        {form.anexos && form.anexos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {form.anexos.map((anexo, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                <span className="material-symbols-outlined text-sm text-gray-500">{anexo.tipo.includes('pdf') ? 'picture_as_pdf' : 'image'}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[150px] truncate">{anexo.nome}</span>
                <button type="button" onClick={() => removeAnexo(i)} className="text-red-500 hover:text-red-700"><span className="material-symbols-outlined text-sm">close</span></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancelar</button>
        <button type="submit" disabled={loading} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-medium disabled:opacity-50">Salvar Rascunho</button>
        <button type="button" onClick={e => handleSubmit(e as React.MouseEvent<HTMLButtonElement>, 'publicado')} disabled={loading} className="px-6 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50">{loading ? 'Publicando...' : 'Publicar'}</button>
      </div>
    </form>
  );
}
