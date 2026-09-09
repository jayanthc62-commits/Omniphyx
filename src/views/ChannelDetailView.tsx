import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, CheckCircle2, Bell, Share2, Play, 
  Sparkles, Video as VideoIcon, Flame, Info, Check,
  Search, X, Loader2, RotateCcw
} from 'lucide-react';
import { Video, ThemeMode, Channel } from '../types';

interface ChannelDetailViewProps {
  channelId: string;
  channelTitle: string;
  channelAvatar?: string;
  onBack: () => void;
  onSelectVideo: (video: Video) => void;
  isSubscribed: boolean;
  onToggleSubscribe: (channelId: string) => void;
  theme?: ThemeMode;
}

export const ChannelDetailView: React.FC<ChannelDetailViewProps> = ({
  channelId,
  channelTitle,
  channelAvatar,
  onBack,
  onSelectVideo,
  isSubscribed,
  onToggleSubscribe,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'popular' | 'about'>('videos');
  const [channelVideos, setChannelVideos] = useState<Video[]>([]);
  const [allVideosCache, setAllVideosCache] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [channelSearchQuery, setChannelSearchQuery] = useState<string>('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchInput, setShowSearchInput] = useState<boolean>(true);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isLight = theme === 'light';

  const loadDefaultVideos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/channel?q=${encodeURIComponent(channelTitle)}&id=${encodeURIComponent(channelId)}`);
      const data = await res.json();
      if (data.videos && data.videos.length > 0) {
        setChannelVideos(data.videos);
        setAllVideosCache(data.videos);
      } else {
        const fallbackRes = await fetch(`/api/search?q=${encodeURIComponent(channelTitle)}`);
        const fallbackData = await fallbackRes.json();
        const vList = fallbackData.videos || [];
        setChannelVideos(vList);
        setAllVideosCache(vList);
      }
    } catch (err) {
      console.error('Failed to load channel videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadDefaultVideos();
    return () => { isMounted = false; };
  }, [channelId, channelTitle]);

  const handleChannelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = channelSearchQuery.trim();
    if (!query) {
      handleClearSearch();
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/channel-search?channel=${encodeURIComponent(channelTitle)}&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.videos && data.videos.length > 0) {
        setChannelVideos(data.videos);
        setActiveSearchTerm(query);
      } else {
        // Fallback: client-side filter
        const lowerQ = query.toLowerCase();
        const filtered = allVideosCache.filter(v => 
          v.title.toLowerCase().includes(lowerQ) || 
          v.description?.toLowerCase().includes(lowerQ)
        );
        setChannelVideos(filtered);
        setActiveSearchTerm(query);
      }
    } catch (err) {
      console.error('Channel search failed:', err);
      // Fallback: client-side filter
      const lowerQ = query.toLowerCase();
      const filtered = allVideosCache.filter(v => 
        v.title.toLowerCase().includes(lowerQ)
      );
      setChannelVideos(filtered);
      setActiveSearchTerm(query);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setChannelSearchQuery('');
    setActiveSearchTerm('');
    if (allVideosCache.length > 0) {
      setChannelVideos(allVideosCache);
    } else {
      loadDefaultVideos();
    }
  };

  const displayedVideos = activeTab === 'popular'
    ? [...channelVideos].sort((a, b) => b.views - a.views)
    : channelVideos;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avatarUrl = channelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(channelTitle)}&background=1e293b&color=ef4444`;

  return (
    <div id="channel-detail-view" className="space-y-6 pb-24 select-none animate-in fade-in duration-200">
      {/* Sticky Top Navigation Bar */}
      <div className={`sticky top-0 z-20 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2.5 backdrop-blur-xl border-b flex items-center justify-between transition-colors ${
        isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-950/80 border-white/[0.08] text-slate-100'
      }`}>
        <button
          id="channel-back-btn"
          onClick={onBack}
          className={`flex items-center gap-2 p-2 rounded-2xl transition-all active:scale-95 ${
            isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.08] text-slate-200'
          }`}
          title="Back"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold text-sm truncate max-w-[160px] sm:max-w-md">{channelTitle}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="channel-top-search-toggle"
            onClick={() => {
              setShowSearchInput(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            className={`p-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.08] text-slate-200'
            }`}
            title="Search in this channel"
          >
            <Search size={18} />
            <span className="hidden sm:inline">Search Channel</span>
          </button>

          <button
            onClick={handleShare}
            className={`p-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/[0.08] text-slate-200'
            }`}
            title="Share channel"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            <span className="hidden sm:inline">{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Channel Panoramic Banner */}
      <div className="relative w-full aspect-[21/6] sm:aspect-[24/6] rounded-3xl overflow-hidden bg-slate-900 shadow-md">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=80"
          alt={`${channelTitle} Banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </div>

      {/* Channel Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative -mt-10 sm:-mt-12 flex-shrink-0">
            <img
              src={avatarUrl}
              alt={channelTitle}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-2xl ${
                isLight ? 'ring-4 ring-white border-2 border-slate-200' : 'ring-4 ring-slate-950 border-2 border-white/20'
              }`}
            />
            <div className="absolute bottom-1 right-1 bg-red-600 rounded-full p-1 text-white shadow">
              <CheckCircle2 size={14} className="fill-white text-red-600" />
            </div>
          </div>

          <div className="min-w-0 space-y-1">
            <h1 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-950' : 'text-white'}`}>
              <span className="truncate">{channelTitle}</span>
              <CheckCircle2 size={18} className="text-red-500 flex-shrink-0" />
            </h1>
            <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              @{channelTitle.toLowerCase().replace(/[^a-z0-9]/g, '')} • 1.8M subscribers • {channelVideos.length} videos
            </p>
            <p className={`text-xs line-clamp-1 max-w-xl ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Official uploads and streams, verified privacy-friendly playback via FreeTube.
            </p>
          </div>
        </div>

        {/* Subscribe Action Button */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
          <button
            id="channel-page-subscribe-btn"
            onClick={() => onToggleSubscribe(channelId)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-md ${
              isSubscribed
                ? isLight
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : 'liquid-btn-secondary text-slate-100'
                : 'liquid-btn-primary'
            }`}
          >
            <Bell size={15} className={isSubscribed ? 'fill-current text-amber-400' : ''} />
            <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
          </button>
        </div>
      </div>

      {/* REAL CHANNEL SEARCH BAR (Find specific episode / video inside this channel) */}
      <div className={`p-4 rounded-3xl border transition-all ${
        isLight ? 'bg-slate-50/80 border-slate-200' : 'neu-card-surface border-white/[0.08]'
      }`}>
        <form onSubmit={handleChannelSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search size={17} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              ref={searchInputRef}
              type="text"
              id="channel-video-search-input"
              value={channelSearchQuery}
              onChange={(e) => setChannelSearchQuery(e.target.value)}
              placeholder={`Search videos in ${channelTitle} (e.g. 1291, full episode, song)...`}
              className={`w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm transition-colors outline-none font-medium ${
                isLight 
                  ? 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-red-500' 
                  : 'bg-black/50 border border-white/10 text-white placeholder:text-slate-500 focus:border-red-500'
              }`}
            />
            {channelSearchQuery && (
              <button
                type="button"
                onClick={() => setChannelSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full"
                title="Clear input"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              id="channel-video-search-submit"
              disabled={isSearching}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl liquid-btn-primary text-xs font-semibold shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              <span>Search Channel</span>
            </button>

            {activeSearchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl liquid-btn-secondary text-xs font-medium active:scale-95 text-slate-300 hover:text-white"
                title="Reset to all channel videos"
              >
                <RotateCcw size={14} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </form>

        {/* Active search results pill indicator */}
        {activeSearchTerm && (
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <p className="text-slate-300">
              Showing <span className="font-bold text-red-400">{channelVideos.length}</span> videos matching <span className="font-semibold text-white">"{activeSearchTerm}"</span> in {channelTitle}
            </p>
            <button 
              onClick={handleClearSearch}
              className="text-red-400 hover:text-red-300 font-semibold text-xs underline"
            >
              Show all videos
            </button>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className={`flex items-center gap-2 border-b px-2 ${isLight ? 'border-slate-200' : 'border-white/[0.08]'}`}>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'videos'
              ? isLight ? 'text-red-600 border-b-2 border-red-600' : 'text-white border-b-2 border-red-500'
              : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <VideoIcon size={16} />
          <span>{activeSearchTerm ? 'Search Results' : 'Latest Videos'}</span>
        </button>

        <button
          onClick={() => setActiveTab('popular')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'popular'
              ? isLight ? 'text-red-600 border-b-2 border-red-600' : 'text-white border-b-2 border-red-500'
              : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame size={16} />
          <span>Popular</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'about'
              ? isLight ? 'text-red-600 border-b-2 border-red-600' : 'text-white border-b-2 border-red-500'
              : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info size={16} />
          <span>About Channel</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'about' ? (
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900/60 border-white/[0.08] text-slate-200'
        }`}>
          <h3 className="font-bold text-base">Channel Information</h3>
          <p className="text-sm leading-relaxed text-slate-400">
            {channelTitle} creates video content watched worldwide. When you watch this creator on FreeTube, your connection is routed through private extraction proxies without exposing your IP address, Google identity, or personalized tracking cookie containers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className={`p-3 rounded-2xl ${isLight ? 'bg-slate-100' : 'bg-white/[0.04]'}`}>
              <p className="text-slate-500">Channel ID</p>
              <p className="font-mono mt-0.5 break-all">{channelId}</p>
            </div>
            <div className={`p-3 rounded-2xl ${isLight ? 'bg-slate-100' : 'bg-white/[0.04]'}`}>
              <p className="text-slate-500">Privacy Status</p>
              <p className="font-semibold text-emerald-400 mt-0.5">Encrypted Local Subscriptions</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`rounded-3xl overflow-hidden animate-pulse ${isLight ? 'bg-slate-200 h-64' : 'bg-white/[0.05] h-64'}`} />
              ))}
            </div>
          ) : displayedVideos.length === 0 ? (
            <div className={`text-center py-16 px-4 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-white/[0.08]'}`}>
              <VideoIcon size={40} className="mx-auto text-slate-500 mb-2 opacity-50" />
              <p className="text-sm font-semibold">No videos found matching "{activeSearchTerm || 'channel'}"</p>
              <p className="text-xs text-slate-400 mt-1">Try another search term or clear the filter to see all episodes.</p>
              {activeSearchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="mt-4 px-4 py-2 rounded-full liquid-btn-primary text-xs font-semibold"
                >
                  Show All Videos
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video)}
                  className={`flex flex-col rounded-3xl overflow-hidden cursor-pointer group active:scale-[0.99] transition-all duration-200 ${
                    isLight ? 'light-tactile-card' : 'neu-card-surface'
                  }`}
                >
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 font-mono text-[11px] text-white font-medium">
                      {video.duration}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <h3 className={`text-sm font-semibold line-clamp-2 leading-snug group-hover:text-red-500 transition-colors ${
                      isLight ? 'text-slate-900' : 'text-slate-100'
                    }`}>
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/[0.04]">
                      <span>{video.views ? `${(video.views / 1000).toFixed(0)}K views` : 'Trending'}</span>
                      <span>{video.publishedAt || 'Uploaded recently'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
