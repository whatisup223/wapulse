
import React, { useState, useEffect, useCallback } from 'react';
import { QrCode, Smartphone, CheckCircle, AlertCircle, RefreshCw, LogOut, Loader2 } from 'lucide-react';
import { WahaSession } from '../types';

interface ConnectionProps {
  language: 'en' | 'ar';
  userId: string;
}

const WAHA_URL = import.meta.env.VITE_WAHA_URL;
const WAHA_API_KEY = import.meta.env.VITE_WAHA_API_KEY;

const Connection: React.FC<ConnectionProps> = ({ language, userId }) => {
  const isRtl = language === 'ar';
  const SESSION_NAME = userId;
  const [session, setSession] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${WAHA_URL}/instance/fetchInstances?instanceName=${SESSION_NAME}`, {
        headers: { 'apikey': WAHA_API_KEY }
      });

      const data = await response.json();
      const instances = Array.isArray(data) ? data : (data.value || []);
      const inst = instances.find((i: any) => i.instanceName === SESSION_NAME || i.name === SESSION_NAME);

      if (!inst) {
        await startSession();
        return;
      }

      // Clear error if we successfully reached the API
      setError(null);

      // Evolution API status mapping
      const state = inst.connectionStatus || inst.state || 'close';
      const status = state.toLowerCase() === 'open' ? 'WORKING' : 'SCAN_QR';

      setSession({
        status: status,
        me: inst.ownerJid || inst.owner || inst.number ? {
          id: inst.ownerJid || inst.owner || inst.number,
          pushName: inst.profileName || 'WhatsApp User'
        } : null
      });

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

  const startSession = async () => {
    try {
      // First check if it exists but is just disconnected
      const checkRes = await fetch(`${WAHA_URL}/instance/fetchInstances`, {
        headers: { 'apikey': WAHA_API_KEY }
      });
      const data = await checkRes.json();

      // Evolution API can return array or { value: [] }
      const instances = Array.isArray(data) ? data : (data.value || []);
      const exists = instances.find((i: any) => i.instanceName === SESSION_NAME || i.name === SESSION_NAME);

      if (!exists) {
        const response = await fetch(`${WAHA_URL}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': WAHA_API_KEY
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
    }
  };

  const stopSession = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${WAHA_URL}/instance/delete/${SESSION_NAME}`, {
        method: 'DELETE',
        headers: { 'apikey': WAHA_API_KEY }
      });
      if (!response.ok) throw new Error('Failed to delete instance');
      setSession(null);
      setQrCode(null);
      fetchSessionStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchQR = async () => {
    try {
      const response = await fetch(`${WAHA_URL}/instance/connect/${SESSION_NAME}`, {
        headers: { 'apikey': WAHA_API_KEY }
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

      const response = await fetch(`${WAHA_URL}/message/sendText/${SESSION_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': WAHA_API_KEY
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
    fetchSessionStatus();
    const interval = setInterval(fetchSessionStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchSessionStatus]);

  if (loading && !session) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 page-enter">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">{isRtl ? 'ربط الحساب' : 'Account Connection'}</h1>
        <p className="text-slate-500 dark:text-slate-400">{isRtl ? 'اربط رقم واتساب الخاص بك لبدء إرسال الرسائل' : 'Link your WhatsApp number to start sending messages.'}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-6">
          {session?.status === 'WORKING' ? (
            <div className="w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex flex-col items-center justify-center border-4 border-emerald-500/20">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-10 h-10" />
              </div>
              <p className="font-black text-emerald-600 dark:text-emerald-400 text-center px-4">
                {isRtl ? 'تم الاتصال بنجاح' : 'Connected Successfully'}
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
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#128C7E] text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  {isRtl ? 'يتحدث كل ثانية' : 'Live Update'}
                </div>
              )}
            </div>
          )}

          <div className="text-center space-y-2">
            <h3 className="font-bold text-lg dark:text-white">
              {session?.status === 'WORKING' ? (isRtl ? 'حسابك جاهز' : 'Account Ready') : (isRtl ? 'امسح رمز الاستجابة السريعة' : 'Scan the QR Code')}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              {session?.status === 'WORKING'
                ? (isRtl ? 'يمكنك الآن البدء في إرسال الرسائل وإدارة محادثاتك.' : 'You can now start sending messages and managing your chats.')
                : (isRtl ? 'افتح واتساب على هاتفك، اذهب إلى الإعدادات > الأجهزة المرتبطة > ربط جهاز.' : 'Open WhatsApp on your phone, go to Settings > Linked Devices > Link a Device.')
              }
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`transition-all duration-500 ${session?.status === 'WORKING' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'} p-6 rounded-2xl border`}>
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${session?.status === 'WORKING' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-bold ${session?.status === 'WORKING' ? 'text-emerald-900 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {isRtl ? 'الحالة: ' : 'Status: '}
                    {session?.status === 'WORKING' ? (isRtl ? 'متصل' : 'Connected') : (isRtl ? 'غير متصل' : 'Disconnected')}
                  </h4>
                  {session?.status === 'WORKING' && (
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-800 px-2 py-0.5 rounded">Active</span>
                  )}
                </div>
                <p className="text-sm opacity-60 dark:text-white">
                  {session?.me?.pushName ? `${session.me.pushName} (${session.me.id.split('@')[0]})` : (isRtl ? 'بانتظار الربط...' : 'Waiting for connection...')}
                </p>
                <div className="mt-4 flex gap-2">
                  {session?.status === 'WORKING' && (
                    <button
                      onClick={sendTestMessage}
                      className="text-xs font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-800/40 px-4 py-2 rounded-xl hover:bg-emerald-200 transition-colors"
                    >
                      {isRtl ? 'اختبار الإرسال' : 'Test Message'}
                    </button>
                  )}
                  <button
                    onClick={stopSession}
                    className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3 h-3" />
                    {isRtl ? 'إعادة ضبط الجلسة' : 'Logout / Reset'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="font-bold dark:text-white">{isRtl ? 'تعليمات الربط' : 'Linking Instructions'}</h4>
            <div className="space-y-4">
              {[
                { step: 1, text: isRtl ? 'افتح واتساب على هاتفك المحمول.' : 'Open WhatsApp on your mobile phone.' },
                { step: 2, text: isRtl ? 'اضغط على القائمة أو الإعدادات واختر الأجهزة المرتبطة.' : 'Tap Menu or Settings and select Linked Devices.' },
                { step: 3, text: isRtl ? 'اضغط على ربط جهاز.' : 'Tap on Link a Device.' },
                { step: 4, text: isRtl ? 'وجه هاتفك نحو الشاشة لمسح الرمز.' : 'Point your phone to this screen to capture the code.' }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connection;
