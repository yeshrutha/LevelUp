import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Sparkles, User, Check } from 'lucide-react';
import { CUTE_AVATARS, AvatarRenderer } from './AvatarRenderer';

export const ProfileSetupModal = () => {
  const { user, setUser, triggerToast } = useApp();
  
  // Show only if user is logged in but hasn't finalized setup
  const isSetupRequired = user && user.isProfileSetupComplete === false;

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar_duck');

  if (!isSetupRequired) return null;

  const handleCompleteSetup = (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      triggerToast('Name Required', 'Please enter a display name to deploy your profile.', 'warning');
      return;
    }

    // Update user context which will auto-sync to backend via useEffect
    setUser(prev => ({
      ...prev,
      displayName: displayName.trim(),
      avatar: selectedAvatar,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      isProfileSetupComplete: true
    }));

    triggerToast('Initialization Complete', `Welcome to LevelUp, ${displayName}!`, 'success');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      
      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full glass-panel rounded-2xl border-white/10 p-6 shadow-2xl relative space-y-5 text-center"
      >
        {/* Glow corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-primary" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-primary" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-primary" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-primary" />

        {/* Modal Header */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center text-slate-950 font-futuristic font-black text-xl shadow-glow-accent relative">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <h2 className="text-sm font-futuristic font-black tracking-widest uppercase mt-3 text-white">
            Finalize Profile Setup
          </h2>
          <p className="text-[9px] uppercase tracking-wider text-slate-500 mt-1 font-display">
            Personalize your identity coordinates
          </p>
        </div>

        {/* Selected Avatar Preview */}
        <div className="flex justify-center py-2">
          <div className="w-20 h-20 rounded-full border border-primary/40 overflow-hidden bg-slate-950 flex items-center justify-center p-1 relative shadow-lg">
            <AvatarRenderer avatarKey={selectedAvatar} className="w-full h-full" />
            <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-full text-slate-950">
              <Check size={10} className="stroke-[3]" />
            </div>
          </div>
        </div>

        <form onSubmit={handleCompleteSetup} className="space-y-4">
          
          {/* Display Name Input */}
          <div className="space-y-1.5 text-left">
            <label className="block text-[8px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
              Display Name / Alias
            </label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your nickname"
                className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          {/* Cute Mascot Avatar Selector grid */}
          <div className="space-y-1.5 text-left">
            <label className="block text-[8px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
              Select Profile Mascot Mascot
            </label>
            
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 bg-slate-950/60 border border-white/5 rounded-lg scrollbar-thin">
              {CUTE_AVATARS.map((avatar) => (
                <button
                  type="button"
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`aspect-square rounded-lg border flex items-center justify-center p-1 transition-all relative cursor-pointer ${
                    selectedAvatar === avatar.id 
                      ? 'border-primary bg-primary/10 scale-95 shadow-md' 
                      : 'border-white/5 bg-slate-900/40 hover:bg-slate-900 hover:border-white/20'
                  }`}
                  title={avatar.name}
                >
                  <AvatarRenderer avatarKey={avatar.id} className="w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs tracking-widest uppercase rounded shadow hover:shadow-glow-accent cursor-pointer transition-all duration-200"
          >
            Deploy Profile Settings
          </button>
        </form>

      </motion.div>

    </div>
  );
};
