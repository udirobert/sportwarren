/**
 * AttestationMilestoneCard — satori-rendered card for
 * `attestation_milestone` moments.
 *
 * Bound to the Figma component `MomentCard / Attestation Milestone`
 * (fileKey xTaynEAGCjhhmcmQdPG0JZ). Mapping recorded in
 * `code-connect.manifest.json`.
 *
 * Archetype: civic, official, certificate-led. A slightly-rotated
 * stamp on the left with the milestone count + "VERIFIED" label,
 * title and subtitle on the right. Ties to SportWarren's onchain
 * preservation thesis — "your record outlasts the platform."
 *
 * Non-token color: sky-400 (#38bdf8) for the stamp + accents. Not in
 * the design tokens yet; documented in manifest.
 *
 * Data shape expectation
 * ----------------------
 * Emitted from settlement workers when a milestone count is hit:
 *   label  = "100 MATCHES ATTESTED"  (or similar)
 *   detail = Tagline; defaults to the standard preservation message
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
const SKY = '#38bdf8';

function extractCount(label: string): string {
  const m = label.match(/(\d+)/);
  return m ? m[1] : '✓';
}

export function AttestationMilestoneCard({ moment }: MomentCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth}px solid ${ornament.borderColor}`
      : 'none';

  const count = extractCount(moment.label);

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
      }}
    >
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            padding: '4px 10px',
            background: alpha(SKY, 0.22),
            border: `1px solid ${alpha(SKY, 0.5)}`,
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
            Attestation Milestone
          </span>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              position: 'relative',
              width: 150,
              height: 100,
              background: alpha(SKY, 0.1),
              border: `1.5px solid ${alpha(SKY, 0.6)}`,
              borderRadius: 6,
              transform: 'rotate(-3deg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 8,
                left: 8,
                width: 134,
                height: 84,
                border: `1px solid ${alpha(SKY, 0.35)}`,
                borderRadius: 3,
              }}
            />
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 16,
                left: 22,
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1,
                color: alpha(SKY, 0.95),
                letterSpacing: '-0.03em',
              }}
            >
              {count}
            </div>
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: 64,
                left: 22,
                fontSize: 11,
                fontWeight: 700,
                color: alpha(SKY, 0.8),
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Verified
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.15,
                color: alpha(TOKENS.foreground, 0.95),
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
              }}
            >
              {moment.label}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 14,
                color: alpha(TOKENS.foreground, 0.55),
                lineHeight: 1.4,
              }}
            >
              {moment.detail ??
                'Every match preserved on-chain. Your record outlasts the platform.'}
            </div>
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
          {formatCardDate(moment.createdAt)}
        </span>
      </div>
    </div>
  );
}
