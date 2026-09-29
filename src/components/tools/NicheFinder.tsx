import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Lightbulb,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface NicheFinderProps {
  onSelectNiche: (nicheData: any) => void;
}

export const NicheFinder: React.FC<NicheFinderProps> = ({ onSelectNiche }) => {
  const { t } = useLanguage();

  const [broadNiche, setBroadNiche] = useState('Indoor Plant Collectors');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([
    {
      name: 'Rare Monstera & Aroid Propagation Enthusiasts',
      audience: 'Dedicated houseplant hobbyists who value botanical accuracy and aesthetic pottery decor.',
      potentialProducts: ['Heavyweight Organic T-Shirt', 'Ceramic 15oz Mug', 'Canvas Tote Bag'],
      styleOpportunity: 'Japandi Fine Line Art with Latin species binomial nomenclature.',
      keywordIdeas: ['monstera plant mom mug', 'aroid botanical tee', 'rare houseplant gift'],
      seasonality: 'Year-round, with high gifting surge in Spring & Q4 Holidays.',
      competitionLevel: 'Low',
      untappedAngle: 'Avoid cartoon "Crazy Plant Lady" slogans; focus on quiet, museum-grade botanical scientific sketches.',
      opportunityScore: 92
    },
    {
      name: 'Bonsai & Japanese Zen Garden Cultivators',
      audience: 'Contemplative adults interested in patience, philosophy, and miniature arboriculture.',
      potentialProducts: ['Crewneck Sweatshirt', 'Matte Fine Art Poster', 'Hardcover Journal'],
      styleOpportunity: 'Sumi-e ink brush painting with minimal kanji seal stamp.',
      keywordIdeas: ['bonsai tree apparel', 'zen garden journal gift', 'japanese minimalist aesthetic'],
      seasonality: 'Father’s Day, graduation, and retirement gifting.',
      competitionLevel: 'Low',
      untappedAngle: 'High willingness-to-pay for premium heavyweight fabrics with philosophical quotes on patience.',
      opportunityScore: 87
    }
  ]);

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadNiche.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/niches/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadNiche })
      });
      const data = await res.json();
      if (res.ok && data.subNiches) {
        setResults(data.subNiches);
      }
    } catch (e) {
      console.error('Failed to discover niches', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('nav.ideaFinder', 'Niche Discovery Engine')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Deconstruct saturated broad categories into high-margin micro-niches and pinpoint untapped market angles.
        </p>
      </div>

      <form onSubmit={handleDiscover} className="p-4 rounded-2xl bg-[#111724] border border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Broad Category or Passion
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={broadNiche}
              onChange={e => setBroadNiche(e.target.value)}
              placeholder="e.g. Pets, Books, Coffee, Architecture, Gaming..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            disabled={loading || !broadNiche.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles className="w-4 h-4" />}
            <span>Find Untapped Angles</span>
          </button>
        </div>
      </form>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Identified Opportunities ({results.length})</span>
          <span className="text-[11px] font-mono text-slate-500">
            {t('common.scoreDisclaimer', 'This score is an analytical indicator, not a sales prediction.')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {results.map((sub, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#111724] border border-slate-800/80 hover:border-slate-700 hover:bg-[#131b2b] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-indigo-400 font-semibold text-[11px]">
                    Micro-Niche #{i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Comp:</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sub.competitionLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {sub.competitionLevel}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-tight">
                  {sub.name}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {sub.audience}
                </p>

                {/* Untapped Angle Box */}
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200">
                  <span className="font-bold text-indigo-400 block text-[10px] uppercase tracking-wider mb-1">
                    Untapped Market Wedge
                  </span>
                  {sub.untappedAngle}
                </div>

                <div className="space-y-1 text-xs text-slate-400 pt-1">
                  <div>Recommended Style: <strong className="text-white">{sub.styleOpportunity}</strong></div>
                  <div>Seasonality: <span className="text-slate-300">{sub.seasonality}</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Opportunity</span>
                  <span className="text-sm font-bold font-mono text-white">{sub.opportunityScore}/100</span>
                </div>

                <button
                  onClick={() => onSelectNiche(sub)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Build This Niche</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
