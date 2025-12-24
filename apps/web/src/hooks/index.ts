// ============================================
// HOOKS - Versix Norma
// ============================================

// Auth
export { useAuth } from './useAuth';

// Data
export { useFinancial } from './useFinancial';
export { useComunicados } from './useComunicados';
export { useAssembleias } from './useAssembleias';
export { useChamados } from './useChamados';

// AI
export { useNormaChat, useNormaChatMock } from './useNormaChat';

// PWA
export { useServiceWorker, UpdatePrompt, OfflineIndicator } from './useServiceWorker';

// Types re-exports
export type { Message } from './useNormaChat';
