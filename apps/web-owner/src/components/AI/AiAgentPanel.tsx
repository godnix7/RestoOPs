'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Maximize2,
  Terminal,
  ArrowUpRight
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

export default function AiAgentPanel({ 
  isOpen, 
  onClose,
  initialPrompt 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  initialPrompt?: string
}) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I'm your RestroOps Auditor. I've finished analyzing your morning sales. Would you like to see the labor cost variance for today?",
      suggestions: ['Show Labor Variance', 'Check Sales Trend', 'Current Payroll']
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const resetChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: "Hello! I'm your RestroOps Auditor. How can I help you today?",
        suggestions: ['Show Labor Variance', 'Check Sales Trend', 'Current Payroll']
      }
    ]);
  };

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const handleSend = async (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsThinking(true);

    try {
      const res = await apiClient.post('/ai/chat', { 
        message: userMsg,
        restaurantId: 'temp-restaurant-id'
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        suggestions: data.suggestions
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-[450px] glass border-l border-white/10 z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Auditor</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Insight Mode</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={resetChat} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10 rounded-tr-none' 
                      : 'glass border-white/5 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  
                  {msg.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.suggestions.map((s, si) => (
                        <button 
                          key={si} 
                          onClick={() => handleSend(s)}
                          className="text-[11px] px-3 py-1.5 glass hover:bg-blue-600/20 hover:border-blue-500/30 text-blue-400 rounded-full transition-all border-white/5 flex items-center gap-1"
                        >
                          {s} <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium italic">
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></span>
                  </div>
                  Auditor is analyzing data...
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Ask anything about your business..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 pr-14 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 resize-none h-24"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 px-1">
                <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Press Enter to send</span>
                <span>Powered by RestroIntelligence</span>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
