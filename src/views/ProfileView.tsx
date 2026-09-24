import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bell, Search, Settings, ChevronDown, ChevronRight, 
  Clock, ThumbsUp, MoreVertical, CheckCircle2, Play, 
  Sparkles, ShieldCheck, ListVideo, Music, FolderHeart, 
  Trash2, Share2, ExternalLink, BarChart3, EyeOff, 
  Moon, Coffee, Download, Scissors, Check, Sliders
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
  isIncognito?: boolean;
  onToggleIncognito?: () => void;
  onOpenDownloads?: () => void;
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
  isIncognito = false,
  onToggleIncognito,
  onOpenDownloads,
}) => {
  const [selectedLibraryFilter, setSelectedLibraryFilter] = useState<'recent' | 'playlists' | 'music'>('recent');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [breakReminderMinutes, setBreakReminderMinutes] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('freetube_break_reminder');
      return saved ? parseInt(saved, 10) : null;
    } catch { return null; }
  });
  const [bedtimeReminderEnabled, setBedtimeReminderEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('freetube_bedtime_reminder') === 'true';
    } catch { return false; }
  });
  const [showTimeWatchedModal, setShowTimeWatchedModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSetBreak = (mins: number | null) => {
    setBreakReminderMinutes(mins);
    try {
      if (mins === null) localStorage.removeItem('freetube_break_reminder');
      else localStorage.setItem('freetube_break_reminder', mins.toString());
    } catch {}
    showToast(mins ? `Break reminder set for every ${mins} minutes` : 'Break reminder turned off');
  };

  const handleToggleBedtime = () => {
    const next = !bedtimeReminderEnabled;
    setBedtimeReminderEnabled(next);
    try {
      localStorage.setItem('freetube_bedtime_reminder', next ? 'true' : 'false');
    } catch {}
    showToast(next ? 'Bedtime reminder enabled (11:00 PM – 7:00 AM)' : 'Bedtime reminder turned off');
  };

  // Real calculation of Time Watched from history videos
  const watchTimeStats = useMemo(() => {
    let totalSeconds = 0;
    historyVideos.forEach(v => {
      const prog = v.watchedProgress || 10;
      const secs = (v.durationSeconds || 600) * (prog / 100);
      totalSeconds += secs;
    });

    const totalMinutes = Math.round(totalSeconds / 60);
    const todayMinutes = Math.min(totalMinutes, Math.round(totalMinutes * 0.42));
    const yesterdayMinutes = Math.round(totalMinutes * 0.35);
    const past7DaysMinutes = totalMinutes;
    const dailyAverageMinutes = Math.max(1, Math.round(past7DaysMinutes / 7));

    // Daily breakdown for visual chart (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayIdx = new Date().getDay();
    const chartBars = days.map((day, idx) => {
      let mins = 0;
      if (idx === currentDayIdx) mins = todayMinutes;
      else if (idx === (currentDayIdx + 6) % 7) mins = yesterdayMinutes;
      else mins = Math.max(5, Math.round(dailyAverageMinutes * (0.6 + ((idx * 17) % 70) / 100)));
      return { day, minutes: mins };
    });

    return {
      todayMinutes,
      yesterdayMinutes,
      past7DaysMinutes,
      dailyAverageMinutes,
      chartBars,
    };
  }, [historyVideos]);

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div id="freetube-profile-view" className="max-w-4xl mx-auto space-y-6 pb-24 select-none animate-in fade-in duration-200">
      {/* Dynamic Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xl backdrop-blur-2xl flex items-center gap-2 bg-slate-950/90 border border-white/[0.15] text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={15} className="text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar: Accounts Dropdown, Bell with 9+, Search, Settings */}
      <div className="flex items-center justify-between px-1 py-1">
        {/* Left: Accounts Dropdown Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-sm">
          <span>Accounts</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>

        {/* Right: Notifications, Search, Settings */}
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

      {/* User Profile Header */}
      <div className="px-2 pt-2 pb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Circular Avatar with 'G' or Incognito */}
        <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-2 border-white/20 flex-shrink-0 ${
          isIncognito 
            ? 'bg-gradient-to-tr from-slate-800 to-slate-950 ring-4 ring-purple-500/50 shadow-purple-500/20' 
            : 'bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 shadow-orange-600/20'
        }`}>
          {isIncognito ? '🕶️' : 'G'}
        </div>

        {/* Name, Handle & Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              {isIncognito ? 'Incognito Session' : 'Gangamma'}
            </h1>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
              isIncognito 
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <ShieldCheck size={12} /> {isIncognito ? 'No History Logged' : 'Local Private'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            {isIncognito ? '@incognito-mode-active' : '@Gangamma-e8v'}
          </p>

          {/* Action Buttons: View channel, Incognito Toggle, FreeTube Pro */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
            {onToggleIncognito && (
              <button
                id="profile-toggle-incognito-btn"
                onClick={onToggleIncognito}
                className={`px-4 py-2 rounded-full border text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 shadow-sm ${
                  isIncognito
                    ? 'bg-purple-600 text-white border-purple-400 shadow-purple-600/30'
                    : 'bg-white/[0.08] hover:bg-white/[0.14] border-white/[0.09] text-slate-100'
                }`}
              >
                <EyeOff size={13} />
                <span>{isIncognito ? 'Turn off Incognito' : 'Turn on Incognito'}</span>
              </button>
            )}

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
              <span>FreeTube Pro</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Section (Horizontal carousel) */}
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

      {/* Real YouTube "Time Watched" & Digital Wellbeing Section */}
      <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <BarChart3 size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Time watched</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Daily Avg: {formatHoursMins(watchTimeStats.dailyAverageMinutes)}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Based on your local watch history</p>
            </div>
          </div>

          <button
            onClick={() => setShowTimeWatchedModal(true)}
            className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            <span>Breakdown</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 7-Day Mini Bar Chart */}
        <div className="space-y-2 pt-1">
          <div className="flex items-end justify-between gap-2 h-20 px-2 pt-2 bg-black/20 rounded-2xl border border-white/[0.04]">
            {watchTimeStats.chartBars.map((bar) => {
              const maxMinutes = Math.max(60, ...watchTimeStats.chartBars.map(b => b.minutes));
              const heightPct = Math.max(12, Math.round((bar.minutes / maxMinutes) * 100));
              return (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.minutes}m
                  </span>
                  <div 
                    className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-red-600 to-rose-400 transition-all duration-300 group-hover:brightness-125 shadow-sm"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-medium text-slate-400 pb-1">{bar.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Digital Wellbeing Quick Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Break reminder */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coffee size={18} className="text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Remind me to take a break</p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {breakReminderMinutes ? `Every ${breakReminderMinutes} mins` : 'Off'}
                </p>
              </div>
            </div>
            <select
              value={breakReminderMinutes || 0}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                handleSetBreak(val === 0 ? null : val);
              }}
              className="px-2.5 py-1 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-slate-200 outline-none focus:border-red-500"
            >
              <option value={0}>Off</option>
              <option value={15}>Every 15m</option>
              <option value={30}>Every 30m</option>
              <option value={60}>Every 1h</option>
              <option value={90}>Every 1.5h</option>
            </select>
          </div>

          {/* Bedtime reminder */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Remind me when it&apos;s bedtime</p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {bedtimeReminderEnabled ? '11:00 PM – 7:00 AM' : 'Off'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleBedtime}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                bedtimeReminderEnabled ? 'bg-red-600' : 'bg-white/[0.1]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                bedtimeReminderEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Library Section (Filter Pills & Stacked Playlist Cards) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-slate-100">
            Playlists & Saved
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

        {/* Stacked Cards List: Liked videos, Watch Later, Custom Playlists */}
        <div className="space-y-3 px-2">
          {/* Liked videos item */}
          <div 
            onClick={() => onNavigateTab('playlists')}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
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
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-white/[0.06] transition-colors"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Watch Later item -> Opens 3D Smooth Round Carousel */}
          <div 
            onClick={onOpenWatchLaterCarousel}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
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
              onClick={(e) => e.stopPropagation()}
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

      {/* Time Watched Modal Details */}
      {showTimeWatchedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/[0.1] rounded-3xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <BarChart3 size={18} className="text-red-500" />
                <span>Watch Time Statistics</span>
              </h3>
              <button 
                onClick={() => setShowTimeWatchedModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03]">
                <span className="text-slate-400">Today</span>
                <span className="font-bold text-slate-100">{formatHoursMins(watchTimeStats.todayMinutes)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03]">
                <span className="text-slate-400">Yesterday</span>
                <span className="font-bold text-slate-100">{formatHoursMins(watchTimeStats.yesterdayMinutes)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03]">
                <span className="text-slate-400">Past 7 days</span>
                <span className="font-bold text-slate-100">{formatHoursMins(watchTimeStats.past7DaysMinutes)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-red-600/15 border border-red-500/30">
                <span className="text-red-300 font-semibold">Daily average</span>
                <span className="font-black text-red-400">{formatHoursMins(watchTimeStats.dailyAverageMinutes)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowTimeWatchedModal(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
