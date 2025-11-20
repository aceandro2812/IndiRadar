import React from 'react';
import { Radar, Radio, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radar className="w-8 h-8 text-india-saffron animate-pulse-slow" />
            <div className="absolute inset-0 bg-india-saffron/20 blur-lg rounded-full" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-white">
              INDIA <span className="text-india-saffron">AI</span> RADAR
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] font-medium text-green-400 uppercase tracking-widest">Live Intelligence</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
           <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
             <Radio className="w-3 h-3" />
             <span>Model: Gemini 2.5 Flash (Search Grounded)</span>
           </div>
        </div>
      </div>
    </header>
  );
};