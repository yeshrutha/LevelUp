import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MessageSquare, X, Send, Bot, Sparkles, Terminal } from 'lucide-react';

export const AICoach = () => {
  const { user, leetcode, projects } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: `Good Evening, Cadet Penguin. I am your LevelUp AI Coach. I monitor your placements readiness (currently at ${user.readiness}%). How can I assist your career prep today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const msg = textToSend || input;
    if (!msg.trim()) return;

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

    // Call Local Backend or use fallback simulated coach response
    try {
      const response = await fetch('http://localhost:5000/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          stats: {
            leetcodeCount: leetcode.length,
            projectsCount: projects.length,
            readiness: user.readiness
          }
        })
      });
      const data = await response.json();
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'ai',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 700);

    } catch (e) {
      // Offline fallback simulator
      setTimeout(() => {
        let reply = "Analyzing core metrics. Try solving a LeetCode problem or completing your project milestones to raise your readiness index!";
        const lowText = msg.toLowerCase();
        
        if (lowText.includes('dsa') || lowText.includes('leetcode')) {
          reply = `With ${leetcode.length} problems solved, I recommend focusing on DSA Trees and Hashmaps. Dedicate 60 minutes to solving 2 medium exercises today!`;
        } else if (lowText.includes('project')) {
          reply = `You have ${projects.length} projects registered. Make sure at least one is fully marked "Interview Ready" and has a valid Vercel/Render live link!`;
        } else if (lowText.includes('resume') || lowText.includes('interview')) {
          reply = "Ensure your resume highlights quantifiable results (e.g., 'Optimized query latency by 40%'). Practice explaining this vocally in our Communication tab.";
        }

        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 800);
    }
  };

  const handleSuggestion = (prompt) => {
    handleSend(prompt);
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
                    Penguin AI Coach <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-display">READYNESS INDEX: {user.readiness}%</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m) => (
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
              ))}

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
                  onClick={() => handleSuggestion('How can I boost my DSA readiness?')}
                  className="text-[10px] px-2.5 py-1 bg-slate-900 border border-white/5 rounded-full hover:border-cyan-400/30 hover:text-cyan-400 transition-colors"
                >
                  💻 DSA Advice
                </button>
                <button
                  onClick={() => handleSuggestion('How to polish my resume?')}
                  className="text-[10px] px-2.5 py-1 bg-slate-900 border border-white/5 rounded-full hover:border-cyan-400/30 hover:text-cyan-400 transition-colors"
                >
                  📝 Resume Tips
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
