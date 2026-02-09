
import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, User, Tag, Phone, Calendar, X } from 'lucide-react';

interface ContactsProps {
  language: 'en' | 'ar';
}

const Contacts: React.FC<ContactsProps> = ({ language }) => {
  const isRtl = language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [contactList, setContactList] = useState([
    { id: 1, name: 'Sami Al-Farsi', phone: '+966 50 123 4567', lastMsg: '2 hours ago', tags: ['VIP', 'Active'], status: 'online' },
    { id: 2, name: 'Sarah Wilson', phone: '+1 415 555 0123', lastMsg: 'Yesterday', tags: ['Inquiry'], status: 'offline' },
    { id: 3, name: 'CloudTech Solutions', phone: '+44 20 7946 0958', lastMsg: '3 days ago', tags: ['Enterprise', 'B2B'], status: 'away' },
    { id: 4, name: 'David Miller', phone: '+1 212 555 0199', lastMsg: 'Oct 12', tags: ['Lead'], status: 'offline' },
    { id: 5, name: 'Nora Ahmed', phone: '+971 50 987 6543', lastMsg: 'Oct 10', tags: ['Client', 'Retail'], status: 'online' },
  ]);

  const filteredContacts = contactList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isRtl ? 'إضافة جهة اتصال' : 'Add New Contact'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#128C7E]" placeholder={isRtl ? 'الاسم بالكامل' : 'Full Name'} />
              <input type="text" className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#128C7E]" placeholder={isRtl ? 'رقم الهاتف (مع رمز الدولة)' : 'Phone Number (with country code)'} />
              <input type="text" className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#128C7E]" placeholder={isRtl ? 'الوسوم (مفصولة بفاصلة)' : 'Tags (comma separated)'} />
            </div>
            <div className="p-6 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 font-bold text-slate-500">{isRtl ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={() => setShowAddModal(false)} className="bg-[#128C7E] text-white px-8 py-2.5 rounded-xl font-bold">{isRtl ? 'حفظ' : 'Save Contact'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isRtl ? 'جهات الاتصال' : 'Contacts'}</h1>
          <p className="text-slate-500 dark:text-slate-400">{isRtl ? 'إدارة قاعدة بيانات عملائك وعلامات التمييز' : 'Manage your customer database and tags.'}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#128C7E] hover:bg-[#075E54] text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          {isRtl ? 'إضافة جهة اتصال' : 'Add Contact'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b dark:border-slate-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isRtl ? 'بحث باسم أو رقم الهاتف...' : 'Search by name or phone...'}
              className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#128C7E]`}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors">
              <Filter className="w-4 h-4" />{isRtl ? 'تصفية' : 'Filter'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">{isRtl ? 'الاسم' : 'Name'}</th>
                <th className="px-6 py-4">{isRtl ? 'رقم الهاتف' : 'Phone'}</th>
                <th className="px-6 py-4">{isRtl ? 'الوسوم' : 'Tags'}</th>
                <th className="px-6 py-4">{isRtl ? 'آخر رسالة' : 'Last Message'}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><User className="w-5 h-5" /></div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{contact.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{contact.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {contact.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{contact.lastMsg}</td>
                  <td className="px-6 py-4 text-right"><button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"><MoreHorizontal className="w-5 h-5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
