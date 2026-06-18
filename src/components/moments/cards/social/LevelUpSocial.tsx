/**
 * LevelUpSocial — 1080×1080 social-format adaptation of `level_up`.
 * Giant numeral as hero, chevron stack motif, xp-gold + emerald palette.
 */

import React from 'react';
import { SOCIAL_WIDTH, SOCIAL_HEIGHT, SocialCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';
import { PitchTexture } from '../PitchTexture';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

function extractLevel(label: string): { numeral: string } {
  const match = label.match(/(\d{1,3})/);
  return { numeral: match ? match[1] : label };
}

export function LevelUpSocial({ moment }: SocialCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth * 1.5}px solid ${ornament.borderColor}`
      : 'none';
  const { numeral } = extractLevel(moment.label);

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
      <PitchTexture cardWidth={SOCIAL_WIDTH} cardHeight={SOCIAL_HEIGHT} opacity={0.04} />
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 25% 50%, ${alpha(TOKENS.xpGold, 0.22)} 0%, transparent 60%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 56, right: 56, width: 22, height: 22, borderRadius: 11, background: TOKENS.success, boxShadow: `0 0 32px 5px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', padding: '8px 18px', background: alpha(TOKENS.xpGold, 0.22), border: `1px solid ${alpha(TOKENS.xpGold, 0.45)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em', textTransform: 'uppercase' }}>Level Up</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 40 }}>
        <div
          style={{
            display: 'flex',
            padding: '0 36px 16px 36px',
            border: `4px solid ${alpha(TOKENS.xpGold, 0.4)}`,
            borderRadius: 12,
          }}
        >
          <div style={{ display: 'flex', fontSize: 380, fontWeight: 700, lineHeight: 1, color: TOKENS.xpGold, letterSpacing: '-0.08em' }}>
            {numeral}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, paddingTop: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ display: 'flex', width: 72, height: 8, background: TOKENS.success }} />
            <div style={{ display: 'flex', width: 56, height: 8, background: alpha(TOKENS.success, 0.7) }} />
            <div style={{ display: 'flex', width: 40, height: 8, background: alpha(TOKENS.success, 0.4) }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: alpha(TOKENS.foreground, 0.55), letterSpacing: '0.18em', textTransform: 'uppercase' }}>Level</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pipText && (
            <div style={{ display: 'flex', padding: '4px 12px', borderRadius: 6, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em' }}>{pipText}</span>
            </div>
          )}
          <span style={{ fontSize: 24, fontWeight: 600, color: alpha(TOKENS.foreground, 0.85) }}>
            {moment.detail ?? 'SportWarren'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <FootballMark size={26} color={TOKENS.xpGold} />
            <span style={{ fontSize: 28, fontWeight: 700, color: alpha(TOKENS.foreground, 0.5), letterSpacing: '0.18em' }}>SPORTWARREN</span>
          </div>
        </div>
        <span style={{ display: 'flex', fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.5), letterSpacing: '0.08em' }}>
          {formatCardDate(moment.createdAt)}
        </span>
      </div>
    </div>
  );
}
