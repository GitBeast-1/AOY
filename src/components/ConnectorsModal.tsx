import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Layers, 
  Radio, 
  ChevronRight, 
  Paperclip, 
  Camera, 
  FolderPlus, 
  Github, 
  Sliders, 
  Search, 
  Globe, 
  Cpu, 
  FileText
} from 'lucide-react';

interface ConnectorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectorsModal: React.FC<ConnectorsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [connectors, setConnectors] = useState({
    googleDrive: true,
    kit: true,
    artOfYoutube: true, // The Art Of YouTube from screenshot 2!
    wisprFlow: true,
    calendly: false,
    miro: false,
  });

  const toggleConnector = (key: keyof typeof connectors) => {
    setConnectors(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#121316] text-slate-900 dark:text-neutral-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-200 dark:border-white/[0.12]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header matching screenshot 2 "Let's noodle" */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center space-x-2">
            <span className="text-amber-500 text-xl font-serif">✳</span>
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
              Let's noodle
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Faceless Copilot & AI Connectors
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Connectors List Window (matching Screenshot 2 menu) */}
        <div className="bg-slate-50 dark:bg-[#18191f] rounded-2xl border border-slate-200/80 dark:border-white/[0.06] p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider px-2 pt-1">
            Active Integrations
          </div>

          {/* Google Drive */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                ▲
              </div>
              <span className="text-xs font-medium text-slate-800 dark:text-neutral-200">Google Drive</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={connectors.googleDrive} 
                onChange={() => toggleConnector('googleDrive')}
                className="sr-only peer" 
              />
              <div className="w-8 h-4 bg-slate-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-neutral-700 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* kit */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 text-xs font-bold font-mono">
                k
              </div>
              <span className="text-xs font-medium text-slate-800 dark:text-neutral-200">kit</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={connectors.kit} 
                onChange={() => toggleConnector('kit')}
                className="sr-only peer" 
              />
              <div className="w-8 h-4 bg-slate-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-neutral-700 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* The Art Of YouTube */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-red-50/80 dark:bg-rose-950/30 border border-red-200/70 dark:border-rose-800/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px] font-bold">
                AOY
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">The Art Of YouTube</span>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Niche Hunter Core Connected</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={connectors.artOfYoutube} 
                onChange={() => toggleConnector('artOfYoutube')}
                className="sr-only peer" 
              />
              <div className="w-8 h-4 bg-slate-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-neutral-700 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Wispr Flow */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold">
                w
              </div>
              <span className="text-xs font-medium text-slate-800 dark:text-neutral-200">Wispr Flow</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={connectors.wisprFlow} 
                onChange={() => toggleConnector('wisprFlow')}
                className="sr-only peer" 
              />
              <div className="w-8 h-4 bg-slate-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-neutral-700 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Calendly */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-500 dark:text-neutral-400 text-xs font-bold">
                C
              </div>
              <span className="text-xs font-medium text-slate-800 dark:text-neutral-200">Calendly</span>
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/40 px-1.5 py-0.5 rounded">
              Needs Auth
            </span>
          </div>

          {/* Miro */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-yellow-50 dark:bg-yellow-950/60 flex items-center justify-center text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                m
              </div>
              <span className="text-xs font-medium text-slate-800 dark:text-neutral-200">Miro</span>
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/40 px-1.5 py-0.5 rounded">
              Needs Auth
            </span>
          </div>
        </div>

        {/* Quick Tools list */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
          <span className="flex items-center space-x-1">
            <Radio className="w-3.5 h-3.5 text-emerald-500" />
            <span>Faceless Copilot Live</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-900 dark:text-white font-semibold hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
