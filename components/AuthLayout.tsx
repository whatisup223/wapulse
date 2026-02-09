
import React from 'react';
import { MessageSquare, Home, Globe, Moon, Sun } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    language: 'en' | 'ar';
    onLanguageChange: (lang: 'en' | 'ar') => void;
    isDarkMode: boolean;
    onThemeToggle: () => void;
    onBackToHome: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    language,
    onLanguageChange,
    isDarkMode,
    onThemeToggle,
    onBackToHome,
}) => {
    const isRtl = language === 'ar';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
            {/* Left Panel - Branding */}
            <div className="w-full md:w-1/2 bg-[#128C7E] p-12 flex flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                            <MessageSquare className="text-[#128C7E] w-6 h-6" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight">WAPulse</span>
                    </div>

                    <div className="space-y-6 max-w-md">
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            {isRtl ? 'إدارة محادثات واتساب لعملك بذكاء.' : 'Manage WhatsApp business conversations intelligently.'}
                        </h1>
                        <p className="text-emerald-50 text-lg opacity-80">
                            {isRtl
                                ? 'انضم إلى أكثر من 5000 شركة تستخدم نظامنا لتحسين تواصلها مع العملاء وزيادة المبيعات.'
                                : 'Join 5,000+ businesses using our platform to streamline customer support and scale marketing.'}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-12 mt-12 md:mt-0">
                    <div>
                        <p className="text-2xl font-bold">99.9%</p>
                        <p className="text-xs opacity-70 uppercase tracking-widest">{isRtl ? 'وقت التشغيل' : 'Uptime'}</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">1M+</p>
                        <p className="text-xs opacity-70 uppercase tracking-widest">{isRtl ? 'رسالة يومية' : 'Daily Messages'}</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form Content */}
            <div className="w-full md:w-1/2 bg-white dark:bg-slate-900 flex items-center justify-center p-8 md:p-12 relative">
                {/* Floating Controls - Positioned in the form panel */}
                <div className={`absolute top-6 z-50 flex items-center gap-3 ${isRtl ? 'right-6' : 'left-6'}`}>
                    {/* Back to Home */}
                    <button
                        onClick={onBackToHome}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                    >
                        <Home className="w-5 h-5" />
                        <span className="hidden sm:inline font-semibold">{isRtl ? 'الرئيسية' : 'Home'}</span>
                    </button>

                    {/* Separator */}
                    <div className="w-px h-8 bg-slate-300 dark:bg-slate-700"></div>

                    {/* Language Toggle */}
                    <button
                        onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                        title={isRtl ? 'تغيير اللغة' : 'Change Language'}
                    >
                        <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={onThemeToggle}
                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                        title={isRtl ? 'تبديل الوضع' : 'Toggle Theme'}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
