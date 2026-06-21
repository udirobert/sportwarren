/**
 * MiniAvatar — V3-style parameterized SVG avatar for the preview surface.
 *
 * Mirrors src/components/moments/cards/V3Avatar.tsx but renders inline
 * SVG so the preview pages can SSR without pulling in the satori
 * pipeline. Used by the preview landing, customize, and sim pages.
 */

import React from 'react';

// PALETTE moved to src/components/v3/tokens.ts. Re-exported here to
// preserve existing imports (20+ files import PALETTE from MiniAvatar).
// New code should import directly from '@/components/v3/tokens'.
export { PALETTE } from '@/components/v3/tokens';
import { PALETTE } from '@/components/v3/tokens';

const HAIR_PATHS: Record<string, string> = {
  short: 'M 30 38 Q 32 22 50 22 Q 68 22 70 38 Q 65 26 50 26 Q 35 26 30 38 Z',
  tall: 'M 28 40 Q 30 14 50 14 Q 70 14 72 40 Q 65 24 50 24 Q 35 24 28 40 Z',
  shaved: '',
  cap: 'M 28 38 L 28 30 Q 28 18 50 18 Q 72 18 72 30 L 72 38 Q 65 30 50 30 Q 35 30 28 38 Z',
};

export interface MiniAvatarProps {
  kit?: string;
  accent?: string;
  skin?: string;
  hair?: string;
  hairStyle?: string;
  number?: string;
  size?: number;
}

export function MiniAvatar({
  kit = PALETTE.red,
  accent = PALETTE.navy,
  skin = PALETTE.skin.mid,
  hair = PALETTE.hair.dark,
  hairStyle = 'short',
  number = '',
  size = 140,
}: MiniAvatarProps) {
  const hairD = HAIR_PATHS[hairStyle] ?? HAIR_PATHS.short;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: size / 2,
        background: PALETTE.cream,
        border: `${size > 200 ? 3 : 2}px solid ${PALETTE.ink}`,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M 8 100 Q 12 70, 32 62 Q 50 72, 68 62 Q 88 70, 92 100 Z" fill={kit} />
        <path d="M 40 64 L 50 76 L 60 64" stroke={accent} strokeWidth="1.5" fill="none" />
        <rect x="43" y="52" width="14" height="14" fill={skin} />
        <circle cx="50" cy="40" r="20" fill={skin} />
        {hairD && <path d={hairD} fill={hair} />}
        <rect x="40" y="40" width="4" height="1.5" fill={PALETTE.ink} opacity="0.65" />
        <rect x="56" y="40" width="4" height="1.5" fill={PALETTE.ink} opacity="0.65" />
        <circle cx="50" cy={88} r={size * 0.055} fill={PALETTE.cream} stroke={accent} strokeWidth="1.5" />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: size * 0.83,
          left: 0,
          width: '100%',
          textAlign: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700,
          fontSize: size * 0.085,
          color: PALETTE.ink,
          lineHeight: 1,
        }}
      >
        {number || '0'}
      </div>
    </div>
  );
}
