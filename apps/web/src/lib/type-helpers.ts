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
  return anexos as unknown as Anexo[];
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

// Converter Anexo[] para Json (para enviar ao banco)
export function serializeAnexos(anexos: Anexo[] | undefined): Json {
  if (!anexos || anexos.length === 0) return [];
  return anexos as unknown as Json;
}

// Converter mensagem com anexos (helper genérico)
export function serializeMensagemComAnexos<T extends { anexos?: Anexo[] }>(
  mensagem: T
): T & { anexos: Json } {
  return {
    ...mensagem,
    anexos: serializeAnexos(mensagem.anexos),
  };
}

// Converter string | null para string | undefined
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// Converter string | undefined para string | null
export function undefinedToNull<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

// Safe string para inputs (evita null/undefined)
export function safeStringValue(value: string | null | undefined): string {
  return value ?? '';
}
