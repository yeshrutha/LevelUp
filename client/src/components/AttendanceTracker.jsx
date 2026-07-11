import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Settings2, 
  Archive, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Activity, 
  Calendar,
  Zap, 
  Flame,
  Award,
  Sparkles,
  Plus
} from 'lucide-react';

export const AttendanceTracker = () => {
  const { 
    habits, 
    toggleHabit, 
    habitList, 
    setHabitList,
    deleteHabit, 
    editHabit, 
    user,
    addHabit,
    triggerToast
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showArchived, setShowArchived] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Habit Form State
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#06b6d4');
  const [newHabitCategory, setNewHabitCategory] = useState('Routine');

  // Edit Habit Form State
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#06b6d4');
  const [editCategory, setEditCategory] = useState('Routine');
  const [editArchived, setEditArchived] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const todayDate = new Date();
  const isToday = (dayNum) => {
    return todayDate.getFullYear() === currentYear &&
           todayDate.getMonth() === currentMonth &&
           todayDate.getDate() === dayNum;
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Filter habits
  const activeHabits = habitList.filter(h => {
    const details = user?.habitDetails?.[h] || {};
    return showArchived ? true : !details.archived;
  });

  // Calculate Stats
  const calculateStats = () => {
    let totalCells = activeHabits.length * daysInMonth;
    let completedCells = 0;

    // Monthly Completion
    activeHabits.forEach(h => {
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (habits[dateStr]?.[h]) {
          completedCells++;
        }
      }
    });

    const monthlyCompletionRate = totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0;

    // Yearly Completion
    let yearlyTotal = 0;
    let yearlyCompleted = 0;
    const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear(currentYear) ? 366 : 365;

    activeHabits.forEach(h => {
      yearlyTotal += daysInYear;
      // Loop over all keys in habits that start with currentYear
      Object.keys(habits).forEach(dateStr => {
        if (dateStr.startsWith(String(currentYear)) && habits[dateStr]?.[h]) {
          yearlyCompleted++;
        }
      });
    });

    const yearlyCompletionRate = yearlyTotal > 0 ? Math.round((yearlyCompleted / yearlyTotal) * 100) : 0;

    // Calculate Streaks of completed days (any day where at least one habit is completed)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // We can evaluate streaks looking back from today over the last 365 days
    const today = new Date();
    let checkDate = new Date(currentYear, 11, 31); // check full year or last 365 days
    if (checkDate > today) checkDate = today;

    // Generate array of date keys backwards
    const dateKeys = [];
    for (let i = 0; i < 365; i++) {
      const d = new Date(checkDate);
      d.setDate(checkDate.getDate() - i);
      dateKeys.push(d.toISOString().split('T')[0]);
    }

    // Evaluate
    dateKeys.reverse(); // put chronological order to find longest streak

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

    // Current streak (evaluating backwards from today)
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayLogs = habits[todayStr] || {};
    const yesterdayLogs = habits[yesterdayStr] || {};
    
    const todayComplete = Object.keys(todayLogs).some(h => activeHabits.includes(h) && todayLogs[h]);
    const yesterdayComplete = Object.keys(yesterdayLogs).some(h => activeHabits.includes(h) && yesterdayLogs[h]);

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

    return {
      monthlyCompletionRate,
      yearlyCompletionRate,
      currentStreak,
      longestStreak
    };
  };

  const stats = calculateStats();

  // Export CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = ["Habit", "Category", "Archived", ...dayNumbers.map(d => `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)];
    csvContent += headers.join(",") + "\n";

    activeHabits.forEach(h => {
      const details = user?.habitDetails?.[h] || {};
      const row = [
        `"${h}"`,
        `"${details.category || 'Routine'}"`,
        details.archived ? "TRUE" : "FALSE"
      ];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        row.push(habits[dateStr]?.[h] ? "1" : "0");
      }
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `levelup_attendance_${currentYear}_${currentMonth + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV Exported', 'Habit attendance sheet downloaded.', 'success');
  };

  // Reorder
  const moveHabit = (h, direction) => {
    const idx = habitList.indexOf(h);
    if (idx === -1) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= habitList.length) return;

    const copy = [...habitList];
    const temp = copy[idx];
    copy[idx] = copy[nextIdx];
    copy[nextIdx] = temp;
    setHabitList(copy);
  };

  // Edit Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const details = user?.habitDetails?.[editingHabit] || {};
    const updatedDetails = {
      ...details,
      category: editCategory,
      color: editColor,
      archived: editArchived
    };

    editHabit(editingHabit, editName.trim(), updatedDetails);
    setEditingHabit(null);
  };

  // Add Custom Habit Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    addHabit(newHabitName.trim(), null, {
      color: newHabitColor,
      category: newHabitCategory
    });
    setNewHabitName('');
    setShowAddModal(false);
  };

  // Render contribution heatmap grid for the current year
  const renderHeatmap = () => {
    // Generate months array for the current year
    const months = Array.from({ length: 12 }, (_, i) => i);
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-3.5 mt-2">
        {months.map(m => {
          const days = new Date(currentYear, m + 1, 0).getDate();
          let completed = 0;
          for (let d = 1; d <= days; d++) {
            const dateStr = `${currentYear}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayLogs = habits[dateStr] || {};
            if (Object.keys(dayLogs).some(h => activeHabits.includes(h) && dayLogs[h])) {
              completed++;
            }
          }
          const pct = days > 0 ? Math.round((completed / days) * 100) : 0;
          
          return (
            <div key={m} className="glass-panel p-2.5 rounded-lg border-white/5 bg-slate-900/30 flex flex-col items-center justify-between text-center relative overflow-hidden">
              <span className="text-[9px] font-bold font-futuristic text-slate-400 uppercase tracking-widest">{monthNames[m].substring(0, 3)}</span>
              <div className="w-8 h-8 rounded-full border border-cyan-500/20 flex items-center justify-center mt-2.5 relative">
                <div 
                  className="absolute inset-0.5 rounded-full transition-all duration-300"
                  style={{ 
                    background: pct > 80 ? '#10b981' : pct > 50 ? '#06b6d4' : pct > 20 ? '#a855f7' : pct > 0 ? '#ef4444' : 'transparent',
                    opacity: pct > 0 ? 0.35 : 0
                  }}
                />
                <span className="text-[10px] font-bold text-slate-200 z-10">{completed}d</span>
              </div>
              <span className="text-[8px] font-mono text-cyan-400 mt-2 font-bold">{pct}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 select-none text-left">
      
      {/* Upper Widgets section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={prevMonth} 
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 hover:text-cyan-400 rounded-lg cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          <h2 className="text-lg font-futuristic font-bold text-white uppercase tracking-wider min-w-[150px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </h2>

          <button 
            onClick={nextMonth} 
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 hover:text-cyan-400 rounded-lg cursor-pointer transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-primary to-accent text-slate-950 font-futuristic font-bold text-xs uppercase rounded-lg shadow-glow-accent cursor-pointer flex items-center gap-1.5 transition-all hover:scale-102"
          >
            <Plus size={14} /> Add Habit
          </button>

          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-300 hover:text-white font-futuristic font-bold text-xs uppercase rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3.5 py-2 border font-futuristic font-bold text-xs uppercase rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors ${
              showArchived 
                ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400' 
                : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Archive size={14} /> {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border-white/10 flex items-center gap-4 bg-slate-900/40">
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-400/20 text-orange-400">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-futuristic">Current Streak</p>
            <p className="text-lg font-futuristic font-black text-slate-200 mt-1">{stats.currentStreak} Days</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-white/10 flex items-center gap-4 bg-slate-900/40">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/20 text-amber-400">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-futuristic">Longest Streak</p>
            <p className="text-lg font-futuristic font-black text-slate-200 mt-1">{stats.longestStreak} Days</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-white/10 flex items-center gap-4 bg-slate-900/40">
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-futuristic">Monthly Target Rate</p>
            <p className="text-lg font-futuristic font-black text-slate-200 mt-1">{stats.monthlyCompletionRate}%</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-white/10 flex items-center gap-4 bg-slate-900/40">
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-primary/20 text-primary">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-futuristic">Yearly Consistency</p>
            <p className="text-lg font-futuristic font-black text-slate-200 mt-1">{stats.yearlyCompletionRate}%</p>
          </div>
        </div>
      </div>

      {/* Main spreadsheet Attendance grid container */}
      <div className="glass-panel rounded-xl border-white/10 overflow-hidden bg-slate-950/45 shadow-2xl relative">
        
        {/* Scroll hint indicators */}
        <div className="overflow-x-auto custom-scrollbar select-none relative">
          
          <table className="w-full border-collapse text-left relative min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/50">
                <th className="sticky left-0 z-20 bg-slate-950 p-4 min-w-[200px] border-r border-white/5 text-[9px] uppercase font-futuristic font-bold text-slate-400 tracking-wider">
                  Habit Tracker
                </th>
                {dayNumbers.map(d => {
                  // Get day of week
                  const dateObj = new Date(currentYear, currentMonth, d);
                  const dayName = dateObj.toLocaleDateString([], { weekday: 'short' });
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                  const isDayToday = isToday(d);

                  return (
                    <th 
                      key={d} 
                      className={`p-2.5 text-center text-[8px] font-bold border-r border-white/5 min-w-[34px] transition-all relative ${
                        isDayToday 
                          ? 'bg-cyan-500/20 text-cyan-300 font-extrabold border-x border-cyan-500/30' 
                          : isWeekend 
                            ? 'bg-slate-900/30 text-rose-400/70' 
                            : 'text-slate-400'
                      }`}
                    >
                      <div className="font-display uppercase tracking-widest text-[7px] opacity-60">{dayName}</div>
                      <div className="mt-1 font-mono text-[9px]">{d}</div>
                      {isDayToday && (
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-cyan-400" />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            
            <tbody>
              {activeHabits.length > 0 ? (
                activeHabits.map((habitName, idx) => {
                  const details = user?.habitDetails?.[habitName] || {};
                  const habitColor = details.color || '#06b6d4';
                  const isArchived = !!details.archived;

                  return (
                    <tr 
                      key={idx} 
                      className="border-b border-white/5 hover:bg-white/[0.01] group/row transition-colors"
                    >
                      {/* Sticky Habit name column */}
                      <td 
                        className="sticky left-0 z-10 bg-slate-950/95 backdrop-blur p-3.5 border-r border-white/5 flex items-center justify-between group/cell"
                        style={{ borderLeft: `3px solid ${habitColor}` }}
                      >
                        <div className="flex flex-col max-w-[125px] overflow-hidden truncate">
                          <span className={`text-[11px] font-bold text-slate-200 truncate ${isArchived ? 'line-through text-slate-500' : ''}`} title={habitName}>
                            {habitName}
                          </span>
                          <span 
                            className="text-[7px] uppercase font-mono tracking-wider mt-0.5" 
                            style={{ color: habitColor }}
                          >
                            {details.category || 'Routine'}
                          </span>
                        </div>

                        {/* Hover row modifiers */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingHabit(habitName);
                              setEditName(habitName);
                              setEditColor(details.color || '#06b6d4');
                              setEditCategory(details.category || 'Routine');
                              setEditArchived(!!details.archived);
                            }}
                            className="p-1 text-slate-500 hover:text-cyan-400 rounded cursor-pointer transition-colors"
                            title="Configure Habit"
                          >
                            <Settings2 size={10} />
                          </button>
                          <button
                            onClick={() => moveHabit(habitName, 'up')}
                            className="p-0.5 text-slate-500 hover:text-white rounded cursor-pointer transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button
                            onClick={() => moveHabit(habitName, 'down')}
                            className="p-0.5 text-slate-500 hover:text-white rounded cursor-pointer transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown size={10} />
                          </button>
                          <button
                            onClick={() => deleteHabit(habitName)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </td>

                      {/* Day checklist columns */}
                      {dayNumbers.map(d => {
                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const isCompleted = habits[dateStr]?.[habitName] === true;
                        const isDayToday = isToday(d);
                        
                        return (
                          <td 
                            key={d} 
                            onClick={() => toggleHabit(dateStr, habitName)}
                            className={`p-1 text-center border-r border-white/5 cursor-pointer select-none transition-colors ${
                              isDayToday 
                                ? 'bg-cyan-500/[0.04] border-x border-cyan-500/10' 
                                : 'hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="flex items-center justify-center w-full h-full">
                              <span 
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-all ${
                                  isCompleted 
                                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-glow-success scale-105' 
                                    : isDayToday
                                      ? 'text-cyan-400/40 hover:text-cyan-300 border border-cyan-500/25 bg-cyan-500/5'
                                      : 'text-slate-600 hover:text-slate-400 border border-transparent'
                                }`}
                              >
                                {isCompleted ? '✓' : '○'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td 
                    colSpan={daysInMonth + 1} 
                    className="p-8 text-center text-slate-500 text-xs font-display"
                  >
                    No habits configured for this environment. Deploy one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      </div>

      {/* Yearly heat-map section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-accent">
          <Activity size={15} />
          <h3 className="text-xs font-futuristic font-bold text-white uppercase tracking-wider">
            Yearly Consistent Heatmap
          </h3>
        </div>
        {renderHeatmap()}
      </div>

      {/* ADD HABIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-sm font-futuristic font-bold text-white uppercase tracking-wider mb-4">
              Deploy New Habit Tracker
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Habit Name</label>
                <input
                  type="text"
                  required
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Morning cardio, Read articles..."
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/45"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Category</label>
                  <select
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Health">Health</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Mind">Mind</option>
                    <option value="Career">Career</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Theme Color</label>
                  <select
                    value={newHabitColor}
                    onChange={(e) => setNewHabitColor(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="#06b6d4">Cyan</option>
                    <option value="#10b981">Emerald</option>
                    <option value="#a855f7">Purple</option>
                    <option value="#f59e0b">Amber</option>
                    <option value="#ef4444">Rose</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-455 font-futuristic font-bold text-xs uppercase rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-primary to-accent text-slate-950 font-futuristic font-bold text-xs uppercase rounded shadow-glow-accent cursor-pointer"
                >
                  Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CONFIGURATION MODAL */}
      {editingHabit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel border-white/10 rounded-2xl p-6 shadow-2xl relative text-left">
            <h3 className="text-sm font-futuristic font-bold text-white uppercase tracking-wider mb-4">
              Configure Habit: {editingHabit}
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Rename Habit</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/45"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Health">Health</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Mind">Mind</option>
                    <option value="Career">Career</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Theme Color</label>
                  <select
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="#06b6d4">Cyan</option>
                    <option value="#10b981">Emerald</option>
                    <option value="#a855f7">Purple</option>
                    <option value="#f59e0b">Amber</option>
                    <option value="#ef4444">Rose</option>
                  </select>
                </div>
              </div>

              {/* Archive checkbox */}
              <div className="flex items-center justify-between bg-slate-900/50 border border-white/5 p-3 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold font-futuristic text-slate-300 uppercase tracking-wide">Archive Habit</span>
                  <span className="text-[8px] text-slate-500 mt-0.5">Hide this habit from active tracker sheets</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editArchived}
                    onChange={(e) => setEditArchived(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-slate-950 peer-checked:after:border-cyan-400"></div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingHabit(null)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-455 font-futuristic font-bold text-xs uppercase rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-primary to-accent text-slate-950 font-futuristic font-bold text-xs uppercase rounded shadow-glow-accent cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
