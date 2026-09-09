import React, { useState } from 'react';
import { 
  Settings, Moon, Sun, Monitor, ShieldCheck, 
  Sparkles, Check, Sliders, Volume2, Database,
  EyeOff
} from 'lucide-react';
import { ThemeMode } from '../types';

interface SettingsViewProps {
  theme: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onSelectTheme,
  onClearAllData,
}) => {
  const [defaultQuality, setDefaultQuality] = useState('1080p');
  const [sponsorBlock, setSponsorBlock] = useState(true);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [bufferSize, setBufferSize] = useState('30s');
  const [saveHistory, setSaveHistory] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div id="freetube-settings-view" className="space-y-6 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings size={22} className="text-red-500" />
            FreeTube Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalize your playback, theme, and privacy preferences
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full animate-in fade-in">
            <Check size={14} /> Settings Saved
          </span>
        )}
      </div>

      {/* Section 1: Appearance & Theme */}
      <div className="p-5 bg-slate-900/90 border border-slate-800/80 rounded-3xl space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Moon size={16} className="text-red-400" />
          Theme & Appearance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Elegant Dark */}
          <button
            type="button"
            onClick={() => onSelectTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all relative ${
              theme === 'dark'
                ? 'bg-slate-800/90 border-red-500 shadow-md shadow-red-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
                <Moon size={16} />
              </div>
              {theme === 'dark' && <Check size={16} className="text-red-400" />}
            </div>
            <p className="text-xs font-bold text-slate-100">Elegant Dark</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Modern slate & obsidian</p>
          </button>

          {/* Pure OLED */}
          <button
            type="button"
            onClick={() => onSelectTheme('oled')}
            className={`p-4 rounded-2xl border text-left transition-all relative ${
              theme === 'oled'
                ? 'bg-black border-red-500 shadow-md shadow-red-500/10'
                : 'bg-black/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-black border border-slate-800 flex items-center justify-center text-rose-400">
                <Sparkles size={16} />
              </div>
              {theme === 'oled' && <Check size={16} className="text-red-400" />}
            </div>
            <p className="text-xs font-bold text-slate-100">Pure OLED Black</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Maximum battery savings</p>
          </button>

          {/* Clean Light */}
          <button
            type="button"
            onClick={() => onSelectTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all relative ${
              theme === 'light'
                ? 'bg-slate-800/90 border-red-500 shadow-md shadow-red-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                <Sun size={16} />
              </div>
              {theme === 'light' && <Check size={16} className="text-red-400" />}
            </div>
            <p className="text-xs font-bold text-slate-100">Clean Light</p>
            <p className="text-[11px] text-slate-400 mt-0.5">High-contrast daytime mode</p>
          </button>
        </div>
      </div>

      {/* Section 2: Playback & Streaming */}
      <div className="p-5 bg-slate-900/90 border border-slate-800/80 rounded-3xl space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Sliders size={16} className="text-red-400" />
          Playback & Video Engine
        </h2>

        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
            <div>
              <p className="font-semibold text-slate-100">Default Video Quality</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Resolution used when opening a video</p>
            </div>
            <select
              value={defaultQuality}
              onChange={(e) => { setDefaultQuality(e.target.value); handleSave(); }}
              className="bg-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs outline-none border border-slate-700 font-medium"
            >
              <option value="1080p">1080p HD</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
              <option value="Auto">Auto</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
            <div>
              <p className="font-semibold text-slate-100">Auto-Buffer Ahead</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Pre-load segments for smooth offline playback</p>
            </div>
            <select
              value={bufferSize}
              onChange={(e) => { setBufferSize(e.target.value); handleSave(); }}
              className="bg-slate-800 text-slate-100 rounded-xl px-3 py-1.5 text-xs outline-none border border-slate-700 font-medium"
            >
              <option value="15s">15 seconds</option>
              <option value="30s">30 seconds (Default)</option>
              <option value="60s">60 seconds</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
            <div>
              <p className="font-semibold text-slate-100">SponsorBlock Integration</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Automatically skip in-video sponsor segments</p>
            </div>
            <button
              type="button"
              onClick={() => { setSponsorBlock(!sponsorBlock); handleSave(); }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                sponsorBlock ? 'bg-red-600' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${sponsorBlock ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
            <div>
              <p className="font-semibold text-slate-100">Autoplay Next Video</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Queue up recommended video upon finishing</p>
            </div>
            <button
              type="button"
              onClick={() => { setAutoPlayNext(!autoPlayNext); handleSave(); }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                autoPlayNext ? 'bg-red-600' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoPlayNext ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Privacy & Local Data */}
      <div className="p-5 bg-slate-900/90 border border-slate-800/80 rounded-3xl space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          Privacy & Data Management
        </h2>

        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60">
            <div>
              <p className="font-semibold text-slate-100">Save Local Watch History</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Store playback progress securely on device only</p>
            </div>
            <button
              type="button"
              onClick={() => { setSaveHistory(!saveHistory); handleSave(); }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                saveHistory ? 'bg-red-600' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${saveHistory ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-rose-300">Reset Local Application Database</p>
              <p className="text-[11px] text-rose-400/80 mt-0.5">Wipes local cache, subscriptions, playlists, and history</p>
            </div>
            <button
              onClick={onClearAllData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition-colors self-start sm:self-auto"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
