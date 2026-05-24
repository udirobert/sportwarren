'use client';

import React from 'react';
import { Award, ChevronRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getPrestigeProgress } from '@/lib/engagement/prestige';

interface PrestigeWidgetProps {
  totalLifetimeXP: number;
  onClick?: () => void;
}

export function PrestigeWidget({ totalLifetimeXP, onClick }: PrestigeWidgetProps) {
  const { tier, nextTier, progress, xpToNext } = getPrestigeProgress(totalLifetimeXP);

  return (
    <Card hover={!!onClick} onClick={onClick} padding="sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl border-2 ${tier.borderColor} flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900`}>
          <Award className={`w-5 h-5 ${tier.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-sm font-black uppercase tracking-wide ${tier.color}`}>
              {tier.name}
            </span>
            {tier.level > 0 && (
              <Sparkles className={`w-3 h-3 ${tier.color}`} />
            )}
          </div>

          {nextTier ? (
            <>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                    tier.level === 0
                      ? 'from-gray-400 to-amber-500'
                      : tier.level === 1
                        ? 'from-amber-500 to-gray-400'
                        : tier.level === 2
                          ? 'from-gray-400 to-yellow-400'
                          : tier.level === 3
                            ? 'from-yellow-400 to-cyan-400'
                            : 'from-cyan-400 to-purple-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                <span className="font-bold">{xpToNext.toLocaleString()} XP</span> to {nextTier.name}
              </p>
            </>
          ) : (
            <p className="text-[10px] font-bold text-purple-500">Max prestige reached</p>
          )}
        </div>

        {onClick && (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </div>
    </Card>
  );
}
