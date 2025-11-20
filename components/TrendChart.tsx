import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';
import { TrendingUp } from 'lucide-react';

interface TrendChartProps {
  data: ChartDataPoint[];
  category: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, category }) => {
  return (
    <div className="glass-panel rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-white">Activity Trend</h3>
          <p className="text-xs text-slate-400">Launch frequency & market signals (6 Months)</p>
        </div>
        <div className="p-2 bg-india-green/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-india-green" />
        </div>
      </div>
      
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9933" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF9933" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              hide={true} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#334155',
                color: '#f8fafc',
                borderRadius: '8px'
              }}
              itemStyle={{ color: '#FF9933' }}
              cursor={{ stroke: '#FF9933', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#FF9933" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};