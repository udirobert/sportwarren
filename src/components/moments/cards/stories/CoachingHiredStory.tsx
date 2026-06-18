/**
 * CoachingHiredStory — 1080×1920 portrait adaptation of `coaching_hired`.
 * Welcoming, warm, large indigo portrait-light radial.
 */

import React from 'react';
import { STORY_WIDTH, STORY_HEIGHT, StoryCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';

const FONT = 'Space Grotesk';

export function CoachingHiredStory({ moment }: StoryCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder = 'borderColor' in ornament ? `${ornament.borderWidth * 2}px solid ${ornament.borderColor}` : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: STORY_WIDTH, height: STORY_HEIGHT, background: SURFACE_GRADIENT, padding: '120px 80px', fontFamily: FONT, color: TOKENS.foreground, border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder, justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', position: 'absolute', top: -200, right: -300, width: 960, height: 960, borderRadius: 480, background: `radial-gradient(circle, ${alpha(TOKENS.welcome, 0.34)} 0%, ${alpha(TOKENS.welcome, 0)} 70%)` }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 80, right: 80, width: 28, height: 28, borderRadius: 14, background: TOKENS.success, boxShadow: `0 0 40px 6px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
        <div style={{ display: 'flex', padding: '10px 22px', background: alpha(TOKENS.welcome, 0.22), border: `1px solid ${alpha(TOKENS.welcome, 0.5)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em', textTransform: 'uppercase' }}>Coaching Hired</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', fontSize: 140, fontWeight: 700, lineHeight: 0.75, color: alpha(TOKENS.welcome, 0.9) }}>
            “
          </div>
          <div style={{ display: 'flex', fontSize: 124, fontWeight: 700, lineHeight: 1.05, color: alpha(TOKENS.foreground, 0.98), letterSpacing: '-0.025em', textTransform: 'uppercase' }}>
            {moment.label}
          </div>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 300, color: alpha(TOKENS.welcome, 0.85), letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 16 }}>
            {moment.detail ?? 'YOUR NEW COACH'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {pipText && (
          <div style={{ display: 'flex', padding: '6px 14px', borderRadius: 8, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em' }}>{pipText}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: alpha(TOKENS.foreground, 0.4), letterSpacing: '0.10em' }}>STARTED</span>
          <span style={{ fontSize: 30, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.06em' }}>{formatCardDate(moment.createdAt)}</span>
        </div>
        <span style={{ fontSize: 38, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.45), letterSpacing: '0.06em' }}>sportwarren.com</span>
      </div>
    </div>
  );
}
