import React, { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Save, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const ContentManager: React.FC = () => {
    const [content, setContent] = useState({
        heroTitle: 'منصة التسويق الذكية عبر واتساب',
        heroSubtitle: 'أرسل حملات تسويقية احترافية وأدر محادثاتك بكفاءة',
        heroButtonText: 'ابدأ الآن مجاناً',

        features: [
            { title: 'إرسال الحملات', description: 'أرسل رسائل جماعية مخصصة' },
            { title: 'صندوق الوارد الموحد', description: 'إدارة جميع المحادثات في مكان واحد' },
            { title: 'تحليلات متقدمة', description: 'تتبع أداء حملاتك بدقة' },
        ],

        testimonials: [
            { name: 'أحمد محمد', role: 'مدير تسويق', text: 'منصة رائعة ساعدتني في تحسين نتائج حملاتي' },
            { name: 'سارة علي', role: 'صاحبة متجر', text: 'أفضل أداة لإدارة واتساب للأعمال' },
        ],

        termsOfService: 'شروط الاستخدام...',
        privacyPolicy: 'سياسة الخصوصية...',
    });

    const handleSave = async () => {
        try {
            await fetch('/api/admin/content', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(content),
            });
            toast.success('تم حفظ المحتوى بنجاح!');
        } catch (error) {
            toast.error('فشل حفظ المحتوى');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة المحتوى</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            تحرير محتوى الصفحات
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

                {/* Hero Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">قسم البطل (Hero)</h2>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            العنوان الرئيسي
                        </label>
                        <input
                            type="text"
                            value={content.heroTitle}
                            onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            العنوان الفرعي
                        </label>
                        <input
                            type="text"
                            value={content.heroSubtitle}
                            onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            نص الزر
                        </label>
                        <input
                            type="text"
                            value={content.heroButtonText}
                            onChange={(e) => setContent({ ...content, heroButtonText: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">المميزات</h2>

                    {content.features.map((feature, index) => (
                        <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                            <input
                                type="text"
                                value={feature.title}
                                onChange={(e) => {
                                    const newFeatures = [...content.features];
                                    newFeatures[index].title = e.target.value;
                                    setContent({ ...content, features: newFeatures });
                                }}
                                placeholder="عنوان الميزة"
                                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                            <textarea
                                value={feature.description}
                                onChange={(e) => {
                                    const newFeatures = [...content.features];
                                    newFeatures[index].description = e.target.value;
                                    setContent({ ...content, features: newFeatures });
                                }}
                                placeholder="وصف الميزة"
                                rows={2}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    ))}
                </div>

                {/* Legal Pages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">شروط الاستخدام</h2>
                        <textarea
                            value={content.termsOfService}
                            onChange={(e) => setContent({ ...content, termsOfService: e.target.value })}
                            rows={10}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">سياسة الخصوصية</h2>
                        <textarea
                            value={content.privacyPolicy}
                            onChange={(e) => setContent({ ...content, privacyPolicy: e.target.value })}
                            rows={10}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ContentManager;
