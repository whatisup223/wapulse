
import React, { useState } from 'react';
import { User, Shield, Bell, Zap, Database, Key, Check, Save } from 'lucide-react';

interface SettingsProps {
  language: 'en' | 'ar';
}

const Settings: React.FC<SettingsProps> = ({ language }) => {
  const isRtl = language === 'ar';
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [config, setConfig] = useState({
    darkMode: false,
    readReceipts: true,
    autoReply: false,
    notifications: true
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const sections = [
    { id: 'profile', icon: User, title: isRtl ? 'الملف الشخصي' : 'Profile Settings' },
    { id: 'security', icon: Shield, title: isRtl ? 'الأمان' : 'Security' },
    { id: 'notifications', icon: Bell, title: isRtl ? 'التنبيهات' : 'Notifications' },
    { id: 'automation', icon: Zap, title: isRtl ? 'قواعد الرد الآلي' : 'Auto-reply Rules' },
  ];

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <div 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative cursor-pointer p-1 transition-colors duration-200 ${active ? 'bg-[#128C7E]' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${active ? (isRtl ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`}></div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {saveSuccess && (
        <div className="fixed top-20 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[200] animate-in slide-in-from-top-4 duration-300 flex items-center gap-2">
          <Check className="w-5 h-5" />
          {isRtl ? 'تم حفظ التغييرات بنجاح!' : 'Changes saved successfully!'}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold dark:text-white">{isRtl ? 'الإعدادات' : 'Settings'}</h1>
        <p className="text-slate-500 dark:text-slate-400">{isRtl ? 'تخصيص تجربتك وإدارة تكوين النظام' : 'Personalize your experience and manage system configuration.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <button key={section.id} className="text-left bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 shadow-sm hover:ring-2 hover:ring-[#128C7E] transition-all flex items-center gap-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500"><section.icon className="w-6 h-6" /></div>
            <h3 className={`font-bold dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}>{section.title}</h3>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border dark:border-slate-800 shadow-sm space-y-8">
        <h3 className="font-bold text-lg dark:text-white">{isRtl ? 'الإعدادات العامة' : 'General Configuration'}</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold dark:text-slate-200">{isRtl ? 'تأكيد القراءة' : 'Read Receipts'}</p>
              <p className="text-xs text-slate-500">{isRtl ? 'إرسال واستقبال علامات الصح الزرقاء' : 'Send and receive double blue checkmarks.'}</p>
            </div>
            <Toggle active={config.readReceipts} onToggle={() => setConfig({...config, readReceipts: !config.readReceipts})} />
          </div>

          <hr className="dark:border-slate-800" />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold dark:text-slate-200">{isRtl ? 'الرد الآلي' : 'Auto Reply'}</p>
              <p className="text-xs text-slate-500">{isRtl ? 'تفعيل الرد التلقائي خارج ساعات العمل' : 'Enable automated replies outside business hours.'}</p>
            </div>
            <Toggle active={config.autoReply} onToggle={() => setConfig({...config, autoReply: !config.autoReply})} />
          </div>

          <hr className="dark:border-slate-800" />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold dark:text-slate-200">{isRtl ? 'إشعارات النظام' : 'System Notifications'}</p>
              <p className="text-xs text-slate-500">{isRtl ? 'استقبال تنبيهات عند استلام رسائل جديدة' : 'Get notified when new messages arrive.'}</p>
            </div>
            <Toggle active={config.notifications} onToggle={() => setConfig({...config, notifications: !config.notifications})} />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">{isRtl ? 'إلغاء' : 'Cancel'}</button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#128C7E] hover:bg-[#075E54] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
