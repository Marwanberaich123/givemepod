import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  Sparkles,
  Flame,
  Lightbulb,
  Camera,
  ShieldAlert,
  Calculator,
  Calendar,
  FolderOpen,
  Settings,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'wizard', label: 'Build My POD Product', category: 'Action', icon: Sparkles },
    { id: 'trends', label: 'Search Market Trends', category: 'Tool', icon: Flame },
    { id: 'ideas', label: 'Discover Niche Opportunities', category: 'Tool', icon: Lightbulb },
    { id: 'mockups', label: 'Open Mockup Factory (11 Angles)', category: 'Tool', icon: Camera },
    { id: 'risk', label: 'Run IP & Trademark Risk Scan', category: 'Tool', icon: ShieldAlert },
    { id: 'profit', label: 'Open Profit Margin Calculator', category: 'Tool', icon: Calculator },
    { id: 'seasonal', label: 'Check Seasonal Planner Calendar', category: 'Tool', icon: Calendar },
    { id: 'products', label: 'View All Projects & Launch Packages', category: 'Navigation', icon: FolderOpen },
    { id: 'settings', label: 'Settings & License Status', category: 'Navigation', icon: Settings }
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#111724] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search tools... (ESC to exit)"
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching commands
            </div>
          ) : (
            filtered.map(cmd => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onSelectAction(cmd.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {cmd.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
