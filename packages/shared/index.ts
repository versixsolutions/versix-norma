/**
 * VERSIX NORMA - Shared Package
 *
 * Exporta constantes, utilitários e validadores compartilhados
 */

// Database Types
export * from './database.types';

// Derived Types (FONTE DA VERDADE - derivados do schema do banco)
export * from './src/types/derived';

// Legacy Types (DEPRECATED - mantenha apenas para compatibilidade)
// TODO: Migrar todos os usos para derived.ts
export * from './src/types/assembleias';
export * from './src/types/comunicacao';
export * from './src/types/financial';
export * from './src/types/integracoes';
export * from './src/types/operational';

// Constants
export * from './constants';

// Utilities
export * from './utils';

// Input types from validators
export { type AvaliarChamadoInput, type CreateChamadoInput, type CreateComunicadoInput, type CreateFAQInput, type CreateMensagemInput, type CreateOcorrenciaInput, type UpdateChamadoInput, type UpdateComunicadoInput, type UpdateFAQInput, type UpdateOcorrenciaInput } from './src/validators/operational';

