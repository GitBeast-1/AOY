import React, { useState } from 'react';
import { 
  Lightbulb, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  Check, 
  ArrowRight,
  Zap,
  FolderHeart
} from 'lucide-react';
import { NicheIdea } from '../types';

interface IdeasViewProps {
  ideas: NicheIdea[];
  onSaveIdea: (idea: any) => void;
  onDeleteIdea: (ideaId: string) => void;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  ideas,
  onSaveIdea,
  onDeleteIdea
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [niche, setNiche] = useState('Animals');
  const [style, setStyle] = useState('Stock Footage');
  const [hook, setHook] = useState('');
  const [targetMultiplier, setTargetMultiplier] = useState('30x');

  const stages: Array<{ id: NicheIdea['status']; label: string; countColor: string }> = [
    { id: 'backlog', label: 'Idea Backlog', countColor: 'text-neutral-400' },
    { id: 'in-progress', label: 'Validating & Outlining', countColor: 'text-amber-400' },
    { id: 'scripting', label: 'Scripting Pacing', countColor: 'text-sky-400' },
    { id: 'ready', label: 'Ready to Film & Edit', countColor: 'text-emerald-400' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveIdea({
      title: title.trim(),
      niche,
      style,
      targetMultiplier,
      hook: hook.trim(),
      notes: '',
      status: 'backlog'
    });

    setTitle('');
    setHook('');
    setShowAddModal(false);
  };

  const handleAdvance = (idea: NicheIdea) => {
    const nextStatusMap: Record<NicheIdea['status'], NicheIdea['status']> = {
      'backlog': 'in-progress',
      'in-progress': 'scripting',
      'scripting': 'ready',
      'ready': 'backlog'
    };
    onSaveIdea({ ...idea, status: nextStatusMap[idea.status] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Lightbulb className="w-4 h-4" />
            <span>Faceless Production Pipeline</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Viral Concept & Script Idea Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Track video concepts from initial niche discovery through scripting and final export.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Concept</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageIdeas = ideas.filter(i => i.status === stage.id);
          return (
            <div 
              key={stage.id} 
              className="bg-white dark:bg-[#14151a] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between min-h-[450px] shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3 mb-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    {stage.label}
                  </span>
                  <span className={`text-xs font-mono font-bold ${stage.countColor}`}>
                    {stageIdeas.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="bg-slate-50 hover:bg-slate-100/80 dark:bg-[#191a22] border border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15] p-3.5 rounded-xl space-y-2.5 transition-all shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 dark:text-amber-400 dark:bg-amber-500/10 px-2 py-0.5 rounded">
                          {idea.targetMultiplier} Outlier
                        </span>
                        <button
                          onClick={() => onDeleteIdea(idea.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 transition-opacity p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {idea.title}
                      </h4>

                      {idea.hook && (
                        <p className="text-[11px] text-slate-600 dark:text-neutral-400 italic line-clamp-2">
                          <strong className="text-slate-500 dark:text-neutral-500 not-italic">Hook:</strong> "{idea.hook}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between text-[10px] text-slate-500 dark:text-neutral-400">
                        <span>{idea.niche}</span>
                        <button
                          onClick={() => handleAdvance(idea)}
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {stageIdeas.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-neutral-500 border border-dashed border-slate-200 dark:border-white/[0.05] rounded-xl">
                      No concepts in {stage.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Video Concept</h3>
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 dark:text-neutral-300 block mb-1 font-semibold">Title (Curiosity Formula)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Why Evolution Made the Same Deep Sea Shark 7 Times"
                  className="w-full bg-slate-50 dark:bg-[#0d0e12] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-neutral-300 block mb-1 font-semibold">Target Niche</label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0d0e12] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-slate-900 dark:text-white shadow-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-neutral-300 block mb-1 font-semibold">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0d0e12] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-slate-900 dark:text-white cursor-pointer shadow-xs"
                  >
                    <option value="Stock Footage">Stock Footage</option>
                    <option value="Whiteboard Animation">Whiteboard</option>
                    <option value="AI 2D">AI 2D</option>
                    <option value="2D Animation">2D Animation</option>
                    <option value="3D Animation">3D Animation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-neutral-300 block mb-1 font-semibold">0-5s Hook Script</label>
                <textarea
                  rows={2}
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="Start with pitch black ocean audio before the shock acoustic sting..."
                  className="w-full bg-slate-50 dark:bg-[#0d0e12] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-neutral-300 dark:border-transparent rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Concept
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
