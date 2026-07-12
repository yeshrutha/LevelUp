import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, Send, Bot, Sparkles, Trash2 } from 'lucide-react';

export const AICoach = () => {
  const { user } = useApp();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://levelup-1-7j6v.onrender.com';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`levelup_chat_${user?.email}`);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'm1',
        sender: 'ai',
        text: `Hello, ${user?.displayName || 'User'}. I am your Habit Mastery AI Coach. I monitor your readiness index (currently at ${user?.readiness || 0}%). How can I assist your growth journey today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`levelup_chat_${user.email}`, JSON.stringify(messages));
    }
  }, [messages, user?.email]);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const isRequestInFlight = useRef(false);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const displayedMessage = latestMessage.text;
      console.log('MESSAGE RENDERED:', displayedMessage);
      console.log(`[AI COACH] Frontend rendered: ${new Date().toISOString()}`);
      console.log('[AI TRACE] Final rendered component', { component: 'AICoach', message: latestMessage, totalMessages: messages.length });
    }
  }, [messages]);

  const handleSend = async (textToSend, source = 'manual') => {
    const msg = textToSend || input;
    if (!msg.trim()) return;
    if (isRequestInFlight.current) return;
    isRequestInFlight.current = true;
    const tStart = Date.now();

    const endpoint = `${API_BASE_URL}/api/ai/coach`;
    const requestPayload = {
      message: msg,
      email: user?.email,
      displayName: user?.displayName,
      stats: {
        readiness: user?.readiness || 0,
        streak: user?.streak || 0
      }
    };

    console.log('[AI TRACE][1] Prompt received from frontend', { component: 'AICoach', source, ...requestPayload });
    console.log('REQUEST PAYLOAD:', requestPayload);
    console.log('API ENDPOINT:', endpoint);

    if (!textToSend) setInput('');

    // User Message
    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Call the coach API once and render only its successful Gemini response.
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      if (!response.ok) {
        throw new Error('Failed to fetch from coach API');
      }
      const responseData = await response.json();
      console.log('API RESPONSE:', responseData);
      console.log('[AI TRACE][4] Frontend fetch response', { component: 'AICoach', status: response.status, data: responseData });

      // The successful coach contract contains only Gemini's generated text.
      const coachResponse = responseData?.success === true && typeof responseData.response === 'string'
        ? responseData.response
        : '';
      console.log('MESSAGE STORED IN STATE:', coachResponse);
      console.log('[AI TRACE][5] React state payload', { component: 'AICoach', coachResponse });

      setTimeout(() => {
        const aiMessage = {
          id: Math.random().toString(),
          sender: 'ai',
          text: coachResponse,
          source,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        console.log('[AI TRACE][6] React state before render', { component: 'AICoach', coachResponse, message: aiMessage });
        setMessages(prev => {
          const nextMessages = [...prev, aiMessage];
          console.log('[AI TRACE][6] React state after render', { component: 'AICoach', nextMessages });
          return nextMessages;
        });
        setIsTyping(false);
        isRequestInFlight.current = false;
        console.log(`[AI COACH] Frontend total execution time: ${Date.now() - tStart}ms`);
      }, 700);

    } catch (e) {
      console.error('[AI TRACE] Frontend fetch failure', { component: 'AICoach', error: e?.message || e });
      setIsTyping(false);
      isRequestInFlight.current = false;
      console.log(`[AI COACH] Frontend total execution time: ${Date.now() - tStart}ms`);
    }
  };

  const handleSuggestion = (prompt) => {
    console.log('SUGGESTION TEXT:', prompt);
    console.log('FUNCTION CALLED: handleSend');
    handleSend(prompt, 'suggestion');
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your AI Coach chat history?")) {
      const defaultMsg = [
        {
          id: 'm1',
          sender: 'ai',
          text: `Hello, ${user?.displayName || 'User'}. I am your Habit Mastery AI Coach. I monitor your readiness index (currently at ${user?.readiness || 0}%). How can I assist your growth journey today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(defaultMsg);
      if (user?.email) {
        localStorage.setItem(`levelup_chat_${user.email}`, JSON.stringify(defaultMsg));
      }
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-primary to-accent text-slate-900 shadow-glow-accent cursor-pointer flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[500px] glass-panel rounded-xl flex flex-col shadow-2xl border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-cyan-500/10 border border-cyan-400/20 text-cyan-400">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-futuristic font-bold text-sm text-white flex items-center gap-1.5">
                    LevelUp AI Coach <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-display">READYNESS INDEX: {user.readiness}%</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearChat}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-white/5 cursor-pointer"
                  title="Clear Chat History"
                >
                  <Trash2 size={15} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m) => {
                console.log('[AI TRACE][6] Final rendered text', { component: 'AICoach', renderedText: m.text });
                return (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-primary/20 border border-primary/30 text-white rounded-br-none'
                        : 'bg-slate-900/60 border border-white/5 text-slate-300 rounded-bl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className="block text-[8px] text-slate-500 text-right mt-1.5">{m.time}</span>
                  </div>
                </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/60 border border-white/5 text-slate-300 rounded-lg rounded-bl-none p-3 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 bg-slate-950/40 border-t border-white/5 flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleSuggestion('Suggest today\'s focus')}
                  className="text-[10px] px-2.5 py-1 bg-slate-900 border border-white/5 rounded-full hover:border-cyan-400/30 hover:text-cyan-400 transition-colors"
                >
                  🎯 Daily Focus
                </button>
                <button
                  onClick={() => handleSuggestion('How can I maintain my daily habit streaks?')}
                  className="text-[10px] px-2.5 py-1 bg-slate-900 border border-white/5 rounded-full hover:border-cyan-400/30 hover:text-cyan-400 transition-colors"
                >
                  🏋️ Habit Streaks
                </button>
                <button
                  onClick={() => handleSuggestion('Suggest calendar scheduling best practices')}
                  className="text-[10px] px-2.5 py-1 bg-slate-900 border border-white/5 rounded-full hover:border-cyan-400/30 hover:text-cyan-400 transition-colors"
                >
                  📅 Calendar Planning
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-slate-950/70 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your AI coach..."
                className="flex-1 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/40 transition-colors"
              />
              <button
                onClick={() => handleSend()}
                className="p-2 rounded-lg bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
