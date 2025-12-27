// Sprint 7 - Módulo Comunicação Multicanal
export { useNotificacoes } from './useNotificacoes';
export type { NotificacaoUsuario, NotificacaoDashboard, CreateNotificacaoInput, NotificacoesFilters, PrioridadeComunicado } from './useNotificacoes';

export { usePreferenciasCanais } from './usePreferenciasCanais';
export type { UsuarioCanaisPreferencias, UpdatePreferenciasInput, NotificacoesConfig, UpdateNotificacoesConfigInput } from './usePreferenciasCanais';

export { useEmergencias } from './useEmergencias';
export type { EmergenciaLog, DispararEmergenciaInput, TipoEmergencia } from './useEmergencias';
