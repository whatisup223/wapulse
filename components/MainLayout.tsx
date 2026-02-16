import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
    language: 'en' | 'ar';
    onLanguageChange: (lang: 'en' | 'ar') => void;
    isDarkMode: boolean;
    onThemeToggle: () => void;
    user?: any;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    language,
    onLanguageChange,
    isDarkMode,
    onThemeToggle,
    user
}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className={`flex min-h-screen ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                language={language}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col transition-all duration-300">
                <Header
                    isDarkMode={isDarkMode}
                    setIsDarkMode={() => onThemeToggle()}
                    language={language}
                    setLanguage={onLanguageChange}
                    userName={user?.name || 'User'}
                    userRole={user?.role || 'Member'}
                    onLogout={handleLogout}
                    onMenuClick={() => setIsMobileOpen(true)}
                />

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
