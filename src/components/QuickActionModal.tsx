import React, { useState } from 'react';
import { X, Play, Link, Plus, FolderPlus, Radio, Sparkles } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayUrl: (url: string) => void;
  onCreatePlaylist: (title: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onPlayUrl,
  onCreatePlaylist,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'playlist'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [playlistTitle, setPlaylistTitle] = useState('');

  if (!isOpen) return null;

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onPlayUrl(urlInput.trim());
    setUrlInput('');
    onClose();
  };

  const handlePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistTitle.trim()) return;
    onCreatePlaylist(playlistTitle.trim());
    setPlaylistTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[32px] bg-[#10141e]/95 border border-white/[0.12] p-5 sm:p-6 shadow-2xl backdrop-blur-2xl text-white space-y-4"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Quick Add</h3>
              <p className="text-[11px] text-slate-400">Paste YouTube link or create playlist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'url' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link size={13} />
            <span>Play from URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('playlist')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'playlist' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderPlus size={13} />
            <span>New Playlist</span>
          </button>
        </div>

        {activeTab === 'url' ? (
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                YouTube Video or Shorts URL
              </label>
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=... or youtu.be/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full h-11 px-3.5 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="w-full h-11 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            >
              <Play size={14} className="fill-white" />
              <span>Stream Privately</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handlePlaylistSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Playlist Name
              </label>
              <input
                type="text"
                placeholder="e.g. Late Night Vibes, Coding Lo-Fi..."
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                className="w-full h-11 px-3.5 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!playlistTitle.trim()}
              className="w-full h-11 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            >
              <Plus size={15} />
              <span>Create Playlist</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
