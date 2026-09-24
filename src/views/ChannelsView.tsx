import React from 'react';
import { Users, CheckCircle2, ChevronRight, Radio } from 'lucide-react';
import { Channel, ThemeMode } from '../types';

interface ChannelsViewProps {
  channels: Channel[];
  onToggleSubscribe: (channelId: string) => void;
  onSelectChannel?: (channel: Channel) => void;
  theme?: ThemeMode;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  onToggleSubscribe,
  onSelectChannel,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div id="freetube-channels-view" className="space-y-6 pb-24 select-none animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            <Users size={24} className="text-red-500" />
            <span>Channel Subscriptions</span>
          </h1>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Manage your subscribed creators, view uploads, and discover channels
          </p>
        </div>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((ch) => (
          <div
            key={ch.id}
            id={`channel-card-${ch.id}`}
            onClick={() => onSelectChannel?.(ch)}
            className={`flex items-center justify-between p-4 rounded-3xl transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              isLight ? 'light-tactile-card' : 'dark-tactile-card'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={ch.avatar}
                  alt={ch.name}
                  className={`w-12 h-12 rounded-full object-cover shadow-md ${
                    isLight ? 'border border-slate-300' : 'border border-white/20'
                  }`}
                />
                {ch.hasUnread && (
                  <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 ring-2 ring-slate-950" />
                )}
              </div>

              <div className="min-w-0">
                <h3 className={`text-sm font-bold truncate flex items-center gap-1.5 ${
                  isLight ? 'text-slate-900' : 'text-slate-100'
                }`}>
                  {ch.name}
                  {ch.verified && <CheckCircle2 size={13} className="text-red-500" />}
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {ch.subscriberCount}
                </p>
                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  {ch.videoCount} videos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                id={`channel-sub-btn-${ch.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSubscribe(ch.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 ${
                  ch.isSubscribed
                    ? isLight
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                }`}
              >
                {ch.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
              <ChevronRight size={16} className={isLight ? 'text-slate-400' : 'text-slate-600'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
