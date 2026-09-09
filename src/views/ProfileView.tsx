import React, { useState } from 'react';
import { 
  Bell, Search, Settings, ChevronDown, ChevronRight, 
  Clock, ThumbsUp, MoreVertical, CheckCircle2, Play, 
  Sparkles, ShieldCheck, ListVideo, Music, FolderHeart, 
  Trash2, Share2, ExternalLink
} from 'lucide-react';
import { Video, Playlist, Channel } from '../types';

interface ProfileViewProps {
  historyVideos: Video[];
  likedVideos: Video[];
  watchLaterVideos: Video[];
  playlists: Playlist[];
  onSelectVideo: (video: Video) => void;
  onNavigateTab: (tab: any) => void;
  onOpenSearch: () => void;
  onOpenWatchLaterCarousel: () => void;
  onRemoveFromHistory?: (id: string) => void;
  onRemoveFromWatchLater?: (id: string) => void;
  onSaveToWatchLater?: (video: Video) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  historyVideos,
  likedVideos,
  watchLaterVideos,
  playlists,
  onSelectVideo,
  onNavigateTab,
  onOpenSearch,
  onOpenWatchLaterCarousel,
  onRemoveFromHistory,
  onRemoveFromWatchLater,
  onSaveToWatchLater,
}) => {
  const [selectedLibraryFilter, setSelectedLibraryFilter] = useState<'recent' | 'playlists' | 'music'>('recent');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div id="freetube-profile-view" className="max-w-4xl mx-auto space-y-6 pb-24 select-none animate-in fade-in duration-200">
      {/* Top Bar: Accounts Dropdown, Bell with 9+, Search, Settings (Matching Screenshot 2) */}
      <div className="flex items-center justify-between px-1 py-1">
        {/* Left: Accounts Dropdown Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-sm">
          <span>Accounts</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>

        {/* Right: Notifications (9+), Search, Settings */}
        <div className="flex items-center gap-2">
          {/* Notification Bell with 9+ Badge */}
          <div className="relative">
            <button 
              onClick={() => onNavigateTab('subscriptions')}
              className="p-2.5 rounded-full hover:bg-white/[0.08] text-slate-200 active:scale-90 transition-all"
              title="Notifications"
            >
              <Bell size={20} />
            </button>
            <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-red-600 border-2 border-slate-950 text-[10px] font-bold text-white rounded-full leading-tight shadow-md">
              9+
            </span>
          </div>

          {/* Search Button */}
          <button 
            onClick={onOpenSearch}
            className="p-2.5 rounded-full hover:bg-white/[0.08] text-slate-200 active:scale-90 transition-all"
            title="Search"
          >
            <Search size={20} />
          </button>

          {/* Settings Button */}
          <button 
            onClick={() => onNavigateTab('settings')}
            className="p-2.5 rounded-full hover:bg-white/[0.08] text-slate-200 active:scale-90 transition-all"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* User Profile Header (Gangamma @Gangamma-e8v from Screenshot 2) */}
      <div className="px-2 pt-2 pb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Large Circular Avatar with 'G' (Orange gradient matching Screenshot 2) */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-orange-600/20 border-2 border-white/20 flex-shrink-0">
          G
        </div>

        {/* Name, Handle & Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Gangamma
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
              <ShieldCheck size={12} /> Local Private
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            @Gangamma-e8v
          </p>

          {/* Action Buttons (View channel & Get Premium / Pro) */}
          <div className="flex items-center gap-2.5 mt-3.5">
            <button
              onClick={() => onNavigateTab('channels')}
              className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.09] text-xs font-semibold text-slate-100 active:scale-95 transition-all shadow-sm"
            >
              View channel
            </button>
            <button
              onClick={() => onNavigateTab('settings')}
              className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.07] text-xs font-semibold text-slate-200 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>FreeTube Pro (Active)</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Section (Horizontal carousel matching Screenshot 2) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => onNavigateTab('history')}
            className="flex items-center gap-1.5 text-lg font-bold text-slate-100 hover:text-red-400 transition-colors group"
          >
            <span>History</span>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
          >
            See all ({historyVideos.length})
          </button>
        </div>

        {historyVideos.length > 0 ? (
          <div className="flex gap-3.5 overflow-x-auto pb-2 px-2 scrollbar-none snap-x">
            {historyVideos.map((video) => (
              <div
                key={`profile-hist-${video.id}`}
                onClick={() => onSelectVideo(video)}
                className="w-48 sm:w-56 flex-shrink-0 group cursor-pointer snap-start"
              >
                {/* 16:9 Thumbnail with Rounded Corners & Duration Badge */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/[0.08] shadow-md group-hover:border-white/[0.18] transition-all">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-medium text-white shadow">
                    {video.duration}
                  </div>

                  {/* Red progress bar at bottom of thumbnail */}
                  {video.watchedProgress && video.watchedProgress > 0 ? (
                    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/20 z-10 overflow-hidden">
                      <div 
                        className="bg-red-500 h-full shadow-[0_0_6px_rgba(239,68,68,0.8)]" 
                        style={{ width: `${video.watchedProgress}%` }}
                      />
                    </div>
                  ) : null}
                </div>

                {/* Title and Channel Metadata */}
                <div className="flex items-start justify-between gap-1.5 mt-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 truncate flex items-center gap-1 font-medium">
                      {video.channelTitle}
                      <CheckCircle2 size={11} className="text-slate-500" />
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      id={`profile-history-menu-btn-${video.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === video.id ? null : video.id);
                      }}
                      className="p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/[0.06] transition-colors"
                      title="Options"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {activeMenuId === video.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                          }} 
                        />
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-7 w-48 bg-slate-900/95 border border-white/[0.12] rounded-2xl shadow-2xl p-1.5 z-50 text-xs backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            onClick={() => {
                              onSelectVideo(video);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors text-left"
                          >
                            <Play size={14} className="text-red-400" />
                            <span>Play video</span>
                          </button>

                          <button
                            onClick={() => {
                              onSaveToWatchLater?.(video);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors text-left"
                          >
                            <Clock size={14} className="text-slate-400" />
                            <span>Save to Watch Later</span>
                          </button>

                          <button
                            onClick={() => {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(window.location.origin + '?v=' + video.id);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors text-left"
                          >
                            <Share2 size={14} className="text-slate-400" />
                            <span>Share video</span>
                          </button>

                          <div className="my-1 border-t border-white/[0.06]" />

                          <button
                            onClick={() => {
                              onRemoveFromHistory?.(video.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                          >
                            <Trash2 size={14} className="text-red-400" />
                            <span>Remove from History</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center text-xs text-slate-400">
            No history yet. Videos you watch will appear here.
          </div>
        )}
      </div>

      {/* Library Section (Filter Pills & Stacked Playlist Cards matching Screenshot 2) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-slate-100">
            Library
          </h2>
        </div>

        {/* Filter Pills: [ Recent v ] [ Playlists ] [ Music ] */}
        <div className="flex items-center gap-2 px-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedLibraryFilter('recent')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              selectedLibraryFilter === 'recent'
                ? 'bg-white text-slate-950 shadow-md shadow-white/10'
                : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/[0.07]'
            }`}
          >
            <span>Recent</span>
            <ChevronDown size={13} />
          </button>

          <button
            onClick={() => setSelectedLibraryFilter('playlists')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              selectedLibraryFilter === 'playlists'
                ? 'bg-white text-slate-950 shadow-md shadow-white/10'
                : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/[0.07]'
            }`}
          >
            Playlists
          </button>

          <button
            onClick={() => setSelectedLibraryFilter('music')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              selectedLibraryFilter === 'music'
                ? 'bg-white text-slate-950 shadow-md shadow-white/10'
                : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/[0.07]'
            }`}
          >
            Music
          </button>
        </div>

        {/* Stacked Cards List: Liked videos, Watch Later, Custom Playlists (Matching Screenshot 2) */}
        <div className="space-y-3 px-2">
          {/* Liked videos item */}
          <div 
            onClick={() => onNavigateTab('playlists')}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Stacked card thumbnail preview with ThumbsUp badge */}
              <div className="relative w-28 h-17 rounded-xl overflow-hidden bg-slate-900 border border-white/[0.08] flex-shrink-0 shadow-md flex items-center justify-center">
                {likedVideos.length > 0 && likedVideos[0]?.thumbnail ? (
                  <img
                    src={likedVideos[0].thumbnail}
                    alt="Liked videos"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900/90 flex items-center justify-center">
                    <ThumbsUp size={22} className="text-slate-600 stroke-[1.8]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-950/20" />
                <div className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-black/80 backdrop-blur-md text-white shadow">
                  <ThumbsUp size={13} className={likedVideos.length > 0 ? "fill-white" : "text-slate-300"} />
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                  Liked videos
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Private • {likedVideos.length} videos
                </p>
              </div>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-white/[0.06] transition-colors"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Watch Later item -> Opens 3D Smooth Round Carousel! */}
          <div 
            onClick={onOpenWatchLaterCarousel}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Stacked card thumbnail preview with Clock badge */}
              <div className="relative w-28 h-17 rounded-xl overflow-hidden bg-slate-900 border border-white/[0.08] flex-shrink-0 shadow-md flex items-center justify-center">
                {watchLaterVideos.length > 0 && watchLaterVideos[0]?.thumbnail ? (
                  <img
                    src={watchLaterVideos[0].thumbnail}
                    alt="Watch Later"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900/90 flex items-center justify-center">
                    <Clock size={22} className="text-slate-600 stroke-[1.8]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-950/20" />
                <div className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-black/80 backdrop-blur-md text-white shadow">
                  <Clock size={13} className="stroke-[2.5]" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                    Watch Later
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-[10px] font-semibold text-red-400">
                    3D Carousel
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Private • {watchLaterVideos.length} videos
                </p>
              </div>
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-white/[0.06] transition-colors"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Custom Playlists */}
          {playlists.filter(p => p.id !== 'favorites' && p.id !== 'watch-later').length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center my-2">
              <p className="text-xs text-slate-400 font-medium">No custom playlists yet</p>
            </div>
          ) : (
            playlists.filter(p => p.id !== 'favorites' && p.id !== 'watch-later').map(pl => (
              <div 
                key={pl.id}
                onClick={() => onNavigateTab('playlists')}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-28 h-17 rounded-xl overflow-hidden bg-slate-900 border border-white/[0.08] flex-shrink-0 shadow-md flex items-center justify-center">
                    {pl.thumbnail ? (
                      <img
                        src={pl.thumbnail}
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <ListVideo size={22} className="text-slate-600" />
                    )}
                    <div className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-black/80 backdrop-blur-md text-white shadow">
                      <ListVideo size={13} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                      {pl.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {pl.videoCount} videos • {pl.updatedAt}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
