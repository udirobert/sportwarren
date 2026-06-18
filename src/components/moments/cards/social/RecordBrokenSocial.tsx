/**
 * RecordBrokenSocial — 1080×1080 social-format adaptation of the
 * `record_broken` archetype.
 *
 * Mirrors the landscape `RecordBrokenCard` composition: oversized
 * destructive-red hero, shattered horizontal rule, detail line,
 * SPORTWARREN footer. Reflowed for the Instagram-post aspect ratio
 * with deeper padding, larger type, and a prominent wordmark.
 *
 * Used by `scripts/render-social.tsx` and the CARDS_SOCIAL registry.
 */

import React from 'react';
import {
  SOCIAL_WIDTH,
  SOCIAL_HEIGHT,
  SocialCardProps,
} from './types';
import { MomentTier } from '../types';
import {
  TOKENS,
  TIER_ORNAMENT,
  SURFACE_GRADIENT,
  alpha,
  formatCardDate,
} from '../tokens';
import { PitchTexture } from '../PitchTexture';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

export function RecordBrokenSocial({ moment }: SocialCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth * 1.5}px solid ${ornament.borderColor}`
      : 'none';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: SOCIAL_WIDTH,
        height: SOCIAL_HEIGHT,
        background: SURFACE_GRADIENT,
        padding: 72,
        fontFamily: FONT,
        color: TOKENS.foreground,
        border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <PitchTexture cardWidth={SOCIAL_WIDTH} cardHeight={SOCIAL_HEIGHT} opacity={0.04} />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 20% 30%, ${alpha(TOKENS.destructive, 0.22)} 0%, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />

      {showPulse && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            right: 56,
            width: 22,
            height: 22,
            borderRadius: 11,
            background: TOKENS.success,
            boxShadow: `0 0 32px 5px ${alpha(TOKENS.success, 0.6)}`,
            display: 'flex',
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div
          style={{
            display: 'flex',
            padding: '8px 18px',
            background: alpha(TOKENS.destructive, 0.18),
            border: `1px solid ${alpha(TOKENS.destructive, 0.45)}`,
            borderRadius: 999,
            alignSelf: 'flex-start',
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: alpha(TOKENS.foreground, 0.95),
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Record Broken
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 108,
            fontWeight: 700,
            lineHeight: 1.0,
            color: TOKENS.destructive,
            letterSpacing: '-0.035em',
            textTransform: 'uppercase',
            maxWidth: '100%',
          }}
        >
          {moment.label}
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 220, height: 5, background: TOKENS.destructive }} />
            <div style={{ display: 'flex', width: 80, height: 5, background: alpha(TOKENS.destructive, 0.5) }} />
            <div style={{ display: 'flex', width: 280, height: 5, background: TOKENS.destructive }} />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '8px 18px',
              background: alpha(TOKENS.foreground, 0.08),
              border: `1px solid ${alpha(TOKENS.foreground, 0.2)}`,
              borderRadius: 6,
            }}
          >
            <span style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.04em' }}>28</span>
            <span style={{ display: 'flex', fontSize: 16, fontWeight: 700, color: alpha(TOKENS.foreground, 0.55), letterSpacing: '0.18em' }}>GOALS</span>
          </div>
        </div>

        {moment.detail && (
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              color: alpha(TOKENS.foreground, 0.7),
              lineHeight: 1.45,
              maxWidth: '90%',
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
          alignItems: 'flex-end',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pipText && (
            <div
              style={{
                display: 'flex',
                padding: '4px 12px',
                borderRadius: 6,
                background: alpha(pipColor, 0.22),
                alignSelf: 'flex-start',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: alpha(TOKENS.foreground, 0.95),
                  letterSpacing: '0.12em',
                }}
              >
                {pipText}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <FootballMark size={26} color={TOKENS.destructive} />
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: alpha(TOKENS.foreground, 0.85),
                letterSpacing: '0.18em',
              }}
            >
              SPORTWARREN
            </span>
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: alpha(TOKENS.foreground, 0.4),
              letterSpacing: '0.06em',
              fontStyle: 'italic',
            }}
          >
            Every match leaves a mark
          </span>
        </div>
        <span
          style={{
            display: 'flex',
            fontSize: 18,
            fontWeight: 600,
            color: alpha(TOKENS.foreground, 0.5),
            letterSpacing: '0.08em',
          }}
        >
          {formatCardDate(moment.createdAt)}
        </span>
      </div>
    </div>
  );
}
