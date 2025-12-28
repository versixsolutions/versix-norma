import { z } from 'zod';

// ENUMs
export const integracaoTipoSchema = z.enum(['api', 'webhook', 'conector']);
export const integracaoStatusSchema = z.enum(['ativa', 'pausada', 'erro', 'desativada']);

export const webhookEventoSchema = z.enum([
  'comunicado.publicado',
  'assembleia.criada', 'assembleia.convocada', 'assembleia.iniciada', 'assembleia.encerrada',
  'pagamento.criado', 'pagamento.confirmado', 'pagamento.vencido',
  'ocorrencia.criada', 'ocorrencia.resolvida',
  'chamado.criado', 'chamado.atualizado',
  'morador.cadastrado', 'morador.aprovado', 'morador.removido',
  'reserva.criada', 'reserva.aprovada', 'reserva.cancelada'
]);

export const conectorTipoSchema = z.enum(['google_calendar', 'asaas', 's3_backup', 'zapier', 'ical']);
export const exportacaoFormatoSchema = z.enum(['csv', 'ofx', 'pdf', 'xlsx']);
export const exportacaoTipoSchema = z.enum(['financeiro', 'moradores', 'ocorrencias', 'reservas', 'completo']);

// Criar API
export const createIntegracaoApiSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  descricao: z.string().max(500).optional(),
  scopes: z.array(z.string()).default([])
});

// Criar Webhook
export const createWebhookSchema = z.object({
  nome: z.string().min(3).max(100),
  url_destino: z.string().url('URL inválida').max(500),
  eventos: z.array(webhookEventoSchema).min(1, 'Selecione pelo menos um evento'),
  headers_custom: z.record(z.string()).optional()
});

// Atualizar Webhook Config
export const updateWebhookConfigSchema = z.object({
  eventos: z.array(webhookEventoSchema).optional(),
  max_tentativas: z.number().int().min(1).max(10).optional(),
  timeout_segundos: z.number().int().min(5).max(60).optional(),
  ativo: z.boolean().optional()
});

// Criar Exportação
export const createExportacaoSchema = z.object({
  tipo: exportacaoTipoSchema,
  formato: exportacaoFormatoSchema,
  periodo_inicio: z.string().optional(),
  periodo_fim: z.string().optional(),
  filtros: z.record(z.any()).optional()
});

// Google Calendar Config
export const googleCalendarConfigSchema = z.object({
  calendar_id: z.string().min(1),
  sync_assembleias: z.boolean().default(true),
  sync_reservas: z.boolean().default(true)
});

// Asaas Config
export const asaasConfigSchema = z.object({
  api_key: z.string().min(1),
  wallet_id: z.string().optional(),
  sandbox: z.boolean().default(false)
});

// S3 Backup Config
export const s3BackupConfigSchema = z.object({
  bucket: z.string().min(1),
  region: z.string().min(1),
  prefix: z.string().default('backups/'),
  access_key_id: z.string().min(1),
  secret_access_key: z.string().min(1)
});

// Filtros
export const integracoesFiltersSchema = z.object({
  tipo: integracaoTipoSchema.optional(),
  status: integracaoStatusSchema.optional()
});

export const apiLogsFiltersSchema = z.object({
  integracao_id: z.string().uuid().optional(),
  method: z.string().optional(),
  erro: z.boolean().optional(),
  data_inicio: z.string().datetime().optional(),
  data_fim: z.string().datetime().optional()
});

// Type exports
export type CreateIntegracaoApiInput = z.infer<typeof createIntegracaoApiSchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookConfigInput = z.infer<typeof updateWebhookConfigSchema>;
export type CreateExportacaoInput = z.infer<typeof createExportacaoSchema>;
export type GoogleCalendarConfig = z.infer<typeof googleCalendarConfigSchema>;
export type AsaasConfig = z.infer<typeof asaasConfigSchema>;
export type S3BackupConfig = z.infer<typeof s3BackupConfigSchema>;
