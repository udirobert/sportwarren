/**
 * MatchImportedSocial — 1080×1080 social-format adaptation of
 * `match_imported`. Date as hero, monochromatic register.
 */

import React from 'react';
import { SOCIAL_WIDTH, SOCIAL_HEIGHT, SocialCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';
import { PitchTexture } from '../PitchTexture';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

function parseResultPrefix(label: string): { result: 'W' | 'D' | 'L' | null; rest: string } {
  const match = label.match(/^([WDL])\s+(.*)$/);
  if (!match) return { result: null, rest: label };
  return { result: match[1] as 'W' | 'D' | 'L', rest: match[2] };
}

function formatHeroDate(d: Date): { day: string; year: string } {
  return {
    day: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase(),
    year: d.getFullYear().toString(),
  };
}

const RESULT_ACCENT: Record<'W' | 'D' | 'L', string> = {
  W: TOKENS.success,
  D: TOKENS.warning,
  L: TOKENS.destructive,
};

export function MatchImportedSocial({ moment }: SocialCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth * 1.5}px solid ${ornament.borderColor}`
      : 'none';
  const { result, rest } = parseResultPrefix(moment.label);
  const { day, year } = formatHeroDate(moment.createdAt);
  const accent = result ? RESULT_ACCENT[result] : alpha(TOKENS.foreground, 0.3);

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
      <PitchTexture cardWidth={SOCIAL_WIDTH} cardHeight={SOCIAL_HEIGHT} opacity={0.05} />
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 35%, ${alpha(TOKENS.foreground, 0.08)} 0%, transparent 60%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 56, right: 56, width: 22, height: 22, borderRadius: 11, background: TOKENS.success, boxShadow: `0 0 32px 5px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div style={{ display: 'flex', padding: '8px 18px', background: alpha(TOKENS.foreground, 0.10), border: `1px solid ${alpha(TOKENS.foreground, 0.18)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.12em', textTransform: 'uppercase' }}>Historical Match</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 200, fontWeight: 700, lineHeight: 0.92, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '-0.06em' }}>
            {day}
          </div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 300, color: alpha(TOKENS.foreground, 0.4), letterSpacing: '0.14em' }}>
            {year}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {result && (
            <div style={{ display: 'flex', padding: '6px 14px', borderRadius: 6, background: alpha(accent, 0.22) }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em' }}>{result}</span>
            </div>
          )}
          <span style={{ display: 'flex', fontSize: 24, color: alpha(TOKENS.foreground, 0.75), lineHeight: 1.4 }}>
            {moment.detail ?? rest}
          </span>
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
            <FootballMark size={26} color={TOKENS.foreground} ringOpacity={0.55} />
            <span style={{ fontSize: 28, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, color: alpha(TOKENS.foreground, 0.4), letterSpacing: '0.06em', fontStyle: 'italic' }}>Every match leaves a mark</span>
        </div>
        <span style={{ display: 'flex', fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.5), letterSpacing: '0.08em' }}>
          IMPORTED {formatCardDate(new Date())}
        </span>
      </div>
    </div>
  );
}
