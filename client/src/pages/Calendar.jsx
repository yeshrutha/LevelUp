import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Calendar as CalIcon, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Calendar = () => {
  const { calendar, addCalendarEvent, deleteCalendarEvent } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Study');
  const [time, setTime] = useState('');

  // Dynamic Calendar Date State
  const [viewDate, setViewDate] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonth = monthNames[viewDate.getMonth()];
  const currentYear = viewDate.getFullYear();

  // Get total days in currently viewed month
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  // Get day of the week that the 1st of the month falls on
  const startOffset = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const totalCells = daysInMonth + startOffset;
  const calendarCells = Array.from({ length: totalCells }).map((_, idx) => {
    if (idx < startOffset) return null;
    return idx - startOffset + 1;
  });

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date) return;

    addCalendarEvent({ title, date, type, time: time || 'All Day' });
    setTitle('');
    setDate('');
    setTime('');
    setType('Study');
    setShowAddForm(false);
  };

  const getEventsForDay = (dayNum) => {
    if (!dayNum) return [];
    const year = viewDate.getFullYear();
    const monthStr = (viewDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = dayNum.toString().padStart(2, '0');
    const targetDate = `${year}-${monthStr}-${dayStr}`;
    return calendar.filter(ev => ev.date === targetDate);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'Exam': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Interview': return 'bg-cyan-500/20 text-accent border-cyan-400/30 shadow-glow-accent';
      case 'Gym': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-primary/20 text-white border-primary/30';
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-futuristic tracking-wide">
            Calendar Planner
          </h1>
          <p className="text-[10px] text-slate-400 font-display uppercase tracking-widest mt-1">
            Exam Milestones & Interview Schedules Planner
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs tracking-widest uppercase rounded shadow transition-all duration-200 cursor-pointer"
        >
          <Plus size={14} /> Schedule Event
        </button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Monthly grid */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 px-2 rounded hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer select-none font-futuristic text-xs font-bold"
                >
                  &larr;
                </button>
                <span className="font-futuristic font-bold text-sm text-white uppercase tracking-wider min-w-[120px] text-center">
                  {currentMonth} {currentYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 px-2 rounded hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer select-none font-futuristic text-xs font-bold"
                >
                  &rarr;
                </button>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-display">Timezone: Local Sync</span>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-futuristic uppercase text-slate-500 font-bold mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((dayNum, idx) => {
                const dayEvents = getEventsForDay(dayNum);
                const hasEvents = dayEvents.length > 0;
                
                const today = new Date();
                const isDayToday = dayNum === today.getDate() &&
                                   viewDate.getMonth() === today.getMonth() &&
                                   viewDate.getFullYear() === today.getFullYear();
                
                return (
                  <div 
                    key={idx}
                    className={`h-20 border rounded-lg p-1.5 flex flex-col justify-between transition-all duration-200 relative ${
                      dayNum 
                        ? isDayToday
                          ? 'border-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/60 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                          : hasEvents 
                            ? 'border-cyan-500/20 bg-slate-900/50 hover:bg-slate-900' 
                            : 'border-white/5 bg-slate-950/20 hover:bg-slate-900/30'
                        : 'border-transparent bg-transparent pointer-events-none'
                    }`}
                  >
                    {dayNum && (
                      <>
                        <div className="flex justify-between items-center w-full">
                          <span className={`text-[10px] font-bold ${isDayToday ? 'text-cyan-400 font-futuristic' : hasEvents ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {dayNum}
                          </span>
                          {isDayToday && (
                            <span className="text-[6px] bg-cyan-400/25 border border-cyan-400/40 text-cyan-300 font-bold px-1 py-0.2 rounded font-futuristic uppercase tracking-widest leading-none scale-90">
                              Today
                            </span>
                          )}
                        </div>
                        
                        {/* Event tags in cell */}
                        <div className="space-y-1 overflow-hidden max-h-12">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div 
                              key={ev.id}
                              className={`text-[8px] px-1 rounded truncate border font-display leading-tight`}
                              style={{
                                backgroundColor: ev.type === 'Exam' ? 'rgba(239, 68, 68, 0.15)' : ev.type === 'Interview' ? 'rgba(0, 229, 255, 0.15)' : ev.type === 'Gym' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                borderColor: ev.type === 'Exam' ? 'rgba(239, 68, 68, 0.3)' : ev.type === 'Interview' ? 'rgba(0, 229, 255, 0.3)' : ev.type === 'Gym' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(99, 102, 241, 0.3)',
                                color: ev.type === 'Exam' ? '#ef4444' : ev.type === 'Interview' ? '#00E5FF' : ev.type === 'Gym' ? '#22C55E' : '#818cf8'
                              }}
                            >
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[7px] text-slate-500 text-center">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Event log schedule list */}
        <div className="glass-panel p-5 rounded-xl border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="font-futuristic font-bold text-xs text-white uppercase tracking-wider mb-4">
              Daily Schedule List
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {calendar.length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center py-12">No events scheduled. Add an event to populate calendar.</p>
              ) : (
                calendar.map((ev) => (
                  <div 
                    key={ev.id} 
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${getEventTypeColor(ev.type)}`}
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-xs truncate select-text">{ev.title}</h4>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-display">
                        <span className="flex items-center gap-0.5"><CalIcon size={10} /> {ev.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Clock size={10} /> {ev.time}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteCalendarEvent(ev.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded shrink-0 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-lg p-3 text-[10px] text-slate-400 leading-relaxed mt-4 flex gap-2">
            <AlertCircle size={14} className="text-cyan-400 shrink-0 mt-0.5" />
            <p>Interviews and exams are color-coded in cyan/red. Be punctual to earn bonuses!</p>
          </div>
        </div>

      </div>

      {/* Add Calendar event form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full glass-panel border-white/10 rounded-xl shadow-2xl p-6 relative"
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-accent" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent" />

              <h3 className="font-futuristic font-bold text-sm text-white mb-4 uppercase tracking-wider">
                Schedule Event
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] uppercase font-futuristic text-slate-400 mb-1.5">Event Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Google HR Round"
                    className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-futuristic text-slate-400 mb-1.5">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-futuristic text-slate-400 mb-1.5">Event Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Study">Study Session</option>
                      <option value="Interview">Interview</option>
                      <option value="Exam">Exam Date</option>
                      <option value="Gym">Gym Session</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-futuristic text-slate-400 mb-1.5">Event Time (Optional)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                  />
                  <p className="mt-1 text-[9px] text-slate-500">A browser notification is sent at this time. All-day events notify at 9:00 AM.</p>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-950 border border-white/5 hover:border-white/10 text-xs font-semibold text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs tracking-widest uppercase rounded shadow transition-all duration-200 cursor-pointer"
                  >
                    Schedule Event
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
