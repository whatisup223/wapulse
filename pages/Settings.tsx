import React, { useState } from 'react';
import { User, Shield, Bell, Zap, Save, Globe, Moon, Lock, Smartphone, Mail, CheckCircle, Calendar } from 'lucide-react';

interface SettingsProps {
  language: 'en' | 'ar';
  user: any;
  onProfileUpdate: (updatedUser: any) => void;
  isDarkMode: boolean;
  onThemeChange: (dark: boolean) => void;
  onLanguageChange: (lang: 'en' | 'ar') => void;
}

const Settings: React.FC<SettingsProps> = ({ language, user, onProfileUpdate, isDarkMode, onThemeChange, onLanguageChange }) => {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // Real State for Settings - Initialize from user prop and app state
  const [settings, setSettings] = useState({
    companyName: user?.name || 'Marketation Co.',
    adminEmail: user?.email || 'admin@marketation.sa',
    emailNotifications: true,
    desktopNotifications: false,
    darkMode: isDarkMode,
    language: language,
    twoFactor: true,
    autoReply: false,
    readReceipts: true,
    autoReplyEmails: false,
    scheduleSocialPosts: false
  });

  // Sync settings when user changes (login/register)
  React.useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        companyName: user.name,
        adminEmail: user.email
      }));
    }
  }, [user]);

  // Sync theme and language when changed from outside Settings
  React.useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkMode: isDarkMode,
      language: language
    }));
  }, [isDarkMode, language]);

  // Apply theme changes to app when settings.darkMode changes
  React.useEffect(() => {
    if (settings.darkMode !== isDarkMode) {
      onThemeChange(settings.darkMode);
    }
  }, [settings.darkMode]);

  // Apply language changes to app when settings.language changes
  React.useEffect(() => {
    if (settings.language !== language) {
      onLanguageChange(settings.language);
    }
  }, [settings.language]);

  // Fetch settings on mount
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings', {
          headers: user?.id ? { 'X-User-Id': user.id } : {}
        });
        const data = await res.json();
        if (Object.keys(data).length > 0) {
          setSettings(prev => ({
            ...prev,
            ...data,
            // Keep user data from prop as priority
            companyName: user?.name || data.companyName || prev.companyName,
            adminEmail: user?.email || data.adminEmail || prev.adminEmail
          }));
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    if (user?.id) fetchSettings();
  }, [user]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save general settings
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'X-User-Id': user.id } : {})
        },
        body: JSON.stringify(settings)
      });

      // 2. If on general tab, also update the core USER profile in DB
      if (activeTab === 'general') {
        const profileRes = await fetch('/api/settings/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            name: settings.companyName,
            email: settings.adminEmail
          })
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          onProfileUpdate(profileData.user);
        }
      }

      alert(isRtl ? 'تم حفظ التغييرات بنجاح!' : 'Settings saved successfully!');
    } catch (err) {
      alert(isRtl ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError(isRtl ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(isRtl ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError(isRtl ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();

      if (data.success) {
        alert(isRtl ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(data.message || (isRtl ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect'));
      }
    } catch (err) {
      setPasswordError(isRtl ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle 2FA toggle with backend save
  const handle2FAToggle = async () => {
    const newValue = !settings.twoFactor;
    setSettings(prev => ({ ...prev, twoFactor: newValue }));

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'X-User-Id': user.id } : {})
        },
        body: JSON.stringify({ ...settings, twoFactor: newValue })
      });

      alert(isRtl
        ? (newValue ? 'تم تفعيل المصادقة الثنائية' : 'تم إيقاف المصادقة الثنائية')
        : (newValue ? '2FA enabled successfully' : '2FA disabled successfully')
      );
    } catch (err) {
      console.error('Failed to update 2FA', err);
    }
  };

  // Notification Permission State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Check notification permission on mount
  React.useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Handle Email Notifications Toggle
  const handleEmailNotificationToggle = async () => {
    const newValue = !settings.emailNotifications;
    setSettings(prev => ({ ...prev, emailNotifications: newValue }));

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'X-User-Id': user.id } : {})
        },
        body: JSON.stringify({ ...settings, emailNotifications: newValue })
      });

      alert(isRtl
        ? (newValue ? 'تم تفعيل إشعارات البريد الإلكتروني' : 'تم إيقاف إشعارات البريد الإلكتروني')
        : (newValue ? 'Email notifications enabled' : 'Email notifications disabled')
      );
    } catch (err) {
      console.error('Failed to update email notifications', err);
    }
  };

  // Handle Desktop Notifications Toggle
  const handleDesktopNotificationToggle = async () => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      alert(isRtl ? 'متصفحك لا يدعم الإشعارات' : 'Your browser does not support notifications');
      return;
    }

    // If trying to enable, request permission first
    if (!settings.desktopNotifications) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
          // Show test notification
          new Notification(isRtl ? 'تم تفعيل الإشعارات!' : 'Notifications Enabled!', {
            body: isRtl ? 'ستتلقى إشعارات عند وصول رسائل جديدة' : 'You will receive notifications when new messages arrive',
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });

          const newValue = true;
          setSettings(prev => ({ ...prev, desktopNotifications: newValue }));

          await fetch('/api/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(user?.id ? { 'X-User-Id': user.id } : {})
            },
            body: JSON.stringify({ ...settings, desktopNotifications: newValue })
          });
        } else {
          alert(isRtl ? 'يجب السماح بالإشعارات من إعدادات المتصفح' : 'Please allow notifications in your browser settings');
        }
      } catch (err) {
        console.error('Notification permission error:', err);
        alert(isRtl ? 'حدث خطأ في طلب الإذن' : 'Error requesting permission');
      }
    } else {
      // Disabling notifications
      const newValue = false;
      setSettings(prev => ({ ...prev, desktopNotifications: newValue }));

      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(user?.id ? { 'X-User-Id': user.id } : {})
          },
          body: JSON.stringify({ ...settings, desktopNotifications: newValue })
        });

        alert(isRtl ? 'تم إيقاف إشعارات سطح المكتب' : 'Desktop notifications disabled');
      } catch (err) {
        console.error('Failed to update desktop notifications', err);
      }
    }
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
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
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
                    <select
                      value={settings.language}
                      onChange={(e) => {
                        const newLang = e.target.value as 'en' | 'ar';
                        setSettings({ ...settings, language: newLang });
                      }}
                      className="bg-white dark:bg-slate-700 border-none outline-none font-bold text-sm text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
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
                    onClick={handle2FAToggle}
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
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-white dark:bg-amber-900/40 text-amber-700 dark:text-amber-100 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all"
                  >
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
                {/* Email Notifications */}
                <div
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
                  onClick={handleEmailNotificationToggle}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {isRtl ? 'تنبيهات البريد الإلكتروني' : 'Email Notifications'}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {isRtl ? 'استلام ملخصات أسبوعية وتحديثات هامة' : 'Receive weekly digests and important updates'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full transition-all relative ${settings.emailNotifications ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${settings.emailNotifications ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`} />
                  </div>
                </div>

                {/* Desktop Notifications */}
                <div
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
                  onClick={handleDesktopNotificationToggle}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {isRtl ? 'تنبيهات سطح المكتب' : 'Desktop Push Notifications'}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {isRtl ? 'إشعارات فورية عند وصول رسائل جديدة' : 'Instant alerts when new messages arrive'}
                      </p>
                      {notificationPermission === 'denied' && (
                        <p className="text-xs text-red-500 font-bold mt-1">
                          {isRtl ? 'تم رفض الإذن - يرجى تفعيله من إعدادات المتصفح' : 'Permission denied - please enable in browser settings'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full transition-all relative ${settings.desktopNotifications ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${settings.desktopNotifications ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`} />
                  </div>
                </div>
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-[900] text-slate-900 dark:text-white mb-2">
              {isRtl ? 'تغيير كلمة المرور' : 'Change Password'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {isRtl ? 'أدخل كلمة المرور الحالية والجديدة' : 'Enter your current and new password'}
            </p>

            {passwordError && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold mb-4">
                {passwordError}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-bold text-slate-500 ml-1 block mb-2">
                  {isRtl ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-500 ml-1 block mb-2">
                  {isRtl ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-500 ml-1 block mb-2">
                  {isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isChangingPassword ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isRtl ? 'تغيير' : 'Change'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
