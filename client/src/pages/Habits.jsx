import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Flame, Award, Trash2, Plus, Info, AlertTriangle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Habits = () => {
  const { habits, toggleHabit, habitList, addHabit, deleteHabit, user, updateHabitReminder } = useApp();
  const today = new Date().toISOString().split('T')[0];
  
  // Modal states for habit creation
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitHour, setNewHabitHour] = useState('08');
  const [newHabitMinute, setNewHabitMinute] = useState('00');
  const [newHabitPeriod, setNewHabitPeriod] = useState('AM');

  // Get today's logs
  const todayLogs = habits[today] || {};
  const checkedCount = Object.keys(todayLogs).filter(name => habitList.includes(name) && todayLogs[name]).length;
  const totalCount = habitList.length || 1;
  const completionPercent = Math.round((checkedCount / totalCount) * 100);

  // Streak count
  const streakCount = 5;

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    // Convert 12-hour format + AM/PM into a 24-hour format string HH:MM
    let hour = parseInt(newHabitHour);
    if (newHabitPeriod === 'PM' && hour !== 12) hour += 12;
    if (newHabitPeriod === 'AM' && hour === 12) hour = 0;
    const formattedTime = `${String(hour).padStart(2, '0')}:${String(newHabitMinute).padStart(2, '0')}`;

    addHabit(newHabitName.trim(), formattedTime);

    // Reset and close
    setNewHabitName('');
    setNewHabitHour('08');
    setNewHabitMinute('00');
    setNewHabitPeriod('AM');
    setShowAddModal(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-futuristic tracking-wide">
            Habits Checklist
          </h1>
          <p className="text-[10px] text-slate-400 font-display uppercase tracking-widest mt-1">
            Custom Daily Routines & Streaks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-primary to-accent hover:shadow-glow-accent text-slate-950 font-futuristic font-bold text-xs uppercase rounded-lg shadow-lg cursor-pointer flex items-center gap-2 transition-all shrink-0"
          >
            <Plus size={14} />
            Add Habit
          </button>
        </div>
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
                className={`glass-panel p-4 rounded-xl border flex flex-col justify-between h-[155px] transition-all duration-200 group relative ${
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
                  <h3 className="text-xs font-bold text-slate-200 truncate pr-6">{habitName}</h3>
                  
                  {/* Interactive Bell Toggle and Time Selector */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2">
                    <button 
                      onClick={() => {
                        const reminder = user?.habitReminders?.[habitName] || { enabled: false, time: '08:00' };
                        updateHabitReminder(habitName, !reminder.enabled, reminder.time || '08:00');
                      }}
                      className={`flex items-center gap-1 text-[8px] uppercase font-futuristic tracking-wider cursor-pointer transition-colors ${
                        user?.habitReminders?.[habitName]?.enabled ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-400'
                      }`}
                      title="Toggle email reminder alert"
                    >
                      <Bell size={10} className={user?.habitReminders?.[habitName]?.enabled ? "animate-pulse text-cyan-400" : ""} />
                      <span>{user?.habitReminders?.[habitName]?.enabled ? 'Alert Active' : 'No Alert'}</span>
                    </button>

                    {user?.habitReminders?.[habitName]?.enabled && (
                      <input 
                        type="time"
                        value={user.habitReminders[habitName].time || '08:00'}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          updateHabitReminder(habitName, true, newTime);
                        }}
                        className="bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-cyan-400 focus:outline-none focus:border-cyan-500/40 w-16 text-center"
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-[9px] font-bold font-futuristic text-accent bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded">
                    XP Gain
                  </span>
                  {checked && (
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-display">
                      Complete
                    </span>
                  )}
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
          No habits configured. Deploy one using the "Add Habit" button above.
        </div>
      )}

      {/* Historical logs */}
      <div className="space-y-3">
        <h3 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider">
          Weekly Consistency Logs
        </h3>
        {renderHistory()}
      </div>

      {/* ADD HABIT MODAL POPUP */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full glass-panel border-white/10 rounded-2xl p-6 shadow-2xl relative"
            >
              {/* Corner accent lines */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500/40" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500/40" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500/40" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500/40" />

              <h3 className="text-sm font-futuristic font-bold text-white uppercase tracking-wider mb-4 text-left">
                Deploy New Habit Tracker
              </h3>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                {/* Habit Name input */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g. Read books, Gym session, Drink water..."
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                {/* Habit Time scheduler selectors */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                    Reminder Schedule
                  </label>
                  <div className="flex gap-2">
                    
                    {/* Hour Select */}
                    <div className="flex-1">
                      <select
                        value={newHabitHour}
                        onChange={(e) => setNewHabitHour(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 text-center font-bold cursor-pointer"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                          <option key={h} value={h} className="bg-slate-950">{h}</option>
                        ))}
                      </select>
                    </div>

                    {/* Separator */}
                    <div className="flex items-center text-slate-400 text-sm font-bold">:</div>

                    {/* Minute Select */}
                    <div className="flex-1">
                      <select
                        value={newHabitMinute}
                        onChange={(e) => setNewHabitMinute(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 text-center font-bold cursor-pointer"
                      >
                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                          <option key={m} value={m} className="bg-slate-950">{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* AM / PM Select */}
                    <div className="flex-1">
                      <select
                        value={newHabitPeriod}
                        onChange={(e) => setNewHabitPeriod(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 text-center font-bold cursor-pointer"
                      >
                        <option value="AM" className="bg-slate-950">AM</option>
                        <option value="PM" className="bg-slate-950">PM</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewHabitName('');
                    }}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 font-futuristic font-bold text-xs uppercase rounded cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs uppercase rounded shadow cursor-pointer transition-colors"
                  >
                    Deploy Tracker
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
