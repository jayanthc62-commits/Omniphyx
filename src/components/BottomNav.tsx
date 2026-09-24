import React from 'react';
import { Home, Compass, Plus, Radio } from 'lucide-react';
import { ViewTab, ThemeMode } from '../types';

interface BottomNavProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  unreadSubsCount?: number;
  onOpenQuickAction?: () => void;
  theme?: ThemeMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  unreadSubsCount = 2,
  onOpenQuickAction,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <nav 
      id="freetube-bottom-nav"
      className={`fixed bottom-0 left-0 right-0 h-16 border-t backdrop-blur-2xl z-40 lg:hidden px-2 flex items-center justify-around select-none safe-area-bottom transition-colors duration-300 ${
        isLight
          ? 'bg-white/90 border-slate-200 shadow-lg text-slate-800'
          : 'bg-slate-950/80 dark:bg-[#070a12]/80 border-white/[0.08] shadow-2xl shadow-black text-slate-100'
      }`}
    >
      {/* 1. Home */}
      <button
        id="bottom-nav-dashboard"
        onClick={() => onSelectTab('dashboard')}
        className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90 ${
          activeTab === 'dashboard' 
            ? 'text-white' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home size={20} className={activeTab === 'dashboard' ? 'text-white stroke-[2.4px]' : 'stroke-[1.8px]'} />
        <span className={`text-[10px] tracking-tight leading-none ${activeTab === 'dashboard' ? 'font-bold text-white' : 'font-medium'}`}>
          Home
        </span>
      </button>

      {/* 2. Explore (Direct discovery hub from Juxtopposed redesign) */}
      <button
        id="bottom-nav-explore"
        onClick={() => onSelectTab('trending')}
        className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90 ${
          activeTab === 'trending' 
            ? 'text-white' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Compass size={20} className={activeTab === 'trending' ? 'text-white stroke-[2.4px]' : 'stroke-[1.8px]'} />
        <span className={`text-[10px] tracking-tight leading-none ${activeTab === 'trending' ? 'font-bold text-white' : 'font-medium'}`}>
          Explore
        </span>
      </button>

      {/* 3. Center (+) Action Button (Screenshot 2 style) */}
      <div className="flex-1 flex items-center justify-center">
        <button
          id="bottom-nav-quick-add"
          onClick={onOpenQuickAction}
          className="w-10 h-10 rounded-full border border-white/20 bg-white/[0.08] hover:bg-white/[0.15] text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"
          title="Create or Play from URL"
        >
          <Plus size={22} className="stroke-[2.2px]" />
        </button>
      </div>

      {/* 4. Subscriptions */}
      <button
        id="bottom-nav-subscriptions"
        onClick={() => onSelectTab('subscriptions')}
        className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90 relative ${
          activeTab === 'subscriptions' 
            ? 'text-white' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Radio size={20} className={activeTab === 'subscriptions' ? 'text-white stroke-[2.4px]' : 'stroke-[1.8px]'} />
          {unreadSubsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-slate-950" />
          )}
        </div>
        <span className={`text-[10px] tracking-tight leading-none ${activeTab === 'subscriptions' ? 'font-bold text-white' : 'font-medium'}`}>
          Subscriptions
        </span>
      </button>

      {/* 5. You (Profile matching Screenshot 2 with orange avatar 'G') */}
      <button
        id="bottom-nav-profile"
        onClick={() => onSelectTab('profile')}
        className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90 ${
          activeTab === 'profile' 
            ? 'text-white' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-transform ${
          activeTab === 'profile' ? 'ring-2 ring-white scale-110' : 'opacity-85'
        }`}>
          G
        </div>
        <span className={`text-[10px] tracking-tight leading-none ${activeTab === 'profile' ? 'font-bold text-white' : 'font-medium'}`}>
          You
        </span>
      </button>
    </nav>
  );
};
