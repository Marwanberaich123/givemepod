import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  KeyRound,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight,
  Check,
  HelpCircle,
  MessageCircle,
  Send,
  Zap
} from 'lucide-react';

interface KeyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport?: () => void;
}

export const KeyLoginModal: React.FC<KeyLoginModalProps> = ({
  isOpen,
  onClose,
  onOpenSupport
}) => {
  const { t, isRtl } = useLanguage();
  const { loginWithKey } = useAuth();

  const [keyInput, setKeyInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = keyInput.trim().toUpperCase().replace(/[\s-]/g, '');
    if (!cleanKey) {
      setError(t('auth.keyRequired', 'Please enter your Secret Access Key.'));
      return;
    }

    setLoading(true);
    setError(null);

    const result = await loginWithKey(cleanKey, nameInput.trim() || undefined);
    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || t('auth.codeInvalid', 'Invalid or unrecognized Secret Access Key.'));
    }
  };

  const sampleKeys = [
    { code: 'A3F9K2L8Z1', label: 'Admin Key (Master)', badge: 'Admin' },
    { code: 'M7X4V0C5B9', label: 'Member Key #2', badge: 'PRO' },
    { code: 'Q1W6E8R3T5', label: 'Member Key #3', badge: 'PRO' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#111724] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 mx-auto shadow-lg shadow-indigo-600/30">
            <div className="w-full h-full rounded-[14px] bg-[#0f1422] flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {t('auth.keyLoginTitle', 'Sign In with Secret Key')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {t('auth.keyLoginSubtitle', 'Enter your 10-character Secret Access Key to authenticate and unlock GiveMePOD.')}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{t('auth.enterAccessCode', 'Secret Access Key')}</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">10 Characters</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value.toUpperCase())}
                placeholder="A3F9K2L8Z1"
                maxLength={14}
                autoFocus
                className="w-full h-12 px-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-mono text-sm tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors uppercase"
              />
              <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              <span>{t('auth.nameOptional', 'Display Name or Brand (Optional)')}</span>
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="e.g. Jean / My POD Brand"
              className="w-full h-11 px-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Authenticating Key...</span>
              </span>
            ) : (
              <>
                <span>{t('auth.loginBtn', 'Unlock Command Center')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Database Keys */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Zap className="w-3 h-3 text-amber-400" />
              {t('auth.quickKeys', 'Database Access Keys (Click to Fill):')}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {sampleKeys.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setKeyInput(item.code);
                  setError(null);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  keyInput === item.code
                    ? 'bg-indigo-950/60 border-indigo-500 text-white'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-300">{item.code}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    item.badge === 'Admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {item.badge}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Support & Key Inquiry */}
        <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span>{t('auth.noKey', "Don't have a Secret Key?")}</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenSupport) onOpenSupport();
            }}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{t('auth.contactSupportBtn', 'Contact Support')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
