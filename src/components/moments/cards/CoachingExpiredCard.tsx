/**
 * CoachingExpiredCard — satori-rendered card for `coaching_expired`
 * moments.
 *
 * Bound to the Figma component `MomentCard / Coaching Expired`
 * (fileKey xTaynEAGCjhhmcmQdPG0JZ). Mapping recorded in
 * `code-connect.manifest.json`.
 *
 * Archetype: quiet, valedictory, archival. Restrained type weight,
 * smaller hero than coaching_hired, thin rose closing line under the
 * coach name. Mood is "closing" not "celebrating" — pairs with
 * coaching_hired for the lifecycle.
 *
 * Non-token color: rose-500 (#f43f5e) for the closing rule + accent
 * deltas. Documented in manifest.
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

export function CoachingExpiredCard({ moment }: MomentCardProps) {
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
          background: `radial-gradient(circle at 80% 70%, ${alpha(TOKENS.closing, 0.10)} 0%, transparent 60%)`,
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
            background: alpha(TOKENS.closing, 0.16),
            border: `1px solid ${alpha(TOKENS.closing, 0.4)}`,
            borderRadius: 999,
            alignSelf: 'flex-start',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: alpha(TOKENS.foreground, 0.85),
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Coaching Ended
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              fontWeight: 500,
              lineHeight: 1.1,
              color: alpha(TOKENS.foreground, 0.85),
              letterSpacing: '-0.015em',
            }}
          >
            {moment.label}
          </div>
          <div
            style={{
              display: 'flex',
              width: 180,
              height: 1,
              background: alpha(TOKENS.closing, 0.5),
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              color: alpha(TOKENS.foreground, 0.55),
              lineHeight: 1.4,
            }}
          >
            {moment.detail ?? 'Coaching engagement complete'}
          </div>
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
          ENDED {formatCardDate(moment.createdAt)}
        </span>
      </div>
    </div>
  );
}
