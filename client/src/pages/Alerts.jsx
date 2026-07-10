import React, { useState } from 'react';
import { useApp, RANKS } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Trash2, 
  CheckSquare, 
  Volume2, 
  VolumeX, 
  Zap, 
  Award, 
  Calendar as CalIcon, 
  Terminal, 
  AlertTriangle,
  Play,
  ArrowLeft
} from 'lucide-react';

export const Alerts = () => {
  const { 
    notifications, 
    setNotifications,
    markAllNotificationsRead,
    purgeAllNotifications,
    isMuted,
    setIsMuted,
    triggerToast,
    setCurrentTab,
    playAlertSound
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all');

  const filteredNotifs = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    triggerToast('Alerts Center', 'All alerts marked as read', 'success');
  };

  const handlePurgeLogs = () => {
    purgeAllNotifications();
    triggerToast('Notifications Center', 'Workspace notifications deleted successfully', 'success');
  };

  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
    triggerToast('Audio Settings', !isMuted ? 'Notification sounds muted' : 'Audio alerts active', 'success');
  };

  // Sound Test synthesis callers
  const testSound = (type) => {
    playAlertSound(type, true);
    if (type === 'success') {
      triggerToast('Chime Test', 'Ascending success chord played', 'success');
    } else if (type === 'xp') {
      triggerToast('XP Synthesizer', 'Gained compound progress', 'xp');
    } else if (type === 'rank') {
      triggerToast('Rank Fanfare', 'Cinematic promotion sequence completed', 'rank');
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'xp': return <Zap size={14} className="text-amber-400" />;
      case 'rank': return <Award size={14} className="text-rose-500" />;
      case 'calendar': return <CalIcon size={14} className="text-cyan-400" />;
      default: return <Terminal size={14} className="text-slate-400" />;
    }
  };

  const getAlertBgGlow = (type) => {
    switch (type) {
      case 'xp': return 'border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/35';
      case 'rank': return 'border-rose-500/20 bg-rose-500/[0.02] hover:border-rose-500/35';
      case 'calendar': return 'border-cyan-500/20 bg-cyan-500/[0.02] hover:border-cyan-500/35';
      default: return 'border-white/5 bg-slate-900/50 hover:border-white/10';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none font-display pb-10">

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-black font-futuristic tracking-wider uppercase flex items-center gap-2.5">
            <Bell className="text-accent animate-pulse" size={20} />
            Notifications
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-slate-400 mt-1">
            System notifications, audio settings, and activity tracking logs
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-center ${
              isMuted 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' 
                : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
            }`}
            title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-3 py-2 bg-slate-950 border border-white/5 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <CheckSquare size={12} />
            Mark Read
          </button>

          <button
            onClick={handlePurgeLogs}
            disabled={notifications.length === 0}
            className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 disabled:pointer-events-none rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 size={12} />
            Delete Log
          </button>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
          <span className="text-[9px] uppercase font-futuristic text-slate-400 tracking-widest block mb-1">
            Total Notifications
          </span>
          <span className="text-2xl font-black text-white">{notifications.length}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          {unreadCount > 0 && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />}
          <span className="text-[9px] uppercase font-futuristic text-slate-400 tracking-widest block mb-1">
            Unread Notifications
          </span>
          <span className={`text-2xl font-black ${unreadCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
            {unreadCount}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
          <span className="text-[9px] uppercase font-futuristic text-slate-400 tracking-widest block mb-1">
            Audio Sounds
          </span>
          <span className="text-2xl font-black text-cyan-400 flex items-center gap-1.5 uppercase text-xs mt-1.5 tracking-wider">
            {isMuted ? 'MUTED' : 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Extraordinary Sound Test Synth Center */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border-white/10">
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl" />
        
        <h2 className="text-xs font-black font-futuristic uppercase tracking-widest text-slate-200 mb-3 flex items-center gap-2">
          <Terminal size={14} className="text-accent" />
          Sound Effects Test Bench
        </h2>
        
        <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-4 leading-relaxed max-w-xl">
          Test the application's sound effects and notification chimes directly in your browser.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => testSound('success')}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950 hover:bg-slate-900 border border-white/5 text-left cursor-pointer transition-colors"
          >
            <div>
              <span className="text-[9px] font-bold font-futuristic text-white block uppercase tracking-wider">
                Success Chime
              </span>
              <span className="text-[8px] text-slate-500 block uppercase font-display mt-0.5">
                Dual Sine frequency riser
              </span>
            </div>
            <Play size={10} className="text-accent fill-accent shrink-0 ml-2" />
          </button>

          <button
            onClick={() => testSound('xp')}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950 hover:bg-slate-900 border border-white/5 text-left cursor-pointer transition-colors"
          >
            <div>
              <span className="text-[9px] font-bold font-futuristic text-white block uppercase tracking-wider">
                XP Progress Chord
              </span>
              <span className="text-[8px] text-slate-500 block uppercase font-display mt-0.5">
                Ascending melody chord
              </span>
            </div>
            <Play size={10} className="text-accent fill-accent shrink-0 ml-2" />
          </button>

          <button
            onClick={() => testSound('rank')}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950 hover:bg-slate-900 border border-white/5 text-left cursor-pointer transition-colors"
          >
            <div>
              <span className="text-[9px] font-bold font-futuristic text-white block uppercase tracking-wider">
                Rank Promotion Fanfare
              </span>
              <span className="text-[8px] text-slate-500 block uppercase font-display mt-0.5">
                Cinematic promotion fanfare
              </span>
            </div>
            <Play size={10} className="text-accent fill-accent shrink-0 ml-2" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 border-b border-white/5 pb-0.5 overflow-x-auto whitespace-nowrap scrollbar-none">
        {['all', 'xp', 'rank', 'calendar', 'system'].map((filterType) => {
          const filterLabels = {
            all: 'All Notifications',
            xp: 'XP Logs',
            rank: 'Rank Upgrades',
            calendar: 'Calendar Logs',
            system: 'System Logs'
          };
          return (
            <button
              key={filterType}
              onClick={() => setActiveFilter(filterType)}
              className={`px-4 py-2 border-b-2 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                activeFilter === filterType 
                  ? 'border-accent text-white bg-slate-950/20' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {filterLabels[filterType]}
            </button>
          );
        })}
      </div>

      {/* Alerts Logs List */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filteredNotifs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-8 rounded-xl border border-white/5 bg-slate-950/20 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-slate-600">
                <Terminal size={16} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-futuristic text-slate-300 uppercase tracking-widest block">
                  No Telemetry Logged
                </span>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider block">
                  Complete habits or check milestones to generate logs
                </span>
              </div>
            </motion.div>
          ) : (
            filteredNotifs.map((notif, idx) => {
              const isUnread = !notif.read;
              
              const markReadSingle = () => {
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
              };

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                  onClick={markReadSingle}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-4 cursor-pointer transition-all ${getAlertBgGlow(notif.type)} ${
                    isUnread ? 'border-l-[3px] border-l-accent' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center shrink-0">
                      {getAlertIcon(notif.type)}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-black uppercase tracking-wider ${isUnread ? 'text-white' : 'text-slate-400'}`}>
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span className="px-1.5 py-0.5 rounded bg-accent/15 border border-accent/25 text-accent text-[7px] font-bold uppercase tracking-wider leading-none">
                            Unread
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-display leading-relaxed">
                        {notif.body}
                      </p>
                    </div>
                  </div>

                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest shrink-0 mt-0.5 font-futuristic">
                    {notif.time}
                  </span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
