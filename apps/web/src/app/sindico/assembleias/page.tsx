'use client';

import { AssembleiaCard } from '@/components/assembleias/AssembleiaCard';
import { AuthGuard, useAuthContext } from '@/contexts/AuthContext';
import { useAssembleias } from '@/hooks/useAssembleias';
import type { AssembleiaTipo, CreateAssembleiaInput } from '@versix/shared';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SindicoAssembleiasPage() {
  const { profile } = useAuthContext();
  const { assembleias, loading, fetchAssembleias, createAssembleia } = useAssembleias();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAssembleiaInput>({
    tipo: 'AGO',
    titulo: '',
    descricao: '',
    data_primeira_convocacao: '',
    local_presencial: '',
    quorum_minimo_primeira: 50,
    quorum_minimo_segunda: 0,
    permite_procuracao: true,
    max_procuracoes_por_pessoa: 2,
  });
  const [submitting, setSubmitting] = useState(false);

  const condominioId = profile?.condominio_atual?.id;

  useEffect(() => {
    if (condominioId) fetchAssembleias(condominioId);
  }, [condominioId, fetchAssembleias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condominioId || !profile?.id) return;
    if (!form.titulo || form.titulo.length < 5) {
      toast.error('Título deve ter pelo menos 5 caracteres');
      return;
    }

    setSubmitting(true);
    const result = await createAssembleia(condominioId, profile.id, form);
    if (result) {
      toast.success('Assembleia criada com sucesso!');
      setShowForm(false);
      setForm({
        tipo: 'AGO',
        titulo: '',
        descricao: '',
        data_primeira_convocacao: '',
        local_presencial: '',
        quorum_minimo_primeira: 50,
        quorum_minimo_segunda: 0,
        permite_procuracao: true,
        max_procuracoes_por_pessoa: 2,
      });
    } else {
      toast.error('Erro ao criar assembleia');
    }
    setSubmitting(false);
  };

  const rascunhos = assembleias.filter((a) => a.status === 'rascunho');
  const convocadas = assembleias.filter((a) => a.status === 'convocada');
  const ativas = assembleias.filter((a) => ['em_andamento', 'votacao'].includes(a.status));
  const encerradas = assembleias.filter((a) => ['encerrada', 'arquivada'].includes(a.status));

  return (
    <AuthGuard requiredRoles={['sindico']}>
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-card-dark">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/home"
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">Assembleias</h1>
                  <p className="text-sm text-gray-500">{profile?.condominio_atual?.nome}</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-white"
              >
                <span className="material-symbols-outlined">add</span>
                Nova Assembleia
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Ativas */}
              {ativas.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                    Ao Vivo ({ativas.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {ativas.map((a) => (
                      <AssembleiaCard key={a.id} assembleia={a} isSindico />
                    ))}
                  </div>
                </section>
              )}

              {/* Convocadas */}
              {convocadas.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                    <span className="material-symbols-outlined text-blue-500">campaign</span>
                    Convocadas ({convocadas.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {convocadas.map((a) => (
                      <AssembleiaCard key={a.id} assembleia={a} isSindico />
                    ))}
                  </div>
                </section>
              )}

              {/* Rascunhos */}
              {rascunhos.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                    <span className="material-symbols-outlined text-gray-400">edit_note</span>
                    Rascunhos ({rascunhos.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {rascunhos.map((a) => (
                      <AssembleiaCard key={a.id} assembleia={a} isSindico />
                    ))}
                  </div>
                </section>
              )}

              {/* Encerradas */}
              {encerradas.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                    <span className="material-symbols-outlined text-gray-400">inventory_2</span>
                    Encerradas ({encerradas.length})
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {encerradas.slice(0, 6).map((a) => (
                      <AssembleiaCard key={a.id} assembleia={a} isSindico />
                    ))}
                  </div>
                  {encerradas.length > 6 && (
                    <button className="mt-4 font-medium text-primary">
                      Ver todas ({encerradas.length})
                    </button>
                  )}
                </section>
              )}

              {assembleias.length === 0 && (
                <div className="rounded-2xl bg-white py-12 text-center dark:bg-card-dark">
                  <span className="material-symbols-outlined mb-3 text-5xl text-gray-400">
                    how_to_vote
                  </span>
                  <h3 className="mb-2 text-lg font-semibold">Nenhuma assembleia</h3>
                  <p className="mb-4 text-gray-500">Crie sua primeira assembleia para começar</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="rounded-xl bg-primary px-6 py-3 font-medium text-white"
                  >
                    Criar Assembleia
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Modal de criação */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-card-dark">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-card-dark">
                <h2 className="text-lg font-bold">Nova Assembleia</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div>
                  <label className="text-sm font-medium">Tipo *</label>
                  <div className="mt-1 flex gap-2">
                    {(['AGO', 'AGE', 'permanente'] as AssembleiaTipo[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, tipo: t })}
                        className={`flex-1 rounded-xl py-3 font-medium ${form.tipo === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Título *</label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    className="mt-1 w-full rounded-xl border-none bg-gray-100 px-4 py-3 dark:bg-gray-800"
                    placeholder="Ex: Assembleia Geral Ordinária 2024"
                    required
                    minLength={5}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    className="mt-1 w-full resize-none rounded-xl border-none bg-gray-100 px-4 py-3 dark:bg-gray-800"
                    rows={3}
                    placeholder="Descreva o objetivo da assembleia..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data 1ª Convocação</label>
                    <input
                      type="datetime-local"
                      value={form.data_primeira_convocacao}
                      onChange={(e) =>
                        setForm({ ...form, data_primeira_convocacao: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border-none bg-gray-100 px-4 py-3 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quórum Mínimo (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.quorum_minimo_primeira}
                      onChange={(e) =>
                        setForm({ ...form, quorum_minimo_primeira: parseInt(e.target.value) })
                      }
                      className="mt-1 w-full rounded-xl border-none bg-gray-100 px-4 py-3 dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Local (presencial)</label>
                  <input
                    type="text"
                    value={form.local_presencial}
                    onChange={(e) => setForm({ ...form, local_presencial: e.target.value })}
                    className="mt-1 w-full rounded-xl border-none bg-gray-100 px-4 py-3 dark:bg-gray-800"
                    placeholder="Ex: Salão de festas"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                  <input
                    type="checkbox"
                    id="procuracao"
                    checked={form.permite_procuracao}
                    onChange={(e) => setForm({ ...form, permite_procuracao: e.target.checked })}
                    className="h-5 w-5"
                  />
                  <label htmlFor="procuracao" className="flex-1">
                    <span className="font-medium">Permitir procuração</span>
                    <p className="text-sm text-gray-500">
                      Moradores podem representar outros via procuração
                    </p>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span className="material-symbols-outlined">add</span>
                  )}
                  {submitting ? 'Criando...' : 'Criar Assembleia'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
