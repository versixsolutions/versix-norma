/**
 * VERSIX NORMA - Tipos Derivados do Schema do Banco
 *
 * ⚠️  ARQUIVO ÚNICO DE TIPOS - NÃO CRIE TIPOS EM OUTROS ARQUIVOS!
 *
 * Este arquivo deriva TODOS os tipos do database.types.ts gerado pelo Supabase.
 *
 * REGRAS:
 * 1. NUNCA crie interfaces/types em outros arquivos
 * 2. Use os tipos exportados aqui
 * 3. Para tipos com joins, use as interfaces *ComJoins
 * 4. Para inputs de criação/update, use os tipos *Insert/*Update
 *
 * Para regenerar database.types.ts:
 * npx supabase gen types typescript --project-id <id> > packages/shared/database.types.ts
 */

import { Database } from '../../database.types';

// ============================================
// TIPOS BASE DO BANCO
// ============================================

export type Tables = Database['public']['Tables'];
export type Views = Database['public']['Views'];
export type Enums = Database['public']['Enums'];
export type Functions = Database['public']['Functions'];

// Tipo Json do Supabase
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================
// ENUMS - Derivados diretamente do banco
// ============================================

// User & Auth
export type UserRole = Enums['user_role'];
export type UserStatus = Enums['user_status'];
export type TipoResidente = Enums['tipo_residente'];

// Assembleias
export type AssembleiaTipo = Enums['assembleia_tipo'];
export type AssembleiaStatus = Enums['assembleia_status'];
export type PautaTipoVotacao = Enums['pauta_tipo_votacao'];
export type PautaStatus = Enums['pauta_status'];
export type QuorumEspecial = Enums['quorum_especial'];
export type PresencaTipo = Enums['presenca_tipo'];
export type ProcuracaoStatus = Enums['procuracao_status'];
export type AtaStatus = Enums['ata_status'];

// Comunicação
export type ComunicadoCategoria = Enums['comunicado_categoria'];
export type ComunicadoStatus = Enums['comunicado_status'];
export type TipoNotificacao = Enums['tipo_notificacao'];
export type CanalNotificacao = Enums['canal_notificacao'];
export type StatusEntrega = Enums['status_entrega'];
export type PrioridadeComunicado = Enums['prioridade_comunicado'];

// Operacional
export type ChamadoCategoria = Enums['chamado_categoria'];
export type ChamadoStatus = Enums['chamado_status'];
export type OcorrenciaCategoria = Enums['ocorrencia_categoria'];
export type OcorrenciaStatus = Enums['ocorrencia_status'];
export type Prioridade = Enums['prioridade'];

// Financeiro
export type TaxaTipo = Enums['taxa_tipo'];
export type CobrancaStatus = Enums['cobranca_status'];
export type LancamentoTipo = Enums['lancamento_tipo'];
export type LancamentoStatus = Enums['lancamento_status'];
export type CategoriaTipo = Enums['categoria_tipo'];
export type PrestacaoStatus = Enums['prestacao_status'];

// Unidades
export type UnidadeTipo = Enums['unidade_tipo'];

// Sistema
export type TierType = Enums['tier_type'];

// Integrações
export type IntegracaoTipo = Enums['integracao_tipo'];
export type IntegracaoStatus = Enums['integracao_status'];
export type IntegracaoAmbiente = Enums['integracao_ambiente'];
export type ConectorTipo = Enums['conector_tipo'];
export type WebhookEvento = Enums['webhook_evento'];
export type WebhookEntregaStatus = Enums['webhook_entrega_status'];

// ============================================
// TIPOS DE LINHA (ROW) - Estado completo do banco
// ============================================

// Core
export type Usuario = Tables['usuarios']['Row'];
export type Condominio = Tables['condominios']['Row'];
export type UnidadeHabitacional = Tables['unidades_habitacionais']['Row'];
export type Bloco = Tables['blocos']['Row'];

// Assembleias
export type Assembleia = Tables['assembleias']['Row'];
export type Pauta = Tables['assembleia_pautas']['Row'];
export type PautaOpcao = Tables['assembleia_pauta_opcoes']['Row'];
export type Presenca = Tables['assembleia_presencas']['Row'];
export type Voto = Tables['assembleia_votos']['Row'];
export type Procuracao = Tables['assembleia_procuracoes']['Row'];
export type AssembleiaLog = Tables['assembleia_logs']['Row'];
export type AssembleiaAssinatura = Tables['assembleia_assinaturas']['Row'];
export type AtaValidacao = Tables['atas_validacao']['Row'];

// Comunicação
export type Comunicado = Tables['comunicados']['Row'];
export type ComunicadoLeitura = Tables['comunicados_leitura']['Row'];
export type Notificacao = Tables['notificacoes']['Row'];
export type NotificacaoEntrega = Tables['notificacoes_entregas']['Row'];
export type NotificacaoLeitura = Tables['notificacoes_leituras']['Row'];
export type NotificacaoConfig = Tables['notificacoes_config']['Row'];
export type NotificacaoFila = Tables['notificacoes_fila']['Row'];
export type TemplateNotificacao = Tables['templates_notificacao']['Row'];
export type CotasComunicacao = Tables['cotas_comunicacao']['Row'];

// Operacional
export type Chamado = Tables['chamados']['Row'];
export type ChamadoMensagem = Tables['chamados_mensagens']['Row'];
export type Ocorrencia = Tables['ocorrencias']['Row'];
export type OcorrenciaHistorico = Tables['ocorrencias_historico']['Row'];
export type FAQ = Tables['faq']['Row'];
export type FAQVoto = Tables['faq_votos']['Row'];

// Financeiro
export type TaxaUnidade = Tables['taxas_unidades']['Row'];
export type LancamentoFinanceiro = Tables['lancamentos_financeiros']['Row'];
export type CategoriaFinanceira = Tables['categorias_financeiras']['Row'];
export type ContaBancaria = Tables['contas_bancarias']['Row'];
export type ContaBancariaHistorico = Tables['contas_bancarias_historico']['Row'];
export type ConfiguracoesFinanceiras = Tables['configuracoes_financeiras']['Row'];
export type PrestacaoContas = Tables['prestacao_contas']['Row'];

// Sistema
export type AuditLog = Tables['audit_logs']['Row'];
export type ApiRequestLog = Tables['api_request_logs']['Row'];
export type AlertaSistema = Tables['alertas_sistema']['Row'];
export type FeatureFlag = Tables['feature_flags']['Row'];
export type EmergenciaLog = Tables['emergencias_log']['Row'];
export type MetricasGlobais = Tables['metricas_globais']['Row'];
export type MetricasPerformance = Tables['metricas_performance']['Row'];
export type MetricasUso = Tables['metricas_uso']['Row'];
export type RateLimits = Tables['rate_limits']['Row'];
export type SessaoImpersonate = Tables['sessoes_impersonate']['Row'];
export type UptimeCheck = Tables['uptime_checks']['Row'];
export type HealthCheckConfig = Tables['health_check_config']['Row'];
export type AnomaliaDetectada = Tables['anomalias_detectadas']['Row'];

// Integrações
export type Integracao = Tables['integracoes']['Row'];
export type ApiScope = Tables['api_scopes']['Row'];
export type ApiLog = Tables['api_logs']['Row'];
export type WebhookConfig = Tables['webhooks_config']['Row'];
export type WebhookEntrega = Tables['webhooks_entregas']['Row'];
export type WebhookNotificacao = Tables['webhooks_notificacao']['Row'];
export type Conector = Tables['conectores']['Row'];
export type SyncLog = Tables['sync_logs']['Row'];

// Outros
export type CodigoConviteUso = Tables['codigos_convite_uso']['Row'];
export type UsuarioCanaisPreferencias = Tables['usuarios_canais_preferencias']['Row'];

// ============================================
// TIPOS DE INSERT
// ============================================

export type UsuarioInsert = Tables['usuarios']['Insert'];
export type CondominioInsert = Tables['condominios']['Insert'];
export type UnidadeHabitacionalInsert = Tables['unidades_habitacionais']['Insert'];
export type BlocoInsert = Tables['blocos']['Insert'];
export type AssembleiaInsert = Tables['assembleias']['Insert'];
export type PautaInsert = Tables['assembleia_pautas']['Insert'];
export type PautaOpcaoInsert = Tables['assembleia_pauta_opcoes']['Insert'];
export type PresencaInsert = Tables['assembleia_presencas']['Insert'];
export type VotoInsert = Tables['assembleia_votos']['Insert'];
export type ProcuracaoInsert = Tables['assembleia_procuracoes']['Insert'];
export type ComunicadoInsert = Tables['comunicados']['Insert'];
export type NotificacaoInsert = Tables['notificacoes']['Insert'];
export type ChamadoInsert = Tables['chamados']['Insert'];
export type ChamadoMensagemInsert = Tables['chamados_mensagens']['Insert'];
export type OcorrenciaInsert = Tables['ocorrencias']['Insert'];
export type FAQInsert = Tables['faq']['Insert'];
export type LancamentoFinanceiroInsert = Tables['lancamentos_financeiros']['Insert'];
export type CategoriaFinanceiraInsert = Tables['categorias_financeiras']['Insert'];
export type ContaBancariaInsert = Tables['contas_bancarias']['Insert'];
export type TaxaUnidadeInsert = Tables['taxas_unidades']['Insert'];
export type PrestacaoContasInsert = Tables['prestacao_contas']['Insert'];
export type IntegracaoInsert = Tables['integracoes']['Insert'];
export type WebhookConfigInsert = Tables['webhooks_config']['Insert'];
export type ConectorInsert = Tables['conectores']['Insert'];

// ============================================
// TIPOS DE UPDATE
// ============================================

export type UsuarioUpdate = Tables['usuarios']['Update'];
export type CondominioUpdate = Tables['condominios']['Update'];
export type UnidadeHabitacionalUpdate = Tables['unidades_habitacionais']['Update'];
export type AssembleiaUpdate = Tables['assembleias']['Update'];
export type PautaUpdate = Tables['assembleia_pautas']['Update'];
export type ComunicadoUpdate = Tables['comunicados']['Update'];
export type ChamadoUpdate = Tables['chamados']['Update'];
export type OcorrenciaUpdate = Tables['ocorrencias']['Update'];
export type FAQUpdate = Tables['faq']['Update'];
export type LancamentoFinanceiroUpdate = Tables['lancamentos_financeiros']['Update'];
export type CategoriaFinanceiraUpdate = Tables['categorias_financeiras']['Update'];
export type ContaBancariaUpdate = Tables['contas_bancarias']['Update'];
export type IntegracaoUpdate = Tables['integracoes']['Update'];
export type WebhookConfigUpdate = Tables['webhooks_config']['Update'];
export type NotificacaoConfigUpdate = Tables['notificacoes_config']['Update'];
export type UsuarioCanaisPreferenciasUpdate = Tables['usuarios_canais_preferencias']['Update'];

// Aliases para compatibilidade
export type UpdateNotificacoesConfigInput = NotificacaoConfigUpdate;
export type UpdatePreferenciasInput = UsuarioCanaisPreferenciasUpdate;

// ============================================
// TIPOS AUXILIARES
// ============================================

export interface Anexo {
  url: string;
  nome: string;
  tipo: string;
  tamanho: number;
  uploaded_at?: string;
}

export interface Comprovante {
  url: string;
  nome: string;
  tipo: string;
  tamanho: number;
  uploaded_at?: string;
}

export interface ResultadoPauta {
  total_votos: number;
  votos_sim: number;
  votos_nao: number;
  votos_abstencao: number;
  fracao_sim: number;
  fracao_nao: number;
  fracao_abstencao: number;
  percentual_aprovacao: number;
  aprovada: boolean;
  eleitos?: { opcao_id: string; titulo: string; votos: number; fracoes?: number }[];
}

export interface QuorumInfo {
  assembleia_id: string | null;
  condominio_id: string | null;
  status: AssembleiaStatus | null;
  total_fracoes: number | null;
  fracoes_presentes: number | null;
  fracao_presente: number | null;
  quorum_percentual: number | null;
  quorum_minimo_primeira: number | null;
  quorum_minimo_segunda: number | null;
  unidades_presentes: number | null;
  total_unidades: number | null;
  presenciais: number | null;
  online: number | null;
  procuracoes: number | null;
  votos_antecipados: number | null;
  quorum_atingido?: boolean;
}

// ============================================
// TIPOS COM JOINS
// ============================================

export interface UsuarioComJoins extends Usuario {
  condominio?: Pick<Condominio, 'id' | 'nome' | 'logo_url'>;
  unidade?: Pick<UnidadeHabitacional, 'id' | 'numero' | 'bloco_id'>;
}

export interface AssembleiaComJoins extends Assembleia {
  criador?: Pick<Usuario, 'id' | 'nome' | 'avatar_url'>;
  convocador?: Pick<Usuario, 'nome'>;
  pautas?: PautaComJoins[];
  presencas?: PresencaComJoins[];
  assinaturas?: AssembleiaAssinatura[];
  quorum?: QuorumInfo | null;
  quorum_info?: QuorumInfo;
}

export interface PautaComJoins extends Omit<Pauta, 'resultado'> {
  opcoes?: PautaOpcao[];
  votos?: Voto[];
  resultado?: ResultadoPauta | null;
}

export interface PresencaComJoins extends Presenca {
  usuario?: Pick<Usuario, 'id' | 'nome' | 'avatar_url'>;
  unidade?: Pick<UnidadeHabitacional, 'id' | 'numero'>;
  representante?: Pick<Usuario, 'id' | 'nome'>;
}

export interface ChamadoComJoins extends Chamado {
  solicitante?: Pick<Usuario, 'nome' | 'avatar_url' | 'email'>;
  atendente?: Pick<Usuario, 'nome'>;
  mensagens?: ChamadoMensagemComJoins[];
  total_mensagens?: number;
}

export interface ChamadoMensagemComJoins extends ChamadoMensagem {
  autor?: Pick<Usuario, 'nome' | 'avatar_url'>;
}

export interface ComunicadoComJoins extends Comunicado {
  autor?: Pick<Usuario, 'nome' | 'avatar_url' | 'email'>;
  lido?: boolean;
  total_leituras?: number;
}

export interface OcorrenciaComJoins extends Ocorrencia {
  reportado_por_info?: Pick<Usuario, 'nome' | 'avatar_url'>;
  responsavel?: Pick<Usuario, 'nome' | 'avatar_url'>;
  resolvido_por_info?: Pick<Usuario, 'nome'>;
  unidade_relacionada?: Pick<UnidadeHabitacional, 'numero'>;
}

export interface LancamentoComJoins extends LancamentoFinanceiro {
  categoria?: Pick<CategoriaFinanceira, 'id' | 'nome' | 'codigo' | 'tipo'>;
  conta_bancaria?: Pick<ContaBancaria, 'id' | 'nome_exibicao' | 'banco_nome'>;
  criador?: Pick<Usuario, 'nome'>;
}

export interface CategoriaFinanceiraComFilhos extends CategoriaFinanceira {
  children?: CategoriaFinanceiraComFilhos[];
  total_orcado?: number;
  total_realizado?: number;
}

export interface ContaBancariaComHistorico extends ContaBancaria {
  historico?: ContaBancariaHistorico[];
}

export interface IntegracaoDashboard {
  integracao: Integracao;
  stats: {
    total_requests: number;
    success_rate: number;
    last_request: string | null;
  };
  eventos?: WebhookEvento[];
  conector?: Conector | null;
}

export interface NotificacaoComEntrega extends Notificacao {
  entregas?: NotificacaoEntrega[];
  leituras?: NotificacaoLeitura[];
}

// ============================================
// FILTROS DE BUSCA
// ============================================

export interface BaseFilters {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  busca?: string;
}

export interface AssembleiaFilters extends BaseFilters {
  tipo?: AssembleiaTipo;
  status?: AssembleiaStatus;
  ano_referencia?: number;
}

export interface ChamadoFilters extends BaseFilters {
  status?: ChamadoStatus;
  categoria?: ChamadoCategoria;
  prioridade?: Prioridade;
  atendente_id?: string;
  solicitante_id?: string;
}

export interface ComunicadoFilters extends BaseFilters {
  status?: ComunicadoStatus;
  categoria?: ComunicadoCategoria;
  fixado?: boolean;
  destaque?: boolean;
}

export interface OcorrenciaFilters extends BaseFilters {
  status?: OcorrenciaStatus;
  categoria?: OcorrenciaCategoria;
  prioridade?: Prioridade;
  responsavel_id?: string;
  reportado_por?: string;
}

export interface LancamentoFilters extends BaseFilters {
  tipo?: LancamentoTipo;
  status?: LancamentoStatus;
  categoria_id?: string;
  conta_bancaria_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface FAQFilters extends BaseFilters {
  categoria?: string;
  ativo?: boolean;
  destaque?: boolean;
}

export interface NotificacaoFilters extends BaseFilters {
  tipo?: TipoNotificacao;
  canal?: CanalNotificacao;
  status?: StatusEntrega;
  lida?: boolean;
}

export interface IntegracaoFilters extends BaseFilters {
  tipo?: IntegracaoTipo;
  status?: IntegracaoStatus;
  ambiente?: IntegracaoAmbiente;
}

// ============================================
// ALIASES PARA INPUT
// ============================================

export type CreateAssembleiaInput = AssembleiaInsert;
export type UpdateAssembleiaInput = AssembleiaUpdate;
export type CreatePautaInput = PautaInsert;
export type UpdatePautaInput = PautaUpdate;
export type CreateComunicadoInput = ComunicadoInsert;
export type UpdateComunicadoInput = ComunicadoUpdate;
export type CreateNotificacaoInput = NotificacaoInsert;
export type CreateChamadoInput = ChamadoInsert;
export type UpdateChamadoInput = ChamadoUpdate;
export type CreateMensagemInput = ChamadoMensagemInsert;
export type CreateOcorrenciaInput = OcorrenciaInsert;
export type UpdateOcorrenciaInput = OcorrenciaUpdate;
export type CreateFAQInput = FAQInsert;
export type UpdateFAQInput = FAQUpdate;
export type CreateLancamentoInput = LancamentoFinanceiroInsert;
export type UpdateLancamentoInput = LancamentoFinanceiroUpdate;
export type CreateCategoriaInput = CategoriaFinanceiraInsert;
export type UpdateCategoriaInput = CategoriaFinanceiraUpdate;
export type CreateContaBancariaInput = ContaBancariaInsert;
export type UpdateContaBancariaInput = ContaBancariaUpdate;
export type CreateIntegracaoInput = IntegracaoInsert;
export type UpdateIntegracaoInput = IntegracaoUpdate;
export type CreateWebhookInput = WebhookConfigInsert;
export type UpdateWebhookInput = WebhookConfigUpdate;

// ============================================
// INPUTS CUSTOMIZADOS
// ============================================

export interface AvaliarChamadoInput {
  avaliacao_nota: number;
  avaliacao_comentario?: string;
}

export interface CreateIntegracaoApiInput {
  nome: string;
  tipo: IntegracaoTipo;
  ambiente?: IntegracaoAmbiente;
  scopes?: string[];
  ip_whitelist?: string[];
  rate_limit_minuto?: number;
}

export interface UpdateWebhookConfigInput {
  nome?: string;
  url_destino?: string;
  eventos?: WebhookEvento[];
  headers_custom?: Record<string, string>;
  ativo?: boolean;
  retry_config?: {
    max_retries: number;
    retry_delay_ms: number;
  };
}

export interface IntegracoesFilters extends BaseFilters {
  tipo?: IntegracaoTipo;
  status?: IntegracaoStatus;
  ambiente?: IntegracaoAmbiente;
}

// ============================================
// RESPOSTAS E ESTATÍSTICAS
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ChamadoStats {
  total: number;
  novos: number;
  em_atendimento: number;
  resolvidos: number;
  por_categoria: Record<string, number>;
  avaliacao_media: number | null;
  tempo_medio_resolucao_horas: number | null;
}

export interface OcorrenciaStats {
  total: number;
  abertas: number;
  em_andamento: number;
  resolvidas: number;
  por_categoria: Record<string, number>;
  tempo_medio_resolucao_horas: number | null;
}

export interface DashboardFinanceiro {
  saldo_total: number;
  receitas_mes: number;
  despesas_mes: number;
  inadimplencia_percentual: number;
  contas: {
    id: string;
    nome: string;
    banco: string;
    saldo_atual: number;
    principal: boolean;
  }[];
}

export interface AssembleiaStats {
  total: number;
  por_status: Record<AssembleiaStatus, number>;
  quorum_medio: number;
  participacao_media: number;
}
