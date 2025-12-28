'use client';

import { getSupabaseClient } from '@/lib/supabase';
import type { RoleType, Usuario } from '@/types/database';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// ============================================
// UTILITY FUNCTIONS FOR SECURE CONTEXT MANAGEMENT
// ============================================

// Get active condominio ID from cookies (secure alternative to localStorage)
const getActiveCondominioId = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  try {
    // Try to get from cookies first (more secure)
    const cookies = document.cookie.split(';');
    const condominioCookie = cookies.find(cookie =>
      cookie.trim().startsWith('condominio_atual=')
    );

    if (condominioCookie) {
      return condominioCookie.split('=')[1].trim();
    }

    // Fallback to localStorage for backward compatibility (will be removed later)
    return localStorage.getItem('condominio_atual');
  } catch (error) {
    console.warn('Error reading active condominio:', error);
    return null;
  }
};

// Set active condominio ID in cookies (secure)
const setActiveCondominioId = (condominioId: string | null): void => {
  if (typeof window === 'undefined') return;

  try {
    if (condominioId) {
      // Set secure cookie (7 days expiration)
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `condominio_atual=${condominioId}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;

      // Also set in localStorage for backward compatibility (temporary)
      localStorage.setItem('condominio_atual', condominioId);
    } else {
      // Clear cookie
      document.cookie = 'condominio_atual=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Clear localStorage
      localStorage.removeItem('condominio_atual');
    }
  } catch (error) {
    console.warn('Error setting active condominio:', error);
  }
};

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

  // Fetch user profile with condominios (simplified)
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      // Buscar usuário e condomínios em uma única consulta otimizada
      const { data: profileData, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          usuario_condominios!inner (
            condominio_id,
            role,
            unidade_id,
            status,
            condominios:condominio_id (
              nome
            ),
            unidades:unidade_id (
              identificador
            )
          )
        `)
        .eq('auth_id', userId)
        .eq('usuario_condominios.status', 'ativo');

      if (error || !profileData || profileData.length === 0) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      const usuario = profileData[0];

      // Transformar dados dos condomínios
      const userCondominios = usuario.usuario_condominios.map((uc: any) => ({
        condominio_id: uc.condominio_id,
        nome: uc.condominios?.nome || 'Condomínio',
        role: uc.role as RoleType,
        unidade_id: uc.unidade_id,
        unidade_identificador: uc.unidades?.identificador || null,
      }));

      // Obter condomínio ativo de forma segura (cookies em vez de localStorage)
      const activeCondominioId = await getActiveCondominioId();
      const condominioAtual = userCondominios.find(
        (c) => c.condominio_id === activeCondominioId
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
        // Obter sessão uma vez (removido loop para PWA)
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

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
      async (event: string, session: Session | null) => {
        console.log('Auth event:', event);

        // Evitar processamento desnecessário para eventos que não alteram o estado
        if (event === 'TOKEN_REFRESHED' && session && state.user) {
          // Apenas atualizar a sessão, manter o resto do estado
          setState((prev) => ({
            ...prev,
            session,
          }));
          return;
        }

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

      // Limpar condomínio ativo de forma segura
      setActiveCondominioId(null);

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
      // Usar abordagem segura para armazenar condomínio ativo
      setActiveCondominioId(condominioId);

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
