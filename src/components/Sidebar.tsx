import React from 'react';
import { 
  Home, 
  Sparkles, 
  Lightbulb, 
  Feather, 
  Image, 
  Folder, 
  GraduationCap, 
  BarChart2, 
  FileText, 
  FolderArchive, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight,
  Sliders,
  Zap,
  Radio,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenConnectors: () => void;
  savedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isDarkMode,
  setIsDarkMode,
  onOpenConnectors,
  savedCount
}) => {
  const mainNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'research', label: 'Research', icon: Sparkles },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb },
    { id: 'competitors', label: 'Competitors', icon: Feather },
    { id: 'thumbs', label: 'Thumbs', icon: Image },
    { id: 'proven-niches', label: 'Proven Niches', icon: Folder, badge: savedCount },
    { id: 'course', label: 'The Course', icon: GraduationCap },
  ];

  const secondaryNav = [
    { id: 'my-channel', label: 'My Channel', icon: BarChart2 },
    { id: 'my-notes', label: 'My Notes', icon: FileText },
    { id: 'my-reports', label: 'My Reports', icon: FolderArchive },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 bg-white dark:bg-[#0d0e12] border-r border-slate-200 dark:border-white/[0.08] flex flex-col justify-between flex-shrink-0 z-30 select-none shadow-sm dark:shadow-none`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06]">
          <div 
            onClick={() => setActiveTab('proven-niches')}
            className="flex items-center space-x-3 cursor-pointer group overflow-hidden"
          >
            {/* Orange circular icon matching screenshot */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white text-xs font-black tracking-wider">AOY</span>
            </div>

            {!isCollapsed && (
              <div className="leading-tight truncate">
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span className="truncate">Faceless Copilot</span>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-neutral-400">
                  ART OF YT
                </div>
              </div>
            )}
          </div>

          {/* Toggle sidebar button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold dark:bg-white/[0.1] dark:text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-white/[0.04]'
                }`}
                title={item.label}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400 dark:text-neutral-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.id === 'proven-niches' && (
                  <span className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {savedCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="pt-4 pb-2">
            <div className="border-t border-slate-200/80 dark:border-white/[0.06] mx-2" />
          </div>

          {/* Secondary Navigation */}
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold dark:bg-white/[0.1] dark:text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-white/[0.04]'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400 dark:text-neutral-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.06] space-y-3">
        {/* Connectors / MCP Shortcut Button */}
        <button
          onClick={onOpenConnectors}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] dark:border-white/[0.06] dark:text-neutral-300 text-[11px] transition-colors cursor-pointer"
          title="Connectors & AI Copilot settings"
        >
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            {!isCollapsed && <span>AOY Connectors</span>}
          </div>
          {!isCollapsed && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">ON</span>}
        </button>

        {/* Light / Dark Mode Toggle Pill */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-100 dark:bg-[#15171e] p-1 rounded-full border border-slate-200 dark:border-white/[0.08] flex items-center space-x-1 w-full max-w-[200px]">
            <button
              onClick={() => setIsDarkMode(false)}
              className={`flex-1 py-1 rounded-full text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                !isDarkMode ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-500" />
              {!isCollapsed && <span>Light</span>}
            </button>
            <button
              onClick={() => setIsDarkMode(true)}
              className={`flex-1 py-1 rounded-full text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                isDarkMode ? 'bg-[#272b38] text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3 h-3 text-sky-400" />
              {!isCollapsed && <span>Dark</span>}
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center space-x-3 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
          <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-inner">
            T
          </div>
          {!isCollapsed && (
            <div className="truncate text-left leading-tight">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">tim</div>
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">AOY Program</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
