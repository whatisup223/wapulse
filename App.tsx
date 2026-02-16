import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import Contacts from './pages/Contacts';
import Connection from './pages/Connection';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/Users/UsersList';
import AdminSubscriptions from './pages/admin/Subscriptions/SubscriptionsList';
import AdminBranding from './pages/admin/Branding/BrandingSettings';
import AdminContent from './pages/admin/Content/ContentManager';

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'ar' | 'en') || 'ar';
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleLanguage = (lang: 'ar' | 'en') => setLanguage(lang);

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <LandingPage
              isDarkMode={isDarkMode}
              onThemeToggle={toggleTheme}
              language={language}
              onLanguageChange={toggleLanguage}
              onGetStarted={handleGetStarted}
            />
          }
        />
        <Route
          path="/login"
          element={
            <Login
              language={language}
              onLanguageChange={toggleLanguage}
              isDarkMode={isDarkMode}
              onThemeToggle={toggleTheme}
            />
          }
        />
        <Route
          path="/register"
          element={
            <Register
              language={language}
              onLanguageChange={toggleLanguage}
              isDarkMode={isDarkMode}
              onThemeToggle={toggleTheme}
            />
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ForgotPassword
              language={language}
              onLanguageChange={toggleLanguage}
              isDarkMode={isDarkMode}
              onThemeToggle={toggleTheme}
            />
          }
        />

        {/* User Dashboard Routes - Wrapped in MainLayout */}
        <Route
          element={
            <MainLayout
              language={language}
              onLanguageChange={toggleLanguage}
              isDarkMode={isDarkMode}
              onThemeToggle={toggleTheme}
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard language={language} />} />
          <Route path="/inbox" element={<Inbox language={language} userId="current_user" />} />
          <Route path="/campaigns" element={<Campaigns language={language} />} />
          <Route path="/campaigns/create" element={<CreateCampaign language={language} />} />
          <Route path="/contacts" element={<Contacts language={language} />} />
          <Route
            path="/connection"
            element={
              <Connection
                language={language}
                userId="current_user"
                sessions={[]}
                onAddSession={() => { }}
                onDeleteSession={() => { }}
                onRefreshSession={() => { }}
              />
            }
          />
          <Route path="/analytics" element={<Analytics language={language} />} />
          <Route
            path="/settings"
            element={
              <Settings
                language={language}
                onLanguageChange={toggleLanguage}
                isDarkMode={isDarkMode}
                onThemeToggle={toggleTheme}
                user={{ name: 'Demo User', email: 'user@example.com', company: 'Demo Co', phone: '123456789' }}
                onProfileUpdate={() => { }}
              />
            }
          />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/admin/branding" element={<AdminBranding />} />
        <Route path="/admin/content" element={<AdminContent />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
