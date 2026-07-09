import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Sun, Moon, User, Mail, AlertOctagon, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings = () => {
  const { user, setUser, themeMode, setThemeMode, logoutUser, setCurrentTab } = useApp();

  const [editName, setEditName] = useState(user?.displayName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [avatarSeed, setAvatarSeed] = useState(() => {
    // extract seed if dicebear url
    if (user?.avatar?.includes('dicebear')) {
      const match = user.avatar.match(/seed=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : 'cadet';
    }
    return 'cadet';
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) return;

    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(avatarSeed || 'cadet')}`;

    setUser(prev => {
      const nextUser = {
        ...prev,
        displayName: editName.trim(),
        email: editEmail.trim(),
        avatar: newAvatar
      };
      localStorage.setItem('levelup_user', JSON.stringify(nextUser));
      return nextUser;
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 select-none max-w-2xl mx-auto">
      
      {/* Back to Dashboard breadcrumb link */}
      <button 
        onClick={() => setCurrentTab('dashboard')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent font-semibold transition-colors cursor-pointer"
      >
        ← Back to Dashboard
      </button>
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-futuristic flex items-center gap-2 tracking-wide">
          <SettingsIcon size={24} className="text-accent" />
          System Settings
        </h1>
        <p className="text-[10px] text-slate-400 font-display uppercase tracking-widest mt-1">
          Customize themes, profile credentials, and system options
        </p>
      </div>

      {/* Theme Toggler */}
      <div className="glass-panel p-5 rounded-xl border-white/10 space-y-4">
        <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-wider">
          Aesthetic Theme Preferences
        </h3>

        <div className="grid grid-cols-2 gap-4">
          
          {/* Light Mode Card */}
          <div 
            onClick={() => setThemeMode('light')}
            className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between h-28 transition-all duration-200 ${
              themeMode === 'light' 
                ? 'border-accent bg-primary/10 shadow-glow-accent' 
                : 'border-white/5 bg-slate-900/30 hover:border-white/10'
            }`}
          >
            <div className="flex justify-between items-start">
              <Sun size={20} className={themeMode === 'light' ? 'text-accent' : 'text-slate-500'} />
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                themeMode === 'light' ? 'border-accent bg-accent text-slate-950 text-[8px] font-bold' : 'border-white/20'
              }`}>
                {themeMode === 'light' && '✓'}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Light Mode</h4>
              <p className="text-[9px] text-slate-500 mt-0.5">Clean white & warm ivory accents</p>
            </div>
          </div>

          {/* Dark Mode Card */}
          <div 
            onClick={() => setThemeMode('dark')}
            className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between h-28 transition-all duration-200 ${
              themeMode === 'dark' 
                ? 'border-accent bg-primary/10 shadow-glow-accent' 
                : 'border-white/5 bg-slate-900/30 hover:border-white/10'
            }`}
          >
            <div className="flex justify-between items-start">
              <Moon size={20} className={themeMode === 'dark' ? 'text-accent' : 'text-slate-500'} />
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                themeMode === 'dark' ? 'border-accent bg-accent text-slate-950 text-[8px] font-bold' : 'border-white/20'
              }`}>
                {themeMode === 'dark' && '✓'}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Dark Mode</h4>
              <p className="text-[9px] text-slate-500 mt-0.5">Midnight obsidian & neon violet glows</p>
            </div>
          </div>

        </div>
      </div>

      {/* Profile Settings */}
      <div className="glass-panel p-5 rounded-xl border-white/10">
        <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-wider mb-4">
          Profile Identity Options
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-semibold tracking-wider">
              Display Name
            </label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-semibold tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-semibold tracking-wider">
              Robot Avatar Avatar Seed
            </label>
            <input 
              type="text"
              value={avatarSeed}
              onChange={(e) => setAvatarSeed(e.target.value)}
              placeholder="e.g. Penguin, Sparky, Alpha"
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
            />
            <span className="block text-[8px] text-slate-500 font-display">
              Type any word to auto-generate a unique geometric robot avatar shape.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">
              {saveSuccess && '✓ Profile synced successfully!'}
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs tracking-widest uppercase rounded shadow hover:shadow-glow-accent cursor-pointer transition-all duration-200"
            >
              Update Credentials
            </button>
          </div>

        </form>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-5 rounded-xl border-rose-500/20 bg-rose-500/[0.02]">
        <div className="flex items-center gap-2 text-rose-400 mb-2">
          <AlertOctagon size={16} />
          <h3 className="text-xs font-futuristic font-bold uppercase tracking-wider">
            System Administration Danger Zone
          </h3>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
          Resetting LevelUp deletes all local records including user profiles, streaks, daily habit scores, calendar planner configurations, and Notion workspace timelines. This operation is permanent.
        </p>

        <button
          onClick={() => {
            if (window.confirm("Are you absolutely sure you want to delete all core profile data?")) {
              logoutUser();
            }
          }}
          className="px-4 py-2 border border-rose-500/20 hover:border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-futuristic font-bold text-[10px] uppercase rounded transition-colors cursor-pointer"
        >
          Reset LevelUp Operating System
        </button>
      </div>

    </div>
  );
};
