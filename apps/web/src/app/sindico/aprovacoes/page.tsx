'use client';
import { AuthGuard, useAuthContext } from '@/contexts/AuthContext';
import { ApprovalList } from '@/components/admin/ApprovalList';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SindicoAprovacoesPage() {
  const { profile } = useAuthContext();
  const condominioId = profile?.condominio_atual?.id;
  const handleUserApproved = () => toast.success('Lista atualizada');

  if (!condominioId) {
    return (<AuthGuard requiredRoles={['sindico', 'subsindico', 'admin_condo']}><div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center"><div className="text-center"><span className="material-symbols-outlined text-5xl text-gray-400 mb-3">apartment</span><h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Nenhum condomínio selecionado</h2><p className="text-gray-500">Selecione um condomínio para gerenciar aprovações</p></div></div></AuthGuard>);
  }

  return (
    <AuthGuard requiredRoles={['sindico', 'subsindico', 'admin_condo']}>
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <header className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700"><div className="max-w-3xl mx-auto px-4 py-6"><div className="flex items-center gap-4"><Link href="/home" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><span className="material-symbols-outlined text-gray-600 dark:text-gray-400">arrow_back</span></Link><div><h1 className="text-xl font-bold text-gray-800 dark:text-white">Aprovar Moradores</h1><p className="text-sm text-gray-500 mt-0.5">{profile?.condominio_atual?.nome}</p></div></div></div></header>
        <main className="max-w-3xl mx-auto px-4 py-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6"><div className="flex gap-3"><span className="material-symbols-outlined text-blue-600">info</span><div className="text-sm text-blue-800 dark:text-blue-200"><p className="font-medium mb-1">Como funciona a aprovação?</p><p className="text-blue-700 dark:text-blue-300">Moradores que se cadastram com o código do condomínio aparecem aqui.</p></div></div></div>
          <ApprovalList condominioId={condominioId} onUserApproved={handleUserApproved} />
        </main>
      </div>
    </AuthGuard>
  );
}
