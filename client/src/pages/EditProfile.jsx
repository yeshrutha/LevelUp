import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { CUTE_AVATARS, AvatarRenderer } from '../components/AvatarRenderer';

export const EditProfile = () => {
  const { user, setUser, setCurrentTab, triggerToast } = useApp();

  const [newName, setNewName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || CUTE_AVATARS[0].id);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      triggerToast('Validation Error', 'Display name cannot be empty!', 'error');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      setUser(prev => {
        const nextUser = {
          ...prev,
          displayName: newName.trim(),
          avatar: selectedAvatar
        };
        // Sync to active local storage reference
        localStorage.setItem(`levelup_user_${prev.email.toLowerCase()}`, JSON.stringify(nextUser));
        localStorage.setItem('levelup_user', JSON.stringify(nextUser));
        return nextUser;
      });

      setIsSaving(false);
      triggerToast('Agent Profile Updated', 'Identity details successfully synchronized.', 'success');
      setCurrentTab('dashboard');
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12 select-none max-w-3xl mx-auto">
      
      {/* Back to Dashboard breadcrumb link */}
      <button 
        onClick={() => setCurrentTab('dashboard')}
        className="flex items-center gap-1.5 text-[10px] font-bold font-futuristic text-slate-500 hover:text-accent uppercase tracking-widest transition-colors cursor-pointer group mb-2"
      >
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-futuristic flex items-center gap-2 tracking-wide">
          <User size={24} className="text-accent" />
          Edit Agent Profile
        </h1>
        <p className="text-[10px] text-slate-400 font-display uppercase tracking-widest mt-1">
          Customize your display alias and choose from 25 premium cartoon adventurer characters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side Preview Panel */}
        <div className="glass-panel p-5 rounded-xl border-white/10 flex flex-col items-center justify-center text-center space-y-4 md:col-span-1">
          <h3 className="text-[10px] uppercase font-futuristic text-slate-400 font-bold tracking-widest">
            Avatar Preview
          </h3>
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-accent shadow-glow-accent bg-slate-900 overflow-hidden flex items-center justify-center p-2">
              <AvatarRenderer avatarKey={selectedAvatar} className="w-full h-full" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-950 border border-white/15 rounded-full text-accent shadow-lg animate-pulse-slow">
              <Sparkles size={16} />
            </div>
          </div>
          <div>
            <h4 className="font-futuristic font-black text-white text-lg tracking-wide uppercase">
              {newName || 'Alias Agent'}
            </h4>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-display font-semibold mt-1">
              Tier Rank {user?.rank}
            </p>
          </div>
        </div>

        {/* Right Side Controls Panel */}
        <div className="glass-panel p-6 rounded-xl border-white/10 md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                Display Alias
              </label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={18}
                  placeholder="e.g. Yechu"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 font-futuristic uppercase tracking-widest"
                />
              </div>
              <span className="block text-[8px] text-slate-500 font-display">
                This display alias represents your name across leaderboards and stats PDF reports.
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                Select Cartoon Adventurer
              </label>
              
              {/* Grid of 25 cartoon adventurer avatars */}
              <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1 border border-white/5 bg-slate-950/60 p-2.5 rounded-lg">
                {CUTE_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.id || selectedAvatar === avatar.url;
                  return (
                    <div 
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`relative aspect-square rounded-lg border-2 cursor-pointer bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center p-1.5 group ${
                        isSelected 
                          ? 'border-accent shadow-glow-accent scale-95' 
                          : 'border-white/5 hover:border-white/15'
                      }`}
                      title={avatar.name}
                    >
                      <AvatarRenderer avatarKey={avatar.id} className="w-full h-full" />
                      {isSelected && (
                        <div className="absolute top-0.5 right-0.5 text-accent">
                          <CheckCircle2 size={10} className="fill-slate-950" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs tracking-widest uppercase rounded shadow hover:shadow-glow-accent cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Synchronizing Identity...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
