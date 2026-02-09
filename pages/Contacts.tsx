import React, { useState, useEffect } from 'react';
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
  Tag as TagIcon,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  Edit,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ContactsProps {
  language: 'en' | 'ar';
}

const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const Contacts: React.FC<ContactsProps> = ({ language }) => {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTag, setFormTag] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Load Contacts
  useEffect(() => {
    fetchAllContacts();
  }, []);

  const fetchAllContacts = async () => {
    setLoading(true);
    try {
      // 1. Get WP Instances
      const instancesRes = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      const instancesData = await instancesRes.json();
      const connectedInstances = Array.isArray(instancesData)
        ? instancesData.filter((i: any) => i.connectionStatus === 'open' || i.state === 'open')
        : [];

      // 2. Load Local CRM Data
      const localCRM = JSON.parse(localStorage.getItem('internal_crm_contacts') || '{}');

      if (connectedInstances.length === 0) {
        // If no WP connected, show only CRM contacts
        setContacts(Object.values(localCRM));
        setLoading(false);
        return;
      }

      const allContactsMap = new Map();

      // Initialize with Local CRM Data
      Object.keys(localCRM).forEach(key => {
        allContactsMap.set(key, { ...localCRM[key], source: 'CRM' });
      });

      // 3. Merge WP Contacts
      await Promise.all(connectedInstances.map(async (inst: any) => {
        const sessionName = inst.instanceName || inst.name;
        try {
          const chatsRes = await fetch(`${EVOLUTION_URL}/chat/findChats/${sessionName}`, {
            method: 'POST',
            headers: { 'apikey': EVOLUTION_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          const chatsData = await chatsRes.json();
          const chatList = Array.isArray(chatsData) ? chatsData : (chatsData.records || []);

          const contactsRes = await fetch(`${EVOLUTION_URL}/contact/fetchContacts/${sessionName}`, {
            headers: { 'apikey': EVOLUTION_API_KEY }
          }).catch(() => null);

          let syncContacts = [];
          if (contactsRes && contactsRes.ok) {
            const cData = await contactsRes.json();
            syncContacts = Array.isArray(cData) ? cData : (cData.records || cData.data || []);
          }

          [...chatList, ...syncContacts].forEach((item: any) => {
            const fullJid = (item.id || item.remoteJid || '').toLowerCase().trim();
            if (!fullJid || fullJid.includes('@status') || fullJid.includes('@broadcast') || fullJid.includes('@g.us')) return;

            const [idPart] = fullJid.split('@');
            const phone = idPart.split(':')[0].replace(/\D/g, '');
            if (phone.length < 8) return;

            const name = item.name || item.pushName || item.verifiedName || `+${phone}`;

            // Deduplication: Only add if not in CRM or CRM has generic name
            if (!allContactsMap.has(phone)) {
              allContactsMap.set(phone, {
                id: fullJid,
                name: name,
                displayPhone: `+${phone}`,
                phone: phone,
                tag: isRtl ? 'واتساب' : 'WhatsApp',
                status: 'Active',
                source: 'WP',
                avatar: item.profilePicUrl || item.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
              });
            } else {
              // Keep CRM data but update JID if missing
              const crmData = allContactsMap.get(phone);
              if (!crmData.id) crmData.id = fullJid;
            }
          });
        } catch (e) { console.error(e); }
      }));

      setContacts(Array.from(allContactsMap.values()));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // Add / Update Contact
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    const cleanPhone = formPhone.replace(/\D/g, '');
    const localCRM = JSON.parse(localStorage.getItem('internal_crm_contacts') || '{}');

    const newContact = {
      id: editingId || '', // Might be empty if brand new
      name: formName,
      phone: cleanPhone,
      displayPhone: `+${cleanPhone}`,
      tag: formTag || (isRtl ? 'عميل' : 'Customer'),
      status: 'Active',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formName)}&background=random`
    };

    localCRM[cleanPhone] = newContact;
    localStorage.setItem('internal_crm_contacts', JSON.stringify(localCRM));

    setShowAddModal(false);
    setShowEditModal(false);
    setFormName('');
    setFormPhone('');
    setFormTag('');
    setEditingId(null);
    fetchAllContacts();
  };

  const handleDelete = (phone: string) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف جهة الاتصال من النظام؟' : 'Are you sure you want to remove this contact from the system?')) {
      const localCRM = JSON.parse(localStorage.getItem('internal_crm_contacts') || '{}');
      delete localCRM[phone];
      localStorage.setItem('internal_crm_contacts', JSON.stringify(localCRM));
      fetchAllContacts();
    }
  };

  const openEdit = (contact: any) => {
    setEditingId(contact.id);
    setFormName(contact.name);
    setFormPhone(contact.phone);
    setFormTag(contact.tag);
    setShowEditModal(true);
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeTab]);

  const filteredContacts = contacts.filter(c => {
    const matchesTab = activeTab === 'all' || c.status.toLowerCase() === activeTab;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm) || (c.tag && c.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredContacts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const displayedContacts = filteredContacts.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-transparent min-h-full page-enter">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 dark:text-white mb-2">{isRtl ? 'جهات الاتصال' : 'Contacts'}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{isRtl ? 'نظام إدارة العملاء (CRM) المتكامل مع واتساب.' : 'Customer Relationship Management unified with WhatsApp.'}</p>
        </div>
        <button onClick={() => { setFormName(''); setFormPhone(''); setFormTag(''); setShowAddModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>{isRtl ? 'إضافة جهة' : 'Add Contact'}</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit">
            {['all', 'active', 'inactive'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 font-black' : 'text-slate-500'}`}>
                {isRtl ? (tab === 'all' ? 'الكل' : tab === 'active' ? 'نشط' : 'غير نشط') : tab}
              </button>
            ))}
          </div>
          <div className="relative group">
            <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors`} />
            <input type="text" placeholder={isRtl ? 'بحث في الأسماء أو التصنيفات...' : 'Search contacts...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full md:w-64 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none`} />
          </div>
        </div>

        <div className="overflow-auto max-h-[600px] relative custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-md text-[11px] font-[900] text-slate-400 uppercase tracking-widest shadow-sm">
                <th className={`px-8 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الاسم' : 'Name'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الهاتف' : 'Phone'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'التصنيف' : 'Tag'}</th>
                <th className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-5 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500 mb-4" /><span className="text-slate-400 font-black text-xs uppercase tracking-widest">{isRtl ? 'جاري التحميل...' : 'Loading...'}</span></td></tr>
              ) : displayedContacts.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-500"><div className="flex flex-col items-center gap-3 opacity-50"><Users className="w-12 h-12" /><p className="font-bold">{isRtl ? 'لا توجد جهات اتصال' : 'No contacts found'}</p></div></td></tr>
              ) : displayedContacts.map((contact, i) => (
                <tr key={startIndex + i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={contact.avatar} alt="" className="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-100" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[150px]">{contact.name}</h4>
                    </div>
                  </td>
                  <td className={`px-6 py-5 text-sm font-black text-slate-600 dark:text-slate-300 ${isRtl ? 'text-right' : 'text-left'}`} dir="ltr">
                    {contact.displayPhone}
                  </td>
                  <td className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase">
                      <TagIcon className="w-3 h-3" />
                      {contact.tag}
                    </span>
                  </td>
                  <td className={`px-6 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${contact.status === 'Active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${contact.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {isRtl ? (contact.status === 'Active' ? 'نشط' : 'غير نشط') : contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openEdit(contact)} className="p-2.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-indigo-500 shadow-sm transition-all"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(contact.phone)} className="p-2.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-red-500 shadow-sm transition-all"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 md:p-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-black text-slate-400 uppercase tracking-widest">
          <span className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400">
            {isRtl ? `عرض ${startIndex + 1}-${Math.min(startIndex + pageSize, filteredContacts.length)} من ${filteredContacts.length}` : `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, filteredContacts.length)} of ${filteredContacts.length}`}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1 || loading} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 font-bold disabled:opacity-30 transition-all">
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{isRtl ? 'السابق' : 'Prev'}</span>
            </button>
            <div className="flex gap-1.5">
              <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">{currentPage}</span>
              <span className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400">/</span>
              <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{totalPages || 1}</span>
            </div>
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0 || loading} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 font-bold disabled:opacity-30 transition-all">
              <span>{isRtl ? 'التالي' : 'Next'}</span>
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-2xl font-black">{showEditModal ? (isRtl ? 'تعديل جهة الاتصال' : 'Edit Contact') : (isRtl ? 'إضافة جهة اتصال' : 'Add Contact')}</h3>
              <p className="text-slate-500 text-sm mt-1">{isRtl ? 'إدارة بيانات العميل في نظامنا الداخلي' : 'Manage customer in our internal CRM'}</p>
            </div>
            <form onSubmit={handleSaveContact} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">{isRtl ? 'الاسم' : 'Name'}</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">{isRtl ? 'رقم الهاتف' : 'Phone'}</label>
                <input type="text" required value={formPhone} onChange={(e) => setFormPhone(e.target.value)} disabled={showEditModal} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all disabled:opacity-50" placeholder="+20..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">{isRtl ? 'التصنيف (Tag)' : 'Tag'}</label>
                <input type="text" value={formTag} onChange={(e) => setFormTag(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all" placeholder={isRtl ? 'مثال: عميل مميز' : 'e.g. Premium'} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="flex-1 p-4 rounded-2xl font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white font-black p-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:-translate-y-1 transition-all">{isRtl ? 'حفظ' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
