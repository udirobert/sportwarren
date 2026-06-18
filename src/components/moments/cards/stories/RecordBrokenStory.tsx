/**
 * RecordBrokenStory — 1080×1920 portrait adaptation of `record_broken`.
 * Top-to-bottom flow: kicker, oversized hero, broken rule, detail,
 * SPORTWARREN footer + CTA at the bottom.
 */

import React from 'react';
import { STORY_WIDTH, STORY_HEIGHT, StoryCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';
import { PitchTexture } from '../PitchTexture';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

export function RecordBrokenStory({ moment }: StoryCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder = 'borderColor' in ornament ? `${ornament.borderWidth * 2}px solid ${ornament.borderColor}` : 'none';

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <PitchTexture cardWidth={STORY_WIDTH} cardHeight={STORY_HEIGHT} opacity={0.04} />
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 30%, ${alpha(TOKENS.destructive, 0.25)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 80, right: 80, width: 28, height: 28, borderRadius: 14, background: TOKENS.success, boxShadow: `0 0 40px 6px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div style={{ display: 'flex', padding: '10px 22px', background: alpha(TOKENS.destructive, 0.20), border: `1px solid ${alpha(TOKENS.destructive, 0.5)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em', textTransform: 'uppercase' }}>Record Broken</span>
        </div>
        <div style={{ display: 'flex', fontSize: 160, fontWeight: 700, lineHeight: 0.95, color: TOKENS.destructive, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
          {moment.label}
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 240, height: 6, background: TOKENS.destructive }} />
            <div style={{ display: 'flex', width: 90, height: 6, background: alpha(TOKENS.destructive, 0.5) }} />
            <div style={{ display: 'flex', width: 320, height: 6, background: TOKENS.destructive }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '10px 22px', background: alpha(TOKENS.foreground, 0.08), border: `1px solid ${alpha(TOKENS.foreground, 0.2)}`, borderRadius: 8 }}>
            <span style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.04em' }}>28</span>
            <span style={{ display: 'flex', fontSize: 20, fontWeight: 700, color: alpha(TOKENS.foreground, 0.55), letterSpacing: '0.18em' }}>GOALS</span>
          </div>
        </div>
        {moment.detail && (
          <div style={{ display: 'flex', fontSize: 30, color: alpha(TOKENS.foreground, 0.75), lineHeight: 1.45, maxWidth: '92%' }}>
            {moment.detail}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pipText && (
          <div style={{ display: 'flex', padding: '6px 14px', borderRadius: 8, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em' }}>{pipText}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <FootballMark size={32} color={TOKENS.destructive} />
          <span style={{ fontSize: 38, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 500, color: alpha(TOKENS.foreground, 0.4), letterSpacing: '0.06em', fontStyle: 'italic' }}>Every match leaves a mark — sportwarren.com</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.45), letterSpacing: '0.08em' }}>{formatCardDate(moment.createdAt)}</span>
      </div>
    </div>
  );
}
