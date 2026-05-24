'use client';

import React from 'react';
import { Flame, TrendingDown, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { computeStreakState, type StreakState } from '@/lib/engagement/streak';

interface SharpnessStreakWidgetProps {
  sharpness: number;
  lastActivityDate: Date | null;
  currentStreak: number;
  longestStreak: number;
}

function StreakFlame({ tier }: { tier: StreakState['streakTier'] }) {
  const colors: Record<StreakState['streakTier'], string> = {
    cold: 'text-gray-300',
    warming: 'text-yellow-400',
    hot: 'text-orange-500',
    on_fire: 'text-red-500',
    unstoppable: 'text-purple-500',
  };

  return <Flame className={`w-5 h-5 ${colors[tier]}`} />;
}

export function SharpnessStreakWidget({
  sharpness,
  lastActivityDate,
  currentStreak,
  longestStreak,
}: SharpnessStreakWidgetProps) {
  const state = computeStreakState(lastActivityDate, currentStreak, longestStreak, sharpness);

  const progressPct = Math.round(
    ((state.currentStreak % state.nextMilestone) / state.nextMilestone) * 100,
  );

  return (
    <Card className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StreakFlame tier={state.streakTier} />
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Weekly Streak</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {state.streakTier === 'cold' ? 'Play to start' : `${state.currentStreak} week${state.currentStreak !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        {state.xpBonus > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
            <Zap className="w-3 h-3 text-green-600" />
            <span className="text-[10px] font-black text-green-700 dark:text-green-400">+{state.xpBonus}% XP</span>
          </div>
        )}
      </div>

      {/* Sharpness bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-bold ${state.sharpnessColor}`}>{state.sharpnessLabel}</span>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{state.sharpness}/100</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              state.sharpness >= 90
                ? 'bg-green-500'
                : state.sharpness >= 70
                  ? 'bg-green-400'
                  : state.sharpness >= 40
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
            }`}
            style={{ width: `${state.sharpness}%` }}
          />
        </div>
      </div>

      {/* Streak progress to next milestone */}
      {state.currentStreak > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
              Next milestone: {state.nextMilestone} weeks
            </span>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
              Best: {state.longestStreak}w
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Decay warning */}
      {state.decayWarning && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <TrendingDown className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />
          <p className="text-[11px] font-semibold text-yellow-700 dark:text-yellow-400">
            {state.decayWarning}
          </p>
        </div>
      )}
    </Card>
  );
}
