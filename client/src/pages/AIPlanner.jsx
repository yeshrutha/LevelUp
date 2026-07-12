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

const MarkdownRenderer = ({ text, isUser }) => {
  if (!text) return null;
  if (isUser) {
    return <p className="text-slate-200 select-text leading-relaxed text-xs">{text}</p>;
  }
  
  const lines = text.split('\n');
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];
  const renderedElements = [];
  let listItems = [];
  let inList = false;

  const flushList = (key) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={key} className="list-disc pl-5 space-y-1.5 my-2 text-slate-350 select-text">
          {listItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0 || tableHeaders.length > 0) {
      renderedElements.push(
        <div key={key} className="overflow-x-auto my-3.5 border border-white/5 rounded-lg w-full select-text">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-white/10">
                {tableHeaders.map((h, i) => (
                  <th key={i} className="p-2 font-bold text-slate-300 uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01]">
                  {row.map((cell, j) => (
                    <td key={j} className="p-2 text-slate-400 font-mono text-[10.5px]">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('|')) {
      flushList(`list_${index}`);
      inTable = true;
      const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      
      if (cells.every(c => c.startsWith('-'))) {
        return;
      }
      
      if (tableHeaders.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      return;
    } else {
      if (inTable) {
        flushTable(`table_${index}`);
      }
    }

    if (trimmed.startsWith('#')) {
      flushList(`list_${index}`);
      const level = trimmed.match(/^#+/)[0].length;
      const content = trimmed.replace(/^#+\s*/, '');
      const headingClass = level === 1 
        ? 'text-xs font-futuristic font-bold text-cyan-400 mt-4 mb-2 uppercase border-b border-white/5 pb-1 flex items-center gap-1' 
        : 'text-[11px] font-bold text-white mt-3 mb-1.5';
      renderedElements.push(React.createElement(`h${Math.min(level + 1, 6)}`, { key: index, className: headingClass }, content));
      return;
    }

    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      inList = true;
      const content = trimmed.replace(/^[-*]\s*/, '');
      listItems.push(content);
      return;
    } else {
      if (inList) {
        flushList(`list_${index}`);
      }
    }

    if (trimmed !== '') {
      renderedElements.push(<p key={index} className="text-slate-350 my-1.5 leading-relaxed text-[11px] select-text">{trimmed}</p>);
    }
  });

  flushList('final_list');
  flushTable('final_table');

  return <div className="space-y-1 w-full">{renderedElements}</div>;
};

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

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      console.log('[AI TRACE] Final rendered component', { component: 'AIPlanner', message: latestMessage, totalMessages: messages.length });
    }
  }, [messages]);

  const handleSend = async (textToSend) => {
    const msg = textToSend || input;
    if (!msg.trim()) return;

    console.log('[AI TRACE][1] Prompt received from frontend', { component: 'AIPlanner', message: msg, userEmail: user?.email, displayName: user?.displayName, stats: { readiness: user?.readiness || 0, streak: user?.streak || 0 } });

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

    const tStart = Date.now();
    try {
      console.log(`[PERF TRACE] 1. Frontend request sent at: ${new Date().toISOString()}`);
      
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

      console.log(`[PERF TRACE] 5. Frontend received initial response code ${response.status} at delta: ${Date.now() - tStart}ms`);
      
      if (!response.ok) {
        throw new Error('Coach API offline');
      }
      
      const data = await response.json();
      console.log(`[PERF TRACE] 9. Frontend finished JSON parsing and formatting response at delta: ${Date.now() - tStart}ms`);
      console.log('[AI TRACE][6] Frontend fetch result', { component: 'AIPlanner', status: response.status, data });

      const aiResponse = typeof data?.aiResponse === 'string' && data.aiResponse.length > 0
        ? data.aiResponse
        : (typeof data?.reply === 'string' && data.reply.length > 0 ? data.reply : '');
      console.log('[AI TRACE][7] Parsed response', { component: 'AIPlanner', aiResponse });

      const aiMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: aiResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      console.log('[AI TRACE][7] React state before render', { component: 'AIPlanner', aiResponse, message: aiMessage });
      setMessages(prev => {
        const nextMessages = [...prev, aiMessage];
        console.log('[AI TRACE][7] React state after render', { component: 'AIPlanner', nextMessages });
        return nextMessages;
      });
    } catch (e) {
      console.error('[AI TRACE] Frontend fetch failure', { component: 'AIPlanner', error: e?.message || e });
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

        const aiMessage = {
          id: Math.random().toString(),
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        console.log('[AI TRACE][7] React state before render', { component: 'AIPlanner', aiResponse: reply, message: aiMessage });
        setMessages(prev => {
          const nextMessages = [...prev, aiMessage];
          console.log('[AI TRACE][7] React state after render', { component: 'AIPlanner', nextMessages });
          return nextMessages;
        });
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
          console.log('[AI TRACE][8] Component rendering message', { component: 'AIPlanner', message: m });
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
                className={`p-3.5 rounded-xl border leading-relaxed text-xs w-full ${
                  isUser 
                    ? 'bg-slate-900 border-white/10 text-white rounded-tr-none' 
                    : 'bg-slate-900/30 border-cyan-500/10 text-slate-200 rounded-tl-none shadow-glow-cyan/5'
                }`}
              >
                <MarkdownRenderer text={m.text} isUser={isUser} />
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
