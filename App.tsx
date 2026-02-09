
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Campaigns from './pages/Campaigns';
import Contacts from './pages/Contacts';
import Connection from './pages/Connection';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import LandingPage from './pages/LandingPage';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [sessions, setSessions] = useState<string[]>(() => {
    const saved = localStorage.getItem('wapulse_sessions');
    return saved ? JSON.parse(saved) : [`user_${Date.now()}`];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('wapulse_active_session');
    const savedSessions = localStorage.getItem('wapulse_sessions');
    const parsedSessions = savedSessions ? JSON.parse(savedSessions) : [`user_${Date.now()}`];

    return (saved && parsedSessions.includes(saved)) ? saved : parsedSessions[0];
  });

  // Sync URL hash with current route on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1) || 'landing';

    // Check if it's an auth route
    if (['landing', 'login', 'register', 'forgot-password'].includes(hash)) {
      setShowLanding(hash === 'landing');
      setIsAuthenticated(false);
    } else {
      // It's a dashboard route
      const validPages: Page[] = ['dashboard', 'inbox', 'campaigns', 'contacts', 'connection', 'analytics', 'settings'];
      if (validPages.includes(hash as Page)) {
        setCurrentPage(hash as Page);
        setIsAuthenticated(true);
        setShowLanding(false);
      } else {
        window.location.hash = '#landing';
      }
    }
  }, []);

  // Update URL hash when page/auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      window.location.hash = `#${currentPage}`;
    } else if (showLanding) {
      window.location.hash = '#landing';
    } else {
      window.location.hash = '#login';
    }
  }, [currentPage, isAuthenticated, showLanding]);

  useEffect(() => {
    localStorage.setItem('wapulse_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('wapulse_active_session', activeSessionId);
  }, [activeSessionId]);

  const addSession = () => {
    const newId = `user_${Date.now()}`;
    setSessions(prev => [...prev, newId]);
    setActiveSessionId(newId);
  };

  const switchSession = (id: string) => {
    setActiveSessionId(id);
  };

  const removeSession = (id: string) => {
    const newSessions = sessions.filter(s => s !== id);
    if (newSessions.length === 0) {
      setSessions([]);
      setActiveSessionId(''); // No active session
    } else {
      setSessions(newSessions);
      if (activeSessionId === id) {
        setActiveSessionId(newSessions[0]);
      }
    }
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    console.log('App.tsx: isDarkMode changed to:', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      console.log('App.tsx: Added dark class to document');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('App.tsx: Removed dark class from document');
    }
  }, [isDarkMode]);

  // Show Landing Page
  if (!isAuthenticated && showLanding) {
    return (
      <LandingPage
        onGetStarted={() => setShowLanding(false)}
        language={language}
        onLanguageChange={setLanguage}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  // Show Auth Page (Login/Register/Forgot Password)
  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} language={language} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard language={language} />;
      case 'inbox': return <Inbox language={language} userId={activeSessionId} />;
      case 'campaigns': return <Campaigns language={language} />;
      case 'contacts': return <Contacts language={language} />;
      case 'connection': return (
        <Connection
          language={language}
          userId={activeSessionId}
          sessions={sessions}
          onAddSession={addSession}
          onSwitchSession={switchSession}
          onRemoveSession={removeSession}
        />
      );
      case 'analytics': return <Analytics language={language} />;
      case 'settings': return <Settings language={language} />;
      default: return <Dashboard language={language} />;
    }
  };

  return (
    <div className={`dashboard-app flex h-screen overflow-hidden theme-transition ${isDarkMode ? 'bg-[#020617] dark' : 'bg-white'}`}>
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={(page) => {
          setCurrentPage(page);
          setIsMobileSidebarOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        // Fix: Changed setIsCollapsed to use the correct state setter setIsSidebarCollapsed
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        language={language}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          language={language}
          setLanguage={setLanguage}
          onLogout={() => setIsAuthenticated(false)}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <main className={`flex-1 overflow-y-auto scrollbar-hide theme-transition ${isDarkMode ? '' : 'bg-white'}`}>
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
