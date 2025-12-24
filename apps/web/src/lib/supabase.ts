import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ============================================
// BROWSER CLIENT (Client Components)
// ============================================
export function createClient() {
  // Use unknown generic to avoid explicit `any` while keeping flexibility during migration
  return createBrowserClient<unknown>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ============================================
// SINGLETON CLIENT (para hooks)
// ============================================
let browserClient: ReturnType<typeof createBrowserClient<unknown>> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: sempre criar novo
    return createSupabaseClient<unknown>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Browser: singleton
  if (!browserClient) {
    browserClient = createBrowserClient<unknown>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}

// ============================================
// ADMIN CLIENT (Server Actions only)
// ============================================
export function createAdminClient() {
  // Admin client uses `unknown` generic instead of explicit `any` to satisfy lint
  return createSupabaseClient<unknown>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
