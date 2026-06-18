/**
 * SeasonEndSocial — 1080×1080 social-format adaptation of `season_end`.
 * Poster composition with metallic divider, gold + emerald palette.
 */

import React from 'react';
import { SOCIAL_WIDTH, SOCIAL_HEIGHT, SocialCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';
import { PitchTexture } from '../PitchTexture';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

function splitDetail(detail: string | null): { subtitle: string | null; stats: string[] } {
  if (!detail) return { subtitle: null, stats: [] };
  const lines = detail.split('\n').map((l) => l.trim()).filter(Boolean);
  return { subtitle: lines[0] ?? null, stats: lines.slice(1) };
}

export function SeasonEndSocial({ moment }: SocialCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth * 1.5}px solid ${ornament.borderColor}`
      : 'none';
  const { subtitle, stats } = splitDetail(moment.detail);

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
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 75% 25%, ${alpha(TOKENS.xpGold, 0.20)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 56, right: 56, width: 22, height: 22, borderRadius: 11, background: TOKENS.success, boxShadow: `0 0 32px 5px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', padding: '8px 18px', background: alpha(TOKENS.xpGold, 0.22), border: `1px solid ${alpha(TOKENS.xpGold, 0.45)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em', textTransform: 'uppercase' }}>Season End</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', fontSize: 108, fontWeight: 700, lineHeight: 1.0, color: TOKENS.xpGold, letterSpacing: '-0.035em', textTransform: 'uppercase' }}>
            {moment.label}
          </div>
          {subtitle && (
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 500, color: alpha(TOKENS.foreground, 0.7), letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 4, background: TOKENS.xpGold }} />
          <div style={{ display: 'flex', width: 220, height: 2, background: alpha(TOKENS.xpGold, 0.7) }} />
          <div style={{ display: 'flex', width: 14, height: 14, background: TOKENS.xpGold, transform: 'rotate(45deg)' }} />
          <div style={{ display: 'flex', width: 220, height: 2, background: alpha(TOKENS.xpGold, 0.7) }} />
          <div style={{ display: 'flex', width: 8, height: 8, borderRadius: 4, background: TOKENS.xpGold }} />
        </div>
        {stats.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.map((line, i) => (
              <div key={i} style={{ display: 'flex', fontSize: 24, color: i === 1 ? TOKENS.success : alpha(TOKENS.foreground, 0.75), lineHeight: 1.4 }}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pipText && (
            <div style={{ display: 'flex', padding: '4px 12px', borderRadius: 6, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em' }}>{pipText}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <FootballMark size={26} color={TOKENS.xpGold} />
            <span style={{ fontSize: 28, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, color: alpha(TOKENS.foreground, 0.4), letterSpacing: '0.06em', fontStyle: 'italic' }}>Every match leaves a mark</span>
        </div>
        <span style={{ display: 'flex', fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.5), letterSpacing: '0.08em' }}>
          {formatCardDate(moment.createdAt)}
        </span>
      </div>
    </div>
  );
}
