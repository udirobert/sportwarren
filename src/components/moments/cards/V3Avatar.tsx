/**
 * V3Avatar — parameterized SVG avatar in the Risograph register.
 *
 * Style: flat illustration, slightly retro, Subbuteo-figure energy.
 * Renders as a contained circle with kit-colored shoulders, skin tone
 * head, hair color cap, and a jersey number badge on the chest.
 *
 * Important satori constraint: `<text>` inside `<svg>` is not
 * supported. Number/initials are rendered as overlay divs.
 *
 * Designed to be customized by the player during onboarding (Duolingo
 * model) and persisted on `PlayerSkin`. See
 * `docs/makeathon/avatar-customization-roadmap.md` for the full
 * post-makeathon implementation plan.
 */

import React from 'react';
import { V3 } from './V3Scaffold';

const MONO = 'JetBrains Mono';
const HEAD = 'Antonio';

export interface V3AvatarProps {
  size?: number;
  top?: number;
  left?: number;
  kitColor?: string;
  accentColor?: string;
  skinTone?: string;
  hairColor?: string;
  number?: string;
  hairStyle?: 'short' | 'tall' | 'shaved' | 'cap';
  ringed?: boolean;
}

const HAIR_PATHS: Record<NonNullable<V3AvatarProps['hairStyle']>, string> = {
  short: 'M 30 38 Q 32 22, 50 22 Q 68 22, 70 38 Q 65 26, 50 26 Q 35 26, 30 38 Z',
  tall: 'M 28 40 Q 30 14, 50 14 Q 70 14, 72 40 Q 65 24, 50 24 Q 35 24, 28 40 Z',
  shaved: '',
  cap: 'M 28 38 L 28 30 Q 28 18, 50 18 Q 72 18, 72 30 L 72 38 Q 65 30, 50 30 Q 35 30, 28 38 Z',
};

export function V3Avatar(props: V3AvatarProps) {
  const {
    size = 110,
    top = 32,
    left = 32,
    kitColor = V3.RED,
    accentColor = V3.NAVY,
    skinTone = V3.SKIN_MID,
    hairColor = V3.HAIR_DARK,
    number = '9',
    hairStyle = 'short',
    ringed = true,
  } = props;
  const hairD = HAIR_PATHS[hairStyle];

  // Badge geometry — anchored to bottom-center of the avatar
  const badgeR = size * 0.11;
  const badgeCx = size * 0.5;
  const badgeCy = size * 0.88;

  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: V3.CREAM,
        border: ringed ? `2px solid ${V3.INK}` : 'none',
        overflow: 'hidden',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* Shoulders / jersey */}
        <path d="M 8 100 Q 12 70, 32 62 Q 50 72, 68 62 Q 88 70, 92 100 Z" fill={kitColor} />
        {/* Kit collar V */}
        <path d="M 40 64 L 50 76 L 60 64" stroke={accentColor} strokeWidth="1.5" fill="none" />
        {/* Neck */}
        <rect x="43" y="52" width="14" height="14" fill={skinTone} />
        {/* Head */}
        <circle cx="50" cy="40" r="20" fill={skinTone} />
        {/* Hair */}
        {hairD && <path d={hairD} fill={hairColor} />}
        {/* Eyes — small rects, abstract */}
        <rect x="40" y="40" width="4" height="1.5" fill={V3.INK} opacity="0.65" />
        <rect x="56" y="40" width="4" height="1.5" fill={V3.INK} opacity="0.65" />
        {/* Number badge ring */}
        <circle
          cx={badgeCx}
          cy={badgeCy}
          r={badgeR}
          fill={V3.CREAM}
          stroke={accentColor}
          strokeWidth="1.5"
        />
      </svg>
      {/* Number rendered as overlay div (satori doesn't render <text> in SVG) */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: badgeCy - badgeR + 2,
          left: 0,
          width: '100%',
          justifyContent: 'center',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: badgeR * 1.5,
          color: V3.INK,
          lineHeight: 1,
        }}
      >
        {number}
      </div>
    </div>
  );
}

/**
 * Squad crest variant — shield silhouette in the squad's kit color
 * with overlay initials + founding year.
 */
export function V3SquadCrest({
  size = 110,
  top = 32,
  left = 32,
  kitColor = V3.RED,
  accentColor = V3.NAVY,
  initials = 'BR',
  founded = "'73",
}: {
  size?: number;
  top?: number;
  left?: number;
  kitColor?: string;
  accentColor?: string;
  initials?: string;
  founded?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* Shield silhouette */}
        <path
          d="M 50 4 L 92 14 L 92 56 Q 92 80, 50 96 Q 8 80, 8 56 L 8 14 Z"
          fill={kitColor}
          stroke={V3.INK}
          strokeWidth="2"
        />
        {/* Inner band */}
        <path
          d="M 50 12 L 84 20 L 84 54 Q 84 74, 50 88 Q 16 74, 16 54 L 16 20 Z"
          fill="none"
          stroke={V3.CREAM}
          strokeWidth="1"
          strokeOpacity="0.5"
        />
        {/* Small football mark dot */}
        <circle cx="50" cy={size > 100 ? 82 : 84} r="2.5" fill={V3.CREAM} />
      </svg>
      {/* Overlay initials */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: size * 0.32,
          left: 0,
          width: '100%',
          justifyContent: 'center',
          fontFamily: HEAD,
          fontWeight: 700,
          fontSize: size * 0.38,
          color: V3.CREAM,
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}
      >
        {initials}
      </div>
      {/* Founded year */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: size * 0.68,
          left: 0,
          width: '100%',
          justifyContent: 'center',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: size * 0.1,
          color: V3.CREAM,
          opacity: 0.85,
          lineHeight: 1,
        }}
      >
        {founded}
      </div>
    </div>
  );
}
