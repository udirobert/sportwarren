/**
 * PitchTexture — shared football-grammar element.
 *
 * Renders a subtle vertical halfway line + center circle behind the
 * card content. Reads subconsciously as "this is football" without
 * ever being literal. Apply absolutely-positioned inside any card
 * frame — the parent must be `position: relative` (every card root
 * already is).
 *
 * Opacity tuned to 4–6% on dark surfaces so the texture registers
 * peripheral-vision but never competes with content. Two intensity
 * levels are exposed via `opacity` for cards where the composition
 * benefits from a slightly stronger pitch (e.g. sim_complete's
 * tactical register vs. record_broken's hero-typography register).
 *
 * Sized via explicit `cardWidth` + `cardHeight` rather than CSS
 * percentages because satori 0.26's percentage-positioning support
 * is uneven for absolutely-positioned elements.
 */

import React from 'react';
import { TOKENS, alpha } from './tokens';

export interface PitchTextureProps {
  cardWidth: number;
  cardHeight: number;
  opacity?: number;
  /** Inset from the edges (so the texture stops short of the bezel). Default 16. */
  inset?: number;
}

export function PitchTexture({
  cardWidth,
  cardHeight,
  opacity = 0.05,
  inset = 16,
}: PitchTextureProps) {
  const halfwayX = cardWidth / 2;
  const circleSize = Math.min(cardWidth, cardHeight) * 0.22;
  const circleX = (cardWidth - circleSize) / 2;
  const circleY = (cardHeight - circleSize) / 2;
  const lineColor = alpha(TOKENS.foreground, opacity);
  const arcColor = alpha(TOKENS.foreground, opacity * 1.2);

  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Halfway line */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: inset,
          bottom: inset,
          left: halfwayX - 0.5,
          width: 1,
          background: lineColor,
        }}
      />
      {/* Center circle */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: circleY,
          left: circleX,
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          border: `1px solid ${arcColor}`,
        }}
      />
      {/* Center dot */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: cardHeight / 2 - 1.5,
          left: cardWidth / 2 - 1.5,
          width: 3,
          height: 3,
          borderRadius: 1.5,
          background: arcColor,
        }}
      />
    </div>
  );
}
