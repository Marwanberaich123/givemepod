import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Camera,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface MockupFactoryViewProps {
  onOpenWizard: () => void;
}

export const MockupFactoryView: React.FC<MockupFactoryViewProps> = ({ onOpenWizard }) => {
  const { t } = useLanguage();
  const [productType, setProductType] = useState('Heavyweight Streetwear Hoodie');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All 11 Angles' },
    { id: 'front', label: '01. Hero Front' },
    { id: 'lifestyle', label: '02. Lifestyle' },
    { id: 'closeup', label: '03. Close-Up Texture' },
    { id: 'flatlay', label: '04. Studio Flat Lay' },
    { id: 'studio', label: '05. Clean Studio' },
    { id: 'outdoor', label: '06. Natural Outdoor' },
    { id: 'desk', label: '07. Workspace / Desk' },
    { id: 'home', label: '08. Home Living' },
    { id: 'gift', label: '09. Gift Wrapped' },
    { id: 'model', label: '10. On Model' },
    { id: 'detail', label: '11. Print Detail' }
  ];

  const mockups = [
    {
      num: 1,
      cat: 'front',
      title: 'Main Etsy Hero Mockup',
      desc: 'Optimized as the primary search photo: centered product, diffuse studio lighting, crisp contrast.',
      image: '/src/assets/images/mockup_studio_hoodie_1790680851584.jpg',
      prompt: 'Commercial studio product photography of an oversized streetwear charcoal hoodie neatly laid on a dark slate surface, subtle diffused studio rim lighting, crisp fabric texture, luxury print on demand apparel showcase, high resolution'
    },
    {
      num: 2,
      cat: 'lifestyle',
      title: 'Urban Architect Studio Loft',
      desc: 'Contextual environment demonstrating utility in modern creative workspace.',
      image: '/src/assets/images/hero_pod_workspace_1790680840862.jpg',
      prompt: 'Editorial lifestyle photo of a charcoal streetwear hoodie folded on a minimalist concrete architect workbench near blueprints, soft natural morning window light, high end design aesthetic'
    },
    {
      num: 3,
      cat: 'closeup',
      title: 'Fabric Weave & Stitch Detail',
      desc: 'Highlights 350 GSM heavyweight cotton weave and zero-crack ink adhesion.',
      image: '/src/assets/images/mockup_studio_hoodie_1790680851584.jpg',
      prompt: 'Macro photography of heavy cotton fleece texture with precision screen print typography, shallow depth of field, authentic yarn threads, studio side light'
    },
    {
      num: 4,
      cat: 'flatlay',
      title: 'Curated Studio Flat Lay',
      desc: 'Overhead 90-degree flat lay with minimalist aesthetic EDC accessories.',
      image: '/src/assets/images/mockup_tote_bag_1790680874914.jpg',
      prompt: 'Top-down commercial flat lay of folded streetwear hoodie styled with black ceramic mug and leather notebook on dark slate background, perfectly balanced grid composition'
    },
    {
      num: 5,
      cat: 'studio',
      title: 'Monochrome Pedestal Studio',
      desc: 'Floating sculpture pedestal highlighting hoodie hood drape and cuff ribbing.',
      image: '/src/assets/images/hero_pod_workspace_1790680840862.jpg',
      prompt: 'Apparel on geometric minimalist stone pedestal, soft gradient backdrop, high fashion lookbook aesthetic'
    },
    {
      num: 6,
      cat: 'outdoor',
      title: 'Natural Golden Hour Sunlight',
      desc: 'True daylight color fidelity showcasing black garment tones.',
      image: '/src/assets/images/mockup_studio_hoodie_1790680851584.jpg',
      prompt: 'Outdoor daylight shot of garment draped over a modern concrete bench, crisp shadows, natural warm sunlight'
    },
    {
      num: 7,
      cat: 'desk',
      title: 'Creative Desk & Workspace',
      desc: 'Placed in modern creator desk setting alongside laptop and design monitors.',
      image: '/src/assets/images/hero_pod_workspace_1790680840862.jpg',
      prompt: 'Clean desk workspace with modern hardware, folded apparel in foreground focus'
    },
    {
      num: 8,
      cat: 'home',
      title: 'Cozy Modern Interior Living',
      desc: 'Draped over Scandinavian armchair in warm sunlit reading nook.',
      image: '/src/assets/images/mockup_ceramic_mug_1790680864069.jpg',
      prompt: 'Interior living space showing relaxed home comfort aesthetic'
    },
    {
      num: 9,
      cat: 'gift',
      title: 'Premium Unboxing & Gift Pack',
      desc: 'Tied with natural twine and branded tissue paper for gifting appeal.',
      image: '/src/assets/images/mockup_tote_bag_1790680874914.jpg',
      prompt: 'Luxury gift packaging with custom craft paper box and thank you card'
    },
    {
      num: 10,
      cat: 'model',
      title: 'Natural Fit On Model',
      desc: 'Oversized streetwear drape shown on standing unisex model.',
      image: '/src/assets/images/mockup_studio_hoodie_1790680851584.jpg',
      prompt: 'Editorial lookbook fashion shot of model wearing relaxed fit hoodie against textured architectural backdrop'
    },
    {
      num: 11,
      cat: 'detail',
      title: 'Double-Needle Hem & Seams',
      desc: 'Quality assurance macro shot proving garment durability to prospective buyers.',
      image: '/src/assets/images/mockup_studio_hoodie_1790680851584.jpg',
      prompt: 'Close up inspection shot of rib knit cuffs and reinforced seam construction'
    }
  ];

  const filtered = activeCategoryFilter === 'all'
    ? mockups
    : mockups.filter(m => m.cat === activeCategoryFilter);

  const handleCopyPrompt = (p: string, id: string) => {
    navigator.clipboard.writeText(p);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('mockups.title', 'Mockup Factory (11 Commercial Angles)')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('mockups.subtitle', 'Generate 11 consistent commercial mockups for your product listing: 1 Main Etsy Hero photo + 10 contextual angles.')}
          </p>
        </div>

        <button
          onClick={onOpenWizard}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch New 11-Mockup Product</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategoryFilter(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategoryFilter === c.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Mockups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(m => {
          const isHero = m.num === 1;
          return (
            <div
              key={m.num}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                isHero
                  ? 'bg-gradient-to-b from-[#131b2e] to-[#0e1422] border-indigo-500/40 ring-1 ring-indigo-500/20'
                  : 'bg-[#111724] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="aspect-[4/3] rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative group">
                  <img
                    src={m.image}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {isHero && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                      Main Etsy Hero Photo
                    </span>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                    Angle #{String(m.num).padStart(2, '0')}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{m.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleCopyPrompt(m.prompt, `prompt-${m.num}`)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedId === `prompt-${m.num}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Scene Prompt</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Production Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
