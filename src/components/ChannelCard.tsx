import React, { useState } from 'react';
import { 
  Star, 
  Heart, 
  Eye, 
  ExternalLink, 
  Compass, 
  Clock, 
  Search, 
  Play, 
  Sparkles,
  Telescope,
  Trash2
} from 'lucide-react';
import { ProvenChannel } from '../types';

interface ChannelCardProps {
  channel: ProvenChannel;
  isBookmarked: boolean;
  isLiked: boolean;
  onToggleBookmark: (channelId: string) => void;
  onToggleLike: (channelId: string) => void;
  onSelectChannel: (channel: ProvenChannel) => void;
  onHuntNiche: (channel: ProvenChannel) => void;
  onDeleteChannel?: (channelId: string) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isBookmarked,
  isLiked,
  onToggleBookmark,
  onToggleLike,
  onSelectChannel,
  onHuntNiche,
  onDeleteChannel
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Style Badge styling helper
  const getStyleBadgeColor = (style: string) => {
    switch (style) {
      case '3D Animation':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-[#2E2442] dark:text-[#D8B4FE] dark:border-[#4C3B6B]';
      case 'Whiteboard Animation':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#3D2E1A] dark:text-[#FDE68A] dark:border-[#664D2B]';
      case 'AI 2D':
        return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-[#38203E] dark:text-[#F0ABFC] dark:border-[#5E3669]';
      case '2D Animation':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-[#1C2C4A] dark:text-[#93C5FD] dark:border-[#2B477A]';
      case 'Stock Footage':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#222733] dark:text-[#CBD5E1] dark:border-[#333C4E]';
    }
  };

  // Niche Badge styling helper
  const getNicheBadgeColor = (niche: string) => {
    switch (niche) {
      case 'History':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-[#1C2C4A] dark:text-[#93C5FD] dark:border-[#2B477A]';
      case 'Finance':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-[#133E2B] dark:text-[#86EFAC] dark:border-[#1E5D42]';
      case 'Fitness':
      case 'Fitness & Health':
        return 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-[#143E38] dark:text-[#99F6E4] dark:border-[#23665D]';
      case 'Health':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-[#133D48] dark:text-[#A5F3FC] dark:border-[#215E6F]';
      case 'Psychology':
        return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-[#321F45] dark:text-[#D8B4FE] dark:border-[#523370]';
      case 'Relationships':
        return 'bg-pink-50 text-pink-800 border-pink-200 dark:bg-[#3D1A2C] dark:text-[#F472B6] dark:border-[#632947]';
      case 'True Crime':
      case 'Crime':
        return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-[#451B24] dark:text-[#FCA5A5] dark:border-[#702C3B]';
      case 'Gaming':
        return 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 dark:bg-[#3B1948] dark:text-[#F0ABFC] dark:border-[#632777]';
      case 'Sports':
      case 'Sport':
        return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-[#15384D] dark:text-[#7DD3FC] dark:border-[#225778]';
      case 'Food':
      case 'Culture & Food':
        return 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-[#422615] dark:text-[#FDBA74] dark:border-[#693E23]';
      case 'Travel':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#3D2E17] dark:text-[#FCD34D] dark:border-[#634B24]';
      case 'Science':
        return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-[#192F4D] dark:text-[#93C5FD] dark:border-[#2A4D7E]';
      case 'Space':
        return 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-[#2B1F4B] dark:text-[#C4B5FD] dark:border-[#46337A]';
      case 'Technology':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-[#153B47] dark:text-[#67E8F9] dark:border-[#235F73]';
      case 'AI':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-[#28214D] dark:text-[#A5B4FC] dark:border-[#43387F]';
      case 'Cars':
        return 'bg-red-50 text-red-800 border-red-200 dark:bg-[#421D1D] dark:text-[#FCA5A5] dark:border-[#692F2F]';
      case 'Military':
        return 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-[#2E2D2B] dark:text-[#D6D3D1] dark:border-[#4B4946]';
      case 'Animals':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-[#423B17] dark:text-[#FEF08A] dark:border-[#665B24]';
      case 'Nature':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-[#183B2B] dark:text-[#86EFAC] dark:border-[#276147]';
      case 'Business':
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#222938] dark:text-[#CBD5E1] dark:border-[#38435C]';
      case 'Real Estate':
        return 'bg-lime-50 text-lime-800 border-lime-200 dark:bg-[#253B18] dark:text-[#BEF264] dark:border-[#3E5F27]';
      case 'Crypto':
        return 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-[#423315] dark:text-[#FDE047] dark:border-[#6E5524]';
      case 'Celebrities':
        return 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-[#3B1A44] dark:text-[#F5D0FE] dark:border-[#5E2B6D]';
      case 'Luxury':
        return 'bg-yellow-50 text-amber-900 border-amber-300 dark:bg-[#473B1B] dark:text-[#FDE68A] dark:border-[#735F2B]';
      case 'Religion':
        return 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-[#143E38] dark:text-[#99F6E4] dark:border-[#23665D]';
      case 'Education':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-[#1D3B47] dark:text-[#A5F3FC] dark:border-[#2C5F73]';
      case 'Entertainment':
        return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-[#3D1D48] dark:text-[#E879F9] dark:border-[#632F75]';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-[#2D3342] dark:text-[#E2E8F0] dark:border-[#434C61]';
    }
  };

  // Success Rating Badge styling helper
  const getSuccessBadgeColor = (success: string) => {
    switch (success) {
      case 'Really Good':
        return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-[#1D3E6B] dark:text-[#93C5FD] dark:border-[#2E60A3]';
      case 'Good':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-[#16432D] dark:text-[#86EFAC] dark:border-[#246B48]';
      case 'Okay':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#403B1A] dark:text-[#FEF08A] dark:border-[#665E29]';
      case 'Low Views':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#1A2536] dark:text-[#94A3B8] dark:border-[#2C3B52]';
    }
  };

  return (
    <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 group shadow-sm hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl">
      {/* Top Section: Realistic YouTube Channel Preview Window (White Theme) */}
      <div 
        onClick={() => onSelectChannel(channel)}
        className="bg-white text-neutral-900 p-3.5 relative cursor-pointer select-none transition-colors border-b border-black/[0.06]"
      >
        {/* Star Bookmark Button (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(channel.id);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-amber-500 transition-colors z-10 cursor-pointer"
          title={isBookmarked ? 'Saved' : 'Save to Favorites'}
        >
          <Star 
            className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : 'text-neutral-400'}`} 
          />
        </button>

        {/* Channel Header Banner Row */}
        <div className="flex items-start space-x-2.5 pr-8">
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
            className="w-10 h-10 rounded-full object-cover ring-1 ring-black/10 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-neutral-950 truncate leading-tight">
              {channel.name}
            </h4>
            <div className="text-[10px] text-neutral-500 truncate font-medium">
              {channel.handle} • {channel.subscribers} • {channel.videoCount} videos
            </div>
            <div className="text-[10px] text-neutral-600 line-clamp-1 mt-0.5">
              {channel.bio}
            </div>
          </div>
        </div>

        {/* YouTube Channel Action Buttons Row */}
        <div className="mt-2.5 flex items-center space-x-1.5 text-[10px] font-semibold">
          <span className="bg-neutral-900 text-white px-2.5 py-0.8 rounded-full">
            Subscribe
          </span>
          <span className="bg-neutral-100 text-neutral-700 px-2 py-0.8 rounded-full border border-neutral-200">
            ★ Join
          </span>
          <span className="bg-neutral-100 text-neutral-700 px-2 py-0.8 rounded-full border border-neutral-200">
            👥 Community
          </span>
        </div>

        {/* Sub-Navigation Tabs Row inside Channel Preview */}
        <div className="mt-2.5 flex items-center justify-between border-b border-neutral-200 pb-1 text-[10px] text-neutral-600 font-medium">
          <div className="flex space-x-2.5">
            <span className="hover:text-black">Home</span>
            <span className="text-black font-bold border-b-2 border-black pb-1 -mb-1">Videos</span>
            <span className="hover:text-black">Playlists</span>
            <span className="hover:text-black">Posts</span>
          </div>
          <Search className="w-3 h-3 text-neutral-400" />
        </div>

        {/* Filter Pills row inside Channel */}
        <div className="mt-2 flex items-center space-x-1 text-[9px] font-semibold">
          <span className="px-1.5 py-0.5 rounded text-neutral-500">Latest</span>
          <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-white">Popular</span>
          <span className="px-1.5 py-0.5 rounded text-neutral-500">Oldest</span>
        </div>

        {/* 3 Video Cards Row */}
        <div className="mt-2 grid grid-cols-3 gap-1.5">
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
                <div className="relative aspect-video rounded overflow-hidden bg-neutral-900 shadow-xs">
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
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
                      <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                    </div>
                  </div>
                  {video.duration && (
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] font-mono px-1 rounded font-semibold">
                      {video.duration}
                    </span>
                  )}
                </div>
                <h5 className="text-[9px] font-bold text-neutral-900 group-hover/vid:text-red-600 transition-colors line-clamp-2 mt-1 leading-snug">
                  {video.title}
                </h5>
                <div className="text-[8px] text-neutral-500 mt-0.5">
                  {video.views} • {video.timeAgo}
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Channel Info & Tag Badges */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 bg-white dark:bg-[#14151a]">
        <div>
          {/* Channel Name */}
          <h3 
            onClick={() => onSelectChannel(channel)}
            className="text-sm font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer truncate"
          >
            {channel.name}
          </h3>

          {/* Badges Row */}
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            {/* Style Badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStyleBadgeColor(channel.style)}`}>
              {channel.style}
            </span>

            {/* Niche Badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getNicheBadgeColor(channel.niche)}`}>
              {channel.niche}
            </span>

            {/* Success Badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSuccessBadgeColor(channel.success)}`}>
              {channel.success}
            </span>
          </div>

          {/* Description snippet */}
          <p className="mt-2.5 text-xs text-slate-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {channel.description}
          </p>
        </div>

        {/* Footer Meta & Action Row */}
        <div>
          {/* Discovered timestamp */}
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 flex items-center space-x-1.5 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-600"></span>
            <span>Discovered {channel.discoveredAt}</span>
          </div>

          {/* Action Button Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            {/* Likes & Comments */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onToggleLike(channel.id)}
                className={`flex items-center space-x-1 transition-colors cursor-pointer ${
                  isLiked ? 'text-rose-500 font-semibold' : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Like this niche"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span className="text-[11px] font-medium">{channel.likes}</span>
              </button>

              <button
                onClick={() => onSelectChannel(channel)}
                className="flex items-center space-x-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="View details & comments"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">{channel.commentCount}</span>
              </button>
            </div>

            {/* Action buttons: Hunt niche & YouTube */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onHuntNiche(channel)}
                className="flex items-center space-x-1 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 dark:text-sky-400 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 dark:border-sky-500/20 font-semibold px-2 py-1 rounded transition-all cursor-pointer text-[11px]"
                title="Hunt this niche with AI Copilot"
              >
                <Telescope className="w-3 h-3" />
                <span>Hunt niche</span>
              </button>

              <a
                href={channel.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-neutral-300 dark:hover:text-white px-2 py-1 rounded dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:border-white/[0.08] transition-colors text-[11px] font-medium"
                title="Open on YouTube"
              >
                <Play className="w-2.5 h-2.5 fill-current text-red-500" />
                <span>YouTube</span>
              </a>

              {onDeleteChannel && (
                confirmDelete ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChannel(channel.id);
                    }}
                    className="flex items-center space-x-1 text-rose-700 bg-rose-50 border border-rose-300 dark:text-rose-300 dark:bg-rose-950/80 dark:border-rose-500/50 px-2 py-1 rounded text-[10px] font-bold hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors cursor-pointer animate-pulse"
                    title="Confirm deletion"
                  >
                    <span>Delete?</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(true);
                      setTimeout(() => setConfirmDelete(false), 3500);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-neutral-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                    title="Delete channel from cards"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
