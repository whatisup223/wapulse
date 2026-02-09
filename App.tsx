
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Campaigns from './pages/Campaigns';
import Contacts from './pages/Contacts';
import Connection from './pages/Connection';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import LandingPage from './pages/LandingPage';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('wapulse_theme');
    return saved === 'dark';
  });
  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    const saved = localStorage.getItem('wapulse_language');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  // Initialize auth state based on URL hash to prevent flash
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const hash = window.location.hash.slice(1) || 'landing';
    const validPages: Page[] = ['dashboard', 'inbox', 'campaigns', 'contacts', 'connection', 'analytics', 'settings'];
    return validPages.includes(hash as Page);
  });

  const [showLanding, setShowLanding] = useState(() => {
    const hash = window.location.hash.slice(1) || 'landing';
    return hash === 'landing';
  });

  // Track current hash for auth page navigation
  const [currentHash, setCurrentHash] = useState(() => window.location.hash.slice(1) || 'landing');
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

  // Track if this is the initial load to prevent hash override
  const isInitialLoad = useRef(true);

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

    // Mark initial load as complete after all effects have run
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 0);
  }, []);

  // Listen for hash changes to update the view without page refresh
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'landing';
      setCurrentHash(hash); // Update hash state to trigger re-render

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
        }
      }
    };

    // Add event listener for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update URL hash when page/auth state changes (skip on initial load)
  useEffect(() => {
    // Don't update hash on initial load - let the hash from URL take precedence
    if (isInitialLoad.current) return;

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

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('wapulse_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('wapulse_language', language);
  }, [language]);

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

  // Show Auth Pages (Login/Register/Forgot Password)
  if (!isAuthenticated) {
    if (currentHash === 'register') {
      return (
        <Register
          onRegister={() => setIsAuthenticated(true)}
          language={language}
          onLanguageChange={setLanguage}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          onBackToHome={() => setShowLanding(true)}
          onNavigateToLogin={() => window.location.hash = '#login'}
        />
      );
    }

    if (currentHash === 'forgot-password') {
      return (
        <ForgotPassword
          language={language}
          onLanguageChange={setLanguage}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          onBackToHome={() => setShowLanding(true)}
          onNavigateToLogin={() => window.location.hash = '#login'}
        />
      );
    }

    // Default to Login
    return (
      <Login
        onLogin={() => setIsAuthenticated(true)}
        language={language}
        onLanguageChange={setLanguage}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        onBackToHome={() => setShowLanding(true)}
        onNavigateToRegister={() => window.location.hash = '#register'}
        onNavigateToForgotPassword={() => window.location.hash = '#forgot-password'}
      />
    );
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
    <div className={`dashboard-app flex h-screen overflow-hidden theme-transition ${isDarkMode ? 'bg-[#020617] dark' : 'bg-slate-50'}`}>
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

        <main className={`flex-1 overflow-y-auto scrollbar-hide theme-transition ${isDarkMode ? '' : 'bg-slate-50'}`}>
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
