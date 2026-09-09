import React from 'react';
import { 
  Info, Github, ShieldCheck, Heart, 
  ExternalLink, Download, MessageSquare, 
  Globe, Radio, BookOpen, Bug
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div id="freetube-about-view" className="space-y-6 max-w-3xl mx-auto pb-20">
      {/* App Badge Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl text-center space-y-3 relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl shadow-red-600/30">
          FT
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
            FreeTube
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-mono">
              v0.25.2 Beta
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            The private, open-source media player for Android & Web without algorithms or tracking.
          </p>
        </div>
      </div>

      {/* Links & Community Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Source Code */}
        <a
          href="https://github.com/FreeTubeApp/FreeTube"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3.5 p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-200 group-hover:text-red-400 flex-shrink-0">
            <Github size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                Source Code
              </h3>
              <ExternalLink size={14} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Licensed under AGPLv3. Free and open source on GitHub.
            </p>
          </div>
        </a>

        {/* Releases & Changelog */}
        <a
          href="https://github.com/FreeTubeApp/FreeTube/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3.5 p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-200 group-hover:text-red-400 flex-shrink-0">
            <Download size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                Changelog & Builds
              </h3>
              <ExternalLink size={14} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Explore release notes, APKs, and performance improvements.
            </p>
          </div>
        </a>

        {/* Help & Wiki */}
        <a
          href="https://docs.freetubeapp.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3.5 p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-200 group-hover:text-red-400 flex-shrink-0">
            <BookOpen size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                Documentation & FAQ
              </h3>
              <ExternalLink size={14} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Setup guides, keyboard shortcuts, and troubleshooting.
            </p>
          </div>
        </a>

        {/* Report a Problem */}
        <a
          href="https://github.com/FreeTubeApp/FreeTube/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3.5 p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-200 group-hover:text-red-400 flex-shrink-0">
            <Bug size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                Report an Issue
              </h3>
              <ExternalLink size={14} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Submit bug reports or request features on GitHub issues.
            </p>
          </div>
        </a>
      </div>

      {/* Privacy Manifesto Card */}
      <div className="p-5 bg-slate-900/90 border border-slate-800/80 rounded-3xl space-y-2">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          Privacy Commitment
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          FreeTube is built around local-first privacy. Your subscriptions, playlists, search terms, and watch history never leave your device. There are no Google accounts required, no telemetry tracking your viewing habits, and no third-party advertisements injected into your media streams.
        </p>
      </div>
    </div>
  );
};
