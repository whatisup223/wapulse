
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, Filter } from 'lucide-react';

interface AnalyticsProps {
  language: 'en' | 'ar';
}

const Analytics: React.FC<AnalyticsProps> = ({ language }) => {
  const isRtl = language === 'ar';

  const deliveryData = [
    { name: 'Sent', value: 4500, color: '#128C7E' },
    { name: 'Delivered', value: 4100, color: '#3b82f6' },
    { name: 'Read', value: 3800, color: '#8b5cf6' },
    { name: 'Failed', value: 200, color: '#ef4444' },
  ];

  const engagementData = [
    { hour: '00', count: 120 }, { hour: '04', count: 40 }, { hour: '08', count: 320 },
    { hour: '12', count: 850 }, { hour: '16', count: 980 }, { hour: '20', count: 430 },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{isRtl ? 'التقارير والتحليلات' : 'Reports & Analytics'}</h1>
          <p className="text-slate-500 dark:text-slate-400">{isRtl ? 'نظرة متعمقة على أداء حملاتك ومعدلات التفاعل' : 'Detailed insights into your campaign performance and engagement.'}</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white dark:bg-slate-900 border dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2 hover:bg-slate-50">
            <Calendar className="w-4 h-4" />
            {isRtl ? 'تحديد التاريخ' : 'Select Date'}
          </button>
          <button className="bg-[#128C7E] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#075E54] transition-all">
            <Download className="w-4 h-4" />
            {isRtl ? 'تصدير التقرير' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-8 dark:text-white">{isRtl ? 'حالة تسليم الرسائل' : 'Message Delivery Status'}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={80} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-8 dark:text-white">{isRtl ? 'التفاعل بالساعة' : 'Engagement by Hour'}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="count" fill="#128C7E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden">
         <h3 className="font-bold mb-6 dark:text-white">{isRtl ? 'إحصائيات التفاعل الرئيسية' : 'Key Performance Metrics'}</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: isRtl ? 'معدل القراءة' : 'Open Rate', val: '82%', sub: '+2.4%' },
              { label: isRtl ? 'معدل النقر' : 'CTR', val: '14%', sub: '+0.8%' },
              { label: isRtl ? 'وقت الرد' : 'Resp. Time', val: '12m', sub: '-2m' },
              { label: isRtl ? 'معدل التحويل' : 'Conversion', val: '3.2%', sub: '+0.5%' },
            ].map((metric, i) => (
              <div key={i} className="text-center md:text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-2xl font-bold dark:text-white">{metric.val}</span>
                  <span className={`text-[10px] font-black ${metric.sub.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                    {metric.sub}
                  </span>
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Analytics;
