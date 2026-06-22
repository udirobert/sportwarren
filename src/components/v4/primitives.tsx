/**
 * V4 Stadium primitives — composable building blocks for the
 * dark stadium register.
 *
 * The homepage (`HeroSection.tsx` + landing sections) currently
 * inlines this pattern as Tailwind utilities; these primitives are
 * the same shape extracted into reusable components, available for
 * future V4 surfaces (or for a future homepage migration). Don't
 * refactor the existing homepage to use them yet — it works as-is.
 *
 * Primitives:
 *   - V4StadiumBackdrop  reusable backdrop: dark gradient + 2 blur
 *                        orbs (emerald top-left, blue top-right)
 *   - V4SectionShell     full-width section wrapper with the same
 *                        backdrop + standard vertical padding
 *   - V4Eyebrow          small uppercase pill in emerald
 *   - V4Heading          big Antonio headline, cream + optional
 *                        emerald accent line (mirrors the "Claim
 *                        Your Spot / Build Your Player Card" pattern)
 *   - V4PrimaryCTA       emerald gradient button with glow shadow
 *   - V4DualCTA          captain + player two-button row
 *   - V4EarlyAccessBadge pill with pulsing dot for early-access copy
 */

'use client';

import React from 'react';
import { PALETTE, TYPE, TRACKING } from './tokens';

// ────────────────────────────────────────────────────────────────────
// V4StadiumBackdrop — reusable backdrop layer
// ────────────────────────────────────────────────────────────────────

export interface V4StadiumBackdropProps {
  /** Show the two ambient blur orbs. Default true. */
  showOrbs?: boolean;
  /** Show the subtle dot-grid overlay. Default true. */
  showGrid?: boolean;
  /** Children render above the backdrop. */
  children?: React.ReactNode;
  className?: string;
  /** Use `min-h-screen` to fill the viewport. Default true for hero use. */
  minHeightScreen?: boolean;
}

export function V4StadiumBackdrop({
  showOrbs = true,
  showGrid = true,
  children,
  className,
  minHeightScreen = true,
}: V4StadiumBackdropProps) {
  const minH = minHeightScreen ? 'min-h-screen' : '';
  return (
    <div className={`relative bg-gray-900 overflow-hidden ${minH} ${className ?? ''}`}>
      {/* Gradient base — gray-900 → green-900 → gray-900, same as the
          shipped homepage backdrop. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #111827 0%, #14532d 50%, #111827 100%)',
        }}
        aria-hidden="true"
      />
      {showGrid && (
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      )}
      {showOrbs && (
        <>
          <div
            className="absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            style={{ background: PALETTE.emerald500 }}
            aria-hidden="true"
          />
          <div
            className="absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            style={{ background: PALETTE.blue400 }}
            aria-hidden="true"
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// V4SectionShell — backdrop + standard vertical padding wrapper
// ────────────────────────────────────────────────────────────────────

export interface V4SectionShellProps {
  children: React.ReactNode;
  ariaLabel?: string;
  id?: string;
  /** Inner max-width container. Default `max-w-7xl`. */
  maxWidth?: string;
  className?: string;
}

export function V4SectionShell({
  children,
  ariaLabel,
  id,
  maxWidth = 'max-w-7xl',
  className,
}: V4SectionShellProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative py-16 sm:py-32 overflow-hidden ${className ?? ''}`}
      style={{ background: PALETTE.gray900 }}
    >
      {/* Lighter version of the backdrop — no orbs, no min-height —
          for mid-page sections that need atmosphere without weight. */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            'linear-gradient(135deg, #111827 0%, #14532d 60%, #111827 100%)',
        }}
        aria-hidden="true"
      />
      <div className={`relative z-10 ${maxWidth} mx-auto px-3 sm:px-4 lg:px-8`}>
        {children}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────
// V4Eyebrow — small uppercase pill (emerald)
// ────────────────────────────────────────────────────────────────────

export interface V4EyebrowProps {
  children: React.ReactNode;
  /** Icon node rendered before the text (lucide-react etc). */
  icon?: React.ReactNode;
  /** Accent tone — defaults to emerald. */
  tone?: 'emerald' | 'amber' | 'blue';
}

export function V4Eyebrow({ children, icon, tone = 'emerald' }: V4EyebrowProps) {
  const color =
    tone === 'amber' ? PALETTE.amber500 : tone === 'blue' ? PALETTE.blue400 : PALETTE.emerald400;
  return (
    <div
      className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
      style={{
        background: `${color}1a`, // ~10% alpha
        border: `1px solid ${color}33`, // ~20% alpha
        color,
        letterSpacing: TRACKING.cap,
        textTransform: 'uppercase',
        fontFamily: TYPE.mono,
      }}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// V4Heading — Antonio display in cream + optional emerald accent line
// ────────────────────────────────────────────────────────────────────

export interface V4HeadingProps {
  /** Lines render stacked, each in cream by default; pass a `{ text, accent: 'emerald' }` to color a line. */
  lines: Array<{ text: string; accent?: 'cream' | 'emerald' | 'amber' | 'blue' }>;
  size?: 'huge' | 'large' | 'medium';
  as?: 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center';
}

const HEADING_SIZE_PX = { huge: 96, large: 72, medium: 56 } as const;
const ACCENT_TO_COLOR: Record<NonNullable<V4HeadingProps['lines'][number]['accent']>, string> = {
  cream: PALETTE.cream,
  emerald: PALETTE.emerald400,
  amber: PALETTE.amber500,
  blue: PALETTE.blue400,
};

export function V4Heading({ lines, size = 'huge', as: Tag = 'h1', align = 'left' }: V4HeadingProps) {
  return (
    <Tag
      style={{
        fontFamily: TYPE.display,
        fontSize: HEADING_SIZE_PX[size],
        fontWeight: 800,
        lineHeight: 0.95,
        margin: 0,
        letterSpacing: TRACKING.displayTight,
        textTransform: 'uppercase',
        textAlign: align,
      }}
    >
      {lines.map((line, i) => (
        <span
          key={i}
          style={{ display: 'block', color: ACCENT_TO_COLOR[line.accent ?? 'cream'] }}
        >
          {line.text}
        </span>
      ))}
    </Tag>
  );
}

// ────────────────────────────────────────────────────────────────────
// V4PrimaryCTA — emerald gradient button with glow shadow
// ────────────────────────────────────────────────────────────────────

export interface V4PrimaryCTAProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

const PRIMARY_STYLE: React.CSSProperties = {
  background: `linear-gradient(to right, ${PALETTE.emerald500}, #059669)`,
  color: PALETTE.cream,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontFamily: TYPE.mono,
  boxShadow: `0 10px 30px -10px ${PALETTE.emerald500}80`,
};

export function V4PrimaryCTA({ children, onClick, href, className }: V4PrimaryCTAProps) {
  const classes = `inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold rounded-xl transition-transform hover:scale-105 ${className ?? ''}`;

  if (href) {
    return (
      <a href={href} className={classes} style={PRIMARY_STYLE}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes} style={PRIMARY_STYLE}>
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────
// V4DualCTA — captain + player two-button row
// ────────────────────────────────────────────────────────────────────

export interface V4DualCTAOption {
  eyebrow: string;
  title: string;
  href?: string;
  onClick?: () => void;
  tone: 'captain' | 'player';
}

export function V4DualCTA({ options }: { options: [V4DualCTAOption, V4DualCTAOption] }) {
  return (
    <div className="mx-auto grid max-w-md gap-3 sm:grid-cols-2">
      {options.map((o, i) => {
        const isCaptain = o.tone === 'captain';
        const accent = isCaptain ? PALETTE.emerald400 : PALETTE.cream;
        const bg = isCaptain ? `${PALETTE.emerald500}26` : 'rgba(255,255,255,0.05)';
        const border = isCaptain ? `${PALETTE.emerald400}4d` : 'rgba(255,255,255,0.15)';
        const inner = (
          <span className="flex flex-col">
            <span
              className="text-[10px] font-black uppercase"
              style={{ letterSpacing: TRACKING.cap, color: accent, opacity: 0.8 }}
            >
              {o.eyebrow}
            </span>
            <span className="text-sm font-bold" style={{ color: PALETTE.cream }}>
              {o.title}
            </span>
          </span>
        );
        const style: React.CSSProperties = {
          background: bg,
          border: `1px solid ${border}`,
        };
        const classes =
          'group inline-flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors hover:bg-white/10';
        return o.href ? (
          <a key={i} href={o.href} className={classes} style={style}>
            {inner}
          </a>
        ) : (
          <button key={i} type="button" onClick={o.onClick} className={classes} style={style}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// V4EarlyAccessBadge — pill with pulsing dot
// ────────────────────────────────────────────────────────────────────

export interface V4EarlyAccessBadgeProps {
  children: React.ReactNode;
  tone?: 'emerald' | 'amber';
}

export function V4EarlyAccessBadge({ children, tone = 'emerald' }: V4EarlyAccessBadgeProps) {
  const color = tone === 'amber' ? PALETTE.amber500 : PALETTE.emerald400;
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-2"
      style={{
        background: `${color}0d`, // ~5% alpha
        border: `1px solid ${color}33`, // ~20% alpha
      }}
    >
      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
      <span
        className="text-xs font-medium"
        style={{ color, fontFamily: TYPE.mono }}
      >
        {children}
      </span>
    </div>
  );
}
