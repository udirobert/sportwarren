/**
 * LevelUpStory — 1080×1920 portrait adaptation of `level_up`.
 * Giant numeral as hero, chevron stack motif, xp-gold + emerald palette.
 */

import React from 'react';
import { STORY_WIDTH, STORY_HEIGHT, StoryCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';

const FONT = 'Space Grotesk';

function extractLevel(label: string): { numeral: string } {
  const m = label.match(/(\d{1,3})/);
  return { numeral: m ? m[1] : label };
}

export function LevelUpStory({ moment }: StoryCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder = 'borderColor' in ornament ? `${ornament.borderWidth * 2}px solid ${ornament.borderColor}` : 'none';
  const { numeral } = extractLevel(moment.label);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        background: SURFACE_GRADIENT,
        padding: '120px 80px',
        fontFamily: FONT,
        color: TOKENS.foreground,
        border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder,
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, ${alpha(TOKENS.xpGold, 0.30)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 80, right: 80, width: 28, height: 28, borderRadius: 14, background: TOKENS.success, boxShadow: `0 0 40px 6px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', padding: '10px 22px', background: alpha(TOKENS.xpGold, 0.22), border: `1px solid ${alpha(TOKENS.xpGold, 0.5)}`, borderRadius: 999 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em', textTransform: 'uppercase' }}>Level Up</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', fontSize: 560, fontWeight: 700, lineHeight: 1, color: TOKENS.xpGold, letterSpacing: '-0.08em' }}>
          {numeral}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', width: 80, height: 10, background: TOKENS.success }} />
          <span style={{ fontSize: 26, fontWeight: 700, color: alpha(TOKENS.foreground, 0.75), letterSpacing: '0.20em', textTransform: 'uppercase' }}>Level</span>
          <div style={{ display: 'flex', width: 80, height: 10, background: TOKENS.success }} />
        </div>
        {moment.detail && (
          <div style={{ display: 'flex', fontSize: 28, color: alpha(TOKENS.foreground, 0.7), letterSpacing: '0.04em', marginTop: 16 }}>
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
