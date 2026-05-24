'use client';

import React from 'react';
import { Target, Trophy, Shield, Star, Calendar, CheckCircle, Flame, Handshake, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import {
  getWeeklyChallenges,
  getDaysUntilReset,
  type WeeklyChallenge,
} from '@/lib/engagement/challenges';

const ICON_MAP: Record<string, React.ElementType> = {
  target: Target,
  trophy: Trophy,
  shield: Shield,
  star: Star,
  calendar: Calendar,
  'check-circle': CheckCircle,
  flame: Flame,
  handshake: Handshake,
};

interface WeeklyChallengesWidgetProps {
  weeklyStats: {
    goals: number;
    assists: number;
    matches: number;
    ratings: number;
    wins: number;
    cleanSheets: number;
    verifications: number;
    hatTricks: number;
  };
}

function ChallengeRow({
  challenge,
  current,
}: {
  challenge: WeeklyChallenge;
  current: number;
}) {
  const Icon = ICON_MAP[challenge.icon] ?? Target;
  const completed = current >= challenge.target;
  const progress = Math.min(100, Math.round((current / challenge.target) * 100));

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        completed
          ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20'
          : 'border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          completed
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}
      >
        {completed ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className={`text-sm font-bold truncate ${completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-900 dark:text-white'}`}>
            {challenge.title}
          </p>
          <span className="text-[10px] font-black text-green-600 dark:text-green-400 ml-2 flex-shrink-0">
            +{challenge.xpReward} XP
          </span>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{challenge.description}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completed ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
            {current}/{challenge.target}
          </span>
        </div>
      </div>
    </div>
  );
}

export function WeeklyChallengesWidget({ weeklyStats }: WeeklyChallengesWidgetProps) {
  const challenges = getWeeklyChallenges(3);
  const daysLeft = getDaysUntilReset();

  const getCurrent = (c: WeeklyChallenge): number => {
    switch (c.id) {
      case 'score-3': return weeklyStats.goals;
      case 'assist-2': return weeklyStats.assists;
      case 'play-3': return weeklyStats.matches;
      case 'rate-5': return weeklyStats.ratings;
      case 'clean-sheet': return weeklyStats.cleanSheets;
      case 'win-2': return weeklyStats.wins;
      case 'score-hat-trick': return weeklyStats.hatTricks;
      case 'verify-3': return weeklyStats.verifications;
      default: return 0;
    }
  };

  const completedCount = challenges.filter((c) => getCurrent(c) >= c.target).length;
  const totalXP = challenges.reduce((sum, c) => {
    if (getCurrent(c) >= c.target) return sum + c.xpReward;
    return sum;
  }, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Weekly Challenges</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {completedCount}/{challenges.length} done
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-bold">
            {daysLeft}d left
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {challenges.map((c) => (
          <ChallengeRow key={c.id} challenge={c} current={getCurrent(c)} />
        ))}
      </div>

      {totalXP > 0 && (
        <div className="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
          <Trophy className="w-3 h-3" />
          <span>{totalXP} XP earned this week</span>
        </div>
      )}
    </Card>
  );
}
