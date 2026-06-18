/**
 * LevelUpCard — satori-rendered card for `level_up` moments.
 *
 * Bound to the Figma component `MomentCard / Level Up` in the
 * SportWarren — Moment Cards library (fileKey: xTaynEAGCjhhmcmQdPG0JZ,
 * nodeId: 11:86). Mapping recorded in
 * `src/components/moments/cards/code-connect.manifest.json`.
 *
 * Archetype: kinetic, ascending. Giant level numeral as the hero element,
 * xp-gold/amber palette, emerald chevron-stack motif suggesting growth.
 * See `.claude/skills/sw-moments/references/archetypes.md` (level_up).
 *
 * Figma URL:
 *   https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ?node-id=11-86
 */

import React from 'react';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  MomentCardProps,
  MomentTier,
} from './types';
import { TOKENS, TIER_ORNAMENT, SURFACE_GRADIENT, alpha, formatCardDate } from './tokens';
import { PitchTexture } from './PitchTexture';
import { FootballMark } from './FootballMark';

const FONT = 'Space Grotesk';

/**
 * Best-effort parse of the level number from the moment's structured
 * label. The TwinService emits labels like `"Level 13"` for level_up
 * events; the parser falls back to the raw label when the digit can't
 * be extracted (treats it as a feature, not an error — the card still
 * renders, just without the numeral-as-hero treatment).
 */
function extractLevel(label: string): { numeral: string; rest: string } {
  const match = label.match(/(\d{1,3})/);
  if (!match) return { numeral: label, rest: '' };
  const numeral = match[1];
  const rest = label.replace(match[0], '').trim();
  return { numeral, rest };
}

export function LevelUpCard({ moment }: MomentCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;

  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth}px solid ${ornament.borderColor}`
      : 'none';

  const { numeral } = extractLevel(moment.label);

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
      <PitchTexture cardWidth={CARD_WIDTH} cardHeight={CARD_HEIGHT} opacity={0.04} />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 20% 50%, ${alpha(TOKENS.xpGold, 0.16)} 0%, transparent 55%)`,
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
          Level Up
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Jersey-number frame around the numeral */}
        <div
          style={{
            display: 'flex',
            position: 'relative',
            padding: '0 24px 8px 24px',
            border: `2px solid ${alpha(TOKENS.xpGold, 0.4)}`,
            borderRadius: 6,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 220,
              fontWeight: 700,
              lineHeight: 1,
              color: TOKENS.xpGold,
              letterSpacing: '-0.08em',
            }}
          >
            {numeral}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 8,
            paddingTop: 8,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ display: 'flex', width: 36, height: 4, background: TOKENS.success }} />
            <div style={{ display: 'flex', width: 28, height: 4, background: alpha(TOKENS.success, 0.7) }} />
            <div style={{ display: 'flex', width: 20, height: 4, background: alpha(TOKENS.success, 0.4) }} />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: alpha(TOKENS.foreground, 0.55),
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Level
          </span>
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
          <FootballMark size={12} color={TOKENS.xpGold} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: alpha(TOKENS.foreground, 0.85),
              }}
            >
              {moment.detail ?? 'SportWarren'}
            </span>
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
