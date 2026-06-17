/**
 * DefaultCard — visual fallback for any moment kind that doesn't yet have a
 * dedicated archetype in the cards registry.
 *
 * Mirrors the v1 satori template structure (kicker row, label, detail,
 * footer) but rebound to Space Grotesk and to the SportWarren tier color
 * map. Used for unmapped kinds during the rollout of the per-archetype
 * library so the v2 renderer never falls back to the (Inter, 135° gradient)
 * slop pattern from v1.
 */

import React from 'react';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  MomentCardProps,
} from './types';
import { TOKENS, alpha, formatCardDate } from './tokens';

const TIER_COLOR: Record<string, string> = {
  standard: alpha(TOKENS.foreground, 0.5),
  premium: TOKENS.xpGold,
  streak_reward: TOKENS.success,
  partner: TOKENS.primary,
  internal: alpha(TOKENS.foreground, 0.35),
};

const FONT = 'Space Grotesk';

export function DefaultCard({ moment }: MomentCardProps) {
  const tierColor = TIER_COLOR[moment.tier] ?? TIER_COLOR.standard;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: TOKENS.background,
        borderRadius: 16,
        padding: 32,
        fontFamily: FONT,
        color: TOKENS.foreground,
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            padding: '4px 12px',
            background: alpha(tierColor, 0.15),
            border: `1px solid ${alpha(tierColor, 0.4)}`,
            borderRadius: 999,
            alignSelf: 'flex-start',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: tierColor,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {moment.kind.replace(/_/g, ' ')}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {moment.label}
        </div>

        {moment.detail && (
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              color: alpha(TOKENS.foreground, 0.7),
              lineHeight: 1.45,
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
          paddingTop: 16,
          borderTop: `1px solid ${TOKENS.border}`,
        }}
      >
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
