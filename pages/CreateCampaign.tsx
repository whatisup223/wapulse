import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    Users,
    FileText,
    Upload,
    Calendar,
    Clock,
    Smartphone,
    Send,
    Image as ImageIcon,
    Smile,
    Zap,
    CheckCircle,
    Search,
    RefreshCw,
    AlertCircle,
    Tag as TagIcon,
    Filter,
    X,
    FileUp
} from 'lucide-react';
import { sendCampaignNotification, checkNotificationSettings } from '../utils/notifications';

interface CreateCampaignProps {
    language: 'en' | 'ar';
    onBack?: () => void;
}

const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const CreateCampaign: React.FC<CreateCampaignProps> = ({ language }) => {
    const isRtl = language === 'ar';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [audienceType, setAudienceType] = useState<'contacts' | 'paste' | 'file'>('contacts');
    const [message, setMessage] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [minDelay, setMinDelay] = useState(10);
    const [maxDelay, setMaxDelay] = useState(30);
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [manualNumbers, setManualNumbers] = useState('');
    const [fileNumbers, setFileNumbers] = useState<string[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [instances, setInstances] = useState<any[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<string>('all');
    const [selectedSourceInstances, setSelectedSourceInstances] = useState<string[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [rotationCount, setRotationCount] = useState(5);
    const [sendingProgress, setSendingProgress] = useState<{ current: number, total: number, success: number, failed: number } | null>(null);

    // Fetch Instances on Mount
    useEffect(() => {
        const fetchInstances = async () => {
            try {
                const res = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
                    headers: { 'apikey': EVOLUTION_API_KEY }
                });
                const data = await res.json();
                const rawList = Array.isArray(data) ? data : [];
                const connected = rawList
                    .filter((i: any) => i.connectionStatus === 'open' || i.state === 'open')
                    .map((i: any) => ({
                        instanceName: i.instanceName || i.name,
                        ownerJid: i.ownerJid,
                        contactName: i.profileName || i.pushName || 'Unknown',
                    }))
                    .filter((i: any) => i.instanceName);
                setInstances(connected);
            } catch (e) {
                console.error("Failed to fetch instances", e);
            }
        };
        fetchInstances();
    }, []);

    // Auto-select all instances as sources
    useEffect(() => {
        if (instances.length > 0 && selectedSourceInstances.length === 0) {
            setSelectedSourceInstances(instances.map(i => i.instanceName));
        }
    }, [instances]);

    // Fetch and Merge CRM + WP Contacts
    const fetchSpecificContacts = async () => {
        if (audienceType !== 'contacts') return;

        setLoadingContacts(true);
        try {
            const targets = instances.filter(i => selectedSourceInstances.includes(i.instanceName));
            const localCRM = JSON.parse(localStorage.getItem('internal_crm_contacts') || '{}');
            const allContactsMap = new Map();

            // 1. Fill with Local CRM Data first
            Object.values(localCRM).forEach((c: any) => {
                allContactsMap.set(c.phone, {
                    id: c.id || `${c.phone}@s.whatsapp.net`,
                    name: c.name,
                    phone: c.phone,
                    tag: c.tag,
                    avatar: c.avatar,
                    source: 'CRM'
                });
            });

            // 2. Merge WP Contacts
            if (targets.length > 0) {
                await Promise.all(targets.map(async (instance: any) => {
                    try {
                        const chatsRes = await fetch(`${EVOLUTION_URL}/chat/findChats/${instance.instanceName}`, {
                            method: 'POST',
                            headers: { 'apikey': EVOLUTION_API_KEY, 'Content-Type': 'application/json' },
                            body: JSON.stringify({})
                        });
                        const data = await chatsRes.json();
                        const chatList = Array.isArray(data) ? data : (data.records || []);

                        chatList.forEach((c: any) => {
                            const fullJid = (c.remoteJid || c.id || '').toLowerCase().trim();
                            if (!fullJid || fullJid.includes('@status') || fullJid.includes('@broadcast') || fullJid.includes('@g.us')) return;

                            const phone = fullJid.split('@')[0].split(':')[0].replace(/\D/g, '');
                            if (phone.length < 8) return;

                            if (!allContactsMap.has(phone)) {
                                const name = c.pushName || c.name || `+${phone}`;
                                allContactsMap.set(phone, {
                                    id: fullJid,
                                    name: name,
                                    phone: phone,
                                    tag: isRtl ? 'واتساب' : 'WhatsApp',
                                    avatar: c.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                                    source: 'WP'
                                });
                            }
                        });
                    } catch (err) { console.error(err); }
                }));
            }

            const finalContacts = Array.from(allContactsMap.values());
            setContacts(finalContacts);
        } catch (e) {
            console.error("Failed to fetch contacts", e);
        } finally {
            setLoadingContacts(false);
        }
    };

    useEffect(() => {
        if (selectedSourceInstances.length > 0 && audienceType === 'contacts') {
            fetchSpecificContacts();
        }
    }, [audienceType, selectedSourceInstances]);

    // Unique tags for filtering
    const availableTags = ['all', ...new Set(contacts.map(c => c.tag).filter(Boolean))];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const lines = content.split('\n')
                .map(n => n.trim())
                .filter(n => n.length > 5)
                .map(n => n.replace(/\D/g, ''));

            const uniqueLines = [...new Set(lines)];
            setFileNumbers(uniqueLines);
            setFileName(file.name);
        };
        reader.readAsText(file);
    };

    const getRecipients = () => {
        let recips: string[] = [];
        if (audienceType === 'contacts') {
            recips = contacts
                .filter(c => selectedContacts.includes(c.id))
                .map(c => c.phone);
        } else if (audienceType === 'paste') {
            recips = manualNumbers.split('\n').map(n => n.trim()).filter(n => n.length > 5).map(n => n.replace(/\D/g, ''));
        } else if (audienceType === 'file') {
            recips = fileNumbers;
        }
        return [...new Set(recips)];
    };

    const handleLaunch = async () => {
        if (!campaignName.trim() || !message.trim()) {
            alert(isRtl ? 'يرجى إكمال بيانات الحملة' : 'Please complete campaign data');
            return;
        }

        const recipients = getRecipients();
        if (recipients.length === 0) {
            alert(isRtl ? 'يرجى تحديد جمهور للحملة' : 'Please select recipients');
            return;
        }

        if (!confirm(isRtl ? `إطلاق الحملة لـ ${recipients.length} مستلم؟` : `Launch to ${recipients.length} recipients?`)) return;

        // Determine Dynamic Tag for History
        let dynamicType = 'Marketing';
        if (audienceType === 'contacts') {
            if (selectedTag !== 'all') {
                dynamicType = `${selectedTag}`;
            } else if (selectedContacts.length > 0) {
                dynamicType = isRtl ? 'مجموعة مخصصة' : 'Custom Group';
            }
        } else if (audienceType === 'paste') {
            dynamicType = isRtl ? 'إدخال يدوي' : 'Manual Input';
        } else if (audienceType === 'file') {
            dynamicType = isRtl ? 'ملف نصي' : 'File Upload';
        }

        try {
            const response = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: campaignName,
                    message,
                    recipients,
                    senderInstance: selectedInstance, // Now sends 'all' if selected
                    minDelay,
                    maxDelay,
                    rotationCount,
                    scheduledAt: scheduleEnabled ? (document.querySelector('input[type="datetime-local"]') as HTMLInputElement)?.value : null,
                    type: dynamicType
                })
            });

            if (response.ok) {
                alert(isRtl ? 'تم إرسال الحملة للسيرفر، ستعمل الآن في الخلفية.' : 'Campaign sent to server, will process in background.');
                window.location.hash = '#campaigns';
            } else {
                throw new Error('Server error');
            }
        } catch (err) {
            alert(isRtl ? 'فشل إرسال الحملة للسيرفر' : 'Failed to send campaign to server');
        }
    };

    const toggleContact = (id: string) => {
        setSelectedContacts(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filteredContacts.map(c => c.id));
        }
    };

    const handleTagSelect = (tag: string) => {
        setSelectedTag(tag);
        if (tag === 'all') {
            setSelectedContacts([]);
        } else {
            const tagContacts = contacts.filter(c => c.tag === tag).map(c => c.id);
            setSelectedContacts(tagContacts);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [visibleLimit, setVisibleLimit] = useState(50);

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
        const matchesTag = selectedTag === 'all' || c.tag === selectedTag;
        return matchesSearch && matchesTag;
    });

    const displayedContacts = filteredContacts.slice(0, visibleLimit);

    return (
        <div className="p-6 md:p-8 space-y-6 bg-transparent min-h-full page-enter">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => window.location.hash = '#campaigns'} className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:scale-105 transition-all shadow-sm">
                    <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
                <div>
                    <h1 className="text-3xl font-[900] tracking-tight text-slate-900 dark:text-white">{isRtl ? 'إنشاء حملة جديدة' : 'Create New Campaign'}</h1>
                    <p className="text-slate-500 text-sm font-medium">{isRtl ? 'نظام الجدولة الذكي والمتكامل مع CRM' : 'Smart scheduling integrated with CRM'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    {/* Step 1: Campaign Details */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">1</span>
                            {isRtl ? 'تفاصيل الحملة' : 'Campaign Details'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{isRtl ? 'اسم الحملة' : 'Campaign Name'}</label>
                                <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold outline-none" placeholder={isRtl ? 'أدخل اسم الحملة...' : 'Campaign name...'} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{isRtl ? 'جهة الإرسال' : 'Sender'}</label>
                                <select value={selectedInstance} onChange={(e) => setSelectedInstance(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold outline-none appearance-none">
                                    <option value="all">{isRtl ? 'توزيع تلقائي (كل الأرقام)' : 'Auto-Distribute (All)'}</option>
                                    {instances.map((inst, i) => (
                                        <option key={i} value={inst.instanceName}>{inst.instanceName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedInstance === 'all' && (
                            <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-top-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
                                            <RefreshCw className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                                {isRtl ? 'ميزة تبديل الأرقام (Rotation)' : 'Account Rotation'}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                                {isRtl ? 'تغيير الرقم تلقائياً بعد عدد محدد من الرسائل' : 'Switch sender automatically after X messages'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-blue-100/50">
                                        <label className="text-xs font-black text-slate-400 px-2">{isRtl ? 'تبديل كل:' : 'Rotate every:'}</label>
                                        <input
                                            type="number"
                                            value={rotationCount}
                                            onChange={(e) => setRotationCount(Number(e.target.value))}
                                            className="w-16 bg-slate-50 dark:bg-slate-700 border-none rounded-xl p-2 text-center font-black text-blue-600 outline-none"
                                            min="1"
                                        />
                                        <span className="text-xs font-black text-slate-400 pr-2">{isRtl ? 'رسائل' : 'msgs'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Audience Selection */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                            {isRtl ? 'الجمهور المستهدف' : 'Target Audience'}
                        </h3>

                        <div className="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit mb-6">
                            {(['contacts', 'paste', 'file'] as const).map(type => (
                                <button key={type} onClick={() => setAudienceType(type)} className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${audienceType === type ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}>
                                    {isRtl ? (type === 'contacts' ? 'جهات الاتصال' : type === 'paste' ? 'نسخ ولصق' : 'رفع ملف') : type}
                                </button>
                            ))}
                        </div>

                        {audienceType === 'contacts' && (
                            <div className="space-y-4">
                                {/* Tag Filter */}
                                <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Filter className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">{isRtl ? 'تصفية حسب التاج:' : 'Filter by Tag:'}</span>
                                    </div>
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleTagSelect(tag)}
                                            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-500'}`}
                                        >
                                            {tag === 'all' ? (isRtl ? 'الكل' : 'All') : tag}
                                        </button>
                                    ))}
                                </div>

                                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" onChange={handleSelectAll} checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0} className="w-4 h-4 rounded text-blue-600" />
                                            <span className="text-sm font-bold text-slate-600">{isRtl ? 'تحديد الكل' : 'Select All'} ({filteredContacts.length})</span>
                                        </div>
                                        <div className="relative group">
                                            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={isRtl ? 'بحث في القائمة...' : 'Search list...'} className={`${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-white dark:bg-slate-800 rounded-xl text-xs border-none outline-none font-bold shadow-sm`} />
                                        </div>
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                        {loadingContacts ? (
                                            <div className="py-12 text-center text-slate-400 font-bold animate-pulse">{isRtl ? 'جاري مزامنة CRM وواتساب...' : 'Syncing CRM & WhatsApp...'}</div>
                                        ) : displayedContacts.map((c, idx) => (
                                            <div key={idx} onClick={() => toggleContact(c.id)} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedContacts.includes(c.id) ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                                <input type="checkbox" checked={selectedContacts.includes(c.id)} readOnly className="w-4 h-4 rounded text-blue-600 pointer-events-none" />
                                                <img src={c.avatar} className="w-9 h-9 rounded-xl object-cover" loading="lazy" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{c.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter">+{c.phone}</span>
                                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[9px] font-black text-slate-500 flex items-center gap-1">
                                                            <TagIcon className="w-2.5 h-2.5" />
                                                            {c.tag}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>{isRtl ? `تم اختيار: ${selectedContacts.length}` : `Selected: ${selectedContacts.length}`}</span>
                                        <span>{isRtl ? `إجمالي القائمة: ${filteredContacts.length}` : `Total in list: ${filteredContacts.length}`}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {audienceType === 'paste' && (
                            <textarea value={manualNumbers} onChange={e => setManualNumbers(e.target.value)} className="w-full h-40 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-mono outline-none resize-none" placeholder={isRtl ? "أدخل الأرقام هنا (رقم في كل سطر)..." : "Enter numbers here (one per line)..."}></textarea>
                        )}

                        {audienceType === 'file' && (
                            <div className="space-y-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".txt"
                                    onChange={handleFileUpload}
                                />
                                {!fileName ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-all animate-in fade-in zoom-in-95 duration-300"
                                    >
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center">
                                            <FileUp className="w-8 h-8" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black text-slate-700 dark:text-slate-300">
                                                {isRtl ? 'اختر ملف نصي (TXT)' : 'Choose a TXT file'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 font-bold">
                                                {isRtl ? 'يجب أن يحتوي الملف على رقم واحد في كل سطر' : 'The file must contain one number per line'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white text-sm">{fileName}</p>
                                                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mt-0.5">
                                                    {isRtl ? `${fileNumbers.length} رقم تم اكتشافه` : `${fileNumbers.length} numbers detected`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setFileName(''); setFileNumbers([]); }}
                                            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 shadow-sm flex items-center justify-center transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Step 3: Message & Scheduling */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">3</span>
                            {isRtl ? 'المحتوى والجدولة' : 'Content & Scheduling'}
                        </h3>
                        <div className="space-y-6">
                            <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full min-h-[160px] bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] p-6 text-slate-800 dark:text-white font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/10 transition-all resize-y" placeholder={isRtl ? "محتوى الرسالة..." : "Your message content..."}></textarea>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-4">
                                    <label className="text-xs font-black uppercase text-slate-400">{isRtl ? 'الفواصل الزمنية (ثانية)' : 'Delay Intervals (s)'}</label>
                                    <div className="flex items-center gap-4">
                                        <input type="number" value={minDelay} onChange={e => setMinDelay(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 text-sm font-black text-center" />
                                        <span className="text-slate-300">-</span>
                                        <input type="number" value={maxDelay} onChange={e => setMaxDelay(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 text-sm font-black text-center" />
                                    </div>
                                </div>
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-4 flex flex-col justify-center">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase text-slate-400">{isRtl ? 'جدولة الرسالة' : 'Schedule Message'}</span>
                                        <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-all relative ${scheduleEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`} onClick={() => setScheduleEnabled(!scheduleEnabled)}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-all absolute top-1 ${scheduleEnabled ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`}></div>
                                        </div>
                                    </div>
                                    <input type="datetime-local" disabled={!scheduleEnabled} className="w-full bg-white dark:bg-slate-800 rounded-xl p-3 text-xs font-black outline-none disabled:opacity-30" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Launch Button */}
                    <div className="pt-4 flex justify-end">
                        {sendingProgress ? (
                            <div className="w-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 rounded-3xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center animate-pulse"><Send className="w-5 h-5" /></div>
                                        <span className="font-black text-emerald-900 dark:text-emerald-400">{isRtl ? 'جاري إرسال الحملة...' : 'Sending Campaign...'}</span>
                                    </div>
                                    <span className="font-black text-emerald-600">{Math.round((sendingProgress.current / sendingProgress.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-emerald-200 dark:bg-emerald-800/30 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-emerald-600">
                                    <span>{isRtl ? `نجح: ${sendingProgress.success}` : `Success: ${sendingProgress.success}`}</span>
                                    <span>{isRtl ? `فشل: ${sendingProgress.failed}` : `Failed: ${sendingProgress.failed}`}</span>
                                    <span>{sendingProgress.current} / {sendingProgress.total}</span>
                                </div>
                            </div>
                        ) : (
                            <button onClick={handleLaunch} className="px-12 py-5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all flex items-center gap-3">
                                <Send className="w-5 h-5" />
                                {isRtl ? 'إطلاق الحملة الآن' : 'Launch Campaign Now'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview Column */}
                <div className="lg:col-span-4 hidden lg:block sticky top-6 h-fit">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden h-[650px] relative">
                        <div className={`bg-[#075E54] p-4 pt-10 text-white flex ${isRtl ? 'flex-row-reverse' : 'items-center'} gap-3`}>
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"><Users className="w-5 h-5" /></div>
                            <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : ''}`}>
                                <p className="text-sm font-bold truncate">{isRtl ? 'اسم شركتك' : 'Your Company'}</p>
                                <p className="text-[10px] opacity-70">{isRtl ? 'متصل الآن' : 'Online'}</p>
                            </div>
                        </div>
                        <div className="bg-[#e5ded8] dark:bg-[#0b141a] h-full p-4 bg-opacity-90">
                            <div className={`bg-white dark:bg-[#005c4b] p-3 rounded-xl ${isRtl ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-sm max-w-[85%] text-slate-800 dark:text-white text-sm ${isRtl ? 'mr-auto' : ''}`}>
                                {message || (isRtl ? 'معاينة الرسالة هنا...' : 'Message preview here...')}
                                <div className={`text-[9px] ${isRtl ? 'text-left' : 'text-right'} mt-1 opacity-50`}>10:30 PM</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 w-full p-3 bg-slate-100 flex items-center gap-2">
                            <div className="flex-1 bg-white h-9 rounded-full"></div>
                            <div className="w-10 h-10 bg-[#00a884] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaign;
