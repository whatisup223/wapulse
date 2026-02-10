import React, { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Plus, Edit, Trash2, Check } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
    maxCampaigns: number;
    maxContacts: number;
    popular: boolean;
}

const SubscriptionsList: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([
        {
            id: '1',
            name: 'مجاني',
            price: 0,
            features: ['100 رسالة شهرياً', 'حملة واحدة', 'دعم أساسي'],
            maxCampaigns: 1,
            maxContacts: 100,
            popular: false,
        },
        {
            id: '2',
            name: 'احترافي',
            price: 29,
            features: ['1000 رسالة شهرياً', '10 حملات', 'دعم أولوية', 'تحليلات متقدمة'],
            maxCampaigns: 10,
            maxContacts: 1000,
            popular: true,
        },
        {
            id: '3',
            name: 'مؤسسات',
            price: 99,
            features: ['رسائل غير محدودة', 'حملات غير محدودة', 'دعم 24/7', 'API مخصص'],
            maxCampaigns: -1,
            maxContacts: -1,
            popular: false,
        },
    ]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة الاشتراكات</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            إدارة الباقات والأسعار
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                        <Plus className="w-5 h-5" />
                        إضافة باقة جديدة
                    </button>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 transition-all hover:shadow-xl ${plan.popular
                                ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                                : 'border-slate-200 dark:border-white/10'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 right-6 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-full">
                                    الأكثر شعبية
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-emerald-600">${plan.price}</span>
                                    <span className="text-slate-600 dark:text-slate-400">/شهرياً</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-2">
                                <button className="flex-1 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    تعديل
                                </button>
                                <button className="flex-1 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Active Subscriptions */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                        الاشتراكات النشطة
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">المستخدم</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">الباقة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">تاريخ البدء</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">تاريخ الانتهاء</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                                {[1, 2, 3].map((i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-900 dark:text-white">مستخدم {i}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">احترافي</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">2024-01-01</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">2024-02-01</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium">
                                                نشط
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SubscriptionsList;
