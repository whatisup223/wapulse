
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, MoreVertical, Send, Paperclip, Smile, CheckCheck, MessageSquare, ChevronLeft, ChevronRight, User as UserIcon, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface InboxProps {
  language: 'en' | 'ar';
  userId: string;
}

interface EvolutionChat {
  id: string;
  name: string;
  unreadCount: number;
  timestamp: number;
  profilePicUrl?: string;
  lastMessage?: string | any;
}

interface EvolutionMessage {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: number;
  chatId: string;
}

const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const Inbox: React.FC<InboxProps> = ({ language, userId }) => {
  const isRtl = language === 'ar';
  const SESSION_NAME = userId;

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentChatIdRef = useRef<string | null>(null);

  const [chats, setChats] = useState<EvolutionChat[]>([]);
  const [messages, setMessages] = useState<EvolutionMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'WORKING' | 'SCAN_QR' | 'LOADING'>('LOADING');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const lastScrollMsgId = useRef<string | null>(null);

  // Maps clean identity (phone or clean ID) to all its associated JIDs in the system
  const identityToJids = useRef<Map<string, Set<string>>>(new Map());

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const COMMON_EMOJIS = ['😊', '😂', '😘', '🥰', '😍', '😇', '😎', '🤩', '🥳', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '🥴', '😠', '😡', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥺', '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋', '🩸'];

  const fetchSessionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${EVOLUTION_URL}/instance/fetchInstances?instanceName=${SESSION_NAME}`, {
        headers: { 'apikey': EVOLUTION_API_KEY }
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

  // Maps EVERY JID/LID to a consolidated Master Identity Key
  const jidToIdentity = useRef<Map<string, string>>(new Map());

  const fetchChats = useCallback(async (isManualSync = false) => {
    if (isManualSync) setSyncing(true);
    try {
      const response = await fetch(`${EVOLUTION_URL}/chat/findChats/${SESSION_NAME}`, {
        method: 'POST',
        headers: { 'apikey': EVOLUTION_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();
      const rawChats = Array.isArray(data) ? data : (data.records || data.data || []);

      // 1. First Pass: Extract and Normalize all possible identities
      const processed = rawChats.map((c: any) => {
        const fullJid = (c.remoteJid || c.id || '').toLowerCase().trim();
        const [idPart, domain] = fullJid.split('@');
        const cleanIdPart = idPart?.split(':')[0] || '';

        let phone = (domain === 's.whatsapp.net') ? cleanIdPart.replace(/\D/g, '') : '';
        const pushName = c.pushName || c.name || '';
        const profilePic = c.profilePicUrl || null;

        // Try to find phone in name if not in JID
        if (!phone && pushName) {
          const digits = pushName.replace(/\D/g, '');
          if (digits.length >= 10 && digits.length <= 15) phone = digits;
        }

        return { ...c, fullJid, cleanIdPart, domain, phone, pushName, profilePic, timestamp: Math.max(c.lastMessage?.messageTimestamp || 0, c.updatedAt ? Math.floor(new Date(c.updatedAt).getTime() / 1000) : 0, c.timestamp || 0) };
      }).filter((c: any) => c.fullJid && !c.fullJid.includes('@status') && !c.fullJid.includes('@broadcast'));

      // 2. Second Pass: Link fragments together
      const newJidToId = new Map<string, string>();
      const masterMap = new Map<string, any>();

      // Priority 1: Link by Phone Number
      processed.forEach(c => {
        if (c.phone) {
          const masterKey = `phone:${c.phone}`;
          newJidToId.set(c.fullJid, masterKey);
          if (!masterMap.has(masterKey) || c.timestamp > masterMap.get(masterKey).timestamp) {
            masterMap.set(masterKey, c);
          }
        }
      });

      // Priority 2: Link by Profile Picture (if not already linked)
      processed.forEach(c => {
        if (!newJidToId.has(c.fullJid) && c.profilePic) {
          const masterKey = `pic:${c.profilePic}`;
          newJidToId.set(c.fullJid, masterKey);
          if (!masterMap.has(masterKey) || c.timestamp > masterMap.get(masterKey).timestamp) {
            masterMap.set(masterKey, c);
          }
        }
      });

      // Priority 3: Group by Clean ID/Name (Fallback)
      processed.forEach(c => {
        if (!newJidToId.has(c.fullJid)) {
          const masterKey = `jid:${c.cleanIdPart}`;
          newJidToId.set(c.fullJid, masterKey);
          masterMap.set(masterKey, c);
        }
      });

      // 3. Third Pass: Consolidate metadata (sum unreads, keep all JIDs for history)
      const consolidatedChats: EvolutionChat[] = [];
      const identityToAllJids = new Map<string, Set<string>>();

      masterMap.forEach((master, key) => {
        const linkedRaw = processed.filter(p => newJidToId.get(p.fullJid) === key);
        const jids = new Set<string>(linkedRaw.map(p => p.fullJid));
        identityToAllJids.set(key, jids);

        const totalUnread = linkedRaw.reduce((sum, p) => sum + (p.unreadCount || 0), 0);
        const latestInfo = linkedRaw.sort((a, b) => b.timestamp - a.timestamp)[0];

        // Format name properly
        let finalName = latestInfo.pushName || latestInfo.cleanIdPart;
        if (latestInfo.phone && (!finalName || finalName === latestInfo.cleanIdPart)) {
          finalName = `+${latestInfo.phone}`;
        }

        consolidatedChats.push({
          id: latestInfo.fullJid, // This is the primary ID for sending
          name: finalName,
          unreadCount: totalUnread,
          timestamp: latestInfo.timestamp,
          profilePicUrl: latestInfo.profilePic,
          lastMessage: latestInfo.lastMessage
        });
      });

      jidToIdentity.current = newJidToId;
      identityToJids.current = identityToAllJids;
      setChats(consolidatedChats.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoadingChats(false);
      setSyncing(false);
    }
  }, [SESSION_NAME]);

  const getMessageBody = (m: any): string => {
    const msgContent = m.message || m;
    if (msgContent.conversation) return msgContent.conversation;
    if (msgContent.extendedTextMessage?.text) return msgContent.extendedTextMessage.text;
    if (msgContent.imageMessage?.caption) return `📷 ${msgContent.imageMessage.caption}`;
    if (msgContent.videoMessage?.caption) return `🎥 ${msgContent.videoMessage.caption}`;
    if (msgContent.buttonsResponseMessage?.selectedDisplayText) return msgContent.buttonsResponseMessage.selectedDisplayText;
    if (m.body) return m.body;
    if (typeof m.content === 'string') return m.content;
    return '';
  };

  const fetchMessages = useCallback(async (primaryChatId: string, isPolling = false) => {
    const identityKey = jidToIdentity.current.get(primaryChatId.toLowerCase().trim());
    const allJids = Array.from(identityToJids.current.get(identityKey || '') || [primaryChatId]);

    if (!isPolling) {
      setLoadingMessages(true);
      if (currentChatIdRef.current !== primaryChatId) setMessages([]);
    }
    currentChatIdRef.current = primaryChatId;

    try {
      const results = await Promise.all(allJids.map(jid =>
        fetch(`${EVOLUTION_URL}/chat/findMessages/${SESSION_NAME}`, {
          method: 'POST',
          headers: { 'apikey': EVOLUTION_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ where: { remoteJid: jid }, limit: 50 })
        }).then(r => r.json()).catch(() => [])
      ));

      const unifiedMsgMap = new Map<string, EvolutionMessage>();

      results.forEach(data => {
        let rawMessages: any[] = [];
        if (Array.isArray(data)) rawMessages = data;
        else if (data && typeof data === 'object') {
          const msgObj = data.messages || data.data || data.records || data;
          if (Array.isArray(msgObj)) rawMessages = msgObj;
          else if (msgObj && Array.isArray(msgObj.records)) rawMessages = msgObj.records;
        }

        rawMessages.forEach(m => {
          const mId = m.key?.id || m.id;
          if (!mId) return;
          unifiedMsgMap.set(mId, {
            id: mId,
            body: getMessageBody(m),
            fromMe: m.key?.fromMe || m.fromMe || false,
            timestamp: m.messageTimestamp || m.timestamp || 0,
            chatId: m.key?.remoteJid || m.remoteJid
          });
        });
      });

      const sortedMessages = Array.from(unifiedMsgMap.values())
        .sort((a, b) => a.timestamp - b.timestamp);

      if (currentChatIdRef.current === primaryChatId) {
        setMessages(sortedMessages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (!isPolling && currentChatIdRef.current === primaryChatId) setLoadingMessages(false);
    }
  }, [SESSION_NAME]);

  useEffect(() => {
    fetchSessionStatus();
    fetchChats();
    const chatInterval = setInterval(fetchChats, 7000);
    const sessionInterval = setInterval(fetchSessionStatus, 15000);
    return () => {
      clearInterval(chatInterval);
      clearInterval(sessionInterval);
    };
  }, [fetchChats, fetchSessionStatus]);

  useEffect(() => {
    if (selectedChatId) {
      setMessageText('');
      fetchMessages(selectedChatId);
      const msgInterval = setInterval(() => fetchMessages(selectedChatId, true), 5000);
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
    const targetChatId = selectedChatId;
    if (!messageText.trim() || !targetChatId) return;

    const textToSend = messageText;
    setMessageText('');

    try {
      const response = await fetch(`${EVOLUTION_URL}/message/sendText/${SESSION_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: targetChatId,
          text: textToSend,
          linkPreview: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errMsg = errorData.message || errorData.error || 'Unknown Error';
        throw new Error(errMsg);
      }

      const data = await response.json();
      const newMessage: EvolutionMessage = {
        id: (data.key?.id || data.message?.key?.id || `local-${Date.now()}`),
        body: textToSend,
        fromMe: true,
        timestamp: Math.floor(Date.now() / 1000),
        chatId: targetChatId
      };
      setMessages(prev => {
        if (selectedChatId === targetChatId) {
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        }
        return prev;
      });
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert(isRtl ? `فشل الإرسال: ${err.message}` : `Failed to send: ${err.message}`);
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
        <div className={`w-full md:w-80 lg:w-[340px] border-r border-slate-50 dark:border-white/5 flex flex-col h-full bg-white dark:bg-[#0F172A] ${selectedChatId !== null ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[11px] font-[900] uppercase tracking-[0.2em] dark:text-white">{isRtl ? 'المحادثات' : 'Inbox'}</h2>
              <button onClick={() => fetchChats(true)} disabled={syncing} className={`p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all ${syncing ? 'animate-spin text-emerald-500' : 'text-slate-400'}`}>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300`} />
              <input type="text" placeholder={isRtl ? 'بحث...' : 'Search messages...'} className={`w-full ${isRtl ? 'pr-10' : 'pl-10'} py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all`} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-6 space-y-0.5">
            {loadingChats ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
            ) : chats.length === 0 ? (
              <p className="text-center text-xs text-slate-400 p-8">{isRtl ? 'لا توجد محادثات نشطة' : 'No active chats found'}</p>
            ) : chats.map((chat) => (
              <button key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${selectedChatId === chat.id ? 'bg-slate-950 text-white dark:bg-emerald-600 shadow-xl' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    {chat.profilePicUrl ? <img src={chat.profilePicUrl} alt={chat.name} className="w-full h-full object-cover" /> : <UserIcon className={`w-6 h-6 ${selectedChatId === chat.id ? 'text-white/60' : 'text-slate-400'}`} />}
                  </div>
                  {chat.unreadCount > 0 && selectedChatId !== chat.id && <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white">{chat.unreadCount}</div>}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className={`font-bold text-[13px] truncate ${selectedChatId === chat.id ? 'text-white' : 'dark:text-white'}`}>{chat.name}</h4>
                    <span className={`text-[9px] font-bold ${selectedChatId === chat.id ? 'text-white/60' : 'text-slate-300'}`}>{formatTime(chat.timestamp)}</span>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${selectedChatId === chat.id ? 'text-white/60' : 'text-slate-400 dark:text-slate-400'}`}>
                    {typeof chat.lastMessage === 'string' ? chat.lastMessage : (chat.lastMessage?.message?.conversation || chat.lastMessage?.body || chat.lastMessage?.text || (isRtl ? 'رسالة وسائط' : 'Media message'))}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex flex-col h-full bg-white dark:bg-[#020617] ${selectedChatId === null ? 'hidden md:flex' : 'flex'}`}>
          {selectedChatId !== null && selectedChat ? (
            <>
              <div className="h-20 border-b border-slate-50 dark:border-white/5 px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedChatId(null)} className="md:hidden p-2 -ml-2 rounded-xl bg-slate-50">{isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}</button>
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-white/5"><UserIcon className="w-5 h-5 text-slate-400" /></div>
                  <div>
                    <h3 className="font-black text-sm dark:text-white leading-none tracking-tight">{selectedChat.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Active now</span></div>
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
                  <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-5 py-3.5 rounded-2xl text-[13px] font-bold leading-relaxed shadow-sm ${msg.fromMe ? 'bg-slate-950 text-white dark:bg-emerald-600 rounded-tr-none' : 'bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 rounded-tl-none'}`}>{msg.body}</div>
                      <div className={`flex items-center gap-2 mt-2.5 ${msg.fromMe ? 'flex-row-reverse' : ''}`}><span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{formatTime(msg.timestamp)}</span>{msg.fromMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="p-8 bg-white dark:bg-[#020617] border-t border-slate-50 dark:border-white/5">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] px-5 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 border border-transparent focus-within:border-slate-100">
                  <div className="relative" ref={emojiPickerRef}>
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 transition-colors ${showEmojiPicker ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}><Smile className="w-6 h-6" /></button>
                    {showEmojiPicker && (
                      <div className={`absolute bottom-full ${isRtl ? 'right-0' : 'left-0'} mb-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 w-72 h-80 overflow-y-auto page-enter`}>
                        <div className="grid grid-cols-6 gap-2">{COMMON_EMOJIS.map((emoji, idx) => (<button key={idx} type="button" onClick={() => setMessageText(prev => prev + emoji)} className="text-xl p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all hover:scale-125">{emoji}</button>))}</div>
                      </div>
                    )}
                  </div>
                  <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={isRtl ? 'اكتب رسالة...' : 'Type a message...'} className="flex-1 bg-white dark:bg-slate-800 border-none py-3 px-4 rounded-xl text-sm focus:ring-0 outline-none text-slate-900 dark:text-white font-bold placeholder:text-slate-400 shadow-inner" />
                  <button type="submit" disabled={!messageText.trim()} className={`p-3 rounded-2xl transition-all ${messageText.trim() ? 'bg-slate-950 text-white dark:bg-emerald-600 shadow-xl' : 'text-slate-200'}`}><Send className="w-5 h-5" /></button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-transparent">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 dark:border-white/5"><MessageSquare className="w-7 h-7 text-slate-300" /></div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] dark:text-white mb-3">{isRtl ? 'اختر محادثة' : 'Select Thread'}</h3>
              <p className="text-slate-400 text-[11px] max-w-[220px] font-bold leading-relaxed">Open a conversation to start chatting with your customers in real-time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
