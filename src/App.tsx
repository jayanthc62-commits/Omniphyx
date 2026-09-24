import React, { useState, useEffect } from 'react';
import { ViewTab, ThemeMode, Video, Channel, Playlist, FreeTubePreferences } from './types';
import { SAMPLE_VIDEOS, SAMPLE_CHANNELS, SAMPLE_PLAYLISTS } from './mockData';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BottomNav } from './components/BottomNav';
import { VideoPlayer } from './components/VideoPlayer';
import { DashboardView } from './views/DashboardView';
import { SearchView } from './views/SearchView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { PlaylistsView } from './views/PlaylistsView';
import { HistoryView } from './views/HistoryView';
import { ChannelsView } from './views/ChannelsView';
import { TrendingView } from './views/TrendingView';
import { ChannelDetailView } from './views/ChannelDetailView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { ProfileView } from './views/ProfileView';
import { VintoraAgentView } from './views/VintoraAgentView';
import { WatchLaterCarousel } from './components/WatchLaterCarousel';
import { QuickSettingsPanel } from './components/QuickSettingsPanel';
import { QuickActionModal } from './components/QuickActionModal';
import { DownloadApkModal } from './components/DownloadApkModal';
import { MediaDownloadModal } from './components/MediaDownloadModal';
import { SubscriptionImportExportModal } from './components/SubscriptionImportExportModal';
import { SearchFilterModal, SearchFilterOptions } from './components/SearchFilterModal';
import { ArrowLeft, Clock } from 'lucide-react';
import { recommendationEngine } from './services/recommendationEngine';

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [prevTab, setPrevTab] = useState<ViewTab>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  
  // Advanced Search Filters state
  const [isSearchFilterModalOpen, setIsSearchFilterModalOpen] = useState<boolean>(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilterOptions>({
    uploadDate: 'all',
    type: 'all',
    duration: 'all',
    sort: 'relevance',
  });
  const hasActiveFilters = searchFilters.uploadDate !== 'all' || searchFilters.type !== 'all' || searchFilters.duration !== 'all' || searchFilters.sort !== 'relevance';

  // Incognito Mode state (pauses history logging and private session indicator)
  const [isIncognito, setIsIncognito] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('freetube_incognito') === 'true';
    } catch { return false; }
  });

  const handleToggleIncognito = () => {
    setIsIncognito(prev => {
      const next = !prev;
      try {
        sessionStorage.setItem('freetube_incognito', next ? 'true' : 'false');
      } catch {}
      return next;
    });
  };
  
  // Quick Settings & Modals state
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState<boolean>(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [brightness, setBrightness] = useState<number>(1.0);
  const [eyeComfort, setEyeComfort] = useState<boolean>(false);
  const [ambientGlow, setAmbientGlow] = useState<boolean>(true);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [loopVideo, setLoopVideo] = useState<boolean>(false);
  const [audioOnly, setAudioOnly] = useState<boolean>(false);

  // FreeTube Original Modal States
  const [isDownloadApkOpen, setIsDownloadApkOpen] = useState<boolean>(false);
  const [isMediaDownloadOpen, setIsMediaDownloadOpen] = useState<boolean>(false);
  const [mediaDownloadVideo, setMediaDownloadVideo] = useState<Video | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);

  // FreeTube Core Preferences (Proxy stream, SponsorBlock, Distraction-free)
  const [freeTubePrefs, setFreeTubePrefs] = useState<FreeTubePreferences>(() => {
    try {
      const saved = localStorage.getItem('freetube_preferences_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      defaultQuality: '1080p',
      bufferSize: '30s',
      sponsorBlockEnabled: true,
      sponsorCategories: {
        sponsor: true,
        intro: true,
        outro: true,
        selfpromo: true,
        interaction: false,
      },
      streamEngine: 'youtube',
      invidiousInstance: 'https://inv.nadeko.net',
      pipedInstance: 'https://piped.video',
      hideComments: false,
      hideRelated: false,
      hideDislikes: false,
      hideViews: false,
      saveHistory: true,
      subscriptionGroups: ['All', 'Favorites', 'Tech', 'Comedy', 'Music', 'News'],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('freetube_preferences_v1', JSON.stringify(freeTubePrefs));
    } catch {}
  }, [freeTubePrefs]);

  // Data states (with local storage persistence)
  // Helper to sanitize stored videos and remove old stock/dummy data
  const sanitizeVideoList = (list: any[]): Video[] => {
    if (!Array.isArray(list)) return [];
    return list.filter((v: any) => 
      v && v.id && 
      !v.id.startsWith('ep-') && 
      !v.id.startsWith('v-') && 
      !v.thumbnail?.includes('unsplash.com') && 
      !v.videoUrl?.includes('gtv-videos-bucket')
    );
  };

  // Data states (with local storage persistence)
  const [videos, setVideos] = useState<Video[]>(() => {
    try {
      const saved = localStorage.getItem('freetube_videos');
      if (saved) {
        const sanitized = sanitizeVideoList(JSON.parse(saved));
        if (sanitized.length > 0) return sanitized;
      }
    } catch {}
    return SAMPLE_VIDEOS;
  });

  // Dedicated persistent history store
  const [historyVideos, setHistoryVideos] = useState<Video[]>(() => {
    try {
      const saved = localStorage.getItem('freetube_history_v2');
      if (saved) {
        const sanitized = sanitizeVideoList(JSON.parse(saved));
        if (sanitized.length > 0) return sanitized;
      }
    } catch {}
    return [
      { ...SAMPLE_VIDEOS[0], watchedProgress: 45 },
      { ...SAMPLE_VIDEOS[1], watchedProgress: 20 },
    ];
  });

  // Dedicated persistent liked videos store
  const [likedVideos, setLikedVideos] = useState<Video[]>(() => {
    try {
      const saved = localStorage.getItem('freetube_liked_v2');
      if (saved) {
        const sanitized = sanitizeVideoList(JSON.parse(saved));
        if (sanitized.length > 0) return sanitized;
      }
    } catch {}
    return [
      { ...SAMPLE_VIDEOS[0], isFavorite: true },
      { ...SAMPLE_VIDEOS[1], isFavorite: true },
    ];
  });

  // Dedicated persistent watch later store
  const [watchLaterVideos, setWatchLaterVideos] = useState<Video[]>(() => {
    try {
      const saved = localStorage.getItem('freetube_watch_later_v2');
      if (saved) {
        const sanitized = sanitizeVideoList(JSON.parse(saved));
        if (sanitized.length > 0) return sanitized;
      }
    } catch {}
    return [
      { ...SAMPLE_VIDEOS[1], inWatchLater: true },
      { ...SAMPLE_VIDEOS[2], inWatchLater: true },
    ];
  });

  // Dismiss Android native splash screen once React is mounted
  useEffect(() => {
    try {
      (window as any).Android?.hideSplashScreen?.();
    } catch (e) {}
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('freetube_history_v2', JSON.stringify(historyVideos));
    } catch {}
  }, [historyVideos]);

  // Save liked videos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('freetube_liked_v2', JSON.stringify(likedVideos));
    } catch {}
  }, [likedVideos]);

  // Save watch later to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('freetube_watch_later_v2', JSON.stringify(watchLaterVideos));
    } catch {}
  }, [watchLaterVideos]);

  // Combined video catalog to safely resolve playlists & related items
  const allCatalogVideos = React.useMemo(() => {
    const map = new Map<string, Video>();
    SAMPLE_VIDEOS.forEach(v => map.set(v.id, v));
    videos.forEach(v => map.set(v.id, v));
    historyVideos.forEach(v => map.set(v.id, v));
    likedVideos.forEach(v => map.set(v.id, v));
    watchLaterVideos.forEach(v => map.set(v.id, v));
    return Array.from(map.values());
  }, [videos, historyVideos, likedVideos, watchLaterVideos]);

  // Sanitize and clean legacy localStorage on load to purge old stock dummy data
  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      localStorage.removeItem('freetube_channels'); // purge legacy mock cache
      const saved = localStorage.getItem('freetube_channels_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && !parsed.some((c: Channel) => c.id?.includes('tmkoc') || c.id?.includes('samantha') || c.avatar?.includes('unsplash'))) {
          return parsed;
        }
      }
    } catch {}
    return SAMPLE_CHANNELS;
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      localStorage.removeItem('freetube_playlists'); // purge legacy mock cache
      const saved = localStorage.getItem('freetube_playlists_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && !parsed.some((p: Playlist) => p.id?.includes('tmkoc') || p.id?.includes('software-engineering'))) {
          return parsed;
        }
      }
    } catch {}
    return SAMPLE_PLAYLISTS;
  });

  // Active playing video & mini player mode
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isPlayerMini, setIsPlayerMini] = useState<boolean>(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false);

  // Fetch real YouTube videos on initial load
  useEffect(() => {
    async function loadInitialVideos() {
      try {
        setIsLoadingVideos(true);
        const res = await fetch('/api/trending');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.videos) && data.videos.length > 0) {
            setVideos(prev => {
              const localMap = new Map<string, Video>(prev.map(p => [p.id, p]));
              return data.videos.map((nv: Video) => {
                const local = localMap.get(nv.id);
                return local ? { ...nv, watchedProgress: local.watchedProgress, isFavorite: local.isFavorite, inWatchLater: local.inWatchLater } : nv;
              });
            });
          }
        }
      } catch (err) {
        console.error('Failed to load initial videos:', err);
      } finally {
        setIsLoadingVideos(false);
      }
    }
    loadInitialVideos();
  }, []);

  const [searchChannels, setSearchChannels] = useState<Channel[]>([]);

  // Execute real YouTube search or direct video URL stream
  const handleExecuteSearch = async (query: string, customFilters?: SearchFilterOptions) => {
    if (!query.trim()) return;

    if (!isIncognito) {
      recommendationEngine.recordSearch(query);
    }

    // Check if query is a YouTube URL
    const ytId = extractYouTubeId(query.trim());
    if (ytId) {
      const urlVideo: Video = {
        id: ytId,
        title: 'YouTube Stream',
        channelId: 'youtube-custom',
        channelTitle: 'YouTube Video',
        channelAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        subscriberCount: '1M subscribers',
        duration: '10:00',
        durationSeconds: 600,
        views: 12000,
        likes: 800,
        publishedAt: 'Recently',
        thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
        description: 'Direct YouTube stream link',
        category: 'All',
      };
      setVideos(prev => [urlVideo, ...prev.filter(v => v.id !== ytId)]);
      handleSelectVideo(urlVideo);
      return;
    }

    try {
      setIsLoadingVideos(true);
      setIsSearchActive(true);
      setSearchQuery(query);
      if (activeTab !== 'search' && activeTab !== 'watch') {
        setPrevTab(activeTab);
      }
      setActiveTab('search');

      const activeF = customFilters || searchFilters;
      const params = new URLSearchParams({
        q: query.trim(),
        type: activeF.type,
        sort: activeF.sort,
        duration: activeF.duration,
        upload_date: activeF.uploadDate,
      });

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
        }
        if (Array.isArray(data.channels)) {
          setSearchChannels(data.channels);
        }
      }
    } catch (err) {
      console.error('Error executing search:', err);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Listen for external series quick search triggers
  useEffect(() => {
    const handleFreetubeSearchEvent = (e: any) => {
      if (e.detail) {
        handleExecuteSearch(e.detail);
      }
    };
    window.addEventListener('freetube-search', handleFreetubeSearchEvent);
    return () => window.removeEventListener('freetube-search', handleFreetubeSearchEvent);
  }, []);

  const handleClearSearch = async () => {
    setSearchQuery('');
    setIsSearchActive(false);
    try {
      setIsLoadingVideos(true);
      const res = await fetch('/api/trending?category=all');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Execute category query
  const handleSelectCategory = async (category: string) => {
    try {
      setIsLoadingVideos(true);
      const catKey = (category === 'All' || category === 'Trending') ? 'all' : category.toLowerCase();
      const res = await fetch(`/api/trending?category=${catKey}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
        }
      }
    } catch (err) {
      console.error('Failed to load category videos:', err);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('freetube_videos', JSON.stringify(videos));
  }, [videos]);

  // Auto-discover channels from real search results so users can subscribe to them
  useEffect(() => {
    if (!videos || videos.length === 0) return;
    setChannels(prev => {
      const existingMap = new Map(prev.map(c => [c.id, c]));
      videos.forEach(v => {
        if (v.channelId && !existingMap.has(v.channelId)) {
          existingMap.set(v.channelId, {
            id: v.channelId,
            name: v.channelTitle,
            avatar: v.channelAvatar,
            subscriberCount: v.subscriberCount || '1M subscribers',
            videoCount: 240,
            isSubscribed: false,
            verified: true,
          });
        }
      });
      return Array.from(existingMap.values());
    });
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('freetube_channels_v3', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem('freetube_playlists_v3', JSON.stringify(playlists));
  }, [playlists]);

  const [selectedChannel, setSelectedChannel] = useState<{ id: string; title: string; avatar?: string } | null>(null);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState<boolean>(false);

  const handleOpenChannel = (channelId: string, channelTitle: string, channelAvatar?: string) => {
    setSelectedChannel({ id: channelId, title: channelTitle, avatar: channelAvatar });
    setPrevTab(activeTab);
    setActiveTab('channel');
  };

  const handleRefreshFeed = async () => {
    try {
      setIsRefreshingFeed(true);
      const res = await fetch('/api/trending?category=all');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
        }
      }
    } catch (err) {
      console.error('Failed to refresh feed:', err);
    } finally {
      setIsRefreshingFeed(false);
    }
  };

  // Subscriptions chronological feed from subscribed channels
  const [subscriptionVideos, setSubscriptionVideos] = useState<Video[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState<boolean>(false);

  const loadSubsFeed = React.useCallback(async () => {
    const subscribed = channels.filter(c => c.isSubscribed);
    if (subscribed.length === 0) {
      setSubscriptionVideos([]);
      return;
    }
    try {
      setIsLoadingSubscriptions(true);
      const res = await fetch('/api/subscriptions-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: subscribed.map(c => ({ id: c.id, name: c.name })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos)) {
          setSubscriptionVideos(data.videos);
        }
      }
    } catch (err) {
      console.error('Subscriptions feed error:', err);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  }, [channels]);

  useEffect(() => {
    loadSubsFeed();
  }, [loadSubsFeed]);

  const handleUpdateChannelNotification = (channelId: string, level: 'all' | 'personalized' | 'none') => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, notificationLevel: level } : c));
  };

  const handleUpdateChannelGroup = (channelId: string, group: string) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, group } : c));
  };

  const handleNotInterested = (videoId: string, category?: string) => {
    recommendationEngine.markNotInterested(videoId, category);
    setVideos(prev => prev.filter(v => v.id !== videoId));
  };

  const handleBlockChannel = (channelId: string, channelTitle: string) => {
    recommendationEngine.blockChannel(channelId, channelTitle);
    setVideos(prev => prev.filter(v => v.channelId !== channelId && v.channelTitle !== channelTitle));
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'oled' : prev === 'oled' ? 'light' : 'dark'));
  };

  const handleSelectVideo = (video: Video) => {
    if (!isIncognito) {
      recommendationEngine.recordWatch(video);
      
      // Add to history store at top with progress
      const updatedVideo: Video = {
        ...video,
        watchedProgress: video.watchedProgress ? Math.min(100, Math.max(10, video.watchedProgress)) : 10,
      };

      setHistoryVideos(prev => {
        const filtered = prev.filter(v => v.id !== video.id);
        return [updatedVideo, ...filtered];
      });

      setVideos(prev => prev.map(v => {
        if (v.id === video.id) {
          return { ...v, watchedProgress: updatedVideo.watchedProgress };
        }
        return v;
      }));

      setActiveVideo(updatedVideo);
    } else {
      setActiveVideo(video);
    }

    setIsPlayerMini(false);
    setPrevTab(activeTab);
    setActiveTab('watch');
  };

  const handleUpdateProgress = (videoId: string, progress: number) => {
    if (!isIncognito) {
      setHistoryVideos(prev => prev.map(v => v.id === videoId ? { ...v, watchedProgress: progress } : v));
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, watchedProgress: progress } : v));
    }
    if (activeVideo && activeVideo.id === videoId) {
      setActiveVideo(prev => prev ? { ...prev, watchedProgress: progress } : null);
    }
  };

  const handleToggleLike = (target: Video | string) => {
    const videoId = typeof target === 'string' ? target : target.id;
    const isCurrentlyLiked = likedVideos.some(v => v.id === videoId);
    
    let resolvedVideo: Video | undefined = typeof target !== 'string' ? target : undefined;
    if (!resolvedVideo) {
      resolvedVideo = allCatalogVideos.find(v => v.id === videoId) || videos.find(v => v.id === videoId);
    }

    if (isCurrentlyLiked) {
      // Remove from liked videos
      setLikedVideos(prev => prev.filter(v => v.id !== videoId));
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, isFavorite: false } : v));
      if (activeVideo && activeVideo.id === videoId) {
        setActiveVideo(prev => prev ? { ...prev, isFavorite: false } : null);
      }
    } else if (resolvedVideo) {
      // Add to liked videos
      const newLiked: Video = { ...resolvedVideo, isFavorite: true };
      recommendationEngine.recordLike(newLiked);
      setLikedVideos(prev => [newLiked, ...prev.filter(v => v.id !== videoId)]);
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, isFavorite: true } : v));
      if (activeVideo && activeVideo.id === videoId) {
        setActiveVideo(prev => prev ? { ...prev, isFavorite: true } : null);
      }
    }

    // Sync 'favorites' playlist
    setPlaylists(plPrev => plPrev.map(pl => {
      if (pl.id === 'favorites') {
        const videoIds = !isCurrentlyLiked
          ? [...new Set([...pl.videoIds, videoId])]
          : pl.videoIds.filter(id => id !== videoId);
        return { ...pl, videoIds, videoCount: videoIds.length };
      }
      return pl;
    }));
  };

  const handleToggleFavorite = (videoId: string) => {
    handleToggleLike(videoId);
  };

  const handleToggleWatchLater = (target: Video | string) => {
    const videoId = typeof target === 'string' ? target : target.id;
    const isCurrentlyInWatchLater = watchLaterVideos.some(v => v.id === videoId);

    let resolvedVideo: Video | undefined = typeof target !== 'string' ? target : undefined;
    if (!resolvedVideo) {
      resolvedVideo = allCatalogVideos.find(v => v.id === videoId) || videos.find(v => v.id === videoId);
    }

    if (isCurrentlyInWatchLater) {
      // Remove from watch later
      setWatchLaterVideos(prev => prev.filter(v => v.id !== videoId));
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, inWatchLater: false } : v));
      if (activeVideo && activeVideo.id === videoId) {
        setActiveVideo(prev => prev ? { ...prev, inWatchLater: false } : null);
      }
    } else if (resolvedVideo) {
      // Add to watch later
      const newWatchLater: Video = { ...resolvedVideo, inWatchLater: true };
      setWatchLaterVideos(prev => [newWatchLater, ...prev.filter(v => v.id !== videoId)]);
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, inWatchLater: true } : v));
      if (activeVideo && activeVideo.id === videoId) {
        setActiveVideo(prev => prev ? { ...prev, inWatchLater: true } : null);
      }
    }

    // Sync 'watch-later' playlist
    setPlaylists(plPrev => plPrev.map(pl => {
      if (pl.id === 'watch-later') {
        const videoIds = !isCurrentlyInWatchLater 
          ? [...new Set([...pl.videoIds, videoId])]
          : pl.videoIds.filter(id => id !== videoId);
        return { ...pl, videoIds, videoCount: videoIds.length };
      }
      return pl;
    }));
  };

  const handleToggleSubscribe = (channelId: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        return { ...c, isSubscribed: !c.isSubscribed };
      }
      return c;
    }));
  };

  const handleRemoveFromHistory = (videoId: string) => {
    setHistoryVideos(prev => prev.filter(v => v.id !== videoId));
    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        return { ...v, watchedProgress: 0 };
      }
      return v;
    }));
  };

  const handleClearHistory = () => {
    setHistoryVideos([]);
    setVideos(prev => prev.map(v => ({ ...v, watchedProgress: 0 })));
  };

  const handleCreatePlaylist = (title: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      videoCount: 0,
      thumbnail: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
      updatedAt: 'Created just now',
      videoIds: [],
    };
    setPlaylists([newPl, ...playlists]);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const handleImportChannels = (newChannels: Channel[]) => {
    setChannels(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const filtered = newChannels.filter(c => !existingIds.has(c.id));
      const updated = [...prev, ...filtered];
      try {
        localStorage.setItem('freetube_channels_v3', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setVideos(SAMPLE_VIDEOS);
    setHistoryVideos([]);
    setLikedVideos([]);
    setWatchLaterVideos([]);
    setChannels(SAMPLE_CHANNELS);
    setPlaylists(SAMPLE_PLAYLISTS);
    setActiveVideo(null);
    setIsPlayerMini(false);
    setActiveTab('dashboard');
  };

  const unreadCount = channels.filter(c => c.isSubscribed && c.hasUnread).length;

  // Theme container classes
  const themeClasses = 
    theme === 'oled' ? 'bg-black text-slate-100' :
    theme === 'light' ? 'bg-slate-100 text-slate-900' :
    'bg-[#0a0d14] text-slate-100';

  return (
    <div 
      id="freetube-app-root" 
      className={`min-h-screen ${themeClasses} flex flex-col font-sans transition-colors duration-300 relative`}
      style={{
        filter: brightness < 1.0 ? `brightness(${brightness})` : undefined,
      }}
    >
      {/* Eye Comfort Ambient Warm Screen Filter */}
      {eyeComfort && (
        <div className="fixed inset-0 pointer-events-none z-[100] bg-amber-500/[0.08] mix-blend-color-burn" />
      )}

      {/* Top Header with live autocomplete search & profile avatar */}
      <Header 
        onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(q) => {
          setSearchQuery(q);
          handleExecuteSearch(q);
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeVideoId={activeTab === 'watch' ? activeVideo?.id : null}
        onBack={() => {
          setIsPlayerMini(true);
          setActiveTab(prevTab || 'dashboard');
        }}
        onOpenQuickSettings={() => setIsQuickSettingsOpen(true)}
        onOpenSearchFilters={() => setIsSearchFilterModalOpen(true)}
        hasActiveFilters={hasActiveFilters}
        isIncognito={isIncognito}
        onOpenDownloadApk={() => setIsDownloadApkOpen(true)}
      />

      {/* Main Layout Container with Sidebar for Desktop & Viewport for Mobile */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Navigation Drawer / Sidebar */}
        <NavigationDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab !== 'watch' && activeVideo && activeTab === 'watch') {
              setIsPlayerMini(true);
            }
            setActiveTab(tab);
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          unreadChannelsCount={unreadCount}
          onOpenDownloadApk={() => setIsDownloadApkOpen(true)}
          onOpenImportExport={() => setIsImportExportOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:ml-72 transition-all">
          {/* Watch Video View */}
          {activeTab === 'watch' && activeVideo && !isPlayerMini && (
            <VideoPlayer
              video={activeVideo}
              onClose={() => {
                setActiveVideo(null);
                setActiveTab(prevTab || 'dashboard');
              }}
              onMinimize={() => {
                setIsPlayerMini(true);
                setActiveTab(prevTab || 'dashboard');
              }}
              onToggleFavorite={handleToggleFavorite}
              onToggleLike={handleToggleLike}
              isLiked={likedVideos.some(v => v.id === activeVideo.id)}
              onToggleWatchLater={handleToggleWatchLater}
              inWatchLater={watchLaterVideos.some(v => v.id === activeVideo.id)}
              onUpdateProgress={handleUpdateProgress}
              onToggleSubscribe={handleToggleSubscribe}
              isSubscribed={channels.find(c => c.id === activeVideo.channelId)?.isSubscribed}
              onSelectRelatedVideo={handleSelectVideo}
              relatedVideos={allCatalogVideos}
              onOpenChannel={handleOpenChannel}
              onOpenDownload={(v) => {
                setMediaDownloadVideo(v);
                setIsMediaDownloadOpen(true);
              }}
              hideComments={freeTubePrefs.hideComments}
              hideRelated={freeTubePrefs.hideRelated}
              hideDislikes={freeTubePrefs.hideDislikes}
              hideViews={freeTubePrefs.hideViews}
            />
          )}

          {/* Home / Feeds Dashboard */}
          {activeTab === 'dashboard' && (
            <DashboardView 
              videos={videos.filter(v => v && !recommendationEngine.isVideoHidden(v.id) && !recommendationEngine.isChannelBlocked(v.channelId, v.channelTitle))}
              onSelectVideo={handleSelectVideo}
              onToggleFavorite={handleToggleFavorite}
              onToggleWatchLater={handleToggleWatchLater}
              searchFilter={searchQuery}
              onSelectCategory={handleSelectCategory}
              isLoading={isLoadingVideos}
              onClearSearch={handleClearSearch}
              isSearchActive={isSearchActive}
              watchLaterVideos={watchLaterVideos}
              onOpenWatchLaterCarousel={() => setActiveTab('watchLater')}
              onOpenExplore={() => setActiveTab('trending')}
              onOpenChannel={handleOpenChannel}
              onRefresh={handleRefreshFeed}
              isRefreshing={isRefreshingFeed}
              onNotInterested={handleNotInterested}
              onBlockChannel={handleBlockChannel}
              theme={theme}
            />
          )}

          {/* Dedicated Full Search View */}
          {activeTab === 'search' && (
            <SearchView
              query={searchQuery}
              videos={videos}
              channels={searchChannels}
              isLoading={isLoadingVideos}
              onSelectVideo={handleSelectVideo}
              onOpenChannel={handleOpenChannel}
              onSearchChange={setSearchQuery}
              onSearchSubmit={(q) => handleExecuteSearch(q)}
              onOpenFilters={() => setIsSearchFilterModalOpen(true)}
              hasActiveFilters={hasActiveFilters}
              onBack={() => {
                setActiveTab(prevTab && prevTab !== 'search' ? prevTab : 'dashboard');
              }}
              theme={theme}
            />
          )}

          {/* Profile View ("You" tab matching Screenshot 2) */}
          {activeTab === 'profile' && (
            <ProfileView
              historyVideos={historyVideos}
              likedVideos={likedVideos}
              watchLaterVideos={watchLaterVideos}
              playlists={playlists}
              onSelectVideo={handleSelectVideo}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenSearch={() => {
                setActiveTab('dashboard');
                // Auto focus search
                const input = document.getElementById('freetube-search-input') as HTMLInputElement;
                input?.focus();
              }}
              onOpenWatchLaterCarousel={() => setActiveTab('watchLater')}
              onRemoveFromHistory={handleRemoveFromHistory}
              onRemoveFromWatchLater={handleToggleWatchLater}
              onSaveToWatchLater={(v) => handleToggleWatchLater(v.id)}
              isIncognito={isIncognito}
              onToggleIncognito={handleToggleIncognito}
            />
          )}

          {/* Watch Later 3D Smooth Round Carousel View */}
          {activeTab === 'watchLater' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] active:scale-95 transition-all"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Profile</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold">
                  <Clock size={14} />
                  <span>{watchLaterVideos.length} saved</span>
                </div>
              </div>

              <WatchLaterCarousel 
                videos={watchLaterVideos}
                onSelectVideo={handleSelectVideo}
                onRemoveFromWatchLater={handleToggleWatchLater}
              />
            </div>
          )}

          {/* Subscriptions View */}
          {activeTab === 'subscriptions' && (
            <SubscriptionsView 
              videos={subscriptionVideos.length > 0 ? subscriptionVideos : videos}
              channels={channels}
              isLoading={isLoadingSubscriptions}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={(ch) => handleOpenChannel(ch.id, ch.name, ch.avatar)}
              onToggleSubscribe={handleToggleSubscribe}
              onUpdateChannelNotification={handleUpdateChannelNotification}
              onUpdateChannelGroup={handleUpdateChannelGroup}
              onRefreshSubscriptions={loadSubsFeed}
              onExploreVideos={() => setActiveTab('dashboard')}
              onOpenImportExport={() => setIsImportExportOpen(true)}
            />
          )}

          {/* Playlists View */}
          {activeTab === 'playlists' && (
            <PlaylistsView 
              playlists={playlists}
              videos={allCatalogVideos}
              onSelectVideo={handleSelectVideo}
              onCreatePlaylist={handleCreatePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
            />
          )}

          {/* History View */}
          {activeTab === 'history' && (
            <HistoryView 
              historyVideos={historyVideos}
              onSelectVideo={handleSelectVideo}
              onRemoveFromHistory={handleRemoveFromHistory}
              onClearHistory={handleClearHistory}
              onToggleFavorite={handleToggleFavorite}
              onSaveToWatchLater={(v) => handleToggleWatchLater(v.id)}
            />
          )}

          {/* Channels View */}
          {activeTab === 'channels' && (
            <ChannelsView 
              channels={channels}
              onToggleSubscribe={handleToggleSubscribe}
              onSelectChannel={(ch) => handleOpenChannel(ch.id, ch.name, ch.avatar)}
            />
          )}

          {/* Channel Detail View */}
          {activeTab === 'channel' && selectedChannel && (
            <ChannelDetailView
              channelId={selectedChannel.id}
              channelTitle={selectedChannel.title}
              channelAvatar={selectedChannel.avatar}
              onBack={() => {
                setActiveTab(prevTab && prevTab !== 'channel' ? prevTab : 'dashboard');
              }}
              onSelectVideo={handleSelectVideo}
              isSubscribed={channels.find(c => c.id === selectedChannel.id || c.name === selectedChannel.title)?.isSubscribed || false}
              onToggleSubscribe={handleToggleSubscribe}
              theme={theme}
            />
          )}

          {/* Explore / Trending Hub */}
          {activeTab === 'trending' && (
            <TrendingView 
              videos={videos}
              onSelectVideo={handleSelectVideo}
              onToggleWatchLater={handleToggleWatchLater}
              onToggleFavorite={handleToggleFavorite}
              onOpenChannel={handleOpenChannel}
              onNotInterested={handleNotInterested}
              onBlockChannel={handleBlockChannel}
              theme={theme}
            />
          )}

          {/* Vintora Agent View (Liquid Glass AI Companion) */}
          {activeTab === 'vintora' && (
            <VintoraAgentView 
              onPlayVideo={handleSelectVideo}
              onNavigateTab={(tab) => setActiveTab(tab)}
              theme={theme}
              onToggleTheme={(t) => {
                if (t) setTheme(t);
                else handleToggleTheme();
              }}
              onAddToWatchLater={(v) => handleToggleWatchLater(v.id)}
              onAddToLiked={(v) => handleToggleLike(v.id)}
              historyVideos={historyVideos}
              likedVideos={likedVideos}
              watchLaterVideos={watchLaterVideos}
              subscriptionsCount={channels.filter(c => c.isSubscribed).length}
            />
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <SettingsView 
              theme={theme}
              onSelectTheme={setTheme}
              onClearAllData={handleClearAllData}
              onOpenDownloadApk={() => setIsDownloadApkOpen(true)}
              onOpenImportExport={() => setIsImportExportOpen(true)}
              preferences={freeTubePrefs}
              onUpdatePreferences={(p) => setFreeTubePrefs(prev => ({ ...prev, ...p }))}
            />
          )}

          {/* About View */}
          {activeTab === 'about' && (
            <AboutView 
              onOpenDownloadApk={() => setIsDownloadApkOpen(true)}
              onOpenImportExport={() => setIsImportExportOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Floating Mini Player */}
      {isPlayerMini && activeVideo && (
        <VideoPlayer
          video={activeVideo}
          isMini={true}
          onClose={() => {
            setActiveVideo(null);
            setIsPlayerMini(false);
          }}
          onRestoreFromMini={() => {
            setIsPlayerMini(false);
            setActiveTab('watch');
          }}
          onToggleLike={handleToggleLike}
          isLiked={likedVideos.some(v => v.id === activeVideo.id)}
          onToggleWatchLater={handleToggleWatchLater}
          inWatchLater={watchLaterVideos.some(v => v.id === activeVideo.id)}
          onUpdateProgress={handleUpdateProgress}
          relatedVideos={allCatalogVideos}
          onOpenDownload={(v) => {
            setMediaDownloadVideo(v);
            setIsMediaDownloadOpen(true);
          }}
          hideComments={freeTubePrefs.hideComments}
          hideRelated={freeTubePrefs.hideRelated}
          hideDislikes={freeTubePrefs.hideDislikes}
          hideViews={freeTubePrefs.hideViews}
        />
      )}

      {/* Bottom Navigation for Mobile Devices (Matching Screenshot 2: Home, Shorts, (+), Subs, You) */}
      {activeTab !== 'watch' && (
        <BottomNav 
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (activeTab === 'watch' && activeVideo) {
              setIsPlayerMini(true);
            }
            setActiveTab(tab);
          }}
          unreadSubsCount={unreadCount}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          theme={theme}
        />
      )}

      {/* Quick Settings Panel (Matching Screenshot 1 & Phone UI) */}
      <QuickSettingsPanel
        isOpen={isQuickSettingsOpen}
        onClose={() => setIsQuickSettingsOpen(false)}
        activeVideo={activeVideo}
        isPlaying={!!activeVideo}
        onTogglePlay={() => {
          if (activeVideo) {
            // toggle
          }
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        volume={volume}
        onVolumeChange={setVolume}
        brightness={brightness}
        onBrightnessChange={setBrightness}
        eyeComfort={eyeComfort}
        onToggleEyeComfort={() => setEyeComfort(!eyeComfort)}
        ambientGlow={ambientGlow}
        onToggleAmbientGlow={() => setAmbientGlow(!ambientGlow)}
        sleepTimer={sleepTimer}
        onSetSleepTimer={setSleepTimer}
        loopVideo={loopVideo}
        onToggleLoop={() => setLoopVideo(!loopVideo)}
        audioOnly={audioOnly}
        onToggleAudioOnly={() => setAudioOnly(!audioOnly)}
      />

      {/* Quick Action Modal for (+) Button */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onPlayUrl={(url) => handleExecuteSearch(url)}
        onCreatePlaylist={handleCreatePlaylist}
      />

      {/* FreeTube Android APK Download Modal */}
      <DownloadApkModal
        isOpen={isDownloadApkOpen}
        onClose={() => setIsDownloadApkOpen(false)}
      />

      {/* FreeTube Video & Audio Downloader Modal */}
      <MediaDownloadModal
        isOpen={isMediaDownloadOpen}
        onClose={() => setIsMediaDownloadOpen(false)}
        video={mediaDownloadVideo || activeVideo}
      />

      {/* FreeTube Subscription Backup, Import & Export Modal */}
      <SubscriptionImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        channels={channels}
        onImportChannels={handleImportChannels}
      />

      {/* Real YouTube Search Filter Modal */}
      <SearchFilterModal
        isOpen={isSearchFilterModalOpen}
        onClose={() => setIsSearchFilterModalOpen(false)}
        filters={searchFilters}
        onApplyFilters={(newFilters) => {
          setSearchFilters(newFilters);
          handleExecuteSearch(searchQuery || 'Trending', newFilters);
        }}
        theme={theme}
      />
    </div>
  );
}
