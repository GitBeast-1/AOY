import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Settings, 
  Play, 
  Check, 
  RefreshCw, 
  Flame, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Users,
  Target,
  BarChart3,
  Wand2,
  CheckCircle2,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { HunterSettings, HunterScanLog, ProvenChannel, NICHE_CATEGORIES } from '../types';
import { api } from '../services/api';

interface AutoHunterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelsDiscovered: (newChannels: ProvenChannel[]) => void;
}

export const AutoHunterModal: React.FC<AutoHunterModalProps> = ({
  isOpen,
  onClose,
  onChannelsDiscovered
}) => {
  const [settings, setSettings] = useState<HunterSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanResult, setScanResult] = useState<{ count: number; names: string[] } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Available options
  const allNiches = [...NICHE_CATEGORIES];
  const allStyles = ['Stock Footage', 'Whiteboard Animation', 'AI 2D', '2D Animation', '3D Animation', 'Screen Record'];

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setScanResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getHunterSettings();
      if (res.success) {
        setSettings({
          ...res.settings,
          minVideoViews: res.settings.minVideoViews ?? 100000,
          complexityFilter: res.settings.complexityFilter ?? 'All',
          targetRegion: res.settings.targetRegion ?? 'Global English (Tier 1)',
          minVideoDuration: res.settings.minVideoDuration ?? '8+ mins (Midroll Optimized)'
        });
      }
    } catch (err) {
      console.error('Failed to load hunter settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRun = async () => {
    if (!settings) return;
    const updated = !settings.autoRunEnabled;
    setSettings({ ...settings, autoRunEnabled: updated });
    try {
      await api.updateHunterSettings({ autoRunEnabled: updated });
    } catch (err) {
      console.error('Failed to update auto run:', err);
    }
  };

  const handleFrequencyChange = async (hours: number) => {
    if (!settings) return;
    setSettings({ ...settings, frequencyHours: hours });
    try {
      const res = await api.updateHunterSettings({ frequencyHours: hours });
      if (res.success) setSettings(prev => prev ? { ...prev, ...res.settings } : res.settings);
    } catch (err) {
      console.error('Failed to update frequency:', err);
    }
  };

  const handleToggleNiche = (niche: string) => {
    if (!settings) return;
    const current = settings.selectedNiches || [];
    const updated = current.includes(niche)
      ? current.filter(n => n !== niche)
      : [...current, niche];
    if (updated.length === 0) return; // keep at least one
    setSettings({ ...settings, selectedNiches: updated });
  };

  const handleToggleStyle = (style: string) => {
    if (!settings) return;
    const current = settings.selectedStyles || [];
    const updated = current.includes(style)
      ? current.filter(s => s !== style)
      : [...current, style];
    if (updated.length === 0) return;
    setSettings({ ...settings, selectedStyles: updated });
  };

  const applyPreset = (preset: 'micro-outliers' | 'cash-cow' | 'viral-unicorns' | 'all-round') => {
    if (!settings) return;
    if (preset === 'micro-outliers') {
      setSettings({
        ...settings,
        subscriberMax: 50000,
        minOutlierMultiplier: 15,
        minVideoViews: 100000,
        complexityFilter: 'Easy',
        selectedStyles: ['Stock Footage', 'AI 2D', 'Whiteboard Animation']
      });
    } else if (preset === 'cash-cow') {
      setSettings({
        ...settings,
        subscriberMax: 150000,
        minOutlierMultiplier: 8,
        minVideoViews: 150000,
        complexityFilter: 'Easy',
        selectedStyles: ['Stock Footage', 'Whiteboard Animation']
      });
    } else if (preset === 'viral-unicorns') {
      setSettings({
        ...settings,
        subscriberMax: 300000,
        minOutlierMultiplier: 25,
        minVideoViews: 500000,
        complexityFilter: 'All',
        selectedStyles: ['2D Animation', '3D Animation', 'AI 2D']
      });
    } else {
      setSettings({
        ...settings,
        subscriberMax: 200000,
        minOutlierMultiplier: 10,
        minVideoViews: 100000,
        complexityFilter: 'All',
        selectedNiches: allNiches,
        selectedStyles: allStyles
      });
    }
  };

  const handleSaveCriteria = async () => {
    if (!settings) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await api.updateHunterSettings({
        selectedNiches: settings.selectedNiches,
        selectedStyles: settings.selectedStyles,
        subscriberMax: settings.subscriberMax,
        minOutlierMultiplier: settings.minOutlierMultiplier,
        minVideoViews: settings.minVideoViews,
        complexityFilter: settings.complexityFilter,
        targetRegion: settings.targetRegion,
        minVideoDuration: settings.minVideoDuration
      });
      if (res.success) {
        setSettings(prev => prev ? { ...prev, ...res.settings } : res.settings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save criteria:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunScanNow = async () => {
    if (!settings) return;
    setIsScanning(true);
    setScanResult(null);
    setScanStep(`Querying YouTube telemetry for ${settings.selectedNiches.slice(0, 2).join(', ')}...`);

    const timer1 = setTimeout(() => {
      setScanStep(`Enforcing thresholds: < ${settings.subscriberMax.toLocaleString()} subs & >= ${settings.minOutlierMultiplier}x multiplier...`);
    }, 1200);

    const timer2 = setTimeout(() => {
      setScanStep(`Synthesizing high-retention video previews & authentic channel cards...`);
    }, 2400);

    try {
      const res = await api.runHunterScan({
        selectedNiches: settings.selectedNiches,
        selectedStyles: settings.selectedStyles,
        subscriberMax: settings.subscriberMax,
        minOutlierMultiplier: settings.minOutlierMultiplier,
        minVideoViews: settings.minVideoViews,
        complexityFilter: settings.complexityFilter,
        targetRegion: settings.targetRegion,
        minVideoDuration: settings.minVideoDuration
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res.success) {
        setScanResult({
          count: res.addedChannels.length,
          names: res.addedChannels.map(c => c.name)
        });
        onChannelsDiscovered(res.addedChannels);
        await loadSettings();
      }
    } catch (err) {
      console.error('Scan execution error:', err);
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  if (!isOpen) return null;

  // Format countdown until next scheduled background run
  const formatTimeUntilNext = () => {
    if (!settings || !settings.nextScanTime) return 'Scheduled';
    const diff = settings.nextScanTime - Date.now();
    if (diff <= 0) return 'Due now (running soon)';
    const hours = Math.floor(diff / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0f1013] border border-slate-200 dark:border-white/[0.12] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/90 dark:bg-[#14151a]">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center shadow-md shadow-orange-500/20 text-black">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Autonomous Niche Hunter & Research Settings
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30">
                  REAL TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Adjust research metrics, viral outlier thresholds, and subscriber ceilings for YouTube discovery.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Active Status & Run Now Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${settings?.autoRunEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-neutral-600'}`} />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {settings?.autoRunEnabled ? 'Autonomous Research Active' : 'Autonomous Research Paused'}
                </span>
              </div>
              <p className="text-slate-600 dark:text-neutral-400 text-xs">
                Auto-scout runs in the background. Next scheduled scan in: <span className="text-amber-700 dark:text-amber-400 font-mono font-semibold">{formatTimeUntilNext()}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleToggleAutoRun}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings?.autoRunEnabled
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:text-emerald-300 dark:border-emerald-500/30'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {settings?.autoRunEnabled ? 'Engine: ON' : 'Engine: PAUSED'}
              </button>

              <button
                onClick={handleRunScanNow}
                disabled={isScanning}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scouting YouTube...' : 'Run Auto-Discovery Now'}</span>
              </button>
            </div>
          </div>

          {/* Quick Strategy Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 dark:text-neutral-200 font-bold flex items-center space-x-2 text-xs">
                <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                <span>1-Click Research Metric Presets</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400">Instantly tunes all filters</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => applyPreset('micro-outliers')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 dark:border-white/[0.08] dark:hover:border-amber-500/50 bg-white dark:bg-white/[0.02] text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                  <span>🎯 Micro-Outliers</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  &lt; 50K Subs • &gt;= 15x Multiplier
                </div>
              </button>

              <button
                onClick={() => applyPreset('cash-cow')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 dark:border-white/[0.08] dark:hover:border-emerald-500/50 bg-white dark:bg-white/[0.02] text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                  <span>⚡ Low-Friction Cash Cow</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  Easy complexity • Stock Footage
                </div>
              </button>

              <button
                onClick={() => applyPreset('viral-unicorns')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 dark:border-white/[0.08] dark:hover:border-purple-500/50 bg-white dark:bg-white/[0.02] text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                  <span>🦄 Viral Unicorns</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  &gt;= 25x Multiplier • 500K+ Views
                </div>
              </button>

              <button
                onClick={() => applyPreset('all-round')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 dark:border-white/[0.08] dark:hover:border-blue-500/50 bg-white dark:bg-white/[0.02] text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                  <span>🌐 All-Round Scout</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  Standard 10x • All 24 Niches
                </div>
              </button>
            </div>
          </div>

          {/* Real-time Scanning Progress Indicator */}
          {isScanning && (
            <div className="bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 rounded-xl p-4 animate-in fade-in space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-sky-700 dark:text-sky-300 font-semibold text-xs">
                <Sparkles className="w-4 h-4 animate-spin text-sky-500 dark:text-sky-400" />
                <span>{scanStep || 'Executing AI niche scout...'}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          )}

          {/* Success Result Toast */}
          {scanResult && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 text-emerald-800 dark:text-emerald-300 animate-in fade-in flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2.5">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="font-bold text-sm">
                    {scanResult.count} New Proven Channels Added Automatically!
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400/80">
                    Listed on Proven Niches cards: {scanResult.names.join(', ')}
                  </div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-transparent font-bold">
                Saved & Synced
              </span>
            </div>
          )}

          {/* Core Research Metrics Section */}
          <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.07] rounded-2xl p-4 sm:p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Outlier Search & Telemetry Metrics
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                Applied to every automatic & manual scan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Metric 1: Subscriber Ceiling (Maximum Channel Subscribers) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 dark:text-neutral-200 font-bold flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>Subscriber Ceiling</span>
                  </label>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                    {settings?.subscriberMax ? `< ${settings.subscriberMax.toLocaleString()} subs` : '< 50,000 subs'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                  Filters out oversized channels to prioritize emerging creators with replicable mechanics.
                </p>

                {/* Presets */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: '< 25K', val: 25000 },
                    { label: '< 50K', val: 50000 },
                    { label: '< 150K', val: 150000 },
                    { label: '< 500K', val: 500000 },
                  ].map(p => (
                    <button
                      key={p.val}
                      onClick={() => setSettings(s => s ? { ...s, subscriberMax: p.val } : null)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        settings?.subscriberMax === p.val
                          ? 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-500/20 dark:border-blue-500/50 dark:text-blue-300 font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={settings?.subscriberMax || 50000}
                  onChange={(e) => setSettings(s => s ? { ...s, subscriberMax: parseInt(e.target.value, 10) } : null)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Metric 2: Minimum Outlier Multiplier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 dark:text-neutral-200 font-bold flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-500" />
                    <span>Min Outlier Multiplier</span>
                  </label>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                    {settings?.minOutlierMultiplier ? `${settings.minOutlierMultiplier}x View Ratio` : '10x View Ratio'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                  Ratio of viral video views vs subscriber count (e.g. 10x = 30K sub channel pulling 300K+ views).
                </p>

                {/* Presets */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: '5x Base', val: 5 },
                    { label: '10x Viral', val: 10 },
                    { label: '20x Super', val: 20 },
                    { label: '35x Unicorn', val: 35 },
                  ].map(p => (
                    <button
                      key={p.val}
                      onClick={() => setSettings(s => s ? { ...s, minOutlierMultiplier: p.val } : null)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        settings?.minOutlierMultiplier === p.val
                          ? 'bg-amber-50 border-amber-400 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-300 font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="3"
                  max="40"
                  step="1"
                  value={settings?.minOutlierMultiplier || 10}
                  onChange={(e) => setSettings(s => s ? { ...s, minOutlierMultiplier: parseInt(e.target.value, 10) } : null)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Metric 3: Minimum Video Views */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 dark:text-neutral-200 font-bold flex items-center space-x-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Minimum Video Views</span>
                  </label>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {(settings?.minVideoViews || 100000).toLocaleString()}+ Views
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                  Ensures discovered videos have proven viewer traction and verified YouTube search demand.
                </p>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: '50K+', val: 50000 },
                    { label: '100K+', val: 100000 },
                    { label: '250K+', val: 250000 },
                    { label: '500K+', val: 500000 },
                  ].map(p => (
                    <button
                      key={p.val}
                      onClick={() => setSettings(s => s ? { ...s, minVideoViews: p.val } : null)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        settings?.minVideoViews === p.val
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/50 dark:text-emerald-300 font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric 4: Complexity / Production Difficulty */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 dark:text-neutral-200 font-bold flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-500" />
                    <span>Production Complexity</span>
                  </label>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-xs">
                    {settings?.complexityFilter || 'All'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                  Target niches matching your editing workflow bandwidth (solo creator vs agency team).
                </p>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {(['All', 'Easy', 'Medium', 'Hard'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setSettings(s => s ? { ...s, complexityFilter: c } : null)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        settings?.complexityFilter === c
                          ? 'bg-purple-50 border-purple-400 text-purple-800 dark:bg-purple-500/20 dark:border-purple-500/50 dark:text-purple-300 font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric 5: Target Region & Tier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 dark:text-neutral-200 font-bold flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <span>Target Region & Audience Tier</span>
                  </label>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                    {settings?.targetRegion || 'Global English (Tier 1)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                  Filter for Tier-1 geographic regions with high advertiser RPM ($15 - $40+).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {[
                    'Global English (Tier 1)',
                    'North America (US/CA)',
                    'Worldwide Multi-lingual',
                    'European High RPM'
                  ].map(reg => (
                    <button
                      key={reg}
                      onClick={() => setSettings(s => s ? { ...s, targetRegion: reg } : null)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border text-center truncate transition-all cursor-pointer ${
                        (settings?.targetRegion || 'Global English (Tier 1)') === reg
                          ? 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-500/20 dark:border-blue-500/50 dark:text-blue-300 font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                      }`}
                      title={reg}
                    >
                      {reg.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric 6: Video Duration Format */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 dark:text-neutral-200 font-bold flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Video Duration Format</span>
                  </label>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                    {settings?.minVideoDuration || '8+ mins (Midroll Optimized)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                  Select optimal video runtime for YouTube algorithm midroll ad insertion.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {[
                    'Any Duration',
                    '8+ mins (Midroll Optimized)',
                    '15+ mins (Deep Dive)',
                    '30+ mins (Documentary)'
                  ].map(dur => (
                    <button
                      key={dur}
                      onClick={() => setSettings(s => s ? { ...s, minVideoDuration: dur } : null)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border text-center truncate transition-all cursor-pointer ${
                        (settings?.minVideoDuration || '8+ mins (Midroll Optimized)') === dur
                          ? 'bg-amber-50 border-amber-400 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-300 font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                      }`}
                      title={dur}
                    >
                      {dur.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Research Schedule Frequency */}
          <div className="space-y-2.5">
            <label className="text-slate-800 dark:text-neutral-300 font-bold flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Background Schedule Frequency</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Twice a Day (12h)', hours: 12, desc: 'Recommended standard' },
                { label: 'Every 6 Hours', hours: 6, desc: 'High frequency' },
                { label: 'Daily (24h)', hours: 24, desc: 'Conservative daily' },
                { label: 'Every 2 Hours', hours: 2, desc: 'Aggressive scout' }
              ].map(f => (
                <button
                  key={f.hours}
                  onClick={() => handleFrequencyChange(f.hours)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    settings?.frequencyHours === f.hours
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs dark:bg-amber-500/10 dark:border-amber-500/50 dark:text-white'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 shadow-xs dark:bg-white/[0.02] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="font-bold text-xs">{f.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-neutral-500 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Niche Focus Multi-Select */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 dark:text-neutral-300 font-bold flex items-center space-x-2">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Niche Focus Filters ({settings?.selectedNiches.length || 0} active)</span>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSettings(s => s ? { ...s, selectedNiches: allNiches } : null)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer font-medium"
                >
                  Select All (24)
                </button>
                <span className="text-slate-300 dark:text-neutral-600">•</span>
                <button
                  onClick={() => setSettings(s => s ? { ...s, selectedNiches: ['History', 'Finance', 'AI', 'Technology', 'Science', 'Business'] } : null)}
                  className="text-[11px] text-slate-500 dark:text-neutral-400 hover:underline cursor-pointer font-medium"
                >
                  Reset Top 6
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allNiches.map(niche => {
                const active = settings?.selectedNiches.includes(niche);
                return (
                  <button
                    key={niche}
                    onClick={() => handleToggleNiche(niche)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      active
                        ? 'bg-amber-500 text-black font-bold border-amber-500 shadow-xs dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-300'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-xs dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-black dark:text-amber-400" />}
                    <span>{niche}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style Focus Multi-Select */}
          <div className="space-y-2.5">
            <label className="text-slate-800 dark:text-neutral-300 font-bold flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Faceless Visual Styles ({settings?.selectedStyles.length || 0} active)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allStyles.map(style => {
                const active = settings?.selectedStyles.includes(style);
                return (
                  <button
                    key={style}
                    onClick={() => handleToggleStyle(style)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      active
                        ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold shadow-xs dark:bg-blue-500/15 dark:border-blue-500/40 dark:text-blue-300'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-xs dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-blue-700 dark:text-blue-300" />}
                    <span>{style}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Criteria Button Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/[0.06]">
            <div>
              {saveSuccess && (
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Research metrics saved and applied to background engine!</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSaveCriteria}
              disabled={saving}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving Metrics...' : 'Save Research Criteria'}</span>
            </button>
          </div>

          {/* Scan Execution History Log */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
            <h4 className="text-slate-800 dark:text-neutral-300 font-bold flex items-center space-x-2 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Autonomous Scan History & Log</span>
            </h4>

            <div className="space-y-2">
              {(settings?.scanLogs || []).slice(0, 5).map((log) => (
                <div key={log.id} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] rounded-xl p-3 flex items-start justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-slate-800 dark:text-white text-[11px]">{log.message}</span>
                    </div>
                    {log.discoveredNames && log.discoveredNames.length > 0 && (
                      <div className="text-[10px] text-amber-700 dark:text-amber-400/90 pl-3.5 font-medium">
                        Added: {log.discoveredNames.join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#14151a] flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>AI Telemetry Engine: Gemini 3.8 + YouTube Outlier Modeling Active</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs dark:bg-white/[0.08] dark:hover:bg-white/[0.12] dark:text-white dark:border-transparent rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
