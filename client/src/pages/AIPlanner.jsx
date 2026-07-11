import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Brain, Loader2, CheckCircle, Calendar, List, AlertCircle, Play, ArrowRight, Check } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://levelup-1-7j6v.onrender.com';
export default function AIPlanner() {
  const { 
    user, 
    setUser,
    createCustomPage, 
    addHabit, 
    addCalendarEvent, 
    setNotifications, 
    setCurrentTab, 
    triggerToast,
    habitList,
    setHabitList,
    setCalendar
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
    setError(null);

    let rawText = '';
    try {
      console.log(`[AI PLANNER CLIENT] Sending generation request for prompt: "${prompt}"`);
      const response = await fetch(`${API_BASE_URL}/api/ai/planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      rawText = await response.text();

      if (!response.ok) {
        let errDetails = 'Planner server returned an error';
        try {
          const parsedErrObj = JSON.parse(rawText);
          if (parsedErrObj.error) errDetails = parsedErrObj.error;
        } catch (_) {}
        const networkErr = new Error(errDetails);
        networkErr.rawResponse = rawText;
        throw networkErr;
      }

      console.log(`[AI PLANNER CLIENT] Received raw response payload:`, rawText);
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        const customErr = new Error(`JSON parsing failed: ${parseErr.message}`);
        customErr.rawResponse = rawText;
        throw customErr;
      }

      // Overwrite current environment state to strictly match AI response contents
      let finalHabits = [];
      if (Array.isArray(data.habits)) {
        finalHabits = [...data.habits];
      }
      setHabitList(finalHabits);

      let finalEvents = [];
      if (Array.isArray(data.calendarEvents)) {
        finalEvents = data.calendarEvents.map(e => ({
          id: Math.random().toString(),
          title: e.title || "AI Milestone",
          date: e.date || new Date().toISOString().split('T')[0],
          type: e.type || "Goal",
          time: e.time || "10:00 AM"
        }));
      }
      setCalendar(finalEvents);

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
        habitsCount: finalHabits.length,
        eventsCount: finalEvents.length
      });

      triggerToast('Environment Deployed', 'Your personalized routine has been instantiated!', 'success');
    } catch (err) {
      console.error(err);
      setError({
        message: err.message || 'Unknown parsing exception.',
        rawResponse: err.rawResponse || rawText || 'No raw response content received.'
      });
      triggerToast('Generation Failed', 'Could not instantiate configuration setup.', 'error');
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

      {/* Error state display */}
      {!loading && error && (
        <div className="glass-panel p-6 rounded-xl border-rose-500/20 bg-rose-500/[0.02] space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertCircle size={18} className="shrink-0" />
            <h3 className="text-xs font-futuristic font-bold uppercase tracking-wider">
              Planner Execution Failed
            </h3>
          </div>
          <p className="text-xs text-slate-350 leading-relaxed font-mono bg-slate-950/60 p-3 rounded border border-white/5">
            Error: {error.message}
          </p>
          <div className="space-y-1.5 text-left">
            <label className="block text-[8px] uppercase font-futuristic text-slate-500 font-bold tracking-widest">
              Raw AI Agent Output
            </label>
            <pre className="w-full bg-slate-950/80 border border-white/5 rounded p-4 text-[10px] font-mono text-slate-400 overflow-x-auto max-h-48 whitespace-pre-wrap select-text">
              {error.rawResponse}
            </pre>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setError(null);
                setPrompt('');
              }}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 font-futuristic font-bold text-xs uppercase rounded cursor-pointer transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!loading && !result && !error && (
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
