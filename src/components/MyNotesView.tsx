import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  Tag, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { CreatorNote } from '../types';

interface MyNotesViewProps {
  notes: CreatorNote[];
  onSaveNote: (note: Partial<CreatorNote>) => void;
  onDeleteNote: (noteId: string) => void;
}

export const MyNotesView: React.FC<MyNotesViewProps> = ({
  notes,
  onSaveNote,
  onDeleteNote
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Niche Strategy');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveNote({
      title: title.trim(),
      content: content.trim(),
      tag
    });

    setTitle('');
    setContent('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Creator Scratchpad</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Research Notes & Hook Formulas
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Cloud-synced notes across all your workstations and devices.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] p-5 rounded-2xl flex flex-col justify-between space-y-4 group transition-all shadow-xs dark:shadow-none"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-transparent px-2 py-0.5 rounded">
                  {note.tag}
                </span>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 transition-opacity p-0.5 cursor-pointer"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{note.title}</h3>
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.05] text-[10px] text-slate-400 dark:text-neutral-500">
              Synced across devices
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.1] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Creator Note</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-neutral-300 block mb-1 font-semibold">Note Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Convergent Evolution Thumbnail Blueprint"
                  className="w-full bg-slate-50 dark:bg-[#0d0e12] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-neutral-300 block mb-1 font-semibold">Tag / Category</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0d0e12] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:border-amber-500"
                >
                  <option value="Niche Strategy">Niche Strategy</option>
                  <option value="Thumbnail Strategy">Thumbnail Strategy</option>
                  <option value="Script Hook">Script Hook</option>
                  <option value="Editing Workflow">Editing Workflow</option>
                  <option value="Sponsorship Pitch">Sponsorship Pitch</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-neutral-300 block mb-1 font-semibold">Content</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Key takeaways, sound effects to download, hook structure..."
                  className="w-full bg-slate-50 dark:bg-[#0d0e12] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-neutral-300 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
