/**
 * VERSIX NORMA - Shared Package
 *
 * ⚠️  PONTO ÚNICO DE EXPORTAÇÃO
 *
 * Todos os tipos são derivados do schema do banco (database.types.ts).
 * NÃO importe de outros arquivos de tipos - use apenas este index.
 *
 * Uso correto:
 * import { Usuario, ChamadoComJoins, CreateComunicadoInput } from '@versix/shared';
 */

// ============================================
// TIPOS DERIVADOS DO BANCO (FONTE ÚNICA)
// ============================================
export * from './src/types/derived';

// ============================================
// DATABASE TYPES RAW (use apenas se necessário)
// ============================================
export type { Database } from './database.types';

// ============================================
// CONSTANTES
// ============================================
export * from './constants';

// ============================================
// UTILS
// ============================================
export * from './utils';

// ============================================
// VALIDATORS (Zod schemas) - Export específico para evitar conflitos
// ============================================
export * as validators from './validators';
