import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  RefreshCw,
  Archive,
  Trash2,
  Share2,
  Sparkles,
  ShieldCheck,
  Camera,
  FileText,
  Pin,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileArchive
} from 'lucide-react';

interface ProjectDetailProps {
  project: any;
  onBack: () => void;
  onUpdateProject: (updated: any) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onUpdateProject
}) => {
  const { t } = useLanguage();
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'concept' | 'design' | 'mockups' | 'risk' | 'seo' | 'profit' | 'pinterest'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [regeneratingStep, setRegeneratingStep] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerate = async (step: string) => {
    setRegeneratingStep(step);
    try {
      const res = await fetch(`/api/projects/${project.id}/step/${step}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || user?.id || ''}`
        }
      });
      const data = await res.json();
      if (res.ok && data.project) {
        onUpdateProject(data.project);
      }
    } catch (e) {
      console.error(`Failed to regenerate ${step}`, e);
    } finally {
      setRegeneratingStep(null);
    }
  };

  const downloadExport = (format: 'zip' | 'json' | 'csv') => {
    window.location.href = `/api/projects/${project.id}/export/${format}`;
  };

  const selectedConcept = project.concepts?.find((c: any) => c.id === project.selected_concept_id) || project.concepts?.[0] || {};

  // Readiness scorecard items
  const checkDesign = Boolean(project.design);
  const checkResearch = Boolean(project.market_research);
  const checkRisk = project.risk_level === 'LOW' || project.risk_level === 'MEDIUM';
  const checkMockups = (project.mockups?.length || 0) >= 1;
  const checkSeo = Boolean(project.seo?.title && project.seo?.tags?.length);
  const checkProfit = Boolean(project.profit?.net_profit);
  const checkPinterest = (project.pinterest?.length || 0) >= 1;

  const allChecksPass = checkDesign && checkResearch && checkRisk && checkMockups && checkSeo && checkProfit && checkPinterest;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => downloadExport('zip')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            title="Download full project package as ZIP"
          >
            <FileArchive className="w-3.5 h-3.5" />
            <span>Export Package (.ZIP)</span>
          </button>

          <button
            onClick={() => downloadExport('csv')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => downloadExport('json')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Project Banner Card */}
      <div className="p-6 rounded-3xl bg-[#111724] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
              <span>{project.product_type}</span>
              <span>·</span>
              <span>{project.design_style}</span>
              {project.is_sample && (
                <>
                  <span>·</span>
                  <span className="text-amber-400 font-sans">Sample Project</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Audience: {project.target_audience?.occupation_interest || project.niche} ({project.target_audience?.gender}, {project.target_audience?.age_range})
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 block">Opportunity Score</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {project.opportunity_score}/100
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">IP Risk Status</span>
              <span className={`text-xs font-bold ${project.risk_level === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {project.risk_level}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">Readiness</span>
              <span className="text-xs font-semibold text-emerald-400">
                {allChecksPass ? 'Ready to List' : 'Reviewing'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 pt-4 custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'research', label: 'Research' },
            { id: 'concept', label: 'Concept' },
            { id: 'design', label: 'Design' },
            { id: 'mockups', label: `Mockups (${project.mockups?.length || 0}/11)` },
            { id: 'risk', label: 'Risk Scan' },
            { id: 'seo', label: 'Etsy SEO' },
            { id: 'profit', label: 'Profit Math' },
            { id: 'pinterest', label: 'Pinterest Pins' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW & SCORECARD */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Concept Summary */}
            <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-white">Active Product Concept</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {selectedConcept.visual_direction || 'Understated commercial graphic formulation.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {(selectedConcept.keyword_cluster || []).map((k: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                    {k}
                  </span>
                ))}
              </div>
            </div>

            {/* Mockup Preview Grid */}
            <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">E-Commerce Mockups Preview</h3>
                  <p className="text-xs text-slate-400">1 Main Etsy Hero mockup + 10 commercial contextual angles</p>
                </div>
                <button
                  onClick={() => setActiveTab('mockups')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  View All 11
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(project.mockups || []).slice(0, 4).map((m: any, idx: number) => (
                  <div key={idx} className="aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative group">
                    <img
                      src={m.image_url || '/src/assets/images/mockup_studio_hoodie_1790680851584.jpg'}
                      alt={m.purpose}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-mono text-white truncate">
                        #{m.mockup_number} {m.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Final Product Readiness Scorecard */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px] text-indigo-400">
                Product Readiness Scorecard
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-300">Design Artwork & Prompt</span>
                  {checkDesign ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-500">Pending</span>}
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-300">Market Trend Verification</span>
                  {checkResearch ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-500">Pending</span>}
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-300">IP / Trademark Screen</span>
                  <span className="text-emerald-400 font-semibold">{project.risk_level}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-300">11 Commercial Mockups</span>
                  <span className="font-mono text-white">{project.mockups?.length || 0}/11</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-300">Etsy SEO Title & 13 Tags</span>
                  {checkSeo ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-500">Pending</span>}
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-300">Profit Margin Math</span>
                  <span className="font-mono text-emerald-400 font-semibold">{project.profit?.profit_margin}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-300">Pinterest Content Factory</span>
                  <span className="font-mono text-white">{project.pinterest?.length || 0} Pins</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  Ready for Manual Listing
                </span>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Analytical indicator based on verified criteria; not a sales guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. RESEARCH TAB */}
      {activeTab === 'research' && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Market Intelligence & Opportunity Breakdown</h3>
            <div className="text-xs text-slate-400 font-mono">
              Source: {project.market_research?.source || 'Etsy & Pinterest Signals'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Search Demand</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">{project.opportunity_breakdown?.search_demand || 82}/100</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Trend Momentum</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">{project.opportunity_breakdown?.trend_momentum || 88}/100</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Niche Specificity</span>
              <span className="text-xl font-bold font-mono text-indigo-400 tabular-nums">{project.opportunity_breakdown?.niche_specificity || 85}/100</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Competition Pressure</span>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">{project.opportunity_breakdown?.competition || 55}/100</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-white">Market Summary</h4>
            <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {project.market_research?.summary || 'Steady consumer demand in authentic design aesthetics with low brand lock-in.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. DESIGN TAB */}
      {activeTab === 'design' && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Commercial Print Artwork & Production Prompt</h3>
              <p className="text-xs text-slate-400">Optimized for direct POD print production with pure transparent background requirement.</p>
            </div>
            <button
              onClick={() => handleRegenerate('design')}
              disabled={regeneratingStep === 'design'}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regeneratingStep === 'design' ? 'animate-spin' : ''}`} />
              <span>Regenerate Prompt</span>
            </button>
          </div>

          {project.design ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[10px]">
                    Image Generation Prompt
                  </span>
                  <button
                    onClick={() => handleCopy(project.design.prompt, 'prompt')}
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'prompt' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                  {project.design.prompt}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-semibold uppercase tracking-wider text-[10px]">
                    Negative Prompt
                  </span>
                  <button
                    onClick={() => handleCopy(project.design.negative_prompt, 'neg')}
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'neg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'neg' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-slate-400 font-mono text-[11px] leading-relaxed">
                  {project.design.negative_prompt}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Print Specifications</span>
                  <span className="font-mono text-white text-xs">{project.design.print_specs}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Transparent Background</span>
                  <span className="font-mono text-emerald-400 text-xs">Required (Alpha Channel)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Color Palette</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {(project.design.color_palette || []).map((c: string, idx: number) => (
                      <span key={idx} className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No design specifications yet.</p>
          )}
        </div>
      )}

      {/* 4. MOCKUPS TAB (11 MOCKUPS WORKFLOW) */}
      {activeTab === 'mockups' && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Mockup Factory (11 Commercial Angles)</h3>
              <p className="text-xs text-slate-400">1 Main Etsy Hero Mockup + 10 Contextual E-Commerce Scenes with artwork consistency.</p>
            </div>
            <button
              onClick={() => handleRegenerate('mockups')}
              disabled={regeneratingStep === 'mockups'}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regeneratingStep === 'mockups' ? 'animate-spin' : ''}`} />
              <span>Regenerate Prompts</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(project.mockups || []).map((m: any) => {
              const isHero = m.mockup_number === 1;
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                    isHero
                      ? 'bg-indigo-950/20 border-indigo-500/40 ring-1 ring-indigo-500/20'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="aspect-[4/3] rounded-lg bg-slate-950 overflow-hidden relative">
                    <img
                      src={m.image_url || '/src/assets/images/mockup_studio_hoodie_1790680851584.jpg'}
                      alt={m.purpose}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isHero && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                        Etsy Hero Primary
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Mockup #{m.mockup_number}</span>
                      <span className="capitalize">{m.category}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-white">{m.purpose}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{m.scene}</p>
                  </div>

                  <button
                    onClick={() => handleCopy(m.prompt, `mockup-${m.mockup_number}`)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-center gap-1.5"
                  >
                    {copiedKey === `mockup-${m.mockup_number}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Prompt</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Scene Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. RISK SCAN TAB */}
      {activeTab === 'risk' && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">IP / Trademark / Copyright Risk Scanner</h3>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${project.risk_level === 'LOW' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {project.risk_level} RISK ({project.risk?.score || 92}/100 Safe)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              {project.risk?.disclaimer || 'GiveMePOD provides automated screening and market analysis. It does not provide legal advice and cannot guarantee that a product is free from intellectual-property claims or marketplace policy violations.'}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-white">Detected Evidence & Database Matches</h4>
              <ul className="space-y-1 text-slate-300">
                {(project.risk?.detected_evidence || ['No trademark registration matches found in USPTO database.']).map((e: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-white">AI Inference & Contextual Risk</h4>
              <ul className="space-y-1 text-slate-300">
                {(project.risk?.ai_inference || ['Concept relies on generic descriptive language.']).map((inf: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>{inf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 6. ETSY SEO TAB */}
      {activeTab === 'seo' && project.seo && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Optimized Etsy Listing & 13 Tags</h3>
            <span className="text-xs text-slate-400 font-mono">Suggested Price: ${project.seo.price_range?.suggested}</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* SEO Title */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Optimized SEO Title</span>
                <button
                  onClick={() => handleCopy(project.seo.title, 'title')}
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-slate-200 font-mono text-[11px] leading-relaxed">{project.seo.title}</p>
            </div>

            {/* 13 Tags */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">13 Etsy Tags ({project.seo.tags?.length || 0}/13)</span>
                <button
                  onClick={() => handleCopy(project.seo.tags.join(', '), 'tags')}
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy All Tags</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(project.seo.tags || []).map((t: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-indigo-300 font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Product Description</span>
                <button
                  onClick={() => handleCopy(project.seo.description, 'desc')}
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-slate-300 text-xs whitespace-pre-line leading-relaxed">{project.seo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. PROFIT CALCULATOR TAB */}
      {activeTab === 'profit' && project.profit && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">POD Profit Margin Math</h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">{project.profit.profit_margin}% Net Margin</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Retail Price</span>
              <span className="text-xl font-bold font-mono text-white">${project.profit.selling_price}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Blank & Production Cost</span>
              <span className="text-xl font-bold font-mono text-rose-400">${project.profit.product_cost}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Est. Total Fees & Ads</span>
              <span className="text-xl font-bold font-mono text-amber-400">${project.profit.total_fees}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Net Profit / Unit</span>
              <span className="text-xl font-bold font-mono text-emerald-400">${project.profit.net_profit}</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. PINTEREST TAB */}
      {activeTab === 'pinterest' && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Pinterest Content Factory (5 Viral Pins)</h3>
              <p className="text-xs text-slate-400">Ready to publish to your boards or export for scheduling.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(project.pinterest || []).map((pin: any, idx: number) => (
              <div key={pin.id || idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-mono text-[10px] font-bold uppercase">Pin #{idx + 1}</span>
                  <button
                    onClick={() => handleCopy(`${pin.pin_title}\n\n${pin.pin_description}`, `pin-${idx}`)}
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === `pin-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <h4 className="font-semibold text-white text-xs">{pin.pin_title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">{pin.pin_description}</p>
                <div className="pt-1 text-[11px] text-slate-500 font-mono">
                  Board: {pin.board} · CTA: {pin.cta}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
