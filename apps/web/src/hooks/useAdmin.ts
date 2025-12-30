'use client';

import { getErrorMessage } from '@/lib/errors';
import { sanitizeSearchQuery } from '@/lib/sanitize';
import { getSupabaseClient } from '@/lib/supabase';
import type { RoleType, StatusType } from '@/types/database';
import { Database } from '@versix/shared';
import { useCallback, useState } from 'react';

export interface AdminUser {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  telefone: string | null;
  avatar_url: string | null;
  status: StatusType;
  created_at: string;
  updated_at: string;
  condominios: { condominio_id: string; condominio_nome: string; role: RoleType; unidade_id: string | null; unidade_identificador: string | null; }[];
}

export interface AdminCondominio {
  id: string;
  nome: string;
  slug: string;
  endereco: Database['public']['Tables']['condominios']['Row']['endereco'];
  status: StatusType;
  created_at: string;
  total_usuarios: number;
  total_unidades: number;
  sindico_nome: string | null;
}

export interface AdminStats {
  total_condominios: number;
  total_usuarios: number;
  usuarios_ativos: number;
  usuarios_pendentes: number;
  total_unidades: number;
}

export function useAdmin() {
  const supabase = getSupabaseClient();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [condominios, setCondominios] = useState<AdminCondominio[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tipo do enum de status no banco de dados
  type DbStatus = 'pending' | 'active' | 'inactive' | 'suspended' | 'removed';

  // Mapeamento de status português para inglês (DB usa enum em inglês)
  const mapStatusToDb = (status: StatusType): DbStatus => {
    const statusMap: Record<StatusType, DbStatus> = {
      'ativo': 'active',
      'inativo': 'inactive',
      'pendente': 'pending',
      'suspenso': 'suspended',
      'bloqueado': 'removed'
    };
    return statusMap[status] ?? 'active';
  };

  const fetchUsers = useCallback(async (filters?: { status?: StatusType; role?: string; condominio_id?: string }) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('usuarios').select(`id, auth_id, nome, email, telefone, avatar_url, status, created_at, updated_at, usuario_condominios (condominio_id, role, unidade_id, condominios:condominio_id (nome), unidades:unidade_id (identificador))`).order('created_at', { ascending: false });
      if (filters?.status) query = query.eq('status', mapStatusToDb(filters.status));
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      type UsuarioRow = Database['public']['Tables']['usuarios']['Row'];
      // type UsuarioCondominioRow = Database['public']['Tables']['usuario_condominios']['Row'];

      type UsuarioWithCondominios = UsuarioRow & {
        usuario_condominios: Array<{
          condominio_id: string;
          condominio_nome: string;
          role: RoleType;
          unidade_id: string | null;
          unidade_identificador: string | null;
        }>;
      };

      let formattedUsers: AdminUser[] = (data || []).map((user: UsuarioWithCondominios) => ({
        id: user.id, auth_id: user.auth_id, nome: user.nome, email: user.email, telefone: user.telefone,
        avatar_url: user.avatar_url, status: user.status, created_at: user.created_at, updated_at: user.updated_at,
        condominios: (user.usuario_condominios || []).map((uc) => ({
          condominio_id: uc.condominio_id,
          condominio_nome: '',
          role: uc.role,
          unidade_id: uc.unidade_id,
          unidade_identificador: uc.unidade_identificador || null,
        })),
      }));
      if (filters?.role) formattedUsers = formattedUsers.filter(u => u.condominios.some(c => c.role === filters.role));
      if (filters?.condominio_id) formattedUsers = formattedUsers.filter(u => u.condominios.some(c => c.condominio_id === filters.condominio_id));
      setUsers(formattedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchCondominios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.from('condominios').select(`id, nome, slug, endereco, status, created_at, blocos (unidades (id)), usuario_condominios (role, usuarios:usuario_id (nome))`).order('nome');
      if (fetchError) throw fetchError;
      type CondominioWithRelations = {
        id: string;
        nome: string;
        slug: string;
        endereco: string;
        status: StatusType;
        created_at: string;
        blocos: Array<{ unidades: Array<{ id: string }> }>;
        usuario_condominios: Array<{ role: RoleType; usuarios: { nome: string } }>;
      };
      const formattedCondominios: AdminCondominio[] = (data || []).map((condo: CondominioWithRelations) => {
        const totalUnidades = condo.blocos?.reduce(
          (acc: number, bloco) => acc + (bloco.unidades?.length || 0),
          0
        ) || 0;
        const sindico = condo.usuario_condominios?.find((uc) => uc.role === 'sindico');
        return {
          id: condo.id,
          nome: condo.nome,
          slug: condo.slug,
          endereco: condo.endereco,
          status: condo.status,
          created_at: condo.created_at,
          total_usuarios: condo.usuario_condominios?.length || 0,
          total_unidades: totalUnidades,
          sindico_nome: sindico?.usuarios?.nome || null,
        };
      });
      setCondominios(formattedCondominios);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ count: totalCondominios }, { count: totalUsuarios }, { count: usuariosAtivos }, { count: usuariosPendentes }, { count: totalUnidades }] = await Promise.all([
        supabase.from('condominios').select('*', { count: 'exact', head: true }),
        supabase.from('usuarios').select('*', { count: 'exact', head: true }),
        supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
        supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
        supabase.from('unidades').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ total_condominios: totalCondominios || 0, total_usuarios: totalUsuarios || 0, usuarios_ativos: usuariosAtivos || 0, usuarios_pendentes: usuariosPendentes || 0, total_unidades: totalUnidades || 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateUserStatus = useCallback(async (userId: string, status: StatusType): Promise<boolean> => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase.from('usuarios').update({ status, updated_at: new Date().toISOString() }).eq('id', userId);
      if (updateError) throw updateError;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateUserRole = useCallback(async (userId: string, condominioId: string, role: RoleType): Promise<boolean> => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase.from('usuario_condominios').update({ role }).eq('usuario_id', userId).eq('condominio_id', condominioId);
      if (updateError) throw updateError;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, condominios: u.condominios.map(c => c.condominio_id === condominioId ? { ...c, role } : c) } : u));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const searchUsers = useCallback(async (query: string): Promise<AdminUser[]> => {
    if (!query || query.length < 2) return [];
    try {
      const buscaSanitizada = sanitizeSearchQuery(query);
      const { data } = await supabase.from('usuarios').select(`id, auth_id, nome, email, telefone, avatar_url, status, created_at, updated_at`).or(`nome.ilike.%${buscaSanitizada}%,email.ilike.%${buscaSanitizada}%`).limit(20);
      return (data || []).map((user: AdminUser) => ({ ...user, condominios: [] }));
    } catch (err) {
      setError(getErrorMessage(err));
      return [];
    }
  }, [supabase]);

  return { users, condominios, stats, loading, error, fetchUsers, fetchCondominios, fetchStats, updateUserStatus, updateUserRole, searchUsers };
}
