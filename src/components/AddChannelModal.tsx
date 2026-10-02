import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Plus, 
  Sparkles, 
  Check, 
  Search, 
  Layers, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { ProvenChannel, NICHE_CATEGORIES } from '../types';
import { api } from '../services/api';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelAdded: (channel: ProvenChannel) => void;
}

export const AddChannelModal: React.FC<AddChannelModalProps> = ({
  isOpen,
  onClose,
  onChannelAdded
}) => {
  const [handleOrUrl, setHandleOrUrl] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('History');
  const [selectedStyle, setSelectedStyle] = useState('Stock Footage');
  const [selectedComplexity, setSelectedComplexity] = useState('Easy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleOrUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.importYouTubeChannel({
        query: handleOrUrl.trim(),
        niche: selectedNiche,
        style: selectedStyle,
        complexity: selectedComplexity
      });

      if (res.success && res.channel) {
        onChannelAdded(res.channel);
        setHandleOrUrl('');
        onClose();
      } else {
        setError(res.message || 'Failed to add channel.');
      }
    } catch (err: any) {
      console.error('Import channel error:', err);
      setError(err?.message || 'Error importing YouTube channel.');
    } finally {
      setLoading(false);
    }
  };

  const quickPresets = [
    { name: '@FernTV', niche: 'Space', style: '3D Animation' },
    { name: '@magnatesmedia', niche: 'Business', style: 'Stock Footage' },
    { name: '@neoexplains', niche: 'Technology', style: '2D Animation' },
    { name: '@stellarsagas', niche: 'Science', style: 'AI 2D' },
    { name: '@curiousarchive', niche: 'Animals', style: 'AI 2D' },
    { name: '@historymarche', niche: 'History', style: '2D Animation' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0f1013] border border-slate-200 dark:border-white/[0.12] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50 dark:bg-[#14151a]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200 dark:bg-red-600/20 dark:text-red-500 dark:border-red-500/30">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Import Real YouTube Channel</h3>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                Pulls authentic channel telemetry, subscriber counts, and video cards.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-800 dark:text-neutral-300 font-semibold mb-1">
              YouTube Channel Handle or Link
            </label>
            <input
              type="text"
              value={handleOrUrl}
              onChange={(e) => setHandleOrUrl(e.target.value)}
              placeholder="e.g. @magnatesmedia or https://youtube.com/@TheAmazonArchives"
              required
              className="w-full bg-white dark:bg-[#18191e] border border-slate-200 dark:border-white/[0.12] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono text-xs shadow-xs"
            />
          </div>

          {/* Quick Preset Handles */}
          <div>
            <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-semibold uppercase tracking-wider block mb-1.5">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setHandleOrUrl(p.name);
                    setSelectedNiche(p.niche);
                    setSelectedStyle(p.style);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 shadow-xs dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-300 dark:hover:text-white dark:border-white/[0.06] text-[11px] font-mono cursor-pointer transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-slate-800 dark:text-neutral-300 font-semibold mb-1">Niche Category</label>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full bg-white dark:bg-[#18191e] border border-slate-200 dark:border-white/[0.12] rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer shadow-xs"
              >
                {NICHE_CATEGORIES.map(n => (
                  <option key={n} value={n} className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white">{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-800 dark:text-neutral-300 font-semibold mb-1">Faceless Visual Style</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-white dark:bg-[#18191e] border border-slate-200 dark:border-white/[0.12] rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer shadow-xs"
              >
                {['Stock Footage', 'Whiteboard Animation', 'AI 2D', '2D Animation', '3D Animation'].map(s => (
                  <option key={s} value={s} className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white">{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 dark:text-neutral-300 font-semibold mb-1">Production Complexity</label>
            <div className="grid grid-cols-3 gap-2">
              {['Easy', 'Medium', 'Hard'].map(comp => (
                <button
                  key={comp}
                  type="button"
                  onClick={() => setSelectedComplexity(comp)}
                  className={`py-1.5 rounded-lg border text-center font-semibold cursor-pointer transition-all ${
                    selectedComplexity === comp
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs dark:bg-white/[0.02] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-neutral-300 dark:border-transparent rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !handleOrUrl.trim()}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing Channel...' : 'Import to Channel Cards'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
