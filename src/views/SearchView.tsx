import React, { useMemo } from 'react';
import { 
  Search, SlidersHorizontal, ArrowLeft, X, Play, Clock, 
  CheckCircle2, Sparkles, Filter, Calendar, Zap, RefreshCw,
  Film, ChevronRight, ChevronLeft, Layers
} from 'lucide-react';
import { Video, Channel, ThemeMode } from '../types';

interface SearchViewProps {
  query: string;
  videos: Video[];
  channels?: Channel[];
  isLoading: boolean;
  onSelectVideo: (video: Video) => void;
  onOpenChannel?: (channelId: string, channelTitle: string, channelAvatar?: string) => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  onOpenFilters?: () => void;
  hasActiveFilters?: boolean;
  onBack?: () => void;
  theme?: ThemeMode;
}

// Extract episode number from search query to offer instant jump chips
function extractEpisodeFromQuery(query: string) {
  if (!query) return null;
  const match = query.match(/(?:ep|episode|ep\.|ep#|part|pt|#)?\s*([0-9]{1,5})/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num > 0 && num !== 2024 && num !== 2025 && num !== 2026 && num !== 1080 && num !== 720) {
      const prefix = query.replace(match[0], '').replace(/\s+/g, ' ').trim();
      return { num, prefix: prefix || 'Series' };
    }
  }
  return null;
}

export const SearchView: React.FC<SearchViewProps> = ({
  query,
  videos,
  channels = [],
  isLoading,
  onSelectVideo,
  onOpenChannel,
  onSearchChange,
  onSearchSubmit,
  onOpenFilters,
  hasActiveFilters = false,
  onBack,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const epInfo = useMemo(() => {
    return extractEpisodeFromQuery(query);
  }, [query]);

  const handleJumpEpisode = (targetEp: number) => {
    if (!epInfo) return;
    const newQuery = `${epInfo.prefix} episode ${targetEp}`.trim();
    onSearchChange(newQuery);
    onSearchSubmit(newQuery);
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-2 sm:px-4 animate-in fade-in duration-200">
      {/* Top Search Context Bar */}
      <div className={`p-4 rounded-3xl border backdrop-blur-xl transition-all ${
        isLight 
          ? 'bg-white/90 border-slate-200 shadow-sm' 
          : 'bg-slate-900/60 border-white/[0.08] shadow-lg shadow-black/20'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] active:scale-95 transition-all text-slate-300 hover:text-white"
                title="Back to Previous Page"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <Search size={16} className="text-red-500" />
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight line-clamp-1">
                  Results for <span className="text-red-400">"{query}"</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isLoading ? 'Searching YouTube global and Indian streams...' : `${videos.length} videos found`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFilters && (
              <button
                onClick={onOpenFilters}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all active:scale-95 ${
                  hasActiveFilters
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border-white/[0.08]'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>Filters {hasActiveFilters && '• Active'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Series & Next Episode Fast Jump Chips */}
        {epInfo && (
          <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mr-1">
              <Film size={14} />
              <span>Episodic Series Navigator:</span>
            </div>

            {epInfo.num > 1 && (
              <button
                onClick={() => handleJumpEpisode(epInfo.num - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium active:scale-95 transition-all"
                title={`Search Episode ${epInfo.num - 1}`}
              >
                <ChevronLeft size={13} />
                <span>Ep {epInfo.num - 1}</span>
              </button>
            )}

            <div className="px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
              Current: Ep {epInfo.num}
            </div>

            <button
              onClick={() => handleJumpEpisode(epInfo.num + 1)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border border-red-400/30 text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all"
              title={`Search Next Episode ${epInfo.num + 1}`}
            >
              <span>Next: Ep {epInfo.num + 1}</span>
              <ChevronRight size={13} />
            </button>

            <button
              onClick={() => handleJumpEpisode(epInfo.num + 2)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium active:scale-95 transition-all"
              title={`Search Episode ${epInfo.num + 2}`}
            >
              <span>Ep {epInfo.num + 2}</span>
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-3xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-3 animate-pulse">
              <div className="aspect-video bg-white/[0.08] rounded-2xl w-full" />
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.08] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/[0.08] rounded-md w-4/5" />
                  <div className="h-3 bg-white/[0.05] rounded-md w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matched Channel Cards (if any) */}
      {!isLoading && channels && channels.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">Matching Channels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {channels.map((ch) => (
              <div
                key={ch.id}
                onClick={() => onOpenChannel?.(ch.id, ch.name, ch.avatar)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] cursor-pointer active:scale-98 transition-all group"
              >
                <img
                  src={ch.avatar}
                  alt={ch.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-100 truncate group-hover:text-red-400 transition-colors">
                      {ch.name}
                    </span>
                    {ch.verified && <CheckCircle2 size={13} className="text-red-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{ch.subscriberCount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Results Grid */}
      {!isLoading && videos.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((v) => (
              <div
                key={v.id}
                onClick={() => onSelectVideo(v)}
                className={`group rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    : 'bg-slate-900/40 hover:bg-slate-800/60 border-white/[0.06] hover:border-white/[0.14] shadow-md shadow-black/20'
                }`}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-tight bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-sm">
                    {v.duration}
                  </div>

                  {/* Live Badge */}
                  {v.isLive && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md shadow-red-600/40 animate-pulse">
                      LIVE
                    </div>
                  )}

                  {/* Watched Progress Bar */}
                  {v.watchedProgress && v.watchedProgress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80">
                      <div className="h-full bg-red-600" style={{ width: `${v.watchedProgress}%` }} />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/40 scale-75 group-hover:scale-100 transition-transform">
                      <Play size={20} className="fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-3.5 flex gap-3 flex-1">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChannel?.(v.channelId, v.channelTitle, v.channelAvatar);
                    }}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={v.channelAvatar}
                      alt={v.channelTitle}
                      className="w-9 h-9 rounded-full object-cover border border-white/10 hover:ring-2 hover:ring-red-500 transition-all"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-red-400 line-clamp-2 transition-colors leading-snug">
                      {v.title}
                    </h3>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChannel?.(v.channelId, v.channelTitle, v.channelAvatar);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors mt-1 truncate cursor-pointer"
                    >
                      {v.channelTitle}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span>{v.views > 0 ? `${(v.views >= 1000000 ? (v.views / 1000000).toFixed(1) + 'M' : v.views >= 1000 ? (v.views / 1000).toFixed(1) + 'K' : v.views)} views` : 'Popular'}</span>
                      <span>•</span>
                      <span>{v.publishedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && videos.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto">
            <Search size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-200">No videos found for "{query}"</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try checking for spelling errors, using more general keywords, or changing the search filters.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['TMKOC Episode 4556', 'CID Full Episode', 'Trending India', 'Live Cricket Highlights'].map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  onSearchChange(topic);
                  onSearchSubmit(topic);
                }}
                className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium active:scale-95 transition-all"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
