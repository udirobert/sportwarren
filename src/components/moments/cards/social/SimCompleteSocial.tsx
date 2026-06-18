/**
 * SimCompleteSocial — 1080×1080 social-format adaptation of `sim_complete`.
 * Tactical broadcast graphic: pitch motif + W-D-L stat panel.
 * Vertical stacking for the square aspect ratio.
 */

import React from 'react';
import { SOCIAL_WIDTH, SOCIAL_HEIGHT, SocialCardProps } from './types';
import { MomentTier } from '../types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from '../tokens';
import { FootballMark } from '../FootballMark';

const FONT = 'Space Grotesk';

function parseWDL(text: string): { w: number; d: number; l: number } | null {
  const m = text.match(/(\d+)\s*W[^\d]+(\d+)\s*D[^\d]+(\d+)\s*L/i);
  if (!m) return null;
  return { w: Number(m[1]), d: Number(m[2]), l: Number(m[3]) };
}

const HOME_DOTS = [{ x: 156, y: 36 }, { x: 90, y: 96 }, { x: 222, y: 96 }, { x: 156, y: 156 }];
const AWAY_DOTS = [{ x: 90, y: 216 }, { x: 222, y: 216 }, { x: 156, y: 256 }, { x: 156, y: 296 }];

export function SimCompleteSocial({ moment }: SocialCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth * 1.5}px solid ${ornament.borderColor}`
      : 'none';
  const wdl = parseWDL(moment.label) ?? (moment.detail ? parseWDL(moment.detail) : null) ?? { w: 7, d: 2, l: 1 };

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
        gap: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', position: 'absolute', inset: 0, background: `radial-gradient(circle at 25% 50%, ${alpha(TOKENS.teamHome, 0.18)} 0%, transparent 55%)`, pointerEvents: 'none' }} />
      {showPulse && (
        <div style={{ position: 'absolute', top: 56, right: 56, width: 22, height: 22, borderRadius: 11, background: TOKENS.success, boxShadow: `0 0 32px 5px ${alpha(TOKENS.success, 0.6)}`, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', padding: '8px 18px', background: alpha(TOKENS.teamHome, 0.22), border: `1px solid ${alpha(TOKENS.teamHome, 0.45)}`, borderRadius: 999, alignSelf: 'flex-start' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: alpha(TOKENS.foreground, 0.95), letterSpacing: '0.12em', textTransform: 'uppercase' }}>Simulation Complete</span>
      </div>

      <div style={{ display: 'flex', gap: 48, alignItems: 'center', flex: 1 }}>
        <div style={{ display: 'flex', position: 'relative', width: 312, height: 340, border: `2px solid ${alpha(TOKENS.foreground, 0.18)}`, borderRadius: 6 }}>
          <div style={{ display: 'flex', position: 'absolute', top: 170, left: 0, width: 312, height: 2, background: alpha(TOKENS.foreground, 0.18) }} />
          <div style={{ display: 'flex', position: 'absolute', top: 130, left: 116, width: 80, height: 80, borderRadius: 40, border: `2px solid ${alpha(TOKENS.foreground, 0.18)}` }} />
          {HOME_DOTS.map((d, i) => (
            <div key={`h${i}`} style={{ display: 'flex', position: 'absolute', top: d.y, left: d.x, width: 16, height: 16, borderRadius: 8, background: alpha(TOKENS.teamHome, 0.85) }} />
          ))}
          {AWAY_DOTS.map((d, i) => (
            <div key={`a${i}`} style={{ display: 'flex', position: 'absolute', top: d.y, left: d.x, width: 16, height: 16, borderRadius: 8, background: alpha(TOKENS.destructive, 0.85) }} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'baseline' }}>
            {([
              { label: 'WINS', val: wdl.w, color: TOKENS.teamHome },
              { label: 'DRAWS', val: wdl.d, color: TOKENS.warning },
              { label: 'LOSSES', val: wdl.l, color: TOKENS.destructive },
            ] as const).map((cell) => (
              <div key={cell.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, lineHeight: 1, color: alpha(cell.color, 0.95), letterSpacing: '-0.03em' }}>
                  {cell.val}
                </div>
                <span style={{ display: 'flex', fontSize: 16, fontWeight: 700, color: alpha(TOKENS.foreground, 0.55), letterSpacing: '0.16em', textTransform: 'uppercase' }}>{cell.label}</span>
              </div>
            ))}
          </div>
          {moment.detail && (
            <div style={{ display: 'flex', fontSize: 22, color: alpha(TOKENS.foreground, 0.6), lineHeight: 1.4, marginTop: 8 }}>
              {moment.detail}
            </div>
          )}
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
            <FootballMark size={26} color={TOKENS.teamHome} />
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
