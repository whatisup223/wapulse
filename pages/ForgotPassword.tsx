import React from 'react';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import toast from 'react-hot-toast';

interface ForgotPasswordProps {
    language: 'en' | 'ar';
    onLanguageChange: (lang: 'en' | 'ar') => void;
    isDarkMode: boolean;
    onThemeToggle: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
    language,
    onLanguageChange,
    isDarkMode,
    onThemeToggle,
}) => {
    const isRtl = language === 'ar';
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success(isRtl ? 'تم إرسال رابط إعادة التعيين!' : 'Reset link sent!');
        setTimeout(() => navigate('/login'), 2000);
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
                        {isRtl ? 'استعادة كلمة المرور' : 'Reset Password'}
                    </h2>
                    <p className="text-slate-500 mt-2">
                        {isRtl ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور' : 'Enter your email and we\'ll send you a reset link.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    <button
                        type="submit"
                        className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        {isRtl ? 'إرسال رابط الاستعادة' : 'Send Reset Link'}
                        {isRtl ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="pt-4 text-center">
                    <p className="text-sm text-slate-500">
                        {isRtl ? 'تذكرت كلمة المرور؟' : 'Remember your password?'}{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="font-bold text-[#128C7E] hover:underline"
                        >
                            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
