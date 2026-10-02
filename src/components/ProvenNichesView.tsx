import React, { useState } from 'react';
import { 
  Film, 
  Sparkles, 
  Layers, 
  LayoutGrid, 
  Star, 
  Heart, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Clock, 
  Check, 
  Filter, 
  X, 
  Radio, 
  Sliders, 
  ChevronDown,
  Plus,
  Trash2,
  Bot,
  Zap,
  Info
} from 'lucide-react';
import { ProvenChannel, NICHE_CATEGORIES } from '../types';
import { ChannelCard } from './ChannelCard';
import { AutoHunterModal } from './AutoHunterModal';
import { AddChannelModal } from './AddChannelModal';

interface ProvenNichesViewProps {
  channels: ProvenChannel[];
  savedCount: number;
  bookmarkedIds: string[];
  likedIds: string[];
  onToggleBookmark: (channelId: string) => void;
  onToggleLike: (channelId: string) => void;
  onSelectChannel: (channel: ProvenChannel) => void;
  onHuntNiche: (channel: ProvenChannel) => void;
  onDeleteChannel?: (channelId: string) => void;
  onAddChannel?: (channel: ProvenChannel) => void;
  onChannelsDiscovered?: (channels: ProvenChannel[]) => void;
}

export const ProvenNichesView: React.FC<ProvenNichesViewProps> = ({
  channels,
  savedCount,
  bookmarkedIds,
  likedIds,
  onToggleBookmark,
  onToggleLike,
  onSelectChannel,
  onHuntNiche,
  onDeleteChannel,
  onAddChannel,
  onChannelsDiscovered
}) => {
  // Sub-tabs: 'newly-added' | 'channel-cards' | 'all-channels' | 'saved'
  const [activeSubTab, setActiveSubTab] = useState<'newly-added' | 'channel-cards' | 'all-channels' | 'saved'>('newly-added');
  const [toolMode, setToolMode] = useState<'niche-hunter' | 'vidrush'>('niche-hunter');

  // Modals
  const [isAutoHunterOpen, setIsAutoHunterOpen] = useState(false);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'views' | 'subs' | 'likes' | 'name'>('newest');
  const [filterLiked, setFilterLiked] = useState(false);
  const [filterBookmarked, setFilterBookmarked] = useState(false);
  const [discoveredFilter, setDiscoveredFilter] = useState<'All' | 'Today' | 'Yesterday' | '2 days ago'>('All');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [selectedNiche, setSelectedNiche] = useState<string>('All');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('All');

  // Dropdown open states
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDiscoveredDropdown, setShowDiscoveredDropdown] = useState(false);

  // Available unique styles & niches
  const stylesList = ['All', 'Stock Footage', 'Whiteboard Animation', 'AI 2D', '2D Animation', '3D Animation'];
  const nichesList = ['All', ...NICHE_CATEGORIES];
  const complexitiesList = ['All', 'Easy', 'Medium', 'Hard'];

  // Filter channels according to all active criteria
  let filtered = [...channels];

  if (activeSubTab === 'saved') {
    filtered = filtered.filter(c => bookmarkedIds.includes(c.id) || c.isBookmarked);
  }

  if (filterLiked) {
    filtered = filtered.filter(c => likedIds.includes(c.id) || c.isLiked);
  }

  if (filterBookmarked) {
    filtered = filtered.filter(c => bookmarkedIds.includes(c.id) || c.isBookmarked);
  }

  if (discoveredFilter !== 'All') {
    filtered = filtered.filter(c => c.discoveredAt.toLowerCase().includes(discoveredFilter.toLowerCase()));
  }

  if (selectedStyle !== 'All') {
    filtered = filtered.filter(c => c.style.toLowerCase() === selectedStyle.toLowerCase());
  }

  if (selectedNiche !== 'All') {
    filtered = filtered.filter(c => c.niche.toLowerCase() === selectedNiche.toLowerCase());
  }

  if (selectedComplexity !== 'All') {
    filtered = filtered.filter(c => c.complexity.toLowerCase() === selectedComplexity.toLowerCase());
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.niche.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.topVideos.some(v => v.title.toLowerCase().includes(q))
    );
  }

  // Sort filtered
  if (selectedSort === 'views') {
    filtered.sort((a, b) => b.views - a.views);
  } else if (selectedSort === 'subs') {
    filtered.sort((a, b) => b.subscribersCount - a.subscribersCount);
  } else if (selectedSort === 'likes') {
    filtered.sort((a, b) => b.likes - a.likes);
  } else if (selectedSort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Row (matching Screenshot 1 and 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center space-x-4">
          {/* Heading with Clapperboard icon */}
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🎬</span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Proven Niches
            </h1>
          </div>

          {/* Sub-tool pill switches: Niche Hunter & Vidrush */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setToolMode('niche-hunter')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                toolMode === 'niche-hunter'
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-900/30'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs dark:bg-white/[0.05] dark:text-neutral-400 dark:hover:text-white dark:border-transparent'
              }`}
            >
              Niche Hunter
            </button>
            <button
              onClick={() => setToolMode('vidrush')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                toolMode === 'vidrush'
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-900/30'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs dark:bg-white/[0.05] dark:text-neutral-400 dark:hover:text-white dark:border-transparent'
              }`}
            >
              Vidrush
            </button>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsAutoHunterOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300/80 shadow-xs dark:bg-gradient-to-r dark:from-amber-500/10 dark:to-orange-500/10 dark:hover:from-amber-500/20 dark:hover:to-orange-500/20 dark:text-amber-300 dark:border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
            title="Configure Autonomous AI Niche Discovery"
          >
            <Bot className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Auto-Hunter</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </button>

          <button
            onClick={() => setIsAddChannelOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-xs dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-white dark:border-white/[0.1] text-xs font-semibold transition-all cursor-pointer"
            title="Import Real YouTube Channel by Handle"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-neutral-300" />
            <span>Add Channel</span>
          </button>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 dark:text-neutral-400 pl-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{channels.length} Proven Niches</span>
          </div>
        </div>
      </div>

      {/* Sub-navigation View Tabs Row (matching Screenshot 1, 3, 5) */}
      <div className="flex items-center space-x-2 text-xs font-semibold overflow-x-auto pb-1">
        {/* Newly Added (with amber active outline) */}
        <button
          onClick={() => setActiveSubTab('newly-added')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'newly-added'
              ? 'border border-amber-500/80 bg-amber-50 text-amber-900 shadow-xs dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-300 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Newly added</span>
        </button>

        {/* Channel Cards */}
        <button
          onClick={() => setActiveSubTab('channel-cards')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'channel-cards'
              ? 'bg-slate-900 text-white shadow-xs dark:bg-white/[0.1] dark:text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Channel Cards</span>
        </button>

        {/* All Channels */}
        <button
          onClick={() => setActiveSubTab('all-channels')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'all-channels'
              ? 'bg-slate-900 text-white shadow-xs dark:bg-white/[0.1] dark:text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>All Channels</span>
        </button>

        {/* Saved */}
        <button
          onClick={() => setActiveSubTab('saved')}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'saved'
              ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-xs dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
          <span>Saved ({savedCount})</span>
        </button>
      </div>

      {/* Contextual Banner for Channel Cards Tab */}
      {activeSubTab === 'channel-cards' && (
        <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700 dark:text-neutral-300 shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Channel Cards Tab:</span>
              <span className="text-slate-600 dark:text-neutral-400 ml-1.5">
                Newly created and background-researched channels are saved here automatically. Delete unwanted channels using the trash icon.
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsAutoHunterOpen(true)}
            className="flex items-center space-x-1 text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-semibold text-xs whitespace-nowrap cursor-pointer self-start sm:self-auto"
          >
            <span>Auto-Discovery Schedule</span>
            <ChevronDown className="w-3 h-3 -rotate-90" />
          </button>
        </div>
      )}

      {/* Filter and Search Action Toolbar (matching Screenshot 1, 3, 5) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Left Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* + Sort Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
                setShowDiscoveredDropdown(false);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-xs dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-300 dark:hover:text-white dark:border-white/[0.06] transition-colors cursor-pointer"
            >
              <span>+ Sort</span>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
            </button>

            {showSortDropdown && (
              <div className="absolute left-0 mt-1 w-44 bg-white dark:bg-[#18191e] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xl p-1.5 z-20 space-y-1">
                <button
                  onClick={() => { setSelectedSort('newest'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                    selectedSort === 'newest' ? 'bg-amber-50 text-amber-900 font-semibold dark:bg-amber-500/20 dark:text-amber-300' : 'text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <span>Newly Added</span>
                  {selectedSort === 'newest' && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                </button>
                <button
                  onClick={() => { setSelectedSort('views'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                    selectedSort === 'views' ? 'bg-amber-50 text-amber-900 font-semibold dark:bg-amber-500/20 dark:text-amber-300' : 'text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <span>Most Total Views</span>
                  {selectedSort === 'views' && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                </button>
                <button
                  onClick={() => { setSelectedSort('subs'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                    selectedSort === 'subs' ? 'bg-amber-50 text-amber-900 font-semibold dark:bg-amber-500/20 dark:text-amber-300' : 'text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <span>Subscribers Count</span>
                  {selectedSort === 'subs' && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                </button>
                <button
                  onClick={() => { setSelectedSort('likes'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                    selectedSort === 'likes' ? 'bg-amber-50 text-amber-900 font-semibold dark:bg-amber-500/20 dark:text-amber-300' : 'text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <span>Most Liked</span>
                  {selectedSort === 'likes' && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                </button>
              </div>
            )}
          </div>

          {/* + Filter Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
                setShowDiscoveredDropdown(false);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-xs dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-300 dark:hover:text-white dark:border-white/[0.06] transition-colors cursor-pointer"
            >
              <span>+ Filter</span>
              {(selectedStyle !== 'All' || selectedNiche !== 'All' || selectedComplexity !== 'All') && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
            </button>

            {showFilterDropdown && (
              <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-[#18191e] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xl p-3 z-20 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                    Style
                  </label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#121316] border border-slate-200 dark:border-white/[0.1] text-xs text-slate-800 dark:text-white rounded-lg p-2 focus:outline-none"
                  >
                    {stylesList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                    Niche
                  </label>
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#121316] border border-slate-200 dark:border-white/[0.1] text-xs text-slate-800 dark:text-white rounded-lg p-2 focus:outline-none"
                  >
                    {nichesList.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                    Complexity
                  </label>
                  <select
                    value={selectedComplexity}
                    onChange={(e) => setSelectedComplexity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#121316] border border-slate-200 dark:border-white/[0.1] text-xs text-slate-800 dark:text-white rounded-lg p-2 focus:outline-none"
                  >
                    {complexitiesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="pt-2 flex justify-between border-t border-slate-200/80 dark:border-white/[0.06]">
                  <button
                    onClick={() => {
                      setSelectedStyle('All');
                      setSelectedNiche('All');
                      setSelectedComplexity('All');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilterDropdown(false)}
                    className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Liked Filter Button */}
          <button
            onClick={() => setFilterLiked(!filterLiked)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterLiked
                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200/90 shadow-xs dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:text-white dark:border-white/[0.06]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${filterLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-neutral-400'}`} />
            <span>Liked</span>
          </button>

          {/* Bookmarked Filter Button */}
          <button
            onClick={() => setFilterBookmarked(!filterBookmarked)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterBookmarked
                ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200/90 shadow-xs dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:text-white dark:border-white/[0.06]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterBookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-400 dark:text-neutral-400'}`} />
            <span>Bookmarked</span>
          </button>

          {/* Discovered Dropdown (All / Today / Yesterday) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDiscoveredDropdown(!showDiscoveredDropdown);
                setShowSortDropdown(false);
                setShowFilterDropdown(false);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-xs dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-300 dark:hover:text-white dark:border-white/[0.06] transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
              <span>Discovered: {discoveredFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
            </button>

            {showDiscoveredDropdown && (
              <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-[#18191e] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xl p-1.5 z-20 space-y-1">
                {(['All', 'Today', 'Yesterday', '2 days ago'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDiscoveredFilter(d); setShowDiscoveredDropdown(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                      discoveredFilter === d ? 'bg-amber-50 text-amber-900 font-semibold dark:bg-amber-500/20 dark:text-amber-300' : 'text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{d}</span>
                    {discoveredFilter === d && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Search Input Box */}
        <div className="relative w-full lg:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search niches, handles..."
            className="w-full bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.1] rounded-full px-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: 3-column Channel Cards (matching Screenshot 1 and 3) */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#14151a] border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
          <Film className="w-10 h-10 text-slate-400 dark:text-neutral-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Proven Channels Found</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
            Try adjusting your search query or reset the filter parameters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStyle('All');
              setSelectedNiche('All');
              setSelectedComplexity('All');
              setDiscoveredFilter('All');
              setFilterLiked(false);
              setFilterBookmarked(false);
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : activeSubTab === 'all-channels' ? (
        /* Tabular Channel List View for "All Channels" */
        <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider bg-slate-50/80 dark:bg-white/[0.02]">
                  <th className="p-3 pl-4">Channel</th>
                  <th className="p-3">Style</th>
                  <th className="p-3">Niche</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Subscribers</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Discovered</th>
                  <th className="p-3 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filtered.map((channel) => (
                  <tr 
                    key={channel.id}
                    onClick={() => onSelectChannel(channel)}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="p-3 pl-4">
                      <div className="flex items-center space-x-3">
                        <img src={channel.avatar} alt={channel.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/[0.1]" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{channel.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400">{channel.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-neutral-300">{channel.style}</td>
                    <td className="p-3 text-slate-700 dark:text-neutral-300">{channel.niche}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent">
                        {channel.success}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-neutral-300">{channel.subscribers}</td>
                    <td className="p-3 font-mono text-slate-700 dark:text-neutral-300">{channel.views.toLocaleString()}</td>
                    <td className="p-3 text-slate-500 dark:text-neutral-400">{channel.discoveredAt}</td>
                    <td className="p-3 text-right pr-4">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onHuntNiche(channel);
                          }}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-500/20 dark:hover:bg-sky-500/30 dark:text-sky-300 dark:border-transparent rounded text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Hunt Niche
                        </button>
                        {onDeleteChannel && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChannel(channel.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-neutral-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Delete channel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Standard 3-Column Card Grid (matching Screenshot 1 and 3) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isBookmarked={bookmarkedIds.includes(channel.id) || channel.isBookmarked}
              isLiked={likedIds.includes(channel.id) || channel.isLiked}
              onToggleBookmark={onToggleBookmark}
              onToggleLike={onToggleLike}
              onSelectChannel={onSelectChannel}
              onHuntNiche={onHuntNiche}
              onDeleteChannel={onDeleteChannel}
            />
          ))}
        </div>
      )}

      {/* Auto Hunter Modal */}
      <AutoHunterModal
        isOpen={isAutoHunterOpen}
        onClose={() => setIsAutoHunterOpen(false)}
        onChannelsDiscovered={(newChannels) => {
          if (onChannelsDiscovered) onChannelsDiscovered(newChannels);
        }}
      />

      {/* Add Real Channel Modal */}
      <AddChannelModal
        isOpen={isAddChannelOpen}
        onClose={() => setIsAddChannelOpen(false)}
        onChannelAdded={(newChannel) => {
          if (onAddChannel) onAddChannel(newChannel);
        }}
      />
    </div>
  );
};
