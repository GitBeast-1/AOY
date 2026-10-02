import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Eye, 
  Layers, 
  Filter, 
  Check, 
  Copy,
  Zap,
  TrendingUp,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Shuffle,
  ChevronDown,
  Info,
  Sliders,
  CheckCircle2,
  Play
} from 'lucide-react';
import { ProvenChannel, SavedThumbnail } from '../types';

interface ThumbsViewProps {
  channels: ProvenChannel[];
  savedThumbnails?: SavedThumbnail[];
  activePreviewIds?: string[];
  onSaveThumbnail: (thumb: Partial<SavedThumbnail>) => Promise<any>;
  onDeleteThumbnail: (id: string) => Promise<any>;
  onUpdatePreviewSlots: (ids: string[]) => Promise<any>;
  onImportThumbnail: (payload: any) => Promise<any>;
}

export const ThumbsView: React.FC<ThumbsViewProps> = ({ 
  channels,
  savedThumbnails = [],
  activePreviewIds = [],
  onSaveThumbnail,
  onDeleteThumbnail,
  onUpdatePreviewSlots,
  onImportThumbnail
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'extension' | 'research' | 'channels'>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSlotMenu, setActiveSlotMenu] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedDownloadUrl, setCopiedDownloadUrl] = useState(false);

  const handleDownloadExtension = async () => {
    setIsDownloading(true);
    try {
      const endpoints = ['/api/download-extension', '/downloads/aoy-youtube-extension.zip'];
      let res: Response | null = null;
      for (const ep of endpoints) {
        try {
          const attempt = await fetch(ep);
          if (attempt.ok) {
            res = attempt;
            break;
          }
        } catch (e) {}
      }

      if (!res || !res.ok) {
        throw new Error('Failed to fetch extension archive');
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = 'aoy-youtube-extension.zip';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (err) {
      console.warn('Programmatic download fallback triggered:', err);
      // Fallback: direct window open with absolute URL
      const fallbackUrl = window.location.origin + '/downloads/aoy-youtube-extension.zip';
      window.open(fallbackUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyDownloadUrl = () => {
    const fullUrl = window.location.origin + '/downloads/aoy-youtube-extension.zip';
    navigator.clipboard.writeText(fullUrl);
    setCopiedDownloadUrl(true);
    setTimeout(() => setCopiedDownloadUrl(false), 2500);
  };

  // Fallback defaults if list is empty
  const defaultThumbsList: SavedThumbnail[] = [
    {
      id: 'thumb-magnates-1',
      videoId: 'Wk1d8TvdB70',
      title: 'The Billion Dollar Scam You Never Heard Of',
      thumbnailUrl: 'https://i.ytimg.com/vi/Wk1d8TvdB70/hqdefault.jpg',
      channelName: 'MagnatesMedia',
      channelAvatar: 'https://ui-avatars.com/api/?name=Magnates+Media&background=0F172A&color=F59E0B&bold=true&size=160',
      views: '6.8M views',
      timeAgo: '1 year ago',
      likes: '142K',
      commentCount: '4.8K',
      duration: '32:14',
      source: 'proven-channel',
      sourceUrl: 'https://www.youtube.com/watch?v=Wk1d8TvdB70',
      niche: 'Business',
      notes: 'Rule #1 Asymmetry: High-contrast gold & shadow with ominous question hook.',
      contrastScore: 95,
      addedAt: Date.now() - 3600000 * 48
    },
    {
      id: 'thumb-coldfusion-1',
      videoId: '2nB1yW-O-8A',
      title: 'How 1 Line of Code Crashed the Global Economy (CrowdStrike)',
      thumbnailUrl: 'https://i.ytimg.com/vi/2nB1yW-O-8A/hqdefault.jpg',
      channelName: 'ColdFusion',
      channelAvatar: 'https://ui-avatars.com/api/?name=ColdFusion&background=0F172A&color=38BDF8&bold=true&size=160',
      views: '3.9M views',
      timeAgo: '6 months ago',
      likes: '112K',
      commentCount: '4.8K',
      duration: '24:18',
      source: 'proven-channel',
      sourceUrl: 'https://www.youtube.com/watch?v=2nB1yW-O-8A',
      niche: 'Technology',
      notes: 'Rule #2: 1-word text hook "FATAL ERROR" with high-contrast radar trace.',
      contrastScore: 96,
      addedAt: Date.now() - 3600000 * 24
    },
    {
      id: 'thumb-neo-1',
      videoId: 'XQxK-1vH_Y8',
      title: "Why Germany Doesn't Have Skyscrapers",
      thumbnailUrl: 'https://i.ytimg.com/vi/XQxK-1vH_Y8/hqdefault.jpg',
      channelName: 'Neo',
      channelAvatar: 'https://ui-avatars.com/api/?name=Neo&background=1E293B&color=38BDF8&bold=true&size=160',
      views: '5.2M views',
      timeAgo: '1 year ago',
      likes: '168K',
      commentCount: '7.2K',
      duration: '14:22',
      source: 'proven-channel',
      sourceUrl: 'https://www.youtube.com/watch?v=XQxK-1vH_Y8',
      niche: 'Education',
      notes: 'Rule #3: Isometric map graphic with bold query and high contrast outline.',
      contrastScore: 93,
      addedAt: Date.now() - 3600000 * 12
    }
  ];

  // Combined pool of thumbnails
  const fullVault: SavedThumbnail[] = savedThumbnails.length > 0 ? savedThumbnails : defaultThumbsList;

  // Active 3 thumbnails for the main YouTube Feed Preview
  const active3Thumbs: SavedThumbnail[] = (() => {
    if (activePreviewIds.length >= 3) {
      const mapped = activePreviewIds.map(id => fullVault.find(t => t.id === id)).filter(Boolean) as SavedThumbnail[];
      if (mapped.length === 3) return mapped;
    }
    return fullVault.slice(0, 3);
  })();

  // Filtered vault items
  const filteredVault = fullVault.filter(t => {
    if (selectedFilter === 'extension') return t.source === 'youtube-extension';
    if (selectedFilter === 'research') return t.source === 'research';
    if (selectedFilter === 'channels') return t.source === 'proven-channel';
    return true;
  });

  const handleCopyJson = (thumb: SavedThumbnail) => {
    navigator.clipboard.writeText(JSON.stringify(thumb, null, 2));
    setCopiedId(thumb.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSetSlotThumb = async (slotIndex: number, targetThumbId: string) => {
    const nextSlots = [...active3Thumbs.map(t => t.id)];
    while (nextSlots.length < 3) {
      const unused = fullVault.find(t => !nextSlots.includes(t.id));
      if (unused) nextSlots.push(unused.id);
      else break;
    }
    nextSlots[slotIndex] = targetThumbId;
    await onUpdatePreviewSlots(nextSlots);
    setActiveSlotMenu(null);
  };

  const handleShufflePreview = async () => {
    if (fullVault.length <= 3) return;
    const shuffled = [...fullVault].sort(() => 0.5 - Math.random()).slice(0, 3).map(t => t.id);
    await onUpdatePreviewSlots(shuffled);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importInput.trim()) return;
    setIsSubmitting(true);

    try {
      let payload: any;
      // Check if it's pasted JSON from the extension
      if (importInput.trim().startsWith('{')) {
        payload = JSON.parse(importInput);
      } else {
        // Plain URL or Video ID
        payload = { url: importInput.trim() };
      }

      await onImportThumbnail(payload);
      setImportInput('');
      setIsImportModalOpen(false);
    } catch (err) {
      alert('Could not parse input. Please paste a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=...) or JSON copied from the AOY Extension.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Top Banner & Title */}
      <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>High-CTR Thumbnail Studio & Simulator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>YouTube Feed Preview (3 Large Thumbnails)</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Live Mockup
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Simulate how your video thumbnail and title perform side-by-side in the real YouTube desktop feed. Save thumbnails from the Research tab or capture them directly from YouTube.com with the 1-click Chrome Extension.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsExtensionModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>YouTube Chrome Extension</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-[#181a20] dark:hover:bg-[#22252e] text-slate-800 dark:text-neutral-200 font-bold rounded-xl text-xs flex items-center space-x-2 border border-slate-200 dark:border-white/[0.08] shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>Import / Paste Video</span>
          </button>

          <button
            onClick={handleShufflePreview}
            title="Shuffle preview slots with random saved thumbnails"
            className="p-2 bg-white hover:bg-slate-50 dark:bg-[#181a20] dark:hover:bg-[#22252e] text-slate-600 dark:text-neutral-400 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-xs cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. AUTHENTIC YOUTUBE FEED PREVIEW (3 LARGE THUMBNAILS SIDE-BY-SIDE)      */}
      {/* ========================================================================= */}
      <div className="bg-[#0f0f0f] text-white rounded-3xl p-5 sm:p-7 border border-neutral-800 shadow-2xl relative overflow-hidden">
        {/* Mock YouTube Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-4 bg-red-600 rounded flex items-center justify-center">
                <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white font-sans hidden sm:inline">YouTube Browse Feed Simulator</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-neutral-400">
            <span className="hidden md:inline bg-neutral-900 border border-white/10 px-2.5 py-1 rounded-full text-[10px] font-mono">
              Desktop 1920x1080 Grid Ratio
            </span>
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> 3 Large Thumbnails
            </span>
          </div>
        </div>

        {/* 3 LARGE THUMBNAIL CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {active3Thumbs.map((item, idx) => (
            <div 
              key={item.id || idx}
              className="flex flex-col group relative bg-neutral-900/60 rounded-2xl p-2.5 border border-white/[0.06] hover:border-amber-500/40 transition-all duration-200"
            >
              {/* Slot Badge & Quick Swap Action */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    idx === 0 
                      ? 'bg-amber-500 text-black' 
                      : 'bg-white/10 text-neutral-300'
                  }`}>
                    {idx === 0 ? 'Slot 1 • Hero' : `Slot ${idx + 1} • Competitor`}
                  </span>
                  {item.contrastScore && (
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      {item.contrastScore}% CTR
                    </span>
                  )}
                </div>

                {/* Slot Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setActiveSlotMenu(activeSlotMenu === idx ? null : idx)}
                    className="text-[11px] text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <span>Swap</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeSlotMenu === idx && (
                    <div className="absolute right-0 top-full mt-1 w-64 max-h-60 overflow-y-auto bg-neutral-950 border border-white/20 rounded-xl shadow-2xl p-1.5 z-50">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1 border-b border-white/10 mb-1">
                        Select Thumbnail for Slot {idx + 1}
                      </div>
                      {fullVault.map(v => (
                        <button
                          key={v.id}
                          onClick={() => handleSetSlotThumb(idx, v.id)}
                          className="w-full text-left p-1.5 rounded-lg hover:bg-amber-500/20 flex items-center space-x-2 text-xs transition-colors cursor-pointer group"
                        >
                          <img src={v.thumbnailUrl} className="w-12 h-7 rounded object-cover flex-shrink-0" alt="" />
                          <div className="truncate flex-1">
                            <div className="text-neutral-200 group-hover:text-amber-400 text-[11px] font-bold truncate">
                              {v.title}
                            </div>
                            <div className="text-[10px] text-neutral-500 truncate">{v.channelName}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 16:9 Large Thumbnail Container */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/60 shadow-lg cursor-pointer">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/85 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded tracking-tight">
                  {item.duration || '15:20'}
                </div>

                {/* Source Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm ${
                    item.source === 'youtube-extension' 
                      ? 'bg-red-600 text-white' 
                      : item.source === 'research'
                      ? 'bg-sky-600 text-white'
                      : 'bg-black/70 text-neutral-300'
                  }`}>
                    {item.source === 'youtube-extension' ? 'YT Extension' : item.source === 'research' ? 'Research Tab' : 'Outlier Pool'}
                  </span>
                </div>
              </div>

              {/* Authentic YouTube Title & Channel Metadata */}
              <div className="mt-3 flex items-start space-x-3 px-1">
                {/* Channel Avatar */}
                <img
                  src={item.channelAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={item.channelName}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-white/10 mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  {/* YouTube Video Title */}
                  <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Channel Name with Checkmark */}
                  <div className="text-xs text-neutral-400 hover:text-white mt-1 flex items-center space-x-1 cursor-pointer">
                    <span className="truncate">{item.channelName}</span>
                    <CheckCircle2 className="w-3 h-3 text-neutral-400 fill-neutral-400 text-black flex-shrink-0" />
                  </div>

                  {/* Views & Timestamp */}
                  <div className="text-xs text-neutral-400 flex items-center space-x-1.5 mt-0.5">
                    <span>{item.views}</span>
                    <span>•</span>
                    <span>{item.timeAgo || '3 weeks ago'}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar on Card */}
              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 px-1">
                <button
                  onClick={() => handleCopyJson(item)}
                  className="hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy Data'}</span>
                </button>

                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <button
                  onClick={() => onDeleteThumbnail(item.id)}
                  title="Remove from vault"
                  className="hover:text-rose-400 cursor-pointer transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 3 PSYCHOLOGICAL RULES OF HIGH-CTR THUMBNAILS                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4.5 rounded-2xl space-y-1.5 shadow-xs">
          <div className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Rule #1: The Asymmetry Focal Point</span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Never Center the Primary Subject</h3>
          <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
            Position the unexpected element in the left or right 1/3 grid intersection, leaving 60% negative space to guide the eye directly to the curiosity trigger before reading the title.
          </p>
        </div>

        <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4.5 rounded-2xl space-y-1.5 shadow-xs">
          <div className="text-[10px] font-extrabold uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Rule #2: Strict 1-2 Word Hook Cap</span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Avoid Duplicating the Title</h3>
          <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
            Outlier faceless channels like MagnatesMedia and Neo use bold monochrome words ("MISTAKE", "WHY?", "NOT SAFE") that complete a psychological sentence when paired with the headline.
          </p>
        </div>

        <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4.5 rounded-2xl space-y-1.5 shadow-xs">
          <div className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center space-x-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Rule #3: Cadmium / Cyan Lighting</span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Cinematic Rim Light Edge Contrast</h3>
          <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
            Edge lighting separates organic subjects from dark background slates, increasing mobile scroll-stop CTR by up to 4.2% in congested search feeds.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SAVED THUMBNAIL VAULT (RESEARCH + EXTENSION + OUTLIERS)                */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.06] pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Thumbnail Vault & Saved Outlier Library ({filteredVault.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Thumbnails collected via Research tab, the Chrome Extension on YouTube.com, and top proven channels.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-[#14151a] p-1 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold dark:bg-amber-500 dark:text-black'
                  : 'text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              All ({fullVault.length})
            </button>
            <button
              onClick={() => setSelectedFilter('extension')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'extension'
                  ? 'bg-white text-slate-900 shadow-xs font-bold dark:bg-amber-500 dark:text-black'
                  : 'text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              From Extension ({fullVault.filter(t => t.source === 'youtube-extension').length})
            </button>
            <button
              onClick={() => setSelectedFilter('research')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'research'
                  ? 'bg-white text-slate-900 shadow-xs font-bold dark:bg-amber-500 dark:text-black'
                  : 'text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              Research Tab ({fullVault.filter(t => t.source === 'research').length})
            </button>
            <button
              onClick={() => setSelectedFilter('channels')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'channels'
                  ? 'bg-white text-slate-900 shadow-xs font-bold dark:bg-amber-500 dark:text-black'
                  : 'text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              Outliers ({fullVault.filter(t => t.source === 'proven-channel').length})
            </button>
          </div>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVault.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2] rounded-2xl overflow-hidden flex flex-col justify-between group transition-all shadow-xs hover:shadow-md"
            >
              <div>
                <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      {item.duration}
                    </span>
                  )}
                  <span className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    item.source === 'youtube-extension' 
                      ? 'bg-red-600 text-white' 
                      : item.source === 'research'
                      ? 'bg-sky-600 text-white'
                      : 'bg-black/70 text-neutral-300'
                  }`}>
                    {item.source === 'youtube-extension' ? 'Extension' : item.source === 'research' ? 'Research' : 'Outlier'}
                  </span>
                </div>

                <div className="p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                    <span className="truncate max-w-[120px] font-medium">{item.channelName}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{item.views}</span>
                  </div>
                </div>
              </div>

              {/* Pin to Preview Buttons */}
              <div className="p-3 pt-0 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handleSetSlotThumb(0, item.id)}
                  className="flex-1 py-1 bg-slate-100 hover:bg-amber-500/20 text-slate-700 hover:text-amber-700 dark:bg-white/[0.04] dark:hover:bg-amber-500/20 dark:text-neutral-300 dark:hover:text-amber-400 rounded-lg text-[10px] font-bold transition-colors cursor-pointer text-center"
                  title="Place into Slot 1 of the 3-Thumbnail Preview deck"
                >
                  Pin Slot 1
                </button>
                <button
                  onClick={() => handleSetSlotThumb(1, item.id)}
                  className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] dark:text-neutral-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer text-center"
                  title="Place into Slot 2 of the 3-Thumbnail Preview deck"
                >
                  Slot 2
                </button>
                <button
                  onClick={() => handleSetSlotThumb(2, item.id)}
                  className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] dark:text-neutral-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer text-center"
                  title="Place into Slot 3 of the 3-Thumbnail Preview deck"
                >
                  Slot 3
                </button>
                <button
                  onClick={() => onDeleteThumbnail(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                  title="Delete from Vault"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CHROME EXTENSION DOWNLOAD & 15-SECOND INSTALLATION INSTRUCTIONS */}
      {/* ========================================================================= */}
      {isExtensionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.1] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-md">
                  ⚡
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    AOY YouTube Copilot Chrome Extension
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Capture thumbnails, titles, avatars, views & likes directly on YouTube.com
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExtensionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Direct Download Button */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Ready to Install (.ZIP Archive)
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  Manifest V3 • Auto-injects "⚡ Copy to AOY Thumbs" button on YouTube video watch pages.
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadExtension}
                  disabled={isDownloading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Downloading...' : 'Download Extension (.zip)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyDownloadUrl}
                  title="Copy direct absolute download URL"
                  className="p-2.5 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                >
                  {copiedDownloadUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4 Quick Steps */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                How to Install in Google Chrome (15 Seconds):
              </h4>

              <div className="space-y-2 text-xs text-slate-700 dark:text-neutral-300">
                <div className="flex items-start space-x-2.5 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <strong>Download & Unzip:</strong> Click the button above and extract the downloaded <code className="bg-slate-200 dark:bg-neutral-800 px-1 py-0.5 rounded text-[11px]">aoy-youtube-extension.zip</code> to a folder.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <strong>Open Chrome Extensions:</strong> In Chrome, go to <code className="bg-slate-200 dark:bg-neutral-800 px-1 py-0.5 rounded text-[11px]">chrome://extensions</code> in your address bar.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <strong>Developer Mode & Load:</strong> Toggle <em>"Developer mode"</em> (top right), then click <em>"Load unpacked"</em> and select the unzipped <code className="bg-slate-200 dark:bg-neutral-800 px-1 py-0.5 rounded text-[11px]">extension</code> folder.
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">4</span>
                  <div>
                    <strong>Open YouTube.com:</strong> Navigate to any video on YouTube. Look right below the video title and click <strong>"⚡ Copy to AOY Thumbs"</strong> to capture thumbnail, title, channel avatar, and metrics directly!
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsExtensionModalOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: IMPORT YOUTUBE URL OR PASTE EXTENSION JSON                       */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.1] rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Import YouTube Video or Extension Data
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Paste any YouTube watch URL or the JSON string copied from the Chrome Extension.
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
                  YouTube Video Link or JSON Payload
                </label>
                <textarea
                  rows={4}
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=q8U2X7y6j1M&#10;or paste JSON data copied from the Chrome extension..."
                  className="w-full bg-slate-50 dark:bg-neutral-900/90 border border-slate-200 dark:border-white/[0.1] rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  ⚡ Auto-extracts maxresdefault (1280x720) HD preview.
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Importing...' : 'Add to 3-Preview Deck'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
