import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Flame, Play, CheckCircle2, Music, 
  Gamepad2, Laptop, Film, Newspaper, Sparkles,
  RotateCcw, MoreVertical, Clock, Bookmark, EyeOff,
  UserX, Share2, Check
} from 'lucide-react';
import { Video, ThemeMode } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';

interface TrendingViewProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  onToggleWatchLater?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onOpenChannel?: (channelId: string, channelTitle: string, channelAvatar?: string) => void;
  onNotInterested?: (videoId: string, category?: string) => void;
  onBlockChannel?: (channelId: string, channelTitle: string) => void;
  theme?: ThemeMode;
}

const EXPLORE_TOPICS = [
  { id: 'all', label: 'Trending', icon: Flame, query: '' },
  { id: 'Music', label: 'Music', icon: Music, query: 'Trending Music Hits 2026' },
  { id: 'Gaming', label: 'Gaming', icon: Gamepad2, query: 'Trending Gaming Streams 2026' },
  { id: 'Tech', label: 'Tech & AI', icon: Laptop, query: 'Technology AI Innovations 2026' },
  { id: 'Movies', label: 'Movies & TV', icon: Film, query: 'Official Movie Trailers New 2026' },
  { id: 'News', label: 'News', icon: Newspaper, query: 'World Breaking News Today' },
];

export const TrendingView: React.FC<TrendingViewProps> = ({
  videos,
  onSelectVideo,
  onToggleWatchLater,
  onToggleFavorite,
  onOpenChannel,
  onNotInterested,
  onBlockChannel,
  theme = 'dark',
}) => {
  const [activeTopic, setActiveTopic] = useState<string>('all');
  const [topicVideos, setTopicVideos] = useState<Record<string, Video[]>>({});
  const [isLoadingTopic, setIsLoadingTopic] = useState<boolean>(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pullY, setPullY] = useState<number>(0);
  const touchStartY = useRef<number | null>(null);

  const isLight = theme === 'light';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Fetch videos for a topic if not yet cached
  const fetchTopicVideos = async (topicId: string, forceFresh = false) => {
    if (!forceFresh && topicVideos[topicId] && topicVideos[topicId].length > 0) {
      return;
    }

    const topicObj = EXPLORE_TOPICS.find(t => t.id === topicId);
    if (!topicObj) return;

    try {
      setIsLoadingTopic(true);
      let endpoint = '/api/trending';
      if (topicObj.query) {
        // Randomize search seed slightly on refresh to get brand new videos
        const freshParam = forceFresh ? `+${Date.now().toString().slice(-4)}` : '';
        endpoint = `/api/search?q=${encodeURIComponent(topicObj.query + freshParam)}`;
      }

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          // Rank according to local recommendation engine
          const ranked = recommendationEngine.rankVideos(data.videos);
          setTopicVideos(prev => ({
            ...prev,
            [topicId]: ranked,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch topic videos:', err);
    } finally {
      setIsLoadingTopic(false);
    }
  };

  // Initial topic load or activeTopic change
  useEffect(() => {
    if (activeTopic === 'all') {
      if (!topicVideos['all'] || topicVideos['all'].length === 0) {
        // Use initial props videos if available
        if (videos.length > 0) {
          const ranked = recommendationEngine.rankVideos(videos);
          setTopicVideos(prev => ({ ...prev, all: ranked }));
        } else {
          fetchTopicVideos('all');
        }
      }
    } else {
      if (!topicVideos[activeTopic]) {
        fetchTopicVideos(activeTopic);
      }
    }
  }, [activeTopic, videos]);

  const handleRefresh = async () => {
    showToast(`Refreshing ${EXPLORE_TOPICS.find(t => t.id === activeTopic)?.label || 'trending'}...`);
    await fetchTopicVideos(activeTopic, true);
  };

  // Mobile pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 5) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0 && window.scrollY <= 5) {
      setPullY(Math.min(diff * 0.45, 80));
    }
  };

  const handleTouchEnd = () => {
    if (pullY > 45) {
      handleRefresh();
    }
    setPullY(0);
    touchStartY.current = null;
  };

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

  const handleLocalNotInterested = (videoId: string, category?: string) => {
    recommendationEngine.markNotInterested(videoId, category);
    onNotInterested?.(videoId, category);
    // Remove immediately from current topic state
    setTopicVideos(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        updated[k] = updated[k].filter(v => v.id !== videoId);
      });
      return updated;
    });
    showToast("We'll tune your recommendations");
  };

  const handleLocalBlockChannel = (channelId: string, channelTitle: string) => {
    recommendationEngine.blockChannel(channelId, channelTitle);
    onBlockChannel?.(channelId, channelTitle);
    // Remove all videos from this channel immediately
    setTopicVideos(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        updated[k] = updated[k].filter(v => v.channelTitle !== channelTitle && v.channelId !== channelId);
      });
      return updated;
    });
    showToast(`We won't recommend "${channelTitle}" anymore`);
  };

  // Determine which list of videos to display
  const currentVideos = topicVideos[activeTopic] && topicVideos[activeTopic].length > 0
    ? topicVideos[activeTopic]
    : (activeTopic === 'all' ? videos : []);

  const spotlightVideo = currentVideos[0];
  const listVideos = currentVideos.slice(1);

  return (
    <div 
      id="freetube-explore-view" 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="space-y-6 pb-24 select-none animate-in fade-in duration-200"
    >
      {/* Pull down refresh indicator */}
      {pullY > 15 && (
        <div className="flex items-center justify-center -mb-2 animate-in fade-in duration-150">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xl backdrop-blur-xl ${
            isLight ? 'bg-white/95 text-slate-800 border border-slate-200' : 'bg-slate-900/95 text-slate-200 border border-white/10'
          }`}>
            <RotateCcw size={13} className={`text-red-500 transition-transform ${pullY > 45 ? 'rotate-180 animate-spin' : ''}`} />
            <span>{pullY > 45 ? 'Release to refresh' : 'Pull down to refresh'}</span>
          </div>
        </div>
      )}

      {/* Dynamic Toast */}
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

      {/* View Header with Refresh Trigger */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            <Compass size={24} className="text-red-500 stroke-[2.2]" />
            <span>Explore & Trending</span>
          </h1>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Live algorithmic feeds, genre spotlights, and breakout creators
          </p>
        </div>

        <button
          id="explore-refresh-btn"
          onClick={handleRefresh}
          disabled={isLoadingTopic}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 active:scale-95 shadow-sm ${
            isLight
              ? 'light-neu-pill-idle text-slate-700 hover:text-slate-950 border border-slate-200'
              : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08]'
          }`}
          title="Refresh Trending Feed"
        >
          <RotateCcw size={13} className={isLoadingTopic ? 'animate-spin text-red-500' : 'text-slate-400'} />
          <span>{isLoadingTopic ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Explore Topic Buttons (Micro-Neumorphic Tactile Pills) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none py-1">
        {EXPLORE_TOPICS.map((topic) => {
          const Icon = topic.icon;
          const isActive = activeTopic === topic.id;
          return (
            <button
              key={topic.id}
              id={`explore-topic-${topic.id}`}
              onClick={() => {
                setActiveTopic(topic.id);
                fetchTopicVideos(topic.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isLight
                  ? isActive
                    ? 'light-neu-pill-active text-slate-950 font-bold border border-slate-300/80'
                    : 'light-neu-pill-idle text-slate-600 hover:text-slate-950 border border-slate-200/80'
                  : isActive
                    ? 'dark-neu-pill-active text-white font-bold border border-white/20'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.07]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-red-500' : isLight ? 'text-slate-500' : 'text-slate-400'} />
              <span>{topic.label}</span>
            </button>
          );
        })}
      </div>

      {/* Topic loading skeleton */}
      {isLoadingTopic && (
        <div className="space-y-4">
          <div className="aspect-[21/9] sm:aspect-[24/9] w-full rounded-3xl bg-white/[0.04] animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={`sk-${i}`} className="h-64 rounded-3xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Featured Spotlight Banner (#1 Trending) - Liquid Glass Spotlight */}
      {!isLoadingTopic && spotlightVideo && (
        <div 
          onClick={() => onSelectVideo(spotlightVideo)}
          className={`relative rounded-3xl overflow-hidden group cursor-pointer transition-all duration-300 ${
            isLight ? 'liquid-glass-spotlight-light' : 'liquid-glass-spotlight'
          }`}
        >
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden">
            <img 
              src={spotlightVideo.thumbnail} 
              alt={spotlightVideo.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out" 
            />
            <div className={`absolute inset-0 ${isLight ? 'bg-gradient-to-t from-white via-white/50 to-transparent' : 'bg-gradient-to-t from-black via-black/40 to-transparent'}`} />
            
            {/* Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-lg">
              <Flame size={13} className="fill-white" />
              <span>#1 in {EXPLORE_TOPICS.find(t => t.id === activeTopic)?.label || 'Trending'}</span>
            </div>

            {/* Duration */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-[10px]">
              {spotlightVideo.duration}
            </div>

            {/* Bottom Details Overlay */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex items-end justify-between gap-4">
              <div className="space-y-1.5 min-w-0 max-w-2xl">
                {/* Channel info - clickable */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChannel?.(spotlightVideo.channelId, spotlightVideo.channelTitle, spotlightVideo.channelAvatar);
                  }}
                  className="flex items-center gap-2 cursor-pointer group/ch hover:opacity-85 transition-opacity"
                  title={`View ${spotlightVideo.channelTitle}'s channel`}
                >
                  <img 
                    src={spotlightVideo.channelAvatar} 
                    alt={spotlightVideo.channelTitle} 
                    className="w-7 h-7 rounded-full object-cover border border-white/20 group-hover/ch:border-red-500 transition-colors"
                  />
                  <span className={`text-xs font-semibold truncate group-hover/ch:text-red-400 transition-colors ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {spotlightVideo.channelTitle}
                  </span>
                  <CheckCircle2 size={12} className="text-red-500 flex-shrink-0" />
                </div>
                <h2 className={`text-base sm:text-xl font-bold line-clamp-2 leading-snug ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  {spotlightVideo.title}
                </h2>
                <p className={`text-[11px] hidden sm:block ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {spotlightVideo.views.toLocaleString()} views • {spotlightVideo.publishedAt}
                </p>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVideo(spotlightVideo);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs active:scale-95 transition-all shadow-lg shadow-red-600/30 flex-shrink-0"
              >
                <Play size={14} className="fill-white" />
                <span>Play Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ranked Video Feed - Tactile Glass/Neumorphic Cards */}
      {!isLoadingTopic && listVideos.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Top Velocity in {EXPLORE_TOPICS.find(t => t.id === activeTopic)?.label || 'Trending'}
            </h3>
            <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              {listVideos.length} videos
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listVideos.map((video, idx) => (
              <div
                key={video.id}
                id={`explore-card-${video.id}`}
                onClick={() => onSelectVideo(video)}
                className={`flex flex-col rounded-3xl overflow-hidden cursor-pointer active:scale-[0.99] group ${
                  isLight ? 'light-tactile-card' : 'dark-tactile-card'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Rank Pill */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-xl bg-black/85 backdrop-blur-md text-[11px] font-mono font-bold text-white shadow">
                    #{idx + 2}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium text-white shadow">
                    {video.duration}
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-4 flex gap-3.5 items-start flex-1">
                  {/* Channel avatar - clickable */}
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
                      className={`w-9 h-9 rounded-2xl object-cover flex-shrink-0 mt-0.5 group-hover/ch:ring-2 group-hover/ch:ring-red-500 transition-all ${isLight ? 'border border-slate-200' : 'border border-white/[0.08]'}`}
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xs sm:text-sm font-semibold group-hover:text-red-500 transition-colors line-clamp-2 leading-snug ${
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
                    <div className={`mt-0.5 text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {video.views.toLocaleString()} views • {video.publishedAt}
                    </div>
                  </div>

                  {/* 3-dots Menu */}
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
                            showToast('Toggled Watch Later');
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          <Clock size={14} className="text-red-400" />
                          <span>Save to Watch Later</span>
                        </button>

                        <button
                          onClick={() => {
                            onToggleFavorite?.(video.id);
                            setActiveMenuId(null);
                            showToast('Saved to Playlist');
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          <Bookmark size={14} className="text-red-400" />
                          <span>Save to Playlist</span>
                        </button>

                        <button
                          onClick={() => {
                            handleLocalNotInterested(video.id, video.category);
                            setActiveMenuId(null);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          <EyeOff size={14} className="text-amber-400" />
                          <span>Not interested</span>
                        </button>

                        <button
                          onClick={() => {
                            handleLocalBlockChannel(video.channelId, video.channelTitle);
                            setActiveMenuId(null);
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
