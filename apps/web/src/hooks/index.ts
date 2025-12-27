// Sprint 3 - Módulos Operacionais
export { useComunicados } from './useComunicados';
export type { Comunicado, ComunicadoFilters, CreateComunicadoInput, UpdateComunicadoInput, ComunicadoStatus, ComunicadoCategoria } from './useComunicados';

export { useOcorrencias } from './useOcorrencias';
export type { Ocorrencia, OcorrenciaFilters, CreateOcorrenciaInput, UpdateOcorrenciaInput, OcorrenciaHistorico, OcorrenciaStatus, OcorrenciaCategoria, Prioridade } from './useOcorrencias';

export { useChamados } from './useChamados';
export type { Chamado, ChamadoFilters, CreateChamadoInput, UpdateChamadoInput, ChamadoMensagem, CreateMensagemInput, AvaliarChamadoInput, ChamadoStatus, ChamadoCategoria } from './useChamados';

export { useFAQ } from './useFAQ';
export type { FAQ, FAQFilters, CreateFAQInput, UpdateFAQInput } from './useFAQ';

export { useAnexos } from './useAnexos';
export type { Anexo } from './useAnexos';
