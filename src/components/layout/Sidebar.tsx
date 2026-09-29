import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Flame,
  Lightbulb,
  Palette,
  Camera,
  ShieldAlert,
  BarChart2,
  Search,
  FileText,
  Pin,
  Calculator,
  Calendar,
  Bot,
  FolderOpen,
  LineChart,
  Settings,
  ShieldCheck,
  PlusCircle,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenWizard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  onOpenWizard
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'wizard', label: t('wizard.title', 'Build a POD Product'), icon: PlusCircle, isCta: true },
    { id: 'trends', label: t('nav.trendHunter', 'Trend Hunter'), icon: Flame },
    { id: 'ideas', label: t('nav.ideaFinder', 'Idea Finder'), icon: Lightbulb },
    { id: 'design', label: t('nav.designStudio', 'Design Studio'), icon: Palette },
    { id: 'mockups', label: t('nav.mockupFactory', 'Mockup Factory'), icon: Camera },
    { id: 'risk', label: t('nav.riskScanner', 'Risk Scanner'), icon: ShieldAlert },
    { id: 'market', label: t('nav.marketAnalyzer', 'Market Analyzer'), icon: BarChart2 },
    { id: 'competitor', label: t('nav.competitorResearch', 'Competitor Research'), icon: Search },
    { id: 'etsy', label: t('nav.etsyListing', 'Etsy Listing'), icon: FileText },
    { id: 'pinterest', label: t('nav.pinterestFactory', 'Pinterest Factory'), icon: Pin },
    { id: 'profit', label: t('nav.profitCalculator', 'Profit Calculator'), icon: Calculator },
    { id: 'seasonal', label: t('nav.seasonalPlanner', 'Seasonal Planner'), icon: Calendar },
    { id: 'advisor', label: t('nav.aiAdvisor', 'AI POD Advisor'), icon: Bot },
    { id: 'products', label: t('nav.myProducts', 'My Products'), icon: FolderOpen },
    { id: 'analytics', label: t('nav.analytics', 'Analytics'), icon: LineChart },
    { id: 'settings', label: t('nav.settings', 'Settings'), icon: Settings }
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({
      id: 'admin',
      label: t('nav.admin', 'Admin Console'),
      icon: ShieldCheck
    });
  }

  const handleSelect = (id: string) => {
    if (id === 'wizard') {
      onOpenWizard();
    } else {
      setActiveTab(id);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <aside className="w-64 h-full flex flex-col bg-[#0b0f17] border-r border-slate-800/80 select-none">
      {/* Primary CTA */}
      <div className="p-4 border-b border-slate-800/60">
        <button
          onClick={onOpenWizard}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all duration-150 active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('dashboard.ctaBuild', 'Build a POD Product')}</span>
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 custom-scrollbar">
        {navItems.map(item => {
          if (item.isCta) return null; // already handled top CTA
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 font-semibold border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>GiveMePOD v2.6</span>
          <span className="text-emerald-400 font-medium">Core Engine Active</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop view */}
      <div className="hidden lg:block shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </div>

      {/* Mobile drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            <button
              onClick={onCloseMobile}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
