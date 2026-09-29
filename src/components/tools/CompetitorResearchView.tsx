import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  Layers,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export const CompetitorResearchView: React.FC = () => {
  const { t } = useLanguage();

  const [keyword, setKeyword] = useState('Minimalist Coffee Lover Gift');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({
    keyword: 'Minimalist Coffee Lover Gift',
    commonProductTypes: ['11oz White Ceramic Mugs', 'Basic Cotton T-Shirts', 'Vinyl Die-Cut Stickers'],
    commonDesignStyles: ['Handwritten brush fonts reading "But First, Coffee"', 'Crude cartoon coffee beans', 'Minimalist line art cups'],
    priceRanges: { low: 16.99, average: 24.50, high: 45.00 },
    commonKeywords: ['coffee gift', 'coffee lover mug', 'barista gift', 'morning coffee aesthetic'],
    visualPatterns: ['Centered circle badges', 'Black on white contrast', 'Hand-lettered script fonts'],
    nicheSaturation: 'Moderate',
    marketGaps: {
      whatIsCommon: 'Hundreds of low-effort clip-art mugs using identical public domain slogans and thin ceramic blanks.',
      whatIsMissing: 'Serious specialty espresso culture angles (pour-over flow ratios, brew extraction curves, single-origin botanical drawings) on premium matte black stoneware.',
      differentiatedAngle: 'Target specialty Third-Wave coffee enthusiasts with technical aesthetic precision rather than generic caffeine jokes.'
    }
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
      });
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      }
    } catch (e) {
      console.error('Failed to analyze competitors', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('nav.competitorResearch', 'Competitor Research & Market Gap Finder')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Synthesize public marketplace patterns to uncover white space without copying existing listings.
        </p>
      </div>

      {/* Compliance Notice */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          GiveMePOD enforces strict originality standards: We analyze saturation to help you create <strong>original, differentiated products</strong>. We never scrape private accounts, copy designs, or encourage imitation.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleAnalyze} className="p-4 rounded-2xl bg-[#111724] border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Enter keyword or marketplace theme (e.g. Vintage Astronomy, Plant Mom, Dark Academia)..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          disabled={loading || !keyword.trim()}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles className="w-4 h-4" />}
          <span>Find Market Gaps</span>
        </button>
      </form>

      {/* Market Gaps Highlight Box */}
      {data?.marketGaps && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#121a2d] to-[#0e1422] border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
              Market Gap Opportunity Report
            </span>
            <span className="text-xs font-mono text-amber-400">
              Saturation Level: {data.nicheSaturation}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                What Is Saturated & Common
              </span>
              <p className="text-slate-300 leading-relaxed">
                {data.marketGaps.whatIsCommon}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[10px] block">
                What Buyers Are Missing
              </span>
              <p className="text-slate-200 leading-relaxed">
                {data.marketGaps.whatIsMissing}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
              <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px] block">
                Recommended Differentiated Angle
              </span>
              <p className="text-white font-medium leading-relaxed">
                {data.marketGaps.differentiatedAngle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Common Marketplace Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="p-5 rounded-2xl bg-[#111724] border border-slate-800 space-y-3">
          <h3 className="font-semibold text-white">Dominant Product Formats</h3>
          <ul className="space-y-1.5 text-slate-300">
            {(data.commonProductTypes || []).map((p: string, i: number) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-[#111724] border border-slate-800 space-y-3">
          <h3 className="font-semibold text-white">Retail Price Spectrum</h3>
          <div className="pt-2 space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Entry / Race-to-Bottom:</span>
              <strong className="text-rose-400">${data.priceRanges?.low}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Market Average:</span>
              <strong className="text-amber-400">${data.priceRanges?.average}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Premium / High Perceived Value:</span>
              <strong className="text-emerald-400">${data.priceRanges?.high}</strong>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111724] border border-slate-800 space-y-3">
          <h3 className="font-semibold text-white">Recurring Keywords</h3>
          <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[11px]">
            {(data.commonKeywords || []).map((kw: string, i: number) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
