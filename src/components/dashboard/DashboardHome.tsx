import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  TrendingUp,
  FolderOpen,
  ShieldCheck,
  Camera,
  PlusCircle,
  Lightbulb,
  ArrowRight,
  Clock,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

interface DashboardHomeProps {
  projects: any[];
  onOpenWizard: () => void;
  onOpenTrendHunter: () => void;
  onSelectProject: (projectId: string) => void;
  onViewAllProjects: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  projects,
  onOpenWizard,
  onOpenTrendHunter,
  onSelectProject,
  onViewAllProjects
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Creator';

  // Metrics
  const activeProjectsCount = projects.filter(p => p.status !== 'archived').length;
  const mockupsCount = projects.reduce((acc, p) => acc + (p.mockups?.length || 0), 0);
  const ideasCount = projects.reduce((acc, p) => acc + (p.concepts?.length || 0), 0);
  const readyCount = projects.filter(p => p.status === 'ready').length;

  const statusColors: Record<string, string> = {
    research: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    concept: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    design: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    mockups: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    listing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    ready: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    archived: 'text-slate-400 bg-slate-400/10 border-slate-400/20'
  };

  const riskColors: Record<string, string> = {
    LOW: 'text-emerald-400',
    MEDIUM: 'text-amber-400',
    HIGH: 'text-rose-400',
    NEEDS_REVIEW: 'text-orange-400'
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
            POD Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {t('dashboard.welcome', 'Welcome back')}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover opportunities, analyze trademark risk, generate 11 mockups, and prepare multi-platform listings.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenTrendHunter}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-2 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>{t('dashboard.ctaTrend', 'Research a Trend')}</span>
          </button>

          <button
            onClick={onOpenWizard}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('dashboard.ctaBuild', 'Build a POD Product')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Tabular Figures) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#111724] border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1">
            {t('dashboard.metrics.activeProjects', 'Active Projects')}
          </span>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">
            {activeProjectsCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111724] border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1">
            {t('dashboard.metrics.productsCreated', 'Ready to List')}
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {readyCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111724] border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1">
            {t('dashboard.metrics.ideasSaved', 'Ideas Formulated')}
          </span>
          <span className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
            {ideasCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111724] border border-slate-800/80">
          <span className="text-xs text-slate-400 block mb-1">
            {t('dashboard.metrics.riskChecks', 'Risk Scans')}
          </span>
          <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {projects.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111724] border border-slate-800/80 col-span-2 md:col-span-1">
          <span className="text-xs text-slate-400 block mb-1">
            {t('dashboard.metrics.mockupsGenerated', 'Mockups Generated')}
          </span>
          <span className="text-2xl font-bold font-mono text-violet-400 tabular-nums">
            {mockupsCount}
          </span>
        </div>
      </div>

      {/* Your POD Workspace Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t('dashboard.workspaceTitle', 'Your POD Workspace')}
            </h2>
            <p className="text-xs text-slate-400">
              {t('dashboard.workspaceSubtitle', 'Recently updated product projects and launch packages.')}
            </p>
          </div>

          <button
            onClick={onViewAllProjects}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>{t('dashboard.allProducts', 'View All Products')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-14 px-4 text-center rounded-2xl bg-[#111724] border border-dashed border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-slate-400 mx-auto flex items-center justify-center">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {t('dashboard.emptyProjects', 'No projects yet. Build your first POD product in under 2 minutes!')}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Research real consumer demand, create commercial print artwork, generate 11 mockups, and optimize tags.
              </p>
            </div>
            <button
              onClick={onOpenWizard}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              Start First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map(project => {
              const statusClass = statusColors[project.status] || statusColors.concept;
              const riskColor = riskColors[project.risk_level] || 'text-slate-400';

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="p-5 rounded-2xl bg-[#111724] border border-slate-800/80 hover:border-slate-700 hover:bg-[#131b2b] transition-all duration-150 cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        {project.product_type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${statusClass}`}>
                        {project.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {project.niche} · {project.design_style}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Opportunity</span>
                      <span className="font-mono font-bold text-white tabular-nums">
                        {project.opportunity_score}/100
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">IP Risk</span>
                      <span className={`font-semibold text-xs ${riskColor}`}>
                        {project.risk_level}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Mockups</span>
                      <span className="font-mono font-bold text-slate-300 tabular-nums">
                        {project.mockups?.length || 0}/11
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
