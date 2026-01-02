'use client';

import { ComunicadoCard } from '@/components/comunicados/ComunicadoCard';
import { ComunicadoForm } from '@/components/comunicados/ComunicadoForm';
import { AuthGuard, useAuthContext } from '@/contexts/AuthContext';
import { useComunicados } from '@/hooks/useComunicados';
import type { ComunicadoFormData, ComunicadoLeitura, ComunicadoStatus } from '@versix/shared';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SindicoComunicadosPage() {
  const { profile } = useAuthContext();
  const {
    comunicados,
    loading,
    fetchComunicados,
    createComunicado,
    updateComunicado,
    deleteComunicado,
    getLeituras,
  } = useComunicados();
  const [statusFilter, setStatusFilter] = useState<ComunicadoStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingLeituras, setViewingLeituras] = useState<{
    id: string;
    leituras: ComunicadoLeitura[];
  } | null>(null);

  const condominioId = profile?.condominio_atual?.id;

  useEffect(() => {
    if (condominioId)
      fetchComunicados(condominioId, { status: (statusFilter as ComunicadoStatus) || undefined });
  }, [condominioId, statusFilter, fetchComunicados]);

  const handleCreate = async (data: ComunicadoFormData): Promise<boolean> => {
    if (!condominioId || !profile?.id) return false;
    const result = await createComunicado(condominioId, profile.id, data);
    if (result) {
      setShowForm(false);
      return true;
    }
    return false;
  };

  const handleUpdate = async (data: ComunicadoFormData): Promise<boolean> => {
    if (!editingId) return false;
    const result = await updateComunicado({ id: editingId, ...data });
    if (result) {
      setEditingId(null);
      return true;
    }
    return false;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este comunicado?')) return;
    const success = await deleteComunicado(id);
    if (success) toast.success('Comunicado excluído');
  };

  const handleViewLeituras = async (id: string) => {
    const leituras = await getLeituras(id);
    setViewingLeituras({ id, leituras });
  };

  const editingComunicado = comunicados.find((c) => c.id === editingId);

  return (
    <AuthGuard requiredRoles={['sindico', 'subsindico']}>
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-card-dark">
          <div className="mx-auto max-w-5xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/home"
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                    Gerenciar Comunicados
                  </h1>
                  <p className="text-sm text-gray-500">{profile?.condominio_atual?.nome}</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-white"
              >
                <span className="material-symbols-outlined">add</span>Novo
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6">
          <div className="mb-6 flex gap-2">
            {[
              { value: '', label: 'Todos' },
              { value: 'rascunho', label: 'Rascunhos' },
              { value: 'publicado', label: 'Publicados' },
              { value: 'arquivado', label: 'Arquivados' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value as ComunicadoStatus | '')}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${statusFilter === s.value ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-card-dark dark:text-gray-400'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : comunicados.length === 0 ? (
            <div className="rounded-2xl bg-white py-12 text-center dark:bg-card-dark">
              <span className="material-symbols-outlined mb-3 text-5xl text-gray-400">
                campaign
              </span>
              <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
                Nenhum comunicado
              </h3>
              <p className="mb-4 text-gray-500">Crie seu primeiro comunicado</p>
              <button
                onClick={() => setShowForm(true)}
                className="rounded-xl bg-primary px-6 py-2 font-medium text-white"
              >
                Criar Comunicado
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {comunicados.map((c) => (
                <div key={c.id} className="group relative">
                  <ComunicadoCard comunicado={c} showStatus />
                  <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleViewLeituras(c.id)}
                      className="rounded-lg bg-white p-2 shadow hover:bg-gray-50 dark:bg-gray-800"
                      title="Ver leituras"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    <button
                      onClick={() => setEditingId(c.id)}
                      className="rounded-lg bg-white p-2 shadow hover:bg-gray-50 dark:bg-gray-800"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded-lg bg-white p-2 text-red-500 shadow hover:bg-red-50 dark:bg-gray-800"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {(showForm || editingId) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-card-dark">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-card-dark">
                <h2 className="text-lg font-bold">
                  {editingId ? 'Editar Comunicado' : 'Novo Comunicado'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6">
                <ComunicadoForm
                  comunicado={editingComunicado}
                  condominioId={condominioId!}
                  onSubmit={editingId ? handleUpdate : handleCreate}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {viewingLeituras && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setViewingLeituras(null)}
          >
            <div
              className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-card-dark"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h3 className="font-bold">Leituras ({viewingLeituras.leituras.length})</h3>
                <button
                  onClick={() => setViewingLeituras(null)}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                {viewingLeituras.leituras.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">Nenhuma leitura registrada</p>
                ) : (
                  <div className="space-y-2">
                    {viewingLeituras.leituras.map(
                      (l: ComunicadoLeitura & { usuario?: { nome?: string } }) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-gray-700"
                        >
                          <span className="text-gray-800 dark:text-white">
                            {l.usuario?.nome || 'Usuário'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(l.lido_em).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
