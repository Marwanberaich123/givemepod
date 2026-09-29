import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { MessageCircle, Send, X, ExternalLink, ShieldCheck, Clock } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#131926] border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{t('support.title', 'Need Assistance?')}</h3>
            <p className="text-xs text-slate-400">{t('support.subtitle', 'Direct human developer and platform support is available 7 days a week.')}</p>
          </div>
        </div>

        <div className="my-6 space-y-3">
          {/* WhatsApp Support Button */}
          <a
            href="https://wa.me/212613960504"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all duration-150 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#25D366] text-slate-950 flex items-center justify-center font-bold">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white group-hover:text-[#25D366] transition-colors">
                  {t('support.whatsapp', 'WhatsApp Support')}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  +212613960504
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </a>

          {/* Telegram Support Button */}
          <a
            href="https://t.me/kalo_1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/30 hover:bg-[#229ED9]/20 transition-all duration-150 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#229ED9] text-white flex items-center justify-center font-bold">
                <Send className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white group-hover:text-[#229ED9] transition-colors">
                  {t('support.telegram', 'Telegram Support')}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  @kalo_1
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </a>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            {t('auth.buyPoints.3', 'Direct WhatsApp and Telegram priority support')} for license verification, custom API integration, or product guidance.
          </span>
        </div>
      </div>
    </div>
  );
};
