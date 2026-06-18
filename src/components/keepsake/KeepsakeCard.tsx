/**
 * KeepsakeCard — satori-rendered match-result card.
 *
 * Surface separate from the moment-card library (the input shape is
 * match-specific: home/away teams + scores + MOTM, not a Moment row).
 * Shares the design system tokens and font, so a player sharing a
 * keepsake and a player sharing a moment card see consistent brand
 * language.
 */

import React from 'react';
import { TOKENS, alpha } from '../moments/cards/tokens';

export const KEEPSAKE_WIDTH = 600;
export const KEEPSAKE_HEIGHT = 400;

export interface KeepsakeProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  motmName?: string;
  motmConsensus?: string;
}

const FONT = 'Space Grotesk';

function resolveResult(home: number, away: number) {
  if (home > away) {
    return { label: 'VICTORY', accent: TOKENS.success };
  }
  if (home < away) {
    return { label: 'DEFEAT', accent: TOKENS.destructive };
  }
  return { label: 'DRAW', accent: TOKENS.warning };
}

export function KeepsakeCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  date,
  motmName,
  motmConsensus,
}: KeepsakeProps) {
  const { label: resultLabel, accent } = resolveResult(homeScore, awayScore);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: KEEPSAKE_WIDTH,
        height: KEEPSAKE_HEIGHT,
        background: TOKENS.background,
        borderRadius: 16,
        padding: 32,
        fontFamily: FONT,
        color: TOKENS.foreground,
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: '4px 10px',
            background: alpha(accent, 0.18),
            border: `1px solid ${alpha(accent, 0.45)}`,
            borderRadius: 999,
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
            {resultLabel}
          </span>
        </div>
        <span
          style={{
            display: 'flex',
            fontSize: 12,
            fontWeight: 600,
            color: alpha(TOKENS.foreground, 0.45),
            letterSpacing: '0.05em',
          }}
        >
          {date}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1,
              color: TOKENS.foreground,
              letterSpacing: '-0.04em',
            }}
          >
            {homeScore}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              fontWeight: 700,
              color: alpha(TOKENS.foreground, 0.35),
            }}
          >
            —
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1,
              color: TOKENS.foreground,
              letterSpacing: '-0.04em',
            }}
          >
            {awayScore}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              display: 'flex',
              fontSize: 14,
              fontWeight: 700,
              color: alpha(TOKENS.foreground, 0.85),
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {homeTeam}
          </span>
          <div
            style={{
              display: 'flex',
              width: 4,
              height: 4,
              borderRadius: 2,
              background: alpha(TOKENS.foreground, 0.3),
            }}
          />
          <span
            style={{
              display: 'flex',
              fontSize: 14,
              fontWeight: 700,
              color: alpha(TOKENS.foreground, 0.85),
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {awayTeam}
          </span>
        </div>
      </div>

      {motmName ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              display: 'flex',
              fontSize: 10,
              fontWeight: 700,
              color: accent,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Man of the Match
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              style={{
                display: 'flex',
                fontSize: 18,
                fontWeight: 700,
                color: alpha(TOKENS.foreground, 0.95),
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {motmName}
            </span>
            {motmConsensus ? (
              <span
                style={{
                  display: 'flex',
                  fontSize: 11,
                  fontWeight: 600,
                  color: alpha(TOKENS.foreground, 0.45),
                  letterSpacing: '0.05em',
                }}
              >
                {motmConsensus} consensus
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex' }} />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 16,
          borderTop: `1px solid ${TOKENS.border}`,
        }}
      >
        <span
          style={{
            display: 'flex',
            fontSize: 11,
            fontWeight: 700,
            color: alpha(TOKENS.foreground, 0.45),
            letterSpacing: '0.2em',
          }}
        >
          SPORTWARREN
        </span>
        <span
          style={{
            display: 'flex',
            fontSize: 11,
            fontWeight: 500,
            color: alpha(TOKENS.foreground, 0.35),
            fontStyle: 'italic',
          }}
        >
          Every match leaves a mark
        </span>
      </div>
    </div>
  );
}
