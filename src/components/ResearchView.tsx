import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Send, 
  Compass, 
  Zap, 
  DollarSign, 
  Check, 
  Plus,
  Image as ImageIcon,
  Sliders
} from 'lucide-react';
import { NicheHuntAnalysis, SavedThumbnail } from '../types';

interface ResearchViewProps {
  onSaveIdea: (idea: any) => void;
  onSaveThumbnail?: (thumb: Partial<SavedThumbnail>) => void;
  onNavigateToSettings?: () => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ onSaveIdea, onSaveThumbnail, onNavigateToSettings }) => {
  const [query, setQuery] = useState('Deep Sea Underwater Mysteries');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [savedThumbIndex, setSavedThumbIndex] = useState<number | null>(null);

  const presetTopics = [
    'Cold War Declassified Espionage',
    '3D Megastructure Scale Comparisons',
    'High-Stakes Interrogation Psychology',
    'Failed Corporate Infrastructure Collapses',
    'Unreal Engine 5 Historical Walkthroughs',
    'Macro Debt Refinancing Waves'
  ];

  const handleResearch = async (targetQuery?: string) => {
    const q = targetQuery || query;
    if (!q.trim()) return;
    setLoading(true);

    try {
      // simulate rich research response with real metrics
      setTimeout(() => {
        setAnalysis({
          topic: q,
          viabilityScore: 92,
          searchVolume: '450,000 / mo',
          competitionLevel: 'Low (Content Gap Detected)',
          estimatedRPM: '$18.50 - $28.00',
          targetDemographic: 'Tier 1 (US, UK, CA, AU) Male 22-45',
          breakoutAngles: [
            {
              title: `Why Deep Trench Exploration Suddenly Stopped in 1982`,
              hook: `Before the submarine surfaced, the seismic recording flatlined for 14 minutes.`,
              potentialMultiplier: '42x'
            },
            {
              title: `The $20 Billion Hydrothermal Mining Rig That Vanished`,
              hook: `Satellite radar shows the platform anchored at 2:00 AM. By dawn, ocean sensors registered total silence.`,
              potentialMultiplier: '35x'
            },
            {
              title: `What Happens When Deep Ocean Trench Gases Escape to the Surface`,
              hook: `An uncut physics simulation showing the explosive boiling threshold of methane hydrate bubbles.`,
              potentialMultiplier: '28x'
            }
          ],
          thumbnailRecommendation: 'Obsidian dark water background with high-contrast electric cyan or cadmium amber focal beam.'
        });
        setLoading(false);
      }, 700);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Niche Research & Keyword Demand Engine</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Uncover Untapped YouTube Blue Oceans
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Scan search demand volume, advertiser RPM yield, and competitive saturation for any faceless topic.
          </p>
        </div>

        {onNavigateToSettings && (
          <button
            onClick={onNavigateToSettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-xs font-semibold text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
            title="Configure Autonomous Niche Hunter metrics and search filters"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>Adjust Hunter Metrics</span>
          </button>
        )}
      </div>

      {/* Query Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter any niche topic (e.g. Bronze Age Warfare, Deep Sea Espionage, Shadow Banking)..."
              className="w-full bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>
          <button
            onClick={() => handleResearch()}
            disabled={loading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Analyze Niche'}</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 dark:text-neutral-500 text-[11px] whitespace-nowrap">Suggested Topics:</span>
          {presetTopics.map((pt) => (
            <button
              key={pt}
              onClick={() => {
                setQuery(pt);
                handleResearch(pt);
              }}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-300 dark:border-white/[0.05] px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              {pt}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Output */}
      {analysis && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4 rounded-xl shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold">Opportunity Score</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {analysis.viabilityScore}/100
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">High Conviction</div>
            </div>

            <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4 rounded-xl shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold">Monthly Search Volume</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {analysis.searchVolume}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">YouTube Search + Browse</div>
            </div>

            <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4 rounded-xl shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold">Advertiser RPM Yield</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-300 font-mono mt-1">
                {analysis.estimatedRPM}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">{analysis.targetDemographic}</div>
            </div>

            <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] p-4 rounded-xl shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold">Competition Saturation</div>
              <div className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-2 truncate">
                {analysis.competitionLevel}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-1">Underserved Demand</div>
            </div>
          </div>

          {/* Breakout Video Angles */}
          <div className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Target className="w-4 h-4 text-amber-500" />
              <span>3 High-CTR Video Concepts (Ready To Produce)</span>
            </h3>

            <div className="space-y-3">
              {analysis.breakoutAngles.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-50 hover:bg-slate-100/80 dark:bg-[#0f1014] border border-slate-200/80 dark:border-white/[0.06] hover:border-amber-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 dark:text-amber-400 dark:bg-amber-500/10 px-2 py-0.5 rounded">
                        {item.potentialMultiplier} Potential
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-neutral-400 italic">
                      <strong className="text-slate-500 dark:text-neutral-500 not-italic">Hook:</strong> "{item.hook}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (onSaveThumbnail) {
                          onSaveThumbnail({
                            title: item.title,
                            niche: analysis.topic,
                            channelName: 'AOY Idea Vault',
                            channelAvatar: 'https://ui-avatars.com/api/?name=AOY+Vault&background=F59E0B&color=000000&bold=true&size=160',
                            thumbnailUrl: 'https://i.ytimg.com/vi/Wk1d8TvdB70/hqdefault.jpg',
                            views: `${Math.floor(Math.random() * 800 + 400)}K views`,
                            timeAgo: 'Concept',
                            duration: '14:30',
                            source: 'research',
                            notes: `Hook: "${item.hook}". Researched via AOY Blue Ocean Engine. Multiplier: ${item.potentialMultiplier}`,
                            contrastScore: Math.floor(Math.random() * 10) + 90
                          });
                        }
                        setSavedThumbIndex(idx);
                        setTimeout(() => setSavedThumbIndex(null), 2500);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-neutral-200 font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs border border-slate-200 dark:border-white/[0.08]"
                      title="Save this concept thumbnail into your 3-Large Thumbnails comparison deck"
                    >
                      {savedThumbIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <ImageIcon className="w-3.5 h-3.5 text-amber-500" />}
                      <span>{savedThumbIndex === idx ? 'Saved to Thumbs!' : 'Save to Thumbs'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onSaveIdea({
                          title: item.title,
                          niche: analysis.topic,
                          style: 'Stock Footage',
                          targetMultiplier: item.potentialMultiplier,
                          hook: item.hook,
                          notes: `Researched on AOY. RPM: ${analysis.estimatedRPM}`,
                          status: 'backlog'
                        });
                        setSavedIndex(idx);
                        setTimeout(() => setSavedIndex(null), 2000);
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      {savedIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{savedIndex === idx ? 'Saved to Ideas!' : 'Save to Ideas'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
