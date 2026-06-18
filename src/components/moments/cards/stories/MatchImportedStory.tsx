/**
 * MatchImportedStory — 1080×1920 portrait adaptation of `match_imported`.
 * Date as hero, monochromatic register. Most-used kind in production.
 */

import React from 'react';
import { STORY_WIDTH, STORY_HEIGHT, StoryCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';

const FONT = 'Space Grotesk';

function parseResultPrefix(label: string): { result: 'W' | 'D' | 'L' | null; rest: string } {
  const m = label.match(/^([WDL])\s+(.*)$/);
  if (!m) return { result: null, rest: label };
  return { result: m[1] as 'W' | 'D' | 'L', rest: m[2] };
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

export function MatchImportedStory({ moment }: StoryCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder = 'borderColor' in ornament ? `${ornament.borderWidth * 2}px solid ${ornament.borderColor}` : 'none';
  const { result, rest } = parseResultPrefix(moment.label);
  const { day, year } = formatHeroDate(moment.createdAt);
  const accent = result ? RESULT_ACCENT[result] : alpha(TOKENS.foreground, 0.3);

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
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 30%, ${alpha(TOKENS.foreground, 0.10)} 0%, transparent 60%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 80, right: 80, width: 28, height: 28, borderRadius: 14, background: TOKENS.success, boxShadow: `0 0 40px 6px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
        <div style={{ display: 'flex', padding: '10px 22px', background: alpha(TOKENS.foreground, 0.10), border: `1px solid ${alpha(TOKENS.foreground, 0.18)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.14em', textTransform: 'uppercase' }}>Historical Match</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 360, fontWeight: 700, lineHeight: 0.92, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '-0.07em' }}>
            {day}
          </div>
          <div style={{ display: 'flex', fontSize: 112, fontWeight: 300, color: alpha(TOKENS.foreground, 0.4), letterSpacing: '0.16em' }}>
            {year}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {result && (
            <div style={{ display: 'flex', padding: '8px 18px', borderRadius: 8, background: alpha(accent, 0.22) }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em' }}>{result}</span>
            </div>
          )}
          <span style={{ display: 'flex', fontSize: 28, color: alpha(TOKENS.foreground, 0.75), lineHeight: 1.4 }}>
            {moment.detail ?? rest}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pipText && (
          <div style={{ display: 'flex', padding: '6px 14px', borderRadius: 8, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em' }}>{pipText}</span>
          </div>
        )}
        <span style={{ fontSize: 38, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.45), letterSpacing: '0.06em' }}>IMPORTED {formatCardDate(new Date())} · sportwarren.com</span>
      </div>
    </div>
  );
}
