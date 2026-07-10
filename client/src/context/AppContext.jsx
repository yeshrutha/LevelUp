import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://levelup-1-7j6v.onrender.com';

// Ranks List in order
export const RANKS = [
  'Iron I', 'Iron II', 'Iron III',
  'Bronze I', 'Bronze II', 'Bronze III',
  'Silver I', 'Silver II', 'Silver III',
  'Gold I', 'Gold II', 'Gold III',
  'Platinum I', 'Platinum II', 'Platinum III',
  'Diamond I', 'Diamond II', 'Diamond III',
  'Ascendant I', 'Ascendant II', 'Ascendant III',
  'Immortal I', 'Immortal II', 'Immortal III',
  'Radiant'
];

// Color mapping for each rank theme
export const RANK_COLORS = {
  'Iron': 'from-gray-500 to-gray-700 text-gray-400 border-gray-600',
  'Bronze': 'from-amber-700 to-amber-900 text-amber-500 border-amber-800',
  'Silver': 'from-slate-300 to-slate-500 text-slate-300 border-slate-400',
  'Gold': 'from-yellow-400 to-yellow-600 text-yellow-400 border-yellow-500',
  'Platinum': 'from-cyan-400 to-teal-600 text-cyan-400 border-cyan-500',
  'Diamond': 'from-purple-400 to-indigo-600 text-purple-400 border-purple-500',
  'Ascendant': 'from-emerald-400 to-teal-700 text-emerald-400 border-emerald-500',
  'Immortal': 'from-red-500 to-rose-700 text-red-400 border-red-500',
  'Radiant': 'from-yellow-300 via-amber-400 to-orange-500 text-yellow-300 border-yellow-300 shadow-glow-accent'
};

// Web Audio API Promotion Sound Synthesizer
export const playPromotionSound = () => {
  const activeEmail = localStorage.getItem('levelup_active_email') || '';
  const isMuted = localStorage.getItem(`levelup_sound_muted_${activeEmail}`) === 'true';
  if (isMuted) return;

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    
    // Synth chord riser
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.04, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });

    // Big sub drop at completion
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130.81, now + 0.5); // C3
    subOsc.frequency.exponentialRampToValueAtTime(65.41, now + 1.2); // C2
    subGain.gain.setValueAtTime(0.2, now + 0.5);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now + 0.5);
    subOsc.stop(now + 1.5);
  } catch (e) {
    console.warn('Audio Context failed to play:', e);
  }
};

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('levelup_user') || sessionStorage.getItem('levelup_user');
    let parsed = saved ? JSON.parse(saved) : null;
    
    // Self-healing: recover user.email from token if missing to unblock database synchronization
    const storedToken = localStorage.getItem('levelup_token') || sessionStorage.getItem('levelup_token');
    if (storedToken && parsed && !parsed.email) {
      const decoded = decodeToken(storedToken);
      if (decoded && decoded.email) {
        parsed.email = decoded.email;
        localStorage.setItem('levelup_user', JSON.stringify(parsed));
      }
    }
    return parsed;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('levelup_token') || sessionStorage.getItem('levelup_token') || null;
  });

  const [currentTab, setCurrentTab] = useState(() => {
    const saved = localStorage.getItem('levelup_user') || sessionStorage.getItem('levelup_user');
    return saved ? 'dashboard' : 'login';
  });

  const [customPages, setCustomPages] = useState(() => {
    const saved = localStorage.getItem('levelup_custom_pages') || sessionStorage.getItem('levelup_custom_pages');
    return saved ? JSON.parse(saved) : [];
  });

  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('levelup_theme_mode') || sessionStorage.getItem('levelup_theme_mode');
    return saved ? saved : 'light';
  });

  const [promotionEvent, setPromotionEvent] = useState(null);

  // Daily Habits (default empty)
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('levelup_habits') || sessionStorage.getItem('levelup_habits');
    return saved ? JSON.parse(saved) : {};
  });

  const [habitList, setHabitList] = useState(() => {
    const saved = localStorage.getItem('levelup_habit_list') || sessionStorage.getItem('levelup_habit_list');
    return saved ? JSON.parse(saved) : [];
  });

  // Calendar (default empty)
  const [calendar, setCalendar] = useState(() => {
    const saved = localStorage.getItem('levelup_calendar') || sessionStorage.getItem('levelup_calendar');
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic Dashboard Countdown Goal
  const [dashboardGoal, setDashboardGoal] = useState(() => {
    const saved = localStorage.getItem('levelup_dashboard_goal') || sessionStorage.getItem('levelup_dashboard_goal');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed.title === 'My Target Goal' || 
        parsed.title === 'My Main Target Goal' || 
        parsed.title === 'Semester Countdown' ||
        parsed.targetDate === '2026-08-31'
      ) {
        return { title: '', targetDate: '' };
      }
      return parsed;
    }
    return { title: '', targetDate: '' };
  });

  // Daily Missions State (Today's activities)
  const [dailyMissions, setDailyMissions] = useState([
    { id: 'dm1', task: 'Complete Daily Habit Goal list', xp: 30, completed: false },
    { id: 'dm2', task: 'Check off Notion Page tasks', xp: 30, completed: false },
    { id: 'dm3', task: 'Maintain Streak Checkpoints', xp: 20, completed: false }
  ]);

  // Notifications / Alerts Log
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('levelup_notifications') || sessionStorage.getItem('levelup_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 'n1', title: 'System Initialized', body: 'Welcome to LevelUp. Enter your milestones to raise your readiness score.', type: 'system', read: false, time: 'Just now' }
    ];
  });

  // Floating Toasts Queue
  const [toasts, setToasts] = useState([]);

  // Share profile modal state
  const [showShareModal, setShowShareModal] = useState(false);

  // Audio mute triggers
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('levelup_sound_muted') === 'true';
  });

  const changeMuteState = (mutedOrFunc) => {
    setIsMuted(prev => {
      const next = typeof mutedOrFunc === 'function' ? mutedOrFunc(prev) : mutedOrFunc;
      setUser(userPrev => {
        if (!userPrev) return userPrev;
        return { ...userPrev, isMuted: next };
      });
      return next;
    });
  };

  const changeThemeMode = (modeOrFunc) => {
    setThemeMode(prev => {
      const next = typeof modeOrFunc === 'function' ? modeOrFunc(prev) : modeOrFunc;
      setUser(userPrev => {
        if (!userPrev) return userPrev;
        return { ...userPrev, themeMode: next };
      });
      return next;
    });
  };

  // Web Audio API custom synthesizer chimes (Success / Level Progress)
  const playAlertSound = (type = 'success', force = false) => {
    if (isMuted && !force) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      
      if (type === 'success') {
        // Bright Dual-Tone Echo ("Ding-ding!")
        const playTone = (freq, delay, vol, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + delay);
          
          gain.gain.setValueAtTime(0, now + delay);
          gain.gain.linearRampToValueAtTime(vol, now + delay + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
          
          osc.start(now + delay);
          osc.stop(now + delay + duration);
        };
        
        playTone(523.25, 0, 0.15, 0.4); // C5
        playTone(659.25, 0.08, 0.15, 0.4); // E5
      } else if (type === 'xp') {
        // Cyberpunk Upward Sweeper ("Swoosh/Riser")
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.35);
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'rank' || type === 'trophy') {
        // Lush Multi-Oscillator Triumph Fanfare (ring out together)
        const playFanfareNote = (freq, delay, vol, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + delay);
          
          // Add a tiny bit of vibrato for vintage feel
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.value = 8; // 8Hz
          lfoGain.gain.value = 5; // Pitch variation
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          
          gain.gain.setValueAtTime(0, now + delay);
          gain.gain.linearRampToValueAtTime(vol, now + delay + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
          
          lfo.start(now + delay);
          osc.start(now + delay);
          
          lfo.stop(now + delay + duration);
          osc.stop(now + delay + duration);
        };
        
        playFanfareNote(261.63, 0, 0.08, 0.9); // C4
        playFanfareNote(329.63, 0.12, 0.08, 0.85); // E4
        playFanfareNote(392.00, 0.24, 0.08, 0.8); // G4
        playFanfareNote(523.25, 0.36, 0.1, 0.8); // C5
      }
    } catch (e) {
      console.warn('Web Audio playback failed:', e.message);
    }
  };

  // Add floating toast triggers
  const triggerToast = (title, body, type = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, title, body, type }]);
    playAlertSound(type);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Dispatch live webhook notifications to connected Discord/Slack services
  const sendIntegrationNotification = async (title, body, event = 'info') => {
    if (!user || !user.email) return;
    try {
      await fetch(`${API_BASE_URL}/api/integrations/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email.toLowerCase()}`
        },
        body: JSON.stringify({ event, title, body })
      });
    } catch (e) {
      console.warn('Failed to send integration sync notification:', e.message);
    }
  };

  // Generic backend fetch helper client
  const apiFetch = async (path, options = {}) => {
    if (!user || !user.email) return null;
    const token = user.email.toLowerCase();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    };
    
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Backend down, falls back silently to local storage
    }
    return null;
  };

  // Custom User Sign-In Action (Supports Demo Mode, JWT auth or Sign Up)
  const loginUser = async (name, email, password = '', useDemoData = false, isSignUp = false, rememberMe = false) => {
    if (useDemoData) {
      const demoUser = {
        displayName: 'Penguin Cadet',
        email: 'cadet@levelup.io',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
        xp: 150,
        level: 1,
        rank: 'Iron II',
        streak: 3,
        readiness: 55,
        emailVerified: false,
        phoneVerified: false,
        phoneNumber: ''
      };

      const demoHabitList = ['Exercise', 'Drink Water', 'Read Book', 'No Junk Food'];
      const demoHabits = {
        '2026-07-09': { 'Exercise': true, 'Drink Water': true, 'Read Book': false, 'No Junk Food': true }
      };

      const demoCalendar = [
        { id: '1', title: 'Product Launch Target', date: '2026-07-12', type: 'Goal', time: '10:00 AM' },
        { id: '2', title: 'Weekly Growth Review', date: '2026-07-15', type: 'Review', time: '02:00 PM' }
      ];

      const demoPages = [
        {
          id: 'dp1',
          title: 'Fitness Transformation',
          icon: '🏋️',
          termDays: 15,
          startDate: new Date().toISOString().split('T')[0],
          tasks: [
            { id: 't1', text: 'Drink 3 liters of water' },
            { id: 't2', text: 'Do 30 minutes of cardio stretching' },
            { id: 't3', text: 'Weight training gym session' }
          ],
          completedLogs: {
            '2026-07-09': ['t1', 't2']
          }
        }
      ];

      const demoGoal = { title: 'Launch Side Project', targetDate: '2026-08-31' };

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('levelup_user', JSON.stringify(demoUser));
      storage.setItem('levelup_habit_list', JSON.stringify(demoHabitList));
      storage.setItem('levelup_habits', JSON.stringify(demoHabits));
      storage.setItem('levelup_calendar', JSON.stringify(demoCalendar));
      storage.setItem('levelup_custom_pages', JSON.stringify(demoPages));
      storage.setItem('levelup_dashboard_goal', JSON.stringify(demoGoal));
      if (rememberMe) {
        localStorage.setItem('levelup_remember_me', 'true');
      } else {
        localStorage.removeItem('levelup_remember_me');
      }

      setUser(demoUser);
      setToken('demo_token');
      setHabitList(demoHabitList);
      setHabits(demoHabits);
      setCalendar(demoCalendar);
      setCustomPages(demoPages);
      setDashboardGoal(demoGoal);

      triggerToast('Welcome Cadet', 'Running in local workspace environment demo mode.', 'success');
      setCurrentTab('dashboard');
      return { success: true };
    }

    // Production JWT Auth Flow
    const emailKey = email.trim().toLowerCase();
    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    const payload = isSignUp 
      ? { email: emailKey, password, displayName: name.trim() }
      : { email: emailKey, password };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed.' };
      }

      // Sync local / session storage
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('levelup_token', data.token);
      storage.setItem('levelup_user', JSON.stringify(data.profile));
      if (rememberMe) {
        localStorage.setItem('levelup_remember_me', 'true');
      } else {
        localStorage.removeItem('levelup_remember_me');
      }

      setToken(data.token);
      setUser(data.profile);

      // Load payload data
      if (Array.isArray(data.habitList)) setHabitList(data.habitList);
      if (data.habits) setHabits(data.habits);
      if (Array.isArray(data.calendar)) setCalendar(data.calendar);
      if (Array.isArray(data.customPages)) setCustomPages(data.customPages);
      if (data.goal) setDashboardGoal(data.goal);

      if (data.profile.themeMode) setThemeMode(data.profile.themeMode);
      if (data.profile.isMuted !== undefined) setIsMuted(data.profile.isMuted);

      triggerToast('Authenticated', isSignUp ? 'Your LevelUp profile has been deployed!' : 'Welcome back to your environment!', 'success');
      setCurrentTab('dashboard');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Cannot connect to authentication terminal. Backend offline.' };
    }
  };

  // Verification-First Authentication Helpers
  const initiateVerify = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/initiate-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Terminal offline.' };
    }
  };

  const confirmVerify = async (email, code) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/confirm-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Terminal offline.' };
    }
  };

  const setPasswordAndRegister = async (email, password, rememberMe = true) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Password setup failed.' };

      handleLoginSuccess(data, rememberMe);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Terminal offline.' };
    }
  };

  const loginWithPassword = async (email, password, rememberMe = true) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/password-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Password verification failed.' };

      handleLoginSuccess(data, rememberMe);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Terminal offline.' };
    }
  };

  const handleLoginSuccess = (data, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const profile = {
      ...data.profile,
      timezone: data.profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
    };
    storage.setItem('levelup_token', data.token);
    storage.setItem('levelup_user', JSON.stringify(profile));
    if (rememberMe) {
      localStorage.setItem('levelup_remember_me', 'true');
    } else {
      localStorage.removeItem('levelup_remember_me');
    }

    setToken(data.token);
    setUser(profile);

    if (Array.isArray(data.habitList)) setHabitList(data.habitList);
    if (data.habits) setHabits(data.habits);
    if (Array.isArray(data.calendar)) setCalendar(data.calendar);
    if (Array.isArray(data.customPages)) setCustomPages(data.customPages);
    if (data.goal) setDashboardGoal(data.goal);

    if (data.profile.themeMode) setThemeMode(data.profile.themeMode);
    if (data.profile.isMuted !== undefined) setIsMuted(data.profile.isMuted);
    
    triggerToast('Authenticated', 'System initialized successfully!', 'success');
    setCurrentTab('dashboard');
  };

  const loginWithGoogle = async (email, displayName, avatar, rememberMe) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName, avatar })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Google Sign-In failed.' };

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('levelup_token', data.token);
      storage.setItem('levelup_user', JSON.stringify(data.profile));
      if (rememberMe) {
        localStorage.setItem('levelup_remember_me', 'true');
      } else {
        localStorage.removeItem('levelup_remember_me');
      }

      setToken(data.token);
      setUser(data.profile);

      if (Array.isArray(data.habitList)) setHabitList(data.habitList);
      if (data.habits) setHabits(data.habits);
      if (Array.isArray(data.calendar)) setCalendar(data.calendar);
      if (Array.isArray(data.customPages)) setCustomPages(data.customPages);
      if (data.goal) setDashboardGoal(data.goal);

      triggerToast('Welcome back', `Logged in via Google as ${data.profile.displayName}!`, 'success');
      setCurrentTab('dashboard');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error connecting to auth server: ' + err.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to send reset code.' };
      triggerToast('Reset Code Sent', 'Password reset code has been sent to your email.', 'success');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error: ' + err.message };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to reset password.' };
      triggerToast('Password Updated', 'Your password has been updated. Please sign in.', 'success');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error: ' + err.message };
    }
  };

  const sendVerificationCode = async () => {
    if (!user || !user.email) return { success: false, error: 'No active user found.' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to send code.' };
      
      // Push OTP to notification dropdown for local testing
      if (data.code) {
        const newNotif = {
          id: `notif_${Math.random()}`,
          title: 'Email Security Alert',
          body: `Verification Code: ${data.code}. Enter this code on settings to verify your email.`,
          type: 'system',
          read: false,
          time: 'Just now'
        };
        setNotifications(old => [newNotif, ...old]);
      }
      
      triggerToast('Verification Code Sent', 'Simulated OTP code sent to your email.', 'success');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error: ' + err.message };
    }
  };

  const verifyEmailCode = async (code) => {
    if (!user || !user.email) return { success: false, error: 'No active user found.' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-email-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Invalid code.' };
      
      setUser(data.profile);
      const isRemembered = localStorage.getItem('levelup_remember_me') === 'true';
      const storage = isRemembered ? localStorage : sessionStorage;
      storage.setItem('levelup_user', JSON.stringify(data.profile));
      
      triggerToast('Email Verified', 'Your email address has been verified!', 'success');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error: ' + err.message };
    }
  };

  const verifyPassword = async (password) => {
    if (!user || !user.email) return { success: false, error: 'No active user session.' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Password verification failed.' };
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error: ' + err.message };
    }
  };

  // Custom User Sign-Out Action
  const logoutUser = () => {
    localStorage.removeItem('levelup_user');
    localStorage.removeItem('levelup_token');
    localStorage.removeItem('levelup_habit_list');
    localStorage.removeItem('levelup_habits');
    localStorage.removeItem('levelup_calendar');
    localStorage.removeItem('levelup_custom_pages');
    localStorage.removeItem('levelup_dashboard_goal');
    localStorage.removeItem('levelup_notifications');

    sessionStorage.removeItem('levelup_user');
    sessionStorage.removeItem('levelup_token');
    sessionStorage.removeItem('levelup_habit_list');
    sessionStorage.removeItem('levelup_habits');
    sessionStorage.removeItem('levelup_calendar');
    sessionStorage.removeItem('levelup_custom_pages');
    sessionStorage.removeItem('levelup_dashboard_goal');
    sessionStorage.removeItem('levelup_notifications');

    setUser(null);
    setToken(null);
    setHabitList([]);
    setHabits({});
    setCalendar([]);
    setCustomPages([]);
    setDashboardGoal({ title: '', targetDate: '' });
    setNotifications([]);
    setCurrentTab('login');
    triggerToast('Logged Out', 'Successfully logged out from LevelUp.', 'success');
  };

  // Danger Zone System Wipe Action (Local and Database records)
  const resetSystem = async () => {
    localStorage.clear();

    try {
      await fetch(`${API_BASE_URL}/api/system/reset-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.warn('Backend server offline during reset:', e.message);
    }

    setUser(null);
    setHabitList([]);
    setHabits({});
    setCalendar([]);
    setCustomPages([]);
    setDashboardGoal({ title: '', targetDate: '' });
    setNotifications([]);
    setCurrentTab('login');
    triggerToast('System Reset Complete', 'All local storage and server database records purged.', 'success');
  };

  // --- AUTOMATED BACKEND SYNC TRIGGERS ---

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_user_${key}`, JSON.stringify(user));
      localStorage.setItem('levelup_user', JSON.stringify(user));
      apiFetch('/api/profile/sync', {
        method: 'POST',
        body: JSON.stringify(user)
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_habit_list_${key}`, JSON.stringify(habitList));
      localStorage.setItem('levelup_habit_list', JSON.stringify(habitList));
      apiFetch('/api/habits/list', {
        method: 'POST',
        body: JSON.stringify({ habitList })
      });
    }
    recalculateReadiness();
  }, [habitList, user]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_habits_${key}`, JSON.stringify(habits));
      localStorage.setItem('levelup_habits', JSON.stringify(habits));
      apiFetch('/api/habits', {
        method: 'POST',
        body: JSON.stringify({ habits })
      });
    }
    recalculateReadiness();
  }, [habits, user]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_calendar_${key}`, JSON.stringify(calendar));
      localStorage.setItem('levelup_calendar', JSON.stringify(calendar));
      apiFetch('/api/calendar', {
        method: 'POST',
        body: JSON.stringify({ calendar })
      });
    }
  }, [calendar, user]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_dashboard_goal_${key}`, JSON.stringify(dashboardGoal));
      localStorage.setItem('levelup_dashboard_goal', JSON.stringify(dashboardGoal));
      apiFetch('/api/goal', {
        method: 'POST',
        body: JSON.stringify(dashboardGoal)
      });
    }
  }, [dashboardGoal, user]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_custom_pages_${key}`, JSON.stringify(customPages));
      localStorage.setItem('levelup_custom_pages', JSON.stringify(customPages));
      apiFetch('/api/custom-pages', {
        method: 'POST',
        body: JSON.stringify({ customPages })
      });
    }
    recalculateReadiness();
  }, [customPages, user]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_notifications_${key}`, JSON.stringify(notifications));
      localStorage.setItem('levelup_notifications', JSON.stringify(notifications));
      apiFetch('/api/alerts', {
        method: 'POST',
        body: JSON.stringify({ alerts: notifications })
      });
    }
  }, [notifications, user]);

  useEffect(() => {
    localStorage.setItem('levelup_sound_muted', isMuted ? 'true' : 'false');
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_sound_muted_${key}`, isMuted ? 'true' : 'false');
    }
  }, [isMuted, user]);

  useEffect(() => {
    localStorage.setItem('levelup_theme_mode', themeMode);
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_theme_mode_${key}`, themeMode);
    }
    const body = document.body;
    if (themeMode === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }, [themeMode, user]);

  // Reactive Achievements Checker Loop
  useEffect(() => {
    if (user) {
      const currentUnlocks = user.unlockedAchievements || [];
      const todayStr = new Date().toISOString().split('T')[0];
      const todayHabitLogs = habits[todayStr] || {};
      const anyHabitCheckedToday = Object.values(todayHabitLogs).some(Boolean);

      const hasCompletedPage = customPages.some(page => {
        const isProgressive = (page.tasks || []).some(t => t.day !== undefined);
        const totalPossible = isProgressive 
          ? (page.tasks || []).length 
          : (page.tasks || []).length * page.termDays;
        if (totalPossible === 0) return false;
        let checked = 0;
        Object.values(page.completedLogs || {}).forEach(list => {
          checked += (list || []).length;
        });
        return checked >= totalPossible;
      });

      const checks = [
        { id: 'lvl_2', title: 'Growth Initiate', condition: user.level >= 2 },
        { id: 'lvl_5', title: 'Growth Master', condition: user.level >= 5 },
        { id: 'xp_silver', title: 'Rank Ascent', condition: user.xp >= 1000 },
        { id: 'habit_today', title: 'Daily Discipline', condition: anyHabitCheckedToday },
        { id: 'habit_pioneer', title: 'Atomic Habits', condition: habitList.length >= 4 },
        { id: 'page_first', title: 'Workspace Architect', condition: customPages.length >= 1 },
        { id: 'page_comp', title: 'Milestone Achieved', condition: hasCompletedPage },
        { id: 'cal_first', title: 'Time Planner', condition: calendar.length >= 1 }
      ];

      let newlyUnlocked = [];
      let changed = false;
      const updated = [...currentUnlocks];

      checks.forEach(c => {
        if (c.condition && !updated.includes(c.id)) {
          updated.push(c.id);
          newlyUnlocked.push(c);
          changed = true;
        }
      });

      if (changed) {
        setUser(prev => {
          if (!prev) return prev;
          return { ...prev, unlockedAchievements: updated };
        });
        newlyUnlocked.forEach(ach => {
          // Add to notifications log
          const newNotif = {
            id: `ach_${Math.random()}`,
            title: '🏆 Achievement Unlocked!',
            body: `Trophy unlocked: "${ach.title}"`,
            type: 'rank',
            read: false,
            time: 'Just now'
          };
          setNotifications(old => [newNotif, ...old]);

          setTimeout(() => {
            triggerToast('🏆 Trophy Unlocked!', `Achievement: "${ach.title}" unlocked!`, 'rank');
            sendIntegrationNotification('🏆 Trophy Unlocked!', `Achievement: "${ach.title}" unlocked!`, 'achievement');
          }, 500);
        });
      }
    }
  }, [user?.xp, user?.level, customPages, habits, habitList, calendar]);

  // Calculate overall goal growth progress percentage
  const recalculateReadiness = () => {
    if (!user) return;

    // Custom Pages completion progress: up to 50%
    let pagesWeight = 0;
    if (customPages && customPages.length > 0) {
      let totalProgress = 0;
      customPages.forEach(page => {
        const totalPossibleTasks = (page.tasks || []).length * (page.termDays || 1);
        if (totalPossibleTasks > 0) {
          let completedCount = 0;
          Object.values(page.completedLogs || {}).forEach(list => {
            completedCount += (list || []).length;
          });
          totalProgress += (completedCount / totalPossibleTasks);
        }
      });
      pagesWeight = (totalProgress / customPages.length) * 50;
    }

    // Habits progress (today): up to 30%
    let habitsWeight = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = habits[todayStr] || {};
    const checkedTodayCount = Object.values(todayLogs).filter(Boolean).length;
    if (habitList.length > 0) {
      habitsWeight = Math.min((checkedTodayCount / habitList.length) * 30, 30);
    }

    // Ranks / XP levels: up to 20%
    const rankIndex = RANKS.indexOf(user.rank);
    const rankWeight = ((rankIndex + 1) / RANKS.length) * 20;

    const totalReadiness = Math.round(pagesWeight + habitsWeight + rankWeight);
    
    if (totalReadiness !== user.readiness) {
      setUser(prev => ({ ...prev, readiness: Math.min(totalReadiness, 100) }));
    }
  };

  // Main XP synchronization engine
  const addXP = (amount, actionName) => {
    if (!user) return;
    
    const prevXP = user.xp;
    const nextXP = prevXP + amount;
    
    // Calculate rank and level based on 333 XP per rank tier (1000 XP per level)
    const rankIndex = Math.min(Math.floor(nextXP / 333), RANKS.length - 1);
    const newRank = RANKS[rankIndex];
    const newLevel = Math.floor(nextXP / 1000) + 1; // Level goes up every 3 ranks (1000 XP)

    const profileChanged = newRank !== user.rank;
    
    setUser({
      ...user,
      xp: nextXP,
      rank: newRank,
      level: newLevel
    });

    if (profileChanged) {
      setPromotionEvent({
        oldRank: user.rank,
        newRank: newRank,
        xpGained: amount,
        action: actionName
      });
      // Add to notifications log
      const rankNotif = {
        id: `rank_${Math.random()}`,
        title: 'Rank Ascent!',
        body: `Promoted to ${newRank}!`,
        type: 'rank',
        read: false,
        time: 'Just now'
      };
      setNotifications(old => [rankNotif, ...old]);
      triggerToast('Rank Ascent!', `Promoted to ${newRank}!`, 'rank');
      sendIntegrationNotification('Rank Ascent!', `Promoted to ${newRank}!`, 'rank_up');
    }
  };

  // Complete a daily mission
  const completeMission = (missionId) => {
    setDailyMissions(prev => 
      prev.map(m => {
        if (m.id === missionId && !m.completed) {
          addXP(m.xp, m.task);
          triggerToast('Mission Complete!', m.task, 'success');
          return { ...m, completed: true };
        }
        return m;
      })
    );
  };

  // Custom Notion Page task checking helper
  const togglePageTask = (pageId, dateString, taskId) => {
    setCustomPages(prev => 
      prev.map(p => {
        if (p.id === pageId) {
          const completedLogs = { ...p.completedLogs };
          const dayLogs = completedLogs[dateString] ? [...completedLogs[dateString]] : [];
          const wasCompleted = dayLogs.includes(taskId);
          
          const totalTasks = (p.tasks || []).length || 1;
          
          let nextDayLogs;
          if (wasCompleted) {
            nextDayLogs = dayLogs.filter(id => id !== taskId);
            
            // Old completion ratio before unchecking
            const oldRatio = dayLogs.length / totalTasks;
            let xpSub = 3;
            if (oldRatio >= 0.75) xpSub = 10;
            else if (oldRatio >= 0.50) xpSub = 5;
            
            addXP(-xpSub, `Removed task from page "${p.title}"`);
          } else {
            nextDayLogs = [...dayLogs, taskId];
            
            // New completion ratio after checking
            const newRatio = nextDayLogs.length / totalTasks;
            let xpAdd = 3;
            if (newRatio >= 0.75) xpAdd = 10;
            else if (newRatio >= 0.50) xpAdd = 5;
            
            addXP(xpAdd, `Completed task on page "${p.title}"`);
          }

          completedLogs[dateString] = nextDayLogs;
          return { ...p, completedLogs };
        }
        return p;
      })
    );
  };

  // Custom Page creation helpers
  const createCustomPage = (title, icon, termDays, tasks) => {
    const taskList = tasks || [];
    const newPage = {
      id: `cp_${Math.random().toString(36).substr(2, 9)}`,
      title,
      icon: icon || '📄',
      termDays: typeof termDays === 'number' ? termDays : 0,
      startDate: new Date().toISOString().split('T')[0],
      tasks: taskList.map((t, idx) => {
        const id = `t_${idx}_${Math.random().toString(36).substr(2, 5)}`;
        if (typeof t === 'object' && t !== null) {
          return { id: t.id || id, text: t.text, day: t.day };
        }
        return { id, text: t };
      }),
      completedLogs: {}
    };
    
    setCustomPages(prev => [...prev, newPage]);
    setCurrentTab(`page_${newPage.id}`);
    addXP(10, `Created custom workspace page: "${newPage.title}"`);
    triggerToast('Workspace Created', `Page "${title}" is ready!`, 'success');
    return newPage;
  };

  const updateCustomPage = (updatedPage) => {
    setCustomPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
  };

  const deleteCustomPage = (id) => {
    setCustomPages(prev => prev.filter(p => p.id !== id));
  };

  // Habit Check actions
  const toggleHabit = (date, habitName) => {
    setHabits(prev => {
      const dayHabits = prev[date] || {};
      const wasCompleted = !!dayHabits[habitName];
      const updatedDayHabits = {
        ...dayHabits,
        [habitName]: !wasCompleted
      };

      // Award XP on checking
      if (!wasCompleted) {
        addXP(15, `Habit: ${habitName}`);
      }

      return {
        ...prev,
        [date]: updatedDayHabits
      };
    });
  };

  const updateHabitReminder = (habitName, enabled, time) => {
    setUser(prev => {
      const updatedUser = {
        ...prev,
        habitReminders: {
          ...(prev?.habitReminders || {}),
          [habitName]: { enabled, time }
        }
      };
      if (prev?.email) {
        const key = prev.email.toLowerCase();
        localStorage.setItem(`levelup_user_${key}`, JSON.stringify(updatedUser));
        localStorage.setItem('levelup_user', JSON.stringify(updatedUser));
      }
      return updatedUser;
    });
  };

  // Habit List Customizer Helper
  const addHabit = (name, reminder = null) => {
    if (!name || habitList.includes(name)) return;
    setHabitList(prev => [...prev, name]);
    
    if (reminder) {
      setUser(prev => {
        const updatedUser = {
          ...prev,
          habitReminders: {
            ...(prev?.habitReminders || {}),
            [name]: { enabled: true, time: reminder }
          }
        };
        if (prev?.email) {
          const key = prev.email.toLowerCase();
          localStorage.setItem(`levelup_user_${key}`, JSON.stringify(updatedUser));
          localStorage.setItem('levelup_user', JSON.stringify(updatedUser));
        }
        return updatedUser;
      });
    }

    addXP(10, `Tracked custom habit: "${name}"`);
    triggerToast('Habit Tracked', `New habit added: "${name}"`, 'success');
  };

  const deleteHabit = (name) => {
    setHabitList(prev => prev.filter(h => h !== name));
    setUser(prev => {
      const copy = { ...(prev?.habitReminders || {}) };
      delete copy[name];
      const updatedUser = { ...prev, habitReminders: copy };
      if (prev?.email) {
        const key = prev.email.toLowerCase();
        localStorage.setItem(`levelup_user_${key}`, JSON.stringify(updatedUser));
        localStorage.setItem('levelup_user', JSON.stringify(updatedUser));
      }
      return updatedUser;
    });
  };

  // Dashboard Target Goal Customizer Helper
  const updateDashboardGoal = (title, targetDate) => {
    setDashboardGoal({ title, targetDate });
    addXP(15, `Updated main target goal: "${title}"`);
    triggerToast('Target Goal Updated', title, 'success');
  };

  // Calendar Planner
  const addCalendarEvent = (event) => {
    const newEv = {
      id: Math.random().toString(),
      ...event
    };
    setCalendar(prev => [newEv, ...prev]);
    addXP(10, `Scheduled Event: ${event.title}`);
    triggerToast('Event Scheduled', event.title, 'success');
  };

  const deleteCalendarEvent = (id) => {
    setCalendar(prev => prev.filter(item => item.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const purgeAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      currentTab, setCurrentTab,
      promotionEvent, setPromotionEvent,
      habits, toggleHabit,
      habitList, addHabit, deleteHabit,
      dashboardGoal, updateDashboardGoal,
      calendar, addCalendarEvent, deleteCalendarEvent,
      dailyMissions, completeMission,
      notifications, setNotifications, markAllNotificationsRead, purgeAllNotifications,
      addXP, loginUser, logoutUser, resetSystem, verifyPassword,
      forgotPassword, resetPassword, sendVerificationCode, verifyEmailCode, loginWithGoogle, token, setToken,
      initiateVerify, confirmVerify, setPasswordAndRegister, loginWithPassword,
      customPages, createCustomPage, updateCustomPage, deleteCustomPage, togglePageTask,
      themeMode, setThemeMode: changeThemeMode,
      toasts, triggerToast,
      isMuted, setIsMuted: changeMuteState,
      showShareModal, setShowShareModal,
      playAlertSound,
      updateHabitReminder
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
