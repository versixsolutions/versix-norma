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
  sources?: Array<{
    type: string;
    name: string;
    content: string;
  }>;
  suggestions?: string[];
  timestamp: Date;
  status: 'sending' | 'sent' | 'error' | 'streaming';
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
  stopStreaming?: () => void;
}

// ============================================
// HOOK
// ============================================
export function useNormaChat({ condominioId, userId }: UseNormaChatOptions): UseNormaChatReturn {
  const supabase = getSupabaseClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================
  // LOAD HISTORY
  // ============================================
  const loadHistory = useCallback(async () => {
    if (!condominioId || !userId) return;

    try {
      const { data, error } = await supabase
        .from('norma_chat_logs')
        .select('*')
        .eq('condominio_id', condominioId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const historyMessages: Message[] = [];

        data.reverse().forEach((log, index) => {
          // Add user message
          historyMessages.push({
            id: `hist-user-${index}`,
            text: log.message,
            sender: 'user',
            timestamp: new Date(log.created_at),
            status: 'sent',
          });

          // Add bot response
          historyMessages.push({
            id: `hist-bot-${index}`,
            text: log.response,
            sender: 'bot',
            sources: log.sources || [],
            timestamp: new Date(log.created_at),
            status: 'sent',
          });
        });

        setMessages(historyMessages);
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  }, [condominioId, userId, supabase]);

  // ============================================
  // STOP STREAMING
  // ============================================
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  }, []);

  // ============================================
  // SEND MESSAGE
  // ============================================
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !condominioId || !userId) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
    };

    // Add streaming bot message placeholder
    const botMessageId = `bot-${Date.now()}`;
    const botMessage: Message = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      status: 'streaming',
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setIsTyping(true);
    setError(null);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.slice(-10).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
        timestamp: m.timestamp.toISOString(),
      }));

      // Call Edge Function ask-norma
      const { data, error: fnError } = await supabase.functions.invoke('ask-norma', {
        body: {
          message: text.trim(),
          condominioId,
          userId,
          conversationHistory,
        },
      });

      if (fnError) throw fnError;

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      // Update bot message with complete response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: data.response || 'Desculpe, não consegui processar sua pergunta.',
                sources: data.sources || [],
                suggestions: data.suggestions || [],
                status: 'sent' as const,
              }
            : msg
        )
      );

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, remove the streaming message
        setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId));
        return;
      }

      console.error('Erro ao enviar mensagem:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));

      // Update message with error status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
                status: 'error' as const,
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  }, [condominioId, userId, messages, supabase]);

  // ============================================
  // CLEAR MESSAGES
  // ============================================
  const clearMessages = useCallback(() => {
    stopStreaming();
    setMessages([]);
    setError(null);
  }, [stopStreaming]);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    clearMessages,
    loadHistory,
    stopStreaming,
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
        text: 'Olá! Sou Norma, sua assistente de governança condominial. Como posso ajudar você hoje?',
        sources: [],
        suggestions: ['Verificar regimento interno', 'Agendar assembleia', 'Consultar síndico'],
      },
      {
        text: 'De acordo com o Regimento Interno do seu condomínio, o horário de silêncio é das 22h às 8h. Esta norma visa garantir o bem-estar de todos os moradores.',
        sources: [{ type: 'regimento', name: 'Regimento Interno', content: 'Art. 15 - Horário de silêncio' }],
        suggestions: ['Registrar ocorrência', 'Falar com vizinho', 'Verificar regras'],
      },
      {
        text: 'Para reservar áreas comuns como salão de festas, é necessário fazer a solicitação com antecedência mínima de 15 dias através do aplicativo.',
        sources: [{ type: 'regimento', name: 'Regimento Interno', content: 'Cap. VII - Áreas Comuns' }],
        suggestions: ['Fazer reserva', 'Verificar disponibilidade', 'Consultar taxas'],
      },
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      text: randomResponse.text,
      sender: 'bot',
      sources: randomResponse.sources,
      suggestions: randomResponse.suggestions,
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
