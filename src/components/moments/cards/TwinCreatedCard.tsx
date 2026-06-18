/**
 * TwinCreatedCard — satori-rendered card for `twin_created` moments.
 *
 * Bound to the Figma component `MomentCard / Twin Created` (fileKey
 * xTaynEAGCjhhmcmQdPG0JZ). Mapping recorded in
 * `code-connect.manifest.json`.
 *
 * Archetype: identity-forward, generative, mysterious. Subject's name
 * dominates as the hero element. Constellation of low-opacity violet
 * dots scattered as a generative motif suggests "particles forming an
 * identity". Violet accent on the kicker + role line.
 *
 * Data shape expectation
 * ----------------------
 * `TwinService.recordEvent({ kind: 'twin_created' })` emits moment rows:
 *   label  = Subject's display name (e.g. "Marcus Tate")
 *   detail = Optional secondary line (role, squad, etc.)
 *
 * Non-token color: this archetype uses a literal violet (#8b5cf6) for
 * the kicker pill, role line, and constellation dots, because the
 * design system doesn't include a violet token. If a `color/identity`
 * token is later introduced, swap the literal for the binding.
 *
 * Figma URL:
 *   https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ?node-id=<set>
 */

import React from 'react';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  MomentCardProps,
  MomentTier,
} from './types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from './tokens';
import { PitchTexture } from './PitchTexture';
import { FootballMark } from './FootballMark';

const FONT = 'Space Grotesk';

const CONSTELLATION: Array<{ x: number; y: number; size: number; opacity: number }> = [
  { x: 380, y: 60, size: 4, opacity: 0.6 },
  { x: 450, y: 100, size: 2, opacity: 0.35 },
  { x: 520, y: 70, size: 5, opacity: 0.7 },
  { x: 490, y: 160, size: 3, opacity: 0.5 },
  { x: 540, y: 200, size: 2, opacity: 0.4 },
  { x: 420, y: 220, size: 4, opacity: 0.55 },
  { x: 360, y: 180, size: 2, opacity: 0.3 },
  { x: 50, y: 60, size: 3, opacity: 0.45 },
  { x: 90, y: 100, size: 2, opacity: 0.3 },
];

export function TwinCreatedCard({ moment }: MomentCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth}px solid ${ornament.borderColor}`
      : 'none';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: SURFACE_GRADIENT,
        borderRadius: 16,
        padding: 32,
        fontFamily: FONT,
        color: TOKENS.foreground,
        border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <PitchTexture cardWidth={CARD_WIDTH} cardHeight={CARD_HEIGHT} opacity={0.04} />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 70% 40%, ${alpha(TOKENS.identity, 0.16)} 0%, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />
      {CONSTELLATION.map((dot, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            position: 'absolute',
            top: dot.y,
            left: dot.x,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.size / 2,
            background: TOKENS.identity,
            opacity: dot.opacity,
          }}
        />
      ))}

      {showPulse && (
        <div
          style={{
            position: 'absolute',
            top: 28,
            right: 28,
            width: 14,
            height: 14,
            borderRadius: 7,
            background: TOKENS.success,
            boxShadow: `0 0 20px 3px ${alpha(TOKENS.success, 0.6)}`,
            display: 'flex',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          padding: '4px 10px',
          background: alpha(TOKENS.identity, 0.22),
          border: `1px solid ${alpha(TOKENS.identity, 0.5)}`,
          borderRadius: 999,
          alignSelf: 'flex-start',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: alpha(TOKENS.foreground, 0.95),
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Twin Created
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1,
            color: alpha(TOKENS.foreground, 0.98),
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
          }}
        >
          {moment.label}
        </div>
        {moment.detail && (
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              fontWeight: 300,
              color: alpha(TOKENS.identity, 0.9),
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {moment.detail}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            fontSize: 14,
            color: alpha(TOKENS.foreground, 0.55),
            lineHeight: 1.4,
            marginTop: 4,
          }}
        >
          Living record opened. Every match leaves a mark from here.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {pipText && (
            <div
              style={{
                display: 'flex',
                padding: '2px 6px',
                borderRadius: 4,
                background: alpha(pipColor, 0.22),
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: alpha(TOKENS.foreground, 0.95),
                  letterSpacing: '0.1em',
                }}
              >
                {pipText}
              </span>
            </div>
          )}
          <FootballMark size={12} color={TOKENS.identity} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: alpha(TOKENS.foreground, 0.45),
              letterSpacing: '0.05em',
            }}
          >
            SPORTWARREN
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: alpha(TOKENS.foreground, 0.45),
            letterSpacing: '0.05em',
          }}
        >
          {formatCardDate(moment.createdAt)}
        </span>
      </div>
    </div>
  );
}
