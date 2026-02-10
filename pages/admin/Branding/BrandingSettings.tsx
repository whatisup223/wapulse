import React, { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Upload, Save, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const BrandingSettings: React.FC = () => {
    const [settings, setSettings] = useState({
        siteName: 'WaPulse',
        siteDescription: 'منصة التسويق عبر واتساب',
        primaryColor: '#10b981',
        secondaryColor: '#14b8a6',
        accentColor: '#f59e0b',
        logo: null as File | null,
        favicon: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string>('');
    const [faviconPreview, setFaviconPreview] = useState<string>('');

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSettings({ ...settings, logo: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSettings({ ...settings, favicon: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('siteName', settings.siteName);
        formData.append('siteDescription', settings.siteDescription);
        formData.append('primaryColor', settings.primaryColor);
        formData.append('secondaryColor', settings.secondaryColor);
        formData.append('accentColor', settings.accentColor);
        if (settings.logo) formData.append('logo', settings.logo);
        if (settings.favicon) formData.append('favicon', settings.favicon);

        try {
            await fetch('/api/admin/branding', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: formData,
            });
            toast.success('تم حفظ الإعدادات بنجاح!');
        } catch (error) {
            toast.error('فشل حفظ الإعدادات');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">هوية الموقع</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            تخصيص شعار وألوان الموقع
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl hover:shadow-lg transition-all">
                            <Eye className="w-5 h-5" />
                            معاينة
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                        >
                            <Save className="w-5 h-5" />
                            حفظ التغييرات
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Logo & Favicon */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">الشعار والأيقونة</h2>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                شعار الموقع
                            </label>
                            <div className="flex items-center gap-4">
                                {logoPreview && (
                                    <img src={logoPreview} alt="Logo Preview" className="w-24 h-24 object-contain rounded-xl bg-slate-100 dark:bg-slate-800 p-2" />
                                )}
                                <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">اضغط لرفع الشعار</span>
                                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* Favicon Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                أيقونة الموقع (Favicon)
                            </label>
                            <div className="flex items-center gap-4">
                                {faviconPreview && (
                                    <img src={faviconPreview} alt="Favicon Preview" className="w-16 h-16 object-contain rounded-xl bg-slate-100 dark:bg-slate-800 p-2" />
                                )}
                                <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
                                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">اضغط لرفع الأيقونة</span>
                                    <input type="file" accept="image/*" onChange={handleFaviconChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Site Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">معلومات الموقع</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                اسم الموقع
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                وصف الموقع
                            </label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-6 lg:col-span-2">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">ألوان الموقع</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Primary Color */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    اللون الأساسي
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={settings.primaryColor}
                                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                        className="w-16 h-16 rounded-xl cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.primaryColor}
                                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>
                            </div>

                            {/* Secondary Color */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    اللون الثانوي
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={settings.secondaryColor}
                                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                        className="w-16 h-16 rounded-xl cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.secondaryColor}
                                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>
                            </div>

                            {/* Accent Color */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    لون التمييز
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={settings.accentColor}
                                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                                        className="w-16 h-16 rounded-xl cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.accentColor}
                                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Color Preview */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">معاينة الألوان:</p>
                            <div className="flex gap-4">
                                <div className="flex-1 h-24 rounded-xl" style={{ backgroundColor: settings.primaryColor }}></div>
                                <div className="flex-1 h-24 rounded-xl" style={{ backgroundColor: settings.secondaryColor }}></div>
                                <div className="flex-1 h-24 rounded-xl" style={{ backgroundColor: settings.accentColor }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default BrandingSettings;
