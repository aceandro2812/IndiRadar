import React from 'react';
import { Category, NavItem } from '../types';
import { Rocket, Building2, GraduationCap, Flame } from 'lucide-react';

interface CategoryNavProps {
  activeCategory: Category;
  onSelect: (c: Category) => void;
  isLoading: boolean;
}

const items: NavItem[] = [
  { id: 'latest', label: 'Headlines', description: 'Breaking News', icon: <Flame className="w-4 h-4" /> },
  { id: 'startups', label: 'Startups', description: 'Venture Capital', icon: <Rocket className="w-4 h-4" /> },
  { id: 'enterprise', label: 'Enterprise', description: 'Corporate AI', icon: <Building2 className="w-4 h-4" /> },
  { id: 'research', label: 'Research', description: 'Academic R&D', icon: <GraduationCap className="w-4 h-4" /> },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({ activeCategory, onSelect, isLoading }) => {
  return (
    <div className="w-full border-b border-white/10 bg-black/20 backdrop-blur-md mb-8 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto no-scrollbar gap-6 py-1">
          {items.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => !isLoading && onSelect(item.id)}
                disabled={isLoading}
                className={`
                  group flex items-center gap-3 py-4 border-b-2 transition-all duration-300 whitespace-nowrap
                  ${isActive 
                    ? 'border-india-saffron text-white' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${isActive ? 'bg-india-saffron/20 text-india-saffron' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'}
                `}>
                  {item.icon}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-[10px] font-medium opacity-60 hidden md:block uppercase tracking-wider">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};