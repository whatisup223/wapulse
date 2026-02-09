import React from 'react';
import {
  Users,
  MessageCircle,
  Send,
  TrendingUp,
  ArrowUpRight,
  Target,
  Zap,
  Activity,
  Calendar,
  MoreHorizontal,
  Crown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DashboardProps {
  language: 'en' | 'ar';
}

const Dashboard: React.FC<DashboardProps> = ({ language }) => {
  const isRtl = language === 'ar';

  const data = [
    { name: isRtl ? 'إثنين' : 'Mon', messages: 4000, active: 2400 },
    { name: isRtl ? 'ثلاثاء' : 'Tue', messages: 3000, active: 1398 },
    { name: isRtl ? 'أربعاء' : 'Wed', messages: 8000, active: 9800 },
    { name: isRtl ? 'خميس' : 'Thu', messages: 4500, active: 3908 },
    { name: isRtl ? 'جمعة' : 'Fri', messages: 9000, active: 4800 },
    { name: isRtl ? 'سبت' : 'Sat', messages: 7000, active: 3800 },
    { name: isRtl ? 'أحد' : 'Sun', messages: 8500, active: 4300 },
  ];

  const stats = [
    {
      label: isRtl ? 'الرسائل المرسلة' : 'Total Messages',
      value: '24.8k',
      change: '+15%',
      isPositive: true,
      icon: MessageCircle,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      shadow: 'shadow-blue-500/10',
      gradient: 'from-blue-500 to-cyan-400'
    },
    {
      label: isRtl ? 'المحادثات النشطة' : 'Active Chats',
      value: '142',
      change: '+12',
      isPositive: true,
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      shadow: 'shadow-emerald-500/10',
      gradient: 'from-emerald-500 to-teal-400'
    },
    {
      label: isRtl ? 'الحملات الإعلانية' : 'Campaigns',
      value: '8',
      change: '-1',
      isPositive: false,
      icon: Target,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-500/10',
      shadow: 'shadow-violet-500/10',
      gradient: 'from-violet-500 to-purple-400'
    },
    {
      label: isRtl ? 'معدل الاستجابة' : 'Response Rate',
      value: '98.5%',
      change: '+2.4%',
      isPositive: true,
      icon: Activity,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      shadow: 'shadow-amber-500/10',
      gradient: 'from-amber-500 to-orange-400'
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-transparent min-h-full page-enter">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 dark:text-white mb-2">
            {isRtl ? 'لوحة القيادة' : 'Dashboard'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {isRtl ? 'مرحباً، إليك ملخص نشاطك اليوم' : 'Welcome back, here is your activity overview.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 shadow-sm active:scale-95 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {isRtl ? 'هذا الأسبوع' : 'This Week'}
          </button>
          <button className="relative overflow-hidden bg-gradient-to-r from-[#128C7E] to-[#075E54] text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all flex items-center gap-2 group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Send className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{isRtl ? 'حملة جديدة' : 'New Broadcast'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - With Glow Effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
            {/* Soft Glow Background */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-[0.03] dark:opacity-[0.05] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                  {stat.change}
                  <ArrowUpRight className={`w-3 h-3 ${stat.isPositive ? 'rotate-0' : 'rotate-180'}`} />
                </div>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-[900] text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Chart - Glassmorphism Feel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-[800] text-xl text-slate-900 dark:text-white tracking-tight">
                {isRtl ? 'تحليل الرسائل' : 'Analytics Overview'}
              </h3>
            </div>
            <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#128C7E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#128C7E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-[0.05]" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: '#128C7E', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#0f172a',
                    borderRadius: '16px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '12px 16px',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#128C7E"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorActive)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Side Stats - High Contrast "Pro Plan" Card */}
        <div className="space-y-6">

          {/* Pro Plan Card - Redesigned for High Contrast */}
          <div className="group relative bg-white dark:bg-gradient-to-br dark:from-emerald-900 dark:to-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-emerald-500/30 overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(16,185,129,0.15)] transition-all hover:scale-[1.02] duration-500">
            {/* Glow Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-emerald-400/80">Premium</span>
                  </div>
                  <h3 className="text-2xl font-[900] text-slate-900 dark:text-white leading-tight">
                    {isRtl ? 'باقة المحترفين' : 'Pro Plan'}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-slate-50 dark:bg-white/10 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-black text-slate-600 dark:text-slate-300 mb-3">
                    <span>{isRtl ? 'تم استهلاك 82%' : '82% Quota Used'}</span>
                    <span>8.2k / 10k</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-black/20 h-3 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[82%] shadow-[0_0_15px_rgba(16,185,129,0.4)] relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 dark:hover:shadow-white/20 transition-all hover:-translate-y-0.5">
                  {isRtl ? 'ترقية الباقة الآن' : 'Upgrade Plan'}
                </button>
              </div>
            </div>
          </div>

          {/* Active Agents - Clean Look */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <h3 className="font-[800] text-sm text-slate-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isRtl ? 'الوكلاء المتصلين' : 'Online Agents'}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-4 rtl:space-x-reverse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="relative transition-transform hover:-translate-y-2 hover:z-20 duration-300">
                    <img
                      src={`https://picsum.photos/seed/u${i}/100/100`}
                      className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-md"
                      alt="Agent"
                    />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center text-xs font-black text-slate-500 shadow-sm z-0">
                  +4
                </div>
              </div>
              <button className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
