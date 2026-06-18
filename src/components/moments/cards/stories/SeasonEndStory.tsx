/**
 * SeasonEndStory — 1080×1920 portrait adaptation of `season_end`.
 * Poster format, gold accent, multi-line stats summary.
 */

import React from 'react';
import { STORY_WIDTH, STORY_HEIGHT, StoryCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';

const FONT = 'Space Grotesk';

function splitDetail(detail: string | null): { subtitle: string | null; stats: string[] } {
  if (!detail) return { subtitle: null, stats: [] };
  const lines = detail.split('\n').map((l) => l.trim()).filter(Boolean);
  return { subtitle: lines[0] ?? null, stats: lines.slice(1) };
}

export function SeasonEndStory({ moment }: StoryCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder = 'borderColor' in ornament ? `${ornament.borderWidth * 2}px solid ${ornament.borderColor}` : 'none';
  const { subtitle, stats } = splitDetail(moment.detail);

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
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 70% 25%, ${alpha(TOKENS.xpGold, 0.26)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 80, right: 80, width: 28, height: 28, borderRadius: 14, background: TOKENS.success, boxShadow: `0 0 40px 6px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        <div style={{ display: 'flex', padding: '10px 22px', background: alpha(TOKENS.xpGold, 0.22), border: `1px solid ${alpha(TOKENS.xpGold, 0.5)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em', textTransform: 'uppercase' }}>Season End</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', fontSize: 168, fontWeight: 700, lineHeight: 0.96, color: TOKENS.xpGold, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
            {moment.label}
          </div>
          {subtitle && (
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 500, color: alpha(TOKENS.foreground, 0.7), letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 5, background: TOKENS.xpGold }} />
          <div style={{ display: 'flex', width: 280, height: 3, background: alpha(TOKENS.xpGold, 0.7) }} />
          <div style={{ display: 'flex', width: 18, height: 18, background: TOKENS.xpGold, transform: 'rotate(45deg)' }} />
          <div style={{ display: 'flex', width: 280, height: 3, background: alpha(TOKENS.xpGold, 0.7) }} />
          <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 5, background: TOKENS.xpGold }} />
        </div>
        {stats.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.map((line, i) => (
              <div key={i} style={{ display: 'flex', fontSize: 30, color: i === 1 ? TOKENS.success : alpha(TOKENS.foreground, 0.75), lineHeight: 1.45 }}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pipText && (
          <div style={{ display: 'flex', padding: '6px 14px', borderRadius: 8, background: alpha(pipColor, 0.22), alignSelf: 'flex-start' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em' }}>{pipText}</span>
          </div>
        )}
        <span style={{ fontSize: 38, fontWeight: 700, color: alpha(TOKENS.foreground, 0.85), letterSpacing: '0.18em' }}>SPORTWARREN</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: alpha(TOKENS.foreground, 0.45), letterSpacing: '0.06em' }}>sportwarren.com · {formatCardDate(moment.createdAt)}</span>
      </div>
    </div>
  );
}
