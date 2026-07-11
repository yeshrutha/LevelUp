import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Bot, 
  Sparkles, 
  Trash2, 
  Activity, 
  Loader2, 
  Flame, 
  Target 
} from 'lucide-react';

export default function AIPlanner() {
  const { user } = useApp();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://levelup-1-7j6v.onrender.com';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`levelup_chat_main_${user?.email}`);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'm1',
        sender: 'ai',
        text: `Hello, ${user?.displayName || 'Master'}. I am your Habit Mastery AI Coach. I monitor your readiness index (currently at ${user?.readiness || 0}%). Ask me anything to receive real-time productivity advice, learning assistance, or wellness support!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync to local storage
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`levelup_chat_main_${user.email}`, JSON.stringify(messages));
    }
  }, [messages, user?.email]);

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

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          email: user?.email,
          displayName: user?.displayName,
          stats: {
            readiness: user?.readiness || 0,
            streak: user?.streak || 0
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Coach API offline');
      }
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      console.error(e);
      // Fallback simulated helper advice
      setTimeout(() => {
        let reply = "I am currently processing your request. Completing your workspace pages and daily checklist is the fastest way to master your habits.";
        const lowText = msg.toLowerCase();
        
        if (lowText.includes('habit') || lowText.includes('routine') || lowText.includes('streak')) {
          reply = "Habit formation requires strict daily consistency. Try marking your attendance daily in the Habit Tracker tab to maintain your streak!";
        } else if (lowText.includes('exam') || lowText.includes('study') || lowText.includes('rust')) {
          reply = "For study preparation, break your blocks into 25-minute focus intervals. Schedule your exam dates in the Calendar Planner to keep milestones visible.";
        } else if (lowText.includes('procrastinate') || lowText.includes('lazy')) {
          reply = "Procrastination happens when tasks feel overwhelming. Start with a single small target, like 'Drink Water' or 'Write 5 lines of code'. Just complete one daily cell!";
        }

        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 600);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (promptText) => {
    handleSend(promptText);
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your AI Coach chat history?")) {
      const defaultMsg = [
        {
          id: 'm1',
          sender: 'ai',
          text: `Hello, ${user?.displayName || 'Master'}. I am your Habit Mastery AI Coach. I monitor your readiness index (currently at ${user?.readiness || 0}%). Ask me anything to receive real-time productivity advice, learning assistance, or wellness support!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(defaultMsg);
      if (user?.email) {
        localStorage.setItem(`levelup_chat_main_${user.email}`, JSON.stringify(defaultMsg));
      }
    }
  };

  const suggestionPrompts = [
    "I wake up at 8 AM and sleep at 2 AM. Help me become productive.",
    "I have exams in 20 days. Give me a strategy.",
    "I procrastinate a lot. How do I stop?",
    "I want to lose weight and eat healthy.",
    "I am learning Rust. Assist my study blocks."
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto py-2 relative select-text text-left">
      
      {/* Header Panel */}
      <div className="glass-panel p-4 rounded-xl border-white/10 flex items-center justify-between bg-slate-900/40 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 rounded-lg">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-futuristic font-bold text-white uppercase tracking-wider">
              AI Productivity Coach Terminal
            </h2>
            <p className="text-[9px] text-slate-400 font-display uppercase tracking-widest mt-0.5">
              Real-time conversational LLM coach
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-950/60 border border-white/5 rounded-lg">
            <Activity size={12} className="text-cyan-400" />
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Readiness: {user?.readiness}%</span>
          </div>

          <button
            onClick={handleClearChat}
            className="p-2 bg-slate-950 hover:bg-slate-900 border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
            title="Clear Chat Logs"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Suggestion Prompts Section (shows when chat only contains welcome message) */}
      {messages.length === 1 && (
        <div className="mt-4 p-4 glass-panel border-white/5 bg-slate-900/10 rounded-xl space-y-2.5 shrink-0 select-none">
          <span className="text-[8px] font-bold font-futuristic text-cyan-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={12} /> Suggestion Prompts
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestionPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestion(p)}
                className="text-[10px] text-slate-350 hover:text-white bg-slate-950/50 hover:bg-slate-900 border border-white/5 hover:border-cyan-500/30 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Immersive Scrollable Chat History area */}
      <div className="flex-1 overflow-y-auto my-4 p-4 glass-panel border-white/10 bg-slate-950/45 rounded-xl space-y-4 custom-scrollbar">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div 
              key={m.id} 
              className={`flex flex-col max-w-[80%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">
                {isUser ? 'Master' : 'Coach'} • {m.time}
              </span>
              <div 
                className={`p-3.5 rounded-xl border leading-relaxed text-xs ${
                  isUser 
                    ? 'bg-slate-900 border-white/10 text-white rounded-tr-none' 
                    : 'bg-slate-900/30 border-cyan-500/10 text-slate-200 rounded-tl-none shadow-glow-cyan/5 whitespace-pre-wrap'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex flex-col items-start max-w-[80%]">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Coach • Typing...</span>
            <div className="bg-slate-900/30 border border-cyan-500/10 p-3 rounded-xl rounded-tl-none flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-cyan-400" />
              <span className="text-[10px] text-slate-400 font-display uppercase tracking-widest">Consulting matrix...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Input controller */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="glass-panel p-2.5 rounded-xl border-white/10 bg-slate-900/40 flex gap-2.5 shrink-0 select-none"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Consult your AI Productivity Coach..."
          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-slate-200 placeholder-slate-655 focus:outline-none focus:border-cyan-500/45 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 rounded-lg cursor-pointer transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-glow-accent"
        >
          <Send size={15} />
        </button>
      </form>

    </div>
  );
}
