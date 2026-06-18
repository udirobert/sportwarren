/**
 * AchievementCard — satori-rendered card for `achievement` moments.
 *
 * Bound to the Figma component `MomentCard / Achievement` (fileKey
 * xTaynEAGCjhhmcmQdPG0JZ). Mapping recorded in
 * `code-connect.manifest.json`.
 *
 * Archetype: civic, badge-led, formal. Centered composition with a
 * concentric crest (emerald primary, xp-gold rings + center dot),
 * achievement label below, supporting detail underneath. Reads as a
 * medal or certificate — earned, not extracted.
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

const FONT = 'Space Grotesk';

export function AchievementCard({ moment }: MomentCardProps) {
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
        alignItems: 'center',
        justifyContent: 'space-between',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: SURFACE_GRADIENT,
        borderRadius: 16,
        padding: '28px 32px',
        fontFamily: FONT,
        color: TOKENS.foreground,
        border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${alpha(TOKENS.success, 0.18)} 0%, transparent 55%)`,
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

      <div
        style={{
          display: 'flex',
          padding: '4px 10px',
          background: alpha(TOKENS.success, 0.20),
          border: `1px solid ${alpha(TOKENS.success, 0.45)}`,
          borderRadius: 999,
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
          Achievement
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: 120,
          height: 120,
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            inset: 0,
            borderRadius: 60,
            background: alpha(TOKENS.success, 0.18),
            border: `2px solid ${alpha(TOKENS.xpGold, 0.7)}`,
          }}
        />
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 24,
            left: 24,
            width: 72,
            height: 72,
            borderRadius: 36,
            background: alpha(TOKENS.success, 0.4),
            border: `1px solid ${alpha(TOKENS.xpGold, 0.4)}`,
          }}
        />
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 52,
            left: 52,
            width: 16,
            height: 16,
            borderRadius: 8,
            background: TOKENS.xpGold,
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.1,
            color: alpha(TOKENS.foreground, 0.95),
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {moment.label}
        </div>
        {moment.detail && (
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              color: alpha(TOKENS.foreground, 0.6),
              lineHeight: 1.4,
              textAlign: 'center',
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
          width: '100%',
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
