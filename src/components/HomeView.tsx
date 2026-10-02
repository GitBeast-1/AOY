import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Flame, 
  Folder, 
  Play, 
  ArrowRight, 
  Zap, 
  DollarSign, 
  Target,
  Award
} from 'lucide-react';
import { ProvenChannel } from '../types';

interface HomeViewProps {
  channels: ProvenChannel[];
  onNavigateToProvenNiches: () => void;
  onSelectChannel: (channel: ProvenChannel) => void;
  onHuntNiche: (channel: ProvenChannel) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  channels,
  onNavigateToProvenNiches,
  onSelectChannel,
  onHuntNiche
}) => {
  const topBreakouts = channels.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171922] via-[#12141a] to-[#1a1b24] border border-white/[0.08] p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold text-amber-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Faceless Copilot · ART OF YT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back, tim! Discover today's breakout faceless YouTube niches.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
            The Niche Hunter database tracked 12 fresh outlier channels today across high-RPM styles including Stock Footage, Whiteboard Animation, and 2D/3D Animation.
          </p>

          <div className="mt-5 flex items-center space-x-3">
            <button
              onClick={onNavigateToProvenNiches}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
            >
              <span>Explore Proven Niches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-xs text-neutral-400 flex items-center space-x-1.5 pl-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Database synced across all devices</span>
            </div>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase font-bold">Tracked Channels</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">1,420+</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+48 added this week</div>
        </div>

        <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase font-bold">Avg Outlier Multiplier</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">+38.5x</div>
          <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">Above channel baseline</div>
        </div>

        <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase font-bold">Highest Niche RPM</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">$38.50</div>
          <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">Finance & Macroeconomics</div>
        </div>

        <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase font-bold">Proven Categories</div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1">11 Niches</div>
          <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">Zero face required</div>
        </div>
      </div>

      {/* Today's Spotlight Outlier Channels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Today's High-Signal Faceless Channels
            </h2>
          </div>
          <button
            onClick={onNavigateToProvenNiches}
            className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold cursor-pointer"
          >
            View all {channels.length} channels →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topBreakouts.map((ch) => (
            <div
              key={ch.id}
              onClick={() => onSelectChannel(ch)}
              className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2] p-4 rounded-2xl flex items-start space-x-4 cursor-pointer transition-all shadow-xs hover:shadow-md group"
            >
              <img
                src={ch.avatar}
                alt={ch.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-200 dark:ring-white/10 group-hover:scale-105 transition-transform flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {ch.name}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
                    {ch.success}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  {ch.handle} • {ch.subscribers} • {ch.videoCount} videos
                </div>
                <p className="text-xs text-slate-600 dark:text-neutral-300 line-clamp-2 mt-1.5 leading-relaxed">
                  {ch.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-slate-100 text-slate-700 dark:bg-white/[0.05] dark:text-neutral-300 px-2 py-0.5 rounded font-medium">
                      {ch.style}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 dark:bg-white/[0.05] dark:text-neutral-300 px-2 py-0.5 rounded font-medium">
                      {ch.niche}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onHuntNiche(ch);
                    }}
                    className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Hunt Niche</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
