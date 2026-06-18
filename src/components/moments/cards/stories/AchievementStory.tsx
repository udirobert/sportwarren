/**
 * AchievementStory — 1080×1920 portrait adaptation of `achievement`.
 * Civic, badge-led, centered composition with large concentric crest.
 */

import React from 'react';
import { STORY_WIDTH, STORY_HEIGHT, StoryCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';

const FONT = 'Space Grotesk';

export function AchievementStory({ moment }: StoryCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder = 'borderColor' in ornament ? `${ornament.borderWidth * 2}px solid ${ornament.borderColor}` : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: STORY_WIDTH, height: STORY_HEIGHT, background: SURFACE_GRADIENT, padding: '120px 80px', fontFamily: FONT, color: TOKENS.foreground, border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, ${alpha(TOKENS.success, 0.28)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 80, right: 80, width: 28, height: 28, borderRadius: 14, background: TOKENS.success, boxShadow: `0 0 40px 6px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', padding: '10px 22px', background: alpha(TOKENS.success, 0.22), border: `1px solid ${alpha(TOKENS.success, 0.5)}`, borderRadius: 999 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em', textTransform: 'uppercase' }}>Achievement</span>
      </div>

      <div style={{ display: 'flex', position: 'relative', width: 360, height: 360 }}>
        <div style={{ display: 'flex', position: 'absolute', inset: 0, borderRadius: 180, background: alpha(TOKENS.success, 0.20), border: `4px solid ${alpha(TOKENS.xpGold, 0.7)}` }} />
        <div style={{ display: 'flex', position: 'absolute', top: 72, left: 72, width: 216, height: 216, borderRadius: 108, background: alpha(TOKENS.success, 0.4), border: `3px solid ${alpha(TOKENS.xpGold, 0.5)}` }} />
        <div style={{ display: 'flex', position: 'absolute', top: 156, left: 156, width: 48, height: 48, borderRadius: 24, background: TOKENS.xpGold }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%' }}>
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 700, lineHeight: 1.05, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '-0.03em', textTransform: 'uppercase', textAlign: 'center' }}>
          {moment.label}
        </div>
        {moment.detail && (
          <div style={{ display: 'flex', fontSize: 28, color: alpha(TOKENS.foreground, 0.65), lineHeight: 1.45, textAlign: 'center', maxWidth: '85%' }}>
            {moment.detail}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {pipText && (
          <div style={{ display: 'flex', padding: '6px 14px', borderRadius: 8, background: alpha(pipColor, 0.22) }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em' }}>{pipText}</span>
          </div>
        )}
        <span style={{ fontSize: 38, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.45), letterSpacing: '0.06em' }}>sportwarren.com · {formatCardDate(moment.createdAt)}</span>
      </div>
    </div>
  );
}
