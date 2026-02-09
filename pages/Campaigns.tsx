import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';

interface CampaignsProps {
  language: 'en' | 'ar';
}

const Campaigns: React.FC<CampaignsProps> = ({ language }) => {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'Flash Sale Promo', recipients: 1240, status: 'sent', date: '2023-10-25 14:00', type: 'Marketing', success: '98%' },
    { id: 2, name: 'Weekly Newsletter', recipients: 5200, status: 'pending', date: '2023-10-27 09:00', type: 'Broadcast', success: '-' },
    { id: 3, name: 'System Maintenance', recipients: 890, status: 'scheduled', date: '2023-11-01 18:00', type: 'Alert', success: '-' },
    { id: 4, name: 'Welcome Message', recipients: 0, status: 'failed', date: '2023-10-24 10:00', type: 'Automation', success: '0%' },
    { id: 5, name: 'Loyalty Program', recipients: 250, status: 'sent', date: '2023-10-22 15:30', type: 'Marketing', success: '100%' },
  ]);

  const filteredCampaigns = activeTab === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === activeTab || (activeTab === 'active' && ['pending', 'scheduled'].includes(c.status)));

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'scheduled': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'failed': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const stats = [
    { label: isRtl ? 'إجمالي الحملات' : 'Total Campaigns', value: '124', icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: isRtl ? 'رسائل مرسلة' : 'Messages Sent', value: '45.2k', icon: Send, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: isRtl ? 'متوسط النجاح' : 'Success Rate', value: '94%', icon: Target, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-transparent min-h-full page-enter">
      {/* Create Modal - Glassmorphism */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-2xl font-[900] text-slate-900 dark:text-white">{isRtl ? 'إنشاء حملة' : 'New Campaign'}</h3>
                <p className="text-slate-500 text-sm">{isRtl ? 'قم بإعداد حملة رسائل جماعية جديدة' : 'Setup a new bulk messaging campaign'}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'اسم الحملة' : 'Campaign Name'}</label>
                <div className="relative">
                  <Megaphone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                  <input
                    type="text"
                    className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium`}
                    placeholder={isRtl ? 'مثال: عروض الصيف' : 'e.g. Summer Sale 2024'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'محتوى الرسالة' : 'Message Body'}</label>
                <div className="relative">
                  <textarea
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[120px] resize-none"
                    placeholder={isRtl ? 'اكتب نص الرسالة هنا...' : 'Type your message here...'}
                  ></textarea>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-emerald-500 bg-white dark:bg-slate-700 rounded-lg shadow-sm"><Smile className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-emerald-500 bg-white dark:bg-slate-700 rounded-lg shadow-sm"><Zap className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 relative z-10">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {isRtl ? 'جدولة الحملة' : 'Schedule Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Stats Row */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 dark:text-white mb-2">{isRtl ? 'حملات واتساب' : 'Campaigns'}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{isRtl ? 'إدارة وجدولة حملاتك الإعلانية ومتابعة النتائج.' : 'Manage, schedule and track your marketing campaigns.'}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
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
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors`} />
              <input
                type="text"
                placeholder={isRtl ? 'بحث عن حملة...' : 'Search campaigns...'}
                className={`w-full md:w-64 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all`}
              />
            </div>
            <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                      {camp.recipients.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-[900] uppercase tracking-wider shadow-sm ${getStatusStyle(camp.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'sent' ? 'bg-emerald-500' :
                          camp.status === 'pending' ? 'bg-blue-500' :
                            camp.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                        } animate-pulse`}></span>
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: camp.success !== '-' ? camp.success : '0%' }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{camp.success}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {camp.date}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination (Visual Only) */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>{isRtl ? 'عرض 1-5 من 124' : 'Showing 1-5 of 124'}</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">{isRtl ? 'السابق' : 'Prev'}</button>
            <button className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">{isRtl ? 'التالي' : 'Next'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
