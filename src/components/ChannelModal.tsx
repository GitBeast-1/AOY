import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Heart, 
  Eye, 
  ExternalLink, 
  Play, 
  Telescope, 
  Image as ImageIcon, 
  Sparkles, 
  Plus, 
  Check, 
  Layers, 
  Copy,
  Zap,
  TrendingUp,
  Search,
  Trash2
} from 'lucide-react';
import { ProvenChannel, NicheHuntAnalysis } from '../types';
import { api } from '../services/api';

interface ChannelModalProps {
  channel: ProvenChannel | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  isLiked: boolean;
  onToggleBookmark: (channelId: string) => void;
  onToggleLike: (channelId: string) => void;
  onSaveIdea: (idea: any) => void;
  onDeleteChannel?: (channelId: string) => void;
}

export const ChannelModal: React.FC<ChannelModalProps> = ({
  channel,
  isOpen,
  onClose,
  isBookmarked,
  isLiked,
  onToggleBookmark,
  onToggleLike,
  onSaveIdea,
  onDeleteChannel
}) => {
  const [huntData, setHuntData] = useState<NicheHuntAnalysis | null>(null);
  const [isHunting, setIsHunting] = useState(false);
  const [showFullPicture, setShowFullPicture] = useState(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);
  const [savedTitleIndex, setSavedTitleIndex] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !channel) return null;

  const handleRunHunt = async () => {
    setIsHunting(true);
    try {
      const result = await api.huntNiche(channel.id);
      setHuntData(result);
    } catch (err) {
      console.error('Failed to hunt niche:', err);
    } finally {
      setIsHunting(false);
    }
  };

  const handleCopyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedTitleIndex(index);
    setTimeout(() => setCopiedTitleIndex(null), 2000);
  };

  const handleAddIdeaToWorkspace = (title: string, index: number) => {
    onSaveIdea({
      title,
      niche: channel.niche,
      style: channel.style,
      targetMultiplier: '30x+',
      hook: `Modeled after ${channel.name} format.`,
      notes: `Complexity: ${channel.complexity}. Discovered on AOY Niche Hunter.`,
      status: 'backlog'
    });
    setSavedTitleIndex(index);
    setTimeout(() => setSavedTitleIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/[0.12] rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button in corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md border border-slate-200/80 dark:bg-black/60 dark:hover:bg-black/90 dark:text-white/80 dark:hover:text-white dark:border-transparent transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top YouTube Channel Preview Box (matching Screenshot 4) */}
        <div className="bg-white text-neutral-900 p-5 rounded-t-2xl relative select-none border-b border-slate-100 dark:border-black/[0.06]">
          {/* Header Row */}
          <div className="flex items-start space-x-3.5 pr-10">
            <img
              src={channel.avatar}
              alt={channel.name}
              onError={(e) => {
                const target = e.currentTarget;
                const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=0F172A&color=F59E0B&bold=true&size=160`;
                if (target.src !== fallbackUrl) {
                  target.src = fallbackUrl;
                }
              }}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-black/10 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-neutral-950 truncate">
                {channel.name}
              </h2>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">
                {channel.handle} • {channel.subscribers} • {channel.videoCount} videos
              </div>
              <div className="text-xs text-neutral-600 line-clamp-1 mt-1">
                {channel.bio}
              </div>
            </div>
          </div>

          {/* YouTube Action Buttons */}
          <div className="mt-3 flex items-center space-x-2 text-xs font-semibold">
            <span className="bg-neutral-900 text-white px-3.5 py-1.5 rounded-full">
              Subscribe
            </span>
            <span className="bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-full border border-neutral-200">
              ★ Join
            </span>
            <span className="bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-full border border-neutral-200">
              👥 Community
            </span>
          </div>

          {/* Channel Tabs */}
          <div className="mt-3.5 flex items-center justify-between border-b border-neutral-200 pb-1 text-xs text-neutral-600 font-medium">
            <div className="flex space-x-4">
              <span className="hover:text-black">Home</span>
              <span className="text-black font-bold border-b-2 border-black pb-1 -mb-1">Videos</span>
              <span className="hover:text-black">Playlists</span>
              <span className="hover:text-black">Posts</span>
            </div>
            <Search className="w-4 h-4 text-neutral-400" />
          </div>

          {/* Subtabs */}
          <div className="mt-2.5 flex items-center space-x-1.5 text-xs font-semibold">
            <span className="px-2.5 py-0.5 rounded text-neutral-500">Latest</span>
            <span className="px-2.5 py-0.5 rounded bg-neutral-900 text-white">Popular</span>
            <span className="px-2.5 py-0.5 rounded text-neutral-500">Oldest</span>
          </div>

          {/* 3 Video Cards Row */}
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {channel.topVideos.map((video, idx) => {
              const videoWatchUrl = video.youtubeId
                ? `https://www.youtube.com/watch?v=${video.youtubeId}`
                : channel.youtubeUrl;

              return (
                <a
                  key={idx}
                  href={videoWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="group/vid flex flex-col no-underline cursor-pointer"
                  title={`Watch "${video.title}" on YouTube`}
                >
                  <div className="relative aspect-video rounded-md overflow-hidden bg-neutral-900 shadow-xs">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (video.youtubeId && !img.src.includes('mqdefault')) {
                          img.src = `https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`;
                        }
                      }}
                      className="w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-200"
                    />
                    {/* Play Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/vid:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
                        <Play className="w-3 h-3 fill-white ml-0.5" />
                      </div>
                    </div>
                    {video.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono px-1 rounded font-semibold">
                        {video.duration}
                      </span>
                    )}
                  </div>
                  <h5 className="text-[11px] font-bold text-neutral-900 group-hover/vid:text-red-600 transition-colors line-clamp-2 mt-1.5 leading-snug">
                    {video.title}
                  </h5>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {video.views} • {video.timeAgo}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Modal Action Ribbon (matching Screenshot 4) */}
        <div className="bg-slate-50 dark:bg-[#18191e] px-6 py-3 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => onToggleLike(channel.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/90 shadow-xs dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-transparent transition-colors cursor-pointer ${
                isLiked ? 'text-rose-500' : 'text-slate-700 dark:text-neutral-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
              <span className="font-semibold">{channel.likes}</span>
            </button>

            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-xs dark:bg-white/[0.04] dark:border-transparent text-slate-700 dark:text-neutral-300">
              <Eye className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
              <span className="font-semibold">{channel.commentCount}</span>
            </div>

            <button
              onClick={handleRunHunt}
              disabled={isHunting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 shadow-xs dark:bg-sky-500/20 dark:hover:bg-sky-500/30 dark:text-sky-300 dark:border-sky-500/30 transition-all font-semibold cursor-pointer disabled:opacity-50"
            >
              <Telescope className={`w-4 h-4 ${isHunting ? 'animate-spin' : ''}`} />
              <span>{isHunting ? 'Hunting...' : 'Hunt niche'}</span>
            </button>

            <button
              onClick={() => setShowFullPicture(!showFullPicture)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-xs dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-300 dark:border-white/[0.08] transition-colors font-semibold cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
              <span>Full picture</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {onDeleteChannel && (
              confirmDelete ? (
                <button
                  onClick={() => {
                    onDeleteChannel(channel.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer animate-pulse shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-lg bg-white hover:bg-rose-50 border border-slate-200/90 shadow-xs text-slate-500 hover:text-rose-600 dark:bg-white/[0.05] dark:hover:bg-rose-500/20 dark:border-transparent dark:text-neutral-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Channel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}

            <button
              onClick={() => onToggleBookmark(channel.id)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500 text-black shadow-xs font-bold'
                  : 'bg-white hover:bg-slate-100 border border-slate-200/90 shadow-xs text-slate-500 hover:text-amber-600 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:border-transparent dark:text-neutral-400 dark:hover:text-white'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
            >
              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Modal Body & Metadata (matching Screenshot 4-1) */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {channel.name}
            </h1>
          </div>

          {/* Key-Value Details List */}
          <div className="space-y-4 text-xs">
            {/* Complexity */}
            <div className="flex items-center space-x-6">
              <div className="w-28 text-slate-500 dark:text-neutral-400 font-medium flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-600"></span>
                <span>Complexity</span>
              </div>
              <div>
                <span className={`px-2.5 py-0.8 rounded-full text-xs font-semibold ${
                  channel.complexity === 'Easy'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                    : channel.complexity === 'Medium'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                }`}>
                  {channel.complexity}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start space-x-6">
              <div className="w-28 text-slate-500 dark:text-neutral-400 font-medium flex items-center space-x-2 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-600"></span>
                <span>Description</span>
              </div>
              <p className="flex-1 text-slate-700 dark:text-neutral-300 leading-relaxed text-xs">
                {channel.description}
              </p>
            </div>

            {/* Link */}
            <div className="flex items-center space-x-6">
              <div className="w-28 text-slate-500 dark:text-neutral-400 font-medium flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-600"></span>
                <span>Link</span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={channel.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white underline font-mono text-[11px]"
                >
                  {channel.youtubeUrl.replace('https://', '')}
                </a>
                <a
                  href={channel.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 px-2 py-0.5 rounded text-[11px] font-semibold dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:text-white dark:border-transparent transition-colors"
                >
                  <Play className="w-2.5 h-2.5 fill-current text-red-500" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>

            {/* Niche */}
            <div className="flex items-center space-x-6">
              <div className="w-28 text-slate-500 dark:text-neutral-400 font-medium flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-600"></span>
                <span>Niche</span>
              </div>
              <div>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 dark:bg-[#423B17] dark:text-[#FEF08A] dark:border-[#665B24] px-2.5 py-0.8 rounded-full text-xs font-semibold">
                  {channel.niche}
                </span>
              </div>
            </div>

            {/* Style */}
            <div className="flex items-center space-x-6">
              <div className="w-28 text-slate-500 dark:text-neutral-400 font-medium flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-600"></span>
                <span>Style</span>
              </div>
              <div>
                <span className="bg-slate-100 text-slate-800 border border-slate-200 dark:bg-[#222733] dark:text-[#CBD5E1] dark:border-[#333C4E] px-2.5 py-0.8 rounded-full text-xs font-semibold">
                  {channel.style}
                </span>
              </div>
            </div>

            {/* Success */}
            <div className="flex items-center space-x-6">
              <div className="w-28 text-slate-500 dark:text-neutral-400 font-medium flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-600"></span>
                <span>Success</span>
              </div>
              <div>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-[#16432D] dark:text-[#86EFAC] dark:border-[#246B48] px-2.5 py-0.8 rounded-full text-xs font-semibold">
                  {channel.success}
                </span>
              </div>
            </div>

            {/* Views */}
            <div className="flex items-center space-x-6">
              <div className="w-28 text-slate-500 dark:text-neutral-400 font-medium flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-600"></span>
                <span>Views</span>
              </div>
              <div className="font-mono text-slate-900 dark:text-white font-bold text-xs">
                {channel.views.toLocaleString()}
              </div>
            </div>
          </div>

          {/* AI Niche Hunter Intelligence Dossier */}
          {(huntData || isHunting) && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/[0.08] space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Faceless Copilot: Niche Hunter Intelligence Dossier
                </h3>
              </div>

              {isHunting ? (
                <div className="p-6 bg-sky-50 dark:bg-[#161820] border border-sky-200 dark:border-sky-500/20 rounded-xl text-center text-xs text-sky-700 dark:text-sky-300 animate-pulse">
                  Analyzing channel performance patterns and extracting viral creation playbook...
                </div>
              ) : huntData ? (
                <div className="space-y-4">
                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-[#161820] border border-slate-200 dark:border-white/[0.06] p-3 rounded-xl shadow-xs">
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase">Opportunity Score</div>
                      <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {huntData.nicheOpportunityScore}/100
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#161820] border border-slate-200 dark:border-white/[0.06] p-3 rounded-xl shadow-xs">
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase">Saturation Verdict</div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200 mt-1">
                        {huntData.saturationVerdict}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#161820] border border-slate-200 dark:border-white/[0.06] p-3 rounded-xl shadow-xs">
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400 font-bold uppercase">Estimated RPM</div>
                      <div className="text-lg font-mono font-bold text-amber-600 dark:text-amber-300 mt-0.5">
                        {huntData.averageRPM}
                      </div>
                    </div>
                  </div>

                  {/* Why it works */}
                  <div className="bg-slate-50 dark:bg-[#161820] border border-slate-200 dark:border-white/[0.06] p-4 rounded-xl text-xs text-slate-700 dark:text-neutral-300 leading-relaxed shadow-xs">
                    <strong className="text-sky-700 dark:text-sky-400 block mb-1">Why This Format Works:</strong>
                    {huntData.whyItWorks}
                  </div>

                  {/* Step by Step Workflow */}
                  <div className="bg-slate-50 dark:bg-[#161820] border border-slate-200 dark:border-white/[0.06] p-4 rounded-xl space-y-2 shadow-xs">
                    <strong className="text-slate-800 dark:text-neutral-200 text-xs block mb-1">Faceless Recreation Workflow:</strong>
                    {huntData.recreationWorkflow.map((step, idx) => (
                      <div key={idx} className="text-xs text-slate-600 dark:text-neutral-400 flex items-start space-x-2">
                        <span className="text-sky-600 dark:text-sky-400 font-bold">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* 3 Ready to produce titles */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-600 dark:text-neutral-300 uppercase tracking-wider">
                      3 Ready-To-Film Video Titles:
                    </div>
                    {huntData.threeReadyToFilmTitles.map((title, idx) => (
                      <div 
                        key={idx}
                        className="bg-slate-50 hover:bg-slate-100/80 dark:bg-[#161820] border border-slate-200 dark:border-white/[0.06] hover:border-sky-500/40 p-3 rounded-xl flex items-center justify-between gap-3 transition-colors shadow-xs"
                      >
                        <span className="text-xs font-medium text-slate-900 dark:text-white">{title}</span>
                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleCopyTitle(title, idx)}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-xs dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-300 dark:border-transparent rounded text-xs transition-colors cursor-pointer"
                            title="Copy title"
                          >
                            {copiedTitleIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleAddIdeaToWorkspace(title, idx)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                          >
                            {savedTitleIndex === idx ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            <span>{savedTitleIndex === idx ? 'Added' : 'Save Idea'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
