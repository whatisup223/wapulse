import React, { useState } from 'react';
import { User, Shield, Bell, Zap, Save, Globe, Moon, Lock, Smartphone, Mail, CheckCircle, Calendar } from 'lucide-react';

interface SettingsProps {
  language: 'en' | 'ar';
}

const Settings: React.FC<SettingsProps> = ({ language }) => {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // Mock State for Settings
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    darkMode: false,
    language: 'ar',
    twoFactor: true,
    autoReply: false,
    readReceipts: true,
    autoReplyEmails: false,
    scheduleSocialPosts: false
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Show toast or success message logic here
    }, 1500);
  };

  const tabs = [
    { id: 'general', label: isRtl ? 'عام' : 'General', icon: User },
    { id: 'security', label: isRtl ? 'الأمان' : 'Security', icon: Shield },
    { id: 'notifications', label: isRtl ? 'الإشعارات' : 'Notifications', icon: Bell },
    { id: 'automation', label: isRtl ? 'الأتمتة' : 'Automation', icon: Zap },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-full page-enter">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 dark:text-white mb-2">{isRtl ? 'الإعدادات' : 'Settings'}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{isRtl ? 'تحكم في تفضيلات حسابك وتخصيص تجربتك.' : 'Manage your account preferences and customize your experience.'}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 border border-slate-100 dark:border-white/5 shadow-sm">
            <nav className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-white text-center shadow-lg shadow-emerald-500/20">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-lg mb-1">{isRtl ? 'تطبيق الموبايل' : 'Mobile App'}</h4>
            <p className="text-emerald-100 text-sm mb-4 opacity-90">{isRtl ? 'قريباً! حمل تطبيقنا لإدارة حسابك من أي مكان.' : 'Coming Soon! Download our app to manage your account on the go.'}</p>
            <button className="bg-white text-emerald-600 px-6 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-emerald-50 transition-colors w-full">
              {isRtl ? 'انضم للقائمة' : 'Join Waitlist'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">

          {/* General Section */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm">
                <h3 className="text-xl font-[900] text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <User className="w-5 h-5" />
                  </span>
                  {isRtl ? 'المعلومات الأساسية' : 'Basic Information'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">{isRtl ? 'اسم الشركة' : 'Company Name'}</label>
                    <input type="text" defaultValue="Marketation Co." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <input type="email" defaultValue="admin@marketation.sa" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm">
                <h3 className="text-xl font-[900] text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <Globe className="w-5 h-5" />
                  </span>
                  {isRtl ? 'التفضيلات الإقليمية' : 'Regional Preferences'}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-slate-400">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'الوضع الليلي' : 'Dark Mode'}</h4>
                        <p className="text-xs text-slate-500 font-medium">{isRtl ? 'تقليل إجهاد العين في الإضاءة الخافتة' : 'Reduce eye strain in low light conditions'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle('darkMode')}
                      className={`w-14 h-8 rounded-full transition-all relative ${settings.darkMode ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${settings.darkMode ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm text-slate-400">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'اللغة' : 'Language'}</h4>
                        <p className="text-xs text-slate-500 font-medium">{isRtl ? 'اختر لغة الواجهة المفضلة لديك' : 'Choose your preferred interface language'}</p>
                      </div>
                    </div>
                    <select className="bg-white dark:bg-slate-700 border-none outline-none font-bold text-sm text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                      <option value="ar">العربية (Arabic)</option>
                      <option value="en">English (US)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-[900] text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Shield className="w-5 h-5" />
                </span>
                {isRtl ? 'إعدادات الأمان' : 'Security Settings'}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-xl">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'المصادقة الثنائية (2FA)' : 'Two-Factor Authentication'}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">{isRtl ? 'طبقة حماية إضافية لحسابك' : 'Add an extra layer of security to your account'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('twoFactor')}
                    className={`w-14 h-8 rounded-full transition-all relative ${settings.twoFactor ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${settings.twoFactor ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`} />
                  </button>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-500/10">
                  <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-500" />
                    {isRtl ? 'كلمة المرور' : 'Password'}
                  </h4>
                  <p className="text-sm text-amber-700/80 dark:text-amber-200/60 mb-4 font-medium">
                    {isRtl ? 'تم تغيير كلمة المرور آخر مرة منذ 3 أشهر. يُنصح بتحديثها بشكل دوري.' : 'Last changed 3 months ago. It is recommended to update it periodically.'}
                  </p>
                  <button className="bg-white dark:bg-amber-900/40 text-amber-700 dark:text-amber-100 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all">
                    {isRtl ? 'تغيير كلمة المرور' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-[900] text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Bell className="w-5 h-5" />
                </span>
                {isRtl ? 'إدارة التنبيهات' : 'Notification Preferences'}
              </h3>

              <div className="space-y-2">
                {[
                  { id: 'emailNotifications', label: isRtl ? 'تنبيهات البريد الإلكتروني' : 'Email Notifications', desc: isRtl ? 'استلام ملخصات أسبوعية وتحديثات هامة' : 'Receive weekly digests and important updates', icon: Mail },
                  { id: 'desktopNotifications', label: isRtl ? 'تنبيهات سطح المكتب' : 'Desktop Push Notifications', desc: isRtl ? 'إشعارات فورية عند وصول رسائل جديدة' : 'Instant alerts when new messages arrive', icon: Bell }
                ].map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer" onClick={() => handleToggle(item.id)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{item.label}</h4>
                        <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <div className={`w-14 h-8 rounded-full transition-all relative ${settings[item.id as keyof typeof settings] ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${settings[item.id as keyof typeof settings] ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automation Section */}
          {activeTab === 'automation' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-[900] text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Zap className="w-5 h-5" />
                </span>
                {isRtl ? 'قواعد الأتمتة' : 'Automation Rules'}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 rounded-xl">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'الرد الآلي الذكي' : 'Smart Auto-Reply'}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">{isRtl ? 'تفعيل الردود الجاهزة بناءً على الكلمات المفتاحية' : 'Enable canned responses based on keywords'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('autoReply')}
                    className={`w-14 h-8 rounded-full transition-all relative ${settings.autoReply ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${settings.autoReply ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`} />
                  </button>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                  <p className="text-slate-400 font-bold text-sm mb-4">{isRtl ? 'المزيد من أدوات الأتمتة قريباً...' : 'More automation tools coming soon...'}</p>
                  <button className="px-6 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors" disabled>
                    {isRtl ? 'استكشف سير العمل' : 'Explore Workflows'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
