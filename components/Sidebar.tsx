
import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Megaphone, 
  Users, 
  Link, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  X,
  Zap
} from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  language: 'en' | 'ar';
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  setCurrentPage, 
  isCollapsed, 
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  language
}) => {
  const isRtl = language === 'ar';

  const menuItems = [
    { id: 'dashboard', label: isRtl ? 'لوحة التحكم' : 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: isRtl ? 'صندوق الوارد' : 'Inbox', icon: MessageSquare },
    { id: 'campaigns', label: isRtl ? 'الحملات' : 'Campaigns', icon: Megaphone },
    { id: 'contacts', label: isRtl ? 'جهات الاتصال' : 'Contacts', icon: Users },
    { id: 'connection', label: isRtl ? 'الربط' : 'Connection', icon: Link },
    { id: 'analytics', label: isRtl ? 'التحليلات' : 'Analytics', icon: BarChart3 },
    { id: 'settings', label: isRtl ? 'الإعدادات' : 'Settings', icon: Settings },
  ];

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60] lg:hidden transition-opacity" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside 
        className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-[70] lg:static transition-all duration-500 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')} lg:translate-x-0
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-72 h-screen`}
      >
        <div className="h-full flex flex-col bg-white dark:bg-[#0F172A] border-r border-slate-100 dark:border-white/5 transition-colors">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-emerald-600 flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-emerald-900/20 transform transition-transform hover:rotate-6">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-extrabold text-xl tracking-tighter text-slate-950 dark:text-white uppercase">Pulse</span>
              )}
            </div>
            <button className="lg:hidden p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setIsMobileOpen(false)}>
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-hide mt-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as Page)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${currentPage === item.id 
                    ? 'bg-slate-950 text-white dark:bg-emerald-600 dark:text-white shadow-lg shadow-slate-200 dark:shadow-emerald-900/10' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900'}`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
                {(!isCollapsed || isMobileOpen) && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto border-t border-slate-50 dark:border-white/5">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center p-3 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hidden lg:flex"
            >
              {isCollapsed ? (isRtl ? <ChevronLeft /> : <ChevronRight />) : (isRtl ? <ChevronRight /> : <ChevronLeft />)}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
