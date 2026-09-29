import React, { useState } from 'react';
import { useLanguage, Language } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  User,
  Globe2,
  Moon,
  Link,
  ShieldCheck,
  KeyRound,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, token } = useAuth();

  const [pinterestConnected, setPinterestConnected] = useState(false);
  const [etsyConnected, setEtsyConnected] = useState(false);
  const [etsyNotice, setEtsyNotice] = useState<string | null>(null);

  const togglePinterest = async () => {
    try {
      const res = await fetch('/api/integrations/pinterest/connect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || user?.id || ''}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPinterestConnected(data.status?.connected || false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleEtsy = async () => {
    try {
      const res = await fetch('/api/integrations/etsy/connect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || user?.id || ''}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEtsyConnected(data.status?.connected || false);
        setEtsyNotice(data.notice);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('nav.settings', 'Settings & System Preferences')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your permanent Secret Key license, connected e-commerce platforms, and interface language.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Permanent License & Access Status */}
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">GiveMePOD Permanent License</h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Entitlement Status</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Permanent Lifetime License Active</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Activated Code Reference</span>
              <span className="font-mono text-slate-300 font-bold">
                {user?.active_code_masked || '••••••••••••K2L8'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">Account Member ID</span>
              <span className="font-mono text-indigo-300">{user?.name || user?.email}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            For security, full plaintext access codes are never stored or displayed in client code.
          </p>
        </div>

        {/* 2. Platform Integrations (Pinterest & Etsy Compliance) */}
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <Link className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Official Platform Integrations</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Etsy Shop Integration */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-white block">Etsy Shop API</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  Direct connection for publishing drafts and syncing verified search tags.
                </span>
                {etsyNotice && (
                  <p className="text-[10px] text-amber-300/80 mt-1 font-mono">{etsyNotice}</p>
                )}
              </div>
              <button
                onClick={toggleEtsy}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  etsyConnected ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {etsyConnected ? 'Connected' : 'Connect Etsy Shop'}
              </button>
            </div>

            {/* Pinterest Integration */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-white block">Pinterest Official OAuth</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  Publish generated Pin concepts directly to boards with explicit user consent.
                </span>
              </div>
              <button
                onClick={togglePinterest}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  pinterestConnected ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {pinterestConnected ? 'Connected' : 'Connect Pinterest'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Language & Localization */}
        <div className="p-6 rounded-2xl bg-[#111724] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <Globe2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Language & Regional Interface</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { code: 'en' as Language, name: 'English (US)' },
              { code: 'ar' as Language, name: 'العربية (RTL Arabic)' },
              { code: 'fr' as Language, name: 'Français (French)' },
              { code: 'pt' as Language, name: 'Português (Portuguese)' }
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  language === l.code
                    ? 'bg-indigo-600/15 border-indigo-500 text-white font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
