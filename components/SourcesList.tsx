import React from 'react';
import { GroundingChunk } from '../types';
import { Link2, ExternalLink } from 'lucide-react';

interface SourcesListProps {
  sources: GroundingChunk[];
}

export const SourcesList: React.FC<SourcesListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  // Filter out duplicates based on URI
  const uniqueSources: GroundingChunk[] = Array.from(new Map(sources.map(item => [item.web?.uri, item])).values());

  return (
    <div className="mt-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
        <Link2 className="w-3 h-3" />
        Verified Sources
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {uniqueSources.map((source, index) => {
          if (!source.web) return null;
          return (
            <a
              key={`${source.web.uri}-${index}`}
              href={source.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-india-saffron/30 transition-all duration-200"
            >
              <div className="mt-0.5 p-1 rounded-md bg-black/40 group-hover:text-india-saffron transition-colors">
                 <ExternalLink className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300 truncate group-hover:text-white transition-colors">
                  {source.web.title}
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  {new URL(source.web.uri).hostname.replace('www.', '')}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};