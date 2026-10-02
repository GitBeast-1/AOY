import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Play, 
  Calendar, 
  Sparkles,
  Check
} from 'lucide-react';
import { WorkspaceData } from '../types';

interface MyChannelViewProps {
  myChannel: WorkspaceData['myChannel'];
}

export const MyChannelView: React.FC<MyChannelViewProps> = ({ myChannel }) => {
  const [goalSubs, setGoalSubs] = useState(myChannel?.goalSubs || 100000);
  const currentSubs = myChannel?.subscribers || 14200;
  const currentMonthlyViews = myChannel?.monthlyViews || 480000;
  const rpm = myChannel?.rpm || 16.5;

  const estimatedMonthlyRevenue = Math.round((currentMonthlyViews / 1000) * rpm);
  const progressPercent = Math.min(100, Math.round((currentSubs / goalSubs) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart2 className="w-4 h-4" />
            <span>Channel Dashboard</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {myChannel?.name || 'Tim | Faceless Studio'} ({myChannel?.handle || '@timfaceless'})
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Niche focus: <strong className="text-slate-700 dark:text-neutral-200">{myChannel?.niche || 'Animals & Nature History'}</strong>
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
            ● Monetized Channel Partner
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.08] p-4 rounded-2xl shadow-xs dark:shadow-none">
          <div className="text-[11px] text-slate-400 dark:text-neutral-400 uppercase font-bold">Subscribers</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {currentSubs.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+1,420 this month</div>
        </div>

        <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.08] p-4 rounded-2xl shadow-xs dark:shadow-none">
          <div className="text-[11px] text-slate-400 dark:text-neutral-400 uppercase font-bold">Monthly Views</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {currentMonthlyViews.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+24.8% growth rate</div>
        </div>

        <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.08] p-4 rounded-2xl shadow-xs dark:shadow-none">
          <div className="text-[11px] text-slate-400 dark:text-neutral-400 uppercase font-bold">Average RPM</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-300 font-mono mt-1">
            ${rpm.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">Tier 1 Geography Audience</div>
        </div>

        <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.08] p-4 rounded-2xl shadow-xs dark:shadow-none">
          <div className="text-[11px] text-slate-400 dark:text-neutral-400 uppercase font-bold">Est. Monthly AdSense</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ${estimatedMonthlyRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">Excluding affiliate sponsors</div>
        </div>
      </div>

      {/* Goal Progress Bar */}
      <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.08] p-5 rounded-2xl space-y-3 shadow-xs dark:shadow-none">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
          <span>Silver Creator Award Roadmap (100,000 Subs)</span>
          <span className="text-amber-600 dark:text-amber-400 font-mono">{progressPercent}% Achieved</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-black/50 rounded-full overflow-hidden border border-slate-200/60 dark:border-transparent">
          <div 
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
          />
        </div>
        <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center justify-between font-medium">
          <span>Current: {currentSubs.toLocaleString()} subs</span>
          <span>Target: {goalSubs.toLocaleString()} subs</span>
        </div>
      </div>
    </div>
  );
};
