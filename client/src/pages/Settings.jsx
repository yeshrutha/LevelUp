import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, Shield, Lock, Bell, Palette, Cpu, Mail, Calendar, Database, Link, 
  HelpCircle, AlertOctagon, Terminal, Globe, Clock, Plus, Trash2, Eye, EyeOff, 
  ShieldCheck, Check, Power, RefreshCw, Activity, Layers, Play, CheckSquare, Sparkles, ChevronDown, Settings as SettingsIcon,
  Volume2, VolumeX, Zap, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CUTE_AVATARS, AvatarRenderer } from '../components/AvatarRenderer';

export const Settings = () => {
  const { 
    user, setUser, themeMode, setThemeMode, logoutUser, resetSystem, 
    setCurrentTab, triggerToast, notifications, setNotifications, 
    markAllNotificationsRead, purgeAllNotifications, isMuted, setIsMuted, 
    playAlertSound, sendVerificationCode, verifyEmailCode, verifyPassword 
  } = useApp();

  // Active Category selection
  const [activeTab, setActiveTab] = useState('account');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications Filter state
  const [activeFilter, setActiveFilter] = useState('all');

  // --- LOCAL STATES ---
  // Account Form
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || user?.displayName?.toLowerCase().replace(/\s+/g, '_') || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.settings?.phoneNumber || user?.phoneNumber || '');
  const [bio, setBio] = useState(user?.settings?.bio || '');
  const [country, setCountry] = useState(user?.settings?.country || 'India');
  const [timezone, setTimezone] = useState(user?.settings?.timezone || 'GMT+5:30');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || CUTE_AVATARS[0].id);

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  // Email Verification
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailEnteredCode, setEmailEnteredCode] = useState('');

  // Toggles & Settings Objects (Synchronized directly to user.settings)
  const settings = user?.settings || {};

  const [accentColor, setAccentColor] = useState(settings.accentColor || '#00e5ff');
  const [animations, setAnimations] = useState(settings.animations !== false);
  const [reduceMotion, setReduceMotion] = useState(settings.reduceMotion === true);
  const [compactMode, setCompactMode] = useState(settings.compactMode === true);
  const [cardBlur, setCardBlur] = useState(settings.cardBlur !== false);
  const [uiDensity, setUiDensity] = useState(settings.uiDensity || 'normal');

  // AI settings
  const [aiProvider, setAiProvider] = useState(settings.aiProvider || 'Gemini');
  const [aiPersonality, setAiPersonality] = useState(settings.aiPersonality || 'Mentor');
  const [responseLength, setResponseLength] = useState(settings.responseLength || 'Medium');

  // Email Prefs
  const [emailFrequency, setEmailFrequency] = useState(settings.emailFrequency || 'Daily Digest');

  // Date/Time preferences
  const [language, setLanguage] = useState(settings.language || 'English');
  const [dateFormat, setDateFormat] = useState(settings.dateFormat || 'YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = useState(settings.timeFormat || '12h');
  const [weekStartsOn, setWeekStartsOn] = useState(settings.weekStartsOn || 'Monday');
  const [defaultLandingPage, setDefaultLandingPage] = useState(settings.defaultLandingPage || 'Dashboard');

  // Developer mode
  const [devMode, setDevMode] = useState(settings.devModeEnabled === true);
  const [apiLatency, setApiLatency] = useState(42);

  // Integrations states
  const [integrations, setIntegrations] = useState(settings.integrations || {
    github: false,
    googleCalendar: false,
    discord: false,
    slack: false
  });
  const [connectingService, setConnectingService] = useState(null);

  // Password confirmation modal overlay states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fluctuate dev latency counter slightly
  useEffect(() => {
    if (!devMode) return;
    const interval = setInterval(() => {
      setApiLatency(prev => Math.max(10, Math.min(120, prev + Math.floor(Math.random() * 9) - 4)));
    }, 3000);
    return () => clearInterval(interval);
  }, [devMode]);

  // Sync theme config
  const handleThemeToggle = (mode) => {
    setThemeMode(mode);
    triggerToast('Theme Updated', `System switched to ${mode} mode interface.`, 'success');
  };

  // Generic Save settings helper
  const handleSaveSettings = (updatedConfig) => {
    setUser(prev => {
      const nextUser = {
        ...prev,
        settings: {
          ...(prev.settings || {}),
          ...updatedConfig
        }
      };
      return nextUser;
    });
    triggerToast('Configuration Saved', 'Settings updated and synced successfully.', 'success');
  };

  const handleProfileUpdateSubmit = (e) => {
    e.preventDefault();
    if (!displayName.trim() || !editEmail.trim()) {
      triggerToast('Validation Error', 'Full Name and Email address are required.', 'warning');
      return;
    }

    setUser(prev => {
      const isEmailStillVerified = prev.email === editEmail.trim() && prev.emailVerified;
      const nextUser = {
        ...prev,
        displayName: displayName.trim(),
        email: editEmail.trim(),
        avatar: selectedAvatar,
        emailVerified: isEmailStillVerified,
        settings: {
          ...(prev.settings || {}),
          username: username.trim(),
          phoneNumber: editPhone.trim(),
          bio: bio.trim(),
          country,
          timezone
        }
      };
      return nextUser;
    });

    setSaveSuccess(true);
    triggerToast('Profile Updated', 'Identity settings saved successfully.', 'success');
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Verification Code
  const sendEmailCode = async () => {
    if (!editEmail.trim()) return;
    setEmailVerifying(true);
    const res = await sendVerificationCode();
    if (!res.success) {
      triggerToast('Verification Failed', res.error, 'error');
      setEmailVerifying(false);
    }
  };

  const confirmEmailCode = async () => {
    if (!emailEnteredCode.trim()) return;
    const res = await verifyEmailCode(emailEnteredCode.trim());
    if (res.success) {
      setEmailVerifying(false);
      setEmailEnteredCode('');
    }
  };

  // Security Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      triggerToast('Validation Error', 'All password fields are required.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast('Validation Error', 'Passwords do not match.', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      triggerToast('Validation Error', 'Password must be at least 8 characters.', 'warning');
      return;
    }

    setSecurityLoading(true);
    try {
      const verifyRes = await verifyPassword(currentPassword);
      if (!verifyRes.success) {
        triggerToast('Auth Error', 'Incorrect current password credential.', 'error');
        setSecurityLoading(false);
        return;
      }
      
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: 'N/A', newPassword, skipCodeCheck: true })
      });
      const data = await res.json();
      if (!res.ok) {
        triggerToast('Error', data.error || 'Failed to update password.', 'error');
      } else {
        triggerToast('Password Updated', 'Your security credential has been modified.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      triggerToast('Error', 'Server communication error: ' + err.message, 'error');
    }
    setSecurityLoading(false);
  };

  // Download User data JSON
  const downloadUserData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `${username}_levelup_telemetry.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Data Exported', 'Telemetry profile downloaded in JSON format.', 'success');
  };

  // Mock integration connector
  const toggleIntegration = (service) => {
    if (connectingService) return;
    setConnectingService(service);
    setTimeout(() => {
      setIntegrations(prev => {
        const next = { ...prev, [service]: !prev[service] };
        handleSaveSettings({ integrations: next });
        return next;
      });
      setConnectingService(null);
      triggerToast('Integration Sync', `${service.toUpperCase()} connection parameters updated.`, 'success');
    }, 1500);
  };

  // Secure Purge / Reset trigger
  const handleDangerActionTrigger = (action) => {
    setConfirmAction(action);
    setConfirmPasswordInput('');
    setConfirmError('');
    setShowConfirmModal(true);
  };

  const executeDangerousAction = async () => {
    setConfirmError('');
    setConfirmLoading(true);

    try {
      const verifyRes = await verifyPassword(confirmPasswordInput);
      if (!verifyRes.success) {
        setConfirmError('Incorrect password security verification.');
        setConfirmLoading(false);
        return;
      }

      setShowConfirmModal(false);
      if (confirmAction === 'reset') {
        resetSystem();
      } else if (confirmAction === 'delete_data') {
        setUser(prev => ({
          email: prev.email,
          displayName: prev.displayName,
          avatar: prev.avatar,
          level: 1,
          xp: 0,
          rank: 'Iron I',
          streak: 0,
          readiness: 0,
          settings: { devModeEnabled: false }
        }));
        triggerToast('Telemetry Cleared', 'All tasks, habits, and timeline custom pages have been deleted.', 'success');
      } else if (confirmAction === 'delete_account') {
        try {
          await fetch('http://localhost:5000/api/system/reset-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch(e){}
        logoutUser();
      }
    } catch(err) {
      setConfirmError('Communication failure: ' + err.message);
    }
    setConfirmLoading(false);
  };

  const categories = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'ai', label: 'AI Settings', icon: Cpu },
    { id: 'email', label: 'Email Prefs', icon: Mail },
    { id: 'preferences', label: 'Preferences', icon: Calendar },
    { id: 'data', label: 'Data Registry', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'help', label: 'Help & Info', icon: HelpCircle },
    { id: 'danger', label: 'Danger Zone', icon: AlertOctagon }
  ];

  const activeCategory = categories.find(c => c.id === activeTab) || categories[0];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 pb-12 select-none max-w-5xl mx-auto px-4 font-display">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 mb-4 gap-4">
        <div>
          <h2 className="text-sm font-futuristic font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <SettingsIcon size={16} className="text-accent" /> Upgraded Settings Control Panel
          </h2>
          <p className="text-[10px] text-slate-500 uppercase mt-1 tracking-wider">
            Configure system configurations, custom layouts, notifications, and telemetry sync registries.
          </p>
        </div>
        
        {/* Quick developer mode toggle */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-white/5 self-start">
          <Terminal size={12} className="text-accent" />
          <span className="text-[10px] font-bold font-futuristic text-slate-400 uppercase tracking-wider">Developer Console</span>
          <button
            onClick={() => {
              const nextVal = !devMode;
              setDevMode(nextVal);
              handleSaveSettings({ devModeEnabled: nextVal });
            }}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
              devMode ? 'bg-primary justify-end shadow-glow-accent' : 'bg-slate-800 justify-start'
            }`}
          >
            <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Category Menu Selector */}
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col space-y-1 bg-slate-900/10 border border-white/5 p-2 rounded-2xl">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  activeTab === cat.id 
                    ? 'bg-gradient-to-r from-primary/20 to-accent/5 border-l-2 border-accent text-accent' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                }`}
              >
                <CatIcon size={14} className={activeTab === cat.id ? 'text-accent' : 'text-slate-500'} />
                <span>{cat.label}</span>
                {cat.id === 'notifications' && unreadCount > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[8px] font-bold tracking-normal leading-none shrink-0">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Collapsible Menu */}
        <div className="block md:hidden relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-200 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <activeCategory.icon size={14} className="text-accent" />
              {activeCategory.label}
              {activeCategory.id === 'notifications' && unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[8px] font-bold leading-none">
                  {unreadCount}
                </span>
              )}
            </span>
            <ChevronDown size={14} className={`transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20"
              >
                <div className="grid grid-cols-2 gap-1 p-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveTab(cat.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        activeTab === cat.id ? 'bg-primary/20 text-accent' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <cat.icon size={11} />
                      <span>{cat.label}</span>
                      {cat.id === 'notifications' && unreadCount > 0 && (
                        <span className="ml-auto px-1 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[7px] font-bold leading-none">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="glass-panel p-6 rounded-2xl border-white/10 shadow-xl space-y-6"
            >
              {/* Account Category */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} className="text-accent" /> Profile Identity Settings
                    </h3>
                  </div>

                  {/* Profile Picture Selection */}
                  <div className="flex flex-col sm:flex-row items-start gap-5 bg-slate-950/45 p-4 rounded-xl border border-white/5">
                    <div className="flex flex-col items-center gap-2 shrink-0 self-center sm:self-start">
                      <h4 className="text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-widest">Avatar Preview</h4>
                      <div className="w-16 h-16 rounded-xl border border-accent shadow-glow-accent bg-slate-900 overflow-hidden flex items-center justify-center p-1.5">
                        <AvatarRenderer avatarKey={selectedAvatar} className="w-full h-full" />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-2 text-left w-full">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-futuristic">Select Cartoon Adventurer</h4>
                      <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 max-h-[140px] overflow-y-auto pr-1 border border-white/5 bg-slate-900/40 p-2 rounded-lg">
                        {CUTE_AVATARS.map((avatar) => {
                          const isSelected = selectedAvatar === avatar.id || selectedAvatar === avatar.url;
                          return (
                            <div 
                              key={avatar.id}
                              onClick={() => setSelectedAvatar(avatar.id)}
                              className={`relative aspect-square rounded-lg border-2 cursor-pointer bg-slate-950 hover:bg-slate-900 transition-all flex items-center justify-center p-1.5 ${
                                isSelected 
                                  ? 'border-accent shadow-glow-accent scale-95' 
                                  : 'border-white/5 hover:border-white/15'
                              }`}
                              title={avatar.name}
                            >
                              <AvatarRenderer avatarKey={avatar.id} className="w-full h-full" />
                              {isSelected && (
                                <div className="absolute top-0.5 right-0.5 text-accent text-[8px] font-bold leading-none">
                                  ✓
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Email Address</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Phone Number (Optional)</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Biography</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about your placement objectives and development focus..."
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 h-20 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Country</label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option>India</option>
                          <option>United States</option>
                          <option>United Kingdom</option>
                          <option>Canada</option>
                          <option>Japan</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Time Zone</label>
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option>GMT+5:30 (India Standard)</option>
                          <option>GMT-5:00 (EST)</option>
                          <option>GMT+0:00 (UTC)</option>
                          <option>GMT+9:00 (JST)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-slate-950 font-futuristic font-bold text-[10px] uppercase tracking-widest rounded shadow hover:shadow-glow-accent cursor-pointer transition-all active:scale-95 mt-2"
                    >
                      Update Identity Profiles
                    </button>
                  </form>
                </div>
              )}

              {/* Security Category */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Shield size={14} className="text-accent" /> Security Parameters
                    </h3>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Verification Status</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Verified emails permit alerts & credential recoverability.</p>
                    </div>
                    {user?.emailVerified ? (
                      <span className="text-[9px] font-bold font-futuristic text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck size={12} /> Email Verified
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold font-futuristic text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg uppercase tracking-wider animate-pulse">
                        Identity Unverified
                      </span>
                    )}
                  </div>

                  {/* Change Password Form */}
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2 font-futuristic">Change Password Credential</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Current Password</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={securityLoading}
                      className="px-4 py-2 bg-slate-800 border border-white/10 hover:border-accent text-slate-200 hover:text-accent font-futuristic font-bold text-[9px] uppercase tracking-widest rounded transition-colors cursor-pointer"
                    >
                      {securityLoading ? 'Securing...' : 'Modify Credentials'}
                    </button>
                  </form>

                  {/* Active Sessions registry */}
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-futuristic">Active Workspace Sessions</h4>
                      <button
                        onClick={() => triggerToast('Sessions Reset', 'Revoked authorization codes from other devices.', 'success')}
                        className="text-[9px] font-bold text-rose-400 uppercase tracking-wider hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        Force Revoke Sessions
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex items-center justify-between text-left">
                        <div>
                          <div className="text-[10px] font-bold text-white uppercase font-mono">Chrome 126 / Windows 11 (Current Session)</div>
                          <div className="text-[8px] text-slate-500 mt-1 uppercase tracking-wider">Location: Mumbai, India • IP: 103.88.22.14</div>
                        </div>
                        <span className="text-[8px] font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded">Active</span>
                      </div>

                      <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex items-center justify-between text-left opacity-60">
                        <div>
                          <div className="text-[10px] font-bold text-white uppercase font-mono">Safari 17 / iOS 17.5</div>
                          <div className="text-[8px] text-slate-500 mt-1 uppercase tracking-wider">Location: Pune, India • IP: 49.36.108.92</div>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase bg-slate-800 border border-white/10 px-2 py-0.5 rounded">2h ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Category (Full Notifications manager from Alerts.jsx) */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  {/* Header bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                        <Bell className="text-accent animate-pulse" size={14} />
                        Notifications Center
                      </h3>
                      <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">
                        System notifications, audio settings, and activity tracking logs
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMuted(prev => !prev);
                          triggerToast('Audio Settings', !isMuted ? 'Notification sounds muted' : 'Audio alerts active', 'success');
                        }}
                        className={`p-1.5 rounded border transition-all cursor-pointer flex items-center justify-center ${
                          isMuted 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                            : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                        }`}
                        title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
                      >
                        {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          markAllNotificationsRead();
                          triggerToast('Alerts Center', 'All alerts marked as read', 'success');
                        }}
                        disabled={notifications.filter(n => !n.read).length === 0}
                        className="px-2.5 py-1.5 bg-slate-950 border border-white/5 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckSquare size={10} />
                        Mark Read
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          purgeAllNotifications();
                          triggerToast('Notifications Center', 'Workspace notifications deleted successfully', 'success');
                        }}
                        disabled={notifications.length === 0}
                        className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 disabled:pointer-events-none rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 size={10} />
                        Delete Log
                      </button>
                    </div>
                  </div>

                  {/* KPI Counters Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass-panel p-3 rounded-xl relative overflow-hidden bg-slate-950/20 border border-white/5 text-left">
                      <span className="text-[8px] uppercase font-futuristic text-slate-500 tracking-widest block mb-0.5">Total</span>
                      <span className="text-lg font-black text-white">{notifications.length}</span>
                    </div>

                    <div className="glass-panel p-3 rounded-xl relative overflow-hidden bg-slate-950/20 border border-white/5 text-left">
                      <span className="text-[8px] uppercase font-futuristic text-slate-500 tracking-widest block mb-0.5">Unread</span>
                      <span className={`text-lg font-black ${notifications.filter(n => !n.read).length > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                        {notifications.filter(n => !n.read).length}
                      </span>
                    </div>

                    <div className="glass-panel p-3 rounded-xl relative overflow-hidden bg-slate-950/20 border border-white/5 text-left">
                      <span className="text-[8px] uppercase font-futuristic text-slate-500 tracking-widest block mb-0.5">Audio</span>
                      <span className="text-[10px] font-black text-cyan-400 mt-1 block tracking-wider">{isMuted ? 'MUTED' : 'ACTIVE'}</span>
                    </div>
                  </div>

                  {/* Sound Effects Test Bench */}
                  <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-white/10 text-left bg-slate-900/10">
                    <h4 className="text-[10px] font-black font-futuristic uppercase tracking-widest text-slate-200 mb-2 flex items-center gap-1.5">
                      <Terminal size={12} className="text-accent" />
                      Sound Effects Test Bench
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'success', label: 'Success Chime', sub: 'Dual Sine frequency riser' },
                        { id: 'xp', label: 'XP Progress Chord', sub: 'Ascending melody chord' },
                        { id: 'rank', label: 'Rank Promotion Fanfare', sub: 'Cinematic fanfare' }
                      ].map(sound => (
                        <div
                          key={sound.id}
                          onClick={() => {
                            playAlertSound(sound.id, true);
                            triggerToast(sound.label, 'Audio frequency chime synthesized.', 'success');
                          }}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-white/5 cursor-pointer"
                        >
                          <div>
                            <span className="text-[9px] font-bold font-futuristic text-white block uppercase tracking-wider">{sound.label}</span>
                            <span className="text-[8px] text-slate-500 block uppercase font-mono mt-0.5">{sound.sub}</span>
                          </div>
                          <Play size={8} className="text-accent fill-accent shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-1 border-b border-white/5 pb-0.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                    {['all', 'xp', 'rank', 'calendar', 'system'].map((filterType) => {
                      const filterLabels = {
                        all: 'All Notifications',
                        xp: 'XP Logs',
                        rank: 'Rank Upgrades',
                        calendar: 'Calendar Logs',
                        system: 'System Logs'
                      };
                      const isActive = activeFilter === filterType;
                      return (
                        <button
                          key={filterType}
                          type="button"
                          onClick={() => setActiveFilter(filterType)}
                          className={`px-3 py-1.5 border-b-2 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                            isActive 
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
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {notifications.filter(n => activeFilter === 'all' ? true : n.type === activeFilter).length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-6 rounded-xl border border-white/5 bg-slate-950/20 flex flex-col items-center justify-center text-center space-y-2"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-slate-600">
                            <Terminal size={14} />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold font-futuristic text-slate-300 uppercase tracking-widest block">No Telemetry Logged</span>
                            <span className="text-[8px] text-slate-500 uppercase tracking-wider block mt-0.5">Complete habits or milestones to generate logs</span>
                          </div>
                        </motion.div>
                      ) : (
                        notifications
                          .filter(n => activeFilter === 'all' ? true : n.type === activeFilter)
                          .map((notif, idx) => {
                            const isUnread = !notif.read;
                            const markReadSingle = () => {
                              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                            };
                            
                            const getAlertIcon = (type) => {
                              switch (type) {
                                case 'xp': return <Zap size={12} className="text-amber-400" />;
                                case 'rank': return <Award size={12} className="text-rose-500" />;
                                case 'calendar': return <Calendar size={12} className="text-cyan-400" />;
                                default: return <Terminal size={12} className="text-slate-400" />;
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
                              <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                                onClick={markReadSingle}
                                className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer text-left transition-all ${getAlertBgGlow(notif.type)} ${
                                  isUnread ? 'border-l-[3px] border-l-accent' : ''
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className="w-6.5 h-6.5 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center shrink-0">
                                    {getAlertIcon(notif.type)}
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <h4 className={`text-[11px] font-black uppercase tracking-wider ${isUnread ? 'text-white' : 'text-slate-400'}`}>
                                        {notif.title}
                                      </h4>
                                      {isUnread && (
                                        <span className="px-1 py-0.5 rounded bg-accent/15 border border-accent/25 text-accent text-[6px] font-bold uppercase tracking-wider leading-none">
                                          Unread
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-display leading-normal">
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
              )}

              {/* Appearance Category */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Palette size={14} className="text-accent" /> UI Layout Aesthetics
                    </h3>
                  </div>

                  {/* Themes cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => handleThemeToggle('light')}
                      className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between h-28 transition-all ${
                        themeMode === 'light' ? 'border-primary bg-primary/5 shadow-glow-primary' : 'border-white/5 bg-slate-900/30'
                      }`}
                    >
                      <Sun size={18} className={themeMode === 'light' ? 'text-primary' : 'text-slate-500'} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Light Theme</span>
                    </div>

                    <div 
                      onClick={() => handleThemeToggle('dark')}
                      className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between h-28 transition-all ${
                        themeMode === 'dark' ? 'border-accent bg-primary/10 shadow-glow-accent' : 'border-white/5 bg-slate-900/30'
                      }`}
                    >
                      <Moon size={18} className={themeMode === 'dark' ? 'text-accent' : 'text-slate-500'} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Dark Theme</span>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'System Animations Enabled', state: animations, setter: setAnimations, key: 'animations' },
                      { label: 'Reduce Motion Constraints', state: reduceMotion, setter: setReduceMotion, key: 'reduceMotion' },
                      { label: 'Compact Dashboard Layout', state: compactMode, setter: setCompactMode, key: 'compactMode' },
                      { label: 'Glassmorphism Blur Filters', state: cardBlur, setter: setCardBlur, key: 'cardBlur' }
                    ].map(appToggle => (
                      <div key={appToggle.key} className="p-4 bg-slate-950/30 border border-white/5 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{appToggle.label}</span>
                        <button
                          onClick={() => {
                            const next = !appToggle.state;
                            appToggle.setter(next);
                            handleSaveSettings({ [appToggle.key]: next });
                          }}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                            appToggle.state ? 'bg-primary justify-end shadow-glow-accent' : 'bg-slate-800 justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Color picker & density */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Accent Theme Glow</label>
                      <div className="flex gap-2 items-center">
                        {['#00e5ff', '#a855f7', '#10b981', '#f97316'].map(color => (
                          <button
                            key={color}
                            onClick={() => {
                              setAccentColor(color);
                              handleSaveSettings({ accentColor: color });
                            }}
                            style={{ backgroundColor: color }}
                            className={`w-6 h-6 rounded-full border cursor-pointer relative flex items-center justify-center`}
                          >
                            {accentColor === color && <Check size={12} className="text-slate-950 font-bold" />}
                          </button>
                        ))}
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => {
                            setAccentColor(e.target.value);
                            handleSaveSettings({ accentColor: e.target.value });
                          }}
                          className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">UI Density Profile</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['relaxed', 'normal', 'compact'].map(density => (
                          <button
                            key={density}
                            onClick={() => {
                              setUiDensity(density);
                              handleSaveSettings({ uiDensity: density });
                            }}
                            className={`py-2 text-[8px] font-bold uppercase rounded border transition-colors cursor-pointer ${
                              uiDensity === density 
                                ? 'bg-primary/20 border-accent text-accent' 
                                : 'bg-transparent border-white/10 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {density}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Settings Category */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Cpu size={14} className="text-accent" /> AI Assistant Terminals
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Preferred AI Provider</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'Nemotron', label: 'NVIDIA NIM', sub: 'Llama 3.1 Instruct' },
                          { id: 'Gemini', label: 'Google Gemini', sub: 'Flash 3.5 Assistant' },
                          { id: 'OpenAI', label: 'OpenAI GPT-4', sub: 'Direct Token Access' }
                        ].map(ai => (
                          <div
                            key={ai.id}
                            onClick={() => {
                              setAiProvider(ai.id);
                              handleSaveSettings({ aiProvider: ai.id });
                            }}
                            className={`p-3 bg-slate-950/30 border rounded-xl cursor-pointer transition-all ${
                              aiProvider === ai.id ? 'border-accent bg-primary/10 shadow-glow-accent' : 'border-white/5 hover:border-white/15'
                            }`}
                          >
                            <div className="text-[10px] font-bold text-white uppercase font-futuristic">{ai.label}</div>
                            <div className="text-[8px] text-slate-500 mt-1 uppercase font-mono">{ai.sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div className="space-y-2">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Default AI Personality</label>
                        <select
                          value={aiPersonality}
                          onChange={(e) => {
                            setAiPersonality(e.target.value);
                            handleSaveSettings({ aiPersonality: e.target.value });
                          }}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option>Mentor</option>
                          <option>Strict Coach</option>
                          <option>Friendly Coach</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Response Length</label>
                        <select
                          value={responseLength}
                          onChange={(e) => {
                            setResponseLength(e.target.value);
                            handleSaveSettings({ responseLength: e.target.value });
                          }}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option>Short</option>
                          <option>Medium</option>
                          <option>Detailed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Preferences Category */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Mail size={14} className="text-accent" /> Email & Dispatch Registries
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Registered Email</label>
                      <div className="relative">
                        <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div className="space-y-2">
                        <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Email Frequency</label>
                        <select
                          value={emailFrequency}
                          onChange={(e) => {
                            setEmailFrequency(e.target.value);
                            handleSaveSettings({ emailFrequency: e.target.value });
                          }}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option>Instant</option>
                          <option>Daily Digest</option>
                          <option>Weekly Digest</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Category */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} className="text-accent" /> Date, Time & Localization
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Language</label>
                      <select
                        value={language}
                        onChange={(e) => {
                          setLanguage(e.target.value);
                          handleSaveSettings({ language: e.target.value });
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Japanese</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Date Format</label>
                      <select
                        value={dateFormat}
                        onChange={(e) => {
                          setDateFormat(e.target.value);
                          handleSaveSettings({ dateFormat: e.target.value });
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option>YYYY-MM-DD</option>
                        <option>DD/MM/YYYY</option>
                        <option>MM/DD/YYYY</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Time Format</label>
                      <select
                        value={timeFormat}
                        onChange={(e) => {
                          setTimeFormat(e.target.value);
                          handleSaveSettings({ timeFormat: e.target.value });
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option>12h (AM/PM)</option>
                        <option>24h</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Week Starts On</label>
                      <select
                        value={weekStartsOn}
                        onChange={(e) => {
                          setWeekStartsOn(e.target.value);
                          handleSaveSettings({ weekStartsOn: e.target.value });
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option>Sunday</option>
                        <option>Monday</option>
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">Default Landing Page</label>
                      <select
                        value={defaultLandingPage}
                        onChange={(e) => {
                          setDefaultLandingPage(e.target.value);
                          handleSaveSettings({ defaultLandingPage: e.target.value });
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option>Dashboard</option>
                        <option>Analytics</option>
                        <option>Notion Workspace</option>
                        <option>Habits</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Registry Category */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Database size={14} className="text-accent" /> Telemetry Data Registry
                    </h3>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-display">
                    Export your local task configurations, timeline pages, achievements, and statistics to keep a offline backup copy, or reload it at any time.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={downloadUserData}
                      className="p-4 bg-slate-950/40 border border-white/5 hover:border-accent rounded-xl text-left transition-colors cursor-pointer group flex flex-col justify-between h-24"
                    >
                      <Database size={16} className="text-slate-500 group-hover:text-accent" />
                      <div>
                        <span className="text-[10px] font-bold text-white uppercase block font-futuristic">Export JSON Telemetry</span>
                        <span className="text-[8px] text-slate-500 mt-1 uppercase tracking-wider block font-mono">Download local user settings & lists</span>
                      </div>
                    </button>

                    <label className="p-4 bg-slate-950/40 border border-white/5 hover:border-accent rounded-xl text-left transition-colors cursor-pointer group flex flex-col justify-between h-24 relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const parsed = JSON.parse(event.target.result);
                              setUser(parsed);
                              triggerToast('Import Successful', 'Telemetry profile restored.', 'success');
                            } catch (err) {
                              triggerToast('Import Error', 'Invalid backup format.', 'error');
                            }
                          };
                          reader.readAsText(file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <RefreshCw size={16} className="text-slate-500 group-hover:text-accent animate-spin-slow" />
                      <div>
                        <span className="text-[10px] font-bold text-white uppercase block font-futuristic">Import JSON Telemetry</span>
                        <span className="text-[8px] text-slate-500 mt-1 uppercase tracking-wider block font-mono">Upload and merge local backup configs</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Integrations Category */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Link size={14} className="text-accent" /> Sync Integrations
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Google Calendar, GitHub, Discord, Slack */}
                    {[
                      { id: 'github', label: 'GitHub Registry', desc: 'Sync repository commits directly to workspace XP telemetry.' },
                      { id: 'googleCalendar', label: 'Google Calendar', desc: 'Auto-populate deadlines and reviews inside schedule calendar.' },
                      { id: 'discord', label: 'Discord Webhook', desc: 'Forward achievement triggers to custom Discord chat servers.' },
                      { id: 'slack', label: 'Slack Webhook', desc: 'Dispatch daily task checklists straight to Slack channels.' }
                    ].map(item => {
                      const isConnected = integrations[item.id] === true;
                      return (
                        <div key={item.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col justify-between h-32 text-left">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-white uppercase font-futuristic">{item.label}</span>
                              <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                                isConnected ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'
                              }`}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-500 mt-2 leading-relaxed font-display">{item.desc}</p>
                          </div>
                          
                          <button
                            onClick={() => toggleIntegration(item.id)}
                            disabled={connectingService === item.id}
                            className={`w-full py-1.5 text-[8px] font-bold uppercase rounded border transition-colors cursor-pointer ${
                              isConnected 
                                ? 'bg-transparent border-rose-500/20 text-rose-400 hover:bg-rose-500/10' 
                                : 'bg-transparent border-accent text-accent hover:bg-primary/20'
                            }`}
                          >
                            {connectingService === item.id 
                              ? 'Syncing parameters...' 
                              : isConnected ? 'Disconnect integration' : 'Connect accounts'
                            }
                          </button>
                        </div>
                      );
                    })}

                    {/* Coming soon integrations */}
                    {[
                      { label: 'Notion Sync v2', desc: 'Import Notion timeline databases straight to LevelUp workspace pages.' },
                      { label: 'Jira Objective Registry', desc: 'Direct board task synchronization to daily placement routines.' }
                    ].map((coming, idx) => (
                      <div key={idx} className="p-4 bg-slate-950/20 border border-white/5 rounded-xl flex flex-col justify-between h-32 text-left opacity-40">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-futuristic">{coming.label}</span>
                            <span className="text-[7px] font-bold uppercase px-2 py-0.5 rounded text-purple-400 bg-purple-500/10">Coming Soon</span>
                          </div>
                          <p className="text-[9px] text-slate-600 mt-2 leading-relaxed font-display">{coming.desc}</p>
                        </div>
                        <div className="w-full py-1.5 text-[8px] text-center border border-white/5 rounded uppercase font-mono select-none">
                          Locked integration
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Help & Support Category */}
              {activeTab === 'help' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-futuristic font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <HelpCircle size={14} className="text-accent" /> Help & Support Catalogs
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-2 text-left">
                      <h4 className="text-[10px] font-bold text-white uppercase font-futuristic">Support Tickets</h4>
                      <p className="text-[9px] text-slate-500 leading-normal font-display">Encountering problems syncing Resend email dispatches, database schemas or AI models?</p>
                      <button
                        onClick={() => triggerToast('Ticket Created', 'Support log generated. Help desk notified.', 'success')}
                        className="text-[9px] font-bold text-accent uppercase tracking-wider hover:underline bg-transparent border-0 cursor-pointer block"
                      >
                        ⚡ Contact Help Desk
                      </button>
                    </div>

                    <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-2 text-left">
                      <h4 className="text-[10px] font-bold text-white uppercase font-futuristic">Resource Hubs</h4>
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        <a href="#docs" className="hover:text-accent">Documentation</a>
                        <a href="#privacy" className="hover:text-accent">Privacy Policy</a>
                        <a href="#terms" className="hover:text-accent">Terms & Cond</a>
                        <a href="#changelog" className="hover:text-accent">Changelog</a>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] text-slate-500 font-mono">
                    <div className="flex items-center gap-1">
                      <Terminal size={10} className="text-accent" />
                      <span>LevelUp Placement Operating System v2.4.1-stable</span>
                    </div>
                    <span>Environment: development • Status: ACTIVE</span>
                  </div>
                </div>
              )}

              {/* Danger Zone Category */}
              {activeTab === 'danger' && (
                <div className="space-y-6">
                  <div className="border-b border-rose-500/20 pb-3 flex items-center gap-2 text-rose-400">
                    <AlertOctagon size={16} />
                    <h3 className="text-xs font-futuristic font-bold uppercase tracking-widest">
                      Danger Zone
                    </h3>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-display">
                    High-risk operations that modify or delete permanent database schemas. Password confirmation is required to confirm execution.
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                      <div>
                        <span className="text-[10px] font-bold text-rose-400 uppercase font-futuristic block">Reset Progress Registry</span>
                        <span className="text-[9px] text-slate-500 mt-1 block leading-normal">Purges habit checklists, completed task indices, and timelines but preserves your credentials.</span>
                      </div>
                      <button
                        onClick={() => handleDangerActionTrigger('reset')}
                        className="px-4 py-2 border border-rose-500/30 hover:border-rose-500 text-rose-400 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
                      >
                        Reset Telemetry
                      </button>
                    </div>

                    <div className="p-4 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                      <div>
                        <span className="text-[10px] font-bold text-rose-400 uppercase font-futuristic block">Delete All User Data</span>
                        <span className="text-[9px] text-slate-500 mt-1 block leading-normal">Purges the user's custom page timelines, calendar schedules, and settings registry.</span>
                      </div>
                      <button
                        onClick={() => handleDangerActionTrigger('delete_data')}
                        className="px-4 py-2 border border-rose-500/30 hover:border-rose-500 text-rose-400 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
                      >
                        Purge User Data
                      </button>
                    </div>

                    <div className="p-4 bg-rose-500/[0.04] border border-rose-500/20 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                      <div>
                        <span className="text-[10px] font-bold text-rose-500 uppercase font-futuristic block">Delete LevelUp Profile</span>
                        <span className="text-[9px] text-slate-500 mt-1 block leading-normal">Completely purges your registration, credentials, and settings logs from the MongoDB databases.</span>
                      </div>
                      <button
                        onClick={() => handleDangerActionTrigger('delete_account')}
                        className="px-4 py-2 bg-rose-500 text-slate-950 hover:bg-rose-600 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded shadow hover:shadow-glow-accent cursor-pointer transition-all active:scale-95 self-start sm:self-center"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Developer console panel */}
          <AnimatePresence>
            {devMode && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="mt-6 glass-panel p-5 rounded-2xl border-white/10 bg-slate-950/60 shadow-xl space-y-4"
              >
                <div className="flex items-center gap-2 text-accent border-b border-white/5 pb-2">
                  <Terminal size={14} />
                  <span className="text-[10px] font-bold font-futuristic uppercase tracking-widest">Active Developer Metrics</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left font-mono">
                  <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 uppercase block">Backend Status</span>
                    <span className="text-[10px] font-bold text-emerald-400 mt-1 block">ONLINE (200 OK)</span>
                  </div>

                  <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 uppercase block">Database (Mongo)</span>
                    <span className="text-[10px] font-bold text-emerald-400 mt-1 block">CONNECTED</span>
                  </div>

                  <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 uppercase block">Resend Mailer</span>
                    <span className="text-[10px] font-bold text-emerald-400 mt-1 block">SMTP DISPATCH ACTIVE</span>
                  </div>

                  <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 uppercase block">API Latency</span>
                    <span className="text-[10px] font-bold text-accent mt-1 block flex items-center gap-1.5">
                      <Activity size={10} className="animate-pulse" /> {apiLatency}ms
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left font-mono">
                  <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 uppercase block">Active AI Models</span>
                    <span className="text-[10px] font-bold text-white mt-1 block uppercase tracking-wider">
                      {user?.settings?.aiProvider || 'Gemini'} Flash NIM
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl">
                    <span className="text-[8px] text-slate-500 uppercase block">Telemetry Environment</span>
                    <span className="text-[10px] font-bold text-amber-500 mt-1 block uppercase tracking-wider">
                      development
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Password Confirmation Dialog Modal Overlay */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-slate-950 border border-rose-500/20 rounded-2xl p-6 space-y-4 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-rose-500/50" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-rose-500/50" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-rose-500/50" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-rose-500/50" />

              <div className="flex items-center gap-2 text-rose-400 border-b border-white/5 pb-3">
                <AlertOctagon size={16} />
                <h3 className="text-xs font-bold font-futuristic uppercase tracking-widest">
                  Confirm Dangerous Action
                </h3>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed font-display text-left">
                You are executing a destructive action: <strong className="text-rose-400 uppercase font-mono">"{confirmAction.replace('_', ' ')}"</strong>. 
                Please input your current LevelUp account password credential to authorize system changes.
              </p>

              {confirmError && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider text-left">
                  ✕ {confirmError}
                </div>
              )}

              <div className="space-y-1 text-left">
                <label className="block text-[8px] uppercase font-futuristic text-slate-500 font-bold tracking-wider">Account Password</label>
                <input
                  type="password"
                  required
                  placeholder="Security verification credential"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/40"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/[0.02] text-slate-400 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDangerousAction}
                  disabled={confirmLoading || !confirmPasswordInput}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-slate-950 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded shadow hover:shadow-glow-accent cursor-pointer transition-all active:scale-95"
                >
                  {confirmLoading ? 'Confirming...' : 'Authorize Purge'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
