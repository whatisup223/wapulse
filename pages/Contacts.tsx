import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Upload,
  Download,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Tag,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  Edit,
  X
} from 'lucide-react';

interface ContactsProps {
  language: 'en' | 'ar';
}

const Contacts: React.FC<ContactsProps> = ({ language }) => {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [contacts, setContacts] = useState([
    { id: 1, name: 'Ahmed Ali', phone: '+201012345678', email: 'ahmed@example.com', tags: ['VIP', 'Customer'], status: 'Active', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Sarah Smith', phone: '+1234567890', email: 'sarah@test.com', tags: ['Lead'], status: 'Active', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Mohamed Kamal', phone: '+201122334455', email: 'mohamed@k.com', tags: ['Supplier'], status: 'Inactive', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'John Doe', phone: '+447700900000', email: 'john.doe@uk.co', tags: ['Customer', 'New'], status: 'Active', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, name: 'Layla Hassan', phone: '+971501234567', email: 'layla@uae.ae', tags: ['Partner'], status: 'Active', avatar: 'https://i.pravatar.cc/150?u=5' },
  ]);

  const filteredContacts = activeTab === 'all'
    ? contacts
    : contacts.filter(c => c.status.toLowerCase() === activeTab);

  const stats = [
    { label: isRtl ? 'إجمالي الجهات' : 'Total Contacts', value: '1,240', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: isRtl ? 'مشتركون جدد' : 'New Subscribers', value: '+54', icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: isRtl ? 'جهات محظورة' : 'Blocked Contacts', value: '12', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-transparent min-h-full page-enter">

      {/* Add Contact Modal - Glassmorphism */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-2xl font-[900] text-slate-900 dark:text-white">{isRtl ? 'إضافة جهة اتصال' : 'Add Contact'}</h3>
                <p className="text-slate-500 text-sm">{isRtl ? 'أدخل تفاصيل جهة الاتصال الجديدة' : 'Enter new contact details'}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-5 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'الاسم الأول' : 'First Name'}</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'اسم العائلة' : 'Last Name'}</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'رقم الهاتف' : 'Phone Number'}</label>
                <div className="relative">
                  <Phone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                  <input
                    type="tel"
                    className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium`}
                    placeholder="+20 123 456 7890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <div className="relative">
                  <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                  <input
                    type="email"
                    className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium`}
                    placeholder="example@domain.com"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 relative z-10">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">{isRtl ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={() => setShowAddModal(false)} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all">{isRtl ? 'حفظ الجهة' : 'Save Contact'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 dark:text-white mb-2">{isRtl ? 'جهات الاتصال' : 'Contacts'}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{isRtl ? 'إدارة قاعدة بيانات العملاء وتنظيمهم.' : 'Unify conversations and build customer relationships.'}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
              <Upload className="w-5 h-5" />
              <span className="hidden md:inline">{isRtl ? 'استيراد' : 'Import'}</span>
            </button>
            <button className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
              <Download className="w-5 h-5" />
              <span className="hidden md:inline">{isRtl ? 'تصدير' : 'Export'}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">{isRtl ? 'إضافة جهة' : 'Add Contact'}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
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

      {/* Contacts Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">

        {/* Toolbar */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit">
            {['all', 'active', 'inactive'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${activeTab === tab
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                {isRtl ? (tab === 'all' ? 'الكل' : tab === 'active' ? 'نشط' : 'غير نشط') : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors`} />
              <input
                type="text"
                placeholder={isRtl ? 'بحث في الأسماء...' : 'Search contacts...'}
                className={`w-full md:w-64 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
            </div>
            <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-[900] text-slate-400 uppercase tracking-widest">
                <th className={`px-8 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الاسم' : 'Name'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الهاتف' : 'Phone'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'التصنيف' : 'Tags'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-xl" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{contact.name}</h4>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-300">{contact.phone}</td>
                  <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">{contact.email}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-[900] uppercase tracking-wider ${contact.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${contact.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors shadow-sm">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-red-500 transition-colors shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>{isRtl ? 'عرض 1-5 من 1240' : 'Showing 1-5 of 1240'}</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">{isRtl ? 'السابق' : 'Prev'}</button>
            <button className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">{isRtl ? 'التالي' : 'Next'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
