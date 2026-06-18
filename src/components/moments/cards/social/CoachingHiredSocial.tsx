/**
 * CoachingHiredSocial — 1080×1080 social-format adaptation of
 * `coaching_hired`. Welcoming, warm, indigo portrait light.
 */

import React from 'react';
import { SOCIAL_WIDTH, SOCIAL_HEIGHT, SocialCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';

const FONT = 'Space Grotesk';

export function CoachingHiredSocial({ moment }: SocialCardProps) {
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
      <div style={{ display: 'flex', position: 'absolute', top: -160, right: -240, width: 720, height: 720, borderRadius: 360, background: `radial-gradient(circle, ${alpha(TOKENS.welcome, 0.28)} 0%, ${alpha(TOKENS.welcome, 0)} 70%)` }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 56, right: 56, width: 22, height: 22, borderRadius: 11, background: TOKENS.success, boxShadow: `0 0 32px 5px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div style={{ display: 'flex', padding: '8px 18px', background: alpha(TOKENS.welcome, 0.22), border: `1px solid ${alpha(TOKENS.welcome, 0.5)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em', textTransform: 'uppercase' }}>Coaching Hired</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, lineHeight: 0.75, color: alpha(TOKENS.welcome, 0.85) }}>
            “
          </div>
          <div style={{ display: 'flex', fontSize: 88, fontWeight: 700, lineHeight: 1.05, color: alpha(TOKENS.foreground, 0.98), letterSpacing: '-0.025em', textTransform: 'uppercase' }}>
            {moment.label}
          </div>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 300, color: alpha(TOKENS.welcome, 0.8), letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 8 }}>
            {moment.detail ?? 'YOUR NEW COACH'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.35), letterSpacing: '0.08em' }}>STARTED</span>
          <span style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.06em' }}>
            {formatCardDate(moment.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
