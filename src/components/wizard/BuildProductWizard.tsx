import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  TrendingUp,
  Shirt,
  Coffee,
  BookOpen,
  ShoppingBag,
  Image,
  Smartphone,
  Tag,
  Glasses,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface BuildProductWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

export const BuildProductWizard: React.FC<BuildProductWizardProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const { t } = useLanguage();
  const { token, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [productType, setProductType] = useState('T-Shirt');
  const [quantity, setQuantity] = useState(3);
  const [style, setStyle] = useState('Minimalist');
  const [customStyle, setCustomStyle] = useState('');
  const [audienceGender, setAudienceGender] = useState('Unisex');
  const [audienceAge, setAudienceAge] = useState('25–34');
  const [audienceOccupation, setAudienceOccupation] = useState('');
  const [includeTrends, setIncludeTrends] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [activeStepText, setActiveStepText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const productOptions = [
    { id: 'T-Shirt', label: t('wizard.productTypes.tshirt', 'T-Shirt'), icon: Shirt },
    { id: 'Hoodie', label: t('wizard.productTypes.hoodie', 'Hoodie'), icon: Shirt },
    { id: 'Mug', label: t('wizard.productTypes.mug', 'Ceramic Mug'), icon: Coffee },
    { id: 'Notebook', label: t('wizard.productTypes.notebook', 'Journal / Notebook'), icon: BookOpen },
    { id: 'Tote Bag', label: t('wizard.productTypes.totebag', 'Canvas Tote Bag'), icon: ShoppingBag },
    { id: 'Poster', label: t('wizard.productTypes.poster', 'Matte Poster'), icon: Image },
    { id: 'Phone Case', label: t('wizard.productTypes.phonecase', 'Phone Case'), icon: Smartphone },
    { id: 'Sticker', label: t('wizard.productTypes.sticker', 'Die-Cut Sticker'), icon: Tag },
    { id: 'Sweatshirt', label: t('wizard.productTypes.sweatshirt', 'Sweatshirt'), icon: Shirt },
    { id: 'Cap', label: t('wizard.productTypes.cap', 'Embroidered Cap'), icon: Glasses },
    { id: 'All Products', label: t('wizard.productTypes.all', 'All Products'), icon: Sparkles }
  ];

  const styleOptions = [
    'Minimalist',
    'Vintage',
    'Retro',
    'Typography',
    'Funny',
    'Cute',
    'Luxury',
    'Streetwear',
    'Dark',
    'Boho',
    'Cottagecore',
    'Y2K',
    'Western',
    'Hand-drawn',
    'Illustrative',
    'Photorealistic',
    'Anime-inspired',
    'Abstract',
    'Geometric',
    'Distressed',
    'Custom'
  ];

  const ageRanges = ['18–24', '25–34', '35–44', '45–54', '55+'];

  const runPipeline = async (mode: 'full' | 'research_only') => {
    setIsRunning(true);
    setError(null);

    const stepMessages = [
      t('wizard.stepsProgress.research', 'Researching market demand...'),
      t('wizard.stepsProgress.niche', 'Identifying high-margin micro-niche...'),
      t('wizard.stepsProgress.competition', 'Analyzing competitor signals...'),
      t('wizard.stepsProgress.risk', 'Scanning IP and trademark safety...'),
      t('wizard.stepsProgress.concept', 'Creating product concepts...'),
      t('wizard.stepsProgress.design', 'Generating commercial design & prompt...'),
      t('wizard.stepsProgress.mockups', 'Preparing 11 listing mockups...'),
      t('wizard.stepsProgress.seo', 'Writing optimized Etsy listing & tags...'),
      t('wizard.stepsProgress.profit', 'Calculating profit margins...'),
      t('wizard.stepsProgress.save', 'Saving product to workspace...')
    ];

    let messageIndex = 0;
    setActiveStepText(stepMessages[0]);
    const interval = setInterval(() => {
      messageIndex++;
      if (messageIndex < stepMessages.length) {
        setActiveStepText(stepMessages[messageIndex]);
      }
    }, 1400);

    try {
      const res = await fetch('/api/projects/build-wizard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || user?.id || ''}`
        },
        body: JSON.stringify({
          productType,
          quantity,
          style: style === 'Custom' ? customStyle : style,
          customStyle: style === 'Custom' ? customStyle : '',
          audienceGender,
          audienceAge,
          audienceOccupation,
          includeTrends,
          mode
        })
      });

      clearInterval(interval);
      const data = await res.json();

      if (res.ok && data.project) {
        onProjectCreated(data.project);
        onClose();
      } else {
        setError(data.error || 'Failed to complete build. Please retry.');
        setIsRunning(false);
      }
    } catch (err: any) {
      clearInterval(interval);
      setError('Connection error executing pipeline.');
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#111724] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">
              Step {currentStep} of 5
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t('wizard.title', 'Build a POD Product')}
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="grid grid-cols-5 gap-1.5 py-4">
          {[1, 2, 3, 4, 5].map(step => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step <= currentStep ? 'bg-indigo-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar space-y-6">
          {isRunning ? (
            <div className="py-16 text-center space-y-6 animate-in fade-in duration-200">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  {t('wizard.pipelineRunning', 'Executing POD Pipeline...')}
                </h3>
                <p className="text-xs text-indigo-300 font-mono tracking-wide">
                  {activeStepText}
                </p>
              </div>
              <div className="max-w-xs mx-auto text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                Building research, concept angles, 11 e-commerce mockups, IP screening, and Etsy tags.
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: PRODUCT TYPE */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">
                    {t('wizard.step1Title', 'What product do you want to create?')}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {productOptions.map(p => {
                      const Icon = p.icon;
                      const isSelected = productType === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setProductType(p.id)}
                          className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all duration-150 ${
                            isSelected
                              ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span className="text-xs font-medium truncate">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: QUANTITY */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">
                    {t('wizard.step2Title', 'How many product concepts do you want?')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Each concept includes distinct market research, risk scan, and aesthetic angles.
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setQuantity(num)}
                        className={`py-6 rounded-2xl border text-center transition-all ${
                          quantity === num
                            ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="block text-2xl font-bold font-mono">{num}</span>
                        <span className="text-[11px] text-slate-400">Concept{num > 1 ? 's' : ''}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: DESIGN STYLE */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">
                    {t('wizard.step3Title', 'What design style do you want?')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {styleOptions.map(st => (
                      <button
                        key={st}
                        onClick={() => setStyle(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          style === st
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {style === 'Custom' && (
                    <div className="pt-2 animate-in fade-in duration-150">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        {t('wizard.customStyle', 'Custom Style Description')}
                      </label>
                      <input
                        type="text"
                        value={customStyle}
                        onChange={e => setCustomStyle(e.target.value)}
                        placeholder={t('wizard.customStylePlaceholder', 'e.g., Japandi minimal botanical line art with terracotta tones...')}
                        className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: TARGET AUDIENCE */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">
                    {t('wizard.step4Title', 'Who is this product for?')}
                  </h3>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Gender Focus</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Unisex', 'Women', 'Men'].map(g => (
                        <button
                          key={g}
                          onClick={() => setAudienceGender(g)}
                          className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                            audienceGender === g
                              ? 'bg-indigo-600/15 border-indigo-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">{t('wizard.audienceAge', 'Age Range')}</label>
                    <div className="flex flex-wrap gap-2">
                      {ageRanges.map(ar => (
                        <button
                          key={ar}
                          onClick={() => setAudienceAge(ar)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            audienceAge === ar
                              ? 'bg-indigo-600/15 border-indigo-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {ar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      {t('wizard.audienceOccupation', 'Niche / Occupation / Interest')}
                    </label>
                    <input
                      type="text"
                      value={audienceOccupation}
                      onChange={e => setAudienceOccupation(e.target.value)}
                      placeholder={t('wizard.audienceOccupationPlaceholder', 'e.g. Dog moms, software engineers, nurses, book lovers...')}
                      className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: TREND RESEARCH & EXECUTION */}
              {currentStep === 5 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-white">
                    {t('wizard.step5Title', 'Should GiveMePOD research current trends?')}
                  </h3>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {t('wizard.trendToggle', 'Enable Live Market Trend Research')}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {t('wizard.trendToggleDesc', 'Queries available trend providers for real-time demand, velocity, and keyword signals.')}
                      </span>
                    </div>

                    <button
                      onClick={() => setIncludeTrends(!includeTrends)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        includeTrends ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          includeTrends ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Summary of Configuration */}
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs">
                    <span className="text-indigo-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Build Specification Summary
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                      <div>Product: <strong className="text-white">{productType}</strong></div>
                      <div>Quantity: <strong className="text-white">{quantity} Concept(s)</strong></div>
                      <div>Style: <strong className="text-white">{style === 'Custom' ? customStyle : style}</strong></div>
                      <div>Audience: <strong className="text-white">{audienceOccupation || 'Lifestyle'} ({audienceGender}, {audienceAge})</strong></div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Execution Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => runPipeline('full')}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t('wizard.btnBuild', 'BUILD MY POD PRODUCT')}</span>
                    </button>

                    <button
                      onClick={() => runPipeline('research_only')}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs transition-colors"
                    >
                      {t('wizard.btnResearchOnly', 'Research Only')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Step Nav */}
        {!isRunning && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('wizard.btnBack', 'Back')}</span>
            </button>

            {currentStep < 5 && (
              <button
                onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>{t('wizard.btnNext', 'Next Step')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
