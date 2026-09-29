import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldAlert,
  Search,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  FileCheck
} from 'lucide-react';

export const RiskScannerView: React.FC = () => {
  const { t } = useLanguage();

  const [inputPhrase, setInputPhrase] = useState('Just Do It Someday');
  const [context, setContext] = useState('Print on demand apparel t-shirt slogan');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    overall_risk: 'HIGH',
    score: 35,
    detected_evidence: [
      'Direct phonetic and conceptual similarity to registered Nike wordmark "JUST DO IT" (USPTO Reg. #1875307, Class 025).',
      'High likelihood of trademark dilution and likelihood of confusion claim in apparel category.'
    ],
    ai_inference: [
      'While parodies may have fair use defenses in editorial contexts, major e-commerce platforms (Etsy, Amazon Merch, Shopify) enforce proactive trademark takedowns without fair use adjudication.',
      'Using variations of famous slogans creates high probability of account suspension.'
    ],
    recommendations: [
      'Abandon slogan variation immediately.',
      'Pivot to completely original motivational phrasing without "Just Do It" grammatical structure.',
      'Example safe alternative: "Start Where You Stand" or "Patience & Momentum".'
    ],
    disclaimer: 'GiveMePOD provides automated screening and market analysis. It does not provide legal advice and cannot guarantee that a product is free from intellectual-property claims or marketplace policy violations.',
    checked_at: new Date().toISOString()
  });

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhrase.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/risk/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase: inputPhrase, context })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch (e) {
      console.error('Risk scan failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('risk.title', 'IP / Trademark / Copyright Risk Scanner')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Automated screening against trademarks, copyright, celebrity names, sports franchises, and marketplace policies.
        </p>
      </div>

      {/* Legal Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('risk.disclaimer', 'GiveMePOD provides automated screening and market analysis. It does not provide legal advice and cannot guarantee that a product is free from intellectual-property claims or marketplace policy violations.')}
        </p>
      </div>

      {/* Input Scanner Form */}
      <form onSubmit={handleScan} className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Slogan, Title, Character, or Keyword to Screen
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputPhrase}
              onChange={e => setInputPhrase(e.target.value)}
              placeholder="e.g., phrase, movie quote, lyric, sports motto..."
              className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Category Context (Optional)
          </label>
          <input
            type="text"
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="e.g. Apparel Class 025, Ceramic Mug Class 021, Poster Class 016..."
            className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400">
            Checks USPTO wordmarks, celebrity rights of publicity, sports leagues, and Disney/Warner entertainment franchises.
          </span>

          <button
            type="submit"
            disabled={loading || !inputPhrase.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <ShieldAlert className="w-4 h-4" />}
            <span>Run Automated Risk Scan</span>
          </button>
        </div>
      </form>

      {/* Scan Results Display */}
      {result && (
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Screening Assessment
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Scan Target: "{inputPhrase}"
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                  result.overall_risk === 'LOW'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : result.overall_risk === 'HIGH'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {result.overall_risk} RISK ({result.score}/100 Confidence)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* 1. Evidence */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-rose-400" />
                <span>Detected Evidence</span>
              </h4>
              <ul className="space-y-2 text-slate-300">
                {(result.detected_evidence || []).map((e: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Inference */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Marketplace Inference</span>
              </h4>
              <ul className="space-y-2 text-slate-300">
                {(result.ai_inference || []).map((inf: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{inf}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Recommendations */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Recommended Action</span>
              </h4>
              <ul className="space-y-2 text-slate-300">
                {(result.recommendations || []).map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Research Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <a
              href="https://tmsearch.uspto.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>{t('risk.actions.researchTm', 'Research USPTO / Trademark Office')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setInputPhrase('Original Minimalist Aesthetic')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-xs text-indigo-300 transition-colors"
            >
              {t('risk.actions.modifyConcept', 'Modify Concept to Safe Angle')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
