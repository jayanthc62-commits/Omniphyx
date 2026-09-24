import React, { useState } from 'react';
import { 
  History, Search, Trash2, ArrowUpDown, 
  Play, CheckCircle2, Bookmark, Check, MoreVertical, Clock, Share2
} from 'lucide-react';
import { Video } from '../types';

interface HistoryViewProps {
  historyVideos: Video[];
  onSelectVideo: (video: Video) => void;
  onRemoveFromHistory: (id: string) => void;
  onClearHistory: () => void;
  onToggleFavorite: (id: string) => void;
  onSaveToWatchLater?: (video: Video) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyVideos,
  onSelectVideo,
  onRemoveFromHistory,
  onClearHistory,
  onToggleFavorite,
  onSaveToWatchLater,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'title'>('newest');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter based on search & case sensitivity
  let filtered = historyVideos.filter(v => {
    if (!searchTerm) return true;
    if (caseSensitive) {
      return v.title.includes(searchTerm) || v.channelTitle.includes(searchTerm);
    }
    return v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           v.channelTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'oldest') return (a.watchedProgress || 0) - (b.watchedProgress || 0);
    return (b.watchedProgress || 0) - (a.watchedProgress || 0); // newest / recently watched
  });

  return (
    <div id="freetube-history-view" className="space-y-6 pb-20">
      {/* View Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <History size={22} className="text-red-500" />
            Watch History
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Locally stored on your device — never tracked or sent to any server
          </p>
        </div>

        {historyVideos.length > 0 && (
          <button
            id="clear-history-btn"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/90 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700/80 hover:border-red-500/40 rounded-full text-xs font-semibold self-start sm:self-auto transition-all"
          >
            <Trash2 size={15} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search & Sort Filter Card */}
      <div className="p-4 bg-slate-900/90 border border-slate-800/80 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* History Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Search in history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <ArrowUpDown size={14} className="text-red-400" />
              <select
                id="history-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-100 outline-none font-medium cursor-pointer"
              >
                <option value="newest" className="bg-slate-900">Date Watched (Newest)</option>
                <option value="oldest" className="bg-slate-900">Date Watched (Oldest)</option>
                <option value="views" className="bg-slate-900">Most Viewed</option>
                <option value="title" className="bg-slate-900">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Case Sensitive Switch */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            id="case-sensitive-toggle"
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              caseSensitive ? 'bg-red-600' : 'bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${caseSensitive ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
          <span className="text-xs text-slate-400">Case Sensitive Search</span>
        </div>
      </div>

      {/* Videos List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-6">
          <p className="text-sm font-semibold text-slate-300">No watch history found</p>
          <p className="text-xs text-slate-500 mt-1">Videos you watch will appear here locally with progress tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((video) => (
            <div
              key={video.id}
              id={`history-item-${video.id}`}
              onClick={() => onSelectVideo(video)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900/95 border border-slate-800/70 hover:border-slate-700 cursor-pointer transition-all duration-200 group"
            >
              <div className="flex gap-3 min-w-0">
                <div className="relative w-36 sm:w-44 aspect-video bg-black rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/85 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-white">
                    {video.duration}
                  </span>
                  {video.watchedProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                      <div className="bg-red-500 h-full" style={{ width: `${video.watchedProgress}%` }} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 truncate flex items-center gap-1">
                    {video.channelTitle}
                    <CheckCircle2 size={12} className="text-slate-500" />
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {video.views.toLocaleString()} views • {video.watchedProgress ? `${video.watchedProgress}% watched` : 'Watched'}
                  </p>
                </div>
              </div>

              {/* Actions on Item */}
              <div className="flex items-center gap-1 self-end sm:self-auto pt-1 sm:pt-0 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(video.id);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                  title={video.isFavorite ? 'Saved to Favorites' : 'Bookmark'}
                >
                  <Bookmark size={16} className={video.isFavorite ? 'fill-amber-400 text-amber-400' : ''} />
                </button>

                <div className="relative">
                  <button
                    id={`history-item-menu-${video.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === video.id ? null : video.id);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Options"
                  >
                    <MoreVertical size={16} />
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
                        className="absolute right-0 top-8 w-48 bg-slate-900/95 border border-white/[0.12] rounded-2xl shadow-2xl p-1.5 z-50 text-xs backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
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
                            onRemoveFromHistory(video.id);
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
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/90 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-100">Clear all watch history?</h3>
            <p className="text-xs text-slate-400">
              This will remove all videos from your local history list. This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
