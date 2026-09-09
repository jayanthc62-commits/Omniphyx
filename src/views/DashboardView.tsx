import React, { useState, useRef } from 'react';
import { 
  Play, Bookmark, Clock, MoreVertical, Sparkles, 
  CheckCircle2, Share2, Check, ListPlus, Search, X, 
  RotateCcw, Compass, EyeOff, UserX
} from 'lucide-react';
import { Video, ThemeMode } from '../types';
import { WatchLaterCarousel } from '../components/WatchLaterCarousel';

interface DashboardViewProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatchLater?: (id: string) => void;
  searchFilter?: string;
  onSelectCategory?: (category: string) => void;
  isLoading?: boolean;
  onClearSearch?: () => void;
  isSearchActive?: boolean;
  watchLaterVideos?: Video[];
  onOpenWatchLaterCarousel?: () => void;
  onOpenExplore?: () => void;
  onOpenChannel?: (channelId: string, channelTitle: string, channelAvatar?: string) => void;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
  onNotInterested?: (videoId: string, category?: string) => void;
  onBlockChannel?: (channelId: string, channelTitle: string) => void;
  theme?: ThemeMode;
}

const CATEGORIES = ['All', 'Explore', 'Trending', 'Comedy', 'Movies', 'Music', 'Tech'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  videos,
  onSelectVideo,
  onToggleFavorite,
  onToggleWatchLater,
  searchFilter = '',
  onSelectCategory,
  isLoading = false,
  onClearSearch,
  isSearchActive = false,
  watchLaterVideos = [],
  onOpenWatchLaterCarousel,
  onOpenExplore,
  onOpenChannel,
  onRefresh,
  isRefreshing = false,
  onNotInterested,
  onBlockChannel,
  theme = 'dark',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCarouselInline, setShowCarouselInline] = useState(false);
  const [pullY, setPullY] = useState<number>(0);
  const touchStartY = useRef<number | null>(null);

  const isLight = theme === 'light';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // In-progress videos for "Continue Watching" row
  const continueWatching = videos.filter(v => v.watchedProgress && v.watchedProgress > 0);

  // If search is active, show the search results directly without stripping them away
  const filteredVideos = isSearchActive
    ? videos
    : videos.filter(v => {
        const matchesSearch = !searchFilter || 
          v.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
          v.channelTitle.toLowerCase().includes(searchFilter.toLowerCase());
        
        const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory || 
          (selectedCategory === 'Trending' && v.views > 1000000);

        return matchesSearch && matchesCategory;
      });

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(`${window.location.origin}/#video-${id}`);
    setCopiedId(id);
    showToast('Link copied to clipboard');
    setTimeout(() => {
      setCopiedId(null);
      setActiveMenuId(null);
    }, 2000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    // Only engage if at the absolute top of the screen AND touch initiates in the top header zone
    if (scrollY <= 2 && e.touches[0].clientY <= 160) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollY > 2) {
      touchStartY.current = null;
      setPullY(0);
      return;
    }
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setPullY(Math.min(diff * 0.45, 80));
    } else {
      touchStartY.current = null;
      setPullY(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullY >= 60 && onRefresh) {
      onRefresh();
    }
    setPullY(0);
    touchStartY.current = null;
  };

  return (
    <div 
      id="freetube-dashboard" 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="space-y-6 pb-20 relative select-none"
    >
      {/* Pull-to-refresh mobile banner */}
      {pullY > 15 && (
        <div className="flex items-center justify-center -mb-2 animate-in fade-in duration-150">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xl backdrop-blur-xl ${
            isLight ? 'bg-white/95 text-slate-800 border border-slate-200' : 'bg-slate-900/95 text-slate-200 border border-white/10'
          }`}>
            <RotateCcw size={13} className={`text-red-500 transition-transform ${pullY > 45 ? 'rotate-180 animate-spin' : ''}`} />
            <span>{pullY > 45 ? 'Release to refresh feed' : 'Pull down to refresh'}</span>
          </div>
        </div>
      )}

      {/* Dynamic Floating Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl text-xs font-medium shadow-2xl backdrop-blur-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
          isLight 
            ? 'bg-white/95 border border-slate-200 text-slate-900 shadow-slate-300' 
            : 'bg-slate-950/90 border border-white/[0.15] text-slate-100 shadow-black'
        }`}>
          <CheckCircle2 size={15} className="text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Category Pills Bar & Refresh Button (Micro-Neumorphic Tactile Pills) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 py-1">
          {/* 2026 Liquid Glass Refresh Action Pill */}
          <button
            id="home-refresh-btn"
            onClick={async () => {
              if (onRefresh) {
                await onRefresh();
                showToast('Feed updated with fresh personalized recommendations');
              }
            }}
            disabled={isRefreshing}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 whitespace-nowrap transition-all duration-300 active:scale-95 shadow-md ${
              isLight
                ? 'liquid-glass-pill-light text-slate-800 hover:text-slate-950'
                : 'liquid-glass-pill text-white hover:text-red-300'
            }`}
            title="Refresh feed with fresh personalized recommendations"
          >
            <RotateCcw size={13} className={isRefreshing ? 'animate-spin text-red-500' : 'text-red-400'} />
            <span className="tracking-wide">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`category-chip-${cat.toLowerCase()}`}
                onClick={() => {
                  if (cat === 'Explore') {
                    onOpenExplore?.();
                    return;
                  }
                  setSelectedCategory(cat);
                  onSelectCategory?.(cat);
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isLight
                    ? isActive
                      ? 'light-neu-pill-active text-slate-950 font-bold border border-slate-300/80'
                      : 'light-neu-pill-idle text-slate-600 hover:text-slate-950 border border-slate-200/80'
                    : isActive
                      ? 'dark-neu-pill-active text-white font-bold border border-white/20'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.07]'
                }`}
              >
                {cat === 'Explore' && <Compass size={13} className="text-red-500 stroke-[2.2]" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Watch Later 3D Carousel Toggle */}
        {watchLaterVideos.length > 0 && (
          <button
            onClick={() => {
              if (onOpenWatchLaterCarousel) {
                onOpenWatchLaterCarousel();
              } else {
                setShowCarouselInline(!showCarouselInline);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold flex-shrink-0 active:scale-95 transition-all ${
              isLight
                ? 'light-neu-pill-idle text-slate-700 hover:text-slate-950 border border-slate-200'
                : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200'
            }`}
          >
            <Clock size={13} className="text-red-500" />
            <span className="hidden sm:inline">Watch Later</span>
            <span className="px-1.5 py-0.2 bg-red-600/20 text-red-500 text-[10px] rounded-md font-mono font-bold">
              {watchLaterVideos.length}
            </span>
          </button>
        )}
      </div>

      {/* Inline Watch Later Carousel if toggled */}
      {showCarouselInline && watchLaterVideos.length > 0 && (
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.08] relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Clock size={14} className="text-red-400" />
              <span>3D Watch Later Carousel</span>
            </h3>
            <button
              onClick={() => setShowCarouselInline(false)}
              className="text-xs text-slate-400 hover:text-slate-200 p-1"
            >
              <X size={14} />
            </button>
          </div>
          <WatchLaterCarousel
            videos={watchLaterVideos}
            onSelectVideo={onSelectVideo}
            onRemoveFromWatchLater={(id) => onToggleWatchLater?.(id)}
          />
        </div>
      )}

      {/* Continue Watching Section (if any progress) */}
      {!isSearchActive && !searchFilter && selectedCategory === 'All' && continueWatching.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock size={16} className="text-red-500" />
              Continue Watching
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Auto-saved locally</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {continueWatching.map((v) => (
              <div
                key={`cw-${v.id}`}
                onClick={() => onSelectVideo(v)}
                className="flex gap-3 p-2.5 rounded-3xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.14] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 group"
              >
                <div className="relative w-32 h-20 bg-black rounded-2xl overflow-hidden flex-shrink-0">
                  <img 
                    src={v.thumbnail} 
                    alt={v.title} 
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-1 right-1 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium text-white">
                    {v.duration}
                  </div>
                  {/* Slim minimalist progress indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/15 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-600 via-rose-500 to-red-500 h-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
                      style={{ width: `${v.watchedProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                    {v.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{v.channelTitle}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{v.watchedProgress}% watched</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Video Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 tracking-tight">
            {isSearchActive ? `Results for "${searchFilter}"` : searchFilter ? `Filtered: "${searchFilter}"` : 'Recommended for You'}
            <Sparkles size={16} className="text-red-500 fill-red-500/20" />
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={`skeleton-${idx}`}
                className="flex flex-col bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video w-full bg-white/[0.05]" />
                <div className="p-4 flex gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white/[0.06] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-white/[0.06] rounded-md w-4/5" />
                    <div className="h-2.5 bg-white/[0.04] rounded-md w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          /* Intelligent Zero-State Recovery Box */
          <div className="py-12 px-6 text-center bg-white/[0.02] rounded-3xl border border-white/[0.07] max-w-lg mx-auto backdrop-blur-xl space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-400">
              <Search size={22} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">No videos found</h3>
              <p className="text-xs text-slate-400 mt-1">Try another search or pick a category below:</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {['All', 'Trending', 'Comedy', 'Music', 'Movies', 'Tech'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedCategory(topic);
                    onSelectCategory?.(topic);
                  }}
                  className="px-3.5 py-1.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all active:scale-95"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Spotlight Hero Banner for Featured Premiere (Smart & Rich Minimal Aesthetic) */}
            {!isSearchActive && !searchFilter && selectedCategory === 'All' && filteredVideos.length > 0 && (
              <div 
                id="home-featured-spotlight"
                onClick={() => onSelectVideo(filteredVideos[0])}
                className={`relative rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 ${
                  isLight ? 'liquid-glass-spotlight-light' : 'liquid-glass-spotlight'
                }`}
              >
                <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden">
                  <img 
                    src={filteredVideos[0].thumbnail} 
                    alt={filteredVideos[0].title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out" 
                  />
                  <div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-t from-white via-white/50 to-transparent' : 'bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent'}`} />
                  
                  {/* Featured Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-lg">
                    <Sparkles size={12} className="text-amber-300 fill-amber-300" />
                    <span>Featured Premiere</span>
                  </div>

                  {/* Duration */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-[10px]">
                    {filteredVideos[0].duration}
                  </div>

                  {/* Bottom Details Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 max-w-2xl">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChannel?.(filteredVideos[0].channelId, filteredVideos[0].channelTitle, filteredVideos[0].channelAvatar);
                        }}
                        className="flex items-center gap-2 cursor-pointer group/sp hover:opacity-85 transition-opacity"
                        title={`View ${filteredVideos[0].channelTitle}'s channel`}
                      >
                        <img 
                          src={filteredVideos[0].channelAvatar} 
                          alt={filteredVideos[0].channelTitle} 
                          className="w-7 h-7 rounded-full object-cover border border-white/20 group-hover/sp:border-red-500 transition-colors"
                        />
                        <span className={`text-xs font-semibold truncate group-hover/sp:text-red-400 transition-colors ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                          {filteredVideos[0].channelTitle}
                        </span>
                        <CheckCircle2 size={12} className="text-red-500 flex-shrink-0" />
                      </div>
                      <h2 className={`text-base sm:text-xl font-bold line-clamp-2 leading-snug ${isLight ? 'text-slate-950' : 'text-white'}`}>
                        {filteredVideos[0].title}
                      </h2>
                      <p className={`text-[11px] hidden sm:block ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        {filteredVideos[0].views.toLocaleString()} views • {filteredVideos[0].publishedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVideo(filteredVideos[0]);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs active:scale-95 transition-all shadow-lg shadow-red-600/30"
                      >
                        <Play size={14} className="fill-white" />
                        <span>Watch Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {( (!isSearchActive && !searchFilter && selectedCategory === 'All') 
                  ? filteredVideos.slice(1) 
                  : filteredVideos
              ).map((video) => {
              const isInWatchLater = watchLaterVideos.some(w => w.id === video.id);
              return (
                <div
                  key={video.id}
                  id={`video-card-${video.id}`}
                  onClick={() => onSelectVideo(video)}
                  className={`group relative flex flex-col rounded-3xl overflow-hidden cursor-pointer active:scale-[0.99] ${
                    isLight ? 'light-tactile-card' : 'dark-tactile-card'
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Floating 'Quick Actions' Menu on Hover */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 pointer-events-auto">
                      {/* Watch Later Quick Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchLater?.(video.id);
                          showToast(isInWatchLater ? 'Removed from Watch Later' : 'Added to Watch Later');
                        }}
                        title={isInWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
                        className="p-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-white/[0.12] text-slate-200 hover:text-red-400 backdrop-blur-xl shadow-lg transition-all active:scale-90"
                      >
                        <Clock size={14} className={isInWatchLater ? 'text-red-400 fill-red-400' : ''} />
                      </button>

                      {/* Favorite / Bookmark */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(video.id);
                          showToast(video.isFavorite ? 'Removed from Favorites' : 'Saved to Favorites');
                        }}
                        title={video.isFavorite ? 'Remove from Favorites' : 'Add to Favorites / Playlist'}
                        className="p-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-white/[0.12] text-slate-200 hover:text-red-400 backdrop-blur-xl shadow-lg transition-all active:scale-90"
                      >
                        <Bookmark size={14} className={video.isFavorite ? 'text-red-400 fill-red-400' : ''} />
                      </button>

                      {/* Queue */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast(`Queued "${video.title.slice(0, 24)}..."`);
                        }}
                        title="Add to Queue"
                        className="p-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-white/[0.12] text-slate-200 hover:text-amber-400 backdrop-blur-xl shadow-lg transition-all active:scale-90"
                      >
                        <ListPlus size={14} />
                      </button>

                      {/* Share */}
                      <button
                        onClick={(e) => handleCopyLink(video.id, e)}
                        title="Share link"
                        className="p-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-white/[0.12] text-slate-200 hover:text-sky-400 backdrop-blur-xl shadow-lg transition-all active:scale-90"
                      >
                        {copiedId === video.id ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                      </button>
                    </div>

                    {/* Duration pill */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium text-white shadow-md">
                      {video.duration}
                    </div>

                    {/* Slim Color-Matched Video Progress Indicator at the bottom */}
                    {video.watchedProgress && video.watchedProgress > 0 ? (
                      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/15 z-10 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-600 via-rose-500 to-red-500 h-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
                          style={{ width: `${video.watchedProgress}%` }}
                        />
                      </div>
                    ) : null}

                    {/* Quick Play Overlay Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="w-12 h-12 rounded-2xl bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transform scale-75 group-hover:scale-100 transition-transform">
                        <Play size={20} className="ml-0.5 fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content Footer */}
                  <div className="p-4 flex gap-3.5 items-start">
                    {/* Channel Avatar */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChannel?.(video.channelId, video.channelTitle, video.channelAvatar);
                      }}
                      className="relative flex-shrink-0 cursor-pointer group/ch"
                      title={`View ${video.channelTitle}'s channel`}
                    >
                      <img
                        src={video.channelAvatar}
                        alt={video.channelTitle}
                        className={`w-10 h-10 rounded-2xl object-cover shadow-sm group-hover/ch:ring-2 group-hover/ch:ring-red-500 transition-all ${isLight ? 'border border-slate-200' : 'border border-white/[0.08]'}`}
                        loading="lazy"
                      />
                    </div>

                    {/* Meta Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold group-hover:text-red-500 transition-colors line-clamp-2 leading-snug ${
                        isLight ? 'text-slate-900' : 'text-slate-100'
                      }`}>
                        {video.title}
                      </h3>
                      
                      <div className={`mt-1 flex items-center gap-1.5 text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChannel?.(video.channelId, video.channelTitle, video.channelAvatar);
                          }}
                          className="truncate hover:text-red-500 hover:underline transition-colors font-medium cursor-pointer"
                          title={`View ${video.channelTitle}'s channel`}
                        >
                          {video.channelTitle}
                        </span>
                        <CheckCircle2 size={12} className={isLight ? 'text-slate-500 flex-shrink-0' : 'text-slate-400 flex-shrink-0'} />
                      </div>

                      <div className={`mt-0.5 flex items-center gap-2 text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span>{video.views ? `${(video.views / 1000).toFixed(0)}K views` : '1.2M views'}</span>
                        <span>•</span>
                        <span>{video.publishedAt}</span>
                      </div>
                    </div>

                    {/* Three-dots Menu */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === video.id ? null : video.id);
                        }}
                        className={`p-1.5 rounded-xl transition-colors ${
                          isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                        }`}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === video.id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-0 bottom-full mb-2 w-52 rounded-2xl shadow-2xl p-1.5 z-30 backdrop-blur-2xl animate-in fade-in duration-150 space-y-0.5 ${
                            isLight 
                              ? 'bg-white/95 border border-slate-200 text-slate-800 shadow-slate-300' 
                              : 'bg-slate-950/95 border border-white/[0.12] text-slate-200'
                          }`}
                        >
                          <button
                            onClick={() => {
                              onToggleWatchLater?.(video.id);
                              setActiveMenuId(null);
                              showToast(isInWatchLater ? 'Removed from Watch Later' : 'Added to Watch Later');
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                            }`}
                          >
                            <Clock size={14} className="text-red-400" />
                            <span>{isInWatchLater ? 'Remove from Watch Later' : 'Save to Watch Later'}</span>
                          </button>

                          <button
                            onClick={() => {
                              onToggleFavorite(video.id);
                              setActiveMenuId(null);
                              showToast(video.isFavorite ? 'Removed from Favorites' : 'Saved to Favorites');
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                            }`}
                          >
                            <Bookmark size={14} className="text-red-400" />
                            <span>{video.isFavorite ? 'Remove from Favorites' : 'Save to Playlist'}</span>
                          </button>

                          {/* Not interested */}
                          <button
                            onClick={() => {
                              onNotInterested?.(video.id, video.category);
                              setActiveMenuId(null);
                              showToast("We'll tune your feed to show fewer videos like this");
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                            }`}
                          >
                            <EyeOff size={14} className="text-amber-400" />
                            <span>Not interested</span>
                          </button>

                          {/* Don't recommend channel */}
                          <button
                            onClick={() => {
                              onBlockChannel?.(video.channelId, video.channelTitle);
                              setActiveMenuId(null);
                              showToast(`We won't recommend "${video.channelTitle}" anymore`);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                            }`}
                          >
                            <UserX size={14} className="text-rose-400" />
                            <span>Don&apos;t recommend channel</span>
                          </button>

                          <button
                            onClick={(e) => handleCopyLink(video.id, e)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                              isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                            }`}
                          >
                            <Share2 size={14} className="text-sky-400" />
                            <span>Copy link</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
