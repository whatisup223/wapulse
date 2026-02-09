import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Download, Calendar, Filter, TrendingUp, Users, MessageSquare,
  CheckCircle, ArrowUpRight, ArrowDownRight, Clock, Zap
} from 'lucide-react';

interface AnalyticsProps {
  language: 'en' | 'ar';
}

const Analytics: React.FC<AnalyticsProps> = ({ language }) => {
  const isRtl = language === 'ar';
  const [dateRange, setDateRange] = useState('This Week');

  // Mock Data
  const activityData = [
    { name: 'Sat', sent: 4000, received: 2400 },
    { name: 'Sun', sent: 3000, received: 1398 },
    { name: 'Mon', sent: 2000, received: 9800 },
    { name: 'Tue', sent: 2780, received: 3908 },
    { name: 'Wed', sent: 1890, received: 4800 },
    { name: 'Thu', sent: 2390, received: 3800 },
    { name: 'Fri', sent: 3490, received: 4300 },
  ];

  const deviceData = [
    { name: 'Mobile', value: 400, color: '#10b981' }, // Emerald
    { name: 'Desktop', value: 300, color: '#3b82f6' }, // Blue
    { name: 'Tablet', value: 300, color: '#f59e0b' }, // Amber
  ];

  const stats = [
    {
      label: isRtl ? 'إجمالي الرسائل' : 'Total Messages',
      val: '124,592',
      trend: '+12.5%',
      isUp: true,
      icon: MessageSquare,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: isRtl ? 'الجمهور النشط' : 'Active Audience',
      val: '45,231',
      trend: '+8.2%',
      isUp: true,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-600'
    },
    {
      label: isRtl ? 'معدل التسليم' : 'Delivery Rate',
      val: '98.2%',
      trend: '-0.4%',
      isUp: false,
      icon: CheckCircle,
      color: 'bg-violet-500',
      lightColor: 'bg-violet-50 text-violet-600'
    },
    {
      label: isRtl ? 'وقت الاستجابة' : 'Avg. Response Time',
      val: '1m 42s',
      trend: '-12s',
      isUp: true,
      icon: Clock,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-600'
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10">
          <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium" style={{ color: p.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span>{p.name}: {p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-full page-enter">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 dark:text-white mb-2">{isRtl ? 'التقارير' : 'Analytics Overview'}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{isRtl ? 'راقب أداء حملاتك وتفاعل جمهورك لحظة بلحظة.' : 'Monitor your campaign performance and audience engagement in real-time.'}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Calendar className="w-4 h-4" />
            <span>{isRtl ? 'آخر 7 أيام' : 'Last 7 Days'}</span>
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-1 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            {isRtl ? 'تصدير التقرير' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            {/* Decorative Background Blob */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700 ${stat.color}`} />

            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.lightColor}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stat.isUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-[900] text-slate-900 dark:text-white tracking-tight mb-1">{stat.val}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-[900] text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                {isRtl ? 'نشاط الرسائل' : 'Message Activity'}
              </h3>
              <p className="text-slate-400 text-sm font-medium mt-1">{isRtl ? 'مقارنة الرسائل المرسلة والمستقبلة' : 'Comparison of sent vs received messages'}</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSent)" activeDot={{ r: 8, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="received" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRec)" activeDot={{ r: 8, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col">
          <h3 className="text-xl font-[900] text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            {isRtl ? 'الأجهزة المستخدمة' : 'Device Usage'}
          </h3>
          <p className="text-slate-400 text-sm font-medium mb-8">{isRtl ? 'توزيع التفاعل حسب نوع الجهاز' : 'Engagement distribution by device type'}</p>

          <div className="h-[300px] relative w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={10} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-[900] text-slate-800 dark:text-white">82%</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {deviceData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
