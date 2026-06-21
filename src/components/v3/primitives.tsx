/**
 * V3 Risograph primitives — composable building blocks shared across
 * every player-facing surface.
 *
 * Hard rule: any new V3 page should compose from these primitives
 * rather than inlining the styles. If a pattern is repeated 3+ times,
 * promote it here.
 *
 * Currently included:
 *   - V3PageShell      cream background + max-width container + padding
 *   - V3Ribbon         4-color top strip (mustard / red / navy / sage)
 *   - V3IdentityLine   "SportWarren · <context>" eyebrow
 *   - V3Heading        Antonio display headline
 *   - V3SectionLabel   small uppercase mono label between sections
 *   - V3StatBand       black ink + accent left border, BIG number left,
 *                      label right (used for goals / overall / counts)
 *   - V3CTAButton      primary mustard fill, secondary transparent border
 *   - V3HollowCard     dashed border with accent — "unknown / empty" slot
 *   - V3SolidCard      bordered solid card — generic content container
 */

import React from 'react';
import Link from 'next/link';
import { PALETTE, TYPE, TRACKING, type V3AccentKey } from './tokens';

// ────────────────────────────────────────────────────────────────────
// V3PageShell
// ────────────────────────────────────────────────────────────────────

export interface V3PageShellProps {
  children: React.ReactNode;
  maxWidth?: number;
  paddingTop?: number;
}

export function V3PageShell({ children, maxWidth = 600, paddingTop = 40 }: V3PageShellProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: `${paddingTop}px 20px 80px`,
        fontFamily: TYPE.body,
        color: PALETTE.ink,
      }}
    >
      <div style={{ maxWidth, margin: '0 auto' }}>{children}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// V3Ribbon — the 4-color top strip
// ────────────────────────────────────────────────────────────────────

export interface V3RibbonProps {
  /** Reorder the 4 colors for a different page. Defaults to mustard-red-navy-sage. */
  order?: V3AccentKey[];
  marginBottom?: number;
}

const DEFAULT_RIBBON: V3AccentKey[] = ['mustard', 'red', 'navy', 'sage'];

export function V3Ribbon({ order = DEFAULT_RIBBON, marginBottom = 28 }: V3RibbonProps) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom }}>
      {order.map((c, i) => (
        <div key={`${c}-${i}`} style={{ width: 28, height: 4, background: PALETTE[c] }} />
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// V3IdentityLine — the small uppercase eyebrow line
// ────────────────────────────────────────────────────────────────────

export interface V3IdentityLineProps {
  /** Trailing text after "SportWarren · ". Pass null to render just "SportWarren". */
  context?: string | null;
  /** Show the small red identity dot before the text. Defaults to true. */
  showDot?: boolean;
  marginBottom?: number;
  /** Override the base color (default navy). */
  color?: string;
}

export function V3IdentityLine({
  context,
  showDot = true,
  marginBottom = 12,
  color = PALETTE.navy,
}: V3IdentityLineProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom,
        fontFamily: TYPE.mono,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: TRACKING.capWide,
        textTransform: 'uppercase',
        color,
      }}
    >
      {showDot && (
        <div style={{ width: 7, height: 7, borderRadius: 3.5, background: PALETTE.red }} />
      )}
      <span>SportWarren{context ? ` · ${context}` : ''}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// V3Heading — Antonio display headline (e.g. "Hello Kim.")
// ────────────────────────────────────────────────────────────────────

export interface V3HeadingProps {
  children: React.ReactNode;
  size?: 'huge' | 'large' | 'medium';
  color?: string;
  as?: 'h1' | 'h2' | 'h3';
}

const HEADING_SIZE = {
  huge: 72,
  large: 56,
  medium: 36,
} as const;

export function V3Heading({ children, size = 'huge', color, as: Tag = 'h1' }: V3HeadingProps) {
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
        color: color ?? PALETTE.ink,
      }}
    >
      {children}
    </Tag>
  );
}

// ────────────────────────────────────────────────────────────────────
// V3SectionLabel — small uppercase mono label between sections
// ────────────────────────────────────────────────────────────────────

export interface V3SectionLabelProps {
  children: React.ReactNode;
  color?: string;
  marginBottom?: number;
  marginTop?: number;
  rightSlot?: React.ReactNode;
}

export function V3SectionLabel({
  children,
  color = PALETTE.navy,
  marginBottom = 12,
  marginTop,
  rightSlot,
}: V3SectionLabelProps) {
  const content = (
    <span
      style={{
        fontFamily: TYPE.mono,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: TRACKING.cap,
        textTransform: 'uppercase',
        color,
      }}
    >
      {children}
    </span>
  );

  if (rightSlot) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom,
          ...(marginTop !== undefined ? { marginTop } : {}),
        }}
      >
        {content}
        {rightSlot}
      </div>
    );
  }

  return (
    <div style={{ marginBottom, ...(marginTop !== undefined ? { marginTop } : {}) }}>
      {content}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// V3StatBand — black ink panel with accent left border + big number
// ────────────────────────────────────────────────────────────────────

export interface V3StatBandProps {
  /** The big number/value (Antonio display). */
  value: React.ReactNode;
  /** Right-aligned uppercase mono label. */
  label: React.ReactNode;
  accent?: V3AccentKey;
  marginBottom?: number;
}

export function V3StatBand({
  value,
  label,
  accent = 'red',
  marginBottom,
}: V3StatBandProps) {
  return (
    <div
      style={{
        background: PALETTE.ink,
        color: PALETTE.cream,
        padding: '10px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        borderLeft: `4px solid ${PALETTE[accent]}`,
        ...(marginBottom !== undefined ? { marginBottom } : {}),
      }}
    >
      <span style={{ fontFamily: TYPE.mono, fontSize: 22, fontWeight: 700 }}>{value}</span>
      <span
        style={{
          fontFamily: TYPE.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: TRACKING.cap,
          textTransform: 'uppercase',
          opacity: 0.85,
          textAlign: 'right',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// V3CTAButton — primary mustard fill OR secondary transparent border
// ────────────────────────────────────────────────────────────────────

export interface V3CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  /** Override the accent for the primary fill (default mustard + red border). */
  accent?: V3AccentKey;
  marginBottom?: number;
  type?: 'button' | 'submit';
}

export function V3CTAButton({
  children,
  href,
  onClick,
  variant = 'primary',
  disabled = false,
  accent,
  marginBottom,
  type = 'button',
}: V3CTAButtonProps) {
  const isPrimary = variant === 'primary';
  const isTertiary = variant === 'tertiary';

  const baseStyle: React.CSSProperties = {
    padding: isTertiary ? '12px 18px' : isPrimary ? '18px 20px' : '14px 20px',
    fontFamily: TYPE.mono,
    fontSize: isTertiary ? 11 : isPrimary ? 15 : 13,
    fontWeight: 700,
    letterSpacing: TRACKING.capNarrow,
    textTransform: 'uppercase',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: isPrimary
      ? `2px solid ${PALETTE.red}`
      : isTertiary
      ? `1px solid ${PALETTE.inkLight}`
      : `2px solid ${PALETTE.navy}`,
    background: isPrimary ? PALETTE[accent ?? 'mustard'] : 'transparent',
    color: isTertiary ? PALETTE.inkLight : PALETTE.ink,
    ...(marginBottom !== undefined ? { marginBottom } : {}),
  };

  if (href) {
    return (
      <Link href={href} style={baseStyle}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...baseStyle, width: '100%' }}>
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────
// V3HollowCard — dashed-border accent card (for empty / unknown slots)
// ────────────────────────────────────────────────────────────────────

export interface V3HollowCardProps {
  accent?: V3AccentKey;
  children: React.ReactNode;
  padding?: string;
}

export function V3HollowCard({ accent = 'navy', children, padding = '14px 16px' }: V3HollowCardProps) {
  return (
    <div
      style={{
        border: `2px dashed ${PALETTE[accent]}`,
        padding,
        background: 'rgba(0,0,0,0.015)',
      }}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// V3SolidCard — bordered solid card with optional accent left strip
// ────────────────────────────────────────────────────────────────────

export interface V3SolidCardProps {
  children: React.ReactNode;
  accent?: V3AccentKey;
  /** Render the accent as a left-side strip rather than a full border. */
  accentStripe?: boolean;
  background?: string;
  padding?: string;
  marginBottom?: number;
}

export function V3SolidCard({
  children,
  accent,
  accentStripe = true,
  background = PALETTE.cream,
  padding = '16px 18px',
  marginBottom,
}: V3SolidCardProps) {
  const borderColor = accent ? PALETTE[accent] : PALETTE.ink;
  return (
    <div
      style={{
        background,
        border: `2px solid ${borderColor}`,
        ...(accentStripe && accent ? { borderLeft: `8px solid ${borderColor}` } : {}),
        padding,
        ...(marginBottom !== undefined ? { marginBottom } : {}),
      }}
    >
      {children}
    </div>
  );
}
