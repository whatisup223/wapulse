
import React, { useState } from 'react';
import { MessageSquare, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
  language: 'en' | 'ar';
}

const Auth: React.FC<AuthProps> = ({ onLogin, language }) => {
  const isRtl = language === 'ar';
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
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

      <div className="w-full md:w-1/2 bg-white dark:bg-slate-900 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {isForgotPassword
                ? (isRtl ? 'استعادة كلمة المرور' : 'Reset Password')
                : isRegister
                  ? (isRtl ? 'إنشاء حساب جديد' : 'Create an Account')
                  : (isRtl ? 'تسجيل الدخول' : 'Welcome Back')}
            </h2>
            <p className="text-slate-500 mt-2">
              {isForgotPassword
                ? (isRtl ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور' : 'Enter your email and we\'ll send you a reset link.')
                : isRegister
                  ? (isRtl ? 'ابدأ تجربتك المجانية لمدة 14 يوماً' : 'Start your 14-day free trial today.')
                  : (isRtl ? 'أدخل تفاصيل حسابك للوصول إلى لوحة التحكم' : 'Enter your credentials to access your dashboard.')}
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); isForgotPassword ? alert(isRtl ? 'تم إرسال رابط إعادة التعيين!' : 'Reset link sent!') : onLogin(); }} className="space-y-6">
            {isRegister && !isForgotPassword && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#128C7E] transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <div className="relative">
                <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                <input
                  type="email"
                  className={`w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 outline-none focus:ring-2 focus:ring-[#128C7E] transition-all`}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{isRtl ? 'كلمة المرور' : 'Password'}</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs font-bold text-[#128C7E] hover:underline"
                    >
                      {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl ${isRtl ? 'pr-11 pl-12' : 'pl-11 pr-12'} py-3 outline-none focus:ring-2 focus:ring-[#128C7E] transition-all`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              {isForgotPassword
                ? (isRtl ? 'إرسال رابط الاستعادة' : 'Send Reset Link')
                : isRegister
                  ? (isRtl ? 'إنشاء حساب' : 'Create Account')
                  : (isRtl ? 'تسجيل الدخول' : 'Sign In')}
              {isRtl ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-sm text-slate-500">
              {isForgotPassword
                ? (
                  <>
                    {isRtl ? 'تذكرت كلمة المرور؟' : 'Remember your password?'}{' '}
                    <button
                      onClick={() => setIsForgotPassword(false)}
                      className="font-bold text-[#128C7E] hover:underline"
                    >
                      {isRtl ? 'تسجيل الدخول' : 'Sign In'}
                    </button>
                  </>
                )
                : isRegister
                  ? (
                    <>
                      {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                      <button
                        onClick={() => setIsRegister(false)}
                        className="font-bold text-[#128C7E] hover:underline"
                      >
                        {isRtl ? 'تسجيل الدخول' : 'Login'}
                      </button>
                    </>
                  )
                  : (
                    <>
                      {isRtl ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                      <button
                        onClick={() => setIsRegister(true)}
                        className="font-bold text-[#128C7E] hover:underline"
                      >
                        {isRtl ? 'سجل الآن' : 'Register now'}
                      </button>
                    </>
                  )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
