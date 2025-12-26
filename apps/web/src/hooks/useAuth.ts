'use client';

import { getSupabaseClient } from '@/lib/supabase';
import type { RoleType, Usuario } from '@/types/database';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// ============================================
// TYPES
// ============================================
interface UserProfile extends Usuario {
  condominios: {
    condominio_id: string;
    nome: string;
    role: RoleType;
    unidade_id: string | null;
    unidade_identificador: string | null;
  }[];
  condominio_atual: {
    id: string;
    nome: string;
    role: RoleType;
    unidade_id: string | null;
  } | null;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | Error | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
}

// ============================================
// HOOK
// ============================================
export function useAuth() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  // Fetch user profile with condominios
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      // Buscar usuário
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (userError || !usuario) {
        console.error('Erro ao buscar perfil:', userError);
        return null;
      }

      // Buscar condomínios do usuário
      const { data: condominios, error: condError } = await supabase
        .from('usuario_condominios')
        .select(`
          condominio_id,
          role,
          unidade_id,
          condominios:condominio_id (
            nome
          ),
          unidades:unidade_id (
            identificador
          )
        `)
        .eq('usuario_id', usuario.id)
        .eq('status', 'ativo');

      if (condError) {
        console.error('Erro ao buscar condomínios:', condError);
      }

      const userCondominios = (condominios || []).map((c: any) => ({
        condominio_id: c.condominio_id,
        nome: c.condominios?.nome || '',
        role: c.role as RoleType,
        unidade_id: c.unidade_id,
        unidade_identificador: c.unidades?.identificador || null,
      }));

      // Definir condomínio atual (primeiro da lista ou do localStorage)
      const storedCondominioId = typeof window !== 'undefined'
        ? localStorage.getItem('condominio_atual')
        : null;

      const condominioAtual = userCondominios.find(
        (c: any) => c.condominio_id === storedCondominioId
      ) || userCondominios[0] || null;

      return {
        ...usuario,
        condominios: userCondominios,
        condominio_atual: condominioAtual ? {
          id: condominioAtual.condominio_id,
          nome: condominioAtual.nome,
          role: condominioAtual.role,
          unidade_id: condominioAtual.unidade_id,
        } : null,
      };
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      return null;
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Tentar múltiplas vezes para PWA
        let session: Session | null = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (!session && attempts < maxAttempts) {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          if (error) throw error;
          session = currentSession;
          attempts++;

          if (!session && attempts < maxAttempts) {
            // Aguardar um pouco antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('Auth event:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
          router.push('/login');
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState((prev) => ({
            ...prev,
            session,
          }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, router]);

  // ============================================
  // AUTH METHODS
  // ============================================

  const login = async ({ email, password }: LoginCredentials) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Profile será carregado pelo listener onAuthStateChange
      return { success: true, data };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as AuthError,
      }));
      return { success: false, error };
    }
  };

  const signup = async ({ email, password, nome, telefone }: SignupCredentials) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            telefone,
          },
        },
      });

      if (authError) throw authError;

      // 2. Criar perfil na tabela usuarios (trigger pode fazer isso automaticamente)
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert({
            auth_id: authData.user.id,
            nome,
            email,
            telefone: telefone || null,
            status: 'pendente',
            config: {},
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Não falha, pois o trigger pode ter criado
        }
      }

      return { success: true, data: authData };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as AuthError,
      }));
      return { success: false, error };
    }
  };

  const logout = async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('condominio_atual');
      }

      return { success: true };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as AuthError,
      }));
      return { success: false, error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const switchCondominio = (condominioId: string) => {
    if (!state.profile) return;

    const novoCondominio = state.profile.condominios.find(
      (c) => c.condominio_id === condominioId
    );

    if (novoCondominio) {
      localStorage.setItem('condominio_atual', condominioId);
      setState((prev) => ({
        ...prev,
        profile: prev.profile ? {
          ...prev.profile,
          condominio_atual: {
            id: novoCondominio.condominio_id,
            nome: novoCondominio.nome,
            role: novoCondominio.role,
            unidade_id: novoCondominio.unidade_id,
          },
        } : null,
      }));
    }
  };

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState((prev) => ({ ...prev, profile }));
    }
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const isAuthenticated = !!state.user && !!state.session;
  const isAdmin = state.profile?.condominio_atual?.role === 'admin_master' ||
                  state.profile?.condominio_atual?.role === 'superadmin';
  const isSindico = state.profile?.condominio_atual?.role === 'sindico' ||
                   state.profile?.condominio_atual?.role === 'subsindico';
  const hasMultipleCondominios = (state.profile?.condominios.length || 0) > 1;

  return {
    // State
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    error: state.error,

    // Computed
    isAuthenticated,
    isAdmin,
    isSindico,
    hasMultipleCondominios,
    condominioAtual: state.profile?.condominio_atual,

    // Methods
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    switchCondominio,
    refreshProfile,
  };
}
