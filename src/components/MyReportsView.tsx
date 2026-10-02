import React from 'react';
import { 
  FolderArchive, 
  Download, 
  FileText, 
  Check, 
  Clock, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ProvenChannel } from '../types';

interface MyReportsViewProps {
  channels: ProvenChannel[];
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({ channels }) => {
  const reports = [
    {
      id: 'rep-1',
      title: 'Q3 Faceless YouTube Niche Master Intelligence Dossier',
      date: 'Generated Today',
      fileSize: '2.4 MB',
      nichesCovered: 'Animals, Religion, Crime, History, 3D Biomechanics',
      channelsIncluded: channels.length
    },
    {
      id: 'rep-2',
      title: 'Stock Footage vs 2D Animation Monetization & RPM Report',
      date: '3 days ago',
      fileSize: '1.8 MB',
      nichesCovered: 'Stock Footage vs 2D Vector Animations',
      channelsIncluded: 8
    }
  ];

  const handleDownloadReport = (rep: typeof reports[0]) => {
    const reportData = {
      reportTitle: rep.title,
      generatedAt: new Date().toISOString(),
      channels: channels.map(c => ({
        name: c.name,
        handle: c.handle,
        niche: c.niche,
        style: c.style,
        subscribers: c.subscribers,
        views: c.views,
        topVideos: c.topVideos.map(v => v.title)
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AOY-Report-${rep.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FolderArchive className="w-4 h-4" />
            <span>Niche Dossiers & Intelligence Exports</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Generated Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Download comprehensive data packages on verified outlier channels.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs dark:shadow-none"
          >
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rep.title}</h3>
                <div className="text-xs text-slate-600 dark:text-neutral-400">
                  Covers: <strong className="text-slate-800 dark:text-neutral-300">{rep.nichesCovered}</strong> ({rep.channelsIncluded} channels tracked)
                </div>
                <div className="text-[11px] text-slate-400 dark:text-neutral-500 flex items-center space-x-2">
                  <span>{rep.date}</span>
                  <span>•</span>
                  <span>{rep.fileSize}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownloadReport(rep)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:text-white dark:border-white/[0.08] font-semibold rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer self-start md:self-auto shadow-xs dark:shadow-none"
            >
              <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Export Dossier (JSON)</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
