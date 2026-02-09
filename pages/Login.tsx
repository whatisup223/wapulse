
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

interface LoginProps {
    onLogin: () => void;
    language: 'en' | 'ar';
    onLanguageChange: (lang: 'en' | 'ar') => void;
    isDarkMode: boolean;
    onThemeToggle: () => void;
    onBackToHome: () => void;
    onNavigateToRegister: () => void;
    onNavigateToForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({
    onLogin,
    language,
    onLanguageChange,
    isDarkMode,
    onThemeToggle,
    onBackToHome,
    onNavigateToRegister,
    onNavigateToForgotPassword,
}) => {
    const isRtl = language === 'ar';
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthLayout
            language={language}
            onLanguageChange={onLanguageChange}
            isDarkMode={isDarkMode}
            onThemeToggle={onThemeToggle}
            onBackToHome={onBackToHome}
        >
            <div className="w-full max-w-md space-y-8">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {isRtl ? 'تسجيل الدخول' : 'Welcome Back'}
                    </h2>
                    <p className="text-slate-500 mt-2">
                        {isRtl ? 'أدخل تفاصيل حسابك للوصول إلى لوحة التحكم' : 'Enter your credentials to access your dashboard.'}
                    </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                        <div className="relative">
                            <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                            <input
                                type="email"
                                className={`w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#128C7E] transition-all`}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'كلمة المرور' : 'Password'}</label>
                            <button
                                type="button"
                                onClick={onNavigateToForgotPassword}
                                className="text-xs font-bold text-[#128C7E] hover:underline"
                            >
                                {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={`w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl ${isRtl ? 'pr-11 pl-12' : 'pl-11 pr-12'} py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#128C7E] transition-all`}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300`}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        {isRtl ? 'تسجيل الدخول' : 'Sign In'}
                        {isRtl ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="pt-4 text-center">
                    <p className="text-sm text-slate-500">
                        {isRtl ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                        <button
                            onClick={onNavigateToRegister}
                            className="font-bold text-[#128C7E] hover:underline"
                        >
                            {isRtl ? 'سجل الآن' : 'Register now'}
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Login;
