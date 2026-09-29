import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

export const SeasonalPlannerView: React.FC = () => {
  const { t } = useLanguage();

  const [events, setEvents] = useState([
    {
      id: 'e-1',
      name: "Halloween & Fall Spooky Season",
      targetDate: 'October 31, 2026',
      researchDate: 'July 15, 2026',
      designDeadline: 'August 10, 2026',
      listingDeadline: 'August 25, 2026',
      promoDeadline: 'September 10, 2026',
      recommendedProducts: ['Sweatshirts', 'Ceramic Mugs', 'Tote Bags'],
      primaryStyle: 'Retro 70s Distressed & Cute Ghost Line Art'
    },
    {
      id: 'e-2',
      name: "Q4 Holiday & Christmas Gift Surge",
      targetDate: 'December 25, 2026',
      researchDate: 'August 01, 2026',
      designDeadline: 'September 15, 2026',
      listingDeadline: 'October 01, 2026',
      promoDeadline: 'October 20, 2026',
      recommendedProducts: ['Heavyweight Hoodies', 'Ornaments', 'Personalized Mugs'],
      primaryStyle: 'Vintage Hygge Botanical & Family Crest'
    },
    {
      id: 'e-3',
      name: "Mother's Day Appreciation",
      targetDate: 'May 10, 2026',
      researchDate: 'February 15, 2026',
      designDeadline: 'March 10, 2026',
      listingDeadline: 'March 25, 2026',
      promoDeadline: 'April 10, 2026',
      recommendedProducts: ['Canvas Totes', 'Aesthetic Tees', 'Mugs'],
      primaryStyle: 'Japandi Fine Line Floral & Gentle Typography'
    },
    {
      id: 'e-4',
      name: "Father's Day & Summer Camp",
      targetDate: 'June 21, 2026',
      researchDate: 'March 20, 2026',
      designDeadline: 'April 15, 2026',
      listingDeadline: 'May 01, 2026',
      promoDeadline: 'May 15, 2026',
      recommendedProducts: ['Embroidered Caps', 'Heavyweight Tees', 'Enamel Mugs'],
      primaryStyle: 'Vintage Outdoor Club & Blueprint Schematics'
    }
  ]);

  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName) return;

    setEvents([
      ...events,
      {
        id: `e-${Date.now()}`,
        name: newEventName,
        targetDate: newEventDate || 'Target Date',
        researchDate: '60 days before event',
        designDeadline: '45 days before event',
        listingDeadline: '30 days before event',
        promoDeadline: '20 days before event',
        recommendedProducts: ['T-Shirts', 'Mugs', 'Posters'],
        primaryStyle: 'Custom Style Angle'
      }
    ]);

    setNewEventName('');
    setNewEventDate('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('nav.seasonalPlanner', 'Seasonal Planner')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Plan research, design, listing, and Pinterest campaigns ahead of peak buyer demand cycles.
          </p>
        </div>
      </div>

      {/* Add Custom Seasonal Event */}
      <form onSubmit={handleAddEvent} className="p-4 rounded-2xl bg-[#111724] border border-slate-800 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newEventName}
          onChange={e => setNewEventName(e.target.value)}
          placeholder="Add seasonal event (e.g. Back to School, Pet Appreciation Week, Graduation)..."
          className="flex-1 h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <input
          type="text"
          value={newEventDate}
          onChange={e => setNewEventDate(e.target.value)}
          placeholder="Target date (e.g. August 2026)"
          className="sm:w-56 h-11 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!newEventName}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </form>

      {/* Seasonal Events List */}
      <div className="space-y-4">
        {events.map(ev => (
          <div
            key={ev.id}
            className="p-6 rounded-2xl bg-[#111724] border border-slate-800 hover:border-slate-700 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{ev.name}</h3>
                  <span className="text-xs font-mono text-slate-400">Target Holiday / Event: {ev.targetDate}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Suggested Blank: <strong className="text-white">{ev.recommendedProducts.join(', ')}</strong>
              </div>
            </div>

            {/* Milestones 4-step Timeline */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">1. Research Start</span>
                <span className="font-semibold text-white">{ev.researchDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">2. Design Freeze</span>
                <span className="font-semibold text-indigo-300">{ev.designDeadline}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">3. Listing Live</span>
                <span className="font-semibold text-emerald-400">{ev.listingDeadline}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">4. Promo & Pinterest</span>
                <span className="font-semibold text-amber-400">{ev.promoDeadline}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
