import React, { useState, useMemo } from 'react';
import { 
  Radio, Video as VideoIcon, Film, Bell, BellOff, BellRing,
  CheckCircle2, Play, Users, Compass, Plus,
  FolderUp, Filter, Grid, List, Calendar, Clock,
  Sparkles, ChevronDown, Search, X, ExternalLink,
  Eye, RefreshCw, SlidersHorizontal, Trash2
} from 'lucide-react';
import { Video, Channel } from '../types';

export type SubscriptionsFilterChip = 
  | 'all' 
  | 'today' 
  | 'videos' 
  | 'shorts' 
  | 'live' 
  | 'unwatched' 
  | 'continue';

interface SubscriptionsViewProps {
  videos: Video[];
  channels: Channel[];
  isLoading?: boolean;
  onSelectVideo: (video: Video) => void;
  onSelectChannel?: (channel: Channel) => void;
  onToggleSubscribe?: (channelId: string) => void;
  onUpdateChannelNotification?: (channelId: string, level: 'all' | 'personalized' | 'none') => void;
  onUpdateChannelGroup?: (channelId: string, group: string) => void;
  onRefreshSubscriptions?: () => void;
  onExploreVideos?: () => void;
  onOpenImportExport?: () => void;
}

// Parse YouTube published string to relative seconds for accurate chronological ordering
function parseTimeAgoSeconds(str: string): number {
  if (!str) return 86400 * 30;
  const s = str.toLowerCase().trim();
  
  if (
    s.includes('second') || 
    s.includes('just now') || 
    s.includes('live') || 
    s.includes('streaming') || 
    s.includes('moment') ||
    s.includes('recently')
  ) {
    return 10;
  }

  if (s === 'today') return 3600 * 4;
  if (s === 'yesterday') return 86400 * 1.5;

  // Years
  const yearMatch = s.match(/(\d+)\s*(?:year|yr|yrs|y\b|साल)/);
  if (yearMatch) return parseInt(yearMatch[1], 10) * 31536000;

  // Months
  const monthMatch = s.match(/(\d+)\s*(?:month|months|mo\b|महीने|माह)/);
  if (monthMatch) return parseInt(monthMatch[1], 10) * 2592000;

  // Weeks
  const weekMatch = s.match(/(\d+)\s*(?:week|weeks|w\b|सप्ताह|हफ्ते)/);
  if (weekMatch) return parseInt(weekMatch[1], 10) * 604800;

  // Days
  const dayMatch = s.match(/(\d+)\s*(?:day|days|d\b|दिन)/);
  if (dayMatch) return parseInt(dayMatch[1], 10) * 86400;

  // Hours
  const hourMatch = s.match(/(\d+)\s*(?:hour|hours|hr|hrs|h\b|घंटे)/);
  if (hourMatch) return parseInt(hourMatch[1], 10) * 3600;

  // Minutes
  const minMatch = s.match(/(\d+)\s*(?:minute|minutes|min|mins|m\b|मिनट)/);
  if (minMatch) return parseInt(minMatch[1], 10) * 60;

  // Seconds
  const secMatch = s.match(/(\d+)\s*(?:second|seconds|sec|secs|s\b|सेकंड)/);
  if (secMatch) return parseInt(secMatch[1], 10);

  return 86400 * 7;
}

// Categorize video release time for official YouTube date sections
function getYouTubeTimeCategory(publishedAt: string): 'Today' | 'Yesterday' | 'This week' | 'Earlier' {
  const secs = parseTimeAgoSeconds(publishedAt);
  if (secs <= 86400) return 'Today';
  if (secs <= 86400 * 2) return 'Yesterday';
  if (secs <= 86400 * 7) return 'This week';
  return 'Earlier';
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  videos,
  channels,
  isLoading = false,
  onSelectVideo,
  onSelectChannel,
  onToggleSubscribe,
  onUpdateChannelNotification,
  onUpdateChannelGroup,
  onRefreshSubscriptions,
  onExploreVideos,
  onOpenImportExport,
}) => {
  // Current active YouTube filter chip
  const [activeFilter, setActiveFilter] = useState<SubscriptionsFilterChip>('all');
  // Selected channel from the avatar bar (null = all channels)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  // FreeTube Group filter
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  // View mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // Group by timeline sections: 'sections' vs 'flat'
  const [groupBySections, setGroupBySections] = useState<boolean>(true);
  // Manage Subscriptions Modal
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [manageSearch, setManageSearch] = useState<string>('');
  const [manageSort, setManageSort] = useState<'name' | 'subscribers' | 'recent'>('name');
  // Notification bell selector dropdown state per channel
  const [bellDropdownChannelId, setBellDropdownChannelId] = useState<string | null>(null);
  // Group editor dropdown
  const [groupDropdownChannelId, setGroupDropdownChannelId] = useState<string | null>(null);

  const subscribedChannels = useMemo(() => {
    return channels.filter(c => c.isSubscribed);
  }, [channels]);

  const selectedChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannelId);
  }, [channels, selectedChannelId]);

  // Extract unique custom groups
  const availableGroups = useMemo(() => {
    const set = new Set<string>(['All', 'Favorites', 'Tech', 'Gaming', 'Music', 'News']);
    subscribedChannels.forEach(c => {
      if (c.group) set.add(c.group);
    });
    return Array.from(set);
  }, [subscribedChannels]);

  // Genuine YouTube Subscriptions Chronological Filter Engine
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Filter by selected creator
    if (selectedChannelId) {
      result = result.filter(v => {
        if (v.channelId === selectedChannelId) return true;
        if (selectedChannel && v.channelTitle.toLowerCase() === selectedChannel.name.toLowerCase()) return true;
        return false;
      });
    } else {
      // Must belong to subscribed channels
      const subIds = new Set(subscribedChannels.map(c => c.id));
      const subNames = new Set(subscribedChannels.map(c => c.name.toLowerCase()));
      result = result.filter(v => subIds.has(v.channelId) || subNames.has(v.channelTitle.toLowerCase()));
    }

    // Filter by FreeTube Group
    if (selectedGroup !== 'All') {
      const groupChannelIds = new Set(
        subscribedChannels.filter(c => c.group === selectedGroup).map(c => c.id)
      );
      if (groupChannelIds.size > 0) {
        result = result.filter(v => groupChannelIds.has(v.channelId));
      }
    }

    // Apply YouTube filter chips
    switch (activeFilter) {
      case 'today':
        result = result.filter(v => {
          const cat = getYouTubeTimeCategory(v.publishedAt);
          return cat === 'Today' || cat === 'Yesterday';
        });
        break;
      case 'videos':
        result = result.filter(v => !v.isShort && (v.durationSeconds === 0 || v.durationSeconds > 60));
        break;
      case 'shorts':
        result = result.filter(v => v.isShort || (v.durationSeconds > 0 && v.durationSeconds <= 60) || v.title.toLowerCase().includes('#shorts'));
        break;
      case 'live':
        result = result.filter(v => v.isLive || v.duration === 'LIVE' || v.duration.toLowerCase().includes('live'));
        break;
      case 'unwatched':
        result = result.filter(v => !v.watchedProgress || v.watchedProgress === 0);
        break;
      case 'continue':
        result = result.filter(v => v.watchedProgress && v.watchedProgress > 0 && v.watchedProgress < 95);
        break;
      case 'all':
      default:
        break;
    }

    // Strictly sort in reverse chronological order (newest uploads first)
    result.sort((a, b) => {
      const timeA = parseTimeAgoSeconds(a.publishedAt);
      const timeB = parseTimeAgoSeconds(b.publishedAt);
      return timeA - timeB;
    });

    return result;
  }, [videos, subscribedChannels, selectedChannelId, selectedChannel, selectedGroup, activeFilter]);

  // Group videos by YouTube timeline sections: Today, Yesterday, This week, Earlier
  const timelineSections = useMemo(() => {
    const sections: { title: string; videos: Video[] }[] = [
      { title: 'Today', videos: [] },
      { title: 'Yesterday', videos: [] },
      { title: 'This week', videos: [] },
      { title: 'Earlier', videos: [] },
    ];

    filteredVideos.forEach(v => {
      const cat = getYouTubeTimeCategory(v.publishedAt);
      const section = sections.find(s => s.title === cat);
      if (section) {
        section.videos.push(v);
      } else {
        sections[3].videos.push(v);
      }
    });

    return sections.filter(s => s.videos.length > 0);
  }, [filteredVideos]);

  // Filtered channels for Manage Subscriptions modal
  const managedChannelsList = useMemo(() => {
    let list = subscribedChannels.filter(c => 
      c.name.toLowerCase().includes(manageSearch.toLowerCase())
    );

    if (manageSort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (manageSort === 'subscribers') {
      list.sort((a, b) => {
        const getSubNum = (s: string) => {
          const match = s.match(/([\d.]+)\s*([MBKmbk])?/);
          if (!match) return 0;
          const val = parseFloat(match[1]);
          const unit = (match[2] || '').toUpperCase();
          if (unit === 'M') return val * 1000000;
          if (unit === 'K') return val * 1000;
          if (unit === 'B') return val * 1000000000;
          return val;
        };
        return getSubNum(b.subscriberCount) - getSubNum(a.subscriberCount);
      });
    }
    return list;
  }, [subscribedChannels, manageSearch, manageSort]);

  // Empty state when user hasn't subscribed to anyone
  if (subscribedChannels.length === 0) {
    return (
      <div id="freetube-subscriptions-view" className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in duration-200">
        <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-red-600/20 via-rose-500/10 to-transparent border border-red-500/30 flex items-center justify-center shadow-xl shadow-red-600/10">
          <Radio size={40} className="text-red-500 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Don&apos;t miss a video
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Subscribe to your favorite channels to see their latest videos here in genuine reverse chronological order. Zero algorithm tracking.
          </p>
        </div>

        {onOpenImportExport && (
          <button
            onClick={onOpenImportExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold active:scale-95 transition-all shadow-lg shadow-red-600/30"
          >
            <FolderUp size={16} />
            <span>Import Subscriptions (YouTube Takeout / OPML)</span>
          </button>
        )}

        <div className="text-left neu-card-surface rounded-3xl p-5 space-y-3 backdrop-blur-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Suggested creators to follow
          </p>
          <div className="space-y-3">
            {channels.slice(0, 4).map((ch) => (
              <div key={ch.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
                <div className="flex items-center gap-3">
                  <img
                    src={ch.avatar}
                    alt={ch.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/[0.15] shadow-inner"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1">
                      {ch.name}
                      {ch.verified && <CheckCircle2 size={13} className="text-red-400" />}
                    </h4>
                    <p className="text-[11px] text-slate-400">{ch.subscriberCount}</p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleSubscribe?.(ch.id)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md active:scale-95 transition-all"
                >
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </div>

        {onExploreVideos && (
          <button
            onClick={onExploreVideos}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-btn-secondary text-xs font-semibold text-slate-100 active:scale-95 transition-all shadow-md"
          >
            <Compass size={15} className="text-red-400" />
            <span>Browse Trending Feed</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div id="freetube-subscriptions-view" className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* View Header with YouTube Manage Button & Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Radio size={22} className="text-red-500" />
            Subscriptions
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Live Timeline
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedChannel 
              ? `Showing uploads from ${selectedChannel.name}`
              : `Latest uploads from ${subscribedChannels.length} creators in reverse chronological order`}
          </p>
        </div>

        {/* Action Controls: Refresh, View Modes & YouTube Manage Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRefreshSubscriptions && (
            <button
              onClick={onRefreshSubscriptions}
              disabled={isLoading}
              className={`p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Refresh timeline from YouTube"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin text-red-400' : ''} />
            </button>
          )}

          {/* Grid vs List toggle */}
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'grid' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'list' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>

          {/* Date sections toggle */}
          <button
            onClick={() => setGroupBySections(!groupBySections)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 ${
              groupBySections
                ? 'bg-white/[0.08] border-white/[0.15] text-slate-100'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle YouTube timeline section headers"
          >
            <Calendar size={13} className="text-red-400" />
            <span className="hidden sm:inline">Sections</span>
          </button>

          {/* YouTube Original "Manage" Button */}
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-xs font-semibold text-red-400 hover:text-red-300 transition-all active:scale-95 shadow-sm"
          >
            <SlidersHorizontal size={14} />
            <span>Manage</span>
          </button>
        </div>
      </div>

      {/* YouTube Creator Avatars Bar (Top row) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Channels ({subscribedChannels.length})
          </p>
          {selectedChannelId && (
            <button
              onClick={() => setSelectedChannelId(null)}
              className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>View all creators</span>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {/* "ALL" Circle */}
          <button
            onClick={() => setSelectedChannelId(null)}
            className={`flex flex-col items-center gap-1.5 p-1.5 rounded-2xl flex-shrink-0 transition-all active:scale-95 group ${
              selectedChannelId === null 
                ? 'text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              selectedChannelId === null
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white ring-2 ring-red-500 ring-offset-2 ring-offset-slate-950 shadow-lg shadow-red-600/30'
                : 'bg-white/[0.05] border border-white/[0.1] text-slate-300 group-hover:border-white/[0.2]'
            }`}>
              ALL
            </div>
            <span className="text-[11px] font-medium max-w-[64px] truncate text-center">
              All
            </span>
          </button>

          {/* Subscribed Creator Avatars */}
          {subscribedChannels.map((ch) => {
            const isSelected = selectedChannelId === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannelId(isSelected ? null : ch.id)}
                className={`flex flex-col items-center gap-1.5 p-1.5 rounded-2xl flex-shrink-0 transition-all active:scale-95 group ${
                  isSelected ? 'text-red-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={ch.name}
              >
                <div className="relative">
                  <img
                    src={ch.avatar}
                    alt={ch.name}
                    className={`w-14 h-14 rounded-full object-cover transition-all ${
                      isSelected 
                        ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-slate-950 shadow-lg shadow-red-500/30 scale-105' 
                        : 'border border-white/[0.12] group-hover:border-white/[0.3] group-hover:scale-[1.02]'
                    }`}
                  />
                  {/* YouTube Unread Blue/Cyan Dot */}
                  {ch.hasUnread !== false && (
                    <span 
                      className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-cyan-400 ring-2 ring-slate-950 shadow-sm" 
                      title="New unread videos"
                    />
                  )}
                  {/* YouTube LIVE badge */}
                  {ch.isLive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-black rounded-md ring-2 ring-slate-950 uppercase tracking-tighter shadow-md">
                      LIVE
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium max-w-[72px] truncate text-center">
                  {ch.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Creator Context Banner (when filtered to 1 channel) */}
      {selectedChannel && (
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-3.5">
            <img 
              src={selectedChannel.avatar} 
              alt={selectedChannel.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-red-500/40"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                {selectedChannel.name}
                {selectedChannel.verified && <CheckCircle2 size={14} className="text-red-400" />}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedChannel.subscriberCount} • {selectedChannel.videoCount} uploads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSelectChannel && (
              <button
                onClick={() => onSelectChannel(selectedChannel)}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>Channel Page</span>
                <ExternalLink size={13} />
              </button>
            )}
            <button
              onClick={() => setSelectedChannelId(null)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-xs font-semibold text-red-300 transition-all"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* YouTube Official Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
        {[
          { id: 'all' as SubscriptionsFilterChip, label: 'All' },
          { id: 'today' as SubscriptionsFilterChip, label: 'Today' },
          { id: 'videos' as SubscriptionsFilterChip, label: 'Videos' },
          { id: 'shorts' as SubscriptionsFilterChip, label: 'Shorts' },
          { id: 'live' as SubscriptionsFilterChip, label: 'Live' },
          { id: 'unwatched' as SubscriptionsFilterChip, label: 'Unwatched' },
          { id: 'continue' as SubscriptionsFilterChip, label: 'Continue watching' },
        ].map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-100 text-slate-950 shadow-md font-bold'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.07]'
              }`}
            >
              {chip.id === 'shorts' && <Film size={12} className={isActive ? 'text-red-600' : 'text-slate-400'} />}
              {chip.id === 'live' && <Radio size={12} className={isActive ? 'text-red-600' : 'text-red-400'} />}
              {chip.id === 'continue' && <Clock size={12} className={isActive ? 'text-red-600' : 'text-slate-400'} />}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* FreeTube Subscription Groups Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1 pl-1 flex-shrink-0">
          <Filter size={12} />
          <span>Group:</span>
        </span>
        {availableGroups.map((grp) => (
          <button
            key={grp}
            onClick={() => setSelectedGroup(grp)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all active:scale-95 flex-shrink-0 ${
              selectedGroup === grp
                ? 'bg-red-600 text-white font-semibold shadow-sm'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.05]'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* Main Content: Timeline Sections or Continuous Feed */}
      {filteredVideos.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white/[0.02] rounded-3xl border border-white/[0.07] max-w-lg mx-auto backdrop-blur-xl space-y-3">
          <p className="text-sm font-semibold text-slate-200">No uploads found for this filter</p>
          <p className="text-xs text-slate-400">
            {activeFilter !== 'all' 
              ? `There are no recent ${activeFilter} uploads from your subscribed creators.`
              : 'Your subscribed channels haven\'t published new videos recently.'}
          </p>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSelectedChannelId(null);
              setSelectedGroup('All');
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-2xl shadow-md transition-all active:scale-95"
          >
            Reset Filters
          </button>
        </div>
      ) : activeFilter === 'shorts' ? (
        /* YouTube Dedicated Shorts Vertical Grid */
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Film size={18} className="text-red-500" />
            <h2 className="text-sm font-bold text-slate-100">YouTube Shorts</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredVideos.map((v) => (
              <div
                key={`short-${v.id}`}
                onClick={() => onSelectVideo(v)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border border-white/[0.08] hover:border-red-500/40 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/70"
              >
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <img 
                      src={v.channelAvatar} 
                      alt={v.channelTitle} 
                      className="w-5 h-5 rounded-full object-cover border border-white/20"
                    />
                    <span className="text-[10px] text-slate-300 font-medium truncate">{v.channelTitle}</span>
                  </div>
                  <p className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                    {v.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    {v.views.toLocaleString()} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : groupBySections ? (
        /* YouTube Official Date-Grouped Timeline ("Today", "Yesterday", "This week", "Earlier") */
        <div className="space-y-8">
          {timelineSections.map((sec) => (
            <div key={sec.title} className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 px-1">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                  <Calendar size={16} className="text-red-500" />
                  <span>{sec.title}</span>
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  {sec.videos.length} {sec.videos.length === 1 ? 'upload' : 'uploads'}
                </span>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sec.videos.map((video) => renderVideoCard(video, onSelectVideo))}
                </div>
              ) : (
                <div className="space-y-3">
                  {sec.videos.map((video) => renderVideoListRow(video, onSelectVideo))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Continuous Flat Stream (Grid or List) */
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video) => renderVideoCard(video, onSelectVideo))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((video) => renderVideoListRow(video, onSelectVideo))}
          </div>
        )
      )}

      {/* YouTube Subscription Management Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-red-500" />
                  <span>Manage Subscriptions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure notification bells, categories, and subscriptions ({subscribedChannels.length} total)
                </p>
              </div>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search & Sort Bar */}
            <div className="p-4 border-b border-white/[0.06] flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={manageSearch}
                  onChange={(e) => setManageSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Sort:</span>
                <select
                  value={manageSort}
                  onChange={(e) => setManageSort(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-red-500"
                >
                  <option value="name">A - Z (Name)</option>
                  <option value="subscribers">Subscribers</option>
                </select>
              </div>
            </div>

            {/* Modal Channel List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {managedChannelsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No channels match your search.
                </div>
              ) : (
                managedChannelsList.map((ch) => {
                  const notificationLevel = ch.notificationLevel || 'all';
                  return (
                    <div
                      key={`manage-${ch.id}`}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={ch.avatar}
                          alt={ch.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/[0.1] flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1 truncate">
                            {ch.name}
                            {ch.verified && <CheckCircle2 size={13} className="text-red-400 flex-shrink-0" />}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">{ch.subscriberCount}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {/* YouTube Bell Notification Selector */}
                        <div className="relative">
                          <button
                            onClick={() => setBellDropdownChannelId(bellDropdownChannelId === ch.id ? null : ch.id)}
                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs"
                            title={`Notifications: ${notificationLevel}`}
                          >
                            {notificationLevel === 'all' && <BellRing size={14} className="text-red-400" />}
                            {notificationLevel === 'personalized' && <Bell size={14} className="text-amber-400" />}
                            {notificationLevel === 'none' && <BellOff size={14} className="text-slate-500" />}
                            <ChevronDown size={12} className="text-slate-500" />
                          </button>

                          {bellDropdownChannelId === ch.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-slate-950 border border-white/[0.12] rounded-2xl shadow-2xl p-1.5 z-20 space-y-1">
                              {[
                                { level: 'all' as const, label: 'All notifications', icon: BellRing, color: 'text-red-400' },
                                { level: 'personalized' as const, label: 'Personalized', icon: Bell, color: 'text-amber-400' },
                                { level: 'none' as const, label: 'None (Silent)', icon: BellOff, color: 'text-slate-500' },
                              ].map((item) => {
                                const Icon = item.icon;
                                return (
                                  <button
                                    key={item.level}
                                    onClick={() => {
                                      onUpdateChannelNotification?.(ch.id, item.level);
                                      setBellDropdownChannelId(null);
                                    }}
                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                                      notificationLevel === item.level
                                        ? 'bg-red-600/20 text-red-300 font-semibold'
                                        : 'text-slate-300 hover:bg-white/[0.06]'
                                    }`}
                                  >
                                    <Icon size={14} className={item.color} />
                                    <span>{item.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Unsubscribe Button */}
                        <button
                          onClick={() => onToggleSubscribe?.(ch.id)}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 text-xs font-medium text-slate-300 transition-all flex items-center gap-1"
                          title="Unsubscribe"
                        >
                          <Trash2 size={13} />
                          <span className="hidden sm:inline">Unsubscribe</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-black/20">
              <span className="text-xs text-slate-400 font-medium">
                Changes save automatically to your local storage
              </span>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to render YouTube Card in Grid View
function renderVideoCard(video: Video, onSelectVideo: (video: Video) => void) {
  return (
    <div
      key={video.id}
      onClick={() => onSelectVideo(video)}
      className="group relative flex flex-col bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.14] rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/70 active:scale-[0.99]"
    >
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium text-white shadow-md">
          {video.duration}
        </div>

        {/* In-progress indicator */}
        {video.watchedProgress && video.watchedProgress > 0 ? (
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/15 z-10 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-600 via-rose-500 to-red-500 h-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
              style={{ width: `${video.watchedProgress}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="p-3.5 flex gap-3">
        <img
          src={video.channelAvatar}
          alt={video.channelTitle}
          className="w-9 h-9 rounded-2xl object-cover border border-white/[0.08] flex-shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 truncate flex items-center gap-1 font-medium">
            {video.channelTitle}
            <CheckCircle2 size={12} className="text-slate-500" />
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
            {video.views.toLocaleString()} views • {video.publishedAt}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper to render YouTube Horizontal Row in List View
function renderVideoListRow(video: Video, onSelectVideo: (video: Video) => void) {
  return (
    <div
      key={`list-${video.id}`}
      onClick={() => onSelectVideo(video)}
      className="group flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-all duration-200"
    >
      <div className="relative w-full sm:w-56 aspect-video bg-slate-950 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-1.5 right-1.5 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-mono text-white">
          {video.duration}
        </div>
        {video.watchedProgress && video.watchedProgress > 0 ? (
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/15">
            <div 
              className="bg-red-600 h-full" 
              style={{ width: `${video.watchedProgress}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <img
            src={video.channelAvatar}
            alt={video.channelTitle}
            className="w-5 h-5 rounded-full object-cover border border-white/[0.1]"
          />
          <span className="text-xs text-slate-300 font-medium truncate">{video.channelTitle}</span>
          <span className="text-slate-500">•</span>
          <span className="text-[11px] text-slate-400">{video.views.toLocaleString()} views</span>
          <span className="text-slate-500">•</span>
          <span className="text-[11px] text-slate-400">{video.publishedAt}</span>
        </div>
        {video.description && (
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed hidden sm:block">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
}
