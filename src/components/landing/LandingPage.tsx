import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  Palette,
  ShieldCheck,
  Camera,
  FileText,
  Pin,
  Calculator,
  BarChart2,
  CheckCircle2,
  MessageCircle,
  Send,
  Layers,
  Zap,
  Globe2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenSupport: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onOpenSupport }) => {
  const { t } = useLanguage();
  const { signInWithGoogle } = useAuth();

  const featureCards = [
    {
      num: '01',
      title: t('landing.sections.trendResearch.title', 'Trend Research'),
      desc: t('landing.sections.trendResearch.desc', 'Real-time velocity tracking across Etsy, Pinterest, and search signals to identify authentic consumer demand.'),
      icon: TrendingUp,
      color: 'text-amber-400'
    },
    {
      num: '02',
      title: t('landing.sections.nicheDiscovery.title', 'Niche Discovery'),
      desc: t('landing.sections.nicheDiscovery.desc', 'Drill down from broad categories into high-margin micro-niches and find untapped audience gaps.'),
      icon: Search,
      color: 'text-indigo-400'
    },
    {
      num: '03',
      title: t('landing.sections.aiDesignStudio.title', 'AI Design Studio'),
      desc: t('landing.sections.aiDesignStudio.desc', 'Generate high-resolution commercial print artwork or production-grade prompts formatted for direct POD printing.'),
      icon: Palette,
      color: 'text-violet-400'
    },
    {
      num: '04',
      title: t('landing.sections.riskScanner.title', 'POD Risk Scanner'),
      desc: t('landing.sections.riskScanner.desc', 'Automated intellectual property screening against trademarks, copyright, celebrity names, and marketplace policies.'),
      icon: ShieldCheck,
      color: 'text-emerald-400'
    },
    {
      num: '05',
      title: t('landing.sections.mockupFactory.title', 'Mockup Factory'),
      desc: t('landing.sections.mockupFactory.desc', 'Batch-generate 11 consistent e-commerce mockups: 1 hero Etsy photo + 10 lifestyle, studio, and flat lay angles.'),
      icon: Camera,
      color: 'text-cyan-400'
    },
    {
      num: '06',
      title: t('landing.sections.etsyListing.title', 'Etsy Listing Generator'),
      desc: t('landing.sections.etsyListing.desc', 'Generate high-converting SEO titles, 13 compliant tags, rich descriptions, materials, and buyer FAQs.'),
      icon: FileText,
      color: 'text-orange-400'
    },
    {
      num: '07',
      title: t('landing.sections.pinterestFactory.title', 'Pinterest Content Factory'),
      desc: t('landing.sections.pinterestFactory.desc', 'Produce 5 viral Pin concepts with targeted keywords, hooks, call-to-actions, and direct-to-board readiness.'),
      icon: Pin,
      color: 'text-rose-400'
    },
    {
      num: '08',
      title: t('landing.sections.profitCalculator.title', 'Profit Calculator'),
      desc: t('landing.sections.profitCalculator.desc', 'Transparent margin math accounting for production cost, shipping, marketplace fees, ads, and currency conversions.'),
      icon: Calculator,
      color: 'text-emerald-400'
    },
    {
      num: '09',
      title: t('landing.sections.marketAnalyzer.title', 'Product Opportunity Analyzer'),
      desc: t('landing.sections.marketAnalyzer.desc', 'Transparent 0–100 POD Opportunity Score calculated from demand, competition, seasonality, and IP risk.'),
      icon: BarChart2,
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Subtle radial ambient light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium tracking-wide">
              {t('app.tagline', 'Research. Design. Validate. Mockup. Sell.')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance leading-tight">
            {t('landing.heroTitle', 'Turn POD Ideas Into Market-Ready Products.')}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('landing.heroSubtitle', 'Research trends, discover niches, analyze risks, create designs, generate mockups, optimize listings, and prepare your POD products — all in one workspace.')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 group transition-all duration-150 active:scale-[0.98]"
            >
              <span>{t('nav.getStarted', 'Get Started')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-sm transition-colors"
            >
              {t('nav.howItWorks', 'How It Works')}
            </button>
          </div>

          {/* Social Proof & Metrics Indicators */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-slate-800/80 mt-10">
            <div className="p-3">
              <span className="text-xs text-slate-400 block">{t('landing.stats.workflows', '11-Step Commercial Workflow')}</span>
              <span className="text-lg font-bold font-mono text-white">Full Automation</span>
            </div>
            <div className="p-3">
              <span className="text-xs text-slate-400 block">{t('landing.stats.mockups', '11 Mockups Per Product')}</span>
              <span className="text-lg font-bold font-mono text-white">1 Hero + 10 Angles</span>
            </div>
            <div className="p-3">
              <span className="text-xs text-slate-400 block">{t('landing.stats.risk', 'Automated IP Screen')}</span>
              <span className="text-lg font-bold font-mono text-emerald-400">USPTO & Trademark</span>
            </div>
            <div className="p-3">
              <span className="text-xs text-slate-400 block">{t('landing.stats.languages', '4 Global Languages')}</span>
              <span className="text-lg font-bold font-mono text-indigo-400">EN · AR · FR · PT</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Frame */}
        <div className="mt-14 relative rounded-2xl border border-slate-800 bg-[#0e1420] shadow-2xl overflow-hidden group">
          <div className="h-9 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
              givemepod.com/workspace/brutalist-streetwear-hoodie
            </div>
            <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Ready
            </div>
          </div>

          <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
            <img
              src="/src/assets/images/hero_pod_workspace_1790680840862.jpg"
              alt="GiveMePOD Command Center Preview"
              className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider block">Live Product Package</span>
                <h4 className="text-sm md:text-base font-semibold text-white">Concrete & Brutalism Coordinates Heavyweight Hoodie</h4>
                <p className="text-xs text-slate-400">Opportunity Score: 88/100 · IP Risk: LOW · 11 Mockups Ready · 13 Etsy Tags</p>
              </div>
              <button
                onClick={onGetStarted}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors"
              >
                Inspect Project
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy & 9 Features Grid */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            {t('landing.featuresTitle', 'The All-In-One POD Command Center')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            From Idea to 11 Mockups & SEO Listing
          </h2>
          <p className="text-sm text-slate-400">
            {t('landing.featuresSubtitle', 'Eliminate 8 separate subscriptions. From market research to 11 commercial listing mockups in minutes.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map(f => {
            const Icon = f.icon;
            return (
              <div
                key={f.num}
                className="p-6 rounded-2xl bg-[#111724] border border-slate-800/80 hover:border-slate-700 hover:bg-[#141b2b] transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform">
                      <Icon className={`w-5 h-5 ${f.color}`} />
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-semibold">{f.num}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 11 Mockups Showcase Spotlight */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-b from-[#131b2e] to-[#0e1422] border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              {t('mockups.heroLabel', 'Main Etsy Hero Mockup')} & 10 Contextual Angles
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Never Settle for 1 Weak Garment Photo Again
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every GiveMePOD product build generates 11 consistent e-commerce angles:
              Clean studio front hero, street lifestyle, close-up fabric texture, flat lay, outdoor sunlight, desktop, interior, gift wrap, and detail stitching.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-400 font-mono">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">Front View</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">Lifestyle</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">Close-Up Texture</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">Flat Lay</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">Studio</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">On Model</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">Gift Ready</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900">
              <img
                src="/src/assets/images/mockup_studio_hoodie_1790680851584.jpg"
                alt="Studio Hoodie"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900">
              <img
                src="/src/assets/images/mockup_ceramic_mug_1790680864069.jpg"
                alt="Ceramic Mug"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 col-span-2 sm:col-span-1">
              <img
                src="/src/assets/images/mockup_tote_bag_1790680874914.jpg"
                alt="Tote Bag"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          {t('landing.ctaBuild', 'Build Your Next POD Product')}
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          {t('app.shortDescription')}
        </p>
        <div>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all duration-150 active:scale-[0.98]"
          >
            {t('nav.getStarted', 'Get Started')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-4 sm:px-8 bg-slate-950/60 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white tracking-tight">GiveMePOD</span>
            <span>·</span>
            <span>Research. Design. Validate. Mockup. Sell.</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/212613960504"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp Support
            </a>
            <a
              href="https://t.me/kalo_1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              Telegram Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
