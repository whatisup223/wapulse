import React, { useEffect, useState } from 'react';
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
  Crown,
  Loader2
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

const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const Dashboard: React.FC<DashboardProps> = ({ language }) => {
  const isRtl = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [statsData, setStatsData] = useState({
    audienceReach: 0,
    onlineAgents: 0,
    totalMessages: 0,
    campaigns: 0,
    avgSuccess: 0
  });

  const [agents, setAgents] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const savedUser = localStorage.getItem('wapulse_user');
        const user = savedUser ? JSON.parse(savedUser) : null;

        // 1. Fetch Instances (Agents) (User Isolated)
        const instancesRes = await fetch('/api/instances', {
          headers: {
            'Content-Type': 'application/json',
            ...(user?.id ? { 'X-User-Id': user.id } : {})
          }
        });
        const instancesData = await instancesRes.json();
        const connectedInstances = Array.isArray(instancesData)
          ? instancesData.filter((i: any) => i.connectionStatus === 'open' || i.state === 'open')
          : [];

        // 2. Load CRM Contacts for Audience Reach
        const localCRM = JSON.parse(localStorage.getItem('internal_crm_contacts') || '{}');
        const uniqueNumbers = new Set<string>();
        Object.values(localCRM).forEach((c: any) => {
          if (c.phone) uniqueNumbers.add(c.phone.replace(/\D/g, ''));
        });

        // 3. Fetch Chats & Calculate Activity Distribution
        let totalUnread = 0;
        const today = new Date();
        const days = isRtl
          ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const weekActivity = new Map<string, { messages: number, active: number }>();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dayName = days[d.getDay()];
          last7Days.push(dayName);
          weekActivity.set(dayName, { messages: 0, active: 0 });
        }

        const chatPromises = connectedInstances.map(async (inst: any) => {
          try {
            const chatsRes = await fetch(`${EVOLUTION_URL}/chat/findChats/${inst.instanceName || inst.name}`, {
              method: 'POST',
              headers: { 'apikey': EVOLUTION_API_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({})
            });
            const chats = await chatsRes.json();
            const chatList = Array.isArray(chats) ? chats : (chats.records || []);

            chatList.forEach((chat: any) => {
              const jid = chat.id || chat.remoteJid || '';
              const phone = jid.split('@')[0].replace(/\D/g, '');
              if (phone) uniqueNumbers.add(phone);

              totalUnread += (chat.unreadCount || 0);
              const lastMsg = chat.lastMessage;
              const ts = chat.timestamp || lastMsg?.messageTimestamp;

              if (ts) {
                const date = new Date(ts * 1000);
                const diffDays = Math.ceil(Math.abs(today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 7) {
                  const dayName = days[date.getDay()];
                  const current = weekActivity.get(dayName) || { messages: 0, active: 0 };

                  // Logic: How do we know it's a customer interaction?
                  // 1. If lastMsg.key.fromMe is FALSE, they sent the last message.
                  // 2. If unreadCount > 0, they definitely interacted.
                  const isIncoming = (lastMsg?.key?.fromMe === false) || (chat.unreadCount > 0);

                  weekActivity.set(dayName, {
                    messages: current.messages,
                    active: current.active + (isIncoming ? 1 : 0)
                  });
                }
              }
            });
            return chatList.length;
          } catch (e) {
            console.error('Error fetching chats', e);
            return 0;
          }
        });
        await Promise.all(chatPromises);

        // 4. Load Campaigns from Backend
        const campRes = await fetch('/api/campaigns', {
          headers: user?.id ? { 'X-User-Id': user.id } : {}
        });
        const storedHistory = await campRes.json();
        const totalCampaigns = storedHistory.length;
        const actualSentMessages = storedHistory.reduce((acc: number, curr: any) => acc + (curr.sentCount || 0), 0);
        const avgSuccess = totalCampaigns > 0
          ? Math.round(storedHistory.reduce((acc: number, curr: any) => {
            const rate = curr.total > 0 ? (curr.sentCount / curr.total) * 100 : 0;
            return acc + rate;
          }, 0) / totalCampaigns)
          : 0;

        storedHistory.forEach((camp: any) => {
          const campDate = new Date(camp.date);
          const diffDays = Math.ceil(Math.abs(today.getTime() - campDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) {
            const dayName = days[campDate.getDay()];
            const current = weekActivity.get(dayName) || { messages: 0, active: 0 };
            weekActivity.set(dayName, {
              messages: current.messages + (camp.sentCount || 0),
              active: current.active
            });
          }
        });

        setChartData(last7Days.map(day => ({
          name: day,
          sent: (weekActivity.get(day)?.messages || 0),
          received: (weekActivity.get(day)?.active || 0) * 3
        })));

        setStatsData({
          audienceReach: uniqueNumbers.size,
          onlineAgents: connectedInstances.length,
          totalMessages: actualSentMessages,
          campaigns: totalCampaigns,
          avgSuccess: avgSuccess
        });

        setAgents(connectedInstances.map((i: any) => ({
          name: i.instanceName || i.name,
          profilePic: i.profilePictureUrl || i.profilePicUrl || `https://ui-avatars.com/api/?name=${i.instanceName}&background=random`
        })));

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isRtl]);

  const stats = [
    {
      label: isRtl ? 'إجمالي الرسائل المرسلة' : 'Total Sent Messages',
      value: loading ? '...' : (statsData.totalMessages > 1000 ? `${(statsData.totalMessages / 1000).toFixed(1)}k` : statsData.totalMessages),
      change: statsData.totalMessages > 0 ? '+100%' : '0%',
      isPositive: true,
      icon: MessageCircle,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      shadow: 'shadow-blue-500/10',
      gradient: 'from-blue-500 to-cyan-400'
    },
    {
      label: isRtl ? 'إجمالي الوصول' : 'Audience Reach',
      value: loading ? '...' : statsData.audienceReach.toLocaleString(),
      change: '+-',
      isPositive: true,
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      shadow: 'shadow-emerald-500/10',
      gradient: 'from-emerald-500 to-teal-400'
    },
    {
      label: isRtl ? 'الحملات الإعلانية' : 'Campaigns',
      value: statsData.campaigns,
      change: '0',
      isPositive: false,
      icon: Target,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-500/10',
      shadow: 'shadow-violet-500/10',
      gradient: 'from-violet-500 to-purple-400'
    },
    {
      label: isRtl ? 'معدل نجاح الحملات' : 'Campaign Success Rate',
      value: loading ? '...' : `${statsData.avgSuccess}%`,
      change: statsData.avgSuccess > 80 ? 'Excellent' : 'Stable',
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
          <div className="relative">
            <button
              onClick={() => setShowTimeMenu(!showTimeMenu)}
              className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 shadow-sm active:scale-95 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {isRtl ? (timeRange === 'week' ? 'هذا الأسبوع' : timeRange === 'month' ? 'هذا الشهر' : 'اليوم') : (timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'Today')}
            </button>
            {showTimeMenu && (
              <div className="absolute top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {['today', 'week', 'month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => { setTimeRange(range); setShowTimeMenu(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${timeRange === range ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    {isRtl ? (range === 'week' ? 'هذا الأسبوع' : range === 'month' ? 'هذا الشهر' : 'اليوم') : (range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'Today')}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => window.location.hash = '#campaigns'}
            className="relative overflow-hidden bg-gradient-to-r from-wp-primary to-wp-secondary text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all flex items-center gap-2 group"
          >
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
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <AreaChart data={chartData}>
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
                    dataKey="sent"
                    stroke="#128C7E"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorMessages)"
                    name={isRtl ? 'مرسل من النظام' : 'System Sent'}
                  />
                  <Area
                    type="monotone"
                    dataKey="received"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    name={isRtl ? 'تفاعل العملاء' : 'Customer Activity'}
                  />
                </AreaChart>
              )}
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
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-4 rtl:space-x-reverse">
                {agents.slice(0, 3).map((agent, i) => (
                  <div key={i} className="relative transition-transform hover:-translate-y-2 hover:z-20 duration-300" title={agent.name}>
                    <img
                      src={agent.profilePic}
                      className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-md"
                      alt={agent.name}
                    />
                  </div>
                ))}
                {agents.length === 0 && !loading && (
                  <span className="text-sm text-slate-400 italic pl-4">{isRtl ? 'لا يوجد وكلاء متصلين' : 'No online agents'}</span>
                )}
                {agents.length > 3 && (
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center text-xs font-black text-slate-500 shadow-sm z-0">
                    +{agents.length - 3}
                  </div>
                )}
              </div>
              <button
                onClick={() => window.location.hash = '#connection'}
                className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
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
