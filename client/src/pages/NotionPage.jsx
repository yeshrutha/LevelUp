import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Trash2, Calendar, CheckSquare, ListTodo, Sliders, Play, AlertCircle, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotionPage = ({ pageId }) => {
  const { customPages, updateCustomPage, deleteCustomPage, togglePageTask, setCurrentTab } = useApp();
  
  // Find current active page
  const page = customPages.find(p => p.id === pageId);

  const [activeDayIdx, setActiveDayIdx] = useState(0); // Day 1 by default (index 0)
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ['📝', '💻', '🚀', '🔥', '📚', '🎯', '🏋️', '🗣️', '💼', '🏆', '🎨', '🧠'];

  // If page not found, safety fallback
  if (!page) {
    return (
      <div className="text-center py-12 text-slate-500 text-xs font-display">
        Workspace page not found.
      </div>
    );
  }

  // Calculate dates based on index
  const getDateForDayIndex = (startDateStr, idx) => {
    const start = new Date(startDateStr || new Date());
    start.setDate(start.getDate() + idx);
    return start.toISOString().split('T')[0];
  };

  const activeDate = getDateForDayIndex(page.startDate, activeDayIdx);
  const activeDayCompletedTasks = page.completedLogs?.[activeDate] || [];

  // Submit AI Prompt to backend or fallback local matching
  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/notion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, termDays: page.termDays })
      });
      const data = await response.json();
      
      setTimeout(() => {
        updateCustomPage({ ...page, tasks: data.tasks });
        setAiLoading(false);
        setAiPrompt('');
      }, 1000);

    } catch (err) {
      // Local fallback generator matching prompt keywords
      setTimeout(() => {
        const pLower = aiPrompt.toLowerCase();
        let tasks = [];

        if (pLower.includes('dsa') || pLower.includes('algorithm') || pLower.includes('leetcode')) {
          tasks = [
            { id: 'nt1', text: 'Solve 1 LeetCode Easy & study optimal approach' },
            { id: 'nt2', text: 'Solve 1 LeetCode Medium under 35 minutes' },
            { id: 'nt3', text: 'Map out code complexity space/time limits' },
            { id: 'nt4', text: 'Review standard recursion call trees' }
          ];
        } else if (pLower.includes('web') || pLower.includes('react') || pLower.includes('node') || pLower.includes('frontend') || pLower.includes('backend')) {
          tasks = [
            { id: 'nt1', text: 'Write reusable UI components with dark glassmorphism' },
            { id: 'nt2', text: 'Configure local express routes & error middleware' },
            { id: 'nt3', text: 'Test endpoint outputs using curl or fetch calls' },
            { id: 'nt4', text: 'Sync state hooks to localStorage and clear queues' }
          ];
        } else {
          tasks = [
            { id: 'nt1', text: 'Review active roadmap lessons' },
            { id: 'nt2', text: 'Review 1 flagged active recall concept' },
            { id: 'nt3', text: 'Log 45 minutes of keyboard coding exercises' },
            { id: 'nt4', text: 'Solve 1 algorithmic puzzle challenge' }
          ];
        }

        updateCustomPage({ ...page, tasks });
        setAiLoading(false);
        setAiPrompt('');
      }, 1000);
    }
  };

  // Recalculate Page Progress Metrics
  const totalPossibleChecks = (page.tasks || []).length * page.termDays;
  let totalChecked = 0;
  Object.values(page.completedLogs || {}).forEach(list => {
    totalChecked += (list || []).length;
  });

  const totalProgressPercent = totalPossibleChecks > 0 
    ? Math.round((totalChecked / totalPossibleChecks) * 100)
    : 0;

  const activeDayProgressPercent = (page.tasks || []).length > 0
    ? Math.round((activeDayCompletedTasks.length / page.tasks.length) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Back to Dashboard breadcrumb link */}
      <button 
        onClick={() => setCurrentTab('dashboard')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent font-semibold transition-colors cursor-pointer"
      >
        ← Back to Dashboard
      </button>
      
      {/* Cover Color Block */}
      <div className="h-32 rounded-xl bg-gradient-to-r from-primary via-indigo-950 to-accent relative overflow-hidden border border-white/10 shadow-lg">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-xs" />
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          
          {/* Dynamic Emoji Icon Button */}
          <div className="relative">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-12 h-12 rounded-lg bg-slate-900 border border-white/20 flex items-center justify-center text-2xl shadow hover:border-accent/40 cursor-pointer transition-colors"
            >
              {page.icon || '📝'}
            </button>

            {/* Emoji Selection Drawer */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-14 left-0 w-44 bg-slate-900 border border-white/15 rounded-lg p-2 grid grid-cols-4 gap-1.5 z-40 shadow-2xl"
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        updateCustomPage({ ...page, icon: emoji });
                        setShowEmojiPicker(false);
                      }}
                      className="p-1 hover:bg-white/5 rounded text-lg cursor-pointer transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Editable Title input */}
          <input 
            type="text"
            value={page.title}
            onChange={(e) => updateCustomPage({ ...page, title: e.target.value })}
            placeholder="Untitled Workspace"
            className="text-2xl font-black font-display bg-transparent text-white border-b border-transparent hover:border-white/10 focus:border-cyan-400/40 focus:outline-none py-1 select-text transition-colors"
          />

        </div>

        {/* Delete Page action */}
        <button
          onClick={() => {
          deleteCustomPage(page.id);
          setCurrentTab('dashboard');
        }}
          className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 rounded text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
          title="Delete Workspace Page"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Workspace Config panel: Timeline setup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Timeline Term Configuration */}
        <div className="md:col-span-2 glass-panel p-5 rounded-xl border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
              Term Schedule Duration
            </h4>
            <span className="text-xs font-bold font-futuristic text-accent bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded">
              {page.termDays} Days Term
            </span>
          </div>

          <div className="flex gap-4 items-center">
            <Sliders size={16} className="text-slate-500" />
            <input 
              type="range"
              min="1"
              max="30"
              value={page.termDays}
              onChange={(e) => updateCustomPage({ ...page, termDays: parseInt(e.target.value) })}
              className="flex-1 accent-cyan-400 bg-slate-950 rounded h-1.5 cursor-pointer"
            />
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed font-display">
            Adjust the duration slider to set the term. LevelUp will generate daily checklist logs across {page.termDays} tracking days, synced to your overall career readiness metrics.
          </p>
        </div>

        {/* Page progress block */}
        <div className="glass-panel p-5 rounded-xl border-white/10 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] uppercase font-futuristic text-slate-400 font-bold tracking-wider mb-2">
              Workspace Completion
            </h4>
            <div className="text-3xl font-extrabold text-white font-futuristic text-neon-cyan mt-1">
              {totalProgressPercent}%
            </div>
          </div>
          
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between text-[8px] uppercase font-futuristic text-slate-500">
              <span>Task checks</span>
              <span>{totalChecked} / {totalPossibleChecks}</span>
            </div>
            <div className="h-1 bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${totalProgressPercent}%` }} 
              />
            </div>
          </div>
        </div>

      </div>

      {/* Notion AI Assistant Panel */}
      <div className="glass-panel p-5 rounded-xl border-cyan-500/10 bg-gradient-to-r from-primary/5 to-transparent relative">
        <div className="flex items-center gap-2 mb-3">
          <Bot size={16} className="text-accent animate-pulse" />
          <span className="text-[10px] uppercase font-futuristic font-bold text-white tracking-widest">
            Notion AI Assistant
          </span>
        </div>

        <form onSubmit={handleAISubmit} className="flex gap-2.5">
          <input 
            type="text"
            required
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask AI: 'Create a 15-day DSA checklist' or 'Generate a Java prep schedule'..."
            className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40"
            disabled={aiLoading}
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs uppercase rounded shadow transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0"
          >
            {aiLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <Sparkles size={13} />
                Draft Checklist
              </>
            )}
          </button>
        </form>

        <div className="mt-3 text-[9px] text-slate-500 leading-relaxed font-display flex items-start gap-1">
          <AlertCircle size={12} className="text-slate-600 shrink-0 mt-0.5" />
          <span>Notion AI analyzes keyword tags to produce progressive, day-by-day study targets.</span>
        </div>
      </div>

      {/* Interactive daily term grid checklist */}
      {page.tasks && page.tasks.length > 0 ? (
        <div className="space-y-4">
          
          {/* Day list selector tabs */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
              Term Timeline Navigator
            </h4>
            
            {/* Horizontal scrollable flex bar of Days */}
            <div className="flex gap-2 overflow-x-auto pb-2 items-center">
              {Array.from({ length: page.termDays }).map((_, idx) => {
                const isActive = activeDayIdx === idx;
                const dStr = getDateForDayIndex(page.startDate, idx);
                
                // Count completions for this day
                const dayComps = page.completedLogs?.[dStr] || [];
                const dayDone = page.tasks.length > 0 && dayComps.length === page.tasks.length;

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveDayIdx(idx)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold font-futuristic tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                      isActive 
                        ? 'bg-cyan-500/20 text-accent border border-cyan-500/30 shadow-glow-accent' 
                        : dayDone
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Day {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily checklists under active day */}
          <div className="glass-panel p-5 rounded-xl border-white/10 relative">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-futuristic font-bold text-xs text-white uppercase tracking-wider">
                  Day {activeDayIdx + 1} Checklist
                </h4>
                <p className="text-[9px] text-slate-500 font-display mt-0.5 uppercase tracking-widest">
                  Target Date: {activeDate}
                </p>
              </div>

              <span className="text-[10px] font-bold font-futuristic text-accent bg-slate-950 border border-white/5 px-2.5 py-1 rounded">
                Day Progress: {activeDayProgressPercent}%
              </span>
            </div>

            <div className="space-y-2.5">
              {page.tasks.map((task) => {
                const completed = activeDayCompletedTasks.includes(task.id);
                
                return (
                  <div 
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all duration-200 ${
                      completed 
                        ? 'bg-slate-950/20 border-emerald-500/20 opacity-60' 
                        : 'bg-slate-950/50 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => togglePageTask(page.id, activeDate, task.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                          completed 
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                            : 'border-white/20 hover:border-accent bg-transparent'
                        }`}
                      >
                        {completed && '✓'}
                      </button>
                      <span className={`text-xs font-medium ${completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.text}
                      </span>
                    </div>

                    <span className="text-[9px] font-bold font-futuristic text-accent bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded">
                      +10 XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel p-8 text-center border-white/10 rounded-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <ListTodo size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">No Active Syllabus tasks</h4>
            <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Use the Notion AI Assistant above to write a study target. It will draft a daily checklist to track progress over your term days.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
