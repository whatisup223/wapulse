import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MoreVertical, Send, Paperclip, Smile, CheckCheck, MessageSquare, ChevronLeft, User as UserIcon, Loader2, AlertCircle, RefreshCw, Phone, Video, PanelLeftClose, PanelLeftOpen, ArrowLeft, ChevronDown, Smartphone } from 'lucide-react';
import { sendNewMessageNotification, checkNotificationSettings } from '../utils/notifications';

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

interface EvolutionSession {
  instanceName: string;
  ownerJid?: string;
  profilePicUrl?: string; // Standardized property
  status: 'open' | 'close' | 'connecting';
}

const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const Inbox: React.FC<InboxProps> = ({ language, userId }) => {
  const isRtl = language === 'ar';

  // Multi-Session Management
  const [availableSessions, setAvailableSessions] = useState<EvolutionSession[]>([]);
  const [currentSession, setCurrentSession] = useState<EvolutionSession | null>(null);
  const [isSearchingSessions, setIsSearchingSessions] = useState(true);

  // Dropdown Logic (Fixed Position)
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const sessionButtonRef = useRef<HTMLButtonElement>(null);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentChatIdRef = useRef<string | null>(null);

  const [chats, setChats] = useState<EvolutionChat[]>([]);
  const [messages, setMessages] = useState<EvolutionMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const sessionMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollMsgId = useRef<string | null>(null);

  // New State for Collapsible Sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Notification State
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check notification settings on mount
  useEffect(() => {
    const checkSettings = async () => {
      const enabled = await checkNotificationSettings();
      setNotificationsEnabled(enabled);
    };
    checkSettings();
  }, []);

  const jidToIdentity = useRef<Map<string, string>>(new Map());
  const identityToJids = useRef<Map<string, Set<string>>>(new Map());

  // FETCH ALL SESSIONS LOGIC
  const refreshSessions = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch('/api/instances', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        }
      });
      const data = await res.json();
      const rawInstances = Array.isArray(data) ? data : [];

      // Map to our Interface
      const sessions: EvolutionSession[] = rawInstances
        .filter((i: any) => i.connectionStatus === 'open' || i.state === 'open') // Only show connected
        .map((i: any) => ({
          instanceName: i.instanceName || i.name || i.instance?.instanceName,
          ownerJid: i.ownerJid,
          profilePicUrl: i.profilePictureUrl || i.profilePicUrl || i.instance?.profilePictureUrl,
          status: 'open'
        }));

      setAvailableSessions(sessions);

      if (sessions.length > 0) {
        if (!currentSession || !sessions.find(s => s.instanceName === currentSession.instanceName)) {
          setCurrentSession(sessions[0]);
        }
      } else {
        setCurrentSession(null);
      }
    } catch (e) {
      console.error('Failed to fetch sessions', e);
    } finally {
      setIsSearchingSessions(false);
    }
  }, [currentSession, userId]);

  // Initial Load & Polling for Sessions
  useEffect(() => {
    refreshSessions();
    const interval = setInterval(refreshSessions, 20000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Dropdown Toggle
  const toggleSessionMenu = () => {
    if (showSessionMenu) {
      setShowSessionMenu(false);
    } else {
      if (sessionButtonRef.current) {
        const rect = sessionButtonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 8, // 8px Offset
          left: isRtl ? (rect.right - 280) : rect.left, // Align right for RTL, Left for LTR
          width: 280
        });
        setShowSessionMenu(true);
      }
    }
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Emoji Picker
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      // Session Menu (Fixed Position)
      if (showSessionMenu && sessionMenuRef.current && !sessionMenuRef.current.contains(event.target as Node) && !sessionButtonRef.current?.contains(event.target as Node)) {
        setShowSessionMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    // Also update position on scroll to avoid detached menu
    const handleScroll = () => { if (showSessionMenu) setShowSessionMenu(false); }
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showSessionMenu]);

  const COMMON_EMOJIS = ['😊', '😂', '😘', '🥰', '😍', '😇', '😎', '🤩', '🥳', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '🥴', '😠', '😡', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥺', '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋', '🩸'];

  // FETCH CHATS FOR CURRENT SESSION (FROM LOCAL API)
  const fetchChats = useCallback(async (isManualSync = false) => {
    if (!currentSession) return;
    const sessionName = currentSession.instanceName;

    if (isManualSync) setSyncing(true);
    else if (!isManualSync && chats.length === 0) setLoadingChats(true);

    try {
      // Use local API: Handles caching and sync automatically
      const response = await fetch(`/api/chats/${sessionName}`);
      if (!response.ok) throw new Error('Failed to fetch chats');

      const consolidatedChats: EvolutionChat[] = await response.json();

      setChats(consolidatedChats);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoadingChats(false);
      setSyncing(false);
    }
  }, [currentSession]);

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

  // FETCH MESSAGES FOR SELECTED CHAT (FROM LOCAL API)
  const fetchMessages = useCallback(async (primaryChatId: string, isPolling = false) => {
    if (!currentSession) return;
    const sessionName = currentSession.instanceName;

    if (!isPolling) {
      setLoadingMessages(true);
      if (currentChatIdRef.current !== primaryChatId) setMessages([]);
    }
    currentChatIdRef.current = primaryChatId;

    try {
      // Use local API: Handles caching and history backfill automatically
      const response = await fetch(`/api/messages/${sessionName}/${encodeURIComponent(primaryChatId)}`);
      if (!response.ok) throw new Error('Failed to fetch messages');

      const sortedMessages: EvolutionMessage[] = await response.json();

      if (currentChatIdRef.current === primaryChatId) {
        // Check for new messages and send notification
        if (isPolling && notificationsEnabled) {
          const previousMessageCount = messages.length;
          const newMessageCount = sortedMessages.length;

          if (newMessageCount > previousMessageCount) {
            // Get the new messages
            const newMessages = sortedMessages.slice(previousMessageCount);

            // Send notification for each new message from customer
            newMessages.forEach(msg => {
              if (!msg.fromMe) {
                const chat = chats.find(c => c.id === primaryChatId);
                if (chat) {
                  sendNewMessageNotification(
                    chat.name,
                    msg.body,
                    language
                  );
                }
              }
            });
          }
        }

        setMessages(sortedMessages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (!isPolling && currentChatIdRef.current === primaryChatId) setLoadingMessages(false);
    }
  }, [currentSession, messages.length, chats, notificationsEnabled, language]);

  useEffect(() => {
    setChats([]);
    setMessages([]);
    setSelectedChatId(null);
    if (currentSession) {
      fetchChats();
    }
  }, [currentSession, fetchChats]);

  useEffect(() => {
    if (!currentSession) return;
    // Refresh chat list every 60 seconds (reduced from 15 seconds)
    const chatInterval = setInterval(() => fetchChats(false), 60000);
    return () => clearInterval(chatInterval);
  }, [currentSession, fetchChats]);

  useEffect(() => {
    if (selectedChatId && currentSession) {
      setMessageText('');
      fetchMessages(selectedChatId);
      // Refresh messages every 30 seconds (reduced from 10 seconds)
      const msgInterval = setInterval(() => fetchMessages(selectedChatId, true), 30000);
      return () => clearInterval(msgInterval);
    }
  }, [selectedChatId, fetchMessages, currentSession]);

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
    if (!currentSession) return;

    const targetChatId = selectedChatId;
    if (!messageText.trim() || !targetChatId) return;

    const textToSend = messageText;
    setMessageText('');

    try {
      const response = await fetch(`${EVOLUTION_URL}/message/sendText/${currentSession.instanceName}`, {
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
        throw new Error('Failed to send message');
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

  // Custom Scrollbar Styles
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 20px;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #334155;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #94a3b8;
    }
  `;

  return (
    <>
      <div className="h-[calc(100vh-80px)] flex flex-col bg-transparent overflow-hidden relative page-enter p-2 md:p-6 gap-4 md:gap-6">
        <style>{scrollbarStyles}</style>

        {/* Connection State Alerts */}
        {!isSearchingSessions && availableSessions.length === 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-400 text-sm font-bold">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full animate-pulse"><AlertCircle className="w-4 h-4" /></div>
              <p>{isRtl ? 'لا توجد أرقام متصلة! يرجى ربط حساب واتساب للبدء.' : 'No numbers connected! Please link a WhatsApp account to start.'}</p>
            </div>
            <button
              onClick={() => window.location.hash = '#connection'}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 hover:-translate-y-0.5 transition-all"
            >
              {isRtl ? 'ربط حساب' : 'Connect Account'}
            </button>
          </div>
        )}

        {isSearchingSessions && availableSessions.length === 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p>{isRtl ? 'جاري البحث عن جلسات واتساب نشطة...' : 'Searching for active WhatsApp sessions...'}</p>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative gap-6">

          {/* Sidebar List */}
          <div className={`flex flex-col h-full bg-white dark:bg-slate-900 md:rounded-[2.5rem] rounded-2xl border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/20 transition-all duration-300 ease-in-out relative z-10 
            ${isSidebarCollapsed ? 'w-[96px] md:w-[96px]' : 'w-full md:w-[380px]'} 
            ${selectedChatId !== null ? 'hidden md:flex' : 'flex'}`
          }>

            <div className="p-4 md:p-6 pb-2 relative z-20">

              {/* Header: Title & Session Switcher */}
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'} mb-4 md:mb-6`}>

                {!isSidebarCollapsed && (
                  <div className="relative">
                    <button
                      ref={sessionButtonRef}
                      onClick={() => availableSessions.length > 1 && toggleSessionMenu()}
                      className={`flex items-center gap-2 group ${availableSessions.length > 1 ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <h2 className="text-xl font-[900] tracking-tight text-slate-900 dark:text-white truncate flex items-center gap-2">
                        {/* Current User Avatar in Header */}
                        {currentSession?.profilePicUrl && (
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img src={currentSession.profilePicUrl} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span>{currentSession?.instanceName || (isRtl ? 'الرسائل' : 'Inbox')}</span>
                        {availableSessions.length > 1 && <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${showSessionMenu ? 'rotate-180' : ''}`} />}
                      </h2>
                    </button>
                    {/* Menu rendered outside via Portal/Fixed logic */}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden md:flex p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"
                    title={isRtl ? 'تصغير/توسيع القائمة' : 'Toggle Sidebar'}
                  >
                    {isSidebarCollapsed ? (isRtl ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />) : (isRtl ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />)}
                  </button>

                  {!isSidebarCollapsed && (
                    <>
                      <button onClick={() => fetchChats(true)} disabled={syncing} className={`p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${syncing ? 'animate-spin text-emerald-500' : 'text-slate-400'}`}>
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Current Session Indicator (Collapsed Mode) */}
              {isSidebarCollapsed && currentSession && (
                <div className="mb-4 flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 border-2 border-white dark:border-slate-800 shadow-sm" title={currentSession.instanceName}>
                    {currentSession.profilePicUrl ? <img src={currentSession.profilePicUrl} className="w-full h-full object-cover rounded-full" /> : <span className="font-bold text-xs">{currentSession.instanceName.substring(0, 2).toUpperCase()}</span>}
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className="relative group">
                {isSidebarCollapsed ? (
                  <button className="w-full aspect-square flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-emerald-500 transition-all">
                    <Search className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors`} />
                    <input
                      type="text"
                      placeholder={isRtl ? 'بحث...' : 'Search...'}
                      className={`w-full ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner`}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-6 space-y-2 mt-2 z-0 relative">
              {loadingChats ? (
                <div className="flex flex-col items-center justify-center p-12 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  {!isSidebarCollapsed && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isRtl ? 'جاري التحميل...' : 'Syncing...'}</p>}
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center opacity-60">
                  <MessageSquare className="w-8 h-8 text-slate-300 mb-4" />
                  {!isSidebarCollapsed && <p className="text-sm font-bold text-slate-400">{isRtl ? 'لا توجد محادثات' : 'No active chats'}</p>}
                </div>
              ) : chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`w-full flex items-center gap-4 px-3 py-3 rounded-[1.2rem] transition-all duration-300 group relative ${selectedChatId === chat.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                    } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                  title={isSidebarCollapsed ? chat.name : ''}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center overflow-hidden border-2 transition-all ${selectedChatId === chat.id
                      ? 'border-white/30 bg-white/20'
                      : 'border-slate-100 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group-hover:scale-105 group-hover:shadow-md'
                      }`}>
                      {chat.profilePicUrl ? (
                        <img src={chat.profilePicUrl} alt={chat.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className={`w-6 h-6 ${selectedChatId === chat.id ? 'text-white' : 'text-slate-400'}`} />
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className={`absolute -top-1 -right-1 flex items-center justify-center bg-red-500 text-white rounded-full border-2 border-white dark:border-slate-900 font-black shadow-sm transform scale-100 animate-pulse ${isSidebarCollapsed || selectedChatId !== chat.id ? 'w-5 h-5 text-[10px]' : 'w-5 h-5 text-[10px]'
                        }`}>
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="flex-1 text-left min-w-0 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className={`font-bold text-sm truncate ${selectedChatId === chat.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{chat.name}</h4>
                        <span className={`text-[10px] font-bold ${selectedChatId === chat.id ? 'text-emerald-100' : 'text-slate-400'}`}>{formatTime(chat.timestamp)}</span>
                      </div>
                      <p className={`text-xs truncate font-medium ${selectedChatId === chat.id ? 'text-emerald-50' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-600'}`}>
                        {typeof chat.lastMessage === 'string' ? chat.lastMessage : (chat.lastMessage?.message?.conversation || chat.lastMessage?.body || chat.lastMessage?.text || (isRtl ? 'رسالة وسائط' : 'Media message'))}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area - Floating Card Style */}
          <div className={`flex-1 flex flex-col h-full bg-white dark:bg-slate-900 md:rounded-[2.5rem] rounded-2xl border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden relative transition-all duration-300 ${selectedChatId === null ? 'hidden md:flex' : 'flex'}`}>
            {selectedChatId !== null && selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="h-20 md:h-24 px-4 md:px-8 flex items-center justify-between bg-white dark:bg-slate-900 z-20 relative via-slate-50 to-white">
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    {/* Back Button for Mobile */}
                    <button
                      onClick={() => setSelectedChatId(null)}
                      className="md:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    >
                      {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>

                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center border border-slate-100 dark:border-white/5 overflow-hidden">
                        {selectedChat.profilePicUrl ? <img src={selectedChat.profilePicUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-slate-400" />}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-[800] text-base md:text-lg text-slate-900 dark:text-white leading-tight truncate">{selectedChat.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <button className="p-2 md:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Phone className="w-4 h-4" /></button>
                    <button className="hidden md:flex p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Video className="w-4 h-4" /></button>
                    <div className="hidden md:block w-px h-8 bg-slate-100 dark:bg-slate-800 mx-1"></div>
                    <button className="p-2 md:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><Search className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 md:p-8 space-y-4 md:space-y-6 bg-slate-50/50 dark:bg-[#0B1120] relative scroll-smooth">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                  {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">تحميل الرسائل...</span>
                    </div>
                  ) : messages.map((msg, idx) => (
                    <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}>
                        <div className={`px-5 py-3 md:px-6 md:py-4 rounded-[1.5rem] text-[13px] font-medium leading-relaxed shadow-sm relative transition-all duration-300 ${msg.fromMe
                          ? 'bg-gradient-to-br from-slate-900 to-slate-800 dark:from-emerald-600 dark:to-teal-600 text-white rounded-tr-sm shadow-slate-200 dark:shadow-emerald-900/20'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700'
                          }`}>
                          {msg.body}
                        </div>
                        <div className={`flex items-center gap-2 mt-2 px-1 opacity-60 group-hover:opacity-100 transition-opacity ${msg.fromMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatTime(msg.timestamp)}</span>
                          {msg.fromMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-white dark:bg-slate-900 z-20">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-1.5 md:p-2 pr-2 border border-slate-100 dark:border-slate-800 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white dark:focus-within:bg-slate-800 shadow-sm hover:shadow-md">
                    <div className="relative" ref={emojiPickerRef}>
                      <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 md:p-3 rounded-full transition-colors ${showEmojiPicker ? 'bg-amber-100 text-amber-500' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                        <Smile className="w-5 h-5" />
                      </button>
                      {showEmojiPicker && (
                        <div className={`absolute bottom-full ${isRtl ? 'right-0' : 'left-0'} mb-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-[2rem] shadow-2xl z-50 w-72 h-80 overflow-y-auto animate-in zoom-in duration-200`}>
                          <div className="grid grid-cols-6 gap-2">
                            {COMMON_EMOJIS.map((emoji, idx) => (
                              <button key={idx} type="button" onClick={() => setMessageText(prev => prev + emoji)} className="text-xl p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all hover:scale-125 hover:shadow-sm">{emoji}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button type="button" className="hidden md:block p-3 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={isRtl ? 'اكتب رسالتك...' : 'Type message...'}
                      className="flex-1 bg-transparent border-none py-3 px-2 text-sm focus:ring-0 outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 placeholder:font-normal"
                    />

                    <button type="submit" disabled={!messageText.trim()} className={`p-2 md:p-3.5 rounded-full transition-all duration-300 transform ${messageText.trim() ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 hover:shadow-emerald-500/40' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}>
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900 opacity-50" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                <div className="relative z-10 bg-white dark:bg-slate-800 p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-white/5 max-w-sm">
                  <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mb-8 mx-auto border-4 border-emerald-100 dark:border-emerald-500/10">
                    <MessageSquare className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-[900] uppercase tracking-tight text-slate-900 dark:text-white mb-3">
                    {isRtl ? 'صندوق الوارد' : 'Select a Conversation'}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                    {currentSession
                      ? (isRtl ? `أنت تستخدم الرقم ${currentSession.instanceName}` : `Connected as ${currentSession.instanceName}`)
                      : (isRtl ? 'اختر محادثة من القائمة الجانبية للبدء في المراسلة الفورية مع عملائك.' : 'Choose a conversation from the sidebar to start chatting with your customers in real-time.')
                    }
                  </p>
                  <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GLOBAL DROPDOWN MENU (Fixed Position outside main container) */}
      {showSessionMenu && availableSessions.length > 1 && (
        <div
          ref={sessionMenuRef}
          style={{
            position: 'fixed',
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width,
            zIndex: 9999
          }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-200 overflow-hidden"
        >
          <div className="p-2">
            <p className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">{isRtl ? 'تبديل الحساب' : 'Switch Account'}</p>
            {availableSessions.map(session => (
              <button
                key={session.instanceName}
                onClick={() => {
                  setCurrentSession(session);
                  setShowSessionMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${currentSession?.instanceName === session.instanceName ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200'}`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-colors">
                    {session.profilePicUrl ? <img src={session.profilePicUrl} className="w-full h-full object-cover" /> : <Smartphone className="w-5 h-5" />}
                  </div>
                  {currentSession?.instanceName === session.instanceName && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                  )}
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="font-bold text-sm truncate max-w-[140px]">{session.instanceName}</span>
                  <span className="text-[10px] text-slate-400">{session.status === 'open' ? 'Online' : 'Offline'}</span>
                </div>
                {currentSession?.instanceName === session.instanceName && <CheckCheck className="w-4 h-4 ml-auto text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Inbox;
