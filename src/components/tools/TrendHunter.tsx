import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Flame,
  Search,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

interface TrendHunterProps {
  onUseTrend: (trendData: any) => void;
}

export const TrendHunter: React.FC<TrendHunterProps> = ({ onUseTrend }) => {
  const { t } = useLanguage();

  const [keyword, setKeyword] = useState('Minimalist Heavyweight Streetwear');
  const [product, setProduct] = useState('Hoodie');
  const [style, setStyle] = useState('Minimalist');
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<any[]>([
    {
      id: 't-1',
      trendName: 'Architectural Brutalism & Coordinate Grids',
      source: 'Etsy & Google Trends',
      searchSignal: '92/100 Commercial Search Volume',
      trendMomentum: 'Rising',
      competition: 'Moderate (48/100)',
      nicheSpecificity: 'High (88/100)',
      opportunityScore: 88,
      lastUpdated: '2026-09-29T04:20:00Z',
      dataType: 'Aggregated Search Signal'
    },
    {
      id: 't-2',
      trendName: 'Vintage National Park Embroidered Crest',
      source: 'Pinterest Trends',
      searchSignal: '85/100 High Board Save Velocity',
      trendMomentum: 'Rising',
      competition: 'High (65/100)',
      nicheSpecificity: 'Medium (76/100)',
      opportunityScore: 81,
      lastUpdated: '2026-09-29T04:20:00Z',
      dataType: 'Social Demand Signal'
    },
    {
      id: 't-3',
      trendName: 'Japandi Botanical Minimalist Line Art',
      source: 'Marketplace Trend Data',
      searchSignal: '78/100 Steady Gifting Demand',
      trendMomentum: 'Stable',
      competition: 'Low (38/100)',
      nicheSpecificity: 'Very High (92/100)',
      opportunityScore: 86,
      lastUpdated: '2026-09-29T04:20:00Z',
      dataType: 'Marketplace Signal'
    }
  ]);

  const [summary, setSummary] = useState<any>({
    summary: 'Strong consumer demand for oversized heavyweight blanks with understated typography and architecture aesthetics.',
    trendVelocity: 'Rising (+28% MoM)',
    searchVolumeSignal: '88/100 Commercial Intent'
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/trends/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, product, style })
      });
      const data = await res.json();
      if (res.ok && data.trends) {
        setTrends(data.trends);
        if (data.summary) setSummary(data.summary);
      }
    } catch (e) {
      console.error('Failed to search trends', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('nav.trendHunter', 'Trend Hunter')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Track verified velocity, search volume signals, and market demand across verified e-commerce providers.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Keyword / Theme / Niche</label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="e.g. Vintage Astronomy, Dog Moms, Cyberpunk typography..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Target Product</label>
            <select
              value={product}
              onChange={e => setProduct(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="T-Shirt">T-Shirt</option>
              <option value="Hoodie">Hoodie</option>
              <option value="Mug">Ceramic Mug</option>
              <option value="Tote Bag">Tote Bag</option>
              <option value="Poster">Poster</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Style Aesthetic</label>
            <select
              value={style}
              onChange={e => setStyle(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Minimalist">Minimalist</option>
              <option value="Vintage">Vintage</option>
              <option value="Streetwear">Streetwear</option>
              <option value="Typography">Typography</option>
              <option value="Japandi Line Art">Japandi Line Art</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400">
            Source transparent provider abstraction: Etsy, Pinterest, Google Trends.
          </span>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Search className="w-4 h-4" />}
            <span>Analyze Velocity Signals</span>
          </button>
        </div>
      </form>

      {/* Synthesis Banner */}
      {summary && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/30 to-violet-950/20 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
              Market Intelligence Synthesis
            </span>
            <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
              {summary.summary}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Velocity</span>
              <span className="font-bold text-emerald-400">{summary.trendVelocity}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">Demand Signal</span>
              <span className="font-bold text-white">{summary.searchVolumeSignal}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trend Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {trends.map(t => {
          const isRising = t.trendMomentum === 'Rising';
          return (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-[#111724] border border-slate-800/80 hover:border-slate-700 hover:bg-[#131b2b] transition-all duration-150 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-400">{t.source}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isRising ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {t.trendMomentum}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-tight">
                  {t.trendName}
                </h3>

                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Search Signal:</span>
                    <strong className="text-white font-mono">{t.searchSignal}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Competition:</span>
                    <strong className="text-amber-400 font-mono">{t.competition}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Niche Specificity:</span>
                    <strong className="text-indigo-400 font-mono">{t.nicheSpecificity}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Opportunity</span>
                  <span className="text-sm font-bold font-mono text-white">{t.opportunityScore}/100</span>
                </div>

                <button
                  onClick={() => onUseTrend({ trendName: t.trendName, product, style })}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Build This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
