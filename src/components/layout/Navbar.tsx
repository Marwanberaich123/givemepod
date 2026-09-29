import React, { useState } from 'react';
import { useLanguage, Language } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  KeyRound,
  Sparkles,
  Command,
  Search,
  MessageCircle,
  Shield,
  LogOut,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  onOpenCommand: () => void;
  onOpenSupport: () => void;
  onOpenMobileMenu?: () => void;
  onOpenKeyLogin?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommand,
  onOpenSupport,
  onOpenMobileMenu,
  onOpenKeyLogin,
  activeTab,
  setActiveTab
}) => {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { user, signOut, isLocked } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'FR' },
    { code: 'pt', label: 'PT' }
  ];

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8">
      <div className="h-full flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title (Single text element wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center">
              GiveMe<span className="text-indigo-400">POD</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single line, clean typography) */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'text-white font-semibold' : 'hover:text-white'}`}
          >
            {t('nav.dashboard', 'Dashboard')}
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`transition-colors whitespace-nowrap ${activeTab === 'trends' ? 'text-white font-semibold' : 'hover:text-white'}`}
          >
            {t('nav.trendHunter', 'Trend Hunter')}
          </button>
          <button
            onClick={() => setActiveTab('mockups')}
            className={`transition-colors whitespace-nowrap ${activeTab === 'mockups' ? 'text-white font-semibold' : 'hover:text-white'}`}
          >
            {t('nav.mockupFactory', 'Mockup Factory')}
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`transition-colors whitespace-nowrap ${activeTab === 'risk' ? 'text-white font-semibold' : 'hover:text-white'}`}
          >
            {t('nav.riskScanner', 'Risk Scanner')}
          </button>
          <button
            onClick={() => setActiveTab('profit')}
            className={`transition-colors whitespace-nowrap ${activeTab === 'profit' ? 'text-white font-semibold' : 'hover:text-white'}`}
          >
            {t('nav.profitCalculator', 'Profit Calculator')}
          </button>
        </nav>

        {/* Zone 3: Actions (Search, Language Switcher, Help, User) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Global Search / Command Palette shortcut */}
          <button
            onClick={onOpenCommand}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            title="Open Command Palette"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t('nav.searchPlaceholder', 'Search...')}</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 rounded border border-slate-700 text-slate-300">
              ⌘K
            </kbd>
          </button>

          {/* Language Switcher: EN | العربية | FR | PT */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                  language === lang.code
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Support button */}
          <button
            onClick={onOpenSupport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{t('nav.needHelp', 'Need Help?')}</span>
          </button>

          {/* User Profile / Status */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-colors text-left"
              >
                <div className="hidden sm:block text-right">
                  <span className="block text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {user.has_permanent_access ? (
                      <span className="text-emerald-400 font-mono">
                        {user.active_code_masked || 'Permanent License'}
                      </span>
                    ) : (
                      <span className="text-amber-400">Locked</span>
                    )}
                  </span>
                </div>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
                  referrerPolicy="no-referrer"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#131926] border border-slate-800 shadow-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-slate-400 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Status:</span>
                      {user.has_permanent_access ? (
                        <span className="text-emerald-400 font-medium">Permanent Access Active</span>
                      ) : (
                        <span className="text-amber-400 font-medium">Access Locked</span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      {t('nav.settings', 'Settings & License')}
                    </button>

                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/40 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-indigo-400" />
                        {t('nav.admin', 'Admin Console')}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        signOut();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.signOut', 'Sign Out')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenKeyLogin ? onOpenKeyLogin() : setActiveTab('login')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{t('nav.signInWithKey', 'Enter Secret Key')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
