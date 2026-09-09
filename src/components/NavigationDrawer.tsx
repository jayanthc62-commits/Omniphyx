import React from 'react';
import { 
  Home, Compass, Radio, Users, History, 
  ListVideo, Bookmark, Settings, Info, 
  Github, ShieldCheck, Sun, Moon, Sparkles, X,
  Clock, User
} from 'lucide-react';
import { ViewTab, ThemeMode } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  unreadChannelsCount?: number;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  unreadChannelsCount = 2,
}) => {
  const mainNav = [
    { id: 'dashboard' as ViewTab, label: 'Home', icon: Home },
    { 
      id: 'vintora' as ViewTab, 
      label: 'Vintora agent', 
      icon: Sparkles, 
      isLiquidGlass: true, 
      badgeText: 'Liquid Glass' 
    },
    { id: 'trending' as ViewTab, label: 'Explore', icon: Compass },
    { id: 'subscriptions' as ViewTab, label: 'Subscriptions', icon: Radio, badge: unreadChannelsCount },
    { id: 'channels' as ViewTab, label: 'Channels', icon: Users },
  ];

  const libraryNav = [
    { id: 'profile' as ViewTab, label: 'You (Profile)', icon: User },
    { id: 'watchLater' as ViewTab, label: 'Watch Later', icon: Clock },
    { id: 'history' as ViewTab, label: 'History', icon: History },
    { id: 'playlists' as ViewTab, label: 'Playlists', icon: ListVideo },
  ];

  const appNav = [
    { id: 'settings' as ViewTab, label: 'Settings', icon: Settings },
    { id: 'about' as ViewTab, label: 'About FreeTube', icon: Info },
  ];

  const isLight = theme === 'light';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Drawer Sidebar with Glassmorphism / Neumorphism */}
      <aside 
        id="freetube-navigation-drawer"
        className={`fixed top-0 bottom-0 left-0 w-72 border-r p-4 z-50 flex flex-col justify-between transition-all duration-300 backdrop-blur-2xl lg:translate-x-0 ${
          isLight
            ? 'bg-white/90 border-slate-200 text-slate-900 shadow-xl shadow-slate-300/50'
            : 'bg-slate-950/75 dark:bg-[#060911]/75 border-white/[0.08] text-slate-100 shadow-2xl shadow-black/80'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header inside Drawer */}
        <div>
          <div className="flex items-center justify-between px-2 py-2 mb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-600/30 font-black text-xs tracking-wider border border-white/20">
                FT
              </div>
              <div>
                <span className="font-bold text-base text-slate-100 tracking-tight flex items-center gap-1.5">
                  FreeTube
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">
                    Mobile
                  </span>
                </span>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="lg:hidden p-2 rounded-2xl text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-white/[0.05] active:scale-90 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav Section: Main */}
          <div className="space-y-1 mb-5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              Feeds
            </p>
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLiquid = (item as any).isLiquidGlass;

              if (isLiquid) {
                return (
                  <button
                    key={item.id}
                    id={`drawer-tab-${item.id}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-xs tracking-wide transition-all duration-300 active:scale-[0.98] group relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/25 via-indigo-500/20 to-pink-500/25 text-white border border-cyan-400/50 shadow-lg shadow-cyan-950/40 font-semibold backdrop-blur-2xl'
                        : 'bg-gradient-to-r from-cyan-500/10 via-indigo-500/5 to-pink-500/10 text-cyan-200 hover:text-white border border-cyan-500/25 hover:border-cyan-400/50 shadow-md shadow-cyan-950/20 backdrop-blur-xl'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 p-[1px] flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-500/30">
                        <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                          <Icon size={12} className="text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                      </div>
                      <span className="font-semibold bg-gradient-to-r from-white via-cyan-100 to-pink-200 bg-clip-text text-transparent">
                        {item.label}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
                      {(item as any).badgeText || 'AI'}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  id={`drawer-tab-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-medium text-xs tracking-wide transition-all duration-200 active:scale-[0.98] ${
                    isActive 
                      ? 'bg-white/[0.08] text-white border border-white/[0.12] font-semibold shadow-inner' 
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white border border-transparent hover:border-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-red-400' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm shadow-red-600/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Nav Section: Library */}
          <div className="space-y-1 mb-5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              Library
            </p>
            {libraryNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`drawer-tab-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-xs tracking-wide transition-all duration-200 active:scale-[0.98] ${
                    isActive 
                      ? 'bg-white/[0.08] text-white border border-white/[0.12] font-semibold shadow-inner' 
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white border border-transparent hover:border-white/[0.05]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-red-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Nav Section: Application */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              App
            </p>
            {appNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`drawer-tab-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-xs tracking-wide transition-all duration-200 active:scale-[0.98] ${
                    isActive 
                      ? 'bg-white/[0.08] text-white border border-white/[0.12] font-semibold shadow-inner' 
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white border border-transparent hover:border-white/[0.05]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-red-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Drawer Footer (Privacy Card & Quick Theme) */}
        <div className="pt-4 border-t border-white/[0.06] space-y-3">
          {/* Privacy badge */}
          <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center gap-2.5 backdrop-blur-md">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-200 truncate">Private Sandbox Mode</p>
              <p className="text-[10px] text-slate-400 truncate">No Google trackers / No ads</p>
            </div>
          </div>

          {/* Quick theme toggler */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-95"
            >
              {theme === 'light' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-indigo-400" />}
              <span className="capitalize">{theme} Mode</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">v0.25.2</span>
          </div>
        </div>
      </aside>
    </>
  );
};
