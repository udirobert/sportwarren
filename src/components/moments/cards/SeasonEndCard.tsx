/**
 * SeasonEndCard — satori-rendered card for `season_end` moments.
 *
 * Bound to the Figma component `MomentCard / Season End` in the
 * SportWarren — Moment Cards library (fileKey: xTaynEAGCjhhmcmQdPG0JZ,
 * nodeId: 15:102). Mapping recorded in
 * `src/components/moments/cards/code-connect.manifest.json`.
 *
 * Archetype: retrospective, trophied — poster format with longer body
 * text, xp-gold + emerald palette, metallic divider with star glyph.
 * See `.claude/skills/sw-moments/references/archetypes.md` (season_end).
 *
 * Figma URL:
 *   https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ?node-id=15-102
 *
 * Data shape expectation
 * ----------------------
 * `season.endSeason` emits moment rows like:
 *   label  = "Spring '26"  (season name)
 *   detail = "Brockenhurst Rovers \n
 *             14 played · 9 won · 3 drawn · 2 lost \n
 *             Top scorer: Marcus Tate — 28 goals \n
 *             Comeback of the season: 3-2 vs. Ballygally, Apr 12"
 *
 * The first detail line becomes the squad subtitle; remaining lines
 * become the stats summary. The second stats line is rendered with
 * `--success` accent because end-of-season top-scorer / win-streak is
 * the most-celebrated single fact on the card.
 */

import React from 'react';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  MomentCardProps,
  MomentTier,
} from './types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from './tokens';

const FONT = 'Space Grotesk';

function splitDetail(detail: string | null): { subtitle: string | null; stats: string[] } {
  if (!detail) return { subtitle: null, stats: [] };
  const lines = detail
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { subtitle: null, stats: [] };
  return { subtitle: lines[0], stats: lines.slice(1) };
}

export function SeasonEndCard({ moment }: MomentCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;

  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth}px solid ${ornament.borderColor}`
      : 'none';

  const { subtitle, stats } = splitDetail(moment.detail);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: SURFACE_GRADIENT,
        borderRadius: 16,
        padding: 32,
        fontFamily: FONT,
        color: TOKENS.foreground,
        border: cardBorder === 'none' ? `1px solid ${alpha(TOKENS.foreground, 0.06)}` : cardBorder,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 75% 25%, ${alpha(TOKENS.xpGold, 0.14)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            padding: '4px 10px',
            background: alpha(TOKENS.xpGold, 0.22),
            border: `1px solid ${alpha(TOKENS.xpGold, 0.45)}`,
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
            Season End
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.05,
              color: TOKENS.xpGold,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
            }}
          >
            {moment.label}
          </div>
          {subtitle && (
            <div
              style={{
                display: 'flex',
                fontSize: 18,
                fontWeight: 500,
                color: alpha(TOKENS.foreground, 0.7),
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', width: 4, height: 4, borderRadius: 2, background: TOKENS.xpGold }} />
          <div style={{ display: 'flex', width: 120, height: 1, background: alpha(TOKENS.xpGold, 0.7) }} />
          <div
            style={{
              display: 'flex',
              width: 8,
              height: 8,
              background: TOKENS.xpGold,
              transform: 'rotate(45deg)',
            }}
          />
          <div style={{ display: 'flex', width: 120, height: 1, background: alpha(TOKENS.xpGold, 0.7) }} />
          <div style={{ display: 'flex', width: 4, height: 4, borderRadius: 2, background: TOKENS.xpGold }} />
        </div>

        {stats.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {stats.map((line, i) => {
              const accent = i === 1; // second stat line gets the success accent
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    fontSize: 14,
                    color: accent ? TOKENS.success : alpha(TOKENS.foreground, 0.75),
                    lineHeight: 1.4,
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
        )}
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
