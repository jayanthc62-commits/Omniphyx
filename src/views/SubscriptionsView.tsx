import React, { useState } from 'react';
import { 
  Radio, Video as VideoIcon, Film, MessageSquare, 
  Sparkles, CheckCircle2, Play, Users, Compass, Plus
} from 'lucide-react';
import { Video, Channel, SubscriptionsTab } from '../types';

interface SubscriptionsViewProps {
  videos: Video[];
  channels: Channel[];
  onSelectVideo: (video: Video) => void;
  onSelectChannel?: (channel: Channel) => void;
  onToggleSubscribe?: (channelId: string) => void;
  onExploreVideos?: () => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  videos,
  channels,
  onSelectVideo,
  onSelectChannel,
  onToggleSubscribe,
  onExploreVideos,
}) => {
  const [activeTab, setActiveTab] = useState<SubscriptionsTab>('videos');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const subscribedChannels = channels.filter(c => c.isSubscribed);
  const selectedChannel = channels.find(c => c.id === selectedChannelId);

  // Filter subscribed videos with smart title/id matching
  const matchedVideos = videos.filter(v => {
    if (selectedChannelId) {
      return v.channelId === selectedChannelId || 
        (selectedChannel && v.channelTitle.toLowerCase().includes(selectedChannel.name.toLowerCase()));
    }
    return subscribedChannels.some(c => 
      c.id === v.channelId || v.channelTitle.toLowerCase().includes(c.name.toLowerCase())
    );
  });

  const subscribedVideos = matchedVideos;

  // Pristine empty state if user hasn't subscribed to anyone yet
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
            Subscribe to your favorite channels to get their latest uploads, premieres, and community posts here.
          </p>
        </div>

        {/* Suggested Channels to quick subscribe */}
        <div className="text-left neu-card-surface rounded-3xl p-5 space-y-3 backdrop-blur-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Suggested channels
          </p>
          <div className="space-y-3">
            {channels.slice(0, 3).map((ch) => (
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
                  className="px-4 py-1.5 rounded-full text-xs font-semibold liquid-btn-primary shadow-md active:scale-95 transition-all"
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
    <div id="freetube-subscriptions-view" className="space-y-6 pb-20">
      {/* View Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Radio size={22} className="text-red-500" />
            Subscriptions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedChannel 
              ? `Showing uploads from ${selectedChannel.name}`
              : `Latest releases from your ${subscribedChannels.length} subscribed channels`}
          </p>
        </div>
      </div>

      {/* Subscriptions Tab Pills: Videos, Shorts, Live, Posts with 2026 Liquid Glass */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/[0.1] backdrop-blur-2xl rounded-full max-w-md shadow-lg">
        {[
          { id: 'videos' as SubscriptionsTab, label: 'Videos', icon: VideoIcon },
          { id: 'shorts' as SubscriptionsTab, label: 'Shorts', icon: Film },
          { id: 'live' as SubscriptionsTab, label: 'Live', icon: Radio },
          { id: 'posts' as SubscriptionsTab, label: 'Posts', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`subs-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'liquid-glass-pill text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-red-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Channel Avatars Carousel */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 px-1">Channels</p>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedChannelId(null)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl flex-shrink-0 transition-all active:scale-95 ${
              selectedChannelId === null 
                ? 'bg-white/[0.09] text-white border border-white/[0.14] shadow-inner' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-xs font-bold text-slate-300">
              ALL
            </div>
            <span className="text-[11px] font-medium max-w-[64px] truncate text-center">All</span>
          </button>

          {subscribedChannels.map((ch) => {
            const isSelected = selectedChannelId === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannelId(isSelected ? null : ch.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl flex-shrink-0 transition-all active:scale-95 ${
                  isSelected 
                    ? 'bg-white/[0.09] text-red-400 border border-red-500/40 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <img
                    src={ch.avatar}
                    alt={ch.name}
                    className={`w-12 h-12 rounded-full object-cover border-2 ${
                      isSelected ? 'border-red-500' : 'border-white/[0.1]'
                    }`}
                  />
                  {ch.hasUnread && (
                    <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 ring-2 ring-slate-950" />
                  )}
                </div>
                <span className="text-[11px] font-medium max-w-[70px] truncate text-center">
                  {ch.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Feed */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          {subscribedVideos.length === 0 ? (
            <div className="py-12 px-6 text-center bg-white/[0.02] rounded-3xl border border-white/[0.07] max-w-lg mx-auto backdrop-blur-xl space-y-3">
              <p className="text-sm font-semibold text-slate-200">No uploads found for this channel</p>
              <p className="text-xs text-slate-400">Tap 'All' above to view updates from all creators.</p>
              <button
                onClick={() => setSelectedChannelId(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-2xl shadow-md transition-all active:scale-95"
              >
                Show All Subscriptions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subscribedVideos.map((video) => (
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

                    {/* Slim minimalist progress bar */}
                    {video.watchedProgress && video.watchedProgress > 0 ? (
                      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/15 z-10 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-600 via-rose-500 to-red-500 h-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
                          style={{ width: `${video.watchedProgress}%` }}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="p-4 flex gap-3">
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shorts Tab simulation */}
      {activeTab === 'shorts' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {subscribedVideos.slice(0, 4).map((v) => (
            <div
              key={`short-${v.id}`}
              onClick={() => onSelectVideo(v)}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 group cursor-pointer hover:border-red-500/40 transition-all"
            >
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-3">
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug">{v.title}</p>
                <p className="text-[10px] text-slate-300 mt-1">{v.views.toLocaleString()} views</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live & Posts Empty/Status */}
      {(activeTab === 'live' || activeTab === 'posts') && (
        <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-6">
          <p className="text-sm font-semibold text-slate-300">No {activeTab} streams right now</p>
          <p className="text-xs text-slate-500 mt-1">Check back soon for new live updates from your channels.</p>
        </div>
      )}
    </div>
  );
};
