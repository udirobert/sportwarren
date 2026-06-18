/**
 * MatchImportedCard — satori-rendered card for `match_imported` moments.
 *
 * Bound to the Figma component `MomentCard / Match Imported`
 * (fileKey: xTaynEAGCjhhmcmQdPG0JZ, nodeId: 21:78). Mapping recorded
 * in `code-connect.manifest.json`.
 *
 * Archetype: archival, monochromatic, calendar-led. Date as the dominant
 * visual element. Most-used kind in production — every historical match
 * imported via the squad-import flow produces one. The composition reads
 * as a journal entry, not a poster.
 *
 * Figma URL:
 *   https://www.figma.com/design/xTaynEAGCjhhmcmQdPG0JZ?node-id=21-78
 *
 * Data shape expectation
 * ----------------------
 * `commitMatchHistoryImport` emits moment rows like:
 *   kind   = 'match_imported'
 *   label  = "W 3-2 vs Ballygally United"  (W/D/L prefix + score + opponent)
 *   detail = "Brockenhurst Rovers 3 — 2 Ballygally United"  (optional)
 *   createdAt = match date
 *
 * The card parses the W/L/D prefix from the label, the date from
 * `createdAt`, and renders the date numerically as the hero.
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

function parseResultPrefix(label: string): { result: 'W' | 'D' | 'L' | null; rest: string } {
  const match = label.match(/^([WDL])\s+(.*)$/);
  if (!match) return { result: null, rest: label };
  return { result: match[1] as 'W' | 'D' | 'L', rest: match[2] };
}

function formatHeroDate(d: Date): { day: string; year: string } {
  const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
  const year = d.getFullYear().toString();
  return { day, year };
}

const RESULT_ACCENT: Record<'W' | 'D' | 'L', string> = {
  W: TOKENS.success,
  D: TOKENS.warning,
  L: TOKENS.destructive,
};

export function MatchImportedCard({ moment }: MomentCardProps) {
  const tier = (moment.tier as MomentTier) ?? 'standard';
  const ornament = TIER_ORNAMENT[tier] ?? {};
  const showPulse = tier === 'streak_reward';
  const pipText = 'pipText' in ornament ? ornament.pipText : undefined;
  const pipColor = 'pipColor' in ornament ? ornament.pipColor : TOKENS.foreground;

  const cardBorder =
    'borderColor' in ornament
      ? `${ornament.borderWidth}px solid ${ornament.borderColor}`
      : 'none';

  const { result, rest } = parseResultPrefix(moment.label);
  const { day, year } = formatHeroDate(moment.createdAt);
  const accent = result ? RESULT_ACCENT[result] : alpha(TOKENS.foreground, 0.3);

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
          background: `radial-gradient(circle at 50% 35%, ${alpha(TOKENS.foreground, 0.06)} 0%, transparent 60%)`,
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            padding: '4px 10px',
            background: alpha(TOKENS.foreground, 0.10),
            border: `1px solid ${alpha(TOKENS.foreground, 0.18)}`,
            borderRadius: 999,
            alignSelf: 'flex-start',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: alpha(TOKENS.foreground, 0.85),
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Historical Match
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 0.95,
              color: alpha(TOKENS.foreground, 0.95),
              letterSpacing: '-0.05em',
            }}
          >
            {day}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              fontWeight: 300,
              color: alpha(TOKENS.foreground, 0.4),
              letterSpacing: '0.12em',
            }}
          >
            {year}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {result && (
            <div
              style={{
                display: 'flex',
                padding: '3px 8px',
                borderRadius: 4,
                background: alpha(accent, 0.22),
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: alpha(TOKENS.foreground, 0.95),
                  letterSpacing: '0.1em',
                }}
              >
                {result}
              </span>
            </div>
          )}
          <span
            style={{
              display: 'flex',
              fontSize: 14,
              color: alpha(TOKENS.foreground, 0.75),
              lineHeight: 1.4,
            }}
          >
            {moment.detail ?? rest}
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
          IMPORTED {formatCardDate(new Date())}
        </span>
      </div>
    </div>
  );
}
