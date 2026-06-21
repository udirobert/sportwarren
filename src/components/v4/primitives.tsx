/**
 * V4 verdant primitives — the GAME register.
 *
 * V3 is the register for the *record* (editorial cream paper + ink).
 * V4 is the register for the *game* — the pitch, dusk, mud, programme
 * covers, the lived experience of grassroots football. Both share
 * V3 typography (Antonio + JetBrains Mono); only the ground changes.
 *
 * Use V4 on surfaces that need to evoke the experience of playing:
 * homepage hero, marketing CTAs, anywhere the brand says "this is
 * about THE GAME, not the data."
 *
 * Color tokens live in v3/tokens.ts (single color source); primitives
 * live here because they encode V4-specific composition rules
 * (solid blocks instead of gradients, chalk-line edges, riso grain).
 */

import React from 'react';
import { PALETTE, TYPE, TRACKING, type V4AccentKey } from '@/components/v3/tokens';

// ────────────────────────────────────────────────────────────────────
// V4PaperGrain — low-opacity SVG noise overlay.
//
// The Riso programme aesthetic depends on imperfection. This overlay
// adds a subtle texture that disrupts the SaaS-glossy flatness. Use
// inside any V4 panel; positions absolutely.
// ────────────────────────────────────────────────────────────────────

export interface V4PaperGrainProps {
  /** Opacity 0-1. Default 0.04 — visible only as texture. */
  opacity?: number;
  /** Z-index. Defaults to 1 (sits above bg, below content). */
  zIndex?: number;
}

export function V4PaperGrain({ opacity = 0.04, zIndex = 1 }: V4PaperGrainProps) {
  // SVG noise via feTurbulence — no external image asset.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#n)"/>
    </svg>
  `.replace(/\s+/g, ' ').trim();
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: url,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        opacity,
        pointerEvents: 'none',
        zIndex,
        mixBlendMode: 'multiply',
      }}
    />
  );
}

// ────────────────────────────────────────────────────────────────────
// V4ChalkLine — chalk-style edge linework.
//
// Hand-drawn-feeling thin off-white line. Use for panel edges, between
// sections, anywhere a hairline divider would go. Subtle wave + slight
// imperfection via SVG path.
// ────────────────────────────────────────────────────────────────────

export interface V4ChalkLineProps {
  orientation?: 'horizontal' | 'vertical';
  length?: number | string;
  thickness?: number;
  color?: string;
  /** Mark style: 'continuous' | 'dashed' | 'tally' (tally for matchday energy) */
  style?: 'continuous' | 'dashed' | 'tally';
  opacity?: number;
}

export function V4ChalkLine({
  orientation = 'horizontal',
  length = '100%',
  thickness = 2,
  color = PALETTE.chalk,
  style = 'continuous',
  opacity = 0.7,
}: V4ChalkLineProps) {
  const dash =
    style === 'dashed' ? '4 6'
    : style === 'tally' ? '1 8 1 8 1 8 1 24'
    : undefined;

  if (orientation === 'horizontal') {
    return (
      <svg
        aria-hidden="true"
        width={length}
        height={thickness + 2}
        style={{ display: 'block', opacity }}
        viewBox={`0 0 100 ${thickness + 2}`}
        preserveAspectRatio="none"
      >
        <path
          d={`M 0 ${(thickness + 2) / 2} Q 25 ${(thickness + 2) / 2 - 0.4} 50 ${(thickness + 2) / 2} T 100 ${(thickness + 2) / 2}`}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          {...(dash ? { strokeDasharray: dash } : {})}
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      width={thickness + 2}
      height={length}
      style={{ display: 'block', opacity }}
      viewBox={`0 0 ${thickness + 2} 100`}
      preserveAspectRatio="none"
    >
      <path
        d={`M ${(thickness + 2) / 2} 0 Q ${(thickness + 2) / 2 - 0.4} 25 ${(thickness + 2) / 2} 50 T ${(thickness + 2) / 2} 100`}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        fill="none"
        {...(dash ? { strokeDasharray: dash } : {})}
      />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────
// V4PitchPanel — solid block of pitch/dusk/worn with cream type on top.
//
// The signature V4 surface: NO gradient. Solid color. Paper grain
// overlay. Optional chalk line at top and bottom. Use for hero
// backgrounds, marketing CTAs, any moment where the brand says GAME.
// ────────────────────────────────────────────────────────────────────

export interface V4PitchPanelProps {
  children: React.ReactNode;
  /** Background color from the verdant palette. Defaults to pitch. */
  accent?: V4AccentKey;
  /**
   * Depth treatment.
   *   atmospheric — verdant gradient (dusk → accent → dusk) + soft
   *     ambient light orbs (mustard + sage). Use for hero / large
   *     section backdrops where flat would feel plastic.
   *   flat — solid accent fill. Use for small inline panels / cards
   *     where atmospheric depth would compete with content.
   * Default: 'atmospheric'.
   */
  depth?: 'atmospheric' | 'flat';
  /** Show paper grain texture. Default true. */
  grain?: boolean;
  /** Show chalk lines at top + bottom edges. Default true. */
  chalkEdges?: boolean;
  /** Min height for hero-class panels. */
  minHeight?: string | number;
  /** Padding. */
  padding?: string;
  /** Border radius. Default 0 — V4 is brutalist. */
  borderRadius?: number;
  /** Override style on the outermost panel (escape hatch). */
  style?: React.CSSProperties;
  className?: string;
}

const PITCH_MID = '#4a6428';

export function V4PitchPanel({
  children,
  accent = 'pitch',
  depth = 'atmospheric',
  grain = true,
  chalkEdges = true,
  minHeight,
  padding,
  borderRadius = 0,
  style,
  className,
}: V4PitchPanelProps) {
  const isAtmospheric = depth === 'atmospheric' && accent === 'pitch';
  const background = isAtmospheric
    ? `linear-gradient(180deg, ${PALETTE.dusk} 0%, ${PITCH_MID} 18%, ${PALETTE.pitch} 50%, ${PITCH_MID} 82%, ${PALETTE.dusk} 100%)`
    : PALETTE[accent];

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        background,
        color: PALETTE.cream,
        overflow: 'hidden',
        ...(minHeight !== undefined ? { minHeight } : {}),
        ...(padding !== undefined ? { padding } : {}),
        borderRadius,
        ...style,
      }}
    >
      {isAtmospheric && (
        <>
          <div
            className="absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-20"
            style={{ background: PALETTE.mustard }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 -right-4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-15"
            style={{ background: PALETTE.sage }}
            aria-hidden="true"
          />
        </>
      )}
      {grain && <V4PaperGrain opacity={isAtmospheric ? 0.09 : 0.05} zIndex={1} />}
      {chalkEdges && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
            <V4ChalkLine opacity={0.45} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }}>
            <V4ChalkLine opacity={0.45} />
          </div>
        </>
      )}
      <div style={{ position: 'relative', zIndex: 3 }}>{children}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// V4Heading — Antonio display on a verdant panel.
//
// Convenience wrapper that mirrors V3Heading but applies cream color
// by default (since V4 panels are dark). Same sizes.
// ────────────────────────────────────────────────────────────────────

export interface V4HeadingProps {
  children: React.ReactNode;
  size?: 'huge' | 'large' | 'medium';
  color?: string;
  as?: 'h1' | 'h2' | 'h3';
}

const HEADING_SIZE = { huge: 72, large: 56, medium: 36 } as const;

export function V4Heading({ children, size = 'huge', color, as: Tag = 'h1' }: V4HeadingProps) {
  return (
    <Tag
      style={{
        fontFamily: TYPE.display,
        fontSize: HEADING_SIZE[size],
        fontWeight: 800,
        lineHeight: 0.95,
        margin: 0,
        letterSpacing: TRACKING.displayTight,
        textTransform: 'uppercase',
        color: color ?? PALETTE.cream,
      }}
    >
      {children}
    </Tag>
  );
}

// ────────────────────────────────────────────────────────────────────
// V4Label — small uppercase mono eyebrow on verdant ground.
// ────────────────────────────────────────────────────────────────────

export interface V4LabelProps {
  children: React.ReactNode;
  color?: string;
  marginBottom?: number;
}

export function V4Label({ children, color = PALETTE.mustard, marginBottom = 12 }: V4LabelProps) {
  return (
    <div
      style={{
        fontFamily: TYPE.mono,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: TRACKING.capWide,
        textTransform: 'uppercase',
        color,
        marginBottom,
      }}
    >
      {children}
    </div>
  );
}
