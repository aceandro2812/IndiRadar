import React from 'react';
import { KeyStat } from '../types';
import { ArrowUpRight, Minus, ArrowDownRight } from 'lucide-react';

interface StatsGridProps {
  stats: KeyStat[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="glass-panel rounded-xl p-4 flex flex-col justify-between hover:bg-white/5 transition-colors duration-300"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {stat.label}
            </span>
            <span className={`
              flex items-center text-xs font-bold
              ${stat.trend === 'up' ? 'text-india-green' : 
                stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'}
            `}>
              {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-1" />}
              {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3 mr-1" />}
              {stat.trend === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
            </span>
          </div>
          <div className="text-2xl font-display font-bold text-white">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};