import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Search, X, Mic, SlidersHorizontal, 
  Moon, Sun, Clock, ArrowUpRight, ArrowLeft
} from 'lucide-react';
import { ThemeMode, ViewTab } from '../types';

interface HeaderProps {
  onToggleDrawer: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  activeVideoId?: string | null;
  onBack?: () => void;
  onOpenQuickSettings?: () => void;
  onHomeClick?: () => void;
}

const SEARCH_SUGGESTIONS = [
  'Tmkoc 1291 episode',
  'Taarak Mehta Ka Ooltah Chashmah Full Movie',
  'Popatlal marriage episode 1291',
  'Clean Architecture Android Kotlin',
  'The Future of Open Source Media Players',
  'Day In My Life Studio Vlog',
  'TMKOC Sweety scam compilation',
  'Gokuldham society comedy scenes',
];

export const Header: React.FC<HeaderProps> = ({
  onToggleDrawer,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  theme,
  onToggleTheme,
  activeTab,
  onSelectTab,
  activeVideoId,
  onBack,
  onOpenQuickSettings,
  onHomeClick,
}) => {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Tmkoc 1291 episode',
    'TMKOC Movies',
    'Android Kotlin Compose',
  ]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch live autocomplete suggestions as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.suggestions)) {
            setLiveSuggestions(data.suggestions.slice(0, 7));
          }
        }
      } catch (err) {
        // Fallback silently
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (!recentSearches.includes(trimmed)) {
      setRecentSearches([trimmed, ...recentSearches.slice(0, 4)]);
    }
    onSearchSubmit(trimmed);
    setShowSearchDropdown(false);
  };

  const handleVoiceSearch = () => {
    setIsVoiceActive(true);
    setTimeout(() => {
      const randomQuery = 'Tmkoc 1291 episode';
      onSearchChange(randomQuery);
      handleSubmit(randomQuery);
      setIsVoiceActive(false);
    }, 1500);
  };

  const handleRemoveRecent = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(recentSearches.filter(s => s !== item));
  };

  const handleBrandClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      onSelectTab('dashboard');
    }
  };

  const isLight = theme === 'light';

  return (
    <header 
      id="freetube-main-header"
      className={`sticky top-0 left-0 right-0 h-16 border-b backdrop-blur-2xl z-30 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none transition-colors duration-300 ${
        isLight 
          ? 'bg-white/85 border-slate-200 shadow-sm text-slate-900' 
          : 'bg-slate-950/70 dark:bg-[#060911]/70 border-white/[0.08] shadow-lg shadow-black/20 text-slate-100'
      }`}
    >
      {/* Left: Drawer Hamburger & Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {activeVideoId && onBack ? (
          <button
            id="header-back-btn"
            onClick={onBack}
            className="p-2.5 rounded-2xl text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] active:scale-95 transition-all duration-200"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <button
            id="header-drawer-toggle-btn"
            onClick={onToggleDrawer}
            className="p-2.5 rounded-2xl text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] active:scale-95 transition-all duration-200"
            title="Open Menu"
          >
            <Menu size={18} />
          </button>
        )}

        <div 
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Go to Home"
        >
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-red-600/30 group-hover:scale-105 group-active:scale-95 transition-all duration-200 border border-white/20">
            FT
          </div>
          <span className="hidden sm:inline font-bold text-base text-slate-100 tracking-tight">
            Free<span className="text-red-500">Tube</span>
          </span>
        </div>
      </div>

      {/* Center: Wide Search Bar with Glassmorphism & Embedded Quick Filter */}
      <div 
        ref={searchContainerRef}
        className="flex-1 max-w-3xl relative mx-1 sm:mx-4"
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(searchQuery);
          }}
          className="relative flex items-center"
        >
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Search size={15} />
          </div>

          <input
            ref={searchInputRef}
            id="freetube-search-input"
            type="text"
            placeholder="Search videos, channels, or paste URL..."
            value={searchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full h-10 pl-10 pr-24 rounded-2xl text-xs sm:text-sm outline-none backdrop-blur-xl transition-all duration-200 shadow-inner ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-300/80 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 text-slate-900 placeholder-slate-500'
                : 'bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.16] focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 text-slate-100 placeholder-slate-400'
            }`}
          />

          <div className="absolute right-2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                id="search-clear-btn"
                onClick={() => {
                  onSearchChange('');
                  searchInputRef.current?.focus();
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] active:scale-90 transition-all"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}

            <button
              type="button"
              id="search-mic-btn"
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-xl transition-all active:scale-90 ${
                isVoiceActive 
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.08]'
              }`}
              title="Voice search"
            >
              <Mic size={14} />
            </button>

            {onOpenQuickSettings && (
              <button
                type="button"
                id="search-filter-btn"
                onClick={onOpenQuickSettings}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] active:scale-90 transition-all"
                title="Filters & Quick Controls"
              >
                <SlidersHorizontal size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Dropdown Suggestions */}
        {showSearchDropdown && (
          <div className="absolute top-12 left-0 right-0 bg-slate-950/85 border border-white/[0.12] rounded-3xl shadow-2xl p-2.5 z-50 text-xs text-slate-200 backdrop-blur-2xl animate-in fade-in duration-150">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-slate-400">
                  <span>Recent searches</span>
                  <button 
                    onClick={() => setRecentSearches([])}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    onClick={() => {
                      onSearchChange(term);
                      handleSubmit(term);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Clock size={14} className="text-slate-500" />
                      <span>{term}</span>
                    </div>
                    <button
                      onClick={(e) => handleRemoveRecent(term, e)}
                      className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Live or Trending Suggestions */}
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold text-slate-400">
                {liveSuggestions.length > 0 ? 'YouTube suggestions' : 'Popular suggestions'}
              </p>
              {(liveSuggestions.length > 0
                ? liveSuggestions
                : SEARCH_SUGGESTIONS.filter(s => !searchQuery || s.toLowerCase().includes(searchQuery.toLowerCase()))
              ).slice(0, 6).map((sug) => (
                <div
                  key={sug}
                  onClick={() => {
                    onSearchChange(sug);
                    handleSubmit(sug);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 cursor-pointer text-slate-300 hover:text-red-400 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Search size={14} className="text-slate-500 flex-shrink-0" />
                    <span className="truncate">{sug}</span>
                  </div>
                  <ArrowUpRight size={13} className="text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Action Icons & Profile Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Vintora Agent Liquid Glass Button */}
        <button
          id="header-vintora-btn"
          onClick={() => onSelectTab('vintora')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl transition-all duration-300 active:scale-95 border backdrop-blur-xl group ${
            activeTab === 'vintora'
              ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border-cyan-400 text-white shadow-lg shadow-cyan-950/40'
              : 'bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-pink-500/10 hover:from-cyan-500/20 hover:to-pink-500/20 border-cyan-500/30 hover:border-cyan-400 text-cyan-200 hover:text-white shadow-sm'
          }`}
          title="Vintora Agent"
        >
          <div className="w-4 h-4 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300 group-hover:rotate-12 transition-transform">
            <span className="text-[11px]">✨</span>
          </div>
          <span className="text-xs font-semibold hidden md:inline bg-gradient-to-r from-white via-cyan-100 to-pink-200 bg-clip-text text-transparent">
            Vintora
          </span>
        </button>

        {/* Profile Avatar Badge matching Screenshot 2 (Orange circle with 'G' for Gangamma) */}
        <div 
          id="header-profile-btn"
          onClick={() => onSelectTab('profile')}
          className="flex items-center pl-1 cursor-pointer group"
          title="You • Profile"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center text-[12px] font-bold text-white shadow-md shadow-orange-600/30 group-hover:scale-105 group-active:scale-95 transition-all duration-200 border border-white/20">
            G
          </div>
        </div>
      </div>
    </header>
  );
};
