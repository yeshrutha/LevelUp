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
  const [addedHabits, setAddedHabits] = useState([]);
  const [addedEvents, setAddedEvents] = useState([]);

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

      // Overwrite state strictly with coach recommendations
      setResult(data);
      triggerToast('Analysis Complete', 'Your personalized recommendations are ready for review!', 'success');
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
        <div className="space-y-6">
          
          {/* Productivity Score Header Card */}
          <div className="glass-panel p-6 rounded-xl border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/40">
            <div className="space-y-2 text-left">
              <span className="text-[9px] font-bold font-futuristic text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded tracking-widest uppercase">
                Coach Diagnosis
              </span>
              <h3 className="text-lg font-futuristic font-bold text-white uppercase tracking-wider">
                Productivity Strategy Instantiated
              </h3>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-xl font-display uppercase tracking-widest">
                Review suggested schedule, habits, and target events. Import selected configurations to your database environment below.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-950/60 border border-white/5 rounded-xl min-w-[140px]">
              <span className="text-[8px] font-bold font-futuristic text-slate-500 uppercase tracking-widest">Productivity Score</span>
              <span className="text-4xl font-futuristic font-black text-neon-cyan mt-1">
                {result.productivityScore || 85}
              </span>
              <span className="text-[8px] font-bold font-mono text-cyan-400 uppercase tracking-wider mt-1.5">Efficiency Level</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            
            {/* Suggested Schedule timeline */}
            <div className="glass-panel p-5 rounded-xl border-white/10 space-y-4 bg-slate-950/30">
              <h4 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Recommended Daily Schedule
              </h4>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(result.suggestedSchedule) && result.suggestedSchedule.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-3 bg-slate-900/50 border border-white/5 rounded-lg">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0 min-w-[70px]">{item.time}</span>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-slate-200">{item.task}</h5>
                      {item.description && <p className="text-[9px] text-slate-500 leading-normal">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Habits list */}
            <div className="glass-panel p-5 rounded-xl border-white/10 space-y-4 bg-slate-950/30">
              <h4 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Recommended Habits
              </h4>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(result.suggestedHabits) && result.suggestedHabits.map((item, idx) => {
                  const isAdded = addedHabits.includes(item.title);
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-white/5 rounded-lg">
                      <div className="space-y-0.5 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-200">{item.title}</h5>
                          <span className="text-[8px] font-mono text-slate-500">{item.time || 'Daily'}</span>
                        </div>
                        {item.description && <p className="text-[9px] text-slate-500 truncate">{item.description}</p>}
                      </div>
                      <button
                        onClick={() => {
                          if (isAdded) return;
                          addHabit(item.title, item.time || null, {
                            description: item.description || '',
                            category: item.category || 'Routine',
                            xpReward: item.xpReward || 10
                          });
                          setAddedHabits(prev => [...prev, item.title]);
                        }}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded text-[9px] font-futuristic font-bold uppercase cursor-pointer transition-all ${
                          isAdded 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-accent border border-cyan-500/30 shadow-glow-accent'
                        }`}
                      >
                        {isAdded ? "Added ✓" : "Import Habit"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            
            {/* Recommended Calendar events */}
            <div className="glass-panel p-5 rounded-xl border-white/10 space-y-4 bg-slate-950/30">
              <h4 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Recommended Calendar Events
              </h4>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(result.suggestedCalendarEvents) && result.suggestedCalendarEvents.map((item, idx) => {
                  const eventKey = `${item.title}_${item.date}`;
                  const isAdded = addedEvents.includes(eventKey);
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-white/5 rounded-lg">
                      <div className="space-y-0.5 max-w-[70%]">
                        <h5 className="text-xs font-bold text-slate-200">{item.title}</h5>
                        <div className="flex gap-2 text-[8px] font-mono text-slate-500">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{item.time || '10:00 AM'}</span>
                          <span>•</span>
                          <span className="text-amber-400">{item.type || 'Goal'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (isAdded) return;
                          addCalendarEvent({
                            title: item.title,
                            date: item.date,
                            type: item.type || 'Goal',
                            time: item.time || '10:00 AM'
                          });
                          setAddedEvents(prev => [...prev, eventKey]);
                        }}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded text-[9px] font-futuristic font-bold uppercase cursor-pointer transition-all ${
                          isAdded 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-accent border border-cyan-500/30 shadow-glow-accent'
                        }`}
                      >
                        {isAdded ? "Added ✓" : "Import Event"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coach Tips & Wellness recommendations */}
            <div className="glass-panel p-5 rounded-xl border-white/10 space-y-4 bg-slate-950/30 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Focus tips */}
                <div className="space-y-1.5">
                  <h5 className="text-[10px] font-futuristic font-bold text-cyan-400 uppercase tracking-widest">Focus & Productivity Tips</h5>
                  <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-350 leading-relaxed font-display">
                    {Array.isArray(result.productivityTips) && result.productivityTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Wellness recommendations */}
                <div className="space-y-1.5">
                  <h5 className="text-[10px] font-futuristic font-bold text-emerald-400 uppercase tracking-widest">Health & Wellness</h5>
                  <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-350 leading-relaxed font-display">
                    {Array.isArray(result.wellnessRecommendations) && result.wellnessRecommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>

                {/* Weekly goals */}
                <div className="space-y-1.5">
                  <h5 className="text-[10px] font-futuristic font-bold text-amber-400 uppercase tracking-widest">Weekly Focus Targets</h5>
                  <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-350 leading-relaxed font-display">
                    {Array.isArray(result.weeklyGoals) && result.weeklyGoals.map((goal, idx) => (
                      <li key={idx}>{goal}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Configure another buttons */}
              <div className="flex gap-3.5 pt-4 border-t border-white/5 mt-4">
                <button
                  onClick={() => {
                    setPrompt('');
                    setResult(null);
                    setAddedHabits([]);
                    setAddedEvents([]);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-bold font-futuristic tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Configure Another Setup
                </button>
                <button
                  onClick={handleOpenDashboard}
                  className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-accent border border-cyan-500/30 hover:border-cyan-500/50 py-2.5 rounded-lg text-xs font-bold font-futuristic tracking-widest uppercase transition-all shadow-glow-accent cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Go to Dashboard
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
