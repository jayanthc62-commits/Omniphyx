import { Video } from '../types';

interface Affinities {
  categories: Record<string, number>;
  creators: Record<string, number>;
  keywords: Record<string, number>;
}

const STORAGE_KEY_AFFINITIES = 'freetube_affinities_v1';
const STORAGE_KEY_HIDDEN = 'freetube_hidden_videos_v1';
const STORAGE_KEY_BLOCKED = 'freetube_blocked_channels_v1';

class RecommendationEngine {
  private affinities: Affinities = {
    categories: { Trending: 5, Tech: 4, Comedy: 3, Music: 5 },
    creators: {},
    keywords: {},
  };
  private hiddenVideoIds: Set<string> = new Set();
  private blockedChannels: Set<string> = new Set();
  private recentSearches: string[] = [];
  private refreshSeed: number = 0;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const aff = localStorage.getItem(STORAGE_KEY_AFFINITIES);
      if (aff) this.affinities = JSON.parse(aff);

      const hid = localStorage.getItem(STORAGE_KEY_HIDDEN);
      if (hid) this.hiddenVideoIds = new Set(JSON.parse(hid));

      const blk = localStorage.getItem(STORAGE_KEY_BLOCKED);
      if (blk) this.blockedChannels = new Set(JSON.parse(blk));

      const s = localStorage.getItem('freetube_searches_v1');
      if (s) this.recentSearches = JSON.parse(s);
    } catch (e) {
      console.warn('Could not load recommendation data from storage:', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_AFFINITIES, JSON.stringify(this.affinities));
      localStorage.setItem(STORAGE_KEY_HIDDEN, JSON.stringify(Array.from(this.hiddenVideoIds)));
      localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(Array.from(this.blockedChannels)));
      localStorage.setItem('freetube_searches_v1', JSON.stringify(this.recentSearches.slice(0, 15)));
    } catch (e) {
      console.warn('Could not save recommendation data to storage:', e);
    }
  }

  private extractKeywords(text: string): string[] {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['with', 'from', 'this', 'that', 'have', 'what', 'your', 'video', 'full'].includes(w));
  }

  public recordWatch(video: Video) {
    if (!video) return;
    const cat = video.category || 'Trending';
    this.affinities.categories[cat] = (this.affinities.categories[cat] || 0) + 4;

    if (video.channelTitle) {
      this.affinities.creators[video.channelTitle] = (this.affinities.creators[video.channelTitle] || 0) + 5;
    }

    const words = this.extractKeywords(video.title);
    for (const word of words.slice(0, 6)) {
      this.affinities.keywords[word] = (this.affinities.keywords[word] || 0) + 2;
    }

    this.saveToStorage();
  }

  public recordLike(video: Video) {
    if (!video) return;
    const cat = video.category || 'Trending';
    this.affinities.categories[cat] = (this.affinities.categories[cat] || 0) + 8;

    if (video.channelTitle) {
      this.affinities.creators[video.channelTitle] = (this.affinities.creators[video.channelTitle] || 0) + 8;
    }

    const words = this.extractKeywords(video.title);
    for (const word of words.slice(0, 6)) {
      this.affinities.keywords[word] = (this.affinities.keywords[word] || 0) + 4;
    }

    this.saveToStorage();
  }

  public recordSearch(query: string) {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    this.recentSearches = [clean, ...this.recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 15);
    const words = this.extractKeywords(clean);
    for (const word of words) {
      this.affinities.keywords[word] = (this.affinities.keywords[word] || 0) + 4;
    }
    this.saveToStorage();
  }

  public getPersonalizedQueries(): string[] {
    this.refreshSeed += 1;
    const queries: string[] = [];

    // 1. Most recent search query
    if (this.recentSearches.length > 0) {
      queries.push(this.recentSearches[0]);
    }

    // 2. Top creator
    const topCreators = Object.entries(this.affinities.creators)
      .filter(([name, score]) => score > 0 && !this.blockedChannels.has(name.toLowerCase()))
      .sort((a, b) => b[1] - a[1]);
    if (topCreators.length > 0) {
      const idx = (this.refreshSeed) % topCreators.length;
      queries.push(`${topCreators[idx][0]} songs`);
    }

    // 3. Top category or second search
    if (this.recentSearches.length > 1) {
      queries.push(this.recentSearches[1]);
    } else {
      const topCats = Object.entries(this.affinities.categories).sort((a, b) => b[1] - a[1]);
      if (topCats.length > 0) {
        queries.push(`${topCats[0][0]} viral 2026`);
      }
    }

    // 4. Rotating discovery pools so refresh ALWAYS returns different videos
    const discoveryPools = [
      'Trending Music Hits',
      'Viral Videos Worldwide',
      'Tech Breakthroughs AI',
      'Trending Movie Clips 2026',
      'Top Gaming Highlights',
      'Latest Hit Songs'
    ];
    queries.push(discoveryPools[this.refreshSeed % discoveryPools.length]);

    return queries;
  }

  public markNotInterested(videoId: string, category?: string) {
    this.hiddenVideoIds.add(videoId);
    if (category && this.affinities.categories[category]) {
      this.affinities.categories[category] = Math.max(0, this.affinities.categories[category] - 4);
    }
    this.saveToStorage();
  }

  public blockChannel(channelId: string, channelTitle: string) {
    if (channelTitle) this.blockedChannels.add(channelTitle.toLowerCase());
    if (channelId) this.blockedChannels.add(channelId.toLowerCase());
    if (channelTitle && this.affinities.creators[channelTitle]) {
      this.affinities.creators[channelTitle] = -999;
    }
    this.saveToStorage();
  }

  public isVideoHidden(videoId: string): boolean {
    return this.hiddenVideoIds.has(videoId);
  }

  public isChannelBlocked(channelId: string, channelTitle: string): boolean {
    if (channelTitle && this.blockedChannels.has(channelTitle.toLowerCase())) return true;
    if (channelId && this.blockedChannels.has(channelId.toLowerCase())) return true;
    return false;
  }

  public rankVideos(videos: Video[], subscribedChannelIds: string[] = []): Video[] {
    const subscribedSet = new Set(subscribedChannelIds);

    // 1. Filter out hidden videos and blocked channels
    const allowed = videos.filter(v => {
      if (this.isVideoHidden(v.id)) return false;
      if (this.isChannelBlocked(v.channelId, v.channelTitle)) return false;
      return true;
    });

    // 2. Score each candidate video
    const scored = allowed.map(v => {
      let score = 0;

      // Category affinity
      const catScore = this.affinities.categories[v.category] || 0;
      score += catScore * 2.5;

      // Creator affinity
      const creatorScore = this.affinities.creators[v.channelTitle] || 0;
      score += creatorScore * 3.5;

      // Subscribed channel boost
      if (subscribedSet.has(v.channelId) || subscribedSet.has(v.channelTitle)) {
        score += 15;
      }

      // Keyword match
      const words = this.extractKeywords(v.title);
      for (const w of words) {
        if (this.affinities.keywords[w]) {
          score += this.affinities.keywords[w] * 1.2;
        }
      }

      // Velocity/views normalization factor (slight bias towards popular videos)
      if (v.views > 0) {
        score += Math.log10(v.views) * 1.5;
      }

      // Small pseudo-randomness for serendipity (so feed is not 100% deterministic)
      const serendipity = (Math.sin(v.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) + 1) * 2;
      score += serendipity;

      return { video: v, score };
    });

    // 3. Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.map(s => s.video);
  }

  public getTopAffinities(): { category: string; count: number }[] {
    return Object.entries(this.affinities.categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
  }
}

export const recommendationEngine = new RecommendationEngine();
