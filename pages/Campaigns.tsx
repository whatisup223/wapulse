
import React, { useState } from 'react';
import { Megaphone, Plus, Search, Filter, MoreHorizontal, Calendar, Users, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

interface CampaignsProps {
  language: 'en' | 'ar';
}

const Campaigns: React.FC<CampaignsProps> = ({ language }) => {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'Flash Sale Promo', recipients: 1240, status: 'sent', date: '2023-10-25 14:00', type: 'Marketing' },
    { id: 2, name: 'Weekly Newsletter', recipients: 5200, status: 'pending', date: '2023-10-27 09:00', type: 'Broadcast' },
    { id: 3, name: 'System Maintenance', recipients: 890, status: 'scheduled', date: '2023-11-01 18:00', type: 'Alert' },
    { id: 4, name: 'Welcome Message', recipients: 0, status: 'failed', date: '2023-10-24 10:00', type: 'Automation' },
    { id: 5, name: 'Loyalty Program', recipients: 250, status: 'sent', date: '2023-10-22 15:30', type: 'Marketing' },
  ]);

  const filteredCampaigns = activeTab === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.status === activeTab || (activeTab === 'active' && ['pending', 'scheduled'].includes(c.status)));

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'sent': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'scheduled': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'failed': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">{isRtl ? 'إنشاء حملة جديدة' : 'Create New Campaign'}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-slate-300">{isRtl ? 'اسم الحملة' : 'Campaign Name'}</label>
                <input type="text" className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#128C7E]" placeholder="Summer Sale 2024" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-slate-300">{isRtl ? 'محتوى الرسالة' : 'Message Body'}</label>
                <textarea className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#128C7E] h-32" placeholder="Hello, we have a special offer for you..."></textarea>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-700">{isRtl ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={() => setShowCreateModal(false)} className="bg-[#128C7E] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20">{isRtl ? 'جدولة الحملة' : 'Schedule Campaign'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{isRtl ? 'حملات واتساب' : 'WhatsApp Campaigns'}</h1>
          <p className="text-slate-500 dark:text-slate-400">{isRtl ? 'إدارة وجدولة حملاتك الإعلانية بسهولة' : 'Manage and schedule your marketing campaigns with ease.'}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="bg-[#128C7E] hover:bg-[#075E54] text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          {isRtl ? 'إنشاء حملة جديدة' : 'New Campaign'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl w-fit">
            {['all', 'active', 'sent', 'failed'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-[#128C7E]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {isRtl ? (tab === 'all' ? 'الكل' : tab === 'active' ? 'نشط' : tab === 'sent' ? 'تم الإرسال' : 'فشل') : tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={isRtl ? 'بحث...' : 'Search...'} className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#128C7E] outline-none" />
            </div>
            <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 hover:bg-slate-100"><Filter className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">{isRtl ? 'اسم الحملة' : 'Campaign Name'}</th>
                <th className="px-6 py-4">{isRtl ? 'النوع' : 'Type'}</th>
                <th className="px-6 py-4">{isRtl ? 'المستلمون' : 'Recipients'}</th>
                <th className="px-6 py-4">{isRtl ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-4">{isRtl ? 'التاريخ' : 'Date'}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredCampaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#128C7E]/10 flex items-center justify-center text-[#128C7E]"><Megaphone className="w-4 h-4" /></div>
                      <span className="text-sm font-semibold dark:text-white">{camp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-xs font-medium text-slate-600 dark:text-slate-400">{camp.type}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2"><Users className="w-3 h-3 text-slate-400" /><span className="text-sm font-bold dark:text-slate-100">{camp.recipients.toLocaleString()}</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(camp.status)}`}>{camp.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="text-xs text-slate-500 dark:text-slate-400">{camp.date}</span></td>
                  <td className="px-6 py-4 text-right"><button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"><MoreHorizontal className="w-5 h-5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
