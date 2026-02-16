import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import toast from 'react-hot-toast';

interface RegisterProps {
    language: 'en' | 'ar';
    onLanguageChange: (lang: 'en' | 'ar') => void;
    isDarkMode: boolean;
    onThemeToggle: () => void;
}

const Register: React.FC<RegisterProps> = ({
    language,
    onLanguageChange,
    isDarkMode,
    onThemeToggle,
}) => {
    const isRtl = language === 'ar';
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                toast.success(isRtl ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully');
                navigate('/dashboard');
            } else {
                setError(data.message || (isRtl ? 'فشل إنشاء الحساب' : 'Registration failed'));
            }
        } catch (err) {
            setError(isRtl ? 'حدث خطأ في الاتصال' : 'Connection error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            language={language}
            onLanguageChange={onLanguageChange}
            isDarkMode={isDarkMode}
            onThemeToggle={onThemeToggle}
            onBackToHome={() => navigate('/')}
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

                {error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                        <div className="relative">
                            <User className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#128C7E] transition-all`}
                                placeholder="A. Mansour"
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        disabled={isLoading}
                        className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isRtl ? 'إنشاء حساب' : 'Create Account'}
                                {isRtl ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-4 text-center">
                    <p className="text-sm text-slate-500">
                        {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                        <button
                            onClick={() => navigate('/login')}
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
