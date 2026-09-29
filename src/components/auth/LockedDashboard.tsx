import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Send,
  AlertCircle,
  CheckCircle,
  Eye,
  LogOut
} from 'lucide-react';

interface LockedDashboardProps {
  onOpenSupport: () => void;
}

export const LockedDashboard: React.FC<LockedDashboardProps> = ({ onOpenSupport }) => {
  const { t } = useLanguage();
  const { user, activateAccessCode, signOut } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBuyInfo, setShowBuyInfo] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await activateAccessCode(code);
    setLoading(false);

    if (result.success) {
      setSuccess(t('auth.codeActivatedSuccess', 'Permanent access unlocked successfully! Welcome to GiveMePOD.'));
    } else {
      setError(result.error || t('auth.codeInvalid', 'Invalid or revoked access code. Please check and try again.'));
    }
  };

  const handleBuyClick = () => {
    setPaymentNotice(t('auth.paymentNotConfigured', 'Payment integration not configured yet. Contact the administrator.'));
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-[#0b0f17]">
      {/* Background soft blurred preview of workspace */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 filter blur-lg">
        <div className="p-8 max-w-6xl mx-auto grid grid-cols-3 gap-6">
          <div className="h-44 rounded-2xl bg-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-800" />
          <div className="col-span-3 h-80 rounded-2xl bg-slate-800" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-xl bg-[#111724] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            {t('auth.lockedTitle', 'GiveMePOD is locked')}
          </h2>

          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {t('auth.lockedMessage', 'Enter your Secret Access Key to activate permanent lifetime access.')}
          </p>

          {user && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{t('auth.connectedAs', 'Authenticated Key')}: <strong className="text-white font-mono">{user.active_code_masked || user.id.slice(0, 8)}</strong></span>
            </div>
          )}
        </div>

        {/* Enter Access Code Form */}
        <form onSubmit={handleActivate} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('auth.enterAccessCode', 'Enter Access Code')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={e => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder={t('auth.accessCodePlaceholder', 'GMP-XXXX-XXXX-XXXX')}
                className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:border-indigo-500 transition-colors uppercase"
              />
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {t('auth.haveCode', 'Have an access code from the administrator? Enter it above to bind permanent access.')}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/25 transition-all duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{t('auth.activateBtn', 'Activate Permanent Access')}</span>
              </>
            )}
          </button>
        </form>

        {/* Buy Access Option */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">
              {t('auth.buySectionTitle', 'Get Permanent GiveMePOD Access')}
            </span>
            <button
              onClick={() => setShowBuyInfo(!showBuyInfo)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {showBuyInfo ? 'Hide Details' : 'Learn More'}
            </button>
          </div>

          {showBuyInfo && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs text-slate-300 animate-in fade-in duration-200">
              <p className="font-semibold text-white">
                {t('auth.buySectionSubtitle', 'One-time investment. Lifetime command center access via your Secret Key.')}
              </p>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>One-time payment — zero recurring monthly subscription fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Permanent entitlement bound to your Secret Key</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full access to Trend Hunter, Mockup Factory (11 angles), and Risk Scanner</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Direct WhatsApp and Telegram priority support</span>
                </li>
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleBuyClick}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>{t('auth.buyNow', 'Buy Access — $99 Once')}</span>
            </button>

            <button
              onClick={onOpenSupport}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>{t('auth.contactSupportBtn', 'Contact Support')}</span>
            </button>
          </div>

          {paymentNotice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{paymentNotice}</span>
            </div>
          )}
        </div>

        {/* Sign Out Option */}
        <div className="pt-2 text-center">
          <button
            onClick={signOut}
            className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out of this Google account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
