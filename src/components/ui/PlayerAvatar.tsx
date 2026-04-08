'use client';

import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import type { AvatarPresentation, AvatarSize } from '@/lib/avatar/types';

interface PlayerAvatarProps {
  presentation: AvatarPresentation;
  size?: AvatarSize;
  showBadge?: boolean;
  showStateFx?: boolean;
  showSquadAccent?: boolean;
  showCaptainMarker?: boolean;
  className?: string;
}

const sizeMap: Record<AvatarSize, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  hero: 'xl',
};

const ringMap = {
  rookie: 'ring-gray-300',
  starter: 'ring-emerald-400',
  regular: 'ring-sky-400',
  standout: 'ring-violet-500',
  captain_class: 'ring-amber-400',
  legend: 'ring-fuchsia-500 shadow-lg shadow-fuchsia-500/30',
} as const;

const glowMap = {
  neutral: '',
  hot: 'shadow-md shadow-red-500/20',
  clutch: 'shadow-md shadow-amber-500/20',
  trusted: 'shadow-md shadow-emerald-500/20',
  locked_in: 'shadow-lg shadow-violet-500/25',
} as const;

const badgeToneMap = {
  neutral: 'bg-slate-700 text-white',
  emerald: 'bg-emerald-500 text-white',
  blue: 'bg-sky-500 text-white',
  amber: 'bg-amber-500 text-slate-950',
  violet: 'bg-violet-500 text-white',
  red: 'bg-rose-500 text-white',
} as const;

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  presentation,
  size = 'md',
  showBadge = true,
  showStateFx = true,
  showSquadAccent = true,
  showCaptainMarker = true,
  className = '',
}) => {
  const wrapperStyle = showSquadAccent && presentation.squadAccent
    ? {
        borderColor: presentation.squadAccent.primaryColor,
        backgroundImage: `linear-gradient(135deg, ${presentation.squadAccent.primaryColor}22, transparent 60%)`,
      }
    : undefined;

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={[
          'relative rounded-full ring-2 p-0.5 transition-all',
          ringMap[presentation.frameTier],
          showStateFx ? glowMap[presentation.formState] : '',
          presentation.verifiedGlow ? 'after:absolute after:inset-0 after:rounded-full after:ring-1 after:ring-emerald-300/70' : '',
        ].filter(Boolean).join(' ')}
        style={wrapperStyle}
      >
        <Avatar
          src={presentation.imageUrl}
          name={presentation.name}
          size={sizeMap[size]}
          className={size === 'hero' ? 'w-20 h-20 text-2xl' : ''}
        />
      </div>

      {showCaptainMarker && presentation.captaincyActive && (
        <div className="absolute -top-1 -right-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-slate-950 shadow-sm">
          C
        </div>
      )}

      {showBadge && presentation.badge && size !== 'xs' && (
        <div
          className={[
            'absolute -bottom-1 -right-1 max-w-[88px] truncate rounded-full border border-white px-2 py-0.5 text-[9px] font-bold shadow-sm',
            badgeToneMap[presentation.badge.tone],
          ].join(' ')}
          title={presentation.badge.label}
        >
          {presentation.badge.label}
        </div>
      )}
    </div>
  );
};
