import type { ReactNode } from 'react';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface KeyStat {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface AIReport {
  content: string;
  sources: GroundingChunk[];
  chartData: ChartDataPoint[];
  stats: KeyStat[];
}

export type Category = 'latest' | 'startups' | 'enterprise' | 'research';

export interface NavItem {
  id: Category;
  label: string;
  description: string;
  icon: ReactNode;
}