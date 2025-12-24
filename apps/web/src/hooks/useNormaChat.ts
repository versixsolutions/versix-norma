'use client';

import { getSupabaseClient } from '@/lib/supabase';
import { useCallback, useRef, useState } from 'react';

// ============================================
// TYPES
// ============================================
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  citation?: string;
  sources?: {
    documento_id: string;
    titulo: string;
    trecho: string;
    relevancia: number;
  }[];
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}

interface UseNormaChatOptions {
  condominioId: string | null;
  userId: string | null;
}

interface UseNormaChatReturn {
  messages: Message[];
  isTyping: boolean;
  error: Error | null;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  loadHistory: () => Promise<void>;
}

// ============================================
// HOOK
// ============================================
export function useNormaChat({ condominioId, userId }: UseNormaChatOptions): UseNormaChatReturn {
  const supabase = getSupabaseClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const conversaIdRef = useRef<string | null>(null);

  // ============================================
  // LOAD HISTORY
  // ============================================
  const loadHistory = useCallback(async () => {
    if (!condominioId || !userId) return;

    try {
      const { data, error } = await supabase
        .from('conversas_norma')
        .select('id, mensagens')
        .eq('usuario_id', userId)
        .eq('condominio_id', condominioId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (ok)
        throw error;
      }

      if (data) {
        conversaIdRef.current = data.id;

        const mensagensHistoricoRaw = Array.isArray(data.mensagens) ? data.mensagens : [];

        const mensagensHistorico: Message[] = mensagensHistoricoRaw.map(
          (item: unknown, i: number) => {
            const obj = item as unknown as Record<string, unknown>;

            const text = typeof obj.text === 'string' ? obj.text : '';
            const sender = obj.sender === 'bot' ? 'bot' : 'user';
            const citation = typeof obj.citation === 'string' ? obj.citation : undefined;
            const sources = Array.isArray(obj.sources)
              ? (obj.sources as Message['sources'])
              : undefined;
            const timestamp = obj.timestamp ? new Date(String(obj.timestamp)) : new Date();

            return {
              id: `hist-${i}`,
              text,
              sender,
              citation,
              sources,
              timestamp,
              status: 'sent',
            };
          }
        );

        setMessages(mensagensHistorico);
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  }, [condominioId, userId, supabase]);

  // ============================================
  // ============================================
  // SAVE CONVERSATION
  // ============================================
  const saveConversation = useCallback(
    async (msgs: Message[]) => {
      if (!condominioId || !userId) return;

      const mensagensParaSalvar = msgs.map((m) => ({
        text: m.text,
        sender: m.sender,
        citation: m.citation,
        sources: m.sources,
        timestamp: m.timestamp.toISOString(),
      }));

      try {
        if (conversaIdRef.current) {
          // Atualizar conversa existente
          await supabase
            .from('conversas_norma')
            .update({
              mensagens: mensagensParaSalvar,
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversaIdRef.current);
        } else {
          // Criar nova conversa
          const { data } = await supabase
            .from('conversas_norma')
            .insert({
              usuario_id: userId,
              condominio_id: condominioId,
              mensagens: mensagensParaSalvar,
            })
            .select('id')
            .single();

          if (data) {
            conversaIdRef.current = data.id;
          }
        }
      } catch (err) {
        console.error('Erro ao salvar conversa:', err);
      }
    },
    [condominioId, userId, supabase]
  );

  // SEND MESSAGE
  // ============================================
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !condominioId) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        text: text.trim(),
        sender: 'user',
        timestamp: new Date(),
        status: 'sent',
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
      setError(null);

      try {
        // Chamar Edge Function ask-norma
        const { data, error: fnError } = await supabase.functions.invoke('ask-norma', {
          body: {
            mensagem: text.trim(),
            condominio_id: condominioId,
            usuario_id: userId,
            conversa_id: conversaIdRef.current,
            historico: messages.slice(-10).map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
          },
        });

        if (fnError) throw fnError;

        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: data.resposta || 'Desculpe, não consegui processar sua pergunta.',
          sender: 'bot',
          citation: data.citacao,
          sources: data.fontes,
          timestamp: new Date(),
          status: 'sent',
        };

        setMessages((prev) => [...prev, botMessage]);

        // Atualizar conversa_id se nova conversa foi criada
        if (data.conversa_id) {
          conversaIdRef.current = data.conversa_id;
        }

        // Salvar no histórico
        await saveConversation([...messages, userMessage, botMessage]);
      } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
        setError(err as Error);

        // Mensagem de erro
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
          sender: 'bot',
          timestamp: new Date(),
          status: 'error',
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [condominioId, userId, messages, supabase, saveConversation]
  );

  // ============================================
  // SAVE CONVERSATION
  // ============================================
  const saveConversation = useCallback(
    async (msgs: Message[]) => {
      if (!condominioId || !userId) return;

      const mensagensParaSalvar = msgs.map((m) => ({
        text: m.text,
        sender: m.sender,
        citation: m.citation,
        sources: m.sources,
        timestamp: m.timestamp.toISOString(),
      }));

      try {
        if (conversaIdRef.current) {
          // Atualizar conversa existente
          await supabase
            .from('conversas_norma')
            .update({
              mensagens: mensagensParaSalvar,
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversaIdRef.current);
        } else {
          // Criar nova conversa
          const { data } = await supabase
            .from('conversas_norma')
            .insert({
              usuario_id: userId,
              condominio_id: condominioId,
              mensagens: mensagensParaSalvar,
            })
            .select('id')
            .single();

          if (data) {
            conversaIdRef.current = data.id;
          }
        }
      } catch (err) {
        console.error('Erro ao salvar conversa:', err);
      }
    },
    [condominioId, userId, supabase]
  );

  // ============================================
  // CLEAR MESSAGES
  // ============================================
  const clearMessages = useCallback(() => {
    setMessages([]);
    conversaIdRef.current = null;
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    clearMessages,
    loadHistory,
  };
}

// ============================================
// FALLBACK: Mock para desenvolvimento
// ============================================
export function useNormaChatMock(): UseNormaChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const responses = [
      {
        text: 'De acordo com o Artigo 42 do Regimento Interno, obras são permitidas de segunda a sexta, das 08h às 17h, e aos sábados das 08h às 12h. Domingos e feriados são proibidos.',
        citation: 'Cap. V - Das Obras e Reformas',
      },
      {
        text: 'O horário de silêncio, conforme o Artigo 15, é das 22h às 08h em dias úteis e das 22h às 09h em finais de semana e feriados.',
        citation: 'Cap. III - Da Convivência',
      },
      {
        text: 'Para reservar o salão de festas, você deve fazer a solicitação com 15 dias de antecedência através do aplicativo. A taxa de reserva é de R$ 250,00.',
        citation: 'Cap. VII - Das Áreas Comuns',
      },
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      text: randomResponse.text,
      sender: 'bot',
      citation: randomResponse.citation,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  return {
    messages,
    isTyping,
    error: null,
    sendMessage,
    clearMessages: () => setMessages([]),
    loadHistory: async () => {},
  };
}
