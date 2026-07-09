import React, { useState } from 'react';
import { useApp, RANK_COLORS } from '../context/AppContext';
import { RankBadgeSVG } from './RankPromotion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Bell,
  Award,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    user, 
    currentTab, 
    setCurrentTab, 
    notifications, 
    markAllNotificationsRead,
    logoutUser,
    customPages,
    createCustomPage
  } = useApp();

  if (!user) return null;
  
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Habit Tracker', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar Planner', icon: CalendarIcon },
    { id: 'analytics', label: 'Analytics Suite', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div 
      className={`relative h-screen bg-slate-950/80 border-r border-white/10 flex flex-col transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-6 border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => collapsed && setCollapsed(false)}
            className={`w-8 h-8 rounded bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-futuristic font-black text-slate-950 text-lg shadow-glow-accent ${
              collapsed ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-default'
            }`}
            title={collapsed ? "Expand Sidebar" : ""}
          >
            L
          </button>
          {!collapsed && (
            <span className="font-futuristic font-bold text-lg text-white tracking-widest text-neon-cyan">
              LEVELUP
            </span>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)}
            className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* User Mini Profile */}
      <div className={`p-4 border-b border-white/10 flex items-center gap-3 bg-slate-950/20 ${collapsed ? 'justify-center' : ''}`}>
        <div className="relative group">
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full border-2 border-primary/40 group-hover:border-accent/80 transition-colors"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
        </div>
        
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-sm text-slate-100 truncate">{user.displayName}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] uppercase font-futuristic text-cyan-400 font-medium">Lvl {user.level}</span>
              <span className="text-slate-600 text-[10px]">•</span>
              <span className="text-[10px] font-semibold text-slate-400 font-display truncate max-w-[80px]">{user.rank}</span>
            </div>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider font-display transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-primary/20 text-white border border-primary/30 shadow-glow-primary' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon size={18} className={isActive ? 'text-accent' : ''} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Notion Workspaces Section */}
        <div className="pt-4 border-t border-white/5 mt-4 px-3 space-y-2">
          {!collapsed ? (
            <div className="flex items-center justify-between text-[10px] uppercase font-futuristic text-slate-500 font-bold tracking-widest mb-1 px-1">
              <span>Notion Pages</span>
              <button 
                onClick={() => createCustomPage('New Page', '📝', 14)}
                className="hover:text-white text-slate-500 transition-colors p-0.5 rounded cursor-pointer text-sm font-bold"
                title="Create Workspace Page"
              >
                +
              </button>
            </div>
          ) : (
            <div className="flex justify-center mb-1">
              <button 
                onClick={() => createCustomPage('New Page', '📝', 14)}
                className="hover:text-accent text-slate-500 transition-colors p-1 bg-slate-900 border border-white/5 rounded-full flex items-center justify-center cursor-pointer"
                title="Create Workspace Page"
              >
                +
              </button>
            </div>
          )}
          
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {customPages.map(page => {
              const isActive = currentTab === `page_${page.id}`;
              return (
                <button
                  key={page.id}
                  onClick={() => setCurrentTab(`page_${page.id}`)}
                  className={`w-full flex items-center rounded text-xs font-semibold font-display transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-white/10 text-white border border-white/15' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  } ${collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'}`}
                  title={collapsed ? page.title : ''}
                >
                  <span className="text-sm shrink-0">{page.icon}</span>
                  {!collapsed && <span className="truncate flex-1 text-left">{page.title}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Actions (Notifications + Logout) */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-2 bg-slate-950/20">
        
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              if (!showNotifMenu) markAllNotificationsRead();
            }}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="relative">
              <Bell size={18} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[8px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </div>
              )}
            </div>
            {!collapsed && <span>Alert Center</span>}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute bottom-12 left-2 w-72 glass-panel rounded-lg shadow-2xl border-white/15 p-3 space-y-2 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                <span className="text-[10px] uppercase font-futuristic text-cyan-400 font-bold">Log Alerts</span>
                <button 
                  onClick={() => setShowNotifMenu(false)}
                  className="text-[9px] text-slate-500 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-[10px] text-slate-500 text-center py-4">No new notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-2 rounded bg-black/30 border border-white/5">
                      <h5 className="text-[11px] font-bold text-slate-200">{n.title}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                      <span className="block text-[8px] text-slate-500 text-right mt-1">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCurrentTab('settings')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            currentTab === 'settings' 
              ? 'bg-primary/20 text-white border border-primary/30 shadow-glow-primary' 
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings size={18} className={currentTab === 'settings' ? 'text-accent' : ''} />
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          onClick={() => logoutUser()}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};
