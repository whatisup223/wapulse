
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, MoreVertical, Send, Paperclip, Smile, CheckCheck, MessageSquare, ChevronLeft, ChevronRight, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';

interface InboxProps {
  language: 'en' | 'ar';
  userId: string;
}

interface WahaChat {
  id: string;
  name: string;
  unreadCount: number;
  timestamp: number;
  profilePicUrl?: string;
  lastMessage?: string | any;
}

interface WahaMessage {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: number;
  chatId: string;
}

const WAHA_URL = import.meta.env.VITE_WAHA_URL;
const WAHA_API_KEY = import.meta.env.VITE_WAHA_API_KEY;

const Inbox: React.FC<InboxProps> = ({ language, userId }) => {
  const isRtl = language === 'ar';
  const SESSION_NAME = userId;

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentChatIdRef = useRef<string | null>(null);

  const [chats, setChats] = useState<WahaChat[]>([]);
  const [messages, setMessages] = useState<WahaMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'WORKING' | 'SCAN_QR' | 'LOADING'>('LOADING');
  const lastScrollMsgId = useRef<string | null>(null);

  const fetchSessionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${WAHA_URL}/instance/fetchInstances?instanceName=${SESSION_NAME}`, {
        headers: { 'apikey': WAHA_API_KEY }
      });
      const data = await response.json();
      const instances = Array.isArray(data) ? data : (data.value || []);
      const inst = instances.find((i: any) => i.instanceName === SESSION_NAME || i.name === SESSION_NAME);

      const state = inst?.connectionStatus || inst?.state || 'close';
      setSessionStatus(state.toLowerCase() === 'open' ? 'WORKING' : 'SCAN_QR');
    } catch (err) {
      setSessionStatus('SCAN_QR');
    }
  }, [SESSION_NAME]);

  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch(`${WAHA_URL}/chat/findChats/${SESSION_NAME}`, {
        method: 'POST',
        headers: {
          'apikey': WAHA_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();

      const rawChats = Array.isArray(data) ? data : [];
      const chatMap = new Map<string, WahaChat>();

      rawChats.forEach((c: any) => {
        const fullJid = (c.remoteJid || (c.lastMessage?.key?.remoteJid) || c.id || '').toLowerCase().trim();
        if (!fullJid || fullJid.includes('@newsletter') || fullJid.includes('broadcast') || fullJid.includes('@status')) return;

        const [idPart, domain] = fullJid.split('@');
        const name = c.pushName || c.name || idPart || (isRtl ? 'محادثة' : 'Chat');
        const timestamp = c.lastMessage?.messageTimestamp || (c.updatedAt ? Math.floor(new Date(c.updatedAt).getTime() / 1000) : 0);

        // Use normalized identity (digits or name) for merging
        // We prefer @s.whatsapp.net entries
        const isStandard = domain === 's.whatsapp.net' || domain === 'g.us';
        const existing = chatMap.get(idPart);

        if (!existing || (isStandard && !existing.id.includes('@s.whatsapp.net'))) {
          chatMap.set(idPart, {
            id: fullJid,
            name: name,
            unreadCount: c.unreadCount || 0,
            timestamp: timestamp,
            profilePicUrl: c.profilePicUrl || null,
            lastMessage: c.lastMessage
          });
        }
      });

      // Convert Map back to array and sort by most recent activity
      const sortedChats = Array.from(chatMap.values())
        .filter(chat => chat.id) // Final safety check
        .sort((a, b) => b.timestamp - a.timestamp);

      setChats(sortedChats);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoadingChats(false);
    }
  }, [SESSION_NAME, isRtl]);

  const fetchMessages = useCallback(async (chatId: string, isPolling = false) => {
    // Only show loader and clear if NOT polling
    if (!isPolling) {
      setLoadingMessages(true);
      setMessages([]);
    }
    currentChatIdRef.current = chatId;

    try {
      const response = await fetch(`${WAHA_URL}/chat/findMessages/${SESSION_NAME}`, {
        method: 'POST',
        headers: {
          'apikey': WAHA_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          where: { remoteJid: chatId },
          limit: 50
        })
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();

      let rawMessages: any[] = [];
      if (Array.isArray(data)) {
        rawMessages = data;
      } else if (data && typeof data === 'object') {
        const msgObj = data.messages || data.data || data.records || data;
        if (Array.isArray(msgObj)) {
          rawMessages = msgObj;
        } else if (msgObj && typeof msgObj === 'object' && Array.isArray(msgObj.records)) {
          rawMessages = msgObj.records;
        } else if (msgObj && typeof msgObj === 'object' && Array.isArray(msgObj.messages)) {
          rawMessages = msgObj.messages;
        }
      }

      const formattedMessages = rawMessages.map((m: any) => {
        const msgContent = m.message || m;
        // CRITICAL: Extract the ACTUAL remoteJid from the message itself
        const actualChatId = (m.key?.remoteJid || m.remoteJid || chatId || '').toLowerCase().trim();

        let body = '';
        if (msgContent.conversation) body = msgContent.conversation;
        else if (msgContent.extendedTextMessage?.text) body = msgContent.extendedTextMessage.text;
        else if (msgContent.imageMessage?.caption) body = `📷 ${msgContent.imageMessage.caption}`;
        else if (msgContent.videoMessage?.caption) body = `🎥 ${msgContent.videoMessage.caption}`;
        else if (msgContent.buttonsResponseMessage?.selectedDisplayText) body = msgContent.buttonsResponseMessage.selectedDisplayText;
        else if (m.body) body = m.body;
        else if (typeof m.content === 'string') body = m.content;

        const [mIdPart] = actualChatId.split('@');

        return {
          id: m.key?.id || m.id || Math.random().toString(),
          body: body,
          fromMe: m.key?.fromMe ?? m.fromMe ?? false,
          timestamp: Number(m.messageTimestamp || m.timestamp || 0),
          chatId: actualChatId // Store the full JID for easier matching
        };
      }).filter((m: any) => m.body);

      // Deduplicate and Sort explicitly by timestamp (Oldest -> Newest)
      const uniqueMessages = Array.from(new Map(formattedMessages.map(m => [m.id, m])).values())
        .sort((a, b) => a.timestamp - b.timestamp);

      if (currentChatIdRef.current === chatId) {
        setMessages(uniqueMessages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (currentChatIdRef.current === chatId) {
        setLoadingMessages(false);
      }
    }
  }, [SESSION_NAME]);

  useEffect(() => {
    fetchSessionStatus();
    fetchChats();
    const chatInterval = setInterval(fetchChats, 7000); // Poll chats more frequently for sync
    const sessionInterval = setInterval(fetchSessionStatus, 15000);
    return () => {
      clearInterval(chatInterval);
      clearInterval(sessionInterval);
    };
  }, [fetchChats, fetchSessionStatus]);

  useEffect(() => {
    if (selectedChatId) {
      setMessageText(''); // Clear on change
      fetchMessages(selectedChatId);

      const msgInterval = setInterval(() => fetchMessages(selectedChatId, true), 5000); // Pass true for isPolling
      return () => clearInterval(msgInterval);
    }
  }, [selectedChatId, fetchMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastId = messages[messages.length - 1].id;
      if (lastId !== lastScrollMsgId.current) {
        scrollToBottom();
        lastScrollMsgId.current = lastId;
      }
    } else {
      lastScrollMsgId.current = null;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetChatId = selectedChatId; // Capture ID to prevent mixing
    if (!messageText.trim() || !targetChatId) return;

    const textToSend = messageText;
    setMessageText('');

    try {
      // For Evolution API v2, sometimes the full Jid works better, sometimes just the number.
      // We will try with the full Jid first if it's a group, else the numeric part.
      const isGroup = selectedChatId.includes('@g.us');
      const cleanNumber = isGroup ? selectedChatId : selectedChatId.split('@')[0];

      const response = await fetch(`${WAHA_URL}/message/sendText/${SESSION_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': WAHA_API_KEY
        },
        body: JSON.stringify({
          number: cleanNumber,
          text: textToSend
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Full server error:', errorData);
        // Better error extraction
        let errMsg = 'Unknown Error';
        if (errorData.response?.message) {
          errMsg = Array.isArray(errorData.response.message) ? errorData.response.message[0] : errorData.response.message;
        } else if (errorData.message) {
          errMsg = errorData.message;
        } else if (errorData.error) {
          errMsg = errorData.error;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();

      const normalizedTargetId = targetChatId.toLowerCase().trim();
      const newMessage: WahaMessage = {
        id: (data.key?.id || `local-${Date.now()}`),
        body: textToSend,
        fromMe: true,
        timestamp: Math.floor(Date.now() / 1000),
        chatId: normalizedTargetId
      };
      setMessages(prev => {
        if (selectedChatId && selectedChatId.toLowerCase().trim() === normalizedTargetId) {
          // Ensure we don't add duplicates if already polled
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        }
        return prev;
      });
    } catch (err: any) {
      console.error('Error sending message:', err);
      let finalMsg = err.message;
      if (finalMsg.includes('Connection Closed')) {
        finalMsg = isRtl ? 'اتصال واتساب مقطوع. يرجى إعادة ربط الحساب من صفحة "ربط الحساب".' : 'WhatsApp connection closed. Please re-link your account in the Connection page.';
      }
      alert(isRtl ? `فشل الإرسال: ${finalMsg}` : `Failed to send: ${finalMsg}`);
    }
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-white dark:bg-[#020617] overflow-hidden relative page-enter">
      {sessionStatus === 'SCAN_QR' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/50 p-3 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400 text-xs font-bold">
            <AlertCircle className="w-4 h-4" />
            <p>{isRtl ? 'اتصال واتساب مقطوع! يرجى إعادة ربط الحساب للتمكن من الإرسال.' : 'WhatsApp disconnected! Please re-link your account to send messages.'}</p>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* List Sidebar */}
        <div className={`w-full md:w-80 lg:w-[340px] border-r border-slate-50 dark:border-white/5 flex flex-col h-full bg-white dark:bg-[#0F172A] ${selectedChatId !== null ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6">
            <h2 className="text-[11px] font-[900] uppercase tracking-[0.2em] dark:text-white mb-6">{isRtl ? 'المحادثات' : 'Inbox'}</h2>
            <div className="relative">
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300`} />
              <input
                type="text"
                placeholder={isRtl ? 'بحث...' : 'Search messages...'}
                className={`w-full ${isRtl ? 'pr-10' : 'pl-10'} py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-6 space-y-0.5">
            {loadingChats ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
            ) : chats.length === 0 ? (
              <p className="text-center text-xs text-slate-400 p-8">{isRtl ? 'لا توجد محادثات نشطة' : 'No active chats found'}</p>
            ) : chats.map((chat) => {
              const chatId = chat.id;
              return (
                <button
                  key={chatId}
                  onClick={() => setSelectedChatId(chatId)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all
                  ${selectedChatId === chatId
                      ? 'bg-slate-950 text-white shadow-xl shadow-slate-200 dark:bg-emerald-600 dark:shadow-none'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                      {chat.profilePicUrl ? (
                        <img src={chat.profilePicUrl} alt={chat.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className={`w-6 h-6 ${selectedChatId === chatId ? 'text-white/60' : 'text-slate-400'}`} />
                      )}
                    </div>
                    {chat.unreadCount > 0 && selectedChatId !== chatId && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className={`font-bold text-[13px] truncate ${selectedChatId === chatId ? 'text-white' : 'dark:text-white'}`}>
                        {chat.name || (chatId && typeof chatId === 'string' ? chatId.split('@')[0] : (isRtl ? 'محادثة' : 'Chat'))}
                      </h4>
                      <span className={`text-[9px] font-bold ${selectedChatId === chatId ? 'text-white/60' : 'text-slate-300'}`}>{formatTime(chat.timestamp)}</span>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${selectedChatId === chatId ? 'text-white/60' : 'text-slate-400 dark:text-slate-400'}`}>
                      {typeof chat.lastMessage === 'string'
                        ? chat.lastMessage
                        : (chat.lastMessage?.message?.conversation ||
                          chat.lastMessage?.message?.extendedTextMessage?.text ||
                          chat.lastMessage?.body ||
                          chat.lastMessage?.text ||
                          (isRtl ? 'رسالة وسائط' : 'Media message'))
                      }
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Area */}
        <div className={`flex-1 flex flex-col h-full bg-white dark:bg-[#020617] ${selectedChatId === null ? 'hidden md:flex' : 'flex'}`}>
          {selectedChatId !== null && selectedChat ? (
            <>
              <div className="h-20 border-b border-slate-50 dark:border-white/5 px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedChatId(null)} className="md:hidden p-2 -ml-2 rounded-xl bg-slate-50">
                    {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-white/5">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm dark:text-white leading-none tracking-tight">{selectedChat.name || selectedChat.id.split('@')[0]}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Active now</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2.5 text-slate-300 hover:text-slate-600 transition-colors"><Search className="w-4 h-4" /></button>
                  <button className="p-2.5 text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-white dark:bg-transparent">
                {loadingMessages ? (
                  <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
                ) : messages.map((msg) => (
                  <div key={`${msg.id}-${msg.timestamp}`} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-5 py-3.5 rounded-2xl text-[13px] font-bold leading-relaxed shadow-sm ${msg.fromMe
                        ? 'bg-slate-950 text-white dark:bg-emerald-600 rounded-tr-none'
                        : 'bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 rounded-tl-none'
                        }`}>
                        {msg.body}
                      </div>
                      <div className={`flex items-center gap-2 mt-2.5 ${msg.fromMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{formatTime(msg.timestamp)}</span>
                        {msg.fromMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-8 bg-white dark:bg-[#020617] border-t border-slate-50 dark:border-white/5">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] px-5 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 border border-transparent focus-within:border-slate-100">
                  <button
                    type="button"
                    onClick={() => alert(isRtl ? 'قريراً: ميزة الرموز التعبيرية' : 'Coming soon: Emoji Picker')}
                    className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={isRtl ? 'رسالة...' : 'Type a message...'}
                    className="flex-1 bg-transparent border-none py-3 text-sm focus:ring-0 outline-none dark:text-white font-bold placeholder:text-slate-300"
                  />

                  <input
                    type="file"
                    id="attach-file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) alert(isRtl ? `تم اختيار الملف: ${file.name}` : `File selected: ${file.name}`);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('attach-file')?.click()}
                    className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className={`p-3 rounded-2xl transition-all ${messageText.trim() ? 'bg-slate-950 text-white dark:bg-emerald-600 shadow-xl' : 'text-slate-200'}`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-transparent">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 dark:border-white/5">
                <MessageSquare className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] dark:text-white mb-3">{isRtl ? 'اختر محادثة' : 'Select Thread'}</h3>
              <p className="text-slate-400 text-[11px] max-w-[220px] font-bold leading-relaxed">
                Open a conversation to start chatting with your customers in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
