/**
 * AttestationMilestoneStory — 1080×1920 portrait adaptation of
 * `attestation_milestone`. Large rotated stamp, civic register.
 */

import React from 'react';
import { STORY_WIDTH, STORY_HEIGHT, StoryCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';
import { PitchTexture } from '../PitchTexture';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

function extractCount(label: string): string {
  const m = label.match(/(\d+)/);
  return m ? m[1] : '100';
}

export function AttestationMilestoneStory({ moment }: StoryCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder = 'borderColor' in ornament ? `${ornament.borderWidth * 2}px solid ${ornament.borderColor}` : 'none';
  const count = extractCount(moment.label);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: STORY_WIDTH, height: STORY_HEIGHT, background: SURFACE_GRADIENT, padding: '120px 80px', fontFamily: FONT, color: TOKENS.foreground, border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder, justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <PitchTexture cardWidth={STORY_WIDTH} cardHeight={STORY_HEIGHT} opacity={0.04} />
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, ${alpha(TOKENS.verified, 0.26)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 80, right: 80, width: 28, height: 28, borderRadius: 14, background: TOKENS.success, boxShadow: `0 0 40px 6px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', padding: '10px 22px', background: alpha(TOKENS.verified, 0.22), border: `1px solid ${alpha(TOKENS.verified, 0.5)}`, borderRadius: 999 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em', textTransform: 'uppercase' }}>Attestation Milestone</span>
      </div>

      <div style={{ display: 'flex', position: 'relative', width: 560, height: 400, background: alpha(TOKENS.verified, 0.10), border: `5px solid ${alpha(TOKENS.verified, 0.6)}`, borderRadius: 16, transform: 'rotate(-3deg)' }}>
        <div style={{ display: 'flex', position: 'absolute', top: 24, left: 24, width: 512, height: 352, border: `3px solid ${alpha(TOKENS.verified, 0.35)}`, borderRadius: 10 }} />
        <div style={{ display: 'flex', position: 'absolute', top: 60, left: 76, fontSize: 176, fontWeight: 700, lineHeight: 1, color: alpha(TOKENS.verified, 0.95), letterSpacing: '-0.03em' }}>
          {count}
        </div>
        <div style={{ display: 'flex', position: 'absolute', top: 260, left: 76, fontSize: 36, fontWeight: 700, color: alpha(TOKENS.verified, 0.8), letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Verified
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%' }}>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.1, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '-0.025em', textTransform: 'uppercase', textAlign: 'center' }}>
          {moment.label}
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: alpha(TOKENS.foreground, 0.6), lineHeight: 1.45, textAlign: 'center', maxWidth: '85%' }}>
          {moment.detail ?? 'Every match preserved on-chain. Your record outlasts the platform.'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {pipText && (
          <div style={{ display: 'flex', padding: '6px 14px', borderRadius: 8, background: alpha(pipColor, 0.22) }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em' }}>{pipText}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <FootballMark size={32} color={TOKENS.verified} />
          <span style={{ fontSize: 38, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.45), letterSpacing: '0.06em' }}>sportwarren.com · {formatCardDate(moment.createdAt)}</span>
      </div>
    </div>
  );
}
