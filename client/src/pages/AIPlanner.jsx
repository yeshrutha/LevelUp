import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Brain, Loader2, CheckCircle, Calendar, List, AlertCircle, Play, ArrowRight, Check } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://levelup-1-7j6v.onrender.com';
export default function AIPlanner() {
  const { 
    user, 
    createCustomPage, 
    addHabit, 
    addCalendarEvent, 
    setNotifications, 
    setCurrentTab, 
    triggerToast,
    habitList
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);

  const loadingMessages = [
    "Analyzing goals and routine boundaries...",
    "Designing daily progressive workspace timeline...",
    "Registering target habits into checklist tracker...",
    "Mapping milestones and scheduling calendar reminders...",
    "Assembling placement readiness alerts..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingMessages.length - 1) return prev + 1;
          return prev;
        });
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      triggerToast('Prompt Required', 'Please describe your targets or schedule details first!', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Planner API returned an error');
      }

      const data = await response.json();

      // 1. Add Habits
      let habitsAdded = 0;
      if (Array.isArray(data.habits)) {
        data.habits.forEach(h => {
          if (!habitList.includes(h)) {
            addHabit(h);
            habitsAdded++;
          }
        });
      }

      // 2. Add Calendar Events
      let eventsAdded = 0;
      if (Array.isArray(data.calendarEvents)) {
        data.calendarEvents.forEach(e => {
          addCalendarEvent({
            title: e.title || "AI Milestone",
            date: e.date || new Date().toISOString().split('T')[0],
            type: e.type || "Goal",
            time: e.time || "10:00 AM"
          });
          eventsAdded++;
        });
      }

      // 3. Trigger Notifications
      if (Array.isArray(data.notifications)) {
        setNotifications(prev => [
          ...data.notifications.map(n => ({
            id: `notif_${Math.random()}`,
            title: n.title || "System Notification",
            body: n.body || "Schedule updated successfully.",
            type: n.type || "system",
            read: false,
            time: "Just now"
          })),
          ...prev
        ]);
      }

      setResult({
        habitsCount: habitsAdded || data.habits?.length || 0,
        eventsCount: eventsAdded || data.calendarEvents?.length || 0
      });

      triggerToast('Environment Deployed', 'Your personalized routine has been instantiated!', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Generation Failed', 'Could not parse configuration setup. Reverting to fallbacks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = () => {
    setCurrentTab('dashboard');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-xl border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Brain size={120} className="text-cyan-400" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="text-[9px] font-bold font-futuristic text-accent bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded tracking-widest uppercase">
            AI Operational Environment
          </span>
          <h2 className="text-2xl font-futuristic font-bold text-white tracking-wide uppercase">
            AI Term Workspace Planner
          </h2>
        </div>
      </div>

      {/* Main Content Area */}
      {!loading && !result && (
        <div className="glass-panel p-6 rounded-xl border-white/10 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-futuristic font-bold text-slate-400 tracking-widest uppercase block">
              Describe Your Environment Goals & Daily Routine
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={12}
              className="w-full bg-slate-950/80 border border-white/10 rounded-lg p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:shadow-glow-accent resize-none placeholder-slate-600 transition-all duration-300"
              placeholder="Describe your targets, routine, and career goals here..."
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-accent border border-cyan-500/30 hover:border-cyan-500/50 py-3.5 rounded-lg text-xs font-bold font-futuristic tracking-widest uppercase transition-all duration-300 shadow-glow-accent cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles size={14} className="animate-pulse" />
            Deploy AI Dashboard Environment
          </button>
        </div>
      )}

      {/* Generation Loading State */}
      {loading && (
        <div className="glass-panel p-10 rounded-xl border-white/10 flex flex-col items-center justify-center space-y-8 min-h-[400px]">
          <div className="relative flex items-center justify-center">
            <Loader2 size={48} className="text-cyan-400 animate-spin" />
            <Brain size={24} className="text-cyan-300 absolute animate-pulse" />
          </div>

          <div className="space-y-4 w-full max-w-md">
            <h4 className="text-xs font-futuristic font-bold text-center text-white tracking-widest uppercase">
              Initializing AI Orchestration
            </h4>
            
            <div className="space-y-2.5">
              {loadingMessages.map((msg, idx) => {
                const isPassed = loadingStep > idx;
                const isCurrent = loadingStep === idx;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                      isPassed ? 'opacity-100 text-emerald-400' : isCurrent ? 'opacity-100 text-cyan-400 font-semibold' : 'opacity-40 text-slate-500'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle size={14} className="shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 size={14} className="shrink-0 animate-spin" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span className="font-display text-[11px]">{msg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Generation Result State */}
      {result && (
        <div className="glass-panel p-8 rounded-xl border-white/10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full animate-bounce">
              <Check size={28} />
            </div>
            <h3 className="text-lg font-futuristic font-bold text-white uppercase tracking-wider">
              Environment Instantiated Successfully
            </h3>
            <p className="text-[10px] text-slate-400 font-display uppercase tracking-widest">
              AI configurations deployed to dashboard
            </p>
          </div>

          {/* Configuration Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 border border-white/5 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <Brain size={16} />
                <span className="text-[10px] font-futuristic font-bold tracking-wider uppercase">Daily Habits</span>
              </div>
              <p className="text-xs font-bold text-white">+{result.habitsCount} Custom Habits</p>
              <p className="text-[9px] text-slate-500">Injected to habits checklist</p>
            </div>

            <div className="bg-slate-950/50 border border-white/5 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Calendar size={16} />
                <span className="text-[10px] font-futuristic font-bold tracking-wider uppercase">Calendar Schedule</span>
              </div>
              <p className="text-xs font-bold text-white">+{result.eventsCount} Milestones</p>
              <p className="text-[9px] text-slate-500">Scheduled in calendar log</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setPrompt('');
                setResult(null);
              }}
              className="flex-1 bg-slate-900 border border-white/5 hover:border-white/10 text-slate-300 py-3 rounded-lg text-xs font-bold font-futuristic tracking-wider uppercase transition-colors cursor-pointer"
            >
              Configure Another Setup
            </button>
            
            <button
              onClick={handleOpenDashboard}
              className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-accent border border-cyan-500/30 hover:border-cyan-500/50 py-3 rounded-lg text-xs font-bold font-futuristic tracking-widest uppercase transition-all shadow-glow-accent cursor-pointer flex items-center justify-center gap-1.5"
            >
              Open Dashboard
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
