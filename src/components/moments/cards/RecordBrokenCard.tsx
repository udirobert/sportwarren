/**
 * RecordBrokenCard — satori-rendered card for `record_broken` moments.
 *
 * Bound to the Figma component `MomentCard / Record Broken` in the
 * `SportWarren — Moment Cards` library (fileKey: xTaynEAGCjhhmcmQdPG0JZ,
 * nodeId: 7:65). The binding is recorded in
 * `src/components/moments/cards/code-connect.manifest.json` — Figma's
 * built-in Code Connect requires Org/Enterprise, so the manifest is the
 * Pro-tier substitute the v2 renderer and any tooling reads from.
 *
 * Figma URL:
 *   https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ?node-id=7-65
 *
 * Archetype: oversized destructive-red type as imagery, dark surface,
 * "broken" horizontal rule motif. See
 * `.claude/skills/sw-moments/references/archetypes.md` (record_broken).
 */

import React from 'react';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  MomentCardProps,
  MomentTier,
} from './types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from './tokens';

const FONT = 'Space Grotesk';

export function RecordBrokenCard({ moment }: MomentCardProps) {
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
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 15% 30%, ${alpha(TOKENS.destructive, 0.18)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            padding: '4px 10px',
            background: alpha(TOKENS.destructive, 0.18),
            border: `1px solid ${alpha(TOKENS.destructive, 0.45)}`,
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
            Record Broken
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.05,
            color: TOKENS.destructive,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            maxWidth: '100%',
          }}
        >
          {moment.label}
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <div style={{ display: 'flex', width: 140, height: 3, background: TOKENS.destructive }} />
          <div style={{ display: 'flex', width: 60, height: 3, background: alpha(TOKENS.destructive, 0.5) }} />
          <div style={{ display: 'flex', width: 180, height: 3, background: TOKENS.destructive }} />
          <div style={{ display: 'flex', width: 40, height: 3, background: alpha(TOKENS.destructive, 0.35) }} />
        </div>

        {moment.detail && (
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              color: alpha(TOKENS.foreground, 0.65),
              lineHeight: 1.4,
              maxWidth: '100%',
            }}
          >
            {moment.detail}
          </div>
        )}
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
                background: alpha(pipColor, 0.18),
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
