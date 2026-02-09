
import React, { useState, useEffect, useCallback } from 'react';
import { QrCode, Smartphone, CheckCircle, AlertCircle, RefreshCw, LogOut, Loader2, Plus, Trash2, User } from 'lucide-react';
import { EvolutionSession } from '../types';

interface ConnectionProps {
  language: 'en' | 'ar';
  userId: string;
  sessions: string[];
  onAddSession: () => void;
  onSwitchSession: (id: string) => void;
  onRemoveSession: (id: string) => void;
  onSessionReset?: () => void;
}

const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const Connection: React.FC<ConnectionProps> = ({
  language,
  userId,
  sessions,
  onAddSession,
  onSwitchSession,
  onRemoveSession,
  onSessionReset
}) => {
  const isRtl = language === 'ar';
  const SESSION_NAME = userId;
  const [session, setSession] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionNames, setSessionNames] = useState<Record<string, string>>({}); // Map IDs to display names (pushName or phone)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const fetchSessionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${EVOLUTION_URL}/instance/fetchInstances?instanceName=${SESSION_NAME}`, {
        headers: { 'apikey': EVOLUTION_API_KEY }
      });

      const data = await response.json();
      const instances = Array.isArray(data) ? data : (data.value || []);
      const inst = instances.find((i: any) => i.instanceName === SESSION_NAME || i.name === SESSION_NAME);

      if (!inst) {
        await startSession();
        // After starting session, immediately set status to SCAN_QR and fetch QR
        setSession({ status: 'SCAN_QR', me: null });
        fetchQR();
        return;
      }

      // Clear error if we successfully reached the API
      setError(null);

      // Evolution API status mapping
      const state = inst.connectionStatus || inst.state || 'close';
      const status = state.toLowerCase() === 'open' ? 'WORKING' : 'SCAN_QR';

      const ownerData = inst.ownerJid || inst.owner || inst.number ? {
        id: inst.ownerJid || inst.owner || inst.number,
        pushName: inst.profileName || 'WhatsApp User'
      } : null;

      setSession({
        status: status,
        me: ownerData
      });

      if (ownerData) {
        setSessionNames(prev => ({
          ...prev,
          [SESSION_NAME]: ownerData.pushName || ownerData.id.split('@')[0]
        }));
      }

      if (status === 'SCAN_QR') {
        fetchQR();
      } else {
        setQrCode(null);
      }
    } catch (err: any) {
      console.error('Session status fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [SESSION_NAME]);

  // Fetch names for all sessions to display in the list
  useEffect(() => {
    const fetchAllSessionNames = async () => {
      try {
        const response = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
          headers: { 'apikey': EVOLUTION_API_KEY }
        });
        const data = await response.json();
        const instances: any[] = Array.isArray(data) ? data : (data.value || []);

        const nameMap: Record<string, string> = {};
        sessions.forEach(sessId => {
          const inst = instances.find(i => i.instanceName === sessId || i.name === sessId);
          if (inst) {
            const owner = inst.ownerJid || inst.owner || inst.number;
            const name = inst.profileName;
            if (name) nameMap[sessId] = name;
            else if (owner) nameMap[sessId] = owner.split('@')[0];
          }
        });
        setSessionNames(prev => ({ ...prev, ...nameMap }));
      } catch (e) {
        console.error(e);
      }
    };
    if (sessions.length > 0) fetchAllSessionNames();
  }, [sessions]);


  const startSession = async () => {
    try {
      // First check if it exists but is just disconnected
      const checkRes = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      const data = await checkRes.json();

      // Evolution API can return array or { value: [] }
      const instances = Array.isArray(data) ? data : (data.value || []);
      const exists = instances.find((i: any) => i.instanceName === SESSION_NAME || i.name === SESSION_NAME);

      if (!exists) {
        const response = await fetch(`${EVOLUTION_URL}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
          },
          body: JSON.stringify({
            instanceName: SESSION_NAME,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          // If already exists, we can ignore the error
          if (response.status === 400 && errData.response?.message?.includes('already exists')) {
            setError(null);
            return;
          }
          throw new Error(errData.response?.message?.[0] || 'Failed to create instance');
        }
      }

      setError(null); // Success or already exists
    } catch (err: any) {
      console.error('Start session error:', err);
      setError(err.message);
      throw err; // Re-throw to prevent loading UI from clearing prematurely in fetchSessionStatus if we didn't actually start
    }
  };

  const checkDeleteSession = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSessionToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      setLoading(true);
      const response = await fetch(`${EVOLUTION_URL}/instance/delete/${sessionToDelete}`, {
        method: 'DELETE',
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      // if (!response.ok) throw new Error('Failed to delete instance'); 

      onRemoveSession(sessionToDelete);
    } catch (err: any) {
      setError(err.message);
      onRemoveSession(sessionToDelete);
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  };

  const fetchQR = async () => {
    try {
      const response = await fetch(`${EVOLUTION_URL}/instance/connect/${SESSION_NAME}`, {
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.base64) {
        // Evolution returns data:image/png;base64,...
        setQrCode(data.base64.split(',')[1] || data.base64);
      }
    } catch (err) {
      console.error('Failed to fetch QR', err);
    }
  };

  const sendTestMessage = async () => {
    if (!session?.me?.id) {
      alert(isRtl ? 'لم يتم العثور على بيانات حسابك بعد. يرجى الانتظار قليلاً أو إعادة تحميل الصفحة.' : 'Account data not found yet. Please wait a moment or refresh the page.');
      return;
    }

    try {
      // Clean number to include only digits (Evolution API expects only numbers)
      const cleanNumber = session.me.id.split('@')[0].replace(/\D/g, '');

      const response = await fetch(`${EVOLUTION_URL}/message/sendText/${SESSION_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: cleanNumber,
          text: isRtl ? 'تم الاتصال بنجاح بموقع Wapulse عبر Evolution API! ✅' : 'Successfully connected to Wapulse via Evolution API! ✅'
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.response?.message?.[0] || 'Failed to send message');
      }

      alert(isRtl ? 'تم إرسال رسالة تجريبية لهاتفك!' : 'Test message sent to your phone!');
    } catch (err: any) {
      alert((isRtl ? 'فشل الإرسال: ' : 'Failed to send: ') + err.message);
    }
  };

  useEffect(() => {
    setLoading(true); // Reset loading when session changes
    setError(null);
    setSession(null);
    setQrCode(null); // Clear old QR

    // Immediate execution
    fetchSessionStatus();

    const interval = setInterval(fetchSessionStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchSessionStatus, userId]); // Depend on userId to refetch when switching

  // REMOVED: Early return for loading to prevent full page white screen
  // if (loading && !session && !error) { ... }

  // Handle case where no sessions exist
  if (!userId || sessions.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8 page-enter h-full flex flex-col">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isRtl ? 'إدارة الأرقام' : 'Manage Connections'}</h1>
          <p className="text-slate-500 dark:text-slate-400">{isRtl ? 'اربط وأدر أرقام واتساب الخاصة بك من مكان واحد.' : 'Link and manage your WhatsApp numbers from one place.'}</p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-12 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
              <Smartphone className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{isRtl ? 'لا توجد أرقام مربوطة' : 'No Linked Numbers'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {isRtl ? 'لم تقم بربط أي رقم واتساب بعد. أضف رقمك الأول للبدء في استخدام النظام.' : 'You haven\'t linked any WhatsApp numbers yet. Add your first number to start using the system.'}
            </p>
            <button
              onClick={onAddSession}
              className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              {isRtl ? 'إضافة رقم جديد' : 'Add New Number'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isRtl ? 'إدارة الأرقام' : 'Manage Connections'}</h1>
        <p className="text-slate-500 dark:text-slate-400">{isRtl ? 'اربط وأدر أرقام واتساب الخاصة بك من مكان واحد.' : 'Link and manage your WhatsApp numbers from one place.'}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 py-2">

        {/* Sidebar List */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 flex flex-col shadow-sm">
          <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white">{isRtl ? 'أرقامي' : 'My Numbers'}</h3>
            <button
              onClick={onAddSession}
              className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              title={isRtl ? 'إضافة رقم جديد' : 'Add New Number'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 space-y-2">
            {sessions.map((sessId) => (
              <div
                key={sessId}
                onClick={() => onSwitchSession(sessId)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${userId === sessId
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-500/50'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userId === sessId ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm truncate ${userId === sessId ? 'text-emerald-900 dark:text-emerald-400' : 'dark:text-white'}`}>
                    {sessionNames[sessId] || (isRtl ? 'رقم جديد' : 'New Number')}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {sessId}
                  </p>
                </div>
                <button
                  onClick={(e) => checkDeleteSession(sessId, e)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Details View */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm flex flex-col p-6">

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
          )}

          {loading && !session && !error ? (
            <div className="flex flex-col items-center justify-center space-y-6 flex-1 min-h-[400px]">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
              <p className="text-slate-400 font-bold animate-pulse">{isRtl ? 'جاري تهيئة الحساب...' : 'Initializing Session...'}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center space-y-6 flex-1 min-h-[400px]">
                {session?.status === 'WORKING' ? (
                  <div className="w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex flex-col items-center justify-center border-4 border-emerald-500/20">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-center px-4">
                      {isRtl ? 'تم الاتصال بنجاح' : 'Connected Successfully'}
                    </p>
                    <p className="text-sm text-center text-emerald-600/60 dark:text-emerald-400/60 mt-2 px-2">
                      {session.me?.pushName} <br />
                      {session.me?.id?.split('@')[0]}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-4 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden">
                      {qrCode ? (
                        <div className="p-4 bg-white rounded-xl">
                          <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="w-48 h-48" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {session?.status === 'STARTING' ? 'Starting Session...' : 'Loading QR Code...'}
                          </p>
                        </div>
                      )}
                    </div>
                    {qrCode && (
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#128C7E] text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg w-max">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        {isRtl ? 'يتحدث كل ثانية' : 'Live Update'}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center space-y-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {session?.status === 'WORKING' ? (isRtl ? 'حسابك جاهز' : 'Account Ready') : (isRtl ? 'امسح رمز الاستجابة السريعة' : 'Scan the QR Code')}
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">
                    {session?.status === 'WORKING'
                      ? (isRtl ? 'يمكنك الآن البدء في إرسال الرسائل' : 'You can now start sending messages')
                      : (isRtl ? 'افتح واتساب على هاتفك، اذهب إلى الإعدادات > الأجهزة المرتبطة > ربط جهاز.' : 'Open WhatsApp on your phone, go to Settings > Linked Devices > Link a Device.')
                    }
                  </p>
                </div>
              </div>

              <div className="border-t dark:border-slate-800 pt-6 mt-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${session?.status === 'WORKING' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    {session?.status === 'WORKING' ? (isRtl ? 'متصل' : 'Connected') : (isRtl ? 'غير متصل' : 'Disconnected')}
                  </span>
                </div>

                <div className="flex gap-3">
                  {session?.status === 'WORKING' && (
                    <button
                      onClick={sendTestMessage}
                      className="text-xs font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-800/40 px-4 py-2 rounded-xl hover:bg-emerald-200 transition-colors"
                    >
                      {isRtl ? 'اختبار' : 'Test'}
                    </button>
                  )}
                  <button
                    onClick={() => checkDeleteSession(userId)}
                    className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3 h-3" />
                    {isRtl ? 'إزالة هذا الحساب' : 'Remove Account'}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Instructions Card - Full Width Bottom */}
      <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-6">{isRtl ? 'تعليمات الربط' : 'Linking Instructions'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: 1, text: isRtl ? 'افتح واتساب على هاتفك المحمول.' : 'Open WhatsApp on your mobile phone.' },
            { step: 2, text: isRtl ? 'اضغط على القائمة أو الإعدادات واختر الأجهزة المرتبطة.' : 'Tap Menu or Settings and select Linked Devices.' },
            { step: 3, text: isRtl ? 'اضغط على ربط جهاز.' : 'Tap on Link a Device.' },
            { step: 4, text: isRtl ? 'وجه هاتفك نحو الشاشة لمسح الرمز.' : 'Point your phone to this screen to capture the code.' }
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-sm h-full">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">
                {item.step}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border dark:border-slate-800">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">{isRtl ? 'حذف الرقم' : 'Delete Number'}</h3>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
              {isRtl
                ? 'هل أنت متأكد من رغبتك في حذف هذا الرقم؟ سيتم فصل الاتصال وحذف البيانات.'
                : 'Are you sure you want to delete this number? This will disconnect the session and remove data.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={confirmDeleteSession}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                {isRtl ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Connection;
