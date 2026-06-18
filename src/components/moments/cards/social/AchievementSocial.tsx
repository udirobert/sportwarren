/**
 * AchievementSocial — 1080×1080 social-format adaptation of
 * `achievement`. Centered crest, civic/formal composition.
 */

import React from 'react';
import { SOCIAL_WIDTH, SOCIAL_HEIGHT, SocialCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';
import { PitchTexture } from '../PitchTexture';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

export function AchievementSocial({ moment }: SocialCardProps) {
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
        alignItems: 'center',
        justifyContent: 'space-between',
        width: SOCIAL_WIDTH,
        height: SOCIAL_HEIGHT,
        background: SURFACE_GRADIENT,
        padding: 72,
        fontFamily: FONT,
        color: TOKENS.foreground,
        border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <PitchTexture cardWidth={SOCIAL_WIDTH} cardHeight={SOCIAL_HEIGHT} opacity={0.04} />
      {/* Corner-flag (upper-left): pole + pennant */}
      <div style={{ display: 'flex', position: 'absolute', top: 36, left: 36, width: 60, height: 64 }}>
        <svg width="60" height="64" viewBox="0 0 60 64" xmlns="http://www.w3.org/2000/svg">
          <line x1="10" y1="4" x2="10" y2="60" stroke={alpha(TOKENS.foreground, 0.55)} strokeWidth="2.5" />
          <polygon points="10,4 54,14 10,26" fill={alpha(TOKENS.success, 0.75)} stroke={alpha(TOKENS.success, 0.95)} strokeWidth="1.5" />
        </svg>
      </div>
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, ${alpha(TOKENS.success, 0.22)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 56, right: 56, width: 22, height: 22, borderRadius: 11, background: TOKENS.success, boxShadow: `0 0 32px 5px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', padding: '8px 18px', background: alpha(TOKENS.success, 0.22), border: `1px solid ${alpha(TOKENS.success, 0.45)}`, borderRadius: 999 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em', textTransform: 'uppercase' }}>Achievement</span>
      </div>

      <div style={{ display: 'flex', position: 'relative', width: 240, height: 240 }}>
        <div style={{ display: 'flex', position: 'absolute', inset: 0, borderRadius: 120, background: alpha(TOKENS.success, 0.18), border: `3px solid ${alpha(TOKENS.xpGold, 0.7)}` }} />
        <div style={{ display: 'flex', position: 'absolute', top: 48, left: 48, width: 144, height: 144, borderRadius: 72, background: alpha(TOKENS.success, 0.4), border: `2px solid ${alpha(TOKENS.xpGold, 0.4)}` }} />
        <div style={{ display: 'flex', position: 'absolute', top: 104, left: 104, width: 32, height: 32, borderRadius: 16, background: TOKENS.xpGold }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, lineHeight: 1.1, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '-0.025em', textTransform: 'uppercase', textAlign: 'center' }}>
          {moment.label}
        </div>
        {moment.detail && (
          <div style={{ display: 'flex', fontSize: 22, color: alpha(TOKENS.foreground, 0.6), lineHeight: 1.45, textAlign: 'center', maxWidth: '85%' }}>
            {moment.detail}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pipText && (
            <div style={{ display: 'flex', padding: '4px 12px', borderRadius: 6, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em' }}>{pipText}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <FootballMark size={26} color={TOKENS.success} />
            <span style={{ fontSize: 28, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
          </div>
        </div>
        <span style={{ display: 'flex', fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.5), letterSpacing: '0.08em' }}>
          {formatCardDate(moment.createdAt)}
        </span>
      </div>
    </div>
  );
}
