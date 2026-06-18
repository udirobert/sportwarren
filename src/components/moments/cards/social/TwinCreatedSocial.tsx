/**
 * TwinCreatedSocial — 1080×1080 social-format adaptation of
 * `twin_created`. Subject name as hero, violet constellation motif.
 */

import React from 'react';
import { SOCIAL_WIDTH, SOCIAL_HEIGHT, SocialCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';
import { PitchTexture } from '../PitchTexture';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

// More constellation dots, wider spread, larger sizes for the 1080×1080 canvas
const CONSTELLATION: Array<{ x: number; y: number; size: number; opacity: number }> = [
  { x: 700, y: 120, size: 7, opacity: 0.6 },
  { x: 820, y: 200, size: 4, opacity: 0.35 },
  { x: 940, y: 140, size: 9, opacity: 0.7 },
  { x: 880, y: 320, size: 5, opacity: 0.5 },
  { x: 980, y: 400, size: 4, opacity: 0.4 },
  { x: 760, y: 440, size: 7, opacity: 0.55 },
  { x: 650, y: 360, size: 4, opacity: 0.3 },
  { x: 90, y: 120, size: 5, opacity: 0.45 },
  { x: 160, y: 200, size: 4, opacity: 0.3 },
  { x: 60, y: 280, size: 3, opacity: 0.35 },
  { x: 900, y: 540, size: 5, opacity: 0.35 },
  { x: 240, y: 500, size: 4, opacity: 0.3 },
];

export function TwinCreatedSocial({ moment }: SocialCardProps) {
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
      <PitchTexture cardWidth={SOCIAL_WIDTH} cardHeight={SOCIAL_HEIGHT} opacity={0.04} />
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 70% 50%, ${alpha(TOKENS.identity, 0.20)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {CONSTELLATION.map((dot, i) => (
        <div key={i} style={{ display: 'flex', position: 'absolute', top: dot.y, left: dot.x, width: dot.size, height: dot.size, borderRadius: dot.size / 2, background: TOKENS.identity, opacity: dot.opacity }} />
      ))}
      {showPulse && (
        <div style={{ position: 'absolute', top: 56, right: 56, width: 22, height: 22, borderRadius: 11, background: TOKENS.success, boxShadow: `0 0 32px 5px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', padding: '8px 18px', background: alpha(TOKENS.identity, 0.22), border: `1px solid ${alpha(TOKENS.identity, 0.5)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em', textTransform: 'uppercase' }}>Twin Created</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', fontSize: 112, fontWeight: 700, lineHeight: 1, color: alpha(TOKENS.foreground, 0.98), letterSpacing: '-0.035em', textTransform: 'uppercase' }}>
          {moment.label}
        </div>
        {moment.detail && (
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 300, color: alpha(TOKENS.identity, 0.9), letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {moment.detail}
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 22, color: alpha(TOKENS.foreground, 0.55), lineHeight: 1.4, marginTop: 16 }}>
          Living record opened. Every match leaves a mark from here.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pipText && (
            <div style={{ display: 'flex', padding: '4px 12px', borderRadius: 6, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em' }}>{pipText}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <FootballMark size={26} color={TOKENS.identity} />
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
