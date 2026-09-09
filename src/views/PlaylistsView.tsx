import React, { useState } from 'react';
import { 
  ListVideo, Plus, Bookmark, Clock, 
  Play, Trash2, Check, Sparkles, FolderPlus
} from 'lucide-react';
import { Playlist, Video } from '../types';

interface PlaylistsViewProps {
  playlists: Playlist[];
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  onCreatePlaylist: (title: string) => void;
  onDeletePlaylist?: (id: string) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  videos,
  onSelectVideo,
  onCreatePlaylist,
  onDeletePlaylist,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const playlistVideos = selectedPlaylist 
    ? (selectedPlaylist.id === 'favorites'
        ? videos.filter(v => v.isFavorite || selectedPlaylist.videoIds.includes(v.id))
        : selectedPlaylist.id === 'watch-later'
        ? videos.filter(v => v.inWatchLater || selectedPlaylist.videoIds.includes(v.id))
        : videos.filter(v => selectedPlaylist.videoIds.includes(v.id)))
    : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreatePlaylist(newTitle.trim());
    setNewTitle('');
    setShowCreateModal(false);
  };

  return (
    <div id="freetube-playlists-view" className="space-y-6 pb-20">
      {/* View Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ListVideo size={22} className="text-red-500" />
            Your Playlists
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organized private local collections
          </p>
        </div>

        <button
          id="create-playlist-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold liquid-btn-primary active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Selected Playlist Videos Drilldown */}
      {selectedPlaylist ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 neu-card-surface rounded-3xl">
            <div>
              <button 
                onClick={() => setSelectedPlaylistId(null)}
                className="text-xs font-semibold text-red-400 hover:underline mb-1 block"
              >
                ← Back to all playlists
              </button>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">{selectedPlaylist.title}</h2>
              <p className="text-xs text-slate-400">{playlistVideos.length} videos • {selectedPlaylist.updatedAt}</p>
            </div>

            {playlistVideos.length > 0 && (
              <button
                onClick={() => onSelectVideo(playlistVideos[0])}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold liquid-btn-primary active:scale-95"
              >
                <Play size={14} className="fill-white" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {playlistVideos.length === 0 ? (
            <div className="py-12 text-center neu-card-surface rounded-3xl p-6">
              <p className="text-sm font-semibold text-slate-300">This playlist is currently empty</p>
              <p className="text-xs text-slate-500 mt-1">Bookmark or save videos to add them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlistVideos.map((v) => (
                <div
                  key={v.id}
                  onClick={() => onSelectVideo(v)}
                  className="flex gap-3 p-3 rounded-2xl neu-card-surface hover:border-white/20 cursor-pointer transition-all group"
                >
                  <div className="relative w-32 h-20 bg-black rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-1 right-1 skeuo-badge px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                      {v.duration}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                      {v.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">{v.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Playlists Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {playlists.map((pl) => {
            const playlistVids = pl.id === 'favorites' 
              ? videos.filter(v => v.isFavorite || pl.videoIds?.includes(v.id))
              : pl.id === 'watch-later'
              ? videos.filter(v => v.inWatchLater || pl.videoIds?.includes(v.id))
              : videos.filter(v => pl.videoIds?.includes(v.id));

            const firstVid = playlistVids[0] || videos.find(v => pl.videoIds?.includes(v.id));
            const realThumbnail = firstVid?.thumbnail;
            const actualCount = playlistVids.length || pl.videoIds?.length || pl.videoCount || 0;

            return (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className="group relative flex flex-col neu-card-surface hover:border-white/[0.2] rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl active:scale-[0.99]"
              >
                {/* Dynamic Real Thumbnail / Minimalist Gradient Canvas */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  {realThumbnail ? (
                    <img
                      src={realThumbnail}
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-[#0c1220] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.08),transparent_70%)]" />
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-500 group-hover:text-red-400 group-hover:scale-110 transition-all duration-300">
                        <ListVideo size={32} className="stroke-[1.6]" />
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay side badge with playlist counter */}
                  <div className="absolute inset-y-0 right-0 w-24 bg-slate-950/80 backdrop-blur-xl border-l border-white/[0.1] flex flex-col items-center justify-center text-white gap-1 shadow-lg">
                    <ListVideo size={20} className="text-red-400" />
                    <span className="text-sm font-bold font-mono">{actualCount}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Videos</span>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                      {pl.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{pl.updatedAt}</p>
                  </div>

                  {!pl.isSystem && onDeletePlaylist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlaylist(pl.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/[0.06] rounded-xl transition-colors"
                      title="Delete playlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Playlist Modal Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/90 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FolderPlus size={18} className="text-red-500" />
              Create New Playlist
            </h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Playlist Title (e.g., Chill Comedy, Lectures)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white shadow-md shadow-red-600/20 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
