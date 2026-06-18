/**
 * CoachingExpiredStory — 1080×1920 portrait adaptation of
 * `coaching_expired`. Quiet, valedictory, rose closing line.
 */

import React from 'react';
import { STORY_WIDTH, STORY_HEIGHT, StoryCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';
import { PitchTexture } from '../PitchTexture';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

export function CoachingExpiredStory({ moment }: StoryCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder = 'borderColor' in ornament ? `${ornament.borderWidth * 2}px solid ${ornament.borderColor}` : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: STORY_WIDTH, height: STORY_HEIGHT, background: SURFACE_GRADIENT, padding: '120px 80px', fontFamily: FONT, color: TOKENS.foreground, border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder, justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <PitchTexture cardWidth={STORY_WIDTH} cardHeight={STORY_HEIGHT} opacity={0.04} />
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 70% 65%, ${alpha(TOKENS.closing, 0.18)} 0%, transparent 60%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 80, right: 80, width: 28, height: 28, borderRadius: 14, background: TOKENS.success, boxShadow: `0 0 40px 6px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div style={{ display: 'flex', padding: '10px 22px', background: alpha(TOKENS.closing, 0.16), border: `1px solid ${alpha(TOKENS.closing, 0.4)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.14em', textTransform: 'uppercase' }}>Coaching Ended</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 500, lineHeight: 1.05, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '-0.015em' }}>
            {moment.label}
          </div>
          <div style={{ display: 'flex', width: 480, height: 2, background: alpha(TOKENS.closing, 0.55) }} />
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: alpha(TOKENS.foreground, 0.6), lineHeight: 1.45 }}>
          {moment.detail ?? 'Coaching engagement complete'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pipText && (
          <div style={{ display: 'flex', padding: '6px 14px', borderRadius: 8, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em' }}>{pipText}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <FootballMark size={32} color={TOKENS.closing} />
          <span style={{ fontSize: 38, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.45), letterSpacing: '0.06em' }}>ENDED {formatCardDate(moment.createdAt)} · sportwarren.com</span>
      </div>
    </div>
  );
}
