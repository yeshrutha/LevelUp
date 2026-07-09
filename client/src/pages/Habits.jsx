import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Flame, Award, Trash2, Plus, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Habits = () => {
  const { habits, toggleHabit, habitList, addHabit, deleteHabit } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const [inputHabit, setInputHabit] = useState('');
  
  // Get today's logs
  const todayLogs = habits[today] || {};
  const checkedCount = Object.keys(todayLogs).filter(name => habitList.includes(name) && todayLogs[name]).length;
  const totalCount = habitList.length || 1;
  const completionPercent = Math.round((checkedCount / totalCount) * 100);

  // Streak count
  const streakCount = 5;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!inputHabit.trim()) return;
    addHabit(inputHabit.trim());
    setInputHabit('');
  };

  // Render 7-day history calendar
  const renderHistory = () => {
    const days = [];
    const todayDate = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayLogs = habits[dateString] || {};
      const completedCount = Object.keys(dayLogs).filter(name => habitList.includes(name) && dayLogs[name]).length;
      const pct = Math.round((completedCount / totalCount) * 100);
      
      const dayName = date.toLocaleDateString([], { weekday: 'short' });
      const dayNum = date.getDate();

      days.push({ dateString, dayName, dayNum, pct });
    }

    return (
      <div className="grid grid-cols-7 gap-3">
        {days.map((d, idx) => (
          <div 
            key={idx} 
            className="glass-panel p-2.5 rounded-lg border-white/5 flex flex-col items-center justify-between h-24 text-center bg-slate-900/40"
          >
            <span className="text-[10px] text-slate-500 font-display uppercase tracking-widest">{d.dayName}</span>
            <span className="text-xs font-bold text-slate-200 mt-1">{d.dayNum}</span>
            <div className="w-full h-1 bg-slate-950 rounded overflow-hidden mt-3">
              <div 
                className="h-full bg-cyan-400"
                style={{ width: `${d.pct}%` }} 
              />
            </div>
            <span className="text-[8px] font-bold font-futuristic text-accent mt-1.5">{d.pct}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-futuristic tracking-wide">
            Habits Checklist
          </h1>
          <p className="text-[10px] text-slate-400 font-display uppercase tracking-widest mt-1">
            Custom Daily Routines & Streaks
          </p>
        </div>

        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-lg">
          <Flame size={16} className="text-orange-400 animate-bounce" />
          <span className="text-xs font-bold font-futuristic text-orange-400 uppercase tracking-widest">
            {streakCount} Day Streak
          </span>
        </div>
      </div>

      {/* Habit Customizer input bar */}
      <div className="glass-panel p-5 rounded-xl border-white/10">
        <h3 className="text-xs font-futuristic font-bold text-slate-300 uppercase tracking-wider mb-3">
          Customize Your Trackers
        </h3>
        
        <form onSubmit={handleAddSubmit} className="flex gap-2">
          <input 
            type="text"
            required
            value={inputHabit}
            onChange={(e) => setInputHabit(e.target.value)}
            placeholder="Add new routine (e.g. Read books, Gym session, Drink 3L Water)..."
            className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs uppercase rounded shadow cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add Habit
          </button>
        </form>
      </div>

      {/* Overview Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress Bar */}
        <div className="md:col-span-2 glass-panel p-5 rounded-xl border-white/10 flex items-center gap-6 justify-between">
          <div className="space-y-3 flex-1">
            <h3 className="text-sm font-futuristic font-bold text-white uppercase tracking-wider">
              Today's Completion Index
            </h3>
            <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-primary to-accent" 
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Completing daily routines builds consistency, adding growth XP points. Maintaining a streak boosts your focus multipliers.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="38" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
              <circle 
                cx="48" 
                cy="48" 
                r="38" 
                stroke="#00E5FF" 
                strokeWidth="6" 
                strokeDasharray="238.6"
                strokeDashoffset={238.6 - (238.6 * completionPercent) / 100}
                fill="transparent"
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute text-xl font-futuristic font-bold text-white">{completionPercent}%</span>
          </div>
        </div>

        {/* Warning Board */}
        <div className="glass-panel p-5 rounded-xl border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-accent">
            <Info size={16} />
            <h4 className="text-[10px] uppercase font-futuristic font-bold tracking-widest">Routine Strategy</h4>
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed mt-2 select-text">
            Add small, atomic actions to your tracker dashboard. Atomic habits compound over time into massive growth gains.
          </p>
          <div className="bg-slate-900 border border-white/5 text-slate-400 rounded p-2 text-[9px] text-center mt-3">
            Streak multipliers are active.
          </div>
        </div>

      </div>

      {/* Grid of habits */}
      {habitList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {habitList.map((habitName, idx) => {
            const checked = !!todayLogs[habitName];
            
            return (
              <div 
                key={idx}
                className={`glass-panel p-4 rounded-xl border flex flex-col justify-between h-32 transition-all duration-200 group relative ${
                  checked 
                    ? 'border-emerald-500/30 bg-emerald-500/[0.03] shadow-glow-success' 
                    : 'border-white/5 hover:border-cyan-500/25 bg-slate-900/40'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-futuristic font-bold text-slate-500 tracking-wider">
                    Routine
                  </span>
                  
                  <button 
                    onClick={() => toggleHabit(today, habitName)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-all ${
                      checked 
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                        : 'border-white/20 hover:border-accent'
                    }`}
                  >
                    {checked && '✓'}
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-200 mt-2 truncate pr-6">{habitName}</h3>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[9px] font-bold font-futuristic text-accent bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded">
                      XP Gain
                    </span>
                    {checked && (
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-display">
                        Complete
                      </span>
                    )}
                  </div>
                </div>

                {/* Trash delete habit button */}
                <button
                  onClick={() => deleteHabit(habitName)}
                  className="absolute bottom-3 right-3 p-1.5 bg-slate-900/80 rounded border border-white/5 text-slate-500 hover:text-rose-400 hover:border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Remove Habit"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-8 text-center border-white/10 rounded-xl text-slate-500 text-xs font-display">
          No habits configured. Add one using the input bar above.
        </div>
      )}

      {/* Historical logs */}
      <div className="space-y-3">
        <h3 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider">
          Weekly Consistency Logs
        </h3>
        {renderHistory()}
      </div>

    </div>
  );
};
