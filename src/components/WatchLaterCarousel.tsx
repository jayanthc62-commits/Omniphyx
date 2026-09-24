import React, { useState } from 'react';
import { 
  Play, Trash2, Clock, ChevronLeft, ChevronRight, 
  Sparkles, CheckCircle2, BookmarkCheck, Share2, Layers
} from 'lucide-react';
import { Video } from '../types';

interface WatchLaterCarouselProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  onRemoveFromWatchLater: (videoId: string) => void;
  onOpenFullList?: () => void;
}

export const WatchLaterCarousel: React.FC<WatchLaterCarouselProps> = ({
  videos,
  onSelectVideo,
  onRemoveFromWatchLater,
  onOpenFullList,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Filter tags if any
  const tags = ['All', 'Videos', 'Comedy', 'Movies', 'Shorts'];
  const filteredVideos = videos.filter(v => {
    if (selectedTag === 'All') return true;
    if (selectedTag === 'Videos') return true;
    return v.category === selectedTag;
  });

  const safeActiveIndex = Math.min(activeIndex, Math.max(0, filteredVideos.length - 1));

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredVideos.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex(prev => (prev < filteredVideos.length - 1 ? prev + 1 : 0));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveIndex(prev => (prev < filteredVideos.length - 1 ? prev + 1 : 0));
      } else {
        setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredVideos.length - 1));
      }
    }
    setTouchStartX(null);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setTouchStartX(e.clientX);
    setIsDragging(true);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || touchStartX === null) return;
    const diff = touchStartX - e.clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveIndex(prev => (prev < filteredVideos.length - 1 ? prev + 1 : 0));
      } else {
        setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredVideos.length - 1));
      }
    }
    setIsDragging(false);
    setTouchStartX(null);
  };

  if (filteredVideos.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-white/[0.03] via-slate-900/60 to-black/80 p-8 text-center backdrop-blur-2xl shadow-2xl">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/[0.08] text-slate-400">
          <Clock size={24} className="text-red-400" />
        </div>
        <h3 className="text-base font-bold text-slate-100">Watch Later is Empty</h3>
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
          Save any video by clicking the clock or bookmark icon on video cards to build your personal offline queue.
        </p>
      </div>
    );
  }

  const activeVideo = filteredVideos[safeActiveIndex] || filteredVideos[0];

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-b from-slate-900/90 via-slate-950 to-[#070b14] p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
      {/* Dynamic atmospheric ambient glow behind the carousel */}
      <div 
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full blur-3xl opacity-20 transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(99, 102, 241, 0.2) 60%, transparent 100%)'
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 shadow-md shadow-red-500/10">
            <Clock size={17} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Watch Later
              </h2>
              <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-300 border border-white/[0.08]">
                {filteredVideos.length} in queue
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Smooth 3D deck • Swipe or select to play</p>
          </div>
        </div>

        {/* Tags / Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag);
                setActiveIndex(0);
              }}
              className={`px-3 py-1 rounded-2xl text-[11px] font-medium transition-all duration-200 active:scale-95 ${
                selectedTag === tag 
                  ? 'bg-white text-slate-950 font-semibold shadow-md shadow-white/10' 
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Smooth Round Carousel Arena (Inspired by User Video 0:00 - 0:15) */}
      <div 
        className="relative z-10 my-4 flex flex-col items-center justify-center py-2 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setTouchStartX(null);
        }}
      >
        <div 
          className="relative h-[240px] sm:h-[300px] w-full max-w-[620px] flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ perspective: '1100px' }}
        >
          {filteredVideos.map((video, idx) => {
            const offset = idx - safeActiveIndex;
            const isCenter = offset === 0;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) return null;

            // Compute 3D transformation values for tilted card stack
            const translateX = offset * 42; // subtle horizontal overlap
            const translateY = offset * 18; // smooth vertical offset
            const rotateY = offset * -14; // smooth 3D perspective rotation
            const rotateX = isCenter ? 0 : 6;
            const rotateZ = offset * -2;
            const scale = isCenter ? 1 : Math.max(0.78, 1 - Math.abs(offset) * 0.12);
            const zIndex = 30 - Math.abs(offset) * 10;
            const opacity = isCenter ? 1 : Math.max(0.4, 1 - Math.abs(offset) * 0.35);

            return (
              <div
                key={`wl-deck-${video.id}`}
                onClick={() => {
                  if (isCenter) {
                    onSelectVideo(video);
                  } else {
                    setActiveIndex(idx);
                  }
                }}
                className={`absolute w-[290px] sm:w-[380px] h-[180px] sm:h-[235px] rounded-[28px] overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] select-none group border shadow-2xl ${
                  isCenter 
                    ? 'border-white/[0.22] shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/10' 
                    : 'border-white/[0.08] hover:border-white/[0.18]'
                }`}
                style={{
                  transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
                  zIndex,
                  opacity,
                }}
              >
                {/* Video Thumbnail Background */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

                {/* Pill Badge at Bottom Right (Inspired by the "Live Photo", "Brand Animation", etc. badges) */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-xl border border-white/[0.12] text-[10px] font-mono font-medium text-white shadow-lg">
                    {video.duration}
                  </span>
                </div>

                {/* Center Play Button on Active Card */}
                {isCenter && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 group-hover:scale-105 transition-transform duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVideo(video);
                      }}
                      className="w-13 h-13 rounded-2xl bg-red-600/90 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 backdrop-blur-md border border-white/20 hover:bg-red-500 active:scale-95 transition-all"
                      title="Play Now"
                    >
                      <Play size={22} className="ml-1 fill-white" />
                    </button>
                  </div>
                )}

                {/* Card Header & Title info */}
                <div className="absolute bottom-3 left-3 right-20 z-20">
                  <p className="text-xs sm:text-sm font-bold text-white line-clamp-1 leading-snug drop-shadow-md">
                    {video.title}
                  </p>
                  <p className="text-[10px] text-slate-300 truncate mt-0.5 drop-shadow">
                    {video.channelTitle}
                  </p>
                </div>

                {/* Progress bar along bottom of thumbnail */}
                {video.watchedProgress && video.watchedProgress > 0 ? (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 z-30 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-500" 
                      style={{ width: `${video.watchedProgress}%` }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Carousel Stepper Dots & Navigation Controls */}
        <div className="mt-4 flex items-center gap-3 z-20">
          <button
            onClick={handlePrev}
            className="p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-slate-300 hover:text-white active:scale-90 transition-all"
            title="Previous card"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="flex items-center gap-1.5">
            {filteredVideos.slice(0, 6).map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  safeActiveIndex === i 
                    ? 'w-6 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' 
                    : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-slate-300 hover:text-white active:scale-90 transition-all"
            title="Next card"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Active Video Quick Actions Dock */}
      {activeVideo && (
        <div className="relative z-10 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img 
              src={activeVideo.channelAvatar} 
              alt={activeVideo.channelTitle} 
              className="w-8 h-8 rounded-xl object-cover border border-white/10 flex-shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-100 truncate">
                {activeVideo.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {activeVideo.channelTitle} • {activeVideo.views.toLocaleString()} views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onSelectVideo(activeVideo)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            >
              <Play size={13} className="fill-white" />
              <span>Play Now</span>
            </button>
            <button
              onClick={() => onRemoveFromWatchLater(activeVideo.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] active:scale-90 transition-all"
              title="Remove from Watch Later"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
