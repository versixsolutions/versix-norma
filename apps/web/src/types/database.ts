export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      api_logs: {
        Row: {
          body_size: number | null;
          created_at: string;
          erro_codigo: string | null;
          erro_mensagem: string | null;
          headers: Json | null;
          id: string;
          integracao_id: string | null;
          ip_address: unknown;
          metodo: string;
          path: string;
          query_params: Json | null;
          response_size: number | null;
          response_time_ms: number;
          status_code: number;
          user_agent: string | null;
        };
        Insert: {
          body_size?: number | null;
          created_at?: string;
          erro_codigo?: string | null;
          erro_mensagem?: string | null;
          headers?: Json | null;
          id?: string;
          integracao_id?: string | null;
          ip_address?: unknown;
          metodo: string;
          path: string;
          query_params?: Json | null;
          response_size?: number | null;
          response_time_ms: number;
          status_code: number;
          user_agent?: string | null;
        };
        Update: {
          body_size?: number | null;
          created_at?: string;
          erro_codigo?: string | null;
          erro_mensagem?: string | null;
          headers?: Json | null;
          id?: string;
          integracao_id?: string | null;
          ip_address?: unknown;
          metodo?: string;
          path?: string;
          query_params?: Json | null;
          response_size?: number | null;
          response_time_ms?: number;
          status_code?: number;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'api_logs_integracao_id_fkey';
            columns: ['integracao_id'];
            isOneToOne: false;
            referencedRelation: 'integracoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'api_logs_integracao_id_fkey';
            columns: ['integracao_id'];
            isOneToOne: false;
            referencedRelation: 'v_api_stats_diario';
            referencedColumns: ['integracao_id'];
          },
          {
            foreignKeyName: 'api_logs_integracao_id_fkey';
            columns: ['integracao_id'];
            isOneToOne: false;
            referencedRelation: 'v_integracoes_resumo';
            referencedColumns: ['id'];
          },
        ];
      };
      api_scopes: {
        Row: {
          ativo: boolean;
          categoria: string;
          codigo: string;
          created_at: string;
          descricao: string | null;
          id: string;
          nome: string;
          recursos: string[];
          requer_role: Database['public']['Enums']['user_role'][] | null;
          tipo: string;
        };
        Insert: {
          ativo?: boolean;
          categoria: string;
          codigo: string;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          nome: string;
          recursos: string[];
          requer_role?: Database['public']['Enums']['user_role'][] | null;
          tipo: string;
        };
        Update: {
          ativo?: boolean;
          categoria?: string;
          codigo?: string;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          nome?: string;
          recursos?: string[];
          requer_role?: Database['public']['Enums']['user_role'][] | null;
          tipo?: string;
        };
        Relationships: [];
      };
      assembleia_assinaturas: {
        Row: {
          assembleia_id: string;
          assinado_em: string;
          created_at: string;
          documento_hash: string;
          id: string;
          ip_address: unknown;
          papel: string;
          user_agent: string | null;
          usuario_id: string;
        };
        Insert: {
          assembleia_id: string;
          assinado_em?: string;
          created_at?: string;
          documento_hash: string;
          id?: string;
          ip_address?: unknown;
          papel: string;
          user_agent?: string | null;
          usuario_id: string;
        };
        Update: {
          assembleia_id?: string;
          assinado_em?: string;
          created_at?: string;
          documento_hash?: string;
          id?: string;
          ip_address?: unknown;
          papel?: string;
          user_agent?: string | null;
          usuario_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleia_assinaturas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'assembleias';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_assinaturas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_quorum';
            referencedColumns: ['assembleia_id'];
          },
          {
            foreignKeyName: 'assembleia_assinaturas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_resumo';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_assinaturas_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      assembleia_logs: {
        Row: {
          acao: string;
          assembleia_id: string;
          created_at: string;
          detalhes: Json | null;
          id: string;
          ip_address: unknown;
          usuario_id: string | null;
        };
        Insert: {
          acao: string;
          assembleia_id: string;
          created_at?: string;
          detalhes?: Json | null;
          id?: string;
          ip_address?: unknown;
          usuario_id?: string | null;
        };
        Update: {
          acao?: string;
          assembleia_id?: string;
          created_at?: string;
          detalhes?: Json | null;
          id?: string;
          ip_address?: unknown;
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleia_logs_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'assembleias';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_logs_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_quorum';
            referencedColumns: ['assembleia_id'];
          },
          {
            foreignKeyName: 'assembleia_logs_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_resumo';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_logs_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      assembleia_pauta_opcoes: {
        Row: {
          candidato_id: string | null;
          candidato_nome: string | null;
          candidato_unidade: string | null;
          created_at: string;
          descricao: string | null;
          eleito: boolean;
          id: string;
          ordem: number;
          pauta_id: string;
          titulo: string;
          votos_count: number;
          votos_fracao: number;
        };
        Insert: {
          candidato_id?: string | null;
          candidato_nome?: string | null;
          candidato_unidade?: string | null;
          created_at?: string;
          descricao?: string | null;
          eleito?: boolean;
          id?: string;
          ordem: number;
          pauta_id: string;
          titulo: string;
          votos_count?: number;
          votos_fracao?: number;
        };
        Update: {
          candidato_id?: string | null;
          candidato_nome?: string | null;
          candidato_unidade?: string | null;
          created_at?: string;
          descricao?: string | null;
          eleito?: boolean;
          id?: string;
          ordem?: number;
          pauta_id?: string;
          titulo?: string;
          votos_count?: number;
          votos_fracao?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleia_pauta_opcoes_candidato_id_fkey';
            columns: ['candidato_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_pauta_opcoes_pauta_id_fkey';
            columns: ['pauta_id'];
            isOneToOne: false;
            referencedRelation: 'assembleia_pautas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_pauta_opcoes_pauta_id_fkey';
            columns: ['pauta_id'];
            isOneToOne: false;
            referencedRelation: 'v_pauta_resultado';
            referencedColumns: ['pauta_id'];
          },
        ];
      };
      assembleia_pautas: {
        Row: {
          assembleia_id: string;
          bloqueia_inadimplentes: boolean;
          cargo: string | null;
          created_at: string;
          descricao: string | null;
          id: string;
          max_eleitos: number | null;
          ordem: number;
          permite_abstencao: boolean;
          quorum_especial: Database['public']['Enums']['quorum_especial'] | null;
          resultado: Json | null;
          status: Database['public']['Enums']['pauta_status'];
          tipo_votacao: Database['public']['Enums']['pauta_tipo_votacao'];
          titulo: string;
          updated_at: string;
          votacao_encerrada_em: string | null;
          votacao_iniciada_em: string | null;
          voto_secreto: boolean;
        };
        Insert: {
          assembleia_id: string;
          bloqueia_inadimplentes?: boolean;
          cargo?: string | null;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          max_eleitos?: number | null;
          ordem: number;
          permite_abstencao?: boolean;
          quorum_especial?: Database['public']['Enums']['quorum_especial'] | null;
          resultado?: Json | null;
          status?: Database['public']['Enums']['pauta_status'];
          tipo_votacao?: Database['public']['Enums']['pauta_tipo_votacao'];
          titulo: string;
          updated_at?: string;
          votacao_encerrada_em?: string | null;
          votacao_iniciada_em?: string | null;
          voto_secreto?: boolean;
        };
        Update: {
          assembleia_id?: string;
          bloqueia_inadimplentes?: boolean;
          cargo?: string | null;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          max_eleitos?: number | null;
          ordem?: number;
          permite_abstencao?: boolean;
          quorum_especial?: Database['public']['Enums']['quorum_especial'] | null;
          resultado?: Json | null;
          status?: Database['public']['Enums']['pauta_status'];
          tipo_votacao?: Database['public']['Enums']['pauta_tipo_votacao'];
          titulo?: string;
          updated_at?: string;
          votacao_encerrada_em?: string | null;
          votacao_iniciada_em?: string | null;
          voto_secreto?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleia_pautas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'assembleias';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_pautas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_quorum';
            referencedColumns: ['assembleia_id'];
          },
          {
            foreignKeyName: 'assembleia_pautas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_resumo';
            referencedColumns: ['id'];
          },
        ];
      };
      assembleia_presencas: {
        Row: {
          assembleia_id: string;
          check_in_at: string;
          check_out_at: string | null;
          created_at: string;
          dispositivo: string | null;
          fracao_ideal: number;
          id: string;
          ip_address: unknown;
          procuracao_id: string | null;
          representante_id: string | null;
          tipo: Database['public']['Enums']['presenca_tipo'];
          unidade_id: string;
          user_agent: string | null;
          usuario_id: string;
        };
        Insert: {
          assembleia_id: string;
          check_in_at?: string;
          check_out_at?: string | null;
          created_at?: string;
          dispositivo?: string | null;
          fracao_ideal: number;
          id?: string;
          ip_address?: unknown;
          procuracao_id?: string | null;
          representante_id?: string | null;
          tipo: Database['public']['Enums']['presenca_tipo'];
          unidade_id: string;
          user_agent?: string | null;
          usuario_id: string;
        };
        Update: {
          assembleia_id?: string;
          check_in_at?: string;
          check_out_at?: string | null;
          created_at?: string;
          dispositivo?: string | null;
          fracao_ideal?: number;
          id?: string;
          ip_address?: unknown;
          procuracao_id?: string | null;
          representante_id?: string | null;
          tipo?: Database['public']['Enums']['presenca_tipo'];
          unidade_id?: string;
          user_agent?: string | null;
          usuario_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleia_presencas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'assembleias';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_presencas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_quorum';
            referencedColumns: ['assembleia_id'];
          },
          {
            foreignKeyName: 'assembleia_presencas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_resumo';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_presencas_representante_id_fkey';
            columns: ['representante_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_presencas_unidade_id_fkey';
            columns: ['unidade_id'];
            isOneToOne: false;
            referencedRelation: 'unidades_habitacionais';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_presencas_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      assembleia_procuracoes: {
        Row: {
          aceite_em: string | null;
          aceite_ip: unknown;
          assembleia_id: string | null;
          condominio_id: string;
          created_at: string;
          documento_hash: string | null;
          documento_path: string | null;
          id: string;
          outorgado_id: string;
          outorgante_id: string;
          outorgante_unidade_id: string;
          pode_falar: boolean;
          pode_votar: boolean;
          restricoes: string | null;
          status: Database['public']['Enums']['procuracao_status'];
          updated_at: string;
          validade_fim: string | null;
          validade_inicio: string;
        };
        Insert: {
          aceite_em?: string | null;
          aceite_ip?: unknown;
          assembleia_id?: string | null;
          condominio_id: string;
          created_at?: string;
          documento_hash?: string | null;
          documento_path?: string | null;
          id?: string;
          outorgado_id: string;
          outorgante_id: string;
          outorgante_unidade_id: string;
          pode_falar?: boolean;
          pode_votar?: boolean;
          restricoes?: string | null;
          status?: Database['public']['Enums']['procuracao_status'];
          updated_at?: string;
          validade_fim?: string | null;
          validade_inicio?: string;
        };
        Update: {
          aceite_em?: string | null;
          aceite_ip?: unknown;
          assembleia_id?: string | null;
          condominio_id?: string;
          created_at?: string;
          documento_hash?: string | null;
          documento_path?: string | null;
          id?: string;
          outorgado_id?: string;
          outorgante_id?: string;
          outorgante_unidade_id?: string;
          pode_falar?: boolean;
          pode_votar?: boolean;
          restricoes?: string | null;
          status?: Database['public']['Enums']['procuracao_status'];
          updated_at?: string;
          validade_fim?: string | null;
          validade_inicio?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleia_procuracoes_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'assembleias';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_procuracoes_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_quorum';
            referencedColumns: ['assembleia_id'];
          },
          {
            foreignKeyName: 'assembleia_procuracoes_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_resumo';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_procuracoes_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_procuracoes_outorgado_id_fkey';
            columns: ['outorgado_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_procuracoes_outorgante_id_fkey';
            columns: ['outorgante_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_procuracoes_outorgante_unidade_id_fkey';
            columns: ['outorgante_unidade_id'];
            isOneToOne: false;
            referencedRelation: 'unidades_habitacionais';
            referencedColumns: ['id'];
          },
        ];
      };
      assembleia_votos: {
        Row: {
          created_at: string;
          fracao_ideal: number;
          id: string;
          ip_address: unknown;
          opcao_id: string | null;
          pauta_id: string;
          presenca_id: string;
          unidade_id: string | null;
          usuario_id: string | null;
          votado_em: string;
          voto: Database['public']['Enums']['voto_tipo'];
          voto_anterior_hash: string | null;
          voto_hash: string;
        };
        Insert: {
          created_at?: string;
          fracao_ideal: number;
          id?: string;
          ip_address?: unknown;
          opcao_id?: string | null;
          pauta_id: string;
          presenca_id: string;
          unidade_id?: string | null;
          usuario_id?: string | null;
          votado_em?: string;
          voto: Database['public']['Enums']['voto_tipo'];
          voto_anterior_hash?: string | null;
          voto_hash: string;
        };
        Update: {
          created_at?: string;
          fracao_ideal?: number;
          id?: string;
          ip_address?: unknown;
          opcao_id?: string | null;
          pauta_id?: string;
          presenca_id?: string;
          unidade_id?: string | null;
          usuario_id?: string | null;
          votado_em?: string;
          voto?: Database['public']['Enums']['voto_tipo'];
          voto_anterior_hash?: string | null;
          voto_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleia_votos_opcao_id_fkey';
            columns: ['opcao_id'];
            isOneToOne: false;
            referencedRelation: 'assembleia_pauta_opcoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_votos_pauta_id_fkey';
            columns: ['pauta_id'];
            isOneToOne: false;
            referencedRelation: 'assembleia_pautas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_votos_pauta_id_fkey';
            columns: ['pauta_id'];
            isOneToOne: false;
            referencedRelation: 'v_pauta_resultado';
            referencedColumns: ['pauta_id'];
          },
          {
            foreignKeyName: 'assembleia_votos_presenca_id_fkey';
            columns: ['presenca_id'];
            isOneToOne: false;
            referencedRelation: 'assembleia_presencas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_votos_unidade_id_fkey';
            columns: ['unidade_id'];
            isOneToOne: false;
            referencedRelation: 'unidades_habitacionais';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_votos_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      assembleias: {
        Row: {
          ano_referencia: number;
          arquivada_em: string | null;
          ata_hash: string | null;
          ata_pdf_path: string | null;
          ata_texto: string | null;
          codigo_acesso_video: string | null;
          condominio_id: string;
          convocada_em: string | null;
          created_at: string;
          criado_por: string | null;
          data_fim: string | null;
          data_inicio: string | null;
          data_limite_voto_antecipado: string | null;
          data_primeira_convocacao: string | null;
          data_segunda_convocacao: string | null;
          descricao: string | null;
          encerrada_em: string | null;
          endereco_presencial: string | null;
          id: string;
          iniciada_em: string | null;
          link_video: string | null;
          local_presencial: string | null;
          max_procuracoes_por_pessoa: number;
          numero_sequencial: number | null;
          observacoes_internas: string | null;
          permite_procuracao: boolean;
          permite_voto_antecipado: boolean;
          qr_token: string | null;
          quorum_atingido: number | null;
          quorum_minimo_primeira: number;
          quorum_minimo_segunda: number;
          status: Database['public']['Enums']['assembleia_status'];
          tipo: Database['public']['Enums']['assembleia_tipo'];
          titulo: string;
          updated_at: string;
        };
        Insert: {
          ano_referencia?: number;
          arquivada_em?: string | null;
          ata_hash?: string | null;
          ata_pdf_path?: string | null;
          ata_texto?: string | null;
          codigo_acesso_video?: string | null;
          condominio_id: string;
          convocada_em?: string | null;
          created_at?: string;
          criado_por?: string | null;
          data_fim?: string | null;
          data_inicio?: string | null;
          data_limite_voto_antecipado?: string | null;
          data_primeira_convocacao?: string | null;
          data_segunda_convocacao?: string | null;
          descricao?: string | null;
          encerrada_em?: string | null;
          endereco_presencial?: string | null;
          id?: string;
          iniciada_em?: string | null;
          link_video?: string | null;
          local_presencial?: string | null;
          max_procuracoes_por_pessoa?: number;
          numero_sequencial?: number | null;
          observacoes_internas?: string | null;
          permite_procuracao?: boolean;
          permite_voto_antecipado?: boolean;
          qr_token?: string | null;
          quorum_atingido?: number | null;
          quorum_minimo_primeira?: number;
          quorum_minimo_segunda?: number;
          status?: Database['public']['Enums']['assembleia_status'];
          tipo: Database['public']['Enums']['assembleia_tipo'];
          titulo: string;
          updated_at?: string;
        };
        Update: {
          ano_referencia?: number;
          arquivada_em?: string | null;
          ata_hash?: string | null;
          ata_pdf_path?: string | null;
          ata_texto?: string | null;
          codigo_acesso_video?: string | null;
          condominio_id?: string;
          convocada_em?: string | null;
          created_at?: string;
          criado_por?: string | null;
          data_fim?: string | null;
          data_inicio?: string | null;
          data_limite_voto_antecipado?: string | null;
          data_primeira_convocacao?: string | null;
          data_segunda_convocacao?: string | null;
          descricao?: string | null;
          encerrada_em?: string | null;
          endereco_presencial?: string | null;
          id?: string;
          iniciada_em?: string | null;
          link_video?: string | null;
          local_presencial?: string | null;
          max_procuracoes_por_pessoa?: number;
          numero_sequencial?: number | null;
          observacoes_internas?: string | null;
          permite_procuracao?: boolean;
          permite_voto_antecipado?: boolean;
          qr_token?: string | null;
          quorum_atingido?: number | null;
          quorum_minimo_primeira?: number;
          quorum_minimo_segunda?: number;
          status?: Database['public']['Enums']['assembleia_status'];
          tipo?: Database['public']['Enums']['assembleia_tipo'];
          titulo?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleias_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleias_criado_por_fkey';
            columns: ['criado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      atas_validacao: {
        Row: {
          arquivo_url: string | null;
          condominio_id: string;
          conteudo: string;
          created_at: string;
          created_by: string | null;
          hash_documento: string | null;
          id: string;
          motivo_rejeicao: string | null;
          status: Database['public']['Enums']['ata_status'];
          tipo: string;
          titulo: string;
          updated_at: string;
          validado_em: string | null;
          validado_por: string | null;
        };
        Insert: {
          arquivo_url?: string | null;
          condominio_id: string;
          conteudo: string;
          created_at?: string;
          created_by?: string | null;
          hash_documento?: string | null;
          id?: string;
          motivo_rejeicao?: string | null;
          status?: Database['public']['Enums']['ata_status'];
          tipo?: string;
          titulo: string;
          updated_at?: string;
          validado_em?: string | null;
          validado_por?: string | null;
        };
        Update: {
          arquivo_url?: string | null;
          condominio_id?: string;
          conteudo?: string;
          created_at?: string;
          created_by?: string | null;
          hash_documento?: string | null;
          id?: string;
          motivo_rejeicao?: string | null;
          status?: Database['public']['Enums']['ata_status'];
          tipo?: string;
          titulo?: string;
          updated_at?: string;
          validado_em?: string | null;
          validado_por?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'atas_validacao_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'atas_validacao_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'atas_validacao_validado_por_fkey';
            columns: ['validado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_logs: {
        Row: {
          acao: string;
          condominio_id: string | null;
          created_at: string;
          dados_antes: Json | null;
          dados_depois: Json | null;
          id: string;
          ip_address: unknown;
          registro_id: string | null;
          tabela: string;
          user_agent: string | null;
          usuario_id: string | null;
        };
        Insert: {
          acao: string;
          condominio_id?: string | null;
          created_at?: string;
          dados_antes?: Json | null;
          dados_depois?: Json | null;
          id?: string;
          ip_address?: unknown;
          registro_id?: string | null;
          tabela: string;
          user_agent?: string | null;
          usuario_id?: string | null;
        };
        Update: {
          acao?: string;
          condominio_id?: string | null;
          created_at?: string;
          dados_antes?: Json | null;
          dados_depois?: Json | null;
          id?: string;
          ip_address?: unknown;
          registro_id?: string | null;
          tabela?: string;
          user_agent?: string | null;
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audit_logs_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      biometric_credentials: {
        Row: {
          credential_id: string;
          id: string;
          public_key: string;
          usuario_id: string;
        };
        Insert: {
          credential_id: string;
          id?: string;
          public_key: string;
          usuario_id: string;
        };
        Update: {
          credential_id?: string;
          id?: string;
          public_key?: string;
          usuario_id?: string;
        };
        Relationships: [];
      };
      blocos: {
        Row: {
          andares: number | null;
          condominio_id: string;
          created_at: string;
          descricao: string | null;
          id: string;
          nome: string;
          unidades_por_andar: number | null;
          updated_at: string;
        };
        Insert: {
          andares?: number | null;
          condominio_id: string;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          nome: string;
          unidades_por_andar?: number | null;
          updated_at?: string;
        };
        Update: {
          andares?: number | null;
          condominio_id?: string;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          nome?: string;
          unidades_por_andar?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blocos_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      categorias_financeiras: {
        Row: {
          ativo: boolean;
          codigo: string;
          condominio_id: string;
          created_at: string;
          deleted_at: string | null;
          id: string;
          nome: string;
          orcamento_anual: number | null;
          ordem: number;
          parent_id: string | null;
          tipo: Database['public']['Enums']['categoria_tipo'];
          updated_at: string;
        };
        Insert: {
          ativo?: boolean;
          codigo: string;
          condominio_id: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          nome: string;
          orcamento_anual?: number | null;
          ordem?: number;
          parent_id?: string | null;
          tipo: Database['public']['Enums']['categoria_tipo'];
          updated_at?: string;
        };
        Update: {
          ativo?: boolean;
          codigo?: string;
          condominio_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          nome?: string;
          orcamento_anual?: number | null;
          ordem?: number;
          parent_id?: string | null;
          tipo?: Database['public']['Enums']['categoria_tipo'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categorias_financeiras_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'categorias_financeiras_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'categorias_financeiras';
            referencedColumns: ['id'];
          },
        ];
      };
      chamados: {
        Row: {
          anexos: Json | null;
          atendente_id: string | null;
          avaliacao_comentario: string | null;
          avaliacao_nota: number | null;
          avaliado_em: string | null;
          categoria: Database['public']['Enums']['chamado_categoria'];
          condominio_id: string;
          created_at: string;
          deleted_at: string | null;
          descricao: string;
          id: string;
          prioridade: Database['public']['Enums']['prioridade'];
          resolvido_em: string | null;
          resposta_final: string | null;
          solicitante_id: string;
          status: Database['public']['Enums']['chamado_status'];
          titulo: string;
          updated_at: string;
        };
        Insert: {
          anexos?: Json | null;
          atendente_id?: string | null;
          avaliacao_comentario?: string | null;
          avaliacao_nota?: number | null;
          avaliado_em?: string | null;
          categoria?: Database['public']['Enums']['chamado_categoria'];
          condominio_id: string;
          created_at?: string;
          deleted_at?: string | null;
          descricao: string;
          id?: string;
          prioridade?: Database['public']['Enums']['prioridade'];
          resolvido_em?: string | null;
          resposta_final?: string | null;
          solicitante_id: string;
          status?: Database['public']['Enums']['chamado_status'];
          titulo: string;
          updated_at?: string;
        };
        Update: {
          anexos?: Json | null;
          atendente_id?: string | null;
          avaliacao_comentario?: string | null;
          avaliacao_nota?: number | null;
          avaliado_em?: string | null;
          categoria?: Database['public']['Enums']['chamado_categoria'];
          condominio_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          descricao?: string;
          id?: string;
          prioridade?: Database['public']['Enums']['prioridade'];
          resolvido_em?: string | null;
          resposta_final?: string | null;
          solicitante_id?: string;
          status?: Database['public']['Enums']['chamado_status'];
          titulo?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chamados_atendente_id_fkey';
            columns: ['atendente_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chamados_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chamados_solicitante_id_fkey';
            columns: ['solicitante_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      chamados_mensagens: {
        Row: {
          anexos: Json | null;
          autor_id: string;
          chamado_id: string;
          created_at: string;
          id: string;
          interno: boolean;
          mensagem: string;
        };
        Insert: {
          anexos?: Json | null;
          autor_id: string;
          chamado_id: string;
          created_at?: string;
          id?: string;
          interno?: boolean;
          mensagem: string;
        };
        Update: {
          anexos?: Json | null;
          autor_id?: string;
          chamado_id?: string;
          created_at?: string;
          id?: string;
          interno?: boolean;
          mensagem?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chamados_mensagens_autor_id_fkey';
            columns: ['autor_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chamados_mensagens_chamado_id_fkey';
            columns: ['chamado_id'];
            isOneToOne: false;
            referencedRelation: 'chamados';
            referencedColumns: ['id'];
          },
        ];
      };
      codigos_convite_uso: {
        Row: {
          codigo_usado: string;
          condominio_id: string;
          id: string;
          usado_em: string;
          usuario_id: string | null;
        };
        Insert: {
          codigo_usado: string;
          condominio_id: string;
          id?: string;
          usado_em?: string;
          usuario_id?: string | null;
        };
        Update: {
          codigo_usado?: string;
          condominio_id?: string;
          id?: string;
          usado_em?: string;
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'codigos_convite_uso_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'codigos_convite_uso_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      comunicados: {
        Row: {
          anexos: Json | null;
          autor_id: string;
          categoria: Database['public']['Enums']['comunicado_categoria'];
          condominio_id: string;
          conteudo: string;
          created_at: string;
          destaque: boolean | null;
          destinatarios_blocos: string[] | null;
          destinatarios_unidades: string[] | null;
          expirar_em: string | null;
          fixado: boolean;
          id: string;
          prioridade: Database['public']['Enums']['prioridade'];
          publicado: boolean;
          publicar_em: string | null;
          published_at: string | null;
          resumo: string | null;
          status: Database['public']['Enums']['comunicado_status'] | null;
          titulo: string;
          updated_at: string;
          visualizacoes: number;
        };
        Insert: {
          anexos?: Json | null;
          autor_id: string;
          categoria?: Database['public']['Enums']['comunicado_categoria'];
          condominio_id: string;
          conteudo: string;
          created_at?: string;
          destaque?: boolean | null;
          destinatarios_blocos?: string[] | null;
          destinatarios_unidades?: string[] | null;
          expirar_em?: string | null;
          fixado?: boolean;
          id?: string;
          prioridade?: Database['public']['Enums']['prioridade'];
          publicado?: boolean;
          publicar_em?: string | null;
          published_at?: string | null;
          resumo?: string | null;
          status?: Database['public']['Enums']['comunicado_status'] | null;
          titulo: string;
          updated_at?: string;
          visualizacoes?: number;
        };
        Update: {
          anexos?: Json | null;
          autor_id?: string;
          categoria?: Database['public']['Enums']['comunicado_categoria'];
          condominio_id?: string;
          conteudo?: string;
          created_at?: string;
          destaque?: boolean | null;
          destinatarios_blocos?: string[] | null;
          destinatarios_unidades?: string[] | null;
          expirar_em?: string | null;
          fixado?: boolean;
          id?: string;
          prioridade?: Database['public']['Enums']['prioridade'];
          publicado?: boolean;
          publicar_em?: string | null;
          published_at?: string | null;
          resumo?: string | null;
          status?: Database['public']['Enums']['comunicado_status'] | null;
          titulo?: string;
          updated_at?: string;
          visualizacoes?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'comunicados_autor_id_fkey';
            columns: ['autor_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comunicados_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      comunicados_leitura: {
        Row: {
          comunicado_id: string;
          id: string;
          lido_em: string;
          usuario_id: string;
        };
        Insert: {
          comunicado_id: string;
          id?: string;
          lido_em?: string;
          usuario_id: string;
        };
        Update: {
          comunicado_id?: string;
          id?: string;
          lido_em?: string;
          usuario_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comunicados_leitura_comunicado_id_fkey';
            columns: ['comunicado_id'];
            isOneToOne: false;
            referencedRelation: 'comunicados';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comunicados_leitura_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      condominios: {
        Row: {
          ativo: boolean;
          bairro: string;
          cep: string;
          cidade: string;
          cnpj: string | null;
          codigo_convite: string;
          codigo_convite_expira_em: string | null;
          codigo_convite_validade_dias: number | null;
          complemento: string | null;
          cor_primaria: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          email: string | null;
          endereco: string;
          estado: string;
          id: string;
          logo_url: string | null;
          nome: string;
          numero: string | null;
          telefone: string | null;
          tier: Database['public']['Enums']['tier_type'];
          total_unidades: number;
          updated_at: string;
        };
        Insert: {
          ativo?: boolean;
          bairro: string;
          cep: string;
          cidade: string;
          cnpj?: string | null;
          codigo_convite?: string;
          codigo_convite_expira_em?: string | null;
          codigo_convite_validade_dias?: number | null;
          complemento?: string | null;
          cor_primaria?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          endereco: string;
          estado: string;
          id?: string;
          logo_url?: string | null;
          nome: string;
          numero?: string | null;
          telefone?: string | null;
          tier?: Database['public']['Enums']['tier_type'];
          total_unidades: number;
          updated_at?: string;
        };
        Update: {
          ativo?: boolean;
          bairro?: string;
          cep?: string;
          cidade?: string;
          cnpj?: string | null;
          codigo_convite?: string;
          codigo_convite_expira_em?: string | null;
          codigo_convite_validade_dias?: number | null;
          complemento?: string | null;
          cor_primaria?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          endereco?: string;
          estado?: string;
          id?: string;
          logo_url?: string | null;
          nome?: string;
          numero?: string | null;
          telefone?: string | null;
          tier?: Database['public']['Enums']['tier_type'];
          total_unidades?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      conectores: {
        Row: {
          config: Json;
          created_at: string;
          credenciais_encrypted: string | null;
          id: string;
          integracao_id: string;
          mapeamento: Json | null;
          provider: string;
          proxima_sync_em: string | null;
          sync_habilitado: boolean;
          sync_intervalo_minutos: number | null;
          tipo: Database['public']['Enums']['conector_tipo'];
          total_registros_exportados: number;
          total_registros_importados: number;
          total_syncs: number;
          ultima_sync_em: string | null;
          ultima_sync_erro: string | null;
          ultima_sync_status: string | null;
          updated_at: string;
        };
        Insert: {
          config?: Json;
          created_at?: string;
          credenciais_encrypted?: string | null;
          id?: string;
          integracao_id: string;
          mapeamento?: Json | null;
          provider: string;
          proxima_sync_em?: string | null;
          sync_habilitado?: boolean;
          sync_intervalo_minutos?: number | null;
          tipo: Database['public']['Enums']['conector_tipo'];
          total_registros_exportados?: number;
          total_registros_importados?: number;
          total_syncs?: number;
          ultima_sync_em?: string | null;
          ultima_sync_erro?: string | null;
          ultima_sync_status?: string | null;
          updated_at?: string;
        };
        Update: {
          config?: Json;
          created_at?: string;
          credenciais_encrypted?: string | null;
          id?: string;
          integracao_id?: string;
          mapeamento?: Json | null;
          provider?: string;
          proxima_sync_em?: string | null;
          sync_habilitado?: boolean;
          sync_intervalo_minutos?: number | null;
          tipo?: Database['public']['Enums']['conector_tipo'];
          total_registros_exportados?: number;
          total_registros_importados?: number;
          total_syncs?: number;
          ultima_sync_em?: string | null;
          ultima_sync_erro?: string | null;
          ultima_sync_status?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conectores_integracao_id_fkey';
            columns: ['integracao_id'];
            isOneToOne: false;
            referencedRelation: 'integracoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conectores_integracao_id_fkey';
            columns: ['integracao_id'];
            isOneToOne: false;
            referencedRelation: 'v_api_stats_diario';
            referencedColumns: ['integracao_id'];
          },
          {
            foreignKeyName: 'conectores_integracao_id_fkey';
            columns: ['integracao_id'];
            isOneToOne: false;
            referencedRelation: 'v_integracoes_resumo';
            referencedColumns: ['id'];
          },
        ];
      };
      configuracoes_financeiras: {
        Row: {
          condominio_id: string;
          created_at: string;
          desconto_pontualidade_dias: number;
          desconto_pontualidade_percentual: number;
          dia_vencimento: number;
          dias_carencia: number;
          fundo_reserva_percentual: number;
          id: string;
          juros_mensal_percentual: number;
          multa_percentual: number;
          taxa_ordinaria_base: number;
          updated_at: string;
        };
        Insert: {
          condominio_id: string;
          created_at?: string;
          desconto_pontualidade_dias?: number;
          desconto_pontualidade_percentual?: number;
          dia_vencimento?: number;
          dias_carencia?: number;
          fundo_reserva_percentual?: number;
          id?: string;
          juros_mensal_percentual?: number;
          multa_percentual?: number;
          taxa_ordinaria_base?: number;
          updated_at?: string;
        };
        Update: {
          condominio_id?: string;
          created_at?: string;
          desconto_pontualidade_dias?: number;
          desconto_pontualidade_percentual?: number;
          dia_vencimento?: number;
          dias_carencia?: number;
          fundo_reserva_percentual?: number;
          id?: string;
          juros_mensal_percentual?: number;
          multa_percentual?: number;
          taxa_ordinaria_base?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'configuracoes_financeiras_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: true;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      contas_bancarias: {
        Row: {
          agencia: string;
          ativo: boolean;
          banco_codigo: string;
          banco_nome: string;
          condominio_id: string;
          conta: string;
          created_at: string;
          data_saldo: string;
          deleted_at: string | null;
          id: string;
          nome_exibicao: string;
          principal: boolean;
          saldo_atual: number;
          saldo_inicial: number;
          tipo_conta: string;
          updated_at: string;
        };
        Insert: {
          agencia: string;
          ativo?: boolean;
          banco_codigo: string;
          banco_nome: string;
          condominio_id: string;
          conta: string;
          created_at?: string;
          data_saldo?: string;
          deleted_at?: string | null;
          id?: string;
          nome_exibicao: string;
          principal?: boolean;
          saldo_atual?: number;
          saldo_inicial?: number;
          tipo_conta?: string;
          updated_at?: string;
        };
        Update: {
          agencia?: string;
          ativo?: boolean;
          banco_codigo?: string;
          banco_nome?: string;
          condominio_id?: string;
          conta?: string;
          created_at?: string;
          data_saldo?: string;
          deleted_at?: string | null;
          id?: string;
          nome_exibicao?: string;
          principal?: boolean;
          saldo_atual?: number;
          saldo_inicial?: number;
          tipo_conta?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contas_bancarias_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      contas_bancarias_historico: {
        Row: {
          condominio_id: string;
          conta_bancaria_id: string;
          created_at: string;
          id: string;
          mes_referencia: string;
          saldo_final: number;
          saldo_inicial: number;
          total_entradas: number;
          total_saidas: number;
        };
        Insert: {
          condominio_id: string;
          conta_bancaria_id: string;
          created_at?: string;
          id?: string;
          mes_referencia: string;
          saldo_final: number;
          saldo_inicial: number;
          total_entradas?: number;
          total_saidas?: number;
        };
        Update: {
          condominio_id?: string;
          conta_bancaria_id?: string;
          created_at?: string;
          id?: string;
          mes_referencia?: string;
          saldo_final?: number;
          saldo_inicial?: number;
          total_entradas?: number;
          total_saidas?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'contas_bancarias_historico_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contas_bancarias_historico_conta_bancaria_id_fkey';
            columns: ['conta_bancaria_id'];
            isOneToOne: false;
            referencedRelation: 'contas_bancarias';
            referencedColumns: ['id'];
          },
        ];
      };
      cotas_comunicacao: {
        Row: {
          alerta_100_disparado: boolean;
          alerta_50_disparado: boolean;
          alerta_80_disparado: boolean;
          condominio_id: string;
          created_at: string;
          custo_sms_centavos: number;
          custo_total_centavos: number;
          custo_voz_centavos: number;
          custo_whatsapp_centavos: number;
          id: string;
          mes_referencia: string;
          updated_at: string;
          uso_email: number;
          uso_in_app: number;
          uso_push: number;
          uso_sms: number;
          uso_voz_minutos: number;
          uso_whatsapp: number;
        };
        Insert: {
          alerta_100_disparado?: boolean;
          alerta_50_disparado?: boolean;
          alerta_80_disparado?: boolean;
          condominio_id: string;
          created_at?: string;
          custo_sms_centavos?: number;
          custo_total_centavos?: number;
          custo_voz_centavos?: number;
          custo_whatsapp_centavos?: number;
          id?: string;
          mes_referencia: string;
          updated_at?: string;
          uso_email?: number;
          uso_in_app?: number;
          uso_push?: number;
          uso_sms?: number;
          uso_voz_minutos?: number;
          uso_whatsapp?: number;
        };
        Update: {
          alerta_100_disparado?: boolean;
          alerta_50_disparado?: boolean;
          alerta_80_disparado?: boolean;
          condominio_id?: string;
          created_at?: string;
          custo_sms_centavos?: number;
          custo_total_centavos?: number;
          custo_voz_centavos?: number;
          custo_whatsapp_centavos?: number;
          id?: string;
          mes_referencia?: string;
          updated_at?: string;
          uso_email?: number;
          uso_in_app?: number;
          uso_push?: number;
          uso_sms?: number;
          uso_voz_minutos?: number;
          uso_whatsapp?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'cotas_comunicacao_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      emergencias_log: {
        Row: {
          condominio_id: string;
          created_at: string;
          disparado_por: string | null;
          disparado_por_nome: string | null;
          id: string;
          notificacao_id: string | null;
          tempo_primeiro_envio_ms: number | null;
          tipo: string;
          total_destinatarios: number | null;
          total_push_enviados: number | null;
          total_sms_enviados: number | null;
          total_voz_enviados: number | null;
        };
        Insert: {
          condominio_id: string;
          created_at?: string;
          disparado_por?: string | null;
          disparado_por_nome?: string | null;
          id?: string;
          notificacao_id?: string | null;
          tempo_primeiro_envio_ms?: number | null;
          tipo: string;
          total_destinatarios?: number | null;
          total_push_enviados?: number | null;
          total_sms_enviados?: number | null;
          total_voz_enviados?: number | null;
        };
        Update: {
          condominio_id?: string;
          created_at?: string;
          disparado_por?: string | null;
          disparado_por_nome?: string | null;
          id?: string;
          notificacao_id?: string | null;
          tempo_primeiro_envio_ms?: number | null;
          tipo?: string;
          total_destinatarios?: number | null;
          total_push_enviados?: number | null;
          total_sms_enviados?: number | null;
          total_voz_enviados?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'emergencias_log_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'emergencias_log_disparado_por_fkey';
            columns: ['disparado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'emergencias_log_notificacao_id_fkey';
            columns: ['notificacao_id'];
            isOneToOne: false;
            referencedRelation: 'notificacoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'emergencias_log_notificacao_id_fkey';
            columns: ['notificacao_id'];
            isOneToOne: false;
            referencedRelation: 'v_notificacao_stats';
            referencedColumns: ['notificacao_id'];
          },
          {
            foreignKeyName: 'emergencias_log_notificacao_id_fkey';
            columns: ['notificacao_id'];
            isOneToOne: false;
            referencedRelation: 'v_usuario_notificacoes';
            referencedColumns: ['notificacao_id'];
          },
        ];
      };
      faq: {
        Row: {
          ativo: boolean;
          categoria: string | null;
          condominio_id: string;
          created_at: string;
          criado_por: string | null;
          deleted_at: string | null;
          destaque: boolean;
          id: string;
          ordem: number;
          pergunta: string;
          resposta: string;
          updated_at: string;
          visualizacoes: number;
          votos_inutil: number;
          votos_util: number;
        };
        Insert: {
          ativo?: boolean;
          categoria?: string | null;
          condominio_id: string;
          created_at?: string;
          criado_por?: string | null;
          deleted_at?: string | null;
          destaque?: boolean;
          id?: string;
          ordem?: number;
          pergunta: string;
          resposta: string;
          updated_at?: string;
          visualizacoes?: number;
          votos_inutil?: number;
          votos_util?: number;
        };
        Update: {
          ativo?: boolean;
          categoria?: string | null;
          condominio_id?: string;
          created_at?: string;
          criado_por?: string | null;
          deleted_at?: string | null;
          destaque?: boolean;
          id?: string;
          ordem?: number;
          pergunta?: string;
          resposta?: string;
          updated_at?: string;
          visualizacoes?: number;
          votos_inutil?: number;
          votos_util?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'faq_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'faq_criado_por_fkey';
            columns: ['criado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      faq_votos: {
        Row: {
          created_at: string;
          faq_id: string;
          id: string;
          usuario_id: string;
          util: boolean;
        };
        Insert: {
          created_at?: string;
          faq_id: string;
          id?: string;
          usuario_id: string;
          util: boolean;
        };
        Update: {
          created_at?: string;
          faq_id?: string;
          id?: string;
          usuario_id?: string;
          util?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'faq_votos_faq_id_fkey';
            columns: ['faq_id'];
            isOneToOne: false;
            referencedRelation: 'faq';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'faq_votos_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      feature_flags: {
        Row: {
          ativo: boolean;
          condominios_habilitados: string[] | null;
          created_at: string;
          descricao: string | null;
          escopo: string;
          id: string;
          nome: string;
          tiers_habilitados: Database['public']['Enums']['tier_type'][] | null;
          updated_at: string;
        };
        Insert: {
          ativo?: boolean;
          condominios_habilitados?: string[] | null;
          created_at?: string;
          descricao?: string | null;
          escopo?: string;
          id?: string;
          nome: string;
          tiers_habilitados?: Database['public']['Enums']['tier_type'][] | null;
          updated_at?: string;
        };
        Update: {
          ativo?: boolean;
          condominios_habilitados?: string[] | null;
          created_at?: string;
          descricao?: string | null;
          escopo?: string;
          id?: string;
          nome?: string;
          tiers_habilitados?: Database['public']['Enums']['tier_type'][] | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      integracoes: {
        Row: {
          ambiente: Database['public']['Enums']['integracao_ambiente'];
          api_key: string | null;
          api_key_hash: string | null;
          api_key_prefix: string | null;
          condominio_id: string;
          created_at: string;
          criado_por: string | null;
          descricao: string | null;
          headers_custom: Json | null;
          id: string;
          ip_whitelist: unknown[] | null;
          nome: string;
          oauth_client_id: string | null;
          oauth_provider: string | null;
          oauth_tokens: Json | null;
          rate_limit_periodo: string;
          rate_limit_requests: number;
          rate_limit_reset_em: string | null;
          rate_limit_usado: number;
          scopes: string[];
          secret_key: string | null;
          status: Database['public']['Enums']['integracao_status'];
          tipo: Database['public']['Enums']['integracao_tipo'];
          total_erros: number;
          total_requests: number;
          total_sucesso: number;
          ultimo_uso: string | null;
          updated_at: string;
          url_destino: string | null;
        };
        Insert: {
          ambiente?: Database['public']['Enums']['integracao_ambiente'];
          api_key?: string | null;
          api_key_hash?: string | null;
          api_key_prefix?: string | null;
          condominio_id: string;
          created_at?: string;
          criado_por?: string | null;
          descricao?: string | null;
          headers_custom?: Json | null;
          id?: string;
          ip_whitelist?: unknown[] | null;
          nome: string;
          oauth_client_id?: string | null;
          oauth_provider?: string | null;
          oauth_tokens?: Json | null;
          rate_limit_periodo?: string;
          rate_limit_requests?: number;
          rate_limit_reset_em?: string | null;
          rate_limit_usado?: number;
          scopes?: string[];
          secret_key?: string | null;
          status?: Database['public']['Enums']['integracao_status'];
          tipo: Database['public']['Enums']['integracao_tipo'];
          total_erros?: number;
          total_requests?: number;
          total_sucesso?: number;
          ultimo_uso?: string | null;
          updated_at?: string;
          url_destino?: string | null;
        };
        Update: {
          ambiente?: Database['public']['Enums']['integracao_ambiente'];
          api_key?: string | null;
          api_key_hash?: string | null;
          api_key_prefix?: string | null;
          condominio_id?: string;
          created_at?: string;
          criado_por?: string | null;
          descricao?: string | null;
          headers_custom?: Json | null;
          id?: string;
          ip_whitelist?: unknown[] | null;
          nome?: string;
          oauth_client_id?: string | null;
          oauth_provider?: string | null;
          oauth_tokens?: Json | null;
          rate_limit_periodo?: string;
          rate_limit_requests?: number;
          rate_limit_reset_em?: string | null;
          rate_limit_usado?: number;
          scopes?: string[];
          secret_key?: string | null;
          status?: Database['public']['Enums']['integracao_status'];
          tipo?: Database['public']['Enums']['integracao_tipo'];
          total_erros?: number;
          total_requests?: number;
          total_sucesso?: number;
          ultimo_uso?: string | null;
          updated_at?: string;
          url_destino?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'integracoes_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'integracoes_criado_por_fkey';
            columns: ['criado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      lancamentos_financeiros: {
        Row: {
          categoria_id: string | null;
          comprovantes: Json | null;
          condominio_id: string;
          conta_bancaria_id: string | null;
          conta_destino_id: string | null;
          created_at: string;
          criado_por: string | null;
          data_competencia: string;
          data_lancamento: string;
          data_pagamento: string | null;
          deleted_at: string | null;
          descricao: string;
          fornecedor: string | null;
          id: string;
          numero_documento: string | null;
          observacoes: string | null;
          periodo_bloqueado: boolean;
          status: Database['public']['Enums']['lancamento_status'];
          taxa_unidade_id: string | null;
          tipo: Database['public']['Enums']['lancamento_tipo'];
          updated_at: string;
          valor: number;
        };
        Insert: {
          categoria_id?: string | null;
          comprovantes?: Json | null;
          condominio_id: string;
          conta_bancaria_id?: string | null;
          conta_destino_id?: string | null;
          created_at?: string;
          criado_por?: string | null;
          data_competencia: string;
          data_lancamento: string;
          data_pagamento?: string | null;
          deleted_at?: string | null;
          descricao: string;
          fornecedor?: string | null;
          id?: string;
          numero_documento?: string | null;
          observacoes?: string | null;
          periodo_bloqueado?: boolean;
          status?: Database['public']['Enums']['lancamento_status'];
          taxa_unidade_id?: string | null;
          tipo: Database['public']['Enums']['lancamento_tipo'];
          updated_at?: string;
          valor: number;
        };
        Update: {
          categoria_id?: string | null;
          comprovantes?: Json | null;
          condominio_id?: string;
          conta_bancaria_id?: string | null;
          conta_destino_id?: string | null;
          created_at?: string;
          criado_por?: string | null;
          data_competencia?: string;
          data_lancamento?: string;
          data_pagamento?: string | null;
          deleted_at?: string | null;
          descricao?: string;
          fornecedor?: string | null;
          id?: string;
          numero_documento?: string | null;
          observacoes?: string | null;
          periodo_bloqueado?: boolean;
          status?: Database['public']['Enums']['lancamento_status'];
          taxa_unidade_id?: string | null;
          tipo?: Database['public']['Enums']['lancamento_tipo'];
          updated_at?: string;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'lancamentos_financeiros_categoria_id_fkey';
            columns: ['categoria_id'];
            isOneToOne: false;
            referencedRelation: 'categorias_financeiras';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lancamentos_financeiros_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lancamentos_financeiros_conta_bancaria_id_fkey';
            columns: ['conta_bancaria_id'];
            isOneToOne: false;
            referencedRelation: 'contas_bancarias';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lancamentos_financeiros_conta_destino_id_fkey';
            columns: ['conta_destino_id'];
            isOneToOne: false;
            referencedRelation: 'contas_bancarias';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lancamentos_financeiros_criado_por_fkey';
            columns: ['criado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      notificacoes: {
        Row: {
          acao_texto: string | null;
          acao_url: string | null;
          agendada_para: string | null;
          anexos: Json | null;
          cancelada_em: string | null;
          condominio_id: string;
          corpo: string;
          corpo_html: string | null;
          corpo_resumo: string | null;
          created_at: string;
          criado_por: string | null;
          destinatarios_filtro: Json | null;
          destinatarios_tipo: string;
          enviada_em: string | null;
          gerar_mural: boolean;
          id: string;
          mural_pdf_path: string | null;
          mural_qr_code: string | null;
          prioridade: Database['public']['Enums']['prioridade_comunicado'];
          referencia_id: string | null;
          referencia_tipo: string | null;
          stats_entregues: number | null;
          stats_enviados: number | null;
          stats_falhas: number | null;
          stats_lidos: number | null;
          status: Database['public']['Enums']['status_entrega'];
          tipo: Database['public']['Enums']['tipo_notificacao'];
          titulo: string;
          total_destinatarios: number | null;
          updated_at: string;
        };
        Insert: {
          acao_texto?: string | null;
          acao_url?: string | null;
          agendada_para?: string | null;
          anexos?: Json | null;
          cancelada_em?: string | null;
          condominio_id: string;
          corpo: string;
          corpo_html?: string | null;
          corpo_resumo?: string | null;
          created_at?: string;
          criado_por?: string | null;
          destinatarios_filtro?: Json | null;
          destinatarios_tipo?: string;
          enviada_em?: string | null;
          gerar_mural?: boolean;
          id?: string;
          mural_pdf_path?: string | null;
          mural_qr_code?: string | null;
          prioridade?: Database['public']['Enums']['prioridade_comunicado'];
          referencia_id?: string | null;
          referencia_tipo?: string | null;
          stats_entregues?: number | null;
          stats_enviados?: number | null;
          stats_falhas?: number | null;
          stats_lidos?: number | null;
          status?: Database['public']['Enums']['status_entrega'];
          tipo: Database['public']['Enums']['tipo_notificacao'];
          titulo: string;
          total_destinatarios?: number | null;
          updated_at?: string;
        };
        Update: {
          acao_texto?: string | null;
          acao_url?: string | null;
          agendada_para?: string | null;
          anexos?: Json | null;
          cancelada_em?: string | null;
          condominio_id?: string;
          corpo?: string;
          corpo_html?: string | null;
          corpo_resumo?: string | null;
          created_at?: string;
          criado_por?: string | null;
          destinatarios_filtro?: Json | null;
          destinatarios_tipo?: string;
          enviada_em?: string | null;
          gerar_mural?: boolean;
          id?: string;
          mural_pdf_path?: string | null;
          mural_qr_code?: string | null;
          prioridade?: Database['public']['Enums']['prioridade_comunicado'];
          referencia_id?: string | null;
          referencia_tipo?: string | null;
          stats_entregues?: number | null;
          stats_enviados?: number | null;
          stats_falhas?: number | null;
          stats_lidos?: number | null;
          status?: Database['public']['Enums']['status_entrega'];
          tipo?: Database['public']['Enums']['tipo_notificacao'];
          titulo?: string;
          total_destinatarios?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notificacoes_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notificacoes_criado_por_fkey';
            columns: ['criado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      notificacoes_config: {
        Row: {
          cascata_habilitada: boolean;
          condominio_id: string;
          created_at: string;
          creditos_sms: number;
          creditos_voz_minutos: number;
          creditos_whatsapp: number;
          email_habilitado: boolean;
          email_nome_remetente: string | null;
          email_remetente: string | null;
          emergencia_ignora_horario: boolean;
          horario_fim: string;
          horario_inicio: string;
          id: string;
          in_app_habilitado: boolean;
          limite_email_mensal: number;
          limite_push_mensal: number;
          mural_habilitado: boolean;
          push_habilitado: boolean;
          respeitar_horario: boolean;
          sms_habilitado: boolean;
          tempo_email_para_whatsapp: number;
          tempo_push_para_email: number;
          tempo_whatsapp_para_sms: number;
          updated_at: string;
          voz_habilitado: boolean;
          whatsapp_business_id: string | null;
          whatsapp_habilitado: boolean;
          whatsapp_phone_id: string | null;
          whatsapp_token_encrypted: string | null;
        };
        Insert: {
          cascata_habilitada?: boolean;
          condominio_id: string;
          created_at?: string;
          creditos_sms?: number;
          creditos_voz_minutos?: number;
          creditos_whatsapp?: number;
          email_habilitado?: boolean;
          email_nome_remetente?: string | null;
          email_remetente?: string | null;
          emergencia_ignora_horario?: boolean;
          horario_fim?: string;
          horario_inicio?: string;
          id?: string;
          in_app_habilitado?: boolean;
          limite_email_mensal?: number;
          limite_push_mensal?: number;
          mural_habilitado?: boolean;
          push_habilitado?: boolean;
          respeitar_horario?: boolean;
          sms_habilitado?: boolean;
          tempo_email_para_whatsapp?: number;
          tempo_push_para_email?: number;
          tempo_whatsapp_para_sms?: number;
          updated_at?: string;
          voz_habilitado?: boolean;
          whatsapp_business_id?: string | null;
          whatsapp_habilitado?: boolean;
          whatsapp_phone_id?: string | null;
          whatsapp_token_encrypted?: string | null;
        };
        Update: {
          cascata_habilitada?: boolean;
          condominio_id?: string;
          created_at?: string;
          creditos_sms?: number;
          creditos_voz_minutos?: number;
          creditos_whatsapp?: number;
          email_habilitado?: boolean;
          email_nome_remetente?: string | null;
          email_remetente?: string | null;
          emergencia_ignora_horario?: boolean;
          horario_fim?: string;
          horario_inicio?: string;
          id?: string;
          in_app_habilitado?: boolean;
          limite_email_mensal?: number;
          limite_push_mensal?: number;
          mural_habilitado?: boolean;
          push_habilitado?: boolean;
          respeitar_horario?: boolean;
          sms_habilitado?: boolean;
          tempo_email_para_whatsapp?: number;
          tempo_push_para_email?: number;
          tempo_whatsapp_para_sms?: number;
          updated_at?: string;
          voz_habilitado?: boolean;
          whatsapp_business_id?: string | null;
          whatsapp_habilitado?: boolean;
          whatsapp_phone_id?: string | null;
          whatsapp_token_encrypted?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notificacoes_config_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: true;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      notificacoes_entregas: {
        Row: {
          agendada_para: string | null;
          canal: Database['public']['Enums']['canal_notificacao'];
          canal_origem: Database['public']['Enums']['canal_notificacao'] | null;
          cascata_nivel: number;
          created_at: string;
          custo_centavos: number | null;
          entregue_em: string | null;
          enviada_em: string | null;
          erro_codigo: string | null;
          erro_mensagem: string | null;
          falhou_em: string | null;
          id: string;
          lida_em: string | null;
          max_tentativas: number;
          notificacao_id: string;
          provider_id: string | null;
          provider_response: Json | null;
          proxima_tentativa: string | null;
          status: Database['public']['Enums']['status_entrega'];
          tentativas: number;
          updated_at: string;
          usuario_id: string;
        };
        Insert: {
          agendada_para?: string | null;
          canal: Database['public']['Enums']['canal_notificacao'];
          canal_origem?: Database['public']['Enums']['canal_notificacao'] | null;
          cascata_nivel?: number;
          created_at?: string;
          custo_centavos?: number | null;
          entregue_em?: string | null;
          enviada_em?: string | null;
          erro_codigo?: string | null;
          erro_mensagem?: string | null;
          falhou_em?: string | null;
          id?: string;
          lida_em?: string | null;
          max_tentativas?: number;
          notificacao_id: string;
          provider_id?: string | null;
          provider_response?: Json | null;
          proxima_tentativa?: string | null;
          status?: Database['public']['Enums']['status_entrega'];
          tentativas?: number;
          updated_at?: string;
          usuario_id: string;
        };
        Update: {
          agendada_para?: string | null;
          canal?: Database['public']['Enums']['canal_notificacao'];
          canal_origem?: Database['public']['Enums']['canal_notificacao'] | null;
          cascata_nivel?: number;
          created_at?: string;
          custo_centavos?: number | null;
          entregue_em?: string | null;
          enviada_em?: string | null;
          erro_codigo?: string | null;
          erro_mensagem?: string | null;
          falhou_em?: string | null;
          id?: string;
          lida_em?: string | null;
          max_tentativas?: number;
          notificacao_id?: string;
          provider_id?: string | null;
          provider_response?: Json | null;
          proxima_tentativa?: string | null;
          status?: Database['public']['Enums']['status_entrega'];
          tentativas?: number;
          updated_at?: string;
          usuario_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notificacoes_entregas_notificacao_id_fkey';
            columns: ['notificacao_id'];
            isOneToOne: false;
            referencedRelation: 'notificacoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notificacoes_entregas_notificacao_id_fkey';
            columns: ['notificacao_id'];
            isOneToOne: false;
            referencedRelation: 'v_notificacao_stats';
            referencedColumns: ['notificacao_id'];
          },
          {
            foreignKeyName: 'notificacoes_entregas_notificacao_id_fkey';
            columns: ['notificacao_id'];
            isOneToOne: false;
            referencedRelation: 'v_usuario_notificacoes';
            referencedColumns: ['notificacao_id'];
          },
          {
            foreignKeyName: 'notificacoes_entregas_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      notificacoes_fila: {
        Row: {
          created_at: string;
          entrega_id: string;
          id: string;
          prioridade: number;
          processando: boolean;
          processando_desde: string | null;
          processando_por: string | null;
          processar_apos: string;
        };
        Insert: {
          created_at?: string;
          entrega_id: string;
          id?: string;
          prioridade?: number;
          processando?: boolean;
          processando_desde?: string | null;
          processando_por?: string | null;
          processar_apos?: string;
        };
        Update: {
          created_at?: string;
          entrega_id?: string;
          id?: string;
          prioridade?: number;
          processando?: boolean;
          processando_desde?: string | null;
          processando_por?: string | null;
          processar_apos?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notificacoes_fila_entrega_id_fkey';
            columns: ['entrega_id'];
            isOneToOne: true;
            referencedRelation: 'notificacoes_entregas';
            referencedColumns: ['id'];
          },
        ];
      };
      notificacoes_leituras: {
        Row: {
          canal: Database['public']['Enums']['canal_notificacao'];
          id: string;
          ip_address: unknown;
          lida_em: string;
          notificacao_id: string;
          user_agent: string | null;
          usuario_id: string;
        };
        Insert: {
          canal: Database['public']['Enums']['canal_notificacao'];
          id?: string;
          ip_address?: unknown;
          lida_em?: string;
          notificacao_id: string;
          user_agent?: string | null;
          usuario_id: string;
        };
        Update: {
          canal?: Database['public']['Enums']['canal_notificacao'];
          id?: string;
          ip_address?: unknown;
          lida_em?: string;
          notificacao_id?: string;
          user_agent?: string | null;
          usuario_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notificacoes_leituras_notificacao_id_fkey';
            columns: ['notificacao_id'];
            isOneToOne: false;
            referencedRelation: 'notificacoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notificacoes_leituras_notificacao_id_fkey';
            columns: ['notificacao_id'];
            isOneToOne: false;
            referencedRelation: 'v_notificacao_stats';
            referencedColumns: ['notificacao_id'];
          },
          {
            foreignKeyName: 'notificacoes_leituras_notificacao_id_fkey';
            columns: ['notificacao_id'];
            isOneToOne: false;
            referencedRelation: 'v_usuario_notificacoes';
            referencedColumns: ['notificacao_id'];
          },
          {
            foreignKeyName: 'notificacoes_leituras_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      ocorrencias: {
        Row: {
          anexos: Json | null;
          anonimo: boolean;
          categoria: Database['public']['Enums']['ocorrencia_categoria'];
          condominio_id: string;
          created_at: string;
          deleted_at: string | null;
          descricao: string;
          id: string;
          local_descricao: string | null;
          prioridade: Database['public']['Enums']['prioridade'];
          reportado_por: string;
          resolucao: string | null;
          resolvido_em: string | null;
          resolvido_por: string | null;
          responsavel_id: string | null;
          status: Database['public']['Enums']['ocorrencia_status'];
          titulo: string;
          unidade_relacionada_id: string | null;
          updated_at: string;
        };
        Insert: {
          anexos?: Json | null;
          anonimo?: boolean;
          categoria?: Database['public']['Enums']['ocorrencia_categoria'];
          condominio_id: string;
          created_at?: string;
          deleted_at?: string | null;
          descricao: string;
          id?: string;
          local_descricao?: string | null;
          prioridade?: Database['public']['Enums']['prioridade'];
          reportado_por: string;
          resolucao?: string | null;
          resolvido_em?: string | null;
          resolvido_por?: string | null;
          responsavel_id?: string | null;
          status?: Database['public']['Enums']['ocorrencia_status'];
          titulo: string;
          unidade_relacionada_id?: string | null;
          updated_at?: string;
        };
        Update: {
          anexos?: Json | null;
          anonimo?: boolean;
          categoria?: Database['public']['Enums']['ocorrencia_categoria'];
          condominio_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          descricao?: string;
          id?: string;
          local_descricao?: string | null;
          prioridade?: Database['public']['Enums']['prioridade'];
          reportado_por?: string;
          resolucao?: string | null;
          resolvido_em?: string | null;
          resolvido_por?: string | null;
          responsavel_id?: string | null;
          status?: Database['public']['Enums']['ocorrencia_status'];
          titulo?: string;
          unidade_relacionada_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ocorrencias_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ocorrencias_reportado_por_fkey';
            columns: ['reportado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ocorrencias_resolvido_por_fkey';
            columns: ['resolvido_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ocorrencias_responsavel_id_fkey';
            columns: ['responsavel_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ocorrencias_unidade_relacionada_id_fkey';
            columns: ['unidade_relacionada_id'];
            isOneToOne: false;
            referencedRelation: 'unidades_habitacionais';
            referencedColumns: ['id'];
          },
        ];
      };
      ocorrencias_historico: {
        Row: {
          comentario: string | null;
          created_at: string;
          id: string;
          ocorrencia_id: string;
          status_anterior: Database['public']['Enums']['ocorrencia_status'] | null;
          status_novo: Database['public']['Enums']['ocorrencia_status'];
          usuario_id: string | null;
        };
        Insert: {
          comentario?: string | null;
          created_at?: string;
          id?: string;
          ocorrencia_id: string;
          status_anterior?: Database['public']['Enums']['ocorrencia_status'] | null;
          status_novo: Database['public']['Enums']['ocorrencia_status'];
          usuario_id?: string | null;
        };
        Update: {
          comentario?: string | null;
          created_at?: string;
          id?: string;
          ocorrencia_id?: string;
          status_anterior?: Database['public']['Enums']['ocorrencia_status'] | null;
          status_novo?: Database['public']['Enums']['ocorrencia_status'];
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ocorrencias_historico_ocorrencia_id_fkey';
            columns: ['ocorrencia_id'];
            isOneToOne: false;
            referencedRelation: 'ocorrencias';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ocorrencias_historico_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      prestacao_contas: {
        Row: {
          condominio_id: string;
          created_at: string;
          criado_por: string;
          id: string;
          mes_referencia: string;
          observacoes_sindico: string | null;
          parecer_conselho: string | null;
          publicado_em: string | null;
          publicado_por: string | null;
          revisado_em: string | null;
          revisado_por: string | null;
          saldo_anterior: number;
          saldo_atual: number;
          status: Database['public']['Enums']['prestacao_status'];
          total_despesas: number;
          total_receitas: number;
          updated_at: string;
        };
        Insert: {
          condominio_id: string;
          created_at?: string;
          criado_por: string;
          id?: string;
          mes_referencia: string;
          observacoes_sindico?: string | null;
          parecer_conselho?: string | null;
          publicado_em?: string | null;
          publicado_por?: string | null;
          revisado_em?: string | null;
          revisado_por?: string | null;
          saldo_anterior?: number;
          saldo_atual?: number;
          status?: Database['public']['Enums']['prestacao_status'];
          total_despesas?: number;
          total_receitas?: number;
          updated_at?: string;
        };
        Update: {
          condominio_id?: string;
          created_at?: string;
          criado_por?: string;
          id?: string;
          mes_referencia?: string;
          observacoes_sindico?: string | null;
          parecer_conselho?: string | null;
          publicado_em?: string | null;
          publicado_por?: string | null;
          revisado_em?: string | null;
          revisado_por?: string | null;
          saldo_anterior?: number;
          saldo_atual?: number;
          status?: Database['public']['Enums']['prestacao_status'];
          total_despesas?: number;
          total_receitas?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'prestacao_contas_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prestacao_contas_criado_por_fkey';
            columns: ['criado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prestacao_contas_publicado_por_fkey';
            columns: ['publicado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prestacao_contas_revisado_por_fkey';
            columns: ['revisado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      rate_limits: {
        Row: {
          endpoint: string;
          id: string;
          identifier: string;
          requests: number;
          window_start: string;
        };
        Insert: {
          endpoint: string;
          id?: string;
          identifier: string;
          requests?: number;
          window_start?: string;
        };
        Update: {
          endpoint?: string;
          id?: string;
          identifier?: string;
          requests?: number;
          window_start?: string;
        };
        Relationships: [];
      };
      sessoes_impersonate: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          motivo: string;
          revoked_at: string | null;
          superadmin_id: string;
          usuario_alvo_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          motivo: string;
          revoked_at?: string | null;
          superadmin_id: string;
          usuario_alvo_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          motivo?: string;
          revoked_at?: string | null;
          superadmin_id?: string;
          usuario_alvo_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sessoes_impersonate_superadmin_id_fkey';
            columns: ['superadmin_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sessoes_impersonate_usuario_alvo_id_fkey';
            columns: ['usuario_alvo_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      sync_logs: {
        Row: {
          conector_id: string;
          created_at: string;
          direcao: string;
          duracao_ms: number | null;
          erros: Json | null;
          finalizado_em: string | null;
          id: string;
          iniciado_em: string;
          registros_atualizados: number;
          registros_criados: number;
          registros_erro: number;
          registros_ignorados: number;
          registros_processados: number;
          status: string;
        };
        Insert: {
          conector_id: string;
          created_at?: string;
          direcao: string;
          duracao_ms?: number | null;
          erros?: Json | null;
          finalizado_em?: string | null;
          id?: string;
          iniciado_em?: string;
          registros_atualizados?: number;
          registros_criados?: number;
          registros_erro?: number;
          registros_ignorados?: number;
          registros_processados?: number;
          status: string;
        };
        Update: {
          conector_id?: string;
          created_at?: string;
          direcao?: string;
          duracao_ms?: number | null;
          erros?: Json | null;
          finalizado_em?: string | null;
          id?: string;
          iniciado_em?: string;
          registros_atualizados?: number;
          registros_criados?: number;
          registros_erro?: number;
          registros_ignorados?: number;
          registros_processados?: number;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sync_logs_conector_id_fkey';
            columns: ['conector_id'];
            isOneToOne: false;
            referencedRelation: 'conectores';
            referencedColumns: ['id'];
          },
        ];
      };
      taxas_unidades: {
        Row: {
          acrescimo: number | null;
          boleto_id: string | null;
          boleto_url: string | null;
          condominio_id: string;
          created_at: string;
          data_pagamento: string | null;
          data_vencimento: string;
          desconto: number | null;
          descricao: string | null;
          id: string;
          linha_digitavel: string | null;
          mes_referencia: string;
          status: Database['public']['Enums']['cobranca_status'];
          tipo: Database['public']['Enums']['taxa_tipo'];
          unidade_id: string;
          updated_at: string;
          valor_base: number;
          valor_final: number | null;
          valor_pago: number | null;
        };
        Insert: {
          acrescimo?: number | null;
          boleto_id?: string | null;
          boleto_url?: string | null;
          condominio_id: string;
          created_at?: string;
          data_pagamento?: string | null;
          data_vencimento: string;
          desconto?: number | null;
          descricao?: string | null;
          id?: string;
          linha_digitavel?: string | null;
          mes_referencia: string;
          status?: Database['public']['Enums']['cobranca_status'];
          tipo?: Database['public']['Enums']['taxa_tipo'];
          unidade_id: string;
          updated_at?: string;
          valor_base: number;
          valor_final?: number | null;
          valor_pago?: number | null;
        };
        Update: {
          acrescimo?: number | null;
          boleto_id?: string | null;
          boleto_url?: string | null;
          condominio_id?: string;
          created_at?: string;
          data_pagamento?: string | null;
          data_vencimento?: string;
          desconto?: number | null;
          descricao?: string | null;
          id?: string;
          linha_digitavel?: string | null;
          mes_referencia?: string;
          status?: Database['public']['Enums']['cobranca_status'];
          tipo?: Database['public']['Enums']['taxa_tipo'];
          unidade_id?: string;
          updated_at?: string;
          valor_base?: number;
          valor_final?: number | null;
          valor_pago?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'taxas_unidades_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'taxas_unidades_unidade_id_fkey';
            columns: ['unidade_id'];
            isOneToOne: false;
            referencedRelation: 'unidades_habitacionais';
            referencedColumns: ['id'];
          },
        ];
      };
      templates_notificacao: {
        Row: {
          assunto: string | null;
          ativo: boolean;
          canal: Database['public']['Enums']['canal_notificacao'];
          codigo: string;
          condominio_id: string | null;
          corpo: string;
          corpo_html: string | null;
          created_at: string;
          descricao: string | null;
          id: string;
          nome: string;
          tipo: Database['public']['Enums']['tipo_notificacao'];
          updated_at: string;
          variaveis_disponiveis: Json | null;
          whatsapp_namespace: string | null;
          whatsapp_template_id: string | null;
        };
        Insert: {
          assunto?: string | null;
          ativo?: boolean;
          canal: Database['public']['Enums']['canal_notificacao'];
          codigo: string;
          condominio_id?: string | null;
          corpo: string;
          corpo_html?: string | null;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          nome: string;
          tipo: Database['public']['Enums']['tipo_notificacao'];
          updated_at?: string;
          variaveis_disponiveis?: Json | null;
          whatsapp_namespace?: string | null;
          whatsapp_template_id?: string | null;
        };
        Update: {
          assunto?: string | null;
          ativo?: boolean;
          canal?: Database['public']['Enums']['canal_notificacao'];
          codigo?: string;
          condominio_id?: string | null;
          corpo?: string;
          corpo_html?: string | null;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          nome?: string;
          tipo?: Database['public']['Enums']['tipo_notificacao'];
          updated_at?: string;
          variaveis_disponiveis?: Json | null;
          whatsapp_namespace?: string | null;
          whatsapp_template_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'templates_notificacao_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      unidades_habitacionais: {
        Row: {
          andar: number | null;
          area_m2: number | null;
          ativo: boolean;
          bloco_id: string | null;
          condominio_id: string;
          created_at: string;
          fracao_ideal: number | null;
          id: string;
          numero: string;
          tipo: Database['public']['Enums']['unidade_tipo'];
          updated_at: string;
        };
        Insert: {
          andar?: number | null;
          area_m2?: number | null;
          ativo?: boolean;
          bloco_id?: string | null;
          condominio_id: string;
          created_at?: string;
          fracao_ideal?: number | null;
          id?: string;
          numero: string;
          tipo?: Database['public']['Enums']['unidade_tipo'];
          updated_at?: string;
        };
        Update: {
          andar?: number | null;
          area_m2?: number | null;
          ativo?: boolean;
          bloco_id?: string | null;
          condominio_id?: string;
          created_at?: string;
          fracao_ideal?: number | null;
          id?: string;
          numero?: string;
          tipo?: Database['public']['Enums']['unidade_tipo'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'unidades_habitacionais_bloco_id_fkey';
            columns: ['bloco_id'];
            isOneToOne: false;
            referencedRelation: 'blocos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'unidades_habitacionais_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      usuarios: {
        Row: {
          auth_id: string | null;
          avatar_url: string | null;
          condominio_id: string | null;
          cpf: string | null;
          created_at: string;
          data_nascimento: string | null;
          deleted_at: string | null;
          deleted_reason: string | null;
          email: string;
          id: string;
          nome: string;
          notificacoes_email: boolean;
          notificacoes_push: boolean;
          notificacoes_whatsapp: boolean;
          role: Database['public']['Enums']['user_role'];
          status: Database['public']['Enums']['user_status'];
          telefone: string | null;
          tipo_residente: Database['public']['Enums']['tipo_residente'] | null;
          ultimo_acesso: string | null;
          unidade_id: string | null;
          updated_at: string;
        };
        Insert: {
          auth_id?: string | null;
          avatar_url?: string | null;
          condominio_id?: string | null;
          cpf?: string | null;
          created_at?: string;
          data_nascimento?: string | null;
          deleted_at?: string | null;
          deleted_reason?: string | null;
          email: string;
          id?: string;
          nome: string;
          notificacoes_email?: boolean;
          notificacoes_push?: boolean;
          notificacoes_whatsapp?: boolean;
          role?: Database['public']['Enums']['user_role'];
          status?: Database['public']['Enums']['user_status'];
          telefone?: string | null;
          tipo_residente?: Database['public']['Enums']['tipo_residente'] | null;
          ultimo_acesso?: string | null;
          unidade_id?: string | null;
          updated_at?: string;
        };
        Update: {
          auth_id?: string | null;
          avatar_url?: string | null;
          condominio_id?: string | null;
          cpf?: string | null;
          created_at?: string;
          data_nascimento?: string | null;
          deleted_at?: string | null;
          deleted_reason?: string | null;
          email?: string;
          id?: string;
          nome?: string;
          notificacoes_email?: boolean;
          notificacoes_push?: boolean;
          notificacoes_whatsapp?: boolean;
          role?: Database['public']['Enums']['user_role'];
          status?: Database['public']['Enums']['user_status'];
          telefone?: string | null;
          tipo_residente?: Database['public']['Enums']['tipo_residente'] | null;
          ultimo_acesso?: string | null;
          unidade_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'usuarios_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'usuarios_unidade_id_fkey';
            columns: ['unidade_id'];
            isOneToOne: false;
            referencedRelation: 'unidades_habitacionais';
            referencedColumns: ['id'];
          },
        ];
      };
      usuarios_canais_preferencias: {
        Row: {
          created_at: string;
          email_habilitado: boolean;
          horario_fim_preferido: string | null;
          horario_inicio_preferido: string | null;
          id: string;
          in_app_habilitado: boolean;
          push_habilitado: boolean;
          push_tokens: Json | null;
          receber_alertas: boolean;
          receber_assembleias: boolean;
          receber_avisos: boolean;
          receber_chamados: boolean;
          receber_cobrancas: boolean;
          receber_comunicados: boolean;
          receber_emergencias: boolean;
          receber_lembretes: boolean;
          receber_ocorrencias: boolean;
          sms_habilitado: boolean;
          sms_numero: string | null;
          updated_at: string;
          usuario_id: string;
          voz_habilitado: boolean;
          voz_numero: string | null;
          whatsapp_habilitado: boolean;
          whatsapp_numero: string | null;
          whatsapp_verificado: boolean;
        };
        Insert: {
          created_at?: string;
          email_habilitado?: boolean;
          horario_fim_preferido?: string | null;
          horario_inicio_preferido?: string | null;
          id?: string;
          in_app_habilitado?: boolean;
          push_habilitado?: boolean;
          push_tokens?: Json | null;
          receber_alertas?: boolean;
          receber_assembleias?: boolean;
          receber_avisos?: boolean;
          receber_chamados?: boolean;
          receber_cobrancas?: boolean;
          receber_comunicados?: boolean;
          receber_emergencias?: boolean;
          receber_lembretes?: boolean;
          receber_ocorrencias?: boolean;
          sms_habilitado?: boolean;
          sms_numero?: string | null;
          updated_at?: string;
          usuario_id: string;
          voz_habilitado?: boolean;
          voz_numero?: string | null;
          whatsapp_habilitado?: boolean;
          whatsapp_numero?: string | null;
          whatsapp_verificado?: boolean;
        };
        Update: {
          created_at?: string;
          email_habilitado?: boolean;
          horario_fim_preferido?: string | null;
          horario_inicio_preferido?: string | null;
          id?: string;
          in_app_habilitado?: boolean;
          push_habilitado?: boolean;
          push_tokens?: Json | null;
          receber_alertas?: boolean;
          receber_assembleias?: boolean;
          receber_avisos?: boolean;
          receber_chamados?: boolean;
          receber_cobrancas?: boolean;
          receber_comunicados?: boolean;
          receber_emergencias?: boolean;
          receber_lembretes?: boolean;
          receber_ocorrencias?: boolean;
          sms_habilitado?: boolean;
          sms_numero?: string | null;
          updated_at?: string;
          usuario_id?: string;
          voz_habilitado?: boolean;
          voz_numero?: string | null;
          whatsapp_habilitado?: boolean;
          whatsapp_numero?: string | null;
          whatsapp_verificado?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'usuarios_canais_preferencias_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: true;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      webhooks_config: {
        Row: {
          algoritmo_assinatura: string;
          ativo: boolean;
          backoff_multiplicador: number;
          created_at: string;
          eventos: Database['public']['Enums']['webhook_evento'][];
          filtro_blocos: string[] | null;
          filtro_categorias: string[] | null;
          filtro_tipos: string[] | null;
          headers_override: Json | null;
          id: string;
          integracao_id: string;
          intervalo_retry_segundos: number;
          max_tentativas: number;
          timeout_segundos: number;
          updated_at: string;
          url_override: string | null;
          usar_assinatura: boolean;
        };
        Insert: {
          algoritmo_assinatura?: string;
          ativo?: boolean;
          backoff_multiplicador?: number;
          created_at?: string;
          eventos: Database['public']['Enums']['webhook_evento'][];
          filtro_blocos?: string[] | null;
          filtro_categorias?: string[] | null;
          filtro_tipos?: string[] | null;
          headers_override?: Json | null;
          id?: string;
          integracao_id: string;
          intervalo_retry_segundos?: number;
          max_tentativas?: number;
          timeout_segundos?: number;
          updated_at?: string;
          url_override?: string | null;
          usar_assinatura?: boolean;
        };
        Update: {
          algoritmo_assinatura?: string;
          ativo?: boolean;
          backoff_multiplicador?: number;
          created_at?: string;
          eventos?: Database['public']['Enums']['webhook_evento'][];
          filtro_blocos?: string[] | null;
          filtro_categorias?: string[] | null;
          filtro_tipos?: string[] | null;
          headers_override?: Json | null;
          id?: string;
          integracao_id?: string;
          intervalo_retry_segundos?: number;
          max_tentativas?: number;
          timeout_segundos?: number;
          updated_at?: string;
          url_override?: string | null;
          usar_assinatura?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'webhooks_config_integracao_id_fkey';
            columns: ['integracao_id'];
            isOneToOne: false;
            referencedRelation: 'integracoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'webhooks_config_integracao_id_fkey';
            columns: ['integracao_id'];
            isOneToOne: false;
            referencedRelation: 'v_api_stats_diario';
            referencedColumns: ['integracao_id'];
          },
          {
            foreignKeyName: 'webhooks_config_integracao_id_fkey';
            columns: ['integracao_id'];
            isOneToOne: false;
            referencedRelation: 'v_integracoes_resumo';
            referencedColumns: ['id'];
          },
        ];
      };
      webhooks_entregas: {
        Row: {
          assinatura: string | null;
          created_at: string;
          entregue_em: string | null;
          enviado_em: string | null;
          erro_mensagem: string | null;
          event_id: string;
          evento: Database['public']['Enums']['webhook_evento'];
          id: string;
          max_tentativas: number;
          payload: Json;
          proxima_tentativa: string | null;
          recurso_id: string | null;
          recurso_tipo: string | null;
          response_body: string | null;
          response_time_ms: number | null;
          status: Database['public']['Enums']['webhook_entrega_status'];
          status_code: number | null;
          tentativa: number;
          updated_at: string;
          webhook_config_id: string;
        };
        Insert: {
          assinatura?: string | null;
          created_at?: string;
          entregue_em?: string | null;
          enviado_em?: string | null;
          erro_mensagem?: string | null;
          event_id: string;
          evento: Database['public']['Enums']['webhook_evento'];
          id?: string;
          max_tentativas?: number;
          payload: Json;
          proxima_tentativa?: string | null;
          recurso_id?: string | null;
          recurso_tipo?: string | null;
          response_body?: string | null;
          response_time_ms?: number | null;
          status?: Database['public']['Enums']['webhook_entrega_status'];
          status_code?: number | null;
          tentativa?: number;
          updated_at?: string;
          webhook_config_id: string;
        };
        Update: {
          assinatura?: string | null;
          created_at?: string;
          entregue_em?: string | null;
          enviado_em?: string | null;
          erro_mensagem?: string | null;
          event_id?: string;
          evento?: Database['public']['Enums']['webhook_evento'];
          id?: string;
          max_tentativas?: number;
          payload?: Json;
          proxima_tentativa?: string | null;
          recurso_id?: string | null;
          recurso_tipo?: string | null;
          response_body?: string | null;
          response_time_ms?: number | null;
          status?: Database['public']['Enums']['webhook_entrega_status'];
          status_code?: number | null;
          tentativa?: number;
          updated_at?: string;
          webhook_config_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'webhooks_entregas_webhook_config_id_fkey';
            columns: ['webhook_config_id'];
            isOneToOne: false;
            referencedRelation: 'webhooks_config';
            referencedColumns: ['id'];
          },
        ];
      };
      webhooks_notificacao: {
        Row: {
          ativo: boolean;
          condominio_id: string | null;
          created_at: string;
          eventos: Json;
          id: string;
          max_tentativas: number;
          nome: string;
          secret: string | null;
          timeout_segundos: number;
          total_enviados: number | null;
          total_falha: number | null;
          total_sucesso: number | null;
          ultimo_erro: string | null;
          ultimo_erro_em: string | null;
          ultimo_sucesso_em: string | null;
          updated_at: string;
          url: string;
        };
        Insert: {
          ativo?: boolean;
          condominio_id?: string | null;
          created_at?: string;
          eventos?: Json;
          id?: string;
          max_tentativas?: number;
          nome: string;
          secret?: string | null;
          timeout_segundos?: number;
          total_enviados?: number | null;
          total_falha?: number | null;
          total_sucesso?: number | null;
          ultimo_erro?: string | null;
          ultimo_erro_em?: string | null;
          ultimo_sucesso_em?: string | null;
          updated_at?: string;
          url: string;
        };
        Update: {
          ativo?: boolean;
          condominio_id?: string | null;
          created_at?: string;
          eventos?: Json;
          id?: string;
          max_tentativas?: number;
          nome?: string;
          secret?: string | null;
          timeout_segundos?: number;
          total_enviados?: number | null;
          total_falha?: number | null;
          total_sucesso?: number | null;
          ultimo_erro?: string | null;
          ultimo_erro_em?: string | null;
          ultimo_sucesso_em?: string | null;
          updated_at?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'webhooks_notificacao_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      v_api_stats_diario: {
        Row: {
          avg_response_time_ms: number | null;
          condominio_id: string | null;
          data: string | null;
          erros: number | null;
          integracao_id: string | null;
          integracao_nome: string | null;
          max_response_time_ms: number | null;
          sucesso: number | null;
          total_requests: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'integracoes_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      v_assembleia_quorum: {
        Row: {
          assembleia_id: string | null;
          condominio_id: string | null;
          fracao_presente: number | null;
          quorum_minimo_primeira: number | null;
          quorum_minimo_segunda: number | null;
          quorum_percentual: number | null;
          status: Database['public']['Enums']['assembleia_status'] | null;
          status_quorum: string | null;
          total_fracao: number | null;
          total_unidades: number | null;
          unidades_presentes: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleias_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      v_assembleia_resumo: {
        Row: {
          ano_referencia: number | null;
          arquivada_em: string | null;
          ata_hash: string | null;
          ata_pdf_path: string | null;
          ata_texto: string | null;
          codigo_acesso_video: string | null;
          condominio_id: string | null;
          condominio_nome: string | null;
          convocada_em: string | null;
          created_at: string | null;
          criado_por: string | null;
          criado_por_nome: string | null;
          data_fim: string | null;
          data_inicio: string | null;
          data_limite_voto_antecipado: string | null;
          data_primeira_convocacao: string | null;
          data_segunda_convocacao: string | null;
          descricao: string | null;
          encerrada_em: string | null;
          endereco_presencial: string | null;
          id: string | null;
          iniciada_em: string | null;
          link_video: string | null;
          local_presencial: string | null;
          max_procuracoes_por_pessoa: number | null;
          numero_sequencial: number | null;
          observacoes_internas: string | null;
          permite_procuracao: boolean | null;
          permite_voto_antecipado: boolean | null;
          qr_token: string | null;
          quorum_atingido: number | null;
          quorum_minimo_primeira: number | null;
          quorum_minimo_segunda: number | null;
          quorum_percentual: number | null;
          status: Database['public']['Enums']['assembleia_status'] | null;
          status_quorum: string | null;
          tipo: Database['public']['Enums']['assembleia_tipo'] | null;
          titulo: string | null;
          total_assinaturas: number | null;
          total_pautas: number | null;
          total_presentes: number | null;
          total_unidades: number | null;
          unidades_presentes: number | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleias_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleias_criado_por_fkey';
            columns: ['criado_por'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      v_cotas_uso_mensal: {
        Row: {
          condominio_id: string | null;
          condominio_nome: string | null;
          custo_sms_centavos: number | null;
          custo_total_centavos: number | null;
          custo_voz_centavos: number | null;
          custo_whatsapp_centavos: number | null;
          limite_email_mensal: number | null;
          limite_push_mensal: number | null;
          limite_sms: number | null;
          limite_voz: number | null;
          limite_whatsapp: number | null;
          mes_referencia: string | null;
          pct_email: number | null;
          pct_push: number | null;
          pct_sms: number | null;
          pct_whatsapp: number | null;
          uso_email: number | null;
          uso_push: number | null;
          uso_sms: number | null;
          uso_voz_minutos: number | null;
          uso_whatsapp: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cotas_comunicacao_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      v_integracoes_resumo: {
        Row: {
          ambiente: Database['public']['Enums']['integracao_ambiente'] | null;
          api_key_prefix: string | null;
          condominio_id: string | null;
          created_at: string | null;
          eventos_webhook: Database['public']['Enums']['webhook_evento'][] | null;
          id: string | null;
          nome: string | null;
          rate_limit_requests: number | null;
          rate_limit_restante: number | null;
          rate_limit_usado: number | null;
          scopes: string[] | null;
          status: Database['public']['Enums']['integracao_status'] | null;
          taxa_sucesso: number | null;
          tipo: Database['public']['Enums']['integracao_tipo'] | null;
          total_erros: number | null;
          total_requests: number | null;
          total_sucesso: number | null;
          total_webhooks: number | null;
          ultimo_uso: string | null;
        };
        Insert: {
          ambiente?: Database['public']['Enums']['integracao_ambiente'] | null;
          api_key_prefix?: string | null;
          condominio_id?: string | null;
          created_at?: string | null;
          eventos_webhook?: never;
          id?: string | null;
          nome?: string | null;
          rate_limit_requests?: number | null;
          rate_limit_restante?: never;
          rate_limit_usado?: number | null;
          scopes?: string[] | null;
          status?: Database['public']['Enums']['integracao_status'] | null;
          taxa_sucesso?: never;
          tipo?: Database['public']['Enums']['integracao_tipo'] | null;
          total_erros?: number | null;
          total_requests?: number | null;
          total_sucesso?: number | null;
          total_webhooks?: never;
          ultimo_uso?: string | null;
        };
        Update: {
          ambiente?: Database['public']['Enums']['integracao_ambiente'] | null;
          api_key_prefix?: string | null;
          condominio_id?: string | null;
          created_at?: string | null;
          eventos_webhook?: never;
          id?: string | null;
          nome?: string | null;
          rate_limit_requests?: number | null;
          rate_limit_restante?: never;
          rate_limit_usado?: number | null;
          scopes?: string[] | null;
          status?: Database['public']['Enums']['integracao_status'] | null;
          taxa_sucesso?: never;
          tipo?: Database['public']['Enums']['integracao_tipo'] | null;
          total_erros?: number | null;
          total_requests?: number | null;
          total_sucesso?: number | null;
          total_webhooks?: never;
          ultimo_uso?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'integracoes_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      v_notificacao_stats: {
        Row: {
          condominio_id: string | null;
          created_at: string | null;
          email_enviados: number | null;
          email_lidos: number | null;
          enviada_em: string | null;
          notificacao_id: string | null;
          percentual_leitura: number | null;
          prioridade: Database['public']['Enums']['prioridade_comunicado'] | null;
          push_enviados: number | null;
          push_lidos: number | null;
          sms_enviados: number | null;
          stats_entregues: number | null;
          stats_enviados: number | null;
          stats_falhas: number | null;
          stats_lidos: number | null;
          status: Database['public']['Enums']['status_entrega'] | null;
          tipo: Database['public']['Enums']['tipo_notificacao'] | null;
          titulo: string | null;
          total_destinatarios: number | null;
          whatsapp_enviados: number | null;
        };
        Insert: {
          condominio_id?: string | null;
          created_at?: string | null;
          email_enviados?: never;
          email_lidos?: never;
          enviada_em?: string | null;
          notificacao_id?: string | null;
          percentual_leitura?: never;
          prioridade?: Database['public']['Enums']['prioridade_comunicado'] | null;
          push_enviados?: never;
          push_lidos?: never;
          sms_enviados?: never;
          stats_entregues?: number | null;
          stats_enviados?: number | null;
          stats_falhas?: number | null;
          stats_lidos?: number | null;
          status?: Database['public']['Enums']['status_entrega'] | null;
          tipo?: Database['public']['Enums']['tipo_notificacao'] | null;
          titulo?: string | null;
          total_destinatarios?: number | null;
          whatsapp_enviados?: never;
        };
        Update: {
          condominio_id?: string | null;
          created_at?: string | null;
          email_enviados?: never;
          email_lidos?: never;
          enviada_em?: string | null;
          notificacao_id?: string | null;
          percentual_leitura?: never;
          prioridade?: Database['public']['Enums']['prioridade_comunicado'] | null;
          push_enviados?: never;
          push_lidos?: never;
          sms_enviados?: never;
          stats_entregues?: number | null;
          stats_enviados?: number | null;
          stats_falhas?: number | null;
          stats_lidos?: number | null;
          status?: Database['public']['Enums']['status_entrega'] | null;
          tipo?: Database['public']['Enums']['tipo_notificacao'] | null;
          titulo?: string | null;
          total_destinatarios?: number | null;
          whatsapp_enviados?: never;
        };
        Relationships: [
          {
            foreignKeyName: 'notificacoes_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
        ];
      };
      v_pauta_resultado: {
        Row: {
          assembleia_id: string | null;
          fracao_abstencao: number | null;
          fracao_nao: number | null;
          fracao_sim: number | null;
          fracao_total_votou: number | null;
          pauta_id: string | null;
          percentual_aprovacao: number | null;
          quorum_especial: Database['public']['Enums']['quorum_especial'] | null;
          status: Database['public']['Enums']['pauta_status'] | null;
          tipo_votacao: Database['public']['Enums']['pauta_tipo_votacao'] | null;
          titulo: string | null;
          total_votos: number | null;
          voto_secreto: boolean | null;
          votos_abstencao: number | null;
          votos_nao: number | null;
          votos_sim: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'assembleia_pautas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'assembleias';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assembleia_pautas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_quorum';
            referencedColumns: ['assembleia_id'];
          },
          {
            foreignKeyName: 'assembleia_pautas_assembleia_id_fkey';
            columns: ['assembleia_id'];
            isOneToOne: false;
            referencedRelation: 'v_assembleia_resumo';
            referencedColumns: ['id'];
          },
        ];
      };
      v_usuario_notificacoes: {
        Row: {
          acao_url: string | null;
          canal: Database['public']['Enums']['canal_notificacao'] | null;
          condominio_id: string | null;
          corpo_resumo: string | null;
          created_at: string | null;
          lida: boolean | null;
          lida_em: string | null;
          notificacao_id: string | null;
          prioridade: Database['public']['Enums']['prioridade_comunicado'] | null;
          referencia_id: string | null;
          referencia_tipo: string | null;
          status: Database['public']['Enums']['status_entrega'] | null;
          tipo: Database['public']['Enums']['tipo_notificacao'] | null;
          titulo: string | null;
          usuario_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notificacoes_condominio_id_fkey';
            columns: ['condominio_id'];
            isOneToOne: false;
            referencedRelation: 'condominios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notificacoes_entregas_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      v_webhooks_pendentes: {
        Row: {
          entrega_id: string | null;
          event_id: string | null;
          evento: Database['public']['Enums']['webhook_evento'] | null;
          headers_override: Json | null;
          max_tentativas: number | null;
          payload: Json | null;
          proxima_tentativa: string | null;
          secret_key: string | null;
          tentativa: number | null;
          timeout_segundos: number | null;
          url_destino: string | null;
          webhook_config_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'webhooks_entregas_webhook_config_id_fkey';
            columns: ['webhook_config_id'];
            isOneToOne: false;
            referencedRelation: 'webhooks_config';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      abrir_votacao_pauta: { Args: { p_pauta_id: string }; Returns: boolean };
      aceitar_procuracao: {
        Args: { p_ip_address?: unknown; p_procuracao_id: string };
        Returns: boolean;
      };
      activate_sindico: {
        Args: { p_condominio_id: string; p_usuario_id: string };
        Returns: boolean;
      };
      approve_user: {
        Args: { p_unidade_id?: string; p_usuario_id: string };
        Returns: boolean;
      };
      calcular_saldo_periodo: {
        Args: { p_condominio_id: string; p_mes_referencia: string };
        Returns: {
          saldo_anterior: number;
          saldo_atual: number;
          total_despesas: number;
          total_receitas: number;
        }[];
      };
      check_feature_flag: {
        Args: { p_condominio_id?: string; p_nome: string };
        Returns: boolean;
      };
      check_rate_limit: {
        Args: {
          p_endpoint?: string;
          p_identifier: string;
          p_max_requests?: number;
          p_window_minutes?: number;
        };
        Returns: {
          allowed: boolean;
          remaining: number;
          reset_at: string;
        }[];
      };
      cleanup_rate_limits: { Args: never; Returns: number };
      clear_rate_limit: {
        Args: { p_endpoint?: string; p_identifier: string };
        Returns: boolean;
      };
      confirmar_leitura: {
        Args: {
          p_canal: Database['public']['Enums']['canal_notificacao'];
          p_ip_address?: unknown;
          p_notificacao_id: string;
          p_user_agent?: string;
          p_usuario_id: string;
        };
        Returns: boolean;
      };
      contar_nao_lidas: { Args: { p_usuario_id: string }; Returns: number };
      criar_integracao_api: {
        Args: {
          p_ambiente?: Database['public']['Enums']['integracao_ambiente'];
          p_condominio_id: string;
          p_criado_por?: string;
          p_descricao?: string;
          p_nome: string;
          p_rate_limit?: number;
          p_scopes?: string[];
        };
        Returns: {
          api_key: string;
          api_key_prefix: string;
          integracao_id: string;
        }[];
      };
      criar_snapshot_mensal: {
        Args: { p_condominio_id: string; p_mes_referencia: string };
        Returns: boolean;
      };
      criar_webhook: {
        Args: {
          p_condominio_id: string;
          p_criado_por?: string;
          p_eventos: Database['public']['Enums']['webhook_evento'][];
          p_nome: string;
          p_secret_key?: string;
          p_url: string;
        };
        Returns: string;
      };
      disparar_emergencia: {
        Args: {
          p_condominio_id: string;
          p_corpo: string;
          p_disparado_por: string;
          p_tipo: string;
          p_titulo: string;
        };
        Returns: string;
      };
      disparar_webhook: {
        Args: {
          p_condominio_id: string;
          p_evento: Database['public']['Enums']['webhook_evento'];
          p_payload: Json;
          p_recurso_id?: string;
          p_recurso_tipo?: string;
        };
        Returns: number;
      };
      encerrar_assembleia: {
        Args: { p_assembleia_id: string };
        Returns: boolean;
      };
      encerrar_votacao_pauta: { Args: { p_pauta_id: string }; Returns: Json };
      enviar_notificacao: {
        Args: {
          p_acao_url?: string;
          p_agendada_para?: string;
          p_condominio_id: string;
          p_corpo: string;
          p_criado_por?: string;
          p_destinatarios_filtro?: Json;
          p_destinatarios_tipo?: string;
          p_gerar_mural?: boolean;
          p_prioridade?: Database['public']['Enums']['prioridade_comunicado'];
          p_referencia_id?: string;
          p_referencia_tipo?: string;
          p_tipo: Database['public']['Enums']['tipo_notificacao'];
          p_titulo: string;
        };
        Returns: string;
      };
      gerar_api_key: {
        Args: {
          p_ambiente?: Database['public']['Enums']['integracao_ambiente'];
        };
        Returns: string;
      };
      gerar_assinatura_webhook: {
        Args: { p_payload: string; p_secret_key: string; p_timestamp?: number };
        Returns: string;
      };
      gerar_ata_texto: { Args: { p_assembleia_id: string }; Returns: string };
      gerar_taxas_mes: {
        Args: { p_condominio_id: string; p_mes_referencia: string };
        Returns: number;
      };
      get_current_usuario: {
        Args: never;
        Returns: {
          auth_id: string | null;
          avatar_url: string | null;
          condominio_id: string | null;
          cpf: string | null;
          created_at: string;
          data_nascimento: string | null;
          deleted_at: string | null;
          deleted_reason: string | null;
          email: string;
          id: string;
          nome: string;
          notificacoes_email: boolean;
          notificacoes_push: boolean;
          notificacoes_whatsapp: boolean;
          role: Database['public']['Enums']['user_role'];
          status: Database['public']['Enums']['user_status'];
          telefone: string | null;
          tipo_residente: Database['public']['Enums']['tipo_residente'] | null;
          ultimo_acesso: string | null;
          unidade_id: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'usuarios';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      get_user_condominio_id: { Args: never; Returns: string };
      get_user_role: {
        Args: never;
        Returns: Database['public']['Enums']['user_role'];
      };
      is_sindico: { Args: { p_condominio_id?: string }; Returns: boolean };
      is_superadmin: { Args: never; Returns: boolean };
      limpar_api_logs_antigos: { Args: never; Returns: number };
      log_api_request: {
        Args: {
          p_erro_codigo?: string;
          p_erro_mensagem?: string;
          p_integracao_id: string;
          p_ip_address?: unknown;
          p_metodo: string;
          p_path: string;
          p_query_params?: Json;
          p_response_time_ms: number;
          p_status_code: number;
          p_user_agent?: string;
        };
        Returns: string;
      };
      marcar_todas_lidas: { Args: { p_usuario_id: string }; Returns: number };
      mark_comunicado_read: {
        Args: { p_comunicado_id: string };
        Returns: boolean;
      };
      obter_notificacoes_usuario: {
        Args: {
          p_apenas_nao_lidas?: boolean;
          p_limite?: number;
          p_offset?: number;
          p_usuario_id: string;
        };
        Returns: {
          acao_url: string;
          corpo_resumo: string;
          created_at: string;
          lida: boolean;
          lida_em: string;
          notificacao_id: string;
          prioridade: Database['public']['Enums']['prioridade_comunicado'];
          referencia_id: string;
          referencia_tipo: string;
          tipo: Database['public']['Enums']['tipo_notificacao'];
          titulo: string;
        }[];
      };
      publicar_prestacao_contas: {
        Args: { p_prestacao_id: string };
        Returns: boolean;
      };
      regenerar_api_key: {
        Args: { p_integracao_id: string };
        Returns: {
          api_key: string;
          api_key_prefix: string;
        }[];
      };
      regenerate_invite_code:
        | { Args: { p_condominio_id: string }; Returns: string }
        | {
            Args: { p_condominio_id: string; p_validade_dias?: number };
            Returns: {
              codigo: string;
              expira_em: string;
            }[];
          };
      registrar_entrega: {
        Args: {
          p_custo_centavos?: number;
          p_entrega_id: string;
          p_erro_codigo?: string;
          p_erro_mensagem?: string;
          p_provider_id?: string;
          p_provider_response?: Json;
          p_status: Database['public']['Enums']['status_entrega'];
        };
        Returns: boolean;
      };
      registrar_entrega_webhook: {
        Args: {
          p_entrega_id: string;
          p_erro_mensagem?: string;
          p_response_body?: string;
          p_response_time_ms?: number;
          p_status_code: number;
        };
        Returns: boolean;
      };
      registrar_presenca: {
        Args: {
          p_assembleia_id: string;
          p_dispositivo?: string;
          p_ip_address?: unknown;
          p_procuracao_id?: string;
          p_representante_id?: string;
          p_tipo: Database['public']['Enums']['presenca_tipo'];
          p_user_agent?: string;
          p_usuario_id: string;
        };
        Returns: string;
      };
      registrar_push_token: {
        Args: {
          p_device_name?: string;
          p_device_type?: string;
          p_token: string;
          p_usuario_id: string;
        };
        Returns: boolean;
      };
      registrar_voto: {
        Args: {
          p_ip_address?: unknown;
          p_opcao_id?: string;
          p_pauta_id: string;
          p_presenca_id: string;
          p_voto: Database['public']['Enums']['voto_tipo'];
        };
        Returns: string;
      };
      reject_user: {
        Args: { p_motivo?: string; p_usuario_id: string };
        Returns: boolean;
      };
      soft_delete_condominio: {
        Args: { p_condominio_id: string };
        Returns: boolean;
      };
      soft_delete_usuario: {
        Args: { p_motivo?: string; p_usuario_id: string };
        Returns: boolean;
      };
      validar_api_key: {
        Args: { p_api_key: string };
        Returns: {
          ambiente: Database['public']['Enums']['integracao_ambiente'];
          condominio_id: string;
          integracao_id: string;
          rate_limit_restante: number;
          scopes: string[];
        }[];
      };
      validate_invite_code: {
        Args: { p_codigo: string };
        Returns: {
          condominio_id: string;
          condominio_nome: string;
          error_message: string;
          valid: boolean;
        }[];
      };
      verificar_scope: {
        Args: { p_scope_necessario: string; p_scopes_integracao: string[] };
        Returns: boolean;
      };
      vote_faq_useful: {
        Args: { p_faq_id: string; p_util: boolean };
        Returns: boolean;
      };
    };
    Enums: {
      assembleia_status:
        | 'rascunho'
        | 'convocada'
        | 'em_andamento'
        | 'votacao'
        | 'encerrada'
        | 'arquivada';
      assembleia_tipo: 'AGO' | 'AGE' | 'permanente';
      ata_status: 'rascunho' | 'pendente_validacao' | 'validada' | 'rejeitada' | 'arquivada';
      canal_notificacao: 'push' | 'email' | 'whatsapp' | 'sms' | 'voz' | 'in_app' | 'mural';
      categoria_tipo: 'receita' | 'despesa';
      chamado_categoria:
        | 'segunda_via_boleto'
        | 'atualizacao_cadastro'
        | 'reserva_espaco'
        | 'autorizacao_obra'
        | 'mudanca'
        | 'reclamacao'
        | 'sugestao'
        | 'duvida'
        | 'outros';
      chamado_status: 'novo' | 'em_atendimento' | 'aguardando_resposta' | 'resolvido' | 'fechado';
      cobranca_status: 'pendente' | 'pago' | 'atrasado' | 'cancelado' | 'negociado';
      comunicado_categoria:
        | 'geral'
        | 'manutencao'
        | 'financeiro'
        | 'seguranca'
        | 'evento'
        | 'urgente'
        | 'obras'
        | 'assembleia';
      comunicado_status: 'rascunho' | 'publicado' | 'arquivado';
      conector_tipo: 'portaria' | 'contabilidade' | 'calendario' | 'backup' | 'erp' | 'crm';
      integracao_ambiente: 'live' | 'test';
      integracao_status: 'ativa' | 'pausada' | 'erro' | 'desativada' | 'pendente';
      integracao_tipo: 'api_entrada' | 'webhook_saida' | 'conector_nativo' | 'oauth_app';
      lancamento_status: 'pendente' | 'confirmado' | 'cancelado';
      lancamento_tipo: 'receita' | 'despesa' | 'transferencia';
      ocorrencia_categoria:
        | 'barulho'
        | 'vazamento'
        | 'iluminacao'
        | 'limpeza'
        | 'seguranca'
        | 'area_comum'
        | 'elevador'
        | 'portaria'
        | 'animais'
        | 'estacionamento'
        | 'outros';
      ocorrencia_status: 'aberta' | 'em_analise' | 'em_andamento' | 'resolvida' | 'arquivada';
      pauta_status:
        | 'pendente'
        | 'em_votacao'
        | 'encerrada'
        | 'aprovada'
        | 'rejeitada'
        | 'sem_quorum';
      pauta_tipo_votacao:
        | 'aprovacao'
        | 'escolha_unica'
        | 'escolha_multipla'
        | 'eleicao'
        | 'informativo';
      presenca_tipo: 'presencial' | 'online' | 'procuracao' | 'voto_antecipado';
      prestacao_status: 'rascunho' | 'em_revisao' | 'aprovado' | 'publicado' | 'rejeitado';
      prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
      prioridade_comunicado: 'baixa' | 'normal' | 'alta' | 'critica';
      procuracao_status: 'pendente' | 'aceita' | 'recusada' | 'revogada' | 'utilizada';
      quorum_especial: 'maioria_simples' | 'maioria_absoluta' | 'dois_tercos' | 'unanimidade';
      status_entrega:
        | 'pendente'
        | 'agendado'
        | 'enviando'
        | 'enviado'
        | 'entregue'
        | 'lido'
        | 'falhou'
        | 'cancelado';
      taxa_tipo: 'ordinaria' | 'extra' | 'fundo_reserva' | 'multa' | 'juros' | 'outros';
      tier_type: 'starter' | 'professional' | 'enterprise';
      tipo_notificacao:
        | 'comunicado'
        | 'aviso'
        | 'alerta'
        | 'emergencia'
        | 'lembrete'
        | 'cobranca'
        | 'assembleia'
        | 'ocorrencia'
        | 'chamado'
        | 'sistema';
      tipo_residente:
        | 'proprietario_residente'
        | 'proprietario_externo'
        | 'inquilino'
        | 'dependente'
        | 'funcionario';
      unidade_tipo:
        | 'apartamento'
        | 'casa'
        | 'cobertura'
        | 'sala_comercial'
        | 'loja'
        | 'garagem'
        | 'deposito';
      user_role:
        | 'superadmin'
        | 'admin_condo'
        | 'sindico'
        | 'subsindico'
        | 'conselheiro'
        | 'morador'
        | 'proprietario'
        | 'inquilino'
        | 'porteiro'
        | 'zelador';
      user_status: 'pending' | 'active' | 'inactive' | 'suspended' | 'removed';
      voto_tipo: 'sim' | 'nao' | 'abstencao' | 'opcao';
      webhook_entrega_status: 'pendente' | 'enviando' | 'sucesso' | 'falhou' | 'cancelado';
      webhook_evento:
        | 'assembleia.criada'
        | 'assembleia.convocada'
        | 'assembleia.iniciada'
        | 'assembleia.encerrada'
        | 'assembleia.voto_registrado'
        | 'cobranca.gerada'
        | 'cobranca.vencendo'
        | 'pagamento.confirmado'
        | 'pagamento.atrasado'
        | 'lancamento.criado'
        | 'lancamento.atualizado'
        | 'prestacao.publicada'
        | 'comunicado.publicado'
        | 'notificacao.lida'
        | 'ocorrencia.criada'
        | 'ocorrencia.atualizada'
        | 'ocorrencia.resolvida'
        | 'chamado.criado'
        | 'chamado.atualizado'
        | 'chamado.fechado'
        | 'morador.cadastrado'
        | 'morador.aprovado'
        | 'morador.removido'
        | 'morador.atualizado'
        | 'reserva.criada'
        | 'reserva.aprovada'
        | 'reserva.cancelada'
        | 'visitante.entrada'
        | 'visitante.saida'
        | 'encomenda.recebida'
        | 'encomenda.retirada';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Backwards-compatible convenience aliases (used across the codebase)
export type Usuario = Database['public']['Tables']['usuarios']['Row'];
export type RoleType = Database['public']['Enums']['user_role'];

export type Assembleia = Database['public']['Tables']['assembleias']['Row'];
export type StatusAssembleia = Database['public']['Enums']['assembleia_status'];
export type TipoVoto = Database['public']['Enums']['voto_tipo'];

export type Pauta = Database['public']['Tables']['assembleia_pautas']['Row'];

export type Chamado = Database['public']['Tables']['chamados']['Row'];
export type StatusChamado = Database['public']['Enums']['chamado_status'];
export type PrioridadeChamado = Database['public']['Enums']['prioridade'];

export type Comunicado = Database['public']['Tables']['comunicados']['Row'];

export type Lancamento = Database['public']['Tables']['lancamentos_financeiros']['Row'];
export type StatusLancamento = Database['public']['Enums']['lancamento_status'];
export type TipoLancamento = Database['public']['Enums']['lancamento_tipo'];

export type ChamadoComDetalhes = Database['public'] extends { Views: infer V }
  ? 'v_chamado_detalhes' extends keyof V
    ? V['v_chamado_detalhes']
    : unknown
  : unknown;

// Fallback alias to allow gradual migration for other types
export type DBRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export {};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      assembleia_status: [
        'rascunho',
        'convocada',
        'em_andamento',
        'votacao',
        'encerrada',
        'arquivada',
      ],
      assembleia_tipo: ['AGO', 'AGE', 'permanente'],
      ata_status: ['rascunho', 'pendente_validacao', 'validada', 'rejeitada', 'arquivada'],
      canal_notificacao: ['push', 'email', 'whatsapp', 'sms', 'voz', 'in_app', 'mural'],
      categoria_tipo: ['receita', 'despesa'],
      chamado_categoria: [
        'segunda_via_boleto',
        'atualizacao_cadastro',
        'reserva_espaco',
        'autorizacao_obra',
        'mudanca',
        'reclamacao',
        'sugestao',
        'duvida',
        'outros',
      ],
      chamado_status: ['novo', 'em_atendimento', 'aguardando_resposta', 'resolvido', 'fechado'],
      cobranca_status: ['pendente', 'pago', 'atrasado', 'cancelado', 'negociado'],
      comunicado_categoria: [
        'geral',
        'manutencao',
        'financeiro',
        'seguranca',
        'evento',
        'urgente',
        'obras',
        'assembleia',
      ],
      comunicado_status: ['rascunho', 'publicado', 'arquivado'],
      conector_tipo: ['portaria', 'contabilidade', 'calendario', 'backup', 'erp', 'crm'],
      integracao_ambiente: ['live', 'test'],
      integracao_status: ['ativa', 'pausada', 'erro', 'desativada', 'pendente'],
      integracao_tipo: ['api_entrada', 'webhook_saida', 'conector_nativo', 'oauth_app'],
      lancamento_status: ['pendente', 'confirmado', 'cancelado'],
      lancamento_tipo: ['receita', 'despesa', 'transferencia'],
      ocorrencia_categoria: [
        'barulho',
        'vazamento',
        'iluminacao',
        'limpeza',
        'seguranca',
        'area_comum',
        'elevador',
        'portaria',
        'animais',
        'estacionamento',
        'outros',
      ],
      ocorrencia_status: ['aberta', 'em_analise', 'em_andamento', 'resolvida', 'arquivada'],
      pauta_status: ['pendente', 'em_votacao', 'encerrada', 'aprovada', 'rejeitada', 'sem_quorum'],
      pauta_tipo_votacao: [
        'aprovacao',
        'escolha_unica',
        'escolha_multipla',
        'eleicao',
        'informativo',
      ],
      presenca_tipo: ['presencial', 'online', 'procuracao', 'voto_antecipado'],
      prestacao_status: ['rascunho', 'em_revisao', 'aprovado', 'publicado', 'rejeitado'],
      prioridade: ['baixa', 'media', 'alta', 'urgente'],
      prioridade_comunicado: ['baixa', 'normal', 'alta', 'critica'],
      procuracao_status: ['pendente', 'aceita', 'recusada', 'revogada', 'utilizada'],
      quorum_especial: ['maioria_simples', 'maioria_absoluta', 'dois_tercos', 'unanimidade'],
      status_entrega: [
        'pendente',
        'agendado',
        'enviando',
        'enviado',
        'entregue',
        'lido',
        'falhou',
        'cancelado',
      ],
      taxa_tipo: ['ordinaria', 'extra', 'fundo_reserva', 'multa', 'juros', 'outros'],
      tier_type: ['starter', 'professional', 'enterprise'],
      tipo_notificacao: [
        'comunicado',
        'aviso',
        'alerta',
        'emergencia',
        'lembrete',
        'cobranca',
        'assembleia',
        'ocorrencia',
        'chamado',
        'sistema',
      ],
      tipo_residente: [
        'proprietario_residente',
        'proprietario_externo',
        'inquilino',
        'dependente',
        'funcionario',
      ],
      unidade_tipo: [
        'apartamento',
        'casa',
        'cobertura',
        'sala_comercial',
        'loja',
        'garagem',
        'deposito',
      ],
      user_role: [
        'superadmin',
        'admin_condo',
        'sindico',
        'subsindico',
        'conselheiro',
        'morador',
        'proprietario',
        'inquilino',
        'porteiro',
        'zelador',
      ],
      user_status: ['pending', 'active', 'inactive', 'suspended', 'removed'],
      voto_tipo: ['sim', 'nao', 'abstencao', 'opcao'],
      webhook_entrega_status: ['pendente', 'enviando', 'sucesso', 'falhou', 'cancelado'],
      webhook_evento: [
        'assembleia.criada',
        'assembleia.convocada',
        'assembleia.iniciada',
        'assembleia.encerrada',
        'assembleia.voto_registrado',
        'cobranca.gerada',
        'cobranca.vencendo',
        'pagamento.confirmado',
        'pagamento.atrasado',
        'lancamento.criado',
        'lancamento.atualizado',
        'prestacao.publicada',
        'comunicado.publicado',
        'notificacao.lida',
        'ocorrencia.criada',
        'ocorrencia.atualizada',
        'ocorrencia.resolvida',
        'chamado.criado',
        'chamado.atualizado',
        'chamado.fechado',
        'morador.cadastrado',
        'morador.aprovado',
        'morador.removido',
        'morador.atualizado',
        'reserva.criada',
        'reserva.aprovada',
        'reserva.cancelada',
        'visitante.entrada',
        'visitante.saida',
        'encomenda.recebida',
        'encomenda.retirada',
      ],
    },
  },
} as const;
