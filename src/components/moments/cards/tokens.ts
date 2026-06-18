/**
 * Design tokens resolved to hex for the satori card pipeline.
 *
 * Source of truth: `docs/DESIGN_TOKENS.md` + the Figma `Color` variable
 * collection in the SportWarren — Moment Cards file. Values mirror the
 * dark-mode resolution of each semantic token because every card surface
 * targets a dark-default share context.
 *
 * Light-mode rendering is left for a later pass — when added, swap to
 * a token resolver that reads `'light' | 'dark'` mode and returns the
 * appropriate hex.
 */

export const TOKENS = {
  background: '#0a0a0a',
  foreground: '#ffffff',
  card: '#0a0a0a',
  muted: '#1f2937',
  border: '#1f2937',

  primary: '#16a34a',
  success: '#16a34a',
  warning: '#f59e0b',
  destructive: '#ef4444',

  teamHome: '#1f9d52',
  teamAway: '#dc2626',
  xpGold: '#f59e0b',

  // Archetype-specific accents (promoted from non-token literals in session 13).
  // Mirrored in the Figma Color collection as `color/<name>`.
  identity: '#8b5cf6', // violet-500 — twin_created
  verified: '#38bdf8', // sky-400 — attestation_milestone
  welcome: '#6366f1',  // indigo-500 — coaching_hired
  closing: '#f43f5e',  // rose-500 — coaching_expired

  // Surface gradient stops. The canonical card surface, matching the
  // website's bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
  // (used by HeroSection, SquadIdentityCard, PlayerIdentityCard).
  surfaceGradientStart: '#0f172a',
  surfaceGradientMid: '#1e293b',
  surfaceGradientEnd: '#0f172a',
} as const;

/**
 * Canonical card surface. Drop into `background:` on the top-level card
 * frame instead of `TOKENS.background`. Brings every moment card into
 * visual sync with the rest of the SportWarren UI surfaces.
 */
export const SURFACE_GRADIENT = `linear-gradient(135deg, ${TOKENS.surfaceGradientStart} 0%, ${TOKENS.surfaceGradientMid} 50%, ${TOKENS.surfaceGradientEnd} 100%)`;

/**
 * Tier ornament rules — orthogonal layer applied on top of any archetype.
 * See `references/design-system.md` (Tier ornament layer).
 */
export const TIER_ORNAMENT = {
  standard: {},
  premium: {
    borderColor: TOKENS.xpGold,
    borderWidth: 1.5,
  },
  streak_reward: {
    pulseColor: TOKENS.success,
    pipText: 'STREAK',
    pipColor: TOKENS.success,
  },
  partner: {
    pipText: 'PARTNER',
    pipColor: TOKENS.foreground,
  },
  internal: {
    pipText: 'INT',
    pipColor: TOKENS.foreground,
    desaturate: true,
  },
} as const;

export function alpha(hex: string, opacity: number): string {
  const a = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

export function formatCardDate(d: Date): string {
  return d
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();
}
