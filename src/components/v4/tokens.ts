/**
 * V4 Stadium design tokens — the dark stadium register.
 *
 * Source of truth lives in Figma: file `MjsiLmieTcZhKWwimOlZ0u`,
 * collection "V4 Stadium". This module mirrors those variables so
 * components can import raw hex values, while the Figma file keeps
 * the same names and values as bound variables.
 *
 * The V3 cream register is editorial / archival (player cards,
 * recap, analysis). V4 is atmospheric / marketing (homepage hero,
 * landing sections, anywhere the brand evokes the game itself).
 *
 * NOTE: The homepage (`HeroSection.tsx` + landing sections) currently
 * inlines these colors as Tailwind utility classes (`bg-gray-900`,
 * `from-emerald-500`, etc.). This module exists for future V4
 * surfaces that want to compose at the component level without
 * reaching for Tailwind utilities. Don't refactor the existing
 * homepage to use these — it works as-is.
 */

export const PALETTE = {
  // Ground — the dark backdrop tones
  gray900:    '#111827',
  slate900:   '#0f172a',
  green900:   '#14532d',

  // Energy — the green-emerald CTA / accent axis
  emerald500: '#10b981',
  emerald400: '#34d399',

  // Light — floodlight warmth + verify-blue signal
  amber500:   '#f59e0b',
  blue400:    '#60a5fa',

  // Text — cream + muted variants for dark surfaces
  cream:      '#ffffff',
  muted:      '#d1d5db',
  subtle:     '#9ca3af',
} as const;

export type V4PaletteKey = keyof typeof PALETTE;

/**
 * Typography stacks — V4 shares V3's faces (Antonio display +
 * JetBrains Mono data). Only the ground / atmosphere changes.
 */
export const TYPE = {
  display: 'Antonio, Impact, sans-serif',
  mono:    'JetBrains Mono, monospace',
  body:    'system-ui, -apple-system, sans-serif',
} as const;

export const TRACKING = {
  capWide:      '0.22em',
  cap:          '0.18em',
  capNarrow:    '0.12em',
  displayTight: '-0.02em',
  displayBig:   '-0.03em',
} as const;
