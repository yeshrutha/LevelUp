import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { RankPromotion } from './components/RankPromotion';
import { AICoach } from './components/AICoach';

// Page Imports
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Habits } from './pages/Habits';
import { Analytics } from './pages/Analytics';
import { Calendar } from './pages/Calendar';
import { Achievements } from './pages/Achievements';
import { NotionPage } from './pages/NotionPage';
import { Settings } from './pages/Settings';
import { Alerts } from './pages/Alerts';
import AIPlanner from './pages/AIPlanner';

// Toast Notification Item
const ToastItem = ({ toast }) => {
  return (
    <div className="flex flex-col p-3.5 rounded-lg border bg-slate-950/95 border-white/10 shadow-glow-accent backdrop-blur-md min-w-[270px] select-none animate-slide-in relative overflow-hidden pointer-events-auto">
      {/* Glow progress bar bottom */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${
        toast.type === 'rank' ? 'from-rose-500 to-violet-600 animate-pulse' :
        toast.type === 'xp' ? 'from-amber-400 to-orange-500' :
        'from-cyan-400 to-primary'
      } animate-shrink-progress`} style={{ width: '100%' }} />

      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          toast.type === 'rank' ? 'bg-rose-500 animate-ping' :
          toast.type === 'xp' ? 'bg-amber-400' :
          'bg-cyan-400'
        }`} />
        <span className="text-[10px] font-black font-futuristic uppercase tracking-widest text-white">
          {toast.title}
        </span>
      </div>
      <p className="text-[9px] text-slate-400 mt-1 uppercase font-display leading-relaxed">
        {toast.body}
      </p>
    </div>
  );
};

const AppContent = () => {
  const { currentTab, user, toasts } = useApp();

  // Route/Tab switcher logic
  if (currentTab === 'login' || !user) {
    return <Login />;
  }

  const renderActivePage = () => {
    if (currentTab.startsWith('page_')) {
      const pageId = currentTab.replace('page_', '');
      return <NotionPage pageId={pageId} />;
    }

    switch (currentTab) {
      case 'dashboard': return <Dashboard />;
      case 'habits': return <Habits />;
      case 'calendar': return <Calendar />;
      case 'ai_planner': return <AIPlanner />;
      case 'analytics': return <Analytics />;
      case 'achievements': return <Achievements />;
      case 'settings': return <Settings />;
      case 'alerts': return <Alerts />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-darkbg text-slate-100 select-none overflow-hidden relative">
      
      {/* Mock Desktop Window Frame controls */}
      <div className="h-7 w-full bg-slate-950/80 border-b border-white/5 flex items-center justify-between px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-futuristic shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-glow-accent animate-pulse" />
          <span>LEVELUP.OS_DESKTOP_CLIENT v1.0.4</span>
        </div>
        
        {/* Mock Windows Header controls */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-0.5 bg-slate-600 hover:bg-slate-400 cursor-pointer transition-colors" />
          <div className="w-2.5 h-2.5 border border-slate-600 hover:border-slate-400 cursor-pointer transition-colors" />
          <div className="w-2.5 h-2.5 text-slate-600 hover:text-rose-500 cursor-pointer flex items-center justify-center font-display text-[8px] transition-colors leading-none">✕</div>
        </div>
      </div>

      {/* Main App Workspace Shell */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Workspace viewport */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8 relative">
          {renderActivePage()}
        </main>
        
        {/* Floating Toasts container */}
        <div className="fixed top-10 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </div>
      </div>

      {/* Full-screen cinematic Rank Promotion Overlay popup */}
      <RankPromotion />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
