'use client';
import { AuthGuard } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { UserTable } from '@/components/admin/UserTable';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdminUsuariosPage() {
  const { fetchUsers } = useAdmin();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || undefined;
  const condominioFilter = searchParams.get('condominio') || undefined;
  useEffect(() => { fetchUsers({ status: statusFilter, condominio_id: condominioFilter }); }, [fetchUsers, statusFilter, condominioFilter]);
  return (
    <AuthGuard requiredRoles={['superadmin', 'admin_master']}>
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <header className="bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"><div className="flex items-center gap-4"><Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><span className="material-symbols-outlined text-gray-600 dark:text-gray-400">arrow_back</span></Link><div><h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestão de Usuários</h1><p className="text-sm text-gray-500 mt-1">{statusFilter === 'pendente' ? 'Usuários pendentes' : 'Todos os usuários'}</p></div></div></div></header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><UserTable onRefresh={() => fetchUsers({ status: statusFilter, condominio_id: condominioFilter })} /></main>
      </div>
    </AuthGuard>
  );
}
