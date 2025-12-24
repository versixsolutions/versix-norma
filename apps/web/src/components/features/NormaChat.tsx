'use client';

import { useEffect, useRef, useState } from 'react';

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

export default function NormaChat({ isOpen, onClose }: NormaChatProps) {
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
    <div className="fixed inset-0 z-50 flex animate-slide-up flex-col bg-white dark:bg-bg-dark">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white/90 p-4 backdrop-blur-md dark:border-gray-800 dark:bg-bg-dark/90">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-secondary to-blue-600 text-white shadow-lg">
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Norma AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-[10px] font-medium text-gray-500">Online • Regimento v2.4</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined text-gray-500">expand_more</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 dark:bg-black/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'rounded-tr-none bg-primary text-white'
                  : 'rounded-tl-none border border-gray-100 bg-white text-gray-700 dark:border-gray-700 dark:bg-card-dark dark:text-gray-200'
              }`}
            >
              {msg.text}
              {msg.citation && (
                <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-700">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-secondary">
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
            <div className="flex gap-1 rounded-2xl rounded-tl-none border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-card-dark">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" />
              <span className="animation-delay-100 h-2 w-2 animate-bounce rounded-full bg-gray-300" />
              <span className="animation-delay-200 h-2 w-2 animate-bounce rounded-full bg-gray-300" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex shrink-0 gap-2 border-t border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-bg-dark"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua pergunta..."
          className="flex-1 rounded-xl bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="rounded-xl bg-primary p-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>
    </div>
  );
}
