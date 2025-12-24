'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  citation?: string;
}

interface NormaChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NormaChat({ isOpen, onClose }: NormaChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: 1,
            text: 'Olá, Igor! Sou a Norma, sua assistente virtual. Como posso ajudar com o regimento ou dúvidas do condomínio hoje?',
            sender: 'bot',
          },
        ]);
        setIsTyping(false);
      }, 800);
    }
  }, [isOpen, messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // TODO: Integrar com Edge Function ask-norma
    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now() + 1,
        text: 'Entendi. De acordo com o Artigo 42 do Regimento Interno, obras são permitidas de segunda a sexta, das 08h às 17h, e aos sábados das 08h às 12h. Domingos e feriados são proibidos.',
        sender: 'bot',
        citation: 'Cap. V - Das Obras e Reformas',
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-bg-dark animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-bg-dark/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-blue-600 flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Norma AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-gray-500 font-medium">Online • Regimento v2.4</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-500">expand_more</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white dark:bg-card-dark text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
              }`}
            >
              {msg.text}
              {msg.citation && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">menu_book</span>
                    {msg.citation}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-card-dark p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 flex gap-1">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce animation-delay-100" />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce animation-delay-200" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="shrink-0 p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-bg-dark flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua pergunta..."
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2 bg-primary text-white rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>
    </div>
  );
}
