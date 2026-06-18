/**
 * FootballMark — shared football-grammar element.
 *
 * Small CSS-drawn ball icon used in card footers as a recurring brand
 * signature mark. Concentric circles + a faint hex-panel suggestion
 * via a darker triangular spot inside the outer circle. Reads as
 * "football" via context (next to the SPORTWARREN wordmark) without
 * needing a glyph or SVG — satori 0.26 renders this cleanly.
 *
 * Sizes:
 *   - landscape cards (600×400): 12px
 *   - social square (1080×1080): 20px
 *   - story portrait (1080×1920): 24px
 *
 * Why a custom mark and not a ⚽ glyph: the Google Fonts CSS API
 * serves a Latin-only subset by default — ⚽ (U+26BD) renders as a
 * tofu box. We hit the same issue with ✦ and ★ earlier.
 */

import React from 'react';
import { TOKENS, alpha } from './tokens';

export interface FootballMarkProps {
  size?: number;
  /** Override the ball color (defaults to foreground). */
  color?: string;
  /** Outer ring opacity over the ball fill. */
  ringOpacity?: number;
}

export function FootballMark({
  size = 12,
  color = TOKENS.foreground,
  ringOpacity = 0.85,
}: FootballMarkProps) {
  const innerSize = size * 0.42;
  const innerOffset = (size - innerSize) / 2;

  return (
    <div
      style={{
        display: 'flex',
        width: size,
        height: size,
        borderRadius: size / 2,
        background: alpha(color, ringOpacity),
        border: `1px solid ${alpha(color, 0.55)}`,
        position: 'relative',
      }}
    >
      {/* Inner "panel" suggestion */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: innerOffset,
          left: innerOffset,
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          background: TOKENS.background,
          opacity: 0.55,
        }}
      />
    </div>
  );
}
