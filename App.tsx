
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
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userId, setUserId] = useState<string>('default'); // Align with existing WAHA session

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} language={language} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard language={language} />;
      case 'inbox': return <Inbox language={language} userId={userId} />;
      case 'campaigns': return <Campaigns language={language} />;
      case 'contacts': return <Contacts language={language} />;
      case 'connection': return <Connection language={language} userId={userId} />;
      case 'analytics': return <Analytics language={language} />;
      case 'settings': return <Settings language={language} />;
      default: return <Dashboard language={language} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden theme-transition ${isDarkMode ? 'bg-[#020617]' : 'bg-white'}`}>
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
