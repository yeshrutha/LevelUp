import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Sun, Moon, User, Mail, Phone, ShieldCheck, AlertOctagon, ShieldAlert, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings = () => {
  const { user, setUser, themeMode, setThemeMode, logoutUser, resetSystem, setCurrentTab, triggerToast, setNotifications } = useApp();

  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Email Verification State
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailVerifiedCode, setEmailVerifiedCode] = useState('');
  const [emailEnteredCode, setEmailEnteredCode] = useState('');

  // Phone Verification State
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneVerifiedCode, setPhoneVerifiedCode] = useState('');
  const [phoneEnteredCode, setPhoneEnteredCode] = useState('');

  const sendEmailCode = () => {
    if (!editEmail.trim()) {
      triggerToast('Validation Error', 'Please enter a valid email address first.', 'warning');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setEmailVerifiedCode(code);
    setEmailVerifying(true);

    // Push verification code to system notification center
    const newNotif = {
      id: `notif_${Math.random()}`,
      title: 'Email Security Alert',
      body: `Verification Code: ${code}. Enter this code on settings to verify your email.`,
      type: 'system',
      read: false,
      time: 'Just now'
    };
    setNotifications(old => [newNotif, ...old]);

    triggerToast('Verification Code Sent', `OTP code sent to email: ${code}`, 'success');
  };

  const confirmEmailCode = () => {
    if (emailEnteredCode.trim() === emailVerifiedCode) {
      setUser(prev => {
        const nextUser = {
          ...prev,
          email: editEmail.trim(),
          emailVerified: true
        };
        localStorage.setItem('levelup_user', JSON.stringify(nextUser));
        return nextUser;
      });
      setEmailVerifying(false);
      setEmailEnteredCode('');
      triggerToast('Email Verified', 'Your email address has been verified successfully!', 'success');
    } else {
      triggerToast('Verification Failed', 'Invalid verification code. Please try again!', 'error');
    }
  };

  const sendPhoneCode = () => {
    if (!phoneNumber.trim()) {
      triggerToast('Validation Error', 'Please enter a valid phone number first.', 'warning');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPhoneVerifiedCode(code);
    setPhoneVerifying(true);

    // Push OTP to system notification center
    const newNotif = {
      id: `notif_${Math.random()}`,
      title: 'Phone Security Alert',
      body: `Phone OTP Code: ${code}. Confirm this code on settings to verify your device.`,
      type: 'system',
      read: false,
      time: 'Just now'
    };
    setNotifications(old => [newNotif, ...old]);

    triggerToast('OTP Code Sent', `OTP code sent to phone: ${code}`, 'success');
  };

  const confirmPhoneCode = () => {
    if (phoneEnteredCode.trim() === phoneVerifiedCode) {
      setUser(prev => {
        const nextUser = {
          ...prev,
          phoneNumber: phoneNumber.trim(),
          phoneVerified: true
        };
        localStorage.setItem('levelup_user', JSON.stringify(nextUser));
        return nextUser;
      });
      setPhoneVerifying(false);
      setPhoneEnteredCode('');
      triggerToast('Phone Verified', 'Your phone number has been verified successfully!', 'success');
    } else {
      triggerToast('Verification Failed', 'Invalid OTP code. Please try again!', 'error');
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!editEmail.trim()) return;

    setUser(prev => {
      const isEmailStillVerified = prev.email === editEmail.trim() && prev.emailVerified;
      const isPhoneStillVerified = prev.phoneNumber === phoneNumber.trim() && prev.phoneVerified;

      const nextUser = {
        ...prev,
        email: editEmail.trim(),
        phoneNumber: phoneNumber.trim(),
        emailVerified: isEmailStillVerified,
        phoneVerified: isPhoneStillVerified
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
        className="flex items-center gap-1.5 text-[10px] font-bold font-futuristic text-slate-500 hover:text-accent uppercase tracking-widest transition-colors cursor-pointer group mb-2"
      >
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
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

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          
          {/* Email Address Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                Email Address
              </label>
              {user?.email === editEmail.trim() && user?.emailVerified ? (
                <span className="text-[8px] font-bold font-futuristic text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest">
                  <ShieldCheck size={10} /> Verified
                </span>
              ) : (
                <span className="text-[8px] font-bold font-futuristic text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                  Unverified
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                  placeholder="name@domain.com"
                />
              </div>
              
              {!(user?.email === editEmail.trim() && user?.emailVerified) && (
                <button
                  type="button"
                  onClick={sendEmailCode}
                  className="px-3.5 py-2 border border-cyan-500/30 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-accent font-futuristic font-bold text-[9px] uppercase rounded transition-all cursor-pointer whitespace-nowrap"
                >
                  Verify Email
                </button>
              )}
            </div>

            {/* Email OTP Code entry */}
            {emailVerifying && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/50 border border-white/5 rounded-lg p-3 space-y-2 mt-2"
              >
                <p className="text-[9px] text-slate-400 font-display">
                  We've sent a 6-digit confirmation code. Enter it below to activate system alerts.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    maxLength={6}
                    value={emailEnteredCode}
                    onChange={(e) => setEmailEnteredCode(e.target.value)}
                    placeholder="Enter Code (e.g. 123456)"
                    className="flex-1 bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/30 font-mono text-center tracking-widest font-bold"
                  />
                  <button
                    type="button"
                    onClick={confirmEmailCode}
                    className="px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-futuristic font-bold text-[9px] uppercase rounded transition-all cursor-pointer"
                  >
                    Confirm Code
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Phone Number Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                Phone Number (Alert Notifications)
              </label>
              {phoneNumber.trim() && user?.phoneNumber === phoneNumber.trim() && user?.phoneVerified ? (
                <span className="text-[8px] font-bold font-futuristic text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest">
                  <ShieldCheck size={10} /> Verified
                </span>
              ) : (
                <span className="text-[8px] font-bold font-futuristic text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                  {phoneNumber.trim() ? 'Unverified' : 'Not Set'}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                  placeholder="e.g. +91 9876543210"
                />
              </div>
              
              {phoneNumber.trim() && !(user?.phoneNumber === phoneNumber.trim() && user?.phoneVerified) && (
                <button
                  type="button"
                  onClick={sendPhoneCode}
                  className="px-3.5 py-2 border border-cyan-500/30 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-accent font-futuristic font-bold text-[9px] uppercase rounded transition-all cursor-pointer whitespace-nowrap"
                >
                  Send OTP
                </button>
              )}
            </div>

            {/* Phone OTP Code entry */}
            {phoneVerifying && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/50 border border-white/5 rounded-lg p-3 space-y-2 mt-2"
              >
                <p className="text-[9px] text-slate-400 font-display">
                  We've sent a 6-digit OTP code to your device. Confirm it to subscribe to alerts.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    maxLength={6}
                    value={phoneEnteredCode}
                    onChange={(e) => setPhoneEnteredCode(e.target.value)}
                    placeholder="Enter OTP (e.g. 123456)"
                    className="flex-1 bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/30 font-mono text-center tracking-widest font-bold"
                  />
                  <button
                    type="button"
                    onClick={confirmPhoneCode}
                    className="px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-futuristic font-bold text-[9px] uppercase rounded transition-all cursor-pointer"
                  >
                    Confirm OTP
                  </button>
                </div>
              </motion.div>
            )}
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
            if (window.confirm("Are you absolutely sure you want to delete all core profile data? This will clear the MongoDB collections and all local accounts.")) {
              resetSystem();
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
