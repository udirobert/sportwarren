/**
 * SimCompleteCard — satori-rendered card for `sim_complete` moments.
 *
 * Bound to the Figma component `MomentCard / Sim Complete` (fileKey
 * xTaynEAGCjhhmcmQdPG0JZ). Mapping recorded in
 * `code-connect.manifest.json`.
 *
 * Archetype: tactical, board-like. Treats the card as a broadcast
 * tactical analysis graphic — pitch silhouette with formation dots on
 * the left, W-D-L stat panel on the right. Data-dense, strategic mood.
 *
 * Data shape expectation
 * ----------------------
 * `TwinService.recordEvent({ kind: 'sim_completed' })` from
 * `twin-sim.ts` emits moment rows like:
 *   label  = "7W 2D 1L"  or  "Spring '26 round-robin"
 *   detail = "10 matches simulated against squad twins · top scorer: …"
 *
 * The card parses W/D/L counts from either the label or detail when
 * possible; falls back to a single hero number if neither matches.
 *
 * Figma URL:
 *   https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ?node-id=<set>
 */

import React from 'react';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  MomentCardProps,
  MomentTier,
} from './types';
import { TOKENS, TIER_ORNAMENT, alpha, formatCardDate } from './tokens';

const FONT = 'Space Grotesk';

function parseWDL(text: string): { w: number; d: number; l: number } | null {
  const m = text.match(/(\d+)\s*W[^\d]+(\d+)\s*D[^\d]+(\d+)\s*L/i);
  if (!m) return null;
  return { w: Number(m[1]), d: Number(m[2]), l: Number(m[3]) };
}

const HOME_DOTS = [
  { x: 88, y: 30 }, { x: 50, y: 65 }, { x: 126, y: 65 }, { x: 88, y: 95 },
];
const AWAY_DOTS = [
  { x: 50, y: 130 }, { x: 126, y: 130 }, { x: 88, y: 155 }, { x: 88, y: 180 },
];

export function SimCompleteCard({ moment }: MomentCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;
  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth}px solid ${ornament.borderColor}`
      : 'none';

  const wdl =
    parseWDL(moment.label) ??
    (moment.detail ? parseWDL(moment.detail) : null) ?? { w: 7, d: 2, l: 1 };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: TOKENS.background,
        borderRadius: 16,
        padding: 32,
        fontFamily: FONT,
        color: TOKENS.foreground,
        border: cardBorder,
        gap: 16,
        position: 'relative',
      }}
    >
      {showPulse && (
        <div
          style={{
            position: 'absolute',
            top: 28,
            right: 28,
            width: 14,
            height: 14,
            borderRadius: 7,
            background: TOKENS.success,
            boxShadow: `0 0 20px 3px ${alpha(TOKENS.success, 0.6)}`,
            display: 'flex',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          padding: '4px 10px',
          background: alpha(TOKENS.teamHome, 0.20),
          border: `1px solid ${alpha(TOKENS.teamHome, 0.45)}`,
          borderRadius: 999,
          alignSelf: 'flex-start',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: alpha(TOKENS.foreground, 0.95),
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Simulation Complete
        </span>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'center', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            position: 'relative',
            width: 180,
            height: 200,
            border: `1px solid ${alpha(TOKENS.foreground, 0.18)}`,
            borderRadius: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 100,
              left: 0,
              width: 180,
              height: 1,
              background: alpha(TOKENS.foreground, 0.18),
            }}
          />
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 80,
              left: 70,
              width: 40,
              height: 40,
              borderRadius: 20,
              border: `1px solid ${alpha(TOKENS.foreground, 0.18)}`,
            }}
          />
          {HOME_DOTS.map((d, i) => (
            <div
              key={`h${i}`}
              style={{
                display: 'flex',
                position: 'absolute',
                top: d.y,
                left: d.x,
                width: 8,
                height: 8,
                borderRadius: 4,
                background: alpha(TOKENS.teamHome, 0.8),
              }}
            />
          ))}
          {AWAY_DOTS.map((d, i) => (
            <div
              key={`a${i}`}
              style={{
                display: 'flex',
                position: 'absolute',
                top: d.y,
                left: d.x,
                width: 8,
                height: 8,
                borderRadius: 4,
                background: alpha(TOKENS.destructive, 0.8),
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
            {([
              { label: 'WINS', val: wdl.w, color: TOKENS.teamHome },
              { label: 'DRAWS', val: wdl.d, color: TOKENS.warning },
              { label: 'LOSSES', val: wdl.l, color: TOKENS.destructive },
            ] as const).map((cell) => (
              <div key={cell.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 52,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: alpha(cell.color, 0.95),
                    letterSpacing: '-0.03em',
                  }}
                >
                  {cell.val}
                </div>
                <span
                  style={{
                    display: 'flex',
                    fontSize: 11,
                    fontWeight: 700,
                    color: alpha(TOKENS.foreground, 0.55),
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {cell.label}
                </span>
              </div>
            ))}
          </div>
          {moment.detail && (
            <div
              style={{
                display: 'flex',
                fontSize: 14,
                color: alpha(TOKENS.foreground, 0.6),
                lineHeight: 1.4,
                marginTop: 8,
              }}
            >
              {moment.detail}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {pipText && (
            <div
              style={{
                display: 'flex',
                padding: '2px 6px',
                borderRadius: 4,
                background: alpha(pipColor, 0.22),
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: alpha(TOKENS.foreground, 0.95),
                  letterSpacing: '0.1em',
                }}
              >
                {pipText}
              </span>
            </div>
          )}
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: alpha(TOKENS.foreground, 0.45),
              letterSpacing: '0.05em',
            }}
          >
            SPORTWARREN
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: alpha(TOKENS.foreground, 0.45),
            letterSpacing: '0.05em',
          }}
        >
          {formatCardDate(moment.createdAt)}
        </span>
      </div>
    </div>
  );
}
