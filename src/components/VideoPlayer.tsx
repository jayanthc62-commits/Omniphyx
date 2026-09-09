import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Maximize, Minimize, Settings, Subtitles, Repeat, 
  ChevronDown, MessageSquare, ThumbsUp, Bookmark, 
  Share2, Check, Radio, Clock, Sparkles,
  ShieldCheck, ExternalLink, Globe, AlertCircle, RefreshCw,
  GripHorizontal, Move, Layers, X
} from 'lucide-react';
import { Video, PlaybackSettings } from '../types';

interface VideoPlayerProps {
  video: Video;
  onClose?: () => void;
  onMinimize?: () => void;
  onToggleFavorite?: (id: string) => void;
  onToggleLike?: (video: Video) => void;
  isLiked?: boolean;
  onToggleWatchLater?: (video: Video) => void;
  inWatchLater?: boolean;
  onToggleSubscribe?: (channelId: string) => void;
  isSubscribed?: boolean;
  onSelectRelatedVideo?: (video: Video) => void;
  relatedVideos: Video[];
  isMini?: boolean;
  onRestoreFromMini?: () => void;
  onOpenChannel?: (channelId: string, channelTitle: string, channelAvatar?: string) => void;
  onUpdateProgress?: (videoId: string, progress: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onClose,
  onMinimize,
  onToggleFavorite,
  onToggleLike,
  isLiked: propIsLiked,
  onToggleWatchLater,
  inWatchLater: propInWatchLater,
  onToggleSubscribe,
  isSubscribed = true,
  onSelectRelatedVideo,
  relatedVideos,
  isMini = false,
  onRestoreFromMini,
  onOpenChannel,
  onUpdateProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchDeltaYRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(video.watchedProgress ? (video.durationSeconds * (video.watchedProgress / 100)) : 0);
  const [duration, setDuration] = useState<number>(video.durationSeconds || 100);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(video.likes);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');
  const [commentsList, setCommentsList] = useState(video.comments || []);
  const [dragTranslateY, setDragTranslateY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  
  // Stream Source Switching: 'youtube' | 'invidious' | 'piped'
  const [streamSource, setStreamSource] = useState<'youtube' | 'invidious' | 'piped'>('youtube');
  const [showStreamAlert, setShowStreamAlert] = useState<boolean>(true);

  const isYouTube = !video.videoUrl || video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') || (Boolean(video.id) && !video.videoUrl?.endsWith('.mp4'));
  const [playbackSettings, setPlaybackSettings] = useState<PlaybackSettings>({
    quality: '1080p',
    speed: 1,
    captions: false,
    loop: false,
    autoplay: true,
    audioOnly: false,
  });

  // Reset stream source if new video is loaded
  useEffect(() => {
    setStreamSource('youtube');
    setShowStreamAlert(true);
  }, [video.id]);

  // Keep state synced when video prop changes
  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(video.watchedProgress ? (video.durationSeconds * (video.watchedProgress / 100)) : 0);
    setDuration(video.durationSeconds || 100);
    setLikeCount(video.likes);
    setIsLiked(Boolean(propIsLiked ?? video.isFavorite));
    setCommentsList(video.comments || []);
    setShowDescription(false);
    setShowComments(false);

    if (videoRef.current) {
      videoRef.current.currentTime = video.watchedProgress ? (video.durationSeconds * (video.watchedProgress / 100)) : 0;
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [video.id, propIsLiked, video.isFavorite]);

  // Handle Fullscreen change listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls
  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettingsModal(false);
      }, 3500);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      handleUserActivity();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      const dur = videoRef.current.duration || video.durationSeconds || 100;
      setCurrentTime(curr);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
      if (dur > 0 && onUpdateProgress) {
        const pct = Math.min(100, Math.round((curr / dur) * 100));
        onUpdateProgress(video.id, pct);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const skipTime = (seconds: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    handleUserActivity();
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const [swipeUpHint, setSwipeUpHint] = useState(false);
  const [swipeDownHint, setSwipeDownHint] = useState(false);

  const enterFullscreenMode = async () => {
    try {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
      }
      setIsFullscreen(true);
    } catch (err) {
      setIsFullscreen(true);
    }
  };

  const exitFullscreenMode = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if ((document as any).webkitFullscreenElement) {
        await (document as any).webkitExitFullscreen();
      }
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
    }
    setIsFullscreen(false);
  };

  const touchStartXRef = useRef<number | null>(null);

  const startDrag = (clientY: number, clientX: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    touchStartYRef.current = clientY;
    touchStartXRef.current = clientX;
    touchDeltaYRef.current = 0;
  };

  const updateDrag = (clientY: number, clientX: number) => {
    if (!isDraggingRef.current || touchStartYRef.current === null) return;
    const deltaY = clientY - touchStartYRef.current;
    const deltaX = clientX - (touchStartXRef.current ?? clientX);

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      touchDeltaYRef.current = deltaY;

      if (deltaY < -25 && !isFullscreen) {
        // Swiping UP in portrait -> Entering fullscreen
        setSwipeUpHint(true);
        setSwipeDownHint(false);
      } else if (deltaY > 25 && isFullscreen) {
        // Swiping DOWN in fullscreen -> Exiting fullscreen
        setSwipeDownHint(true);
        setSwipeUpHint(false);
      } else if (deltaY > 25 && !isFullscreen) {
        // Swiping DOWN in portrait -> Minimizing
        setDragTranslateY(Math.min(deltaY * 0.9, 280));
        setSwipeDownHint(true);
        setSwipeUpHint(false);
      } else {
        setSwipeUpHint(false);
        setSwipeDownHint(false);
      }
    }
  };

  const finishDrag = () => {
    if (!isDraggingRef.current) return;
    const deltaY = touchDeltaYRef.current;

    if (!isFullscreen && deltaY < -40) {
      // Swiped UP in normal player -> Enter Fullscreen
      enterFullscreenMode();
    } else if (isFullscreen && deltaY > 40) {
      // Swiped DOWN in fullscreen -> Exit Fullscreen
      exitFullscreenMode();
    } else if (!isFullscreen && deltaY > 45) {
      // Swiped DOWN in normal player -> Minimize to Miniplayer
      if (onMinimize) {
        onMinimize();
      }
    }

    setDragTranslateY(0);
    setSwipeUpHint(false);
    setSwipeDownHint(false);
    isDraggingRef.current = false;
    setIsDragging(false);
    touchStartYRef.current = null;
    touchStartXRef.current = null;
    touchDeltaYRef.current = 0;
  };

  const getEmbedUrl = () => {
    if (streamSource === 'invidious') {
      return `https://inv.nadeko.net/embed/${video.id}?autoplay=1`;
    }
    if (streamSource === 'piped') {
      return `https://piped.video/embed/${video.id}?autoplay=1`;
    }
    return `https://www.youtube.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientY, e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    updateDrag(e.touches[0].clientY, e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    finishDrag();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startDrag(e.clientY, e.clientX);
    const onMouseMove = (moveEvent: MouseEvent) => updateDrag(moveEvent.clientY, moveEvent.clientX);
    const onMouseUp = () => {
      finishDrag();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const toggleFullscreen = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isFullscreen) {
      await enterFullscreenMode();
    } else {
      await exitFullscreenMode();
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSettings(prev => ({ ...prev, speed }));
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsModal(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      author: 'You (Private User)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: commentInput.trim(),
      likes: 0,
      timeAgo: 'Just now',
    };
    setCommentsList([newComment, ...commentsList]);
    setCommentInput('');
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // MINI PLAYER MODE (Original YouTube Floating 16:9 PiP Window)
  const [miniPos, setMiniPos] = useState<{ x: number; y: number } | null>(null);
  const isMiniDraggingRef = useRef(false);
  const miniDragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const [isCurrentlyMiniDragging, setIsCurrentlyMiniDragging] = useState(false);
  const hasMovedRef = useRef(false);

  // Initialize mini player position (floating bottom-right corner)
  useEffect(() => {
    if (isMini && miniPos === null && typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const playerWidth = isMobile ? 210 : 270;
      const playerHeight = Math.round(playerWidth * (9 / 16));
      const initialX = Math.max(12, window.innerWidth - playerWidth - 16);
      const initialY = Math.max(20, window.innerHeight - playerHeight - 90);
      setMiniPos({ x: initialX, y: initialY });
    }
  }, [isMini, miniPos]);

  const handleMiniPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent dragging when clicking action buttons
    if ((e.target as HTMLElement).closest('button')) return;
    
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    isMiniDraggingRef.current = true;
    hasMovedRef.current = false;
    setIsCurrentlyMiniDragging(true);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const playerWidth = isMobile ? 210 : 270;
    const playerHeight = Math.round(playerWidth * (9 / 16));
    const currentX = miniPos?.x ?? (window.innerWidth - playerWidth - 16);
    const currentY = miniPos?.y ?? (window.innerHeight - playerHeight - 90);

    miniDragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY,
    };
  };

  const handleMiniPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMiniDraggingRef.current) return;
    const deltaX = e.clientX - miniDragStartRef.current.startX;
    const deltaY = e.clientY - miniDragStartRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
    }

    const playerWidth = typeof window !== 'undefined' ? (window.innerWidth < 640 ? 210 : 270) : 270;
    const playerHeight = Math.round(playerWidth * (9 / 16));

    const newX = Math.max(8, Math.min((window.innerWidth || 400) - playerWidth - 8, miniDragStartRef.current.initialX + deltaX));
    const newY = Math.max(8, Math.min((window.innerHeight || 800) - playerHeight - 8, miniDragStartRef.current.initialY + deltaY));

    setMiniPos({ x: newX, y: newY });
  };

  const handleMiniPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMiniDraggingRef.current) return;
    isMiniDraggingRef.current = false;
    setIsCurrentlyMiniDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  if (isMini) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const miniWidth = isMobile ? 210 : 270;
    const miniHeight = Math.round(miniWidth * (9 / 16));
    const defaultX = typeof window !== 'undefined' ? Math.max(12, window.innerWidth - miniWidth - 16) : 16;
    const defaultY = typeof window !== 'undefined' ? Math.max(60, window.innerHeight - miniHeight - 90) : 200;
    const currentX = miniPos?.x ?? defaultX;
    const currentY = miniPos?.y ?? defaultY;

    return (
      <div 
        id="freetube-mini-player"
        onPointerDown={handleMiniPointerDown}
        onPointerMove={handleMiniPointerMove}
        onPointerUp={handleMiniPointerUp}
        onPointerCancel={handleMiniPointerUp}
        onClick={() => {
          if (!hasMovedRef.current) {
            onRestoreFromMini?.();
          }
        }}
        style={{
          transform: `translate3d(${currentX}px, ${currentY}px, 0)`,
          touchAction: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${miniWidth}px`,
        }}
        className={`aspect-video bg-black rounded-2xl shadow-2xl border ${
          isCurrentlyMiniDragging ? 'border-red-500/90 shadow-red-500/30 scale-[1.03] ring-2 ring-red-500/50' : 'border-white/20 hover:border-red-500/60'
        } overflow-hidden z-50 cursor-grab active:cursor-grabbing group transition-all duration-75 select-none`}
      >
        {/* Real YouTube stream / video preview */}
        <div className="relative w-full h-full bg-black pointer-events-none">
          {isYouTube ? (
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          ) : (
            <video 
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-cover"
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
            />
          )}
          {/* Subtle dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/70 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>

        {/* Floating Controls Overlay (Authentic YouTube PiP mini-player) */}
        <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-auto opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Top action row: Play/Pause and Close X */}
          <div className="flex items-center justify-between w-full">
            <button
              id="mini-play-btn"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="w-7 h-7 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg active:scale-90 transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={13} className="fill-white" /> : <Play size={13} className="ml-0.5 fill-white" />}
            </button>

            <button
              id="mini-close-btn"
              onClick={(e) => { e.stopPropagation(); onClose?.(); }}
              className="w-7 h-7 rounded-full bg-black/80 hover:bg-black hover:text-red-400 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg active:scale-90 transition-transform"
              title="Close mini player"
            >
              <X size={14} />
            </button>
          </div>

          {/* Bottom Title snippet & Expand Indicator */}
          <div className="w-full flex items-center justify-between text-white/95 text-[11px] font-semibold drop-shadow px-1">
            <span className="truncate max-w-[140px]">{video.title}</span>
            <Maximize size={12} className="text-white/80 flex-shrink-0 ml-1" />
          </div>
        </div>

        {/* Red bottom progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
          <div 
            className="bg-red-600 h-full shadow-[0_0_8px_rgba(239,68,68,1)] transition-all duration-200"
            style={{ width: `${Math.max(5, (currentTime / (duration || 1)) * 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      id="freetube-video-view"
      style={{
        transform: dragTranslateY > 0 ? `translateY(${dragTranslateY}px) scale(${1 - (dragTranslateY / 750)})` : undefined,
        opacity: dragTranslateY > 0 ? Math.max(0.2, 1 - (dragTranslateY / 300)) : 1,
        transition: isDraggingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        transformOrigin: 'bottom right'
      }}
      className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'max-w-6xl mx-auto'}`}
    >
      {/* Invisible Gesture Tracking Shield active during drag to prevent iframe from hijacking pointer */}
      {isDragging && (
        <div 
          className="fixed inset-0 z-50 cursor-grabbing bg-transparent select-none"
          onMouseMove={(e) => updateDrag(e.clientY, e.clientX)}
          onMouseUp={finishDrag}
          onTouchMove={(e) => updateDrag(e.touches[0].clientY, e.touches[0].clientX)}
          onTouchEnd={finishDrag}
        />
      )}

      {/* 16:9 VIDEO CONTAINER with proper aspect-ratio guarantees */}
      <div 
        ref={containerRef}
        id="video-player-container"
        onMouseMove={handleUserActivity}
        onTouchStart={handleUserActivity}
        style={{
          transform: `translateY(${dragTranslateY}px)`,
          opacity: 1 - (dragTranslateY / 300),
          transition: dragTranslateY === 0 ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease' : 'none'
        }}
        className={`relative w-full bg-black overflow-hidden select-none group transition-all duration-300 ${
          isFullscreen 
            ? 'h-screen w-screen flex items-center justify-center' 
            : 'aspect-video rounded-2xl md:rounded-3xl shadow-2xl border border-slate-800/60'
        }`}
      >
        {/* Ambient glow in background for dark elegance */}
        {!isFullscreen && (
          <div 
            className="absolute -inset-4 bg-red-600/10 blur-3xl rounded-full pointer-events-none -z-10"
            style={{ opacity: isPlaying ? 0.7 : 0.2 }}
          />
        )}

        {/* Real YouTube Video Stream Frame or Native Video */}
        {isYouTube ? (
          <iframe
            id="freetube-native-stream-frame"
            src={getEmbedUrl()}
            title={video.title}
            className={`w-full h-full border-0 ${isFullscreen ? 'object-contain' : ''}`}
            referrerPolicy="origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={video.videoUrl}
            className={`w-full h-full ${isFullscreen ? 'object-contain' : 'object-contain md:object-cover'}`}
            playsInline
            poster={video.thumbnail}
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            loop={playbackSettings.loop}
            muted={isMuted}
          />
        )}

        {/* Unified Native YouTube Mobile Style Top Bar (Tactile Minimize, Swipe Handle & Quick Controls) */}
        {!isFullscreen && (
          <div 
            className="absolute top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-auto"
          >
            {/* 1-Tap Tactile Minimize Button */}
            <button 
              id="player-minimize-btn"
              onClick={(e) => { e.stopPropagation(); (onMinimize || onClose)?.(); }}
              title="Minimize video (or swipe down)"
              className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/95 active:scale-90 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl transition-all"
            >
              <ChevronDown size={20} />
            </button>

            {/* Gesture Drag Capsule */}
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/15 text-[11px] text-white/90 select-none shadow-md cursor-grab active:cursor-grabbing transition-colors"
            >
              <div className="w-6 h-1 rounded-full bg-white/70" />
              <span>Swipe down to minimize</span>
            </div>

            {/* Right Action Controls: Server Switcher Pill, Direct Link, Fullscreen */}
            <div className="flex items-center gap-1.5">
              {isYouTube && (
                <button
                  id="player-stream-switch-pill"
                  onClick={() => setStreamSource(s => s === 'youtube' ? 'invidious' : s === 'invidious' ? 'piped' : 'youtube')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border transition-all active:scale-95 flex items-center gap-1 ${
                    streamSource === 'invidious'
                      ? 'bg-emerald-600/90 text-white border-emerald-400/50'
                      : streamSource === 'piped'
                      ? 'bg-blue-600/90 text-white border-blue-400/50'
                      : 'bg-black/60 text-slate-200 border-white/20 hover:text-white'
                  }`}
                  title="Switch stream source (Bypass region/embed restrictions)"
                >
                  <Globe size={11} />
                  <span>{streamSource === 'invidious' ? 'Invidious' : streamSource === 'piped' ? 'Piped' : 'YouTube'}</span>
                </button>
              )}

              {isYouTube && (
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 active:scale-90 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all shadow-md"
                  title="Open directly in YouTube App or Web"
                >
                  <ExternalLink size={15} />
                </a>
              )}

              <button
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 active:scale-90 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all shadow-md"
                title="Fullscreen"
              >
                <Maximize size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Gesture Feedback Alerts */}
        {swipeUpHint && (
          <div className="absolute inset-x-0 bottom-16 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/95 text-white text-xs font-bold shadow-2xl backdrop-blur-xl border border-white/30">
              <Maximize size={14} className="animate-pulse" />
              <span>Release to open Full Screen</span>
            </div>
          </div>
        )}

        {swipeDownHint && (
          <div className="absolute inset-x-0 top-16 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/95 text-white text-xs font-bold shadow-2xl backdrop-blur-xl border border-white/30">
              <ChevronDown size={15} className="text-red-500 animate-bounce" />
              <span>{isFullscreen ? 'Release to exit Full Screen' : 'Release to minimize'}</span>
            </div>
          </div>
        )}

        {/* Fullscreen Mobile Gesture Bar & Drag Indicator */}
        {isFullscreen && (
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={exitFullscreenMode}
            className="absolute top-0 left-0 right-0 h-20 z-50 flex items-start justify-center pt-3 cursor-pointer select-none bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/85 hover:bg-black text-white text-xs font-semibold backdrop-blur-xl border border-white/25 shadow-2xl transition-all duration-200 active:scale-95 group">
              <ChevronDown size={16} className="text-red-500 animate-bounce" />
              <span>Swipe down to exit full screen</span>
            </div>
          </div>
        )}

        {/* Bottom Swipe-up trigger bar (in normal view) */}
        {!isFullscreen && (
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={toggleFullscreen}
            className="absolute bottom-0 left-0 right-0 h-9 z-40 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent cursor-pointer select-none group"
            title="Swipe up for full screen"
          >
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 group-hover:bg-black/90 backdrop-blur-md border border-white/10 text-[10px] font-medium text-slate-300 group-hover:text-white transition-all">
              <ChevronDown size={13} className="rotate-180 text-red-500 group-hover:-translate-y-0.5 transition-transform" />
              <span>Swipe up for full screen</span>
            </div>
          </div>
        )}

        {/* Video Overlays (Only for local non-YouTube videos so YouTube touch events are 100% unimpeded) */}
        {!isYouTube && (
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/70 flex flex-col justify-between p-3 md:p-6 transition-opacity duration-300 ${
              showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={(e) => {
              if (e.target === e.currentTarget) togglePlay();
            }}
          >
            {/* Top Bar inside player */}
            <div className="flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <button 
                  onClick={onMinimize || onClose}
                  title="Minimize"
                  className="p-2 rounded-xl bg-black/40 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                >
                  <ChevronDown size={20} />
                </button>
                <h2 className="text-xs md:text-sm font-medium text-slate-100 truncate drop-shadow max-w-[200px] sm:max-w-md">
                  {video.title}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="player-audio-only-btn"
                  onClick={() => setPlaybackSettings(p => ({ ...p, audioOnly: !p.audioOnly }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-md transition-all ${
                    playbackSettings.audioOnly ? 'bg-red-500 text-white' : 'bg-black/50 text-slate-300 hover:bg-black/70'
                  }`}
                >
                  Audio Only
                </button>

                <button
                  id="player-subtitles-btn"
                  onClick={() => setPlaybackSettings(p => ({ ...p, captions: !p.captions }))}
                  className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                    playbackSettings.captions ? 'bg-red-500 text-white' : 'bg-black/50 text-slate-300 hover:bg-black/70'
                  }`}
                  title="Captions / Subtitles"
                >
                  <Subtitles size={18} />
                </button>

                <div className="relative">
                  <button
                    id="player-settings-btn"
                    onClick={() => setShowSettingsModal(!showSettingsModal)}
                    className="p-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-slate-200 transition-colors"
                    title="Playback Settings"
                  >
                    <Settings size={18} />
                  </button>

                  {/* Settings Dropdown */}
                  {showSettingsModal && (
                    <div className="absolute right-0 top-12 w-56 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 text-xs text-slate-200 backdrop-blur-xl animate-in fade-in duration-200">
                      <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-2 px-1">Playback Settings</p>
                      
                      <div className="mb-2">
                        <span className="text-[11px] text-slate-400 block px-1 mb-1">Speed</span>
                        <div className="grid grid-cols-4 gap-1">
                          {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((spd) => (
                            <button
                              key={spd}
                              onClick={() => changeSpeed(spd)}
                              className={`py-1 rounded-lg text-center font-medium transition-colors ${
                                playbackSettings.speed === spd 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span>Quality</span>
                          <select 
                            value={playbackSettings.quality}
                            onChange={(e) => setPlaybackSettings(p => ({ ...p, quality: e.target.value as any }))}
                            className="bg-slate-800 text-slate-100 rounded-md px-2 py-0.5 text-xs outline-none border border-slate-700"
                          >
                            <option value="1080p">1080p HD</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                            <option value="Auto">Auto</option>
                          </select>
                        </div>

                        <button
                          onClick={() => setPlaybackSettings(p => ({ ...p, loop: !p.loop }))}
                          className="w-full flex items-center justify-between px-1 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <span className="flex items-center gap-1.5"><Repeat size={14} /> Loop Video</span>
                          <span className={playbackSettings.loop ? 'text-red-400 font-medium' : 'text-slate-500'}>
                            {playbackSettings.loop ? 'On' : 'Off'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Playback Controls */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 text-white">
              <button 
                id="player-skip-back-btn"
                onClick={(e) => skipTime(-10, e)}
                className="p-3 rounded-full bg-black/40 hover:bg-white/20 text-slate-200 transition-all active:scale-95 backdrop-blur-sm"
                title="Rewind 10 seconds"
              >
                <RotateCcw size={22} />
                <span className="text-[10px] block font-mono mt-0.5">-10s</span>
              </button>

              <button 
                id="player-main-play-btn"
                onClick={togglePlay}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
              </button>

              <button 
                id="player-skip-forward-btn"
                onClick={(e) => skipTime(10, e)}
                className="p-3 rounded-full bg-black/40 hover:bg-white/20 text-slate-200 transition-all active:scale-95 backdrop-blur-sm"
                title="Forward 10 seconds"
              >
                <RotateCw size={22} />
                <span className="text-[10px] block font-mono mt-0.5">+10s</span>
              </button>
            </div>

            {/* Bottom Bar Controls & Scrubber */}
            <div className="space-y-2">
              {/* Scrubber Bar */}
              <div className="relative group/scrubber flex items-center">
                <input
                  id="video-scrubber"
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 group-hover/scrubber:h-2.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-red-500 transition-all duration-150"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-medium text-slate-200">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <div className="flex items-center gap-1.5 group/vol">
                    <button onClick={toggleMute} className="hover:text-white transition-colors" title="Mute/Unmute">
                      {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      id="volume-slider"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-slate-700 rounded-lg accent-red-500 cursor-pointer hidden sm:block"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-1.5 py-0.5 bg-slate-800/80 border border-slate-700 rounded text-[10px] font-mono text-red-400">
                    {playbackSettings.quality}
                  </span>

                  <button 
                    id="fullscreen-toggle-btn"
                    onClick={toggleFullscreen}
                    className="hover:text-white p-1 rounded-md transition-colors"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* METADATA & ENGAGEMENT ACTIONS (Hidden in Fullscreen mode for clean immersion) */}
      {!isFullscreen && (
        <div className="mt-4 px-2 sm:px-0 space-y-4">
          {/* Smart Stream Availability Resolver (Bypasses "Video Unavailable in your country" / Third-party embed restrictions) */}
          {isYouTube && showStreamAlert && (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  streamSource === 'invidious' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {streamSource === 'invidious' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-100">
                      Stream Engine: <span className="text-red-400 uppercase">{streamSource}</span>
                    </p>
                    {streamSource === 'invidious' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[10px]">
                        Active: Geo & Embed Restrictions Bypassed
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    If you see <span className="text-amber-300 font-medium">"Video unavailable in your country"</span> or embed blocked by uploader (e.g. TMKOC / Sony):
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                <button
                  onClick={() => setStreamSource('youtube')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 ${
                    streamSource === 'youtube'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white/10 hover:bg-white/15 text-slate-300'
                  }`}
                >
                  YouTube
                </button>

                <button
                  onClick={() => setStreamSource('invidious')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 shadow-md ${
                    streamSource === 'invidious'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                  }`}
                  title="Bypasses region and embed restrictions"
                >
                  <ShieldCheck size={14} />
                  <span>Invidious Mirror</span>
                </button>

                <button
                  onClick={() => setStreamSource('piped')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 ${
                    streamSource === 'piped'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/10 hover:bg-white/15 text-slate-300'
                  }`}
                >
                  Piped
                </button>

                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 font-bold transition-all active:scale-95"
                  title="Watch directly in YouTube App or Web"
                >
                  <ExternalLink size={13} />
                  <span>Open App</span>
                </a>

                <button
                  onClick={() => setShowStreamAlert(false)}
                  className="text-slate-500 hover:text-slate-300 p-1 rounded-lg ml-1"
                  title="Dismiss helper"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Title & Stats */}
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-100 leading-snug tracking-tight">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-slate-400">
              <span className="font-medium text-slate-300">{video.views.toLocaleString()} views</span>
              <span>•</span>
              <span>Published {video.publishedAt}</span>
              <span className="px-2 py-0.5 bg-slate-800/80 text-red-400 rounded-full font-medium text-[11px]">
                {video.category}
              </span>
            </div>
          </div>

          {/* Channel Bar & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-y border-slate-800/80">
            {/* Channel info */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => onOpenChannel?.(video.channelId, video.channelTitle, video.channelAvatar)}
                className="flex items-center gap-3 cursor-pointer group/ch"
                title={`Open ${video.channelTitle}'s channel`}
              >
                <img 
                  src={video.channelAvatar} 
                  alt={video.channelTitle} 
                  className="w-11 h-11 rounded-full object-cover border border-slate-700 shadow-sm group-hover/ch:border-red-500 transition-colors"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-100 flex items-center gap-1 group-hover/ch:text-red-400 transition-colors">
                    {video.channelTitle}
                    <Sparkles size={13} className="text-red-400 fill-red-400/20" />
                  </p>
                  <p className="text-xs text-slate-400">{video.subscriberCount} subscribers</p>
                </div>
              </div>

              <button
                id="channel-subscribe-btn"
                onClick={() => onToggleSubscribe?.(video.channelId)}
                className={`ml-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-95 ${
                  isSubscribed 
                    ? 'liquid-btn-secondary text-slate-300' 
                    : 'liquid-btn-primary'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Engagement Action Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                id="like-video-btn"
                onClick={() => {
                  const nextLiked = !isLiked;
                  setIsLiked(nextLiked);
                  setLikeCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));
                  if (onToggleLike) {
                    onToggleLike(video);
                  } else {
                    onToggleFavorite?.(video.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  isLiked 
                    ? 'liquid-glass-pill text-red-400 border-red-500/50 shadow-red-500/20' 
                    : 'liquid-btn-secondary text-slate-200'
                }`}
              >
                <ThumbsUp size={15} className={isLiked ? 'fill-red-400' : ''} />
                <span>{likeCount.toLocaleString()}</span>
              </button>

              <button
                id="watch-later-video-btn"
                onClick={() => onToggleWatchLater?.(video)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  propInWatchLater || video.inWatchLater
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-slate-800 hover:bg-slate-700/80 text-slate-200'
                }`}
              >
                <Clock size={15} className={propInWatchLater || video.inWatchLater ? 'stroke-[2.5]' : ''} />
                <span>{propInWatchLater || video.inWatchLater ? 'In Watch Later' : 'Watch Later'}</span>
              </button>

              <button
                id="bookmark-video-btn"
                onClick={() => onToggleFavorite?.(video.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  video.isFavorite
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700/80 text-slate-200'
                }`}
              >
                <Bookmark size={15} className={video.isFavorite ? 'fill-amber-400' : ''} />
                <span>{video.isFavorite ? 'Saved' : 'Favorite'}</span>
              </button>

              <button
                id="share-video-btn"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 transition-all active:scale-95"
              >
                {copiedLink ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                id="comments-toggle-btn"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 transition-all active:scale-95"
              >
                <MessageSquare size={15} />
                <span>Comments ({commentsList.length})</span>
              </button>
            </div>
          </div>

          {/* Collapsible Description Box */}
          <div 
            onClick={() => setShowDescription(!showDescription)}
            className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 rounded-2xl p-3.5 text-xs cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
              <span>Description</span>
              <span className="text-red-400">{showDescription ? 'Show less' : 'Show more'}</span>
            </div>
            <p className={`text-slate-300 leading-relaxed whitespace-pre-line ${showDescription ? '' : 'line-clamp-2'}`}>
              {video.description}
            </p>
          </div>

          {/* Comments Panel */}
          {showComments && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <MessageSquare size={16} className="text-red-500" />
                  Comments ({commentsList.length})
                </h3>
                <span className="text-[11px] text-slate-400">Private local comments</span>
              </div>

              {/* Add comment input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a private comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Post
                </button>
              </form>

              {/* Comments list */}
              <div className="space-y-3 pt-2">
                {commentsList.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/60">
                    <img src={c.authorAvatar} alt={c.author} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{c.author}</span>
                        <span className="text-[10px] text-slate-400">{c.timeAgo}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Up Next / Related Videos Grid */}
          <div className="pt-4 border-t border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Radio size={16} className="text-red-500" />
              Up Next & Related Videos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {relatedVideos.filter(v => v.id !== video.id).slice(0, 6).map((rv) => (
                <div
                  key={rv.id}
                  onClick={() => onSelectRelatedVideo?.(rv)}
                  className="flex gap-3 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-red-500/30 cursor-pointer transition-all duration-200 group"
                >
                  <div className="relative w-28 h-18 bg-black rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={rv.thumbnail} 
                      alt={rv.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-white">
                      {rv.duration}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                      {rv.title}
                    </h4>
                    <p 
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChannel?.(rv.channelId, rv.channelTitle, rv.channelAvatar);
                      }}
                      className="text-[11px] text-slate-400 hover:text-red-400 hover:underline mt-1 truncate"
                      title={`Open ${rv.channelTitle}'s channel`}
                    >
                      {rv.channelTitle}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{rv.views.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
