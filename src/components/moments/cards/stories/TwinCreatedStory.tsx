/**
 * TwinCreatedStory — 1080×1920 portrait adaptation of `twin_created`.
 * Subject's name as hero, violet constellation across the canvas.
 */

import React from 'react';
import { STORY_WIDTH, STORY_HEIGHT, StoryCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';
import { PitchTexture } from '../PitchTexture';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

const CONSTELLATION = [
  { x: 800, y: 200, size: 10, opacity: 0.7 },
  { x: 920, y: 380, size: 6, opacity: 0.45 },
  { x: 700, y: 1300, size: 8, opacity: 0.5 },
  { x: 60, y: 200, size: 8, opacity: 0.55 },
  { x: 180, y: 380, size: 5, opacity: 0.35 },
  { x: 120, y: 1380, size: 6, opacity: 0.4 },
  { x: 950, y: 1150, size: 5, opacity: 0.4 },
  { x: 80, y: 1180, size: 6, opacity: 0.4 },
  { x: 880, y: 1620, size: 5, opacity: 0.35 },
  { x: 220, y: 1660, size: 4, opacity: 0.3 },
];

export function TwinCreatedStory({ moment }: StoryCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder = 'borderColor' in ornament ? `${ornament.borderWidth * 2}px solid ${ornament.borderColor}` : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: STORY_WIDTH, height: STORY_HEIGHT, background: SURFACE_GRADIENT, padding: '120px 80px', fontFamily: FONT, color: TOKENS.foreground, border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder, justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <PitchTexture cardWidth={STORY_WIDTH} cardHeight={STORY_HEIGHT} opacity={0.04} />
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, ${alpha(TOKENS.identity, 0.26)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {CONSTELLATION.map((dot, i) => (
        <div key={i} style={{ display: 'flex', position: 'absolute', top: dot.y, left: dot.x, width: dot.size, height: dot.size, borderRadius: dot.size / 2, background: TOKENS.identity, opacity: dot.opacity }} />
      ))}
      {showPulse && (
        <div style={{ position: 'absolute', top: 80, right: 80, width: 28, height: 28, borderRadius: 14, background: TOKENS.success, boxShadow: `0 0 40px 6px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', padding: '10px 22px', background: alpha(TOKENS.identity, 0.22), border: `1px solid ${alpha(TOKENS.identity, 0.5)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em', textTransform: 'uppercase' }}>Twin Created</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', fontSize: 152, fontWeight: 700, lineHeight: 1, color: alpha(TOKENS.foreground, 0.98), letterSpacing: '-0.035em', textTransform: 'uppercase' }}>
          {moment.label}
        </div>
        {moment.detail && (
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 300, color: alpha(TOKENS.identity, 0.9), letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {moment.detail}
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 26, color: alpha(TOKENS.foreground, 0.6), lineHeight: 1.45, marginTop: 24 }}>
          Living record opened. Every match leaves a mark from here.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pipText && (
          <div style={{ display: 'flex', padding: '6px 14px', borderRadius: 8, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em' }}>{pipText}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <FootballMark size={32} color={TOKENS.identity} />
          <span style={{ fontSize: 38, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.45), letterSpacing: '0.06em' }}>sportwarren.com · {formatCardDate(moment.createdAt)}</span>
      </div>
    </div>
  );
}
