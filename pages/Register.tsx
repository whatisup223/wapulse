
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

interface RegisterProps {
    onRegister: () => void;
    language: 'en' | 'ar';
    onLanguageChange: (lang: 'en' | 'ar') => void;
    isDarkMode: boolean;
    onThemeToggle: () => void;
    onBackToHome: () => void;
    onNavigateToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({
    onRegister,
    language,
    onLanguageChange,
    isDarkMode,
    onThemeToggle,
    onBackToHome,
    onNavigateToLogin,
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
                        {isRtl ? 'إنشاء حساب جديد' : 'Create an Account'}
                    </h2>
                    <p className="text-slate-500 mt-2">
                        {isRtl ? 'ابدأ تجربتك المجانية لمدة 14 يوماً' : 'Start your 14-day free trial today.'}
                    </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onRegister(); }} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                        <div className="relative">
                            <User className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                            <input
                                type="text"
                                className={`w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#128C7E] transition-all`}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

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
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'كلمة المرور' : 'Password'}</label>
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
                        {isRtl ? 'إنشاء حساب' : 'Create Account'}
                        {isRtl ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="pt-4 text-center">
                    <p className="text-sm text-slate-500">
                        {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                        <button
                            onClick={onNavigateToLogin}
                            className="font-bold text-[#128C7E] hover:underline"
                        >
                            {isRtl ? 'تسجيل الدخول' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Register;
