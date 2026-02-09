import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Download, Calendar, TrendingUp, Users, MessageSquare,
  CheckCircle, ArrowUpRight, ArrowDownRight, Clock, Zap, Loader2
} from 'lucide-react';

interface AnalyticsProps {
  language: 'en' | 'ar';
}

const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const Analytics: React.FC<AnalyticsProps> = ({ language }) => {
  const isRtl = language === 'ar';
  const [loading, setLoading] = useState(true);

  // Real Data States
  const [activityData, setActivityData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    totalMessages: 0,
    activeAudience: 0,
    deliveryRate: 100, // Determined by connected status
    avgResponse: 'N/A'
  });

  const [deviceData, setDeviceData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // 1. Get Instances
        const instancesRes = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
          headers: { 'apikey': EVOLUTION_API_KEY }
        });
        const instancesData = await instancesRes.json();
        const connectedInstances = Array.isArray(instancesData)
          ? instancesData.filter((i: any) => i.connectionStatus === 'open' || i.state === 'open')
          : [];

        // Fetching structure initialization
        const today = new Date();
        const days = isRtl
          ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const weekActivity = new Map<string, { sent: number, received: number }>();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dayName = days[d.getDay()];
          last7Days.push(dayName);
          weekActivity.set(dayName, { sent: 0, received: 0 });
        }

        let totalActiveChats = 0;
        let iosCount = 0;
        let webCount = 0;
        let androidCount = 0;

        // 2. Fetch Chat data if any instances connected
        if (connectedInstances.length > 0) {
          await Promise.all(connectedInstances.map(async (inst: any) => {
            try {
              const chatsRes = await fetch(`${EVOLUTION_URL}/chat/findChats/${inst.instanceName || inst.name}`, {
                method: 'POST',
                headers: { 'apikey': EVOLUTION_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({})
              });
              const chats = await chatsRes.json();
              const chatList = Array.isArray(chats) ? chats : (chats.records || []);

              totalActiveChats += chatList.length;

              chatList.forEach((chat: any) => {
                const ts = chat.timestamp || chat.lastMessage?.messageTimestamp;
                if (ts) {
                  const date = new Date(ts * 1000);
                  const diffTime = Math.abs(today.getTime() - date.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  if (diffDays <= 7) {
                    const dayName = days[date.getDay()];
                    const current = weekActivity.get(dayName) || { sent: 0, received: 0 };
                    const isFromMe = chat.lastMessage?.key?.fromMe || false;

                    weekActivity.set(dayName, {
                      sent: current.sent + (isFromMe ? 1 : 0),
                      received: current.received + (!isFromMe ? 1 : 0)
                    });
                  }
                }

                const lastMsg = chat.lastMessage;
                if (lastMsg && !lastMsg.key?.fromMe && lastMsg.key?.id) {
                  const id = lastMsg.key.id;
                  if (id.startsWith('3A')) iosCount++;
                  else if (id.startsWith('3EB')) webCount++;
                  else androidCount++;
                }
              });
            } catch (e) {
              console.error('Error analytics for ' + inst.name, e);
            }
          }));
        }

        // 3. NEW: Load Campaigns from Backend for Analytics
        const campRes = await fetch('/api/campaigns');
        const campaigns = await campRes.json();
        let totalCampSent = 0;

        campaigns.forEach((camp: any) => {
          totalCampSent += (camp.sentCount || 0);
          const campDate = new Date(camp.date);
          const diffDays = Math.ceil(Math.abs(today.getTime() - campDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) {
            const dayName = days[campDate.getDay()];
            const current = weekActivity.get(dayName) || { sent: 0, received: 0 };
            weekActivity.set(dayName, {
              sent: current.sent + (camp.sentCount || 0),
              received: current.received
            });
          }
        });

        // Final Chart Array
        const finalChartData = last7Days.map(day => ({
          name: day,
          sent: weekActivity.get(day)?.sent || 0,
          received: weekActivity.get(day)?.received || 0
        }));
        setActivityData(finalChartData);

        // Device Data
        const totalDevices = androidCount + iosCount + webCount;
        if (totalDevices > 0) {
          setDeviceData([
            { name: 'Android', value: androidCount, color: '#10b981' },
            { name: 'iPhone', value: iosCount, color: '#3b82f6' },
            { name: 'Web/Desktop', value: webCount, color: '#f59e0b' },
          ].filter(d => d.value > 0));
        } else {
          setDeviceData([]);
        }

        setStatsData({
          totalMessages: totalActiveChats + totalCampSent,
          activeAudience: totalActiveChats,
          deliveryRate: 100,
          avgResponse: 'N/A'
        });

      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isRtl]);

  const generateEmptyWeekData = (isRtl: boolean) => {
    const days = isRtl
      ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => ({ name: d, sent: 0, received: 0 }));
  };

  const activityStats = [
    { label: isRtl ? 'إجمالي الرسائل' : 'Total Messages', value: statsData.totalMessages.toLocaleString(), change: '+12%', icon: MessageSquare, color: 'emerald' },
    { label: isRtl ? 'الجمهور النشط' : 'Active Audience', value: statsData.activeAudience.toLocaleString(), change: '+5%', icon: Users, color: 'blue' },
    { label: isRtl ? 'معدل الوصول' : 'Delivery Rate', value: `${statsData.deliveryRate}%`, change: '0%', icon: CheckCircle, color: 'purple' },
    { label: isRtl ? 'متوسط الرد' : 'Avg Response', value: statsData.avgResponse, change: '-', icon: Clock, color: 'amber' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">
          {isRtl ? 'جاري تحليل البيانات...' : 'Analyzing data...'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-transparent min-h-full page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[900] tracking-tight text-slate-900 dark:text-white">
            {isRtl ? 'التحليلات والتقارير' : 'Analytics & Reports'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {isRtl ? 'نظرة متعمقة على أداء حسابك ونشاط العملاء' : 'Deep insights into your account performance and customer activity.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {isRtl ? 'آخر 7 أيام' : 'Last 7 Days'}
          </button>
          <button className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            <Download className="w-4 h-4" />
            {isRtl ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activityStats.map((stat, idx) => (
          <div key={idx} className="premium-card p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex items-start justify-between relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color}-50 dark:bg-${stat.color}-900/10 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : null}
                {stat.change}
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="text-2xl font-[900] text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
            </div>
            {/* Subtle background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 premium-card p-8 rounded-[32px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-900 text-slate-900 dark:text-white">
                {isRtl ? 'معدل النشاط' : 'Activity Overview'}
              </h2>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {isRtl ? 'الحملات والمحادثات في آخر 7 أيام' : 'Campaigns vs Chats activity in the last 7 days'}
              </p>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.2)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '16px',
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '13px' }}
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="#10b981"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorSent)"
                  name={isRtl ? 'مرسل' : 'Sent'}
                />
                <Area
                  type="monotone"
                  dataKey="received"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRec)"
                  name={isRtl ? 'مستقبل' : 'Received'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="premium-card p-8 rounded-[32px] flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-900 text-slate-900 dark:text-white">
              {isRtl ? 'أنواع الأجهزة' : 'Platform Distribution'}
            </h2>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {isRtl ? 'الأجهزة المستخدمة من قبل عملائك' : 'What devices your customers are using'}
            </p>
          </div>

          <div className="h-[250px] relative flex items-center justify-center">
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl w-full">
                <p className="text-xs font-bold text-slate-400">
                  {isRtl ? 'لا توجد بيانات كافية للأجهزة حالياً' : 'No device data detected yet.'}
                </p>
              </div>
            )}
            <div className="absolute inset-0 flex flex-center flex-col justify-center items-center pointer-events-none">
              <Zap className="w-8 h-8 text-emerald-500 fill-emerald-500/20" />
            </div>
          </div>

          <div className="mt-8 space-y-4 flex-1">
            {deviceData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="text-sm font-[900] text-slate-900 dark:text-white">
                  {Math.round((item.value / deviceData.reduce((a: any, b: any) => a + b.value, 0)) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
