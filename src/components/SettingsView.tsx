import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Clock, 
  Save, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Compass, 
  Target, 
  Layers, 
  Check, 
  AlertCircle, 
  Radio, 
  ArrowRight,
  ShieldCheck,
  Folder,
  Zap,
  Info
} from 'lucide-react';
import { HunterSettings, NICHE_CATEGORIES, ProvenChannel } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  onChannelsDiscovered?: (newChannels: ProvenChannel[]) => void;
  onNavigateToProvenNiches?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onChannelsDiscovered,
  onNavigateToProvenNiches
}) => {
  const [settings, setSettings] = useState<HunterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanResult, setScanResult] = useState<{ count: number; names: string[] } | null>(null);
  const [nicheSearch, setNicheSearch] = useState('');

  const allNiches = [...NICHE_CATEGORIES];
  const allStyles = ['Stock Footage', 'Whiteboard Animation', 'AI 2D', '2D Animation', '3D Animation', 'Screen Record'];

  useEffect(() => {
    loadSettings();
  }, []);

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
      console.error('Failed to toggle auto run:', err);
    }
  };

  const handleToggleNiche = (niche: string) => {
    if (!settings) return;
    const current = settings.selectedNiches || [];
    const updated = current.includes(niche)
      ? current.filter(n => n !== niche)
      : [...current, niche];
    if (updated.length === 0) return;
    setSettings({ ...settings, selectedNiches: updated });
  };

  const handleSelectAllNiches = () => {
    if (!settings) return;
    setSettings({ ...settings, selectedNiches: [...allNiches] });
  };

  const handleClearAllNiches = () => {
    if (!settings) return;
    setSettings({ ...settings, selectedNiches: [allNiches[0]] });
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
        targetRegion: 'Global English (Tier 1)',
        minVideoDuration: '8+ mins (Midroll Optimized)',
        selectedStyles: ['Stock Footage', 'AI 2D', 'Whiteboard Animation']
      });
    } else if (preset === 'cash-cow') {
      setSettings({
        ...settings,
        subscriberMax: 150000,
        minOutlierMultiplier: 8,
        minVideoViews: 150000,
        complexityFilter: 'Easy',
        targetRegion: 'North America (US/CA)',
        minVideoDuration: '8+ mins (Midroll Optimized)',
        selectedStyles: ['Stock Footage', 'Whiteboard Animation']
      });
    } else if (preset === 'viral-unicorns') {
      setSettings({
        ...settings,
        subscriberMax: 300000,
        minOutlierMultiplier: 25,
        minVideoViews: 500000,
        complexityFilter: 'All',
        targetRegion: 'Global English (Tier 1)',
        minVideoDuration: '15+ mins (Deep Dive)',
        selectedStyles: ['2D Animation', '3D Animation', 'AI 2D']
      });
    } else {
      setSettings({
        ...settings,
        subscriberMax: 150000,
        minOutlierMultiplier: 10,
        minVideoViews: 100000,
        complexityFilter: 'All',
        targetRegion: 'Global English (Tier 1)',
        minVideoDuration: '8+ mins (Midroll Optimized)',
        selectedNiches: allNiches,
        selectedStyles: allStyles
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await api.updateHunterSettings({
        autoRunEnabled: settings.autoRunEnabled,
        frequencyHours: settings.frequencyHours,
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
      console.error('Failed to save settings:', err);
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
        if (onChannelsDiscovered) {
          onChannelsDiscovered(res.addedChannels);
        }
        await loadSettings();
      }
    } catch (err) {
      console.error('Manual hunter scan error:', err);
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const filteredNiches = allNiches.filter(n => 
    n.toLowerCase().includes(nicheSearch.toLowerCase())
  );

  if (loading && !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Loading Research & Hunter Settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Autonomous Niche Hunter & Research Settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Research Search Metrics & Engine Calibration
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Configure the quantitative thresholds and algorithmic filters used by the Autonomous Niche Hunter to discover, verify, and catalog real breakout faceless YouTube channels on the Proven Niches board.
          </p>
        </div>

        {/* Global Save Button & Engine State */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={handleToggleAutoRun}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              settings?.autoRunEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-neutral-400 hover:bg-slate-200/60'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${settings?.autoRunEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{settings?.autoRunEnabled ? 'Auto-Hunter: ACTIVE' : 'Auto-Hunter: PAUSED'}</span>
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Metrics</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Strategy Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Research Strategy Presets</span>
          </label>
          <span className="text-[11px] text-slate-500 dark:text-neutral-400">Click a preset to auto-adjust all sliders</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'micro-outliers' as const,
              title: 'Micro-Outliers',
              tag: 'High Velocity',
              desc: '< 50k subs, 15x view-to-sub multiplier. Surfaces high-speed newcomer channels breaking the algorithm.',
              color: 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/[0.05]'
            },
            {
              id: 'cash-cow' as const,
              title: 'Cash-Cow Evergreen',
              tag: 'Low Effort',
              desc: '< 150k subs, 8x view ratio. Focuses on simple stock & whiteboard formats with high ad RPM.',
              color: 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/[0.05]'
            },
            {
              id: 'viral-unicorns' as const,
              title: 'Viral Breakouts',
              tag: '25x+ Virality',
              desc: '< 300k subs, 25x view ratio, 500k+ views floor. Finds extreme viral outlier mini-documentaries.',
              color: 'border-purple-500/30 bg-purple-50/50 dark:bg-purple-500/[0.05]'
            },
            {
              id: 'all-round' as const,
              title: 'Broad Market Scout',
              tag: 'All 24 Niches',
              desc: 'Balanced 10x ratio across all niches and styles to maintain maximum category diversity.',
              color: 'border-slate-300 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02]'
            }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xs ${p.color}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{p.title}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/[0.1] text-slate-700 dark:text-neutral-300">
                  {p.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-snug">
                {p.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Search Metrics Calibration Panel */}
      <div className="bg-white dark:bg-[#121318] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-white/[0.06] pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>Quantitative Search Metrics</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              These exact mathematical constraints are enforced during autonomous scans and manual runs.
            </p>
          </div>

          <button
            onClick={() => applyPreset('all-round')}
            className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Recommended</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Metric 1: Subscriber Ceiling */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Subscriber Ceiling (Maximum Subs)</span>
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="5000"
                  max="1000000"
                  step="5000"
                  value={settings?.subscriberMax || 50000}
                  onChange={(e) => setSettings(s => s ? { ...s, subscriberMax: Math.max(1000, Number(e.target.value)) } : null)}
                  className="w-24 px-2 py-0.5 text-xs text-right font-mono font-bold bg-white dark:bg-[#1a1b22] border border-slate-300 dark:border-white/[0.1] rounded-md text-amber-600 dark:text-amber-400"
                />
                <span className="text-xs font-bold text-slate-500">subs</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-snug">
              Excludes mature mega-channels. Focuses purely on emerging creators whose videos are currently out-indexing their channel size.
            </p>

            <input
              type="range"
              min="10000"
              max="500000"
              step="10000"
              value={settings?.subscriberMax || 50000}
              onChange={(e) => setSettings(s => s ? { ...s, subscriberMax: Number(e.target.value) } : null)}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '< 25K', val: 25000 },
                { label: '< 50K', val: 50000 },
                { label: '< 100K', val: 100000 },
                { label: '< 150K', val: 150000 },
                { label: '< 300K', val: 300000 },
                { label: '< 500K', val: 500000 },
              ].map(p => (
                <button
                  key={p.val}
                  onClick={() => setSettings(s => s ? { ...s, subscriberMax: p.val } : null)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    settings?.subscriberMax === p.val
                      ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-300 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metric 2: Outlier Multiplier */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                <span>Outlier Multiplier (View-to-Sub Ratio)</span>
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="2"
                  max="100"
                  step="1"
                  value={settings?.minOutlierMultiplier || 10}
                  onChange={(e) => setSettings(s => s ? { ...s, minOutlierMultiplier: Math.max(1, Number(e.target.value)) } : null)}
                  className="w-16 px-2 py-0.5 text-xs text-right font-mono font-bold bg-white dark:bg-[#1a1b22] border border-slate-300 dark:border-white/[0.1] rounded-md text-orange-600 dark:text-orange-400"
                />
                <span className="text-xs font-bold text-slate-500">x</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-snug">
              Ratio of video views to subscriber base. A 15x multiplier means a channel with 20k subscribers has video hits with 300k+ views.
            </p>

            <input
              type="range"
              min="3"
              max="50"
              step="1"
              value={settings?.minOutlierMultiplier || 10}
              onChange={(e) => setSettings(s => s ? { ...s, minOutlierMultiplier: Number(e.target.value) } : null)}
              className="w-full accent-orange-500 cursor-pointer"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '5x Views', val: 5 },
                { label: '10x Views', val: 10 },
                { label: '15x Views', val: 15 },
                { label: '20x Views', val: 20 },
                { label: '30x Views', val: 30 },
                { label: '50x Viral', val: 50 },
              ].map(p => (
                <button
                  key={p.val}
                  onClick={() => setSettings(s => s ? { ...s, minOutlierMultiplier: p.val } : null)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    settings?.minOutlierMultiplier === p.val
                      ? 'bg-orange-100 border-orange-400 text-orange-900 dark:bg-orange-500/20 dark:border-orange-500/50 dark:text-orange-300 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metric 3: Minimum Video Views */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Minimum Video Views Floor</span>
              </label>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                {(settings?.minVideoViews || 100000).toLocaleString()}+ Views
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-snug">
              Ensures candidate videos have verified audience scale and algorithmic momentum rather than low-volume anomalies.
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
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 dark:bg-emerald-500/20 dark:border-emerald-500/50 dark:text-emerald-300 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metric 4: Production Complexity */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-500" />
                <span>Production Complexity Filter</span>
              </label>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-xs">
                {settings?.complexityFilter || 'All'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-snug">
              Target niches matching your studio bandwidth (solo creator with stock clips vs multi-animator studio).
            </p>

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setSettings(s => s ? { ...s, complexityFilter: c } : null)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    settings?.complexityFilter === c
                      ? 'bg-purple-100 border-purple-400 text-purple-900 dark:bg-purple-500/20 dark:border-purple-500/50 dark:text-purple-300 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Metric 5: Target Region & Audience Tier */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-blue-500" />
                <span>Target Region & Audience Tier</span>
              </label>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                {settings?.targetRegion || 'Global English (Tier 1)'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-snug">
              Filter for geographic tiers with the highest YouTube Ads CPM/RPM payouts ($15 - $40+).
            </p>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                'Global English (Tier 1)',
                'North America (US/CA)',
                'Worldwide Multi-lingual',
                'European High RPM'
              ].map(reg => (
                <button
                  key={reg}
                  onClick={() => setSettings(s => s ? { ...s, targetRegion: reg } : null)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border text-left truncate transition-all cursor-pointer ${
                    (settings?.targetRegion || 'Global English (Tier 1)') === reg
                      ? 'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-500/20 dark:border-blue-500/50 dark:text-blue-300 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Metric 6: Video Duration Format */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Target Video Duration Format</span>
              </label>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs truncate max-w-[160px]">
                {settings?.minVideoDuration || '8+ mins (Midroll Optimized)'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-snug">
              Select ideal length for YouTube long-form recommendation algorithms and monetization midrolls.
            </p>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                'Any Duration',
                '8+ mins (Midroll Optimized)',
                '15+ mins (Deep Dive)',
                '30+ mins (Documentary)'
              ].map(dur => (
                <button
                  key={dur}
                  onClick={() => setSettings(s => s ? { ...s, minVideoDuration: dur } : null)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border text-left truncate transition-all cursor-pointer ${
                    (settings?.minVideoDuration || '8+ mins (Midroll Optimized)') === dur
                      ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-300 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Faceless Visual Formats / Styles Multi-Select */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Faceless Visual Formats ({settings?.selectedStyles.length || 0} active)</span>
            </label>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">Toggle formats relevant to your production</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {allStyles.map(style => {
              const active = settings?.selectedStyles.includes(style);
              return (
                <button
                  key={style}
                  onClick={() => handleToggleStyle(style)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-900 dark:text-amber-300 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${active ? 'bg-amber-500 text-slate-950 font-bold' : 'border border-slate-300 dark:border-neutral-600'}`}>
                    {active && '✓'}
                  </div>
                  <span>{style}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Autonomous Scan Frequency & Scheduler */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Background Schedule Frequency</span>
            </label>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              {settings?.nextScanTime ? `Next scan in ~${Math.max(1, Math.round((settings.nextScanTime - Date.now()) / (3600 * 1000)))}h` : 'Scheduled'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Twice a Day (12h)', hours: 12, desc: 'Recommended default' },
              { label: 'Every 6 Hours', hours: 6, desc: 'Frequent scout' },
              { label: 'Daily (24h)', hours: 24, desc: 'Low noise' },
              { label: 'Every 2 Hours', hours: 2, desc: 'Aggressive scout' }
            ].map(f => (
              <button
                key={f.hours}
                onClick={() => {
                  if (!settings) return;
                  setSettings({ ...settings, frequencyHours: f.hours });
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings?.frequencyHours === f.hours
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs dark:bg-amber-500/10 dark:border-amber-500/50 dark:text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 dark:bg-white/[0.02] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">{f.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-500 mt-0.5">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Niche Focus Multi-Select Grid */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                <span>Niche Focus Filter ({settings?.selectedNiches.length || 0} of {allNiches.length} Active)</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                The Hunter selects categories randomly from your enabled niches during scans.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Filter niches..."
                value={nicheSearch}
                onChange={(e) => setNicheSearch(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-800 dark:text-white"
              />
              <button
                onClick={handleSelectAllNiches}
                className="px-2 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleClearAllNiches}
                className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200/80 dark:border-white/[0.05] rounded-xl bg-slate-50/50 dark:bg-white/[0.01]">
            {filteredNiches.map(niche => {
              const active = settings?.selectedNiches.includes(niche);
              return (
                <button
                  key={niche}
                  onClick={() => handleToggleNiche(niche)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left truncate transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500/20 text-amber-900 border border-amber-500/40 dark:text-amber-300 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/[0.05] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                  title={niche}
                >
                  <span className="mr-1.5">{active ? '✓' : '•'}</span>
                  {niche}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Manual Immediate Scan Trigger Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Instant Execution</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Run Niche Hunter Now with Your Current Metrics
          </h3>
          <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-xl">
            Immediately trigger the telemetry research crawler using your customized subscriber ceiling (&lt;{(settings?.subscriberMax || 50000).toLocaleString()}), outlier multiplier ({settings?.minOutlierMultiplier || 10}x), and active niches. Discovered channels appear at the top of Proven Niches.
          </p>

          {isScanning && (
            <div className="flex items-center space-x-2 pt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>{scanStep}</span>
            </div>
          )}

          {scanResult && !isScanning && (
            <div className="flex items-center space-x-2 pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Discovered {scanResult.count} new channels: {scanResult.names.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          {scanResult && onNavigateToProvenNiches && (
            <button
              onClick={onNavigateToProvenNiches}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
            >
              <Folder className="w-4 h-4 text-amber-500" />
              <span>View in Proven Niches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleRunScanNow}
            disabled={isScanning}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Crawling Channels...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Run Niche Hunt Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Telemetry & Scan History Logs */}
      <div className="bg-white dark:bg-[#121318] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Autonomous Scan History</h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
            {(settings?.scanLogs || []).length} logs recorded
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {(settings?.scanLogs || []).slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-900 dark:text-white">{log.message}</span>
                </div>
                {log.discoveredNames && log.discoveredNames.length > 0 && (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pl-3.5">
                    Added to Proven Niches: {log.discoveredNames.join(' • ')}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap self-start sm:self-auto">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
