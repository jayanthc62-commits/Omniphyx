export type ViewTab = 
  | 'dashboard' 
  | 'search'
  | 'vintora'
  | 'subscriptions' 
  | 'playlists' 
  | 'history' 
  | 'trending' 
  | 'channels' 
  | 'channel'
  | 'settings' 
  | 'about' 
  | 'watch'
  | 'profile'
  | 'watchLater';

export interface SeriesEpisodeData {
  isEpisodic: boolean;
  seriesTitle: string;
  currentEpisode: number;
  nextEpisodeNumber: number;
  prevEpisodeNumber: number | null;
  seasonNumber?: number;
  nextEpisode: Video | null;
  prevEpisode: Video | null;
  allEpisodes: Video[];
  sourceQuery?: string;
}

export type SubscriptionsTab = 'videos' | 'shorts' | 'live' | 'posts';

export type ThemeMode = 'dark' | 'light' | 'oled';

export interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
}

export interface Video {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  channelAvatar: string;
  subscriberCount: string;
  duration: string; // "21:15"
  durationSeconds: number;
  views: number;
  likes: number;
  publishedAt: string;
  thumbnail: string;
  videoUrl: string;
  description: string;
  watchedProgress?: number; // 0-100 percentage
  isFavorite?: boolean;
  inWatchLater?: boolean;
  isLive?: boolean;
  isShort?: boolean;
  category: 'All' | 'Trending' | 'Comedy' | 'Movies' | 'Lifestyle' | 'Music' | 'News';
  comments?: Comment[];
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  subscriberCount: string;
  videoCount: number;
  isSubscribed: boolean;
  verified?: boolean;
  hasUnread?: boolean;
  notificationLevel?: 'all' | 'personalized' | 'none';
  group?: string;
  isLive?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  videoCount: number;
  thumbnail: string;
  updatedAt: string;
  isSystem?: boolean;
  videoIds: string[];
}

export interface PlaybackSettings {
  quality: '1080p' | '720p' | '480p' | '360p' | 'Auto';
  speed: number;
  captions: boolean;
  loop: boolean;
  autoplay: boolean;
  audioOnly: boolean;
}

export interface SponsorBlockSegment {
  category: 'sponsor' | 'intro' | 'outro' | 'selfpromo' | 'interaction' | 'music_offtopic';
  actionType: 'skip' | 'mute';
  segment: [number, number];
  UUID?: string;
}

export interface RYDData {
  id: string;
  likes: number;
  dislikes: number;
  rating: number;
  viewCount: number;
}

export interface FreeTubePreferences {
  defaultQuality: '1080p' | '720p' | '480p' | 'Auto';
  bufferSize: string;
  sponsorBlockEnabled: boolean;
  sponsorCategories: {
    sponsor: boolean;
    intro: boolean;
    outro: boolean;
    selfpromo: boolean;
    interaction: boolean;
  };
  streamEngine: 'youtube' | 'invidious' | 'piped';
  invidiousInstance: string;
  pipedInstance: string;
  hideComments: boolean;
  hideRelated: boolean;
  hideDislikes: boolean;
  hideViews: boolean;
  saveHistory: boolean;
  subscriptionGroups: string[];
}

export type VintoraComplexityTier = 'Fast (Lite)' | 'General (Flash + Search)' | 'Complex (Pro Reasoning)';

export interface VintoraThoughtStep {
  title: string;
  detail: string;
  durationMs?: number;
}

export interface VintoraAction {
  type: 'PLAY_VIDEO' | 'SET_THEME' | 'NAVIGATE' | 'ADD_WATCH_LATER' | 'ADD_LIKED' | 'CREATE_PLAYLIST' | 'SEARCH_FEED';
  label: string;
  payload?: any;
}

export interface VintoraMessage {
  id: string;
  sender: 'user' | 'vintora';
  text: string;
  timestamp: string;
  modelUsed?: string;
  complexityTier?: VintoraComplexityTier;
  thoughts?: VintoraThoughtStep[];
  videos?: Video[];
  channelMatches?: {
    channelName: string;
    channelAvatar: string;
    video: Video;
    badge?: string;
  }[];
  actionExecuted?: VintoraAction;
  suggestedPrompts?: string[];
  uploadedImage?: string;
  generatedImages?: string[];
  imageConfig?: {
    aspectRatio?: string;
    resolution?: string;
    variationCount?: number;
  };
  identifiedSubject?: {
    name: string;
    type: 'celebrity' | 'character' | 'episode' | 'creator' | 'general';
    summary: string;
    knownFor?: string;
    role?: string;
  };
}
