import type { Json } from '@versix/shared';

/**
 * Helpers para converter tipos Json do banco para tipos específicos
 */

// Tipo genérico para anexos
export interface Anexo {
  url: string;
  tipo: string;
  nome: string;
  tamanho: number;
  uploaded_at?: string;
}

// Converter Json para Anexo[]
export function parseAnexos(anexos: Json | null | undefined): Anexo[] {
  if (!anexos || !Array.isArray(anexos)) return [];
  return anexos as Anexo[];
}

// Converter Json para objeto genérico
export function parseJson<T>(json: Json | null | undefined, defaultValue: T): T {
  if (json === null || json === undefined) return defaultValue;
  return json as T;
}

// Safe null coalesce para joins
export function safeJoin<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}
