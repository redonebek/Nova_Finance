import React, { useState, useRef, useEffect } from 'react';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { GlassCard } from './ui/GlassCard';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';

interface AIAdvisorProps {
  transactions: Transaction[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis Nova, votre architecte financier IA. J'ai accès à vos données. Interrogez-moi sur vos habitudes de dépenses, comment économiser, ou demandez une prévision financière !",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const advice = await getFinancialAdvice(transactions, userMsg.content);
      const aiMsg: Message = { role: 'assistant', content: advice, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      // Error handled in service, but robust fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <GlassCard className="h-[600px] flex flex-col p-0 overflow-hidden relative border-slate-200 dark:border-slate-700">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-violet-50/50 dark:from-violet-900/20 to-transparent pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white">
                <Bot size={24} />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">Conseiller Nova <Sparkles size={14} className="text-yellow-500 fill-yellow-500" /></h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Propulsé par Gemini 3.0 Pro</p>
            </div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/30 dark:bg-slate-900/30">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-slate-900 dark:bg-violet-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none'
                    }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 shadow-sm">
                        <Loader2 size={16} className="animate-spin text-violet-600 dark:text-violet-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Nova réfléchit...</span>
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez une question sur vos finances..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-4 pr-12 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-400"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    </GlassCard>
  );
};