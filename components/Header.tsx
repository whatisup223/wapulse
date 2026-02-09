
import React from 'react';
import { Bell, Moon, Sun, Globe, Search, User, Menu } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  userName,
  userRole,
  onLogout,
  onMenuClick
}) => {
  const isRtl = language === 'ar';

  return (
    <header className={`h-20 px-6 md:px-10 flex items-center justify-between sticky top-0 z-[40] transition-colors border-b ${isDarkMode ? 'bg-[#020617] border-white/5' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center gap-6 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative max-w-md w-full hidden md:block">
          <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300`} />
          <input
            type="text"
            placeholder={isRtl ? 'بحث في النظام...' : 'Search dashboard...'}
            className={`w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-2.5 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-xs font-bold focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all`}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-2 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase hidden sm:inline">{language}</span>
        </button>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-950" />}
        </button>

        <div className="w-[1px] h-6 bg-slate-100 dark:bg-slate-800 mx-2 hidden sm:block"></div>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 pl-1 pr-1 hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-950 dark:text-white leading-none">{userName}</p>
            <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1 tracking-wider">{userRole}</p>
          </div>
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img
              src="https://picsum.photos/seed/user123/100/100"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
