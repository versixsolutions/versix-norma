/**
 * VERSIX NORMA - Shared Package
 *
 * Exporta constantes, utilitários e validadores compartilhados
 */

// Derived Types (FONTE DA VERDADE - derivados do schema do banco)
export * from './src/types/derived';

// Database Types (raw exports do Supabase - use apenas se necessário)
export type { Database, Json } from './database.types';

// Constants
export * from './constants';

// Utilities
export * from './utils';

// Input types from validators
export { type AvaliarChamadoInput, type CreateChamadoInput, type CreateComunicadoInput, type CreateFAQInput, type CreateMensagemInput, type CreateOcorrenciaInput, type UpdateChamadoInput, type UpdateComunicadoInput, type UpdateFAQInput, type UpdateOcorrenciaInput } from './src/validators/operational';

// Legacy integration inputs (ainda não migrados para o schema)
export { type CreateExportacaoInput, type CreateIntegracaoApiInput, type Exportacao } from './src/types/integracoes';


