import React from 'react';
import { 
  Sun, Moon, Volume2, VolumeX, Eye, Sparkles, 
  RotateCcw, Sliders, Shield, Zap, Music, Play, 
  Pause, SkipBack, SkipForward, X, Clock, Monitor, 
  Headphones, Film, Check
} from 'lucide-react';
import { Video, ThemeMode } from '../types';

interface QuickSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeVideo: Video | null;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  brightness: number;
  onBrightnessChange: (b: number) => void;
  eyeComfort: boolean;
  onToggleEyeComfort: () => void;
  ambientGlow: boolean;
  onToggleAmbientGlow: () => void;
  sleepTimer: number | null; // in minutes
  onSetSleepTimer: (mins: number | null) => void;
  loopVideo: boolean;
  onToggleLoop: () => void;
  audioOnly: boolean;
  onToggleAudioOnly: () => void;
}

export const QuickSettingsPanel: React.FC<QuickSettingsPanelProps> = ({
  isOpen,
  onClose,
  activeVideo,
  isPlaying = false,
  onTogglePlay,
  theme,
  onToggleTheme,
  volume,
  onVolumeChange,
  brightness,
  onBrightnessChange,
  eyeComfort,
  onToggleEyeComfort,
  ambientGlow,
  onToggleAmbientGlow,
  sleepTimer,
  onSetSleepTimer,
  loopVideo,
  onToggleLoop,
  audioOnly,
  onToggleAudioOnly,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md rounded-[36px] bg-[#12151e]/95 border border-white/[0.12] p-5 sm:p-6 shadow-2xl backdrop-blur-3xl text-white space-y-4"
      >
        {/* Top Header matching Screenshot 1: Mon 7 Sept & action icons */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <span className="text-sm font-bold text-slate-100">Quick Controls</span>
            <p className="text-[11px] text-slate-400">Audio, Display & Preferences</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-all active:scale-95"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Media Player Tile (Screenshot 1 top media widget) */}
        <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-white/[0.1] overflow-hidden flex-shrink-0 flex items-center justify-center">
              {activeVideo ? (
                <img src={activeVideo.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <Music size={20} className="text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">
                {activeVideo ? activeVideo.title : 'Not playing'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {activeVideo ? activeVideo.channelTitle : 'Select a video'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={onTogglePlay}
              disabled={!activeVideo}
              className="w-10 h-10 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-90 transition-all"
            >
              {isPlaying ? <Pause size={17} className="fill-white" /> : <Play size={17} className="fill-white ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Dual Vertical Sliders: Brightness & Volume (Exact visual style from Screenshot 1) */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Brightness Slider */}
          <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] p-3.5 flex flex-col items-center justify-between h-40">
            <div className="w-full flex justify-between items-center text-[11px] font-semibold text-slate-300">
              <Sun size={15} className="text-amber-400" />
              <span>{Math.round(brightness * 100)}%</span>
            </div>
            {/* Custom Vertical Range bar */}
            <div className="relative w-8 h-24 bg-white/10 rounded-2xl overflow-hidden flex flex-col justify-end p-1">
              <div 
                className="w-full bg-amber-400 rounded-xl transition-all duration-150"
                style={{ height: `${brightness * 100}%` }}
              />
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={brightness}
                onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Brightness</span>
          </div>

          {/* Volume Slider */}
          <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] p-3.5 flex flex-col items-center justify-between h-40">
            <div className="w-full flex justify-between items-center text-[11px] font-semibold text-slate-300">
              <Volume2 size={15} className="text-blue-400" />
              <span>{Math.round(volume * 100)}%</span>
            </div>
            {/* Custom Vertical Range bar */}
            <div className="relative w-8 h-24 bg-white/10 rounded-2xl overflow-hidden flex flex-col justify-end p-1">
              <div 
                className="w-full bg-blue-500 rounded-xl transition-all duration-150"
                style={{ height: `${volume * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Volume</span>
          </div>
        </div>

        {/* Circular Quick Toggles Grid (Matching round buttons from Screenshot 1) */}
        <div className="grid grid-cols-4 gap-2.5 pt-1">
          {/* Dark / OLED Toggle */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onToggleTheme}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                theme !== 'light' 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30' 
                  : 'bg-white/[0.05] border-white/[0.1] text-slate-300'
              }`}
            >
              {theme === 'oled' ? <Sparkles size={18} /> : <Moon size={18} />}
            </button>
            <span className="text-[10px] text-slate-300 truncate font-medium">
              {theme === 'oled' ? 'OLED' : theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </div>

          {/* Eye Comfort Toggle */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onToggleEyeComfort}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                eyeComfort 
                  ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/30' 
                  : 'bg-white/[0.05] border-white/[0.1] text-slate-300'
              }`}
            >
              <Eye size={18} />
            </button>
            <span className="text-[10px] text-slate-300 truncate font-medium">Eye Comfort</span>
          </div>

          {/* Ambient Glow Toggle (Juxtopposed UI redesign) */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onToggleAmbientGlow}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                ambientGlow 
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30' 
                  : 'bg-white/[0.05] border-white/[0.1] text-slate-300'
              }`}
            >
              <Film size={18} />
            </button>
            <span className="text-[10px] text-slate-300 truncate font-medium">Ambient Glow</span>
          </div>

          {/* Sleep Timer Toggle (Juxtopposed UI redesign) */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                if (!sleepTimer) onSetSleepTimer(15);
                else if (sleepTimer === 15) onSetSleepTimer(30);
                else if (sleepTimer === 30) onSetSleepTimer(60);
                else onSetSleepTimer(null);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                sleepTimer 
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30' 
                  : 'bg-white/[0.05] border-white/[0.1] text-slate-300'
              }`}
            >
              <Clock size={18} />
            </button>
            <span className="text-[10px] text-slate-300 truncate font-medium">
              {sleepTimer ? `${sleepTimer}m timer` : 'Sleep Off'}
            </span>
          </div>

          {/* Loop Video */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onToggleLoop}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                loopVideo 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-white/[0.05] border-white/[0.1] text-slate-300'
              }`}
            >
              <RotateCcw size={18} />
            </button>
            <span className="text-[10px] text-slate-300 truncate font-medium">Loop</span>
          </div>

          {/* Audio Only Mode */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onToggleAudioOnly}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                audioOnly 
                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30' 
                  : 'bg-white/[0.05] border-white/[0.1] text-slate-300'
              }`}
            >
              <Headphones size={18} />
            </button>
            <span className="text-[10px] text-slate-300 truncate font-medium">Audio Only</span>
          </div>

          {/* AdBlocker Status (Always On in FreeTube) */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border bg-emerald-600/20 border-emerald-500/40 text-emerald-400">
              <Shield size={18} />
            </div>
            <span className="text-[10px] text-emerald-400 truncate font-medium">No Ads</span>
          </div>

          {/* Local / Privacy Mode */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border bg-blue-600/20 border-blue-500/40 text-blue-400">
              <Zap size={18} />
            </div>
            <span className="text-[10px] text-blue-400 truncate font-medium">Private</span>
          </div>
        </div>
      </div>
    </div>
  );
};
