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

const AppContent = () => {
  const { currentTab, user } = useApp();

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
      case 'analytics': return <Analytics />;
      case 'calendar': return <Calendar />;
      case 'achievements': return <Achievements />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-darkbg text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Workspace viewport */}
      <main className="flex-1 h-screen overflow-y-auto px-6 md:px-10 py-8 relative">
        {renderActivePage()}
      </main>

      {/* Persistent global floating AI Coach */}
      <AICoach />

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
