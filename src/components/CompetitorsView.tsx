import React from 'react';
import { 
  Feather, 
  TrendingUp, 
  ExternalLink, 
  Clock, 
  Users, 
  AlertCircle, 
  Zap,
  Play
} from 'lucide-react';
import { ProvenChannel } from '../types';

interface CompetitorsViewProps {
  channels: ProvenChannel[];
  onSelectChannel: (channel: ProvenChannel) => void;
}

export const CompetitorsView: React.FC<CompetitorsViewProps> = ({
  channels,
  onSelectChannel
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Feather className="w-4 h-4" />
            <span>Channel Surveillance & Competitor Benchmarking</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Track Upload Cadence & Outlier Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Monitor when small competitors achieve 10x-50x multiplier spikes to reverse-engineer their topics.
          </p>
        </div>

        <div className="text-xs text-slate-600 dark:text-neutral-400 bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] px-3.5 py-1.5 rounded-xl shadow-xs self-start sm:self-auto">
          Tracking <strong className="text-slate-900 dark:text-white">{channels.length}</strong> active faceless channels
        </div>
      </div>

      {/* Competitor List Table */}
      <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider bg-slate-50/80 dark:bg-white/[0.02]">
                <th className="p-3.5 pl-4">Competitor Channel</th>
                <th className="p-3.5">Style / Format</th>
                <th className="p-3.5">Niche</th>
                <th className="p-3.5">Subscribers</th>
                <th className="p-3.5">Top Outlier Performance</th>
                <th className="p-3.5">Cadence</th>
                <th className="p-3.5 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {channels.map((ch) => {
                const topVid = ch.topVideos[0];
                return (
                  <tr 
                    key={ch.id}
                    onClick={() => onSelectChannel(ch)}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center space-x-3">
                        <img src={ch.avatar} alt={ch.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/[0.1]" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{ch.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400">{ch.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-neutral-300">{ch.style}</td>
                    <td className="p-3.5 text-slate-700 dark:text-neutral-300">{ch.niche}</td>
                    <td className="p-3.5 font-mono text-slate-800 dark:text-neutral-200">{ch.subscribers}</td>
                    <td className="p-3.5">
                      <div className="max-w-xs">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">{topVid?.title}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 font-medium">
                          {topVid?.views} • {topVid?.timeAgo}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-neutral-400">
                      ~2 videos/wk
                    </td>
                    <td className="p-3.5 text-right pr-4">
                      <a
                        href={ch.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 shadow-xs dark:bg-white/[0.04] dark:hover:bg-white/[0.1] dark:text-neutral-300 dark:border-transparent inline-flex items-center transition-colors"
                        title="Open Channel on YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
