import React, { useState } from 'react';
import { 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Sparkles, 
  FileText,
  ChevronRight
} from 'lucide-react';

export const CourseView: React.FC = () => {
  const [activeModule, setActiveModule] = useState(0);

  const modules = [
    {
      id: 1,
      title: 'Module 1: Blue Ocean Niche Selection & The Outlier Multiplier',
      duration: '42 mins',
      lessons: [
        { title: 'The Outlier Formula: Calculating Views vs Channel Baseline', duration: '12:15', completed: true },
        { title: 'Spotting 40x Anomalies on Small Channels Under 10k Subs', duration: '15:20', completed: true },
        { title: 'Validating High RPM Niches ($15-$40) Before Creating Footage', duration: '14:25', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Module 2: High-Retention Scriptwriting & The First 60 Seconds',
      duration: '58 mins',
      lessons: [
        { title: 'The 4-Second Acoustic Hook: Eliminating Intro Stings', duration: '18:40', completed: false },
        { title: 'Information Gaps: Writing The Mid-Video Retention Cliff', duration: '22:10', completed: false },
        { title: 'Using AI to Structure Pacing Without Sounding Like a Robot', duration: '17:10', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Module 3: Faceless Visual Pipelines: Stock, 2D & Whiteboard',
      duration: '1 hr 15 mins',
      lessons: [
        { title: 'Sourcing Storyblocks, Envato & Public Domain Archives', duration: '24:00', completed: false },
        { title: 'Whiteboard & 2D Vector Workflows on a Shoestring Budget', duration: '26:30', completed: false },
        { title: 'Audio Mastering: Layering Sub-Bass Drone & Sound Effects', duration: '24:30', completed: false }
      ]
    },
    {
      id: 4,
      title: 'Module 4: 10%+ Mobile CTR Thumbnail Masterclass',
      duration: '49 mins',
      lessons: [
        { title: 'The 1-2 Word Curiosity Tag Rule (MISTAKE, WHY, NOT SAFE)', duration: '16:20', completed: false },
        { title: 'Color Grading Contrast: Cadmium Yellows & Obsidian Backdrops', duration: '18:15', completed: false },
        { title: 'Mobile Small-Screen Legibility Testing', duration: '14:25', completed: false }
      ]
    },
    {
      id: 5,
      title: 'Module 5: Monetization, High-RPM Niches & Sponsorships',
      duration: '38 mins',
      lessons: [
        { title: 'Unlocking Tier 1 Audiences for Maximum AdSense CPM', duration: '19:40', completed: false },
        { title: 'Securing $3,000+ Brand Deals for Faceless Documentaries', duration: '18:20', completed: false }
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>The Art OF YouTube Masterclass</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The Course: Building a 6-Figure Faceless Empire
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Step-by-step video training on niche selection, algorithmic packaging, and production scaling.
          </p>
        </div>

        <div className="text-xs text-slate-700 dark:text-neutral-300 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl self-start sm:self-auto font-medium">
          AOY Program Member Access: <strong className="text-amber-600 dark:text-amber-400 font-bold">Active</strong>
        </div>
      </div>

      {/* Main Course Player & Lesson Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Lesson Display */}
        <div className="lg:col-span-8 space-y-4">
          <div className="aspect-video bg-slate-900 dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden relative group flex items-center justify-center shadow-md dark:shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80"
              alt="Course Video"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
            
            <div className="absolute z-10 text-center space-y-2 p-6">
              <div className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-all cursor-pointer">
                <Play className="w-7 h-7 ml-1 fill-current" />
              </div>
              <h3 className="text-lg font-bold text-white max-w-lg">
                {modules[activeModule].lessons[0].title}
              </h3>
              <div className="text-xs text-amber-300 font-mono">
                {modules[activeModule].title} · {modules[activeModule].lessons[0].duration}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 space-y-2 shadow-xs dark:shadow-none">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Lesson Overview & Key Takeaway</h4>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              In this core lesson, Tim breaks down how to calculate the Outlier Multiplier (Views divided by average 10% subscriber baseline). When a channel with 2,400 subscribers clocks 720,000 views, the YouTube browse algorithm is actively testing that specific topic format across broad audiences.
            </p>
          </div>
        </div>

        {/* Modules Accordion Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider px-1">Curriculum Modules</h3>
          
          <div className="space-y-2.5">
            {modules.map((mod, idx) => (
              <div
                key={mod.id}
                onClick={() => setActiveModule(idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeModule === idx
                    ? 'bg-amber-50/70 border-amber-500/50 shadow-sm dark:bg-[#1a1b24] dark:border-amber-500/50 dark:shadow-md'
                    : 'bg-white dark:bg-[#14151a] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span className="truncate pr-2">{mod.title}</span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono flex-shrink-0">{mod.duration}</span>
                </div>

                <div className="mt-2 space-y-1.5">
                  {mod.lessons.map((lesson, lIdx) => (
                    <div key={lIdx} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-neutral-400">
                      <span className="truncate pr-2 flex items-center space-x-1.5">
                        {lesson.completed ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 flex-shrink-0" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-neutral-500">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
