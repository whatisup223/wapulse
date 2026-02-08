
export type Page = 'dashboard' | 'inbox' | 'campaigns' | 'scheduled' | 'contacts' | 'connection' | 'analytics' | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'pro' | 'business' | 'enterprise';
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  status: 'online' | 'offline' | 'away';
  tags: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status: 'sent' | 'delivered' | 'read' | 'pending';
}

export interface Campaign {
  id: string;
  name: string;
  recipients: number;
  status: 'sent' | 'pending' | 'failed' | 'scheduled';
  createdAt: string;
  scheduledAt?: string;
}

export interface WahaSession {
  name: string;
  status: 'STOPPED' | 'STARTING' | 'SCAN_QR' | 'WORKING' | 'FAILED';
  config?: any;
  me?: {
    id: string;
    pushName: string;
  };
}
