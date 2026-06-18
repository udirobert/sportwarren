/**
 * AttestationMilestoneSocial — 1080×1080 social-format adaptation of
 * `attestation_milestone`. Civic stamp, official register, sky accent.
 */

import React from 'react';
import { SOCIAL_WIDTH, SOCIAL_HEIGHT, SocialCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';

const FONT = 'Space Grotesk';

function extractCount(label: string): string {
  const m = label.match(/(\d+)/);
  return m ? m[1] : '100';
}

export function AttestationMilestoneSocial({ moment }: SocialCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth * 1.5}px solid ${ornament.borderColor}`
      : 'none';
  const count = extractCount(moment.label);

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
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 40%, ${alpha(TOKENS.verified, 0.20)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 56, right: 56, width: 22, height: 22, borderRadius: 11, background: TOKENS.success, boxShadow: `0 0 32px 5px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div style={{ display: 'flex', padding: '8px 18px', background: alpha(TOKENS.verified, 0.22), border: `1px solid ${alpha(TOKENS.verified, 0.5)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em', textTransform: 'uppercase' }}>Attestation Milestone</span>
        </div>

        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <div style={{ display: 'flex', position: 'relative', width: 280, height: 200, background: alpha(TOKENS.verified, 0.1), border: `3px solid ${alpha(TOKENS.verified, 0.6)}`, borderRadius: 10, transform: 'rotate(-3deg)' }}>
            <div style={{ display: 'flex', position: 'absolute', top: 14, left: 14, width: 252, height: 172, border: `2px solid ${alpha(TOKENS.verified, 0.35)}`, borderRadius: 6 }} />
            <div style={{ display: 'flex', position: 'absolute', top: 32, left: 40, fontSize: 88, fontWeight: 700, lineHeight: 1, color: alpha(TOKENS.verified, 0.95), letterSpacing: '-0.03em' }}>
              {count}
            </div>
            <div style={{ display: 'flex', position: 'absolute', top: 132, left: 40, fontSize: 22, fontWeight: 700, color: alpha(TOKENS.verified, 0.8), letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Verified
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 700, lineHeight: 1.1, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              {moment.label}
            </div>
            <div style={{ display: 'flex', fontSize: 22, color: alpha(TOKENS.foreground, 0.55), lineHeight: 1.4 }}>
              {moment.detail ?? 'Every match preserved on-chain. Your record outlasts the platform.'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pipText && (
            <div style={{ display: 'flex', padding: '4px 12px', borderRadius: 6, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em' }}>{pipText}</span>
            </div>
          )}
          <span style={{ fontSize: 28, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
        </div>
        <span style={{ display: 'flex', fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.5), letterSpacing: '0.08em' }}>
          {formatCardDate(moment.createdAt)}
        </span>
      </div>
    </div>
  );
}
