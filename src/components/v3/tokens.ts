/**
 * V3 Risograph design tokens — single source of truth.
 *
 * Used by every player-facing surface (preview, recap, analysis,
 * public squad, public player, live session, broadcast). The PALETTE
 * was previously inlined in `src/app/preview/_components/MiniAvatar.tsx`;
 * that file re-exports from here so existing imports keep working.
 *
 * The rule: NEVER hardcode a V3 color hex in a component. Always
 * import PALETTE from here (or from MiniAvatar — same thing).
 */

export const PALETTE = {
  cream: '#f0e8d6',
  ink: '#0a0a0a',
  inkLight: '#3a3a3a',
  red: '#c91022',
  navy: '#1c3a5e',
  sage: '#4a7549',
  mustard: '#d4a437',
  skin: {
    light: '#f0d4b8',
    mid: '#c89e7c',
    dark: '#8b5a3c',
  },
  hair: {
    dark: '#2a1a10',
    brown: '#5c3a1a',
    blond: '#c89048',
    red: '#a64a20',
  },
} as const;

export type V3AccentKey = 'red' | 'navy' | 'sage' | 'mustard';

/**
 * Typography stacks. Antonio is the display face (big headlines + the
 * Overall number); JetBrains Mono is the data face (labels, captions,
 * editorial detail). The body system stack is the default.
 */
export const TYPE = {
  display: 'Antonio, Impact, sans-serif',
  mono: 'JetBrains Mono, monospace',
  body: 'system-ui, -apple-system, sans-serif',
} as const;

/**
 * Common letter-spacing values. The mono editorial caps use ~0.18-0.22em
 * tracking which gives them the V3 "engraved" feel; the display
 * headlines use tight negative tracking for impact.
 */
export const TRACKING = {
  capWide:   '0.22em',
  cap:       '0.18em',
  capNarrow: '0.12em',
  displayTight: '-0.02em',
  displayBig:   '-0.03em',
} as const;
