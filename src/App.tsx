import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { LockedDashboard } from './components/auth/LockedDashboard';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { BuildProductWizard } from './components/wizard/BuildProductWizard';
import { ProjectDetail } from './components/products/ProjectDetail';
import { MyProductsList } from './components/products/MyProductsList';
import { TrendHunter } from './components/tools/TrendHunter';
import { NicheFinder } from './components/tools/NicheFinder';
import { MockupFactoryView } from './components/tools/MockupFactoryView';
import { RiskScannerView } from './components/tools/RiskScannerView';
import { ProfitCalculatorView } from './components/tools/ProfitCalculatorView';
import { SeasonalPlannerView } from './components/tools/SeasonalPlannerView';
import { AiPodAdvisorView } from './components/tools/AiPodAdvisorView';
import { CompetitorResearchView } from './components/tools/CompetitorResearchView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SettingsView } from './components/settings/SettingsView';
import { SupportModal } from './components/support/SupportModal';
import { CommandPalette } from './components/layout/CommandPalette';
import { KeyLoginModal } from './components/auth/KeyLoginModal';
import { MessageCircle, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isLocked, loading } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [keyLoginOpen, setKeyLoginOpen] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('givemepod_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/projects', { headers });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error('Failed to fetch projects', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Command palette hotkey (⌘K / Ctrl+K and '/' key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-mono text-slate-400">Loading GiveMePOD Core...</span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated: Show Landing Page with Key Login Trigger
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
        <Navbar
          onOpenCommand={() => setKeyLoginOpen(true)}
          onOpenSupport={() => setSupportOpen(true)}
          onOpenKeyLogin={() => setKeyLoginOpen(true)}
          activeTab={activeTab}
          setActiveTab={() => setKeyLoginOpen(true)}
        />
        <LandingPage
          onGetStarted={() => setKeyLoginOpen(true)}
          onOpenSupport={() => setSupportOpen(true)}
        />

        {/* Secret Key Login Modal */}
        <KeyLoginModal
          isOpen={keyLoginOpen}
          onClose={() => setKeyLoginOpen(false)}
          onOpenSupport={() => setSupportOpen(true)}
        />

        <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
      </div>
    );
  }

  // 2. Authenticated but Locked (No Permanent Access Entitlement)
  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
        <Navbar
          onOpenCommand={() => setCommandOpen(true)}
          onOpenSupport={() => setSupportOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <LockedDashboard onOpenSupport={() => setSupportOpen(true)} />
        <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
      </div>
    );
  }

  // 3. Fully Authenticated with Permanent License Active
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <Navbar
        onOpenCommand={() => setCommandOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedProjectId(null);
          setActiveTab(tab);
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={selectedProjectId ? '' : activeTab}
          setActiveTab={(tab) => {
            setSelectedProjectId(null);
            setActiveTab(tab);
          }}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenWizard={() => setWizardOpen(true)}
        />

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {selectedProject ? (
            <ProjectDetail
              project={selectedProject}
              onBack={() => setSelectedProjectId(null)}
              onUpdateProject={(updated) => {
                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardHome
                  projects={projects}
                  onOpenWizard={() => setWizardOpen(true)}
                  onOpenTrendHunter={() => setActiveTab('trends')}
                  onSelectProject={(id) => setSelectedProjectId(id)}
                  onViewAllProjects={() => setActiveTab('products')}
                />
              )}

              {activeTab === 'trends' && (
                <TrendHunter
                  onUseTrend={(data) => {
                    setWizardOpen(true);
                  }}
                />
              )}

              {activeTab === 'ideas' && (
                <NicheFinder
                  onSelectNiche={(niche) => {
                    setWizardOpen(true);
                  }}
                />
              )}

              {activeTab === 'design' && (
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI Design Studio</h1>
                      <p className="text-xs sm:text-sm text-slate-400">Generate commercial POD print artwork and production prompts with transparent background specs.</p>
                    </div>
                    <button
                      onClick={() => setWizardOpen(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      New Design Project
                    </button>
                  </div>
                  {projects.length > 0 && projects[0].design ? (
                    <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
                      <h3 className="text-sm font-semibold text-white">Recent Design: {projects[0].title}</h3>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800">
                        {projects[0].design.prompt}
                      </p>
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-2xl bg-[#111724] border border-dashed border-slate-800">
                      <p className="text-xs text-slate-400">Build a product to formulate tailored print artwork.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'mockups' && (
                <MockupFactoryView onOpenWizard={() => setWizardOpen(true)} />
              )}

              {activeTab === 'risk' && <RiskScannerView />}

              {activeTab === 'market' && (
                <TrendHunter onUseTrend={() => setWizardOpen(true)} />
              )}

              {activeTab === 'competitor' && <CompetitorResearchView />}

              {activeTab === 'etsy' && (
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Etsy Listing & SEO Tag Generator</h1>
                      <p className="text-xs sm:text-sm text-slate-400">Natural, high-converting copy with 13 compliant tags and buyer FAQs.</p>
                    </div>
                  </div>
                  {projects.length > 0 && projects[0].seo ? (
                    <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4 text-xs">
                      <span className="font-semibold text-indigo-400 block">SEO Title ({projects[0].title})</span>
                      <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono">{projects[0].seo.title}</p>
                      <span className="font-semibold text-indigo-400 block pt-2">13 Verified Tags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {projects[0].seo.tags.map((t: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-2xl bg-[#111724] border border-dashed border-slate-800">
                      <p className="text-xs text-slate-400">Build a product to generate complete Etsy listings.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pinterest' && (
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Pinterest Content Factory</h1>
                    <p className="text-xs sm:text-sm text-slate-400">5 conversion-tested Pin concepts formatted for viral organic reach and boards.</p>
                  </div>
                  {projects.length > 0 && projects[0].pinterest ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {projects[0].pinterest.map((pin: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-[#111724] border border-slate-800 space-y-2">
                          <span className="text-[10px] text-rose-400 font-bold uppercase">Pin Concept #{i + 1}</span>
                          <h4 className="font-semibold text-white">{pin.pin_title}</h4>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{pin.pin_description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-2xl bg-[#111724] border border-dashed border-slate-800">
                      <p className="text-xs text-slate-400">Build a product to generate Pinterest Pins.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profit' && <ProfitCalculatorView />}

              {activeTab === 'seasonal' && <SeasonalPlannerView />}

              {activeTab === 'advisor' && (
                <AiPodAdvisorView currentProject={projects[0] || null} />
              )}

              {activeTab === 'products' && (
                <MyProductsList
                  projects={projects}
                  onSelectProject={(id) => setSelectedProjectId(id)}
                  onOpenWizard={() => setWizardOpen(true)}
                  onRefresh={fetchProjects}
                />
              )}

              {activeTab === 'analytics' && (
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Performance & Workflow Analytics</h1>
                    <p className="text-xs sm:text-sm text-slate-400">Platform connection required for external marketplace transaction data.</p>
                  </div>
                  <div className="p-8 rounded-2xl bg-[#111724] border border-slate-800 text-center space-y-2">
                    <p className="text-sm font-semibold text-white">Connect a platform to unlock sales analytics.</p>
                    <p className="text-xs text-slate-400">GiveMePOD displays real, un-fabricated data from connected Etsy or Shopify stores.</p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && <SettingsView />}

              {activeTab === 'admin' && <AdminDashboard />}
            </>
          )}
        </main>
      </div>

      {/* Floating Need Help? Button */}
      <button
        onClick={() => setSupportOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2 group transition-all duration-200"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <MessageCircle className="w-4 h-4 text-emerald-400" />
        <span>{t('support.floatingLabel', 'Need Help?')}</span>
      </button>

      {/* Build Product Multi-Step Wizard Modal */}
      <BuildProductWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onProjectCreated={(newProject) => {
          setProjects(prev => [newProject, ...prev]);
          setSelectedProjectId(newProject.id);
        }}
      />

      {/* Support Modal (WhatsApp & Telegram) */}
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onSelectAction={(actionId) => {
          if (actionId === 'wizard') {
            setWizardOpen(true);
          } else {
            setSelectedProjectId(null);
            setActiveTab(actionId);
          }
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
