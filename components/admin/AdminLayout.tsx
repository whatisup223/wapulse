import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, CreditCard, Palette, FileText,
    Settings, LogOut, Menu, X, Moon, Sun
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
        { path: '/admin/users', icon: Users, label: 'المستخدمين' },
        { path: '/admin/subscriptions', icon: CreditCard, label: 'الاشتراكات' },
        { path: '/admin/branding', icon: Palette, label: 'هوية الموقع' },
        { path: '/admin/content', icon: FileText, label: 'المحتوى' },
        { path: '/admin/settings', icon: Settings, label: 'الإعدادات' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'dark' : ''}`} dir="rtl">
            <div className="flex h-screen bg-slate-50 dark:bg-[#020617]">
                {/* Sidebar */}
                <aside
                    className={`${sidebarOpen ? 'w-64' : 'w-20'
                        } bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 transition-all duration-300 flex flex-col`}
                >
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/10">
                        {sidebarOpen && (
                            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                WaPulse Admin
                            </h1>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                        <button
                            onClick={toggleDarkMode}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            {sidebarOpen && <span>الوضع {darkMode ? 'النهاري' : 'الليلي'}</span>}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            {sidebarOpen && <span>تسجيل الخروج</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {/* Header */}
                    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 px-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {menuItems.find(item => item.path === location.pathname)?.label || 'لوحة التحكم'}
                        </h2>

                        <div className="flex items-center gap-4">
                            <div className="text-left">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">المسؤول</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">admin@wapulse.com</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                A
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
