import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

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

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('levelup_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState(() => {
    const saved = localStorage.getItem('levelup_user');
    return saved ? 'dashboard' : 'login';
  });

  const [customPages, setCustomPages] = useState(() => {
    const saved = localStorage.getItem('levelup_custom_pages');
    return saved ? JSON.parse(saved) : [];
  });

  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('levelup_theme_mode');
    return saved ? saved : 'light';
  });

  const [promotionEvent, setPromotionEvent] = useState(null);

  // Daily Habits (default empty)
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('levelup_habits');
    return saved ? JSON.parse(saved) : {};
  });

  // Habit List (default generic)
  const [habitList, setHabitList] = useState(() => {
    const saved = localStorage.getItem('levelup_habit_list');
    return saved ? JSON.parse(saved) : ['Exercise', 'Drink Water', 'Read Book'];
  });

  // Calendar (default empty)
  const [calendar, setCalendar] = useState(() => {
    const saved = localStorage.getItem('levelup_calendar');
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic Dashboard Countdown Goal
  const [dashboardGoal, setDashboardGoal] = useState(() => {
    const saved = localStorage.getItem('levelup_dashboard_goal');
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

  // Notifications center
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'System Initialized', body: 'Welcome to LevelUp. Enter your milestones to raise your readiness score.', type: 'system', read: false, time: 'Just now' }
  ]);

  // Custom User Sign-In Action (Supports Demo Mode or Fresh Email registration)
  // Custom User Sign-In Action (Supports Demo Mode or Fresh Email registration)
  const loginUser = (name, email, useDemoData = false, isSignUp = false) => {
    if (useDemoData) {
      const demoUser = {
        displayName: 'Penguin Cadet',
        email: 'cadet@levelup.io',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
        xp: 150,
        level: 1,
        rank: 'Iron II',
        streak: 3,
        readiness: 55
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

      setUser(demoUser);
      setHabitList(demoHabitList);
      setHabits(demoHabits);
      setCalendar(demoCalendar);
      setCustomPages(demoPages);
      setDashboardGoal(demoGoal);

      localStorage.setItem('levelup_user', JSON.stringify(demoUser));
      localStorage.setItem('levelup_habit_list', JSON.stringify(demoHabitList));
      localStorage.setItem('levelup_habits', JSON.stringify(demoHabits));
      localStorage.setItem('levelup_calendar', JSON.stringify(demoCalendar));
      localStorage.setItem('levelup_custom_pages', JSON.stringify(demoPages));
      localStorage.setItem('levelup_dashboard_goal', JSON.stringify(demoGoal));
      return { success: true };
    } else {
      const emailKey = email.trim().toLowerCase();
      const registeredStr = localStorage.getItem('levelup_registered_emails');
      const registered = registeredStr ? JSON.parse(registeredStr) : ['cadet@levelup.io'];

      if (isSignUp) {
        if (registered.includes(emailKey)) {
          return { success: false, error: 'Email already exists. Use Sign In instead!' };
        }

        const nextRegistered = [...registered, emailKey];
        localStorage.setItem('levelup_registered_emails', JSON.stringify(nextRegistered));

        const freshUser = {
          displayName: name || 'Cadet',
          email: emailKey,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'cadet')}`,
          xp: 0,
          level: 1,
          rank: 'Iron I',
          streak: 0,
          readiness: 0
        };

        const freshHabitList = ['Exercise', 'Drink Water', 'Read Book'];
        const freshGoal = { title: '', targetDate: '' };

        localStorage.setItem(`levelup_user_${emailKey}`, JSON.stringify(freshUser));
        localStorage.setItem(`levelup_habit_list_${emailKey}`, JSON.stringify(freshHabitList));
        localStorage.setItem(`levelup_habits_${emailKey}`, JSON.stringify({}));
        localStorage.setItem(`levelup_calendar_${emailKey}`, JSON.stringify([]));
        localStorage.setItem(`levelup_custom_pages_${emailKey}`, JSON.stringify([]));
        localStorage.setItem(`levelup_dashboard_goal_${emailKey}`, JSON.stringify(freshGoal));

        setUser(freshUser);
        setHabitList(freshHabitList);
        setHabits({});
        setCalendar([]);
        setCustomPages([]);
        setDashboardGoal(freshGoal);
        setCurrentTab('dashboard');
        return { success: true };
      } else {
        // Sign In Mode
        if (!registered.includes(emailKey)) {
          return { success: false, error: 'Account does not exist. Sign up first!' };
        }

        const loadedUser = JSON.parse(localStorage.getItem(`levelup_user_${emailKey}`) || '{}');
        const loadedHabitList = JSON.parse(localStorage.getItem(`levelup_habit_list_${emailKey}`) || '[]');
        const loadedHabits = JSON.parse(localStorage.getItem(`levelup_habits_${emailKey}`) || '{}');
        const loadedCalendar = JSON.parse(localStorage.getItem(`levelup_calendar_${emailKey}`) || '[]');
        const loadedPages = JSON.parse(localStorage.getItem(`levelup_custom_pages_${emailKey}`) || '[]');
        let loadedGoal = JSON.parse(localStorage.getItem(`levelup_dashboard_goal_${emailKey}`) || '{}');
        if (
          loadedGoal.title === 'My Main Target Goal' || 
          loadedGoal.title === 'My Target Goal' || 
          loadedGoal.title === 'Semester Countdown' ||
          loadedGoal.targetDate === '2026-08-31'
        ) {
          loadedGoal = { title: '', targetDate: '' };
        }

        setUser(loadedUser);
        setHabitList(loadedHabitList);
        setHabits(loadedHabits);
        setCalendar(loadedCalendar);
        setCustomPages(loadedPages);
        setDashboardGoal(loadedGoal);
        setCurrentTab('dashboard');
        return { success: true };
      }
    }
  };

  // Custom User Sign-Out Action
  const logoutUser = () => {
    localStorage.removeItem('levelup_user');
    localStorage.removeItem('levelup_habit_list');
    localStorage.removeItem('levelup_habits');
    localStorage.removeItem('levelup_calendar');
    localStorage.removeItem('levelup_custom_pages');
    localStorage.removeItem('levelup_dashboard_goal');

    setUser(null);
    setHabitList(['Exercise', 'Drink Water', 'Read Book']);
    setHabits({});
    setCalendar([]);
    setCustomPages([]);
    setDashboardGoal({ title: '', targetDate: '' });
    setCurrentTab('login');
  };

  // Notion-style custom workspace page CRUD methods
  const createCustomPage = (title, icon, termDays) => {
    const newPage = {
      id: Math.random().toString(),
      title: title || 'Untitled Page',
      icon: icon || '📝',
      termDays: termDays || 14,
      startDate: new Date().toISOString().split('T')[0],
      tasks: [],
      completedLogs: {}
    };
    setCustomPages(prev => [...prev, newPage]);
    setCurrentTab(`page_${newPage.id}`);
    addXP(10, `Created custom workspace page: "${newPage.title}"`);
    return newPage;
  };

  const updateCustomPage = (pageId, updatedData) => {
    setCustomPages(prev => 
      prev.map(p => {
        if (p.id === pageId) {
          return { ...p, ...updatedData };
        }
        return p;
      })
    );
  };

  const deleteCustomPage = (pageId) => {
    setCustomPages(prev => prev.filter(p => p.id !== pageId));
    if (currentTab === `page_${pageId}`) {
      setCurrentTab('dashboard');
    }
  };

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

  // Sync to database if server available, fallback localstorage
  const syncProfileWithServer = async (updatedUser) => {
    try {
      await fetch('http://localhost:5000/api/profile/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
        body: JSON.stringify(updatedUser)
      });
    } catch (e) {
      // Server down, falls back silently to local storage
    }
  };

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_user_${key}`, JSON.stringify(user));
      localStorage.setItem('levelup_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_habit_list_${key}`, JSON.stringify(habitList));
      localStorage.setItem('levelup_habit_list', JSON.stringify(habitList));
    }
    recalculateReadiness();
  }, [habitList]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_habits_${key}`, JSON.stringify(habits));
      localStorage.setItem('levelup_habits', JSON.stringify(habits));
    }
    recalculateReadiness();
  }, [habits]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_calendar_${key}`, JSON.stringify(calendar));
      localStorage.setItem('levelup_calendar', JSON.stringify(calendar));
    }
  }, [calendar]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_dashboard_goal_${key}`, JSON.stringify(dashboardGoal));
      localStorage.setItem('levelup_dashboard_goal', JSON.stringify(dashboardGoal));
    }
  }, [dashboardGoal]);

  useEffect(() => {
    if (user && user.email) {
      const key = user.email.toLowerCase();
      localStorage.setItem(`levelup_custom_pages_${key}`, JSON.stringify(customPages));
      localStorage.setItem('levelup_custom_pages', JSON.stringify(customPages));
    }
    recalculateReadiness();
  }, [customPages]);

  useEffect(() => {
    localStorage.setItem('levelup_theme_mode', themeMode);
    const body = document.body;
    if (themeMode === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }, [themeMode]);

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
    setUser(prev => {
      const nextXP = prev.xp + amount;
      
      // Calculate rank and level based on 333 XP per rank tier (1000 XP per level)
      const rankIndex = Math.min(Math.floor(nextXP / 333), RANKS.length - 1);
      const newRank = RANKS[rankIndex];
      const newLevel = Math.floor(nextXP / 1000) + 1; // Level goes up every 3 ranks (1000 XP)

      const profileChanged = newRank !== prev.rank;
      
      if (profileChanged) {
        setPromotionEvent({
          oldRank: prev.rank,
          newRank: newRank,
          xpGained: amount,
          action: actionName
        });
        playPromotionSound();
      }

      // Add a small notification
      const newNotif = {
        id: Math.random().toString(),
        title: amount > 0 ? 'XP Progress Gained' : 'XP Adjusted',
        body: `Unlocked via: ${actionName}`,
        type: 'xp',
        read: false,
        time: 'Just now'
      };
      setNotifications(old => [newNotif, ...old]);

      const updated = {
        ...prev,
        xp: nextXP,
        rank: newRank,
        level: newLevel
      };
      
      syncProfileWithServer(updated);
      return updated;
    });
  };

  // Complete a daily mission
  const completeMission = (missionId) => {
    setDailyMissions(prev => 
      prev.map(m => {
        if (m.id === missionId && !m.completed) {
          addXP(m.xp, m.task);
          return { ...m, completed: true };
        }
        return m;
      })
    );
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

  // Habit List Customizer Helper
  const addHabit = (name) => {
    if (!name || habitList.includes(name)) return;
    setHabitList(prev => [...prev, name]);
    addXP(10, `Tracked custom habit: "${name}"`);
  };

  const deleteHabit = (name) => {
    setHabitList(prev => prev.filter(h => h !== name));
  };

  // Dashboard Target Countdown Goal Customizer Helper
  const updateDashboardGoal = (title, targetDate) => {
    setDashboardGoal({ title, targetDate });
    addXP(15, `Updated main target goal: "${title}"`);
  };

  // Calendar Planner
  const addCalendarEvent = (event) => {
    const newEv = {
      id: Math.random().toString(),
      ...event
    };
    setCalendar(prev => [newEv, ...prev]);
    addXP(10, `Scheduled Event: ${event.title}`);
  };

  const deleteCalendarEvent = (id) => {
    setCalendar(prev => prev.filter(item => item.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
      notifications, markAllNotificationsRead,
      addXP, loginUser, logoutUser,
      customPages, createCustomPage, updateCustomPage, deleteCustomPage, togglePageTask,
      themeMode, setThemeMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
