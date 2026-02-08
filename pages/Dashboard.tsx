
import React from 'react';
import {
  Users,
  MessageCircle,
  Send,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
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
    { name: isRtl ? 'إثنين' : 'Mon', messages: 4000 },
    { name: isRtl ? 'ثلاثاء' : 'Tue', messages: 3000 },
    { name: isRtl ? 'أربعاء' : 'Wed', messages: 8000 },
    { name: isRtl ? 'خميس' : 'Thu', messages: 4500 },
    { name: isRtl ? 'جمعة' : 'Fri', messages: 9000 },
    { name: isRtl ? 'سبت' : 'Sat', messages: 7000 },
    { name: isRtl ? 'أحد' : 'Sun', messages: 8500 },
  ];

  const stats = [
    { label: isRtl ? 'متصل' : 'Connected', value: '12', change: '+2', type: 'positive', icon: MessageCircle, color: 'text-emerald-600' },
    { label: isRtl ? 'الرسائل' : 'Daily Flow', value: '4.8k', change: '+15%', type: 'positive', icon: Send, color: 'text-slate-900' },
    { label: isRtl ? 'الحملات' : 'Campaigns', value: '8', change: '-1', type: 'negative', icon: TrendingUp, color: 'text-slate-900' },
    { label: isRtl ? 'المحادثات' : 'Active Chats', value: '142', change: '+12', type: 'positive', icon: Users, color: 'text-slate-900' },
  ];

  return (
    <div className="p-8 space-y-12 page-enter bg-white dark:bg-transparent">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-[900] tracking-tighter text-slate-950 dark:text-white">
            {isRtl ? 'مرحباً، أحمد' : 'Overview'}
          </h1>
          <p className="text-slate-400 dark:text-slate-400 font-bold text-[10px] tracking-[0.2em] uppercase">
            {isRtl ? 'إحصائيات الأداء المباشرة' : "Live performance metrics"}
          </p>
        </div>
        <button className="bg-slate-950 text-white dark:bg-emerald-600 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 dark:shadow-emerald-900/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          {isRtl ? 'حملة جديدة' : 'New Broadcast'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-100 dark:border-white/5 transition-all hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-none group">
            <div className="flex items-center justify-between mb-8">
              <div className={`w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`text-[10px] font-black tracking-tighter ${stat.type === 'positive' ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.change}
              </div>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-3xl font-[900] dark:text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] dark:text-white">{isRtl ? 'تحليل حجم الرسائل' : 'Message Analysis'}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">Past 7 days performance</p>
            </div>
            <div className="flex gap-4">
              <button className="text-[10px] font-black uppercase text-slate-950 border-b-2 border-slate-950 dark:text-emerald-400 dark:border-emerald-400 pb-1">Weekly</button>
              <button className="text-[10px] font-black uppercase text-slate-400 pb-1">Monthly</button>
            </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 800 }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="messages" stroke="#128C7E" strokeWidth={4} fillOpacity={0.03} fill="#128C7E" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-950 dark:bg-emerald-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-between h-[320px]">
            <div>
              <div className="flex justify-between items-start mb-10">
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] opacity-60">System Usage</h3>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">Pro Plan</span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-black mb-3">
                    <span>Quota Limit</span>
                    <span>82%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[82%]"></div>
                  </div>
                </div>
                <p className="text-[11px] opacity-60 leading-relaxed font-bold">
                  You are approaching your limit. Upgrade now to ensure 100% delivery rate.
                </p>
              </div>
            </div>
            <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-colors shadow-xl">
              Upgrade Now
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-6 dark:text-white">Active Agents</h3>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://picsum.photos/seed/a${i}/100/100`} className="w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 object-cover" />
              ))}
              <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400">+5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
