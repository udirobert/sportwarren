/**
 * SimCompleteStory — 1080×1920 portrait adaptation of `sim_complete`.
 * Tactical layout: pitch motif stacked above W-D-L stat panel.
 */

import React from 'react';
import { STORY_WIDTH, STORY_HEIGHT, StoryCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';

const FONT = 'Space Grotesk';

function parseWDL(text: string): { w: number; d: number; l: number } | null {
  const m = text.match(/(\d+)\s*W[^\d]+(\d+)\s*D[^\d]+(\d+)\s*L/i);
  if (!m) return null;
  return { w: Number(m[1]), d: Number(m[2]), l: Number(m[3]) };
}

const HOME_DOTS = [{ x: 232, y: 36 }, { x: 130, y: 130 }, { x: 334, y: 130 }, { x: 232, y: 224 }];
const AWAY_DOTS = [{ x: 130, y: 322 }, { x: 334, y: 322 }, { x: 232, y: 384 }, { x: 232, y: 444 }];

export function SimCompleteStory({ moment }: StoryCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder = 'borderColor' in ornament ? `${ornament.borderWidth * 2}px solid ${ornament.borderColor}` : 'none';
  const wdl = parseWDL(moment.label) ?? (moment.detail ? parseWDL(moment.detail) : null) ?? { w: 7, d: 2, l: 1 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: STORY_WIDTH, height: STORY_HEIGHT, background: SURFACE_GRADIENT, padding: '120px 80px', fontFamily: FONT, color: TOKENS.foreground, border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder, justifyContent: 'space-between', gap: 32, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 30%, ${alpha(TOKENS.teamHome, 0.20)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 80, right: 80, width: 28, height: 28, borderRadius: 14, background: TOKENS.success, boxShadow: `0 0 40px 6px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', padding: '10px 22px', background: alpha(TOKENS.teamHome, 0.22), border: `1px solid ${alpha(TOKENS.teamHome, 0.5)}`, borderRadius: 999 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.14em', textTransform: 'uppercase' }}>Simulation Complete</span>
      </div>

      <div style={{ display: 'flex', position: 'relative', width: 464, height: 508, border: `3px solid ${alpha(TOKENS.foreground, 0.18)}`, borderRadius: 8 }}>
        <div style={{ display: 'flex', position: 'absolute', top: 254, left: 0, width: 464, height: 2, background: alpha(TOKENS.foreground, 0.18) }} />
        <div style={{ display: 'flex', position: 'absolute', top: 194, left: 172, width: 120, height: 120, borderRadius: 60, border: `2px solid ${alpha(TOKENS.foreground, 0.18)}` }} />
        {HOME_DOTS.map((d, i) => (
          <div key={`h${i}`} style={{ display: 'flex', position: 'absolute', top: d.y, left: d.x, width: 24, height: 24, borderRadius: 12, background: alpha(TOKENS.teamHome, 0.85) }} />
        ))}
        {AWAY_DOTS.map((d, i) => (
          <div key={`a${i}`} style={{ display: 'flex', position: 'absolute', top: d.y, left: d.x, width: 24, height: 24, borderRadius: 12, background: alpha(TOKENS.destructive, 0.85) }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 48, alignItems: 'baseline' }}>
        {([
          { label: 'W', val: wdl.w, color: TOKENS.teamHome },
          { label: 'D', val: wdl.d, color: TOKENS.warning },
          { label: 'L', val: wdl.l, color: TOKENS.destructive },
        ] as const).map((cell) => (
          <div key={cell.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: 160, fontWeight: 700, lineHeight: 1, color: alpha(cell.color, 0.95), letterSpacing: '-0.03em' }}>
              {cell.val}
            </div>
            <span style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: alpha(TOKENS.foreground, 0.55), letterSpacing: '0.18em' }}>{cell.label}</span>
          </div>
        ))}
      </div>

      {moment.detail && (
        <div style={{ display: 'flex', fontSize: 26, color: alpha(TOKENS.foreground, 0.65), textAlign: 'center', maxWidth: '85%' }}>
          {moment.detail}
        </div>
      )}

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
