'use client';

import React from 'react';
import { Sparkles, Star, Trophy } from 'lucide-react';
import type { AvatarPresentation } from '@/lib/avatar/types';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';

interface AvatarHeroCardProps {
  presentation: AvatarPresentation;
  title?: string;
  subtitle?: string;
  statLine?: string;
}

export const AvatarHeroCard: React.FC<AvatarHeroCardProps> = ({
  presentation,
  title = 'Player Identity',
  subtitle,
  statLine,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-white to-emerald-50/70 p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <PlayerAvatar presentation={presentation} size="hero" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
            {title}
          </div>
          <div className="mt-1 text-xl font-black text-gray-900">
            {presentation.name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
            <span>Level {presentation.level}</span>
            <span className="text-gray-300">•</span>
            <span className="capitalize">{presentation.frameTier.replace('_', ' ')}</span>
            {presentation.archetype && (
              <>
                <span className="text-gray-300">•</span>
                <span className="capitalize">{presentation.archetype}</span>
              </>
            )}
          </div>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {presentation.badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 font-bold text-emerald-700">
                <Star className="h-3 w-3" />
                {presentation.badge.label}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-bold text-gray-700 capitalize">
              <Sparkles className="h-3 w-3" />
              {presentation.formState.replace('_', ' ')} form
            </span>
            {presentation.verifiedGlow && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 font-bold text-blue-700">
                <Trophy className="h-3 w-3" />
                Verified legacy
              </span>
            )}
          </div>
          {statLine && (
            <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              {statLine}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
