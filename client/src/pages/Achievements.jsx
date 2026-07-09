import React from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Shield, Award, Star, CheckSquare, Zap, Layout, Calendar } from 'lucide-react';

export const Achievements = () => {
  const { user, customPages, habitList, calendar } = useApp();
  const currentUnlocks = user?.unlockedAchievements || [];

  const achievementList = [
    {
      id: 'lvl_2',
      title: 'Growth Initiate',
      description: 'Progress your character profile to Level 2.',
      requirement: 'Player Level >= 2',
      unlocked: currentUnlocks.includes('lvl_2'),
      icon: Shield
    },
    {
      id: 'lvl_5',
      title: 'Growth Master',
      description: 'Progress your character profile to Level 5.',
      requirement: 'Player Level >= 5',
      unlocked: currentUnlocks.includes('lvl_5'),
      icon: Trophy
    },
    {
      id: 'xp_silver',
      title: 'Rank Ascent',
      description: 'Earn 300+ XP to ascend your rank badge.',
      requirement: 'Earn 300+ XP points',
      unlocked: currentUnlocks.includes('xp_silver'),
      icon: Star
    },
    {
      id: 'habit_today',
      title: 'Daily Discipline',
      description: 'Check off your first habit routine today.',
      requirement: 'Check off 1 habit today',
      unlocked: currentUnlocks.includes('habit_today'),
      icon: CheckSquare
    },
    {
      id: 'habit_pioneer',
      title: 'Atomic Habits',
      description: 'Customize your tracker by adding 4+ habit targets.',
      requirement: 'Habit list count >= 4',
      unlocked: currentUnlocks.includes('habit_pioneer'),
      icon: Zap
    },
    {
      id: 'page_first',
      title: 'Workspace Architect',
      description: 'Create your first custom Notion workspace page.',
      requirement: 'Create 1+ Notion Pages',
      unlocked: currentUnlocks.includes('page_first'),
      icon: Layout
    },
    {
      id: 'page_comp',
      title: 'Milestone Achieved',
      description: 'Complete 100% of tasks across any term schedule page.',
      requirement: '1 custom page fully completed',
      unlocked: currentUnlocks.includes('page_comp'),
      icon: Trophy
    },
    {
      id: 'cal_first',
      title: 'Time Planner',
      description: 'Schedule a target milestone event in the Calendar.',
      requirement: 'Schedule 1+ Calendar events',
      unlocked: currentUnlocks.includes('cal_first'),
      icon: Calendar
    }
  ];

  const unlockedCount = achievementList.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-futuristic tracking-wide">
            Growth Achievements
          </h1>
          <p className="text-[10px] text-slate-400 font-display uppercase tracking-widest mt-1">
            Unlock Trophies as you build habits, plan schedules, and complete workspaces
          </p>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-400/20 px-3.5 py-1.5 rounded-lg text-xs font-bold font-futuristic text-accent uppercase tracking-widest">
          {unlockedCount} / {achievementList.length} Unlocked
        </div>
      </div>

      {/* Trophies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievementList.map((ach) => {
          const Icon = ach.icon;
          
          return (
            <div 
              key={ach.id}
              className={`glass-panel p-5 rounded-xl border flex flex-col justify-between h-44 transition-all duration-300 ${
                ach.unlocked 
                  ? 'border-cyan-400/30 bg-gradient-to-br from-cyan-950/10 to-indigo-950/10 shadow-glow-accent' 
                  : 'border-white/5 opacity-40 bg-slate-950/40'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-lg border ${
                  ach.unlocked 
                    ? 'bg-cyan-500/20 border-cyan-400/30 text-accent animate-pulse' 
                    : 'bg-slate-900 border-white/5 text-slate-600'
                }`}>
                  <Icon size={18} />
                </div>
                
                <span className={`text-[8px] font-futuristic font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  ach.unlocked ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900 text-slate-500'
                }`}>
                  {ach.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              <div>
                <h3 className={`text-xs font-bold ${ach.unlocked ? 'text-slate-100' : 'text-slate-500'}`}>
                  {ach.title}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-display">
                  {ach.description}
                </p>
                <span className="block text-[8px] text-slate-500 font-futuristic uppercase mt-2">
                  Req: {ach.requirement}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
