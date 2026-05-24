"use client";

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface DashboardWidget {
  id: string;
  component: React.ReactNode;
  priority: number;
  requiredLevel: 'basic' | 'intermediate' | 'advanced';
  category: 'stats' | 'social' | 'matches' | 'achievements' | 'squad';
  unlockCondition?: () => boolean;
}

interface SectionLayoutMap {
  [sectionTitle: string]: Record<string, string>;
}

interface DashboardSectionProps {
  title: string;
  widgets: DashboardWidget[];
  isExpanded: boolean;
  onToggle: () => void;
  layoutMap: SectionLayoutMap;
  featuredIds: string[];
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  widgets,
  isExpanded,
  onToggle,
  layoutMap,
  featuredIds,
}) => {
  if (widgets.length === 0) return null;

  const featuredSet = new Set(featuredIds);
  const featured = widgets.filter(w => featuredSet.has(w.id));
  const rest = widgets.filter(w => !featuredSet.has(w.id));
  const maxRest = isExpanded ? rest.length : 2;
  const totalHidden = widgets.length - (featured.length + maxRest);

  const getSpan = (id: string) =>
    layoutMap[title]?.[id] ?? 'md:col-span-12 lg:col-span-6';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="section-title">{title}</h2>
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-200 transition-colors"
        >
          {isExpanded ? (
            <>Show Less <ChevronDown className="w-3 h-3" /></>
          ) : (
            <>Show {totalHidden > 0 ? `${totalHidden + maxRest}` : 'All'} <ChevronRight className="w-3 h-3" /></>
          )}
        </button>
      </div>

      {/* Mobile: feature stack + horizontal snap scroll */}
      {featured.length > 0 && (
        <div className="md:hidden space-y-3 mb-3">
          {featured.map(w => (
            <div key={w.id} id={w.id}>
              {w.component}
            </div>
          ))}
          {!isExpanded && totalHidden > 0 && (
            <button
              onClick={onToggle}
              className="w-full py-3 text-xs font-bold uppercase tracking-widest text-green-400 border border-dashed border-white/10 rounded-xl hover:bg-white/5 transition-colors"
            >
              +{totalHidden} more
            </button>
          )}
        </div>
      )}
      {rest.length > 0 && (
        <div className="md:hidden -mx-3 px-3 relative">
          <div
            className={`flex gap-3 overflow-x-auto pb-2 snap-x snap-proximity scrollbar-hide scroll-lock-x ${rest.length > 1 ? 'carousel-fade-right' : ''}`}
            style={{ scrollbarWidth: 'none' }}
          >
            {rest.slice(0, isExpanded ? rest.length : maxRest).map(w => (
              <div key={w.id} id={w.id} className="snap-start shrink-0 w-[85vw] max-w-sm">
                {w.component}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop: featured full-width + dense grid */}
      <div className="hidden md:block space-y-3">
        {featured.map(w => (
          <div key={w.id} id={w.id}>
            {w.component}
          </div>
        ))}
        {rest.slice(0, isExpanded ? rest.length : maxRest).length > 0 && (
          <div className="grid grid-cols-12 gap-3 grid-flow-row-dense">
            {rest.slice(0, isExpanded ? rest.length : maxRest).map(w => (
              <div key={w.id} id={w.id} className={`${getSpan(w.id)} min-w-0`}>
                {w.component}
              </div>
            ))}
          </div>
        )}
        {!isExpanded && totalHidden > 0 && (
          <button
            onClick={onToggle}
            className="w-full py-3 text-xs font-bold uppercase tracking-widest text-green-400 border border-dashed border-white/10 rounded-xl hover:bg-white/5 transition-colors"
          >
            +{totalHidden} more widgets
          </button>
        )}
      </div>
    </div>
  );
};
