import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Hourglass, Trophy, Activity, MessageSquare, BookOpen } from 'lucide-react';

export const Analytics = () => {
  const { user, customPages, habits, habitList } = useApp();

  // 1. Mock Study/Focus Hours per day
  const focusData = [
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 6.0 },
    { day: 'Wed', hours: 3.5 },
    { day: 'Thu', hours: 5.5 },
    { day: 'Fri', hours: 7.0 },
    { day: 'Sat', hours: 4.0 },
    { day: 'Sun', hours: 2.0 }
  ];

  // 2. Mock XP Earned progress over the week
  const xpData = [
    { name: 'Mon', xp: 120 },
    { name: 'Tue', xp: 260 },
    { name: 'Wed', xp: 340 },
    { name: 'Thu', xp: 480 },
    { name: 'Fri', xp: 620 },
    { name: 'Sat', xp: 700 },
    { name: 'Sun', xp: 750 }
  ];

  // 3. Today's Habit checked breakdown
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = habits[todayStr] || {};
  const checkedTodayCount = Object.keys(todayLogs).filter(name => habitList.includes(name) && todayLogs[name]).length;
  const uncheckedTodayCount = Math.max(0, habitList.length - checkedTodayCount);

  const habitsPieData = [
    { name: 'Completed Habits', value: checkedTodayCount || (habitList.length === 0 ? 0 : 1), color: '#22C55E' },
    { name: 'Pending Habits', value: uncheckedTodayCount || (habitList.length === 0 ? 1 : 0), color: 'rgba(255, 255, 255, 0.1)' }
  ];

  // 4. Custom Page Workspace completions
  const pagesLineData = customPages.length > 0
    ? customPages.map(page => {
        const isProgressive = (page.tasks || []).some(t => t.day !== undefined);
        const possible = isProgressive 
          ? (page.tasks || []).length 
          : (page.tasks || []).length * page.termDays;
        let checked = 0;
        Object.values(page.completedLogs || {}).forEach(list => {
          checked += (list || []).length;
        });
        const pct = possible > 0 ? Math.round((checked / possible) * 100) : 0;
        return { name: page.title.substring(0, 12), progress: pct };
      })
    : [];

  // Generate data for the GitHub contribution grid (last 16 weeks)
  const getContributionGridData = () => {
    const grid = [];
    const today = new Date();
    
    // We want 16 columns * 7 days = 112 days
    const startDay = new Date(today);
    startDay.setDate(today.getDate() - 112);
    // Align to Sunday
    const dayOfWeek = startDay.getDay();
    startDay.setDate(startDay.getDate() - dayOfWeek);

    for (let c = 0; c < 16; c++) {
      const column = [];
      for (let r = 0; r < 7; r++) {
        const currentDate = new Date(startDay);
        currentDate.setDate(startDay.getDate() + (c * 7) + r);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Count checked habits for this date
        const dayLogs = habits[dateStr] || {};
        const completedCount = Object.values(dayLogs).filter(Boolean).length;
        
        column.push({
          date: dateStr,
          count: completedCount,
          isFuture: currentDate > today
        });
      }
      grid.push(column);
    }
    return grid;
  };

  const contributionGrid = getContributionGridData();

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-futuristic tracking-wide">
          Growth Analytics
        </h1>
        <p className="text-[10px] text-slate-400 font-display uppercase tracking-widest mt-1">
          Personal Routine Metrics & Consistency Visualizer
        </p>
      </div>

      {/* Numerical Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 bg-slate-900/40">
          <div className="p-2 rounded bg-indigo-500/10 text-primary flex items-center justify-center">
            <BookOpen size={18} />
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-display font-bold">Active Pages</span>
            <span className="block text-lg font-bold text-slate-100 font-futuristic">{customPages.length} Workspaces</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 bg-slate-900/40">
          <div className="p-2 rounded bg-cyan-500/10 text-accent flex items-center justify-center">
            <Trophy size={18} />
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-display font-bold">XP Harvest</span>
            <span className="block text-lg font-bold text-slate-100 font-futuristic">{user.xp} Points</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 bg-slate-900/40">
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Activity size={18} />
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-display font-bold">Habit consistency</span>
            <span className="block text-lg font-bold text-slate-100 font-futuristic">
              {habitList.length > 0 ? Math.round((checkedTodayCount / habitList.length) * 100) : 0}% Checked Today
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 bg-slate-900/40">
          <div className="p-2 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Hourglass size={18} />
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-display font-bold">Growth Progress</span>
            <span className="block text-lg font-bold text-slate-100 font-futuristic">{user.readiness}% Index</span>
          </div>
        </div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Study hours per day */}
        <div className="glass-panel p-5 rounded-xl border-white/10 bg-slate-900/20">
          <h3 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider mb-4">
            Daily Focus Hours (Weekly)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f0f1d', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  labelClassName="text-slate-400 font-semibold"
                />
                <Bar dataKey="hours" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: XP accumulation */}
        <div className="glass-panel p-5 rounded-xl border-white/10 bg-slate-900/20">
          <h3 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider mb-4">
            Cumulative XP Yield (Weekly)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpData}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f0f1d', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                <Area type="monotone" dataKey="xp" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Habits Pie Chart */}
        <div className="glass-panel p-5 rounded-xl border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-900/20">
          <div className="flex-1">
            <h3 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider mb-2">
              Habits Completion Split
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-display">
              Proportion of today's user-defined habits checked off compared to pending items.
            </p>
            <div className="space-y-1.5 mt-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Completed: {checkedTodayCount} Habits</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span>Pending: {uncheckedTodayCount} Habits</span>
              </div>
            </div>
          </div>

          <div className="w-44 h-44 shrink-0 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={habitsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {habitsPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-futuristic font-extrabold text-white">{checkedTodayCount}</span>
              <span className="text-[8px] uppercase tracking-widest text-slate-500 font-display">Checked</span>
            </div>
          </div>
        </div>

        {/* Chart 4: Workspace Progress Trend */}
        <div className="glass-panel p-5 rounded-xl border-white/10 bg-slate-900/20">
          <h3 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider mb-4">
            Workspace Completion Progress
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pagesLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f0f1d', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                <Line type="monotone" dataKey="progress" stroke="#00E5FF" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* GitHub-style Habit Heatmap Grid */}
      <div className="glass-panel p-5 rounded-xl border-white/10 bg-slate-900/20">
        <h3 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider mb-1">
          Habit Consistency Heatmap
        </h3>
        <p className="text-[9px] text-slate-400 mb-4 font-display uppercase tracking-widest">
          Visual representation of routine consistency and checked habit logs over the last 16 weeks
        </p>
        
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          <div className="grid grid-rows-7 gap-1 text-[8px] text-slate-500 font-futuristic uppercase pr-1 shrink-0 select-none leading-none h-[105px] justify-between py-0.5">
            <span>Sun</span>
            <span className="invisible">Mon</span>
            <span>Tue</span>
            <span className="invisible">Wed</span>
            <span>Thu</span>
            <span className="invisible">Fri</span>
            <span>Sat</span>
          </div>

          <div className="flex gap-1">
            {contributionGrid.map((column, colIdx) => (
              <div key={colIdx} className="grid grid-rows-7 gap-1">
                {column.map((day) => {
                  let colorClass = 'bg-slate-950/60 border border-white/[0.02]';
                  if (!day.isFuture) {
                    if (day.count === 1) colorClass = 'bg-cyan-500/15 border border-cyan-500/20';
                    else if (day.count === 2) colorClass = 'bg-cyan-500/40 border border-cyan-400/30';
                    else if (day.count >= 3) colorClass = 'bg-cyan-500 border border-cyan-300 shadow-glow-accent';
                  }
                  return (
                    <div
                      key={day.date}
                      className={`w-3 h-3 rounded-sm transition-all duration-300 ${colorClass}`}
                      title={`${day.date}: ${day.count} habits completed`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 text-[8px] text-slate-500 font-futuristic uppercase mt-3">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-950/60 border border-white/[0.02]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500/15 border border-cyan-500/20" />
          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500/40 border border-cyan-400/30" />
          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500 border border-cyan-300" />
          <span>More</span>
        </div>
      </div>

    </div>
  );
};
