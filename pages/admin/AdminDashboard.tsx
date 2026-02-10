import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Users, DollarSign, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalCampaigns: number;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        totalCampaigns: 0,
    });

    const [chartData] = useState([
        { name: 'يناير', users: 400, revenue: 2400 },
        { name: 'فبراير', users: 300, revenue: 1398 },
        { name: 'مارس', users: 200, revenue: 9800 },
        { name: 'أبريل', users: 278, revenue: 3908 },
        { name: 'مايو', users: 189, revenue: 4800 },
        { name: 'يونيو', users: 239, revenue: 3800 },
    ]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const statCards = [
        {
            title: 'إجمالي المستخدمين',
            value: stats.totalUsers,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            title: 'المستخدمون النشطون',
            value: stats.activeUsers,
            icon: Activity,
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-500/10',
            textColor: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'إجمالي الإيرادات',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-amber-500 to-amber-600',
            bgColor: 'bg-amber-500/10',
            textColor: 'text-amber-600 dark:text-amber-400',
        },
        {
            title: 'الحملات النشطة',
            value: stats.totalCampaigns,
            icon: MessageSquare,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-600 dark:text-purple-400',
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                </div>
                                <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.title}</h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Users Chart */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            نمو المستخدمين
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            الإيرادات الشهرية
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f59e0b"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        آخر الأنشطة
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                    U
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        مستخدم جديد قام بالتسجيل
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        منذ {i} ساعات
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
