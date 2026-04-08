import React from 'react';
import { Clock, Search, Navigation } from 'lucide-react';

export default function Metrics({
  timeTaken,
  nodesExplored,
  pathLength,
  algorithm,
  customLabel1,
  customValue1
}) {
  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/50 backdrop-blur-sm relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none rounded-full"></div>
      
      {/* Algorithm Banner */}
      <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left w-full pt-4 sm:pt-0 relative z-10">
        <span className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase mb-3">Algorithm</span>
        <div className="inline-flex items-center px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full shadow-[inset_0_1px_rgba(255,255,255,0.05)]">
          <span className="text-indigo-400 font-bold tracking-wide">{algorithm || "A* Search"}</span>
        </div>
      </div>

      {/* Nodes Explored (Removed per user metrics request) */}

      {/* Execution Time */}
      <div className="flex-1 flex flex-col items-center w-full pt-4 sm:pt-0 relative z-10">
        <div className="flex items-center text-slate-400 mb-2">
          <Clock className="h-4 w-4 mr-2 opacity-70" />
          <span className="text-xs font-black tracking-[0.2em] uppercase text-slate-500">Time Taken</span>
        </div>
        <span className="text-4xl font-black text-slate-100 tracking-tighter flex items-baseline drop-shadow-md">
          {timeTaken !== undefined ? timeTaken : '-'}
          <span className="text-sm text-slate-400 font-bold ml-1.5 uppercase tracking-wide">ms</span>
        </span>
      </div>

      {/* Path Cost / Custom Metric */}
      <div className="flex-1 flex flex-col items-center sm:items-end text-center sm:text-right w-full pt-4 sm:pt-0 relative z-10">
        <div className="flex items-center justify-end text-slate-400 mb-2">
          <Navigation className="h-4 w-4 mr-2 sm:ml-auto opacity-70" />
          <span className="text-xs font-black tracking-[0.2em] uppercase text-slate-500">
            {customLabel1 || "Path Cost"}
          </span>
        </div>
        <span className="text-4xl font-black text-indigo-400 tracking-tighter drop-shadow-[0_2px_10px_rgba(99,102,241,0.3)]">
          {customValue1 !== undefined ? customValue1 : (pathLength !== undefined ? pathLength : '-')}
        </span>
      </div>
      
    </div>
  );
}
