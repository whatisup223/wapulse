import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Send,
  BarChart3,
  ArrowUpRight,
  Target,
  Zap,
  Smile,
  Loader2,
  Trash2
} from 'lucide-react';

interface CampaignsProps {
  language: 'en' | 'ar';
}

const Campaigns: React.FC<CampaignsProps> = ({ language }) => {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Filter & Actions State
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  // Load campaigns from backend
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('wapulse_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const userId = user?.id;

      const res = await fetch('/api/campaigns', {
        headers: userId ? { 'X-User-Id': userId } : {}
      });
      const data = await res.json();
      setCampaigns(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Poll for updates every 10 seconds if there are active campaigns
  useEffect(() => {
    const hasActive = campaigns.some(c => ['in_progress', 'scheduled', 'pending'].includes(c.status));
    if (!hasActive) return;

    const interval = setInterval(fetchCampaigns, 10000);
    return () => clearInterval(interval);
  }, [campaigns]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowFilterMenu(false);
      setOpenActionId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(isRtl ? 'هل أنت متأكد من حذف هذه الحملة؟' : 'Are you sure you want to delete this campaign?')) {
      try {
        const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
        if (res.ok) fetchCampaigns();
      } catch (e) { console.error(e); }
    }
    setOpenActionId(null);
  };

  const filteredCampaigns = campaigns.filter(c => {
    // 1. Tab Filter
    const matchesTab = activeTab === 'all' || c.status === activeTab || (activeTab === 'active' && ['pending', 'scheduled'].includes(c.status));

    // 2. Search Filter
    const matchesSearch = c.name ? c.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;

    // 3. Date Filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const campDate = new Date(c.date);
      const now = new Date();

      // Reset times for simpler day comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const campDay = new Date(campDate.getFullYear(), campDate.getMonth(), campDate.getDate());

      if (dateFilter === 'today') {
        matchesDate = campDay.getTime() === today.getTime();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        matchesDate = campDay >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        matchesDate = campDay >= monthAgo;
      }
    }

    return matchesTab && matchesSearch && matchesDate;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'scheduled': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'failed': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'partial': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    if (isRtl) {
      switch (status) {
        case 'sent': return 'مكتملة';
        case 'pending': return 'قيد الانتظار';
        case 'scheduled': return 'مجدولة';
        case 'failed': return 'فشل';
        case 'partial': return 'جزئي';
        default: return status;
      }
    }
    return status;
  }

  // Formatting Date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      return new Intl.DateTimeFormat(isRtl ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  // Calculate Real Stats
  const totalMessagesSent = campaigns.reduce((acc, curr) => acc + (curr.sentCount || 0), 0);

  const avgSuccessRate = campaigns.length > 0
    ? Math.round(campaigns.reduce((acc, curr) => {
      let successVal = 0;
      if (curr.success) {
        successVal = parseInt(curr.success.toString().replace('%', '')) || 0;
      } else if (curr.total > 0) {
        successVal = Math.round((curr.sentCount / curr.total) * 100);
      }
      return acc + successVal;
    }, 0) / campaigns.length) + '%'
    : '0%';

  const stats = [
    { label: isRtl ? 'إجمالي الحملات' : 'Total Campaigns', value: campaigns.length, icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: isRtl ? 'رسائل مرسلة' : 'Messages Sent', value: totalMessagesSent.toLocaleString(), icon: Send, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: isRtl ? 'متوسط النجاح' : 'Avg. Success Rate', value: avgSuccessRate, icon: Target, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-transparent min-h-full page-enter">

      {/* Header & Stats Row */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 dark:text-white mb-2">{isRtl ? 'حملات واتساب' : 'Campaigns'}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{isRtl ? 'إدارة وجدولة حملاتك الإعلانية ومتابعة النتائج.' : 'Manage, schedule and track your marketing campaigns.'}</p>
          </div>
          <button
            onClick={() => window.location.hash = '#create-campaign'}
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-1 transition-all flex items-center gap-3"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{isRtl ? 'حملة جديدة' : 'New Campaign'}</span>
          </button>
        </div>

        {/* Mini Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-2xl font-[900] text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">

        {/* Toolbar */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Tabs */}
          <div className="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit">
            {['all', 'active', 'sent', 'failed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${activeTab === tab
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                {isRtl ? (tab === 'all' ? 'الكل' : tab === 'active' ? 'نشط' : tab === 'sent' ? 'مكتملة' : 'فشل') : tab}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3 relative z-20">
            <div className="relative group">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors`} />
              <input
                type="text"
                placeholder={isRtl ? 'بحث عن حملة...' : 'Search campaigns...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full md:w-64 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all`}
              />
            </div>

            {/* Filter Button & Menu */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowFilterMenu(!showFilterMenu); }}
                className={`p-3 rounded-2xl transition-colors flex items-center gap-2 ${showFilterMenu ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                <Filter className="w-5 h-5" />
                {dateFilter !== 'all' && (
                  <span className="text-xs font-bold">{isRtl ? (dateFilter === 'today' ? 'اليوم' : dateFilter === 'week' ? 'أسبوع' : 'شهر') : dateFilter}</span>
                )}
              </button>

              {showFilterMenu && (
                <div className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-30`}>
                  <div className="p-2 space-y-1">
                    {[
                      { id: 'all', label: isRtl ? 'كل الوقت' : 'All Time' },
                      { id: 'today', label: isRtl ? 'اليوم' : 'Today' },
                      { id: 'week', label: isRtl ? 'آخر 7 أيام' : 'Last 7 Days' },
                      { id: 'month', label: isRtl ? 'آخر 30 يوم' : 'Last 30 Days' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setDateFilter(opt.id as any)}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${dateFilter === opt.id ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50 text-slate-600'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-[900] text-slate-400 uppercase tracking-widest">
                <th className={`px-8 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'اسم الحملة' : 'Campaign Name'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'النوع' : 'Type'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'المستهدفين' : 'Audience'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الحالة' : 'Status'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'معدل النجاح' : 'Success'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'التاريخ' : 'Date'}</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredCampaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${camp.type === 'Marketing' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' :
                        camp.type === 'Alert' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                          'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                        }`}>
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{camp.name}</h4>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{camp.type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold">
                      {camp.type}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                      {(camp.total || camp.recipients || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-[900] uppercase tracking-wider shadow-sm ${getStatusStyle(camp.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'sent' || camp.status === 'in_progress' ? 'bg-emerald-500' :
                        camp.status === 'pending' || camp.status === 'scheduled' ? 'bg-blue-500' :
                          camp.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                        } animate-pulse px-0`}></span>
                      {getStatusLabel(camp.status)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${camp.status === 'failed' ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                          style={{ width: camp.success ? camp.success : (camp.total > 0 ? `${Math.round((camp.sentCount / camp.total) * 100)}%` : '0%') }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {camp.success ? camp.success : (camp.total > 0 ? `${Math.round((camp.sentCount / camp.total) * 100)}%` : '0%')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(camp.date)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right w-10 relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenActionId(openActionId === camp.id ? null : camp.id); }}
                      className={`p-2 rounded-xl transition-all shadow-sm ${openActionId === camp.id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100'}`}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Action Menu */}
                    {openActionId === camp.id && (
                      <div className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden`}>
                        <button
                          onClick={(e) => handleDelete(e, camp.id)}
                          className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isRtl ? 'حذف الحملة' : 'Delete Campaign'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCampaigns.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold text-lg">{isRtl ? 'لا توجد حملات' : 'No Campaigns Found'}</p>
              <p className="text-sm">{isRtl ? 'حاول تغيير معايير البحث أو الفلترة.' : 'Try adjusting your search or filters.'}</p>
            </div>
          )}
        </div>

        {/* Pagination (Visual Only) */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>{isRtl ? `عرض 1-${filteredCampaigns.length} من ${campaigns.length}` : `Showing 1-${filteredCampaigns.length} of ${campaigns.length}`}</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>{isRtl ? 'السابق' : 'Prev'}</button>
            <button className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" disabled>{isRtl ? 'التالي' : 'Next'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
