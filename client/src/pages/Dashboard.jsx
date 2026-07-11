import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { RankBadgeSVG } from '../components/RankPromotion';
import { 
  Flame, 
  Target, 
  Zap, 
  ChevronRight, 
  Calendar, 
  ListTodo, 
  CheckSquare,
  Sparkles,
  Edit3,
  CalendarDays,
  Bot,
  Award,
  Activity,
  Hourglass,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AttendanceTracker } from '../components/AttendanceTracker';

export const Dashboard = () => {
  const { 
    user, 
    setCurrentTab, 
    dailyMissions, 
    completeMission, 
    calendar,
    dashboardGoal,
    updateDashboardGoal,
    customPages,
    habits,
    habitList
  } = useApp();

  const [greeting, setGreeting] = useState('Good Morning');
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editTitle, setEditTitle] = useState(dashboardGoal.title || '');
  const [editDate, setEditDate] = useState(dashboardGoal.targetDate || '');

  // Dynamic greeting
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 18) setGreeting('Good Evening');
    else if (hours >= 12) setGreeting('Good Afternoon');
    else setGreeting('Good Morning');
  }, []);

  // Calculate countdown days remaining
  const quotes = [
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
    { text: "It is not that I'm so smart. But I stay with the questions much longer.", author: "Albert Einstein" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Do not pray for an easy life, pray for the strength to endure a difficult one.", author: "Bruce Lee" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "Whether you think you can, or you think you can't – you're right.", author: "Henry Ford" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.", author: "Helen Keller" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "An unexamined life is not worth living.", author: "Socrates" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Perfection is not attainable, but if we chase perfection we can catch excellence.", author: "Vince Lombardi" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "You just can't beat the person who never gives up.", author: "Babe Ruth" },
    { text: "Intelligence is the ability to adapt to change.", author: "Stephen Hawking" },
    { text: "Nothing in life is to be feared, it is only to be understood. Now is the time to fear less, so that we may fear more.", author: "Marie Curie" },
    { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" }
  ];

  const [dailyQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  // Calculate countdown days remaining
  const calculateDaysRemaining = (targetDateStr) => {
    if (!targetDateStr) return 0;
    const target = new Date(targetDateStr);
    const today = new Date();
    // Normalize both to start of day
    target.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining(dashboardGoal.targetDate);

  // Calculate Habit Tracker & Analytics Telemetry Stats
  const getDashboardStats = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const activeHabits = habitList.filter(h => !(user?.habitDetails?.[h]?.archived));

    // 1. Monthly Completion Rate
    let totalCells = activeHabits.length * daysInMonth;
    let completedCells = 0;
    activeHabits.forEach(h => {
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (habits[dateStr]?.[h]) {
          completedCells++;
        }
      }
    });
    const monthlyCompletionRate = totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0;

    // 2. Streaks calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    let checkDate = new Date(currentYear, 11, 31);
    if (checkDate > today) checkDate = today;

    const dateKeys = [];
    for (let i = 0; i < 365; i++) {
      const d = new Date(checkDate);
      d.setDate(checkDate.getDate() - i);
      dateKeys.push(d.toISOString().split('T')[0]);
    }
    dateKeys.reverse();

    dateKeys.forEach(dateStr => {
      const dayLogs = habits[dateStr] || {};
      const hasAnyCompletion = Object.keys(dayLogs).some(h => activeHabits.includes(h) && dayLogs[h]);
      if (hasAnyCompletion) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayComplete = Object.keys(habits[todayStr] || {}).some(h => activeHabits.includes(h) && habits[todayStr][h]);
    const yesterdayComplete = Object.keys(habits[yesterdayStr] || {}).some(h => activeHabits.includes(h) && habits[yesterdayStr][h]);

    if (todayComplete || yesterdayComplete) {
      let currentCheck = todayComplete ? today : yesterday;
      let ok = true;
      while (ok) {
        const dateStr = currentCheck.toISOString().split('T')[0];
        const dayLogs = habits[dateStr] || {};
        const complete = Object.keys(dayLogs).some(h => activeHabits.includes(h) && dayLogs[h]);
        if (complete) {
          currentStreak++;
          currentCheck.setDate(currentCheck.getDate() - 1);
        } else {
          ok = false;
        }
      }
    }

    // 3. Focus Hours (1.5 hours per completed habit this week)
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    let weeklyFocusCompleted = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = habits[dateStr] || {};
      weeklyFocusCompleted += Object.keys(dayLogs).filter(name => activeHabits.includes(name) && dayLogs[name]).length;
    }
    const weeklyFocusHours = weeklyFocusCompleted * 1.5;

    // 4. Today's checked percentage
    const checkedTodayCount = Object.keys(habits[todayStr] || {}).filter(name => activeHabits.includes(name) && habits[todayStr][name]).length;
    const todayCompletionRate = activeHabits.length > 0 ? Math.round((checkedTodayCount / activeHabits.length) * 100) : 0;

    return {
      currentStreak,
      longestStreak,
      monthlyCompletionRate,
      weeklyFocusHours,
      todayCompletionRate
    };
  };

  const stats = getDashboardStats();

  const handleGoalSave = (e) => {
    e.preventDefault();
    updateDashboardGoal(editTitle, editDate);
    setShowGoalEditor(false);
  };

  return (
    <div className="space-y-6 select-none pb-12">
      
      {/* Top Greeting Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-futuristic flex items-center gap-2 tracking-wide">
            {greeting}, {user?.displayName || 'Penguin'} <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-xs text-slate-400 font-display uppercase tracking-widest mt-1">
            Focus & Growth Completion Index: <span className="text-accent font-bold">{user.readiness}% Overall</span>
          </p>
        </div>

        {/* Dynamic target countdown bar */}
        <div className="w-full md:w-72 glass-panel p-3.5 rounded-lg border-white/5 bg-slate-900/30 flex flex-col gap-1.5 relative group">
          <div className="flex justify-between items-center text-[10px] uppercase font-futuristic text-slate-400">
            <span className="truncate pr-4 flex items-center gap-1">
              <Target size={11} className="text-accent" />
              {dashboardGoal.title || "No Target Goal Set"}
            </span>
            <span className="text-accent font-bold shrink-0">
              {dashboardGoal.targetDate ? `${daysRemaining} Days Left` : "Set Goal"}
            </span>
          </div>
          
          <div className="h-1.5 bg-slate-950 rounded overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: dashboardGoal.targetDate ? `${Math.min(100, Math.max(0, 100 - (daysRemaining / 30) * 100))}%` : 0 }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-primary to-accent" 
            />
          </div>

          {/* Quick Edit Goal Button */}
          <button 
            onClick={() => {
              setEditTitle(dashboardGoal.title);
              setEditDate(dashboardGoal.targetDate);
              setShowGoalEditor(true);
            }}
            className="absolute -top-2.5 -right-2.5 p-1 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
            title="Edit Countdown Target"
          >
            <Edit3 size={9} />
          </button>
        </div>
      </div>

      {/* Goal countdown editor overlay modal */}
      <AnimatePresence>
        {showGoalEditor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-sm w-full glass-panel p-6 rounded-xl border-white/15 shadow-2xl space-y-4"
            >
              <h3 className="text-sm font-futuristic font-bold text-white uppercase tracking-wider">
                Configure Target Countdown
              </h3>
              
              <form onSubmit={handleGoalSave} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-semibold tracking-wider">
                    Goal Milestone
                  </label>
                  <input 
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                    placeholder="e.g. Launch Side Project"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-semibold tracking-wider">
                    Target Date
                  </label>
                  <input 
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowGoalEditor(false)}
                    className="px-3 py-1.5 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded text-[10px] font-futuristic uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 rounded text-[10px] font-futuristic font-bold uppercase shadow cursor-pointer"
                  >
                    Save Target
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Valorant Career Cards Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Rank Box */}
            <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent opacity-30 group-hover:opacity-100 transition-opacity" />
              <RankBadgeSVG rankName={user.rank} size={60} />
              <span className="text-[10px] text-slate-500 font-futuristic uppercase tracking-widest mt-2">Current Rank</span>
              <span className="text-sm font-bold text-slate-100 font-display mt-0.5">{user.rank}</span>
            </div>

            {/* Level Box */}
            <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-cyan-400/30 transition-all duration-300">
              <div className="absolute top-0 inset-x-0 h-1 bg-cyan-400 opacity-30 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center font-futuristic font-black text-lg">
                {user.level}
              </div>
              <span className="text-[10px] text-slate-500 font-futuristic uppercase tracking-widest mt-3">Player Level</span>
              <span className="text-sm font-bold text-slate-100 font-display mt-0.5">Level {user.level}</span>
            </div>

            {/* XP Box */}
            <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-emerald-400/30 transition-all duration-300">
              <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500 opacity-30 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Zap size={22} className="animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-500 font-futuristic uppercase tracking-widest mt-3">Total XP</span>
              <span className="text-sm font-bold text-slate-100 font-display mt-0.5">{user.xp} XP</span>
            </div>

            {/* Streak Box */}
            <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
              <div className="absolute top-0 inset-x-0 h-1 bg-orange-500 opacity-30 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <Flame size={22} className="animate-bounce" />
              </div>
              <span className="text-[10px] text-slate-500 font-futuristic uppercase tracking-widest mt-3">Streak Logs</span>
              <span className="text-sm font-bold text-slate-100 font-display mt-0.5">{user.streak} Days</span>
            </div>
            
          </div>

          {/* Telemetry Widgets: Streaks, Rate & Analytics stacked rows */}
          <div className="space-y-4 text-left">
            
            {/* Habits Telemetry Card - Full-width horizontal row */}
            <div className="glass-panel p-4 rounded-xl border-white/10 bg-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="p-2.5 bg-orange-500/10 border border-orange-400/20 text-orange-400 rounded-lg">
                  <Flame size={18} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider">Habit Consistency Tracker</h3>
                  <p className="text-[9px] text-slate-500 uppercase font-display tracking-widest mt-0.5">Streaks & monthly rate index</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-6 w-full sm:w-auto">
                <div className="bg-slate-950/65 border border-white/5 p-3 rounded-lg flex flex-col items-center justify-center text-center sm:min-w-[110px]">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Streak</span>
                  <span className="text-xl md:text-2xl font-futuristic font-black text-slate-200 mt-1">{stats.currentStreak}d</span>
                </div>
                <div className="bg-slate-950/65 border border-white/5 p-3 rounded-lg flex flex-col items-center justify-center text-center sm:min-w-[110px]">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Max Streak</span>
                  <span className="text-xl md:text-2xl font-futuristic font-black text-slate-200 mt-1">{stats.longestStreak}d</span>
                </div>
                <div className="bg-slate-950/65 border border-white/5 p-3 rounded-lg flex flex-col items-center justify-center text-center sm:min-w-[110px]">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Month Rate</span>
                  <span className="text-xl md:text-2xl font-futuristic font-black text-cyan-400 mt-1">{stats.monthlyCompletionRate}%</span>
                </div>
              </div>
            </div>

            {/* Analytics Telemetry Card - Full-width horizontal row below */}
            <div className="glass-panel p-4 rounded-xl border-white/10 bg-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="p-2.5 bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 rounded-lg">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider">Productivity Analytics</h3>
                  <p className="text-[9px] text-slate-500 uppercase font-display tracking-widest mt-0.5">Focus hours & workspace index</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-6 w-full sm:w-auto">
                <div className="bg-slate-950/65 border border-white/5 p-3 rounded-lg flex flex-col items-center justify-center text-center sm:min-w-[110px]">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Week Focus</span>
                  <span className="text-xl md:text-2xl font-futuristic font-black text-slate-200 mt-1">{stats.weeklyFocusHours}h</span>
                </div>
                <div className="bg-slate-950/65 border border-white/5 p-3 rounded-lg flex flex-col items-center justify-center text-center sm:min-w-[110px]">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Today Pct</span>
                  <span className="text-xl md:text-2xl font-futuristic font-black text-slate-200 mt-1">{stats.todayCompletionRate}%</span>
                </div>
                <div className="bg-slate-950/65 border border-white/5 p-3 rounded-lg flex flex-col items-center justify-center text-center sm:min-w-[110px]">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Workspaces</span>
                  <span className="text-xl md:text-2xl font-futuristic font-black text-primary mt-1">{customPages.length}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Navigation cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div 
              onClick={() => setCurrentTab('habits')}
              className="glass-panel p-4 rounded-xl flex items-center justify-between hover:border-accent/30 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                  <CheckSquare size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Habit Tracker</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Check Daily Targets</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>

            <div 
              onClick={() => {
                if (customPages.length > 0) setCurrentTab(`page_${customPages[0].id}`);
              }}
              className="glass-panel p-4 rounded-xl flex items-center justify-between hover:border-primary/30 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-indigo-500/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-slate-950 transition-colors">
                  <ListTodo size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Notion Pages</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{customPages.length} Workspaces</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>

            <div 
              onClick={() => setCurrentTab('calendar')}
              className="glass-panel p-4 rounded-xl flex items-center justify-between hover:border-orange-500/30 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-slate-950 transition-colors">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Calendar Planner</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{calendar.length} Scheduled Events</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>

          </div>

        </div>

        {/* Right Sidebar - Stats Rings & Quotes */}
        <div className="space-y-6">
          
          {/* Big Focus progress Circular Ring */}
          <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center border-white/10 relative overflow-hidden">
            <h3 className="font-futuristic font-bold text-sm text-white uppercase tracking-wider mb-4 self-start">
              Growth Focus Progress
            </h3>
            
            {/* SVG Circle meter */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="rgba(255,255,255,0.05)" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="url(#readinessGrad)" 
                  strokeWidth="8" 
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * user.readiness) / 100 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                  fill="transparent" 
                  className="progress-ring-circle"
                />
                <defs>
                  <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#00E5FF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-futuristic font-extrabold text-white text-neon-cyan">{user.readiness}%</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-display font-semibold mt-1">Growth</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 text-left pt-2 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-display">Active Pages</span>
                <span className="text-xs font-bold text-slate-200">{customPages.length} Workspaces</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-display">Events scheduled</span>
                <span className="text-xs font-bold text-slate-200">
                  {calendar.length} Upcoming
                </span>
              </div>
            </div>
          </div>

          {/* Daily Quote card */}
          <div className="glass-panel p-5 rounded-xl border-white/10 relative overflow-hidden flex flex-col justify-between h-40">
            <p className="text-xs leading-relaxed text-slate-300 italic z-10 select-text">
              "{dailyQuote.text}"
            </p>
            <div className="flex items-center gap-2 z-10 border-t border-white/5 pt-2 mt-2">
              <div className="w-1.5 h-1.5 bg-accent rounded-full" />
              <span className="text-[10px] font-semibold font-display text-slate-400 uppercase tracking-widest">
                {dailyQuote.author}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
