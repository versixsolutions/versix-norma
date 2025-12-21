/**
 * VERSIX NORMA - Database Types
 *
 * Este arquivo exporta os tipos gerados automaticamente pelo Supabase CLI.
 * Execute `pnpm supabase:gen-types` para atualizar.
 */

// Placeholder - será substituído após executar gen types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Tipos serão gerados no Sprint 1 após criar as tabelas
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Re-export quando o arquivo database.ts for gerado
// export * from './database';
