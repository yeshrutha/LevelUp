import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Flame, Award, Trash2, Plus, Info, AlertTriangle, Bell, Pencil, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Habits = () => {
  const { habits, toggleHabit, habitList, addHabit, deleteHabit, editHabit, user, updateHabitReminder } = useApp();
  const today = new Date().toISOString().split('T')[0];
  
  // Modal states for habit creation
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitHour, setNewHabitHour] = useState('08');
  const [newHabitMinute, setNewHabitMinute] = useState('00');
  const [newHabitPeriod, setNewHabitPeriod] = useState('AM');
  const [enableAlert, setEnableAlert] = useState(true);

  // Modal states for habit editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHabitName, setEditingHabitName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editHour, setEditHour] = useState('08');
  const [editMinute, setEditMinute] = useState('00');
  const [editPeriod, setEditPeriod] = useState('AM');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editCategory, setEditCategory] = useState('Routine');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editXpReward, setEditXpReward] = useState(10);
  const [editReminderEnabled, setEditReminderEnabled] = useState(false);
  const [editRepeatFrequency, setEditRepeatFrequency] = useState('Daily');
  const [editColor, setEditColor] = useState('#06b6d4');

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

    let formattedTime = null;
    if (enableAlert) {
      // Convert 12-hour format + AM/PM into a 24-hour format string HH:MM
      let hour = parseInt(newHabitHour);
      if (newHabitPeriod === 'PM' && hour !== 12) hour += 12;
      if (newHabitPeriod === 'AM' && hour === 12) hour = 0;
      formattedTime = `${String(hour).padStart(2, '0')}:${String(newHabitMinute).padStart(2, '0')}`;
    }

    addHabit(newHabitName.trim(), formattedTime);

    // Reset and close
    setNewHabitName('');
    setNewHabitHour('08');
    setNewHabitMinute('00');
    setNewHabitPeriod('AM');
    setEnableAlert(true);
    setShowAddModal(false);
  };

  const handleOpenEditModal = (habitName) => {
    const details = user?.habitDetails?.[habitName] || {};
    const reminder = user?.habitReminders?.[habitName] || {};
    
    setEditingHabitName(habitName);
    setEditTitle(habitName);
    setEditDescription(details.description || '');
    
    // Parse time
    const timeStr = reminder.time || details.time || '08:00';
    const [h, m] = timeStr.split(':');
    let hr = parseInt(h) || 8;
    const period = hr >= 12 ? 'PM' : 'AM';
    let hr12 = hr % 12 || 12;
    
    setEditHour(String(hr12).padStart(2, '0'));
    setEditMinute(String(m || '00').padStart(2, '0'));
    setEditPeriod(period);
    setEditReminderEnabled(!!reminder.enabled);
    
    setEditStartTime(details.startTime || '');
    setEditEndTime(details.endTime || '');
    setEditCategory(details.category || 'Routine');
    setEditPriority(details.priority || 'Medium');
    setEditXpReward(details.xpReward || 10);
    setEditRepeatFrequency(details.repeatFrequency || 'Daily');
    setEditColor(details.color || '#06b6d4');
    
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    let formattedTime = null;
    if (editReminderEnabled) {
      let hour = parseInt(editHour);
      if (editPeriod === 'PM' && hour !== 12) hour += 12;
      if (editPeriod === 'AM' && hour === 12) hour = 0;
      formattedTime = `${String(hour).padStart(2, '0')}:${String(editMinute).padStart(2, '0')}`;
    }

    const updatedDetails = {
      description: editDescription.trim(),
      time: formattedTime,
      startTime: editStartTime || formattedTime || '',
      endTime: editEndTime || '',
      category: editCategory,
      priority: editPriority,
      xpReward: parseInt(editXpReward) || 10,
      repeatFrequency: editRepeatFrequency,
      color: editColor,
      reminderEnabled: editReminderEnabled
    };

    await editHabit(editingHabitName, editTitle.trim(), updatedDetails);
    setShowEditModal(false);
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
            const details = user?.habitDetails?.[habitName] || {};
            const habitColor = details.color || '#06b6d4';
            
            return (
              <div 
                key={idx}
                className={`glass-panel p-4 rounded-xl border flex flex-col justify-between h-[155px] transition-all duration-200 group relative ${
                  checked 
                    ? 'border-emerald-500/30 bg-emerald-500/[0.03] shadow-glow-success' 
                    : 'border-white/5 hover:border-cyan-500/25 bg-slate-900/40'
                }`}
                style={!checked ? { borderLeft: `3px solid ${habitColor}` } : {}}
              >
                <div className="flex justify-between items-start">
                  <span 
                    className="text-[9px] uppercase font-futuristic font-bold px-2 py-0.5 rounded tracking-wider"
                    style={{ 
                      color: habitColor, 
                      backgroundColor: `${habitColor}12`,
                      border: `1px solid ${habitColor}25`
                    }}
                  >
                    {details.category || 'Routine'}
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
                  <h3 className="text-xs font-bold text-slate-200 truncate pr-12" title={habitName}>{habitName}</h3>
                  {details.description && (
                    <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">{details.description}</p>
                  )}
                  
                  {/* Passive Bell Reminder Indicator */}
                  {user?.habitReminders?.[habitName]?.enabled && (
                    <div className="flex items-center gap-1.5 text-[8px] font-futuristic text-cyan-400 uppercase tracking-widest mt-2 border-t border-white/5 pt-1.5">
                      <Bell size={10} className="animate-pulse" />
                      <span>{(() => {
                        const timeStr = user.habitReminders[habitName].time || '08:00';
                        const [h, m] = timeStr.split(':');
                        const hr = parseInt(h);
                        const ampm = hr >= 12 ? 'PM' : 'AM';
                        const displayHr = hr % 12 || 12;
                        return `${String(displayHr).padStart(2, '0')}:${m} ${ampm}`;
                      })()}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span 
                    className="text-[9px] font-bold font-futuristic px-2 py-0.5 rounded"
                    style={{ 
                      color: habitColor, 
                      backgroundColor: `${habitColor}12`,
                      border: `1px solid ${habitColor}20`
                    }}
                  >
                    +{details.xpReward || 10} XP
                  </span>
                  {checked && (
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-display">
                      Complete
                    </span>
                  )}
                </div>

                {/* Card controls (Edit + Trash) */}
                <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => handleOpenEditModal(habitName)}
                    className="p-1.5 bg-slate-900/80 rounded border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 transition-all cursor-pointer"
                    title="Edit Habit"
                  >
                    <Pencil size={9} />
                  </button>
                  <button
                    onClick={() => deleteHabit(habitName)}
                    className="p-1.5 bg-slate-900/80 rounded border border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer"
                    title="Remove Habit"
                  >
                    <Trash2 size={9} />
                  </button>
                </div>
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

                {/* Enable Alert Toggle */}
                <div className="flex items-center justify-between bg-slate-900/50 border border-white/5 p-3 rounded-lg">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold font-futuristic text-slate-300 uppercase tracking-wide">
                      Email Reminder Alert
                    </span>
                    <span className="text-[8px] text-slate-500 font-display mt-0.5">
                      Receive motivated email reminders & repeaters
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={enableAlert}
                      onChange={(e) => setEnableAlert(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-slate-950 peer-checked:after:border-cyan-400"></div>
                  </label>
                </div>

                {/* Habit Time scheduler selectors */}
                {enableAlert && (
                  <div className="space-y-1.5 text-left animate-fadeIn">
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
                )}

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

      {/* EDIT HABIT MODAL POPUP */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full glass-panel border-white/10 rounded-2xl p-6 shadow-2xl relative"
            >
              {/* Corner accent lines */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500/40" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500/40" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500/40" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500/40" />

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-futuristic font-bold text-white uppercase tracking-wider text-left">
                  Configure Habit Settings
                </h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Habit Title input */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                    Habit Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Read books, Gym session..."
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                {/* Habit Description input */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Provide a brief context or notes..."
                    rows={2}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category select */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                    >
                      <option value="Routine" className="bg-slate-950">Routine</option>
                      <option value="Health" className="bg-slate-950">Health</option>
                      <option value="Fitness" className="bg-slate-950">Fitness</option>
                      <option value="Mind" className="bg-slate-950">Mind</option>
                      <option value="Career" className="bg-slate-950">Career</option>
                      <option value="Custom" className="bg-slate-950">Custom</option>
                    </select>
                  </div>

                  {/* Priority select */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                      Priority
                    </label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                    >
                      <option value="Low" className="bg-slate-950">Low</option>
                      <option value="Medium" className="bg-slate-950">Medium</option>
                      <option value="High" className="bg-slate-950">High</option>
                      <option value="Legendary" className="bg-slate-950">Legendary</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* XP Reward select */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                      XP Reward
                    </label>
                    <select
                      value={editXpReward}
                      onChange={(e) => setEditXpReward(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                    >
                      <option value="5" className="bg-slate-950">5 XP (Easy)</option>
                      <option value="10" className="bg-slate-950">10 XP (Medium)</option>
                      <option value="20" className="bg-slate-950">20 XP (Hard)</option>
                      <option value="30" className="bg-slate-950">30 XP (Expert)</option>
                      <option value="50" className="bg-slate-950">50 XP (Mythic)</option>
                    </select>
                  </div>

                  {/* Repeat Frequency select */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                      Repeat Frequency
                    </label>
                    <select
                      value={editRepeatFrequency}
                      onChange={(e) => setEditRepeatFrequency(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                    >
                      <option value="Daily" className="bg-slate-950">Daily</option>
                      <option value="Weekly" className="bg-slate-950">Weekly</option>
                      <option value="Custom" className="bg-slate-950">Custom Settings</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Time input */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                      Start Time (Optional)
                    </label>
                    <input
                      type="text"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      placeholder="e.g. 09:00 AM"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>

                  {/* End Time input */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                      End Time (Optional)
                    </label>
                    <input
                      type="text"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                </div>

                {/* Habit Color Theme picker */}
                <div className="space-y-2 text-left">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                    Habit Color Theme
                  </label>
                  <div className="flex gap-3.5">
                    {[
                      { hex: '#06b6d4', label: 'Cyan' },
                      { hex: '#10b981', label: 'Emerald' },
                      { hex: '#a855f7', label: 'Purple' },
                      { hex: '#f59e0b', label: 'Amber' },
                      { hex: '#ef4444', label: 'Rose' }
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setEditColor(col.hex)}
                        className={`w-6 h-6 rounded-full border cursor-pointer transition-all ${
                          editColor === col.hex 
                            ? 'border-white scale-110 shadow-lg' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Reminder Notification Toggle */}
                <div className="flex items-center justify-between bg-slate-900/50 border border-white/5 p-3 rounded-lg">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold font-futuristic text-slate-300 uppercase tracking-wide">
                      Push Notifications Reminder
                    </span>
                    <span className="text-[8px] text-slate-500 font-display mt-0.5">
                      Trigger native push alerts when this habit is scheduled
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editReminderEnabled}
                      onChange={(e) => setEditReminderEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-slate-950 peer-checked:after:border-cyan-400"></div>
                  </label>
                </div>

                {/* Habit Time scheduler selectors */}
                {editReminderEnabled && (
                  <div className="space-y-1.5 text-left animate-fadeIn">
                    <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                      Reminder Schedule
                    </label>
                    <div className="flex gap-2">
                      {/* Hour Select */}
                      <div className="flex-1">
                        <select
                          value={editHour}
                          onChange={(e) => setEditHour(e.target.value)}
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
                          value={editMinute}
                          onChange={(e) => setEditMinute(e.target.value)}
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
                          value={editPeriod}
                          onChange={(e) => setEditPeriod(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 text-center font-bold cursor-pointer"
                        >
                          <option value="AM" className="bg-slate-950">AM</option>
                          <option value="PM" className="bg-slate-950">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 font-futuristic font-bold text-xs uppercase rounded cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs uppercase rounded shadow cursor-pointer transition-colors"
                  >
                    Save Changes
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
