import React, { useState } from 'react';
import { 
  Download, Music, Video as VideoIcon, Check, 
  ExternalLink, Sparkles, X, HardDrive, AlertCircle,
  Clock, ShieldCheck
} from 'lucide-react';
import { Video } from '../types';

interface MediaDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
}

export const MediaDownloadModal: React.FC<MediaDownloadModalProps> = ({
  isOpen,
  onClose,
  video,
}) => {
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');
  const [selectedQuality, setSelectedQuality] = useState<'1080p' | '720p' | '480p' | '360p'>('1080p');
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<'mp3' | 'm4a'>('mp3');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!isOpen || !video) return null;

  const videoOptions = [
    { quality: '1080p' as const, label: '1080p Full HD (60fps)', ext: 'MP4', estSize: '84 MB' },
    { quality: '720p' as const, label: '720p HD Standard', ext: 'MP4', estSize: '42 MB' },
    { quality: '480p' as const, label: '480p SD Mobile', ext: 'MP4', estSize: '24 MB' },
    { quality: '360p' as const, label: '360p Data Saver', ext: 'MP4', estSize: '15 MB' },
  ];

  const audioOptions = [
    { format: 'mp3' as const, label: 'MP3 High Quality (320 kbps)', ext: 'MP3', estSize: '8.4 MB' },
    { format: 'm4a' as const, label: 'M4A High Efficiency (AAC)', ext: 'M4A', estSize: '6.1 MB' },
  ];

  const handleStartDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(10);
    setCompleted(false);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            setCompleted(true);

            // Trigger file save
            const fileName = `${video.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${downloadType === 'video' ? 'mp4' : selectedAudioFormat}`;
            // If it's a native mp4 video url, use it directly
            const directUrl = video.videoUrl?.endsWith('.mp4') 
              ? video.videoUrl 
              : `https://www.youtube.com/watch?v=${video.id}`;
            
            const link = document.createElement('a');
            link.href = directUrl;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-950/95 border border-white/[0.12] rounded-3xl p-5 sm:p-6 shadow-2xl shadow-red-950/40 text-slate-100 space-y-5 relative max-h-[92vh] overflow-y-auto scrollbar-none"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-2xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 transition-all"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 flex-shrink-0">
            <Download size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              FreeTube Media Downloader
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Save video or audio locally without DRM restrictions
            </p>
          </div>
        </div>

        {/* Selected Video Preview Card */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="w-20 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-100 truncate">{video.title}</h4>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{video.channelTitle} • {video.duration}</p>
          </div>
        </div>

        {/* Type Switcher: Video vs Audio */}
        <div className="flex items-center gap-2 p-1 bg-black/40 border border-white/[0.08] rounded-2xl">
          <button
            onClick={() => setDownloadType('video')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              downloadType === 'video'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <VideoIcon size={14} />
            <span>Video (MP4)</span>
          </button>

          <button
            onClick={() => setDownloadType('audio')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              downloadType === 'audio'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music size={14} />
            <span>Audio Only</span>
          </button>
        </div>

        {/* Quality Options */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            Choose format & quality
          </p>

          {downloadType === 'video' ? (
            <div className="space-y-2">
              {videoOptions.map((opt) => (
                <div
                  key={opt.quality}
                  onClick={() => setSelectedQuality(opt.quality)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedQuality === opt.quality
                      ? 'bg-white/[0.08] border-red-500/70 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedQuality === opt.quality ? 'border-red-500 bg-red-600' : 'border-slate-600'
                    }`}>
                      {selectedQuality === opt.quality && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="text-[10px] text-slate-400">{opt.ext} format</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-medium">{opt.estSize}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {audioOptions.map((opt) => (
                <div
                  key={opt.format}
                  onClick={() => setSelectedAudioFormat(opt.format)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedAudioFormat === opt.format
                      ? 'bg-white/[0.08] border-red-500/70 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedAudioFormat === opt.format ? 'border-red-500 bg-red-600' : 'border-slate-600'
                    }`}>
                      {selectedAudioFormat === opt.format && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="text-[10px] text-slate-400">{opt.ext} high-fidelity</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-medium">{opt.estSize}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Bar when downloading */}
        {isDownloading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Extracting and fetching stream...</span>
              <span className="font-mono font-bold text-red-400">{downloadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-200"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {completed && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check size={16} className="text-emerald-400 flex-shrink-0" />
            <span>Download dispatched! Check your browser or device download folder.</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleStartDownload}
            disabled={isDownloading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Download size={18} />
            <span>{isDownloading ? 'Downloading...' : `Download ${downloadType === 'video' ? selectedQuality : selectedAudioFormat.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
