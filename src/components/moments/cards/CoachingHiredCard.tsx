/**
 * CoachingHiredCard — satori-rendered card for `coaching_hired` moments.
 *
 * Bound to the Figma component `MomentCard / Coaching Hired` (fileKey
 * xTaynEAGCjhhmcmQdPG0JZ). Mapping recorded in
 * `code-connect.manifest.json`.
 *
 * Archetype: welcoming, warm, introductory. Coach name set as if
 * quoted/signed, soft indigo portrait-light hint on the right
 * suggesting a friendly presence. Start date prominent in the footer.
 *
 * Non-token color: indigo-500 (#6366f1) for accents. Documented in
 * manifest.
 */

import React from 'react';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  MomentCardProps,
  MomentTier,
} from './types';
import { TOKENS, TIER_ORNAMENT, alpha, formatCardDate } from './tokens';

const FONT = 'Space Grotesk';
const INDIGO = '#6366f1';

export function CoachingHiredCard({ moment }: MomentCardProps) {
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
        background: TOKENS.background,
        borderRadius: 16,
        padding: 32,
        fontFamily: FONT,
        color: TOKENS.foreground,
        border: cardBorder,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: -80,
          right: -120,
          width: 360,
          height: 360,
          borderRadius: 180,
          background: `radial-gradient(circle, ${alpha(INDIGO, 0.18)} 0%, ${alpha(INDIGO, 0)} 70%)`,
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            padding: '4px 10px',
            background: alpha(INDIGO, 0.22),
            border: `1px solid ${alpha(INDIGO, 0.5)}`,
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
            Coaching Hired
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 0.75,
              color: alpha(INDIGO, 0.85),
            }}
          >
            “
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.05,
              color: alpha(TOKENS.foreground, 0.98),
              letterSpacing: '-0.025em',
              textTransform: 'uppercase',
            }}
          >
            {moment.label}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 16,
              fontWeight: 300,
              color: alpha(INDIGO, 0.8),
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            {moment.detail ?? 'YOUR NEW COACH'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'flex',
              fontSize: 12,
              fontWeight: 600,
              color: alpha(TOKENS.foreground, 0.35),
              letterSpacing: '0.05em',
            }}
          >
            STARTED
          </span>
          <span
            style={{
              display: 'flex',
              fontSize: 14,
              fontWeight: 700,
              color: alpha(TOKENS.foreground, 0.85),
              letterSpacing: '0.04em',
            }}
          >
            {formatCardDate(moment.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
