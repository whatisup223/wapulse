import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  Smartphone,
  Trash2,
  Server,
  CheckCircle,
  Battery,
  Signal,
  QrCode,
  Settings,
  Lightbulb,
  Wifi,
  WifiOff,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ConnectionProps {
  language: 'en' | 'ar';
  userId: string;
  sessions: string[];
  onAddSession: () => void;
  onSwitchSession: (id: string) => void;
  onRemoveSession: (id: string) => void;
}

interface Instance {
  instanceName: string;
  name?: string;
  pushName?: string;
  ownerJid?: string;
  profileName?: string;
  profilePicUrl?: string;
  connectionStatus: string;
  state?: string;
}

const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const Connection: React.FC<ConnectionProps> = ({ language, userId }) => {
  const isRtl = language === 'ar';

  // State
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');

  // Fetch all instances
  const fetchInstances = async () => {
    try {
      const savedUser = localStorage.getItem('wapulse_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (!user?.id) return;

      const res = await fetch('/api/instances', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id
        }
      });
      const data = await res.json();
      const records = Array.isArray(data) ? data : [];

      // Filter & Normalize instances
      const validInstances = records
        .map((i: any) => {
          const base = i.instance || i;

          // Extract useful name, ignore generic ones like 'WhatsApp Business' in English and Arabic
          let pName = base.pushName || base.profileName || i.pushName || i.profileName || null;
          if (pName && (
            pName.includes('WhatsApp') ||
            pName.includes('Business') ||
            pName.includes('واتساب') ||
            pName.includes('للأعمال')
          )) {
            pName = null;
          }

          return {
            ...i,
            ...base,
            instanceName: base.instanceName || base.name || i.instanceName || 'Unknown',
            profileName: pName,
            profilePicUrl: base.profilePicUrl || i.profilePicUrl || null
          };
        })
        .filter((i: any) => i.instanceName && i.instanceName !== 'Unknown');

      setInstances(validInstances);

      // Update selected instance if it exists
      if (selectedInstance) {
        const updated = validInstances.find((i: Instance) => i.instanceName === selectedInstance.instanceName);
        if (updated) setSelectedInstance(updated);
      } else if (validInstances.length > 0 && !selectedInstance) {
        setSelectedInstance(validInstances[0]);
      }
    } catch (error) {
      console.error('Error fetching instances:', error);
    }
  };

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 5000); // Auto refresh list
    return () => clearInterval(interval);
  }, []);

  // Fetch QR Code for selected instance
  useEffect(() => {
    if (selectedInstance?.instanceName && selectedInstance.connectionStatus !== 'open') {
      const getQR = async () => {
        try {
          const res = await fetch(`${EVOLUTION_URL}/instance/connect/${selectedInstance.instanceName}`, {
            headers: { 'apikey': EVOLUTION_API_KEY as string }
          });
          const data = await res.json();
          if (data?.base64 || data?.qrcode) {
            setQrCode(data.base64 || data.qrcode);
          }
        } catch (e) {
          console.error('Error fetching QR:', e);
        }
      };
      getQR();
      const qrInterval = setInterval(getQR, 4000); // Dynamic QR refresh
      return () => clearInterval(qrInterval);
    } else {
      setQrCode('');
    }
  }, [selectedInstance?.instanceName, selectedInstance?.connectionStatus]);

  const handleCreateInstance = async () => {
    if (!newInstanceName.trim()) return;
    setLoading(true);
    console.log('Attempting to create instance:', newInstanceName);

    try {
      const response = await fetch(`${EVOLUTION_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY as string
        },
        body: JSON.stringify({
          instanceName: newInstanceName,
          token: '',
          qrcode: true,
          integration: "WHATSAPP-BAILEYS"
        })
      });

      // Link to User
      const savedUser = localStorage.getItem('wapulse_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (user?.id) {
        await fetch('/api/instances/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instanceName: newInstanceName,
            userId: user.id
          })
        });
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data?.message || JSON.stringify(data) || 'Unknown error');
      }

      // Success
      setNewInstanceName('');
      setShowAddModal(false);

      // Refresh list
      await fetchInstances();

      // Find and select the new instance
      const newInst = {
        instanceName: newInstanceName,
        connectionStatus: 'close',
        ownerJid: ''
      };

      // Auto select to trigger QR fetch in useEffect
      setSelectedInstance(newInst as any);

      // Check if QR is directly in response
      if (data.qrcode?.base64 || data.qrcode?.qrcode) {
        setQrCode(data.qrcode.base64 || data.qrcode.qrcode);
      } else {
        // If not, fetch it specifically
        setTimeout(async () => {
          try {
            const qrRes = await fetch(`${EVOLUTION_URL}/instance/connect/${newInstanceName}`, {
              headers: { 'apikey': EVOLUTION_API_KEY as string }
            });
            const qrData = await qrRes.json();
            if (qrData?.base64 || qrData?.qrcode) {
              setQrCode(qrData.base64 || qrData.qrcode);
            }
          } catch (e) {
            console.error('Failed to fetch initial QR', e);
          }
        }, 1500);
      }

      alert(isRtl ? 'تم إنشاء الرقم بنجاح!' : 'Instance created successfully!');

    } catch (e: any) {
      console.error('Error creating instance:', e);
      alert(`${isRtl ? 'حدث خطأ' : 'Error'}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstance = async (name: string) => {
    if (!confirm(isRtl ? 'هل أنت متأكد من حذف هذا الرقم؟' : 'Are you sure you want to delete this number?')) return;
    try {
      await fetch(`${EVOLUTION_URL}/instance/delete/${name}`, {
        method: 'DELETE',
        headers: { 'apikey': EVOLUTION_API_KEY as string }
      });
      // Refresh list
      await fetchInstances();
      setSelectedInstance(null);
    } catch (e) {
      console.error('Error deleting instance:', e);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-transparent min-h-full page-enter">

      {/* Add Instance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 pb-4">
              <h3 className="text-2xl font-[900] text-slate-900 dark:text-white mb-2">{isRtl ? 'إضافة رقم جديد' : 'Add New Number'}</h3>
              <p className="text-slate-500 text-sm">{isRtl ? 'أدخل اسم مميز لهذا الرقم (مثلاً: خدمة العملاء)' : 'Enter a unique name for this connection (e.g. Support)'}</p>
            </div>
            <div className="px-8 pb-6">
              <input
                type="text"
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value)}
                placeholder={isRtl ? 'اسم الجلسة (إنجليزي فقط يفضل)' : 'Instance Name'}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
              />
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-700">{isRtl ? 'إلغاء' : 'Cancel'}</button>
              <button
                onClick={handleCreateInstance}
                disabled={loading || !newInstanceName.trim()}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isRtl ? 'إنشاء' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 dark:text-white mb-2">{isRtl ? 'إدارة الربط' : 'Connections'}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{isRtl ? 'أضف وأدر أرقام واتساب الخاصة بك من مكان واحد.' : 'Add and manage your WhatsApp numbers from one place.'}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {isRtl ? 'إضافة رقم' : 'Add Number'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Instances List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-[900] text-slate-900 dark:text-white px-2">{isRtl ? 'الأرقام المتاحة' : 'Available Numbers'}</h3>
          <div className="space-y-3">
            {instances.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-white/5">
                <Smartphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 font-bold text-sm">{isRtl ? 'لا توجد أرقام مضافة' : 'No numbers added'}</p>
              </div>
            ) : (
              instances.map((inst, idx) => (
                <div
                  key={`${inst.instanceName}-${idx}`}
                  onClick={() => setSelectedInstance(inst)}
                  className={`group p-4 rounded-[1.5rem] border cursor-pointer transition-all relative ${selectedInstance?.instanceName === inst.instanceName
                    ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-500/30'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 ${inst.connectionStatus === 'open'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                      }`}>
                      {inst.profilePicUrl ? (
                        <img src={inst.profilePicUrl} alt={inst.instanceName} className="w-full h-full object-cover" />
                      ) : (
                        <Smartphone className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate">{inst.instanceName}</h4>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {inst.ownerJid ? `+${inst.ownerJid.split('@')[0]}` : (isRtl ? 'غير متصل' : 'Not Connected')}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${inst.connectionStatus === 'open' ? 'bg-emerald-500' : 'bg-red-400'}`}></div>
                  </div>

                  {/* Delete Button (Hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const nameToDelete = inst.instanceName || inst.name;
                      console.log('Deleting instance:', nameToDelete, 'Full object:', inst);
                      handleDeleteInstance(nameToDelete);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title={isRtl ? 'حذف الرقم' : 'Delete Number'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Connection Detail / QR */}
        <div className="lg:col-span-2">
          {selectedInstance ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden relative min-h-[500px] flex flex-col">
              {/* Status Bar */}
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <h2 className="text-2xl font-[900] text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedInstance.instanceName}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedInstance.connectionStatus === 'open'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                      }`}>
                      {selectedInstance.connectionStatus === 'open' ? 'Online' : 'Offline'}
                    </span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
                    <Server className="w-3 h-3" /> API Instance ID: {selectedInstance.instanceName}
                  </p>
                </div>
                {selectedInstance.connectionStatus === 'open' && (
                  <button onClick={() => handleDeleteInstance(selectedInstance.instanceName)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl font-bold text-xs transition-colors border border-transparent hover:border-red-100">
                    {isRtl ? 'تسجيل خروج' : 'Logout'}
                  </button>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center relative">
                {selectedInstance.connectionStatus === 'open' ? (
                  <div className="animate-in zoom-in duration-300">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
                      <img
                        src={selectedInstance.profilePicUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png"}
                        className="w-32 h-32 rounded-[2rem] shadow-2xl relative z-10 bg-white"
                        alt="Profile"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-white dark:border-slate-900 z-20">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-[900] text-slate-900 dark:text-white mb-2">
                      {selectedInstance.profileName || selectedInstance.instanceName || (isRtl ? 'واتساب' : 'WhatsApp')}
                    </h3>
                    <p className="text-xl text-slate-500 font-mono font-medium mb-6">
                      +{selectedInstance.ownerJid?.split('@')[0]}
                    </p>
                    <div className="flex justify-center gap-4">
                      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3">
                        <Battery className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">80%</span>
                      </div>
                      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3">
                        <Signal className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">Good</span>
                      </div>
                    </div>
                  </div>
                ) : qrCode ? (
                  <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
                    <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-slate-100 dark:border-slate-800 mb-6 relative group">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <img src={qrCode} className="w-64 h-64 object-contain relative z-10" alt="QR" />
                    </div>
                    <h4 className="text-xl font-[900] text-slate-900 dark:text-white mb-2">{isRtl ? 'امسح الرمز للربط' : 'Scan QR to Connect'}</h4>
                    <p className="text-slate-500 max-w-sm">{isRtl ? 'افتح واتساب > الأجهزة المرتبطة > ربط جهاز' : 'Open WhatsApp > Linked Devices > Link a Device'}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 opacity-50">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="font-bold uppercase tracking-widest text-xs text-slate-400">{isRtl ? 'جاري الاتصال...' : 'Connecting...'}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-[900] text-slate-900 dark:text-white mb-2">{isRtl ? 'اختر رقماً للإدارة' : 'Select a Number'}</h3>
              <p className="text-slate-400 max-w-xs">{isRtl ? 'اختر رقماً من القائمة الجانبية أو أضف رقماً جديداً للبدء.' : 'Select a number from the list or add a new one to get started.'}</p>
            </div>
          )}
        </div>

        {/* Instructions Card */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm">
          <h3 className="text-xl font-[900] text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </span>
            {isRtl ? 'كيفية ربط جهازك' : 'How to Connect Your Device'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Step 1 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl relative overflow-hidden group transition-all hover:-translate-y-1 hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">{isRtl ? '1. افتح واتساب' : '1. Open WhatsApp'}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{isRtl ? 'افتح تطبيق واتساب على هاتفك المحمول.' : 'Open WhatsApp on your mobile phone.'}</p>
            </div>
            {/* Step 2 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl relative overflow-hidden group transition-all hover:-translate-y-1 hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">{isRtl ? '2. الأجهزة المرتبطة' : '2. Linked Devices'}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{isRtl ? 'اذهب للإعدادات > الأجهزة المرتبطة > ربط جهاز.' : 'Go to Settings > Linked Devices > Link a Device.'}</p>
            </div>
            {/* Step 3 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl relative overflow-hidden group transition-all hover:-translate-y-1 hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                <QrCode className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">{isRtl ? '3. امسح الرمز' : '3. Scan QR Code'}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{isRtl ? 'وجه الكاميرا نحو رمز QR الظاهر على الشاشة.' : 'Point your camera at the QR code shown on screen.'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Connection;
