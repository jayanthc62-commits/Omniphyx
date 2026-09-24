import React, { useState } from 'react';
import { X, SlidersHorizontal, Check, Calendar, Clock, Video, ListFilter, RotateCcw } from 'lucide-react';
import { ThemeMode } from '../types';

export interface SearchFilterOptions {
  uploadDate: 'all' | 'hour' | 'today' | 'week' | 'month' | 'year';
  type: 'all' | 'video' | 'channel';
  duration: 'all' | 'short' | 'medium' | 'long';
  sort: 'relevance' | 'upload_date' | 'view_count' | 'rating';
}

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilterOptions;
  onApplyFilters: (newFilters: SearchFilterOptions) => void;
  theme?: ThemeMode;
}

export const SearchFilterModal: React.FC<SearchFilterModalProps> = ({
  isOpen,
  onClose,
  filters: initialFilters,
  onApplyFilters,
  theme = 'dark',
}) => {
  const [filters, setFilters] = useState<SearchFilterOptions>(initialFilters);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleReset = () => {
    const defaultFilters: SearchFilterOptions = {
      uploadDate: 'all',
      type: 'all',
      duration: 'all',
      sort: 'relevance',
    };
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-white/[0.1] text-slate-100'
      }`}>
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold">Search Filters</h3>
              <p className="text-xs text-slate-400">Refine YouTube search results with real parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Grid */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. Upload Date */}
          <div className="space-y-2.5">
            <label className="font-bold flex items-center gap-2 text-slate-300">
              <Calendar size={14} className="text-red-400" />
              <span>Upload Date</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all' as const, label: 'Any time' },
                { id: 'hour' as const, label: 'Last hour' },
                { id: 'today' as const, label: 'Today (24h)' },
                { id: 'week' as const, label: 'This week' },
                { id: 'month' as const, label: 'This month' },
                { id: 'year' as const, label: 'This year' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilters(f => ({ ...f, uploadDate: item.id }))}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all flex items-center justify-between ${
                    filters.uploadDate === item.id
                      ? 'bg-red-600/20 border-red-500 text-red-400 font-bold'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{item.label}</span>
                  {filters.uploadDate === item.id && <Check size={13} className="text-red-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Duration */}
          <div className="space-y-2.5">
            <label className="font-bold flex items-center gap-2 text-slate-300">
              <Clock size={14} className="text-red-400" />
              <span>Duration</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'all' as const, label: 'Any duration' },
                { id: 'short' as const, label: 'Under 4 min' },
                { id: 'medium' as const, label: '4 - 20 min' },
                { id: 'long' as const, label: 'Over 20 min' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilters(f => ({ ...f, duration: item.id }))}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all flex items-center justify-between ${
                    filters.duration === item.id
                      ? 'bg-red-600/20 border-red-500 text-red-400 font-bold'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{item.label}</span>
                  {filters.duration === item.id && <Check size={13} className="text-red-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Type */}
          <div className="space-y-2.5">
            <label className="font-bold flex items-center gap-2 text-slate-300">
              <Video size={14} className="text-red-400" />
              <span>Content Type</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all' as const, label: 'All types' },
                { id: 'video' as const, label: 'Videos only' },
                { id: 'channel' as const, label: 'Channels only' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilters(f => ({ ...f, type: item.id }))}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all flex items-center justify-between ${
                    filters.type === item.id
                      ? 'bg-red-600/20 border-red-500 text-red-400 font-bold'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{item.label}</span>
                  {filters.type === item.id && <Check size={13} className="text-red-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Sort By */}
          <div className="space-y-2.5">
            <label className="font-bold flex items-center gap-2 text-slate-300">
              <ListFilter size={14} className="text-red-400" />
              <span>Sort Order</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'relevance' as const, label: 'Relevance' },
                { id: 'upload_date' as const, label: 'Upload date' },
                { id: 'view_count' as const, label: 'View count' },
                { id: 'rating' as const, label: 'Rating / Likes' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilters(f => ({ ...f, sort: item.id }))}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all flex items-center justify-between ${
                    filters.sort === item.id
                      ? 'bg-red-600/20 border-red-500 text-red-400 font-bold'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{item.label}</span>
                  {filters.sort === item.id && <Check size={13} className="text-red-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-black/20">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-white/[0.06] transition-all"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
