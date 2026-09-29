import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  FolderOpen,
  Search,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Copy,
  Trash2,
  Archive,
  ArrowRight,
  Filter
} from 'lucide-react';

interface MyProductsListProps {
  projects: any[];
  onSelectProject: (id: string) => void;
  onOpenWizard: () => void;
  onRefresh: () => void;
}

export const MyProductsList: React.FC<MyProductsListProps> = ({
  projects,
  onSelectProject,
  onOpenWizard,
  onRefresh
}) => {
  const { t } = useLanguage();
  const { token, user } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = projects.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.niche?.toLowerCase().includes(search.toLowerCase()) ||
      p.product_type?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || user?.id || ''}` }
      });
      if (res.ok) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token || user?.id || ''}` }
      });
      if (res.ok) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('nav.myProducts', 'My Products')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, manage, duplicate, and export all your researched and generated POD packages.
          </p>
        </div>

        <button
          onClick={onOpenWizard}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New POD Product</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111724] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar text-xs font-medium">
          {['all', 'ready', 'concept', 'research', 'design'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects Grid / List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#111724] border border-dashed border-slate-800 space-y-3">
          <FolderOpen className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No products found matching your filter</p>
          <button
            onClick={onOpenWizard}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Create Product
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`p-5 rounded-2xl bg-[#111724] border border-slate-800/80 hover:border-slate-700 hover:bg-[#131b2b] transition-all cursor-pointer flex justify-between group ${
                viewMode === 'list' ? 'items-center' : 'flex-col space-y-4'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span>{p.product_type}</span>
                  <span>·</span>
                  <span className="capitalize">{p.status}</span>
                  {p.is_sample && <span className="text-amber-400 font-sans">Sample</span>}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">
                  {p.niche} · {p.design_style}
                </p>
              </div>

              <div className={`flex items-center gap-4 ${viewMode === 'list' ? 'shrink-0' : 'justify-between pt-3 border-t border-slate-800/80 text-xs'}`}>
                <div>
                  <span className="text-[10px] text-slate-500 block">Score</span>
                  <span className="font-mono font-bold text-white">{p.opportunity_score}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Risk</span>
                  <span className={`font-semibold ${p.risk_level === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>{p.risk_level}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleDuplicate(e, p.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                    title="Duplicate Project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, p.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
