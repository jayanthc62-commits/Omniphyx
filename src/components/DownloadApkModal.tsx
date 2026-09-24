import React, { useState } from 'react';
import { 
  Smartphone, Download, ExternalLink, Check, Copy, 
  ShieldCheck, Sparkles, X, ChevronRight, AlertCircle,
  FileCode, Terminal, HelpCircle
} from 'lucide-react';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!isOpen) return null;

  const apkUrl = 'https://github.com/jayanthc62-commits/FreeTubeAndroid/releases/download/v0.25.2-preview/FreeTubeAndroid-arm64-v8a-debug.apk';
  const actionsUrl = 'https://github.com/jayanthc62-commits/God-s-eye/actions';

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(apkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleTriggerDownload = () => {
    setDownloadStarted(true);
    // Trigger download of APK directly
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'FreeTubeAndroid-v0.25.2.apk';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadStarted(false), 3500);
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

        {/* Top Header & Android Banner */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 flex-shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Download FreeTube APK</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                Android Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Install FreeTube directly on your Android phone or tablet
            </p>
          </div>
        </div>

        {/* Release Specs Pill */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-slate-300">
          <div>
            <p className="font-semibold text-white">FreeTubeAndroid v0.25.2</p>
            <p className="text-[11px] text-slate-400">Architecture: arm64-v8a / Universal • 47.5 MB</p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 font-semibold text-[11px]">
            Latest Build
          </span>
        </div>

        {/* Download Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleTriggerDownload}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-[0.98] transition-all"
          >
            {downloadStarted ? (
              <>
                <Check size={18} className="text-white" />
                <span>Download Starting...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Download Android APK (.apk)</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
            </button>

            <a
              href={actionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <ExternalLink size={14} className="text-slate-400" />
              <span>GitHub Actions Build</span>
            </a>
          </div>
        </div>

        {/* Android Key Features */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            FreeTube Android Highlights
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
              <span>100% Ad-Free Playback</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <Sparkles size={14} className="text-cyan-400 flex-shrink-0" />
              <span>Vintora AI Engine</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <ShieldCheck size={14} className="text-indigo-400 flex-shrink-0" />
              <span>SponsorBlock Auto-Skip</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <Download size={14} className="text-amber-400 flex-shrink-0" />
              <span>Offline Video Downloader</span>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <HelpCircle size={15} className="text-red-400" />
            <span>How to install on Android:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
            <li>Tap <strong className="text-slate-200">Download Android APK</strong> above to save the file.</li>
            <li>Open your phone's <strong className="text-slate-200">Files</strong> or <strong className="text-slate-200">Downloads</strong> app and tap the downloaded file.</li>
            <li>If prompted, enable <strong className="text-slate-200">Allow from this source</strong> in Android Settings.</li>
            <li>Tap <strong className="text-slate-200">Install</strong> and launch FreeTube with full native performance!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
