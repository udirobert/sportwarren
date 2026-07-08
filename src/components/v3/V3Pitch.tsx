/**
 * V3Pitch — compact static SVG pitch for the V3 Risograph register.
 *
 * Renders a football pitch with player positions based on a formation.
 * Pure SVG, no client JS, no dependencies. Coordinates sourced from
 * FORMATIONS in `@/lib/formations`.
 *
 * Intended for the clubhouse page where a full PitchCanvas is too heavy
 * (no drag-drop, no animated layovers, no export). Just the shape.
 */
import React from 'react';
import { FORMATIONS, type FormationPosition } from '@/lib/formations';
import type { Formation } from '@/types';
import { PALETTE, TYPE, TRACKING } from './tokens';

export interface V3PitchProps {
  /** Formation string e.g. "4-4-2", "1-2-1" */
  formation?: string;
  /** Optional player names mapped to formation slots (for initials). Length must match formation slots. */
  playerNames?: string[];
  /** Show role abbreviations instead of player initials. Default true when no playerNames. */
  showRoles?: boolean;
}

/**
 * Shorten a role string to 2-3 characters.
 */
function shortRole(role: string): string {
  const map: Record<string, string> = {
    GK: 'GK',
    CB: 'CB',
    LB: 'LB',
    RB: 'RB',
    LWB: 'LW',
    RWB: 'RW',
    CDM: 'DM',
    CM: 'CM',
    LM: 'LM',
    RM: 'RM',
    CAM: 'AM',
    LW: 'LW',
    RW: 'RW',
    ST: 'ST',
    CF: 'CF',
  };
  return map[role] ?? role.slice(0, 2);
}

/**
 * Group roles into lines by their y-coordinate (within a tolerance).
 * Returns an array of [lineLabel, positions] for display.
 */
function groupByLine(positions: FormationPosition[]): Array<{ label: string; positions: FormationPosition[] }> {
  const tolerance = 8; // y-pct tolerance for grouping
  const sorted = [...positions].sort((a, b) => b.y - a.y); // GK first (bottom)
  const lines: Array<{ label: string; y: number; positions: FormationPosition[] }> = [];

  for (const pos of sorted) {
    const existing = lines.find((l) => Math.abs(l.y - pos.y) <= tolerance);
    if (existing) {
      existing.positions.push(pos);
    } else {
      lines.push({ label: '', y: pos.y, positions: [pos] });
    }
  }

  // Assign human labels
  const lineLabels = ['GK', 'DEF', 'MID', 'FWD'];
  for (let i = 0; i < Math.min(lines.length, lineLabels.length); i++) {
    lines[i].label = lineLabels[i];
  }

  return lines;
}

export function V3Pitch({ formation, playerNames, showRoles = true }: V3PitchProps) {
  const key = (formation ?? '4-4-2') as Formation;
  const positions = FORMATIONS[key];
  if (!positions) {
    // Fallback to 4-4-2 if formation string doesn't match
    const fallback = FORMATIONS['4-4-2'];
    return <PitchSvg positions={fallback} playerNames={undefined} showRoles />;
  }
  return <PitchSvg positions={positions} playerNames={playerNames} showRoles={showRoles} />;
}

function PitchSvg({
  positions,
  playerNames,
  showRoles,
}: {
  positions: FormationPosition[];
  playerNames?: string[];
  showRoles: boolean;
}) {
  const outfield = positions.filter((p) => p.role !== 'GK');
  const viewerLabel = `${outfield.length}+1`;

  // Human-readable line labels
  const lines = groupByLine(positions);

  return (
    <div
      style={{
        background: PALETTE.cream,
        border: `1.5px solid ${PALETTE.ink}`,
        borderLeft: `5px solid ${PALETTE.navy}`,
        padding: '14px 16px',
      }}
    >
      {/* Header: formation badge + outfield count */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
          }}
        >
          Our shape
        </div>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
          }}
        >
          {viewerLabel} · {positions.length} total
        </div>
      </div>

      {/* Pitch container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '68/105',
          maxHeight: 180,
          marginBottom: 8,
        }}
      >
        {/* SVG pitch markings */}
        <svg
          viewBox="0 0 100 100"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          {/* Outline */}
          <rect x="1" y="1" width="98" height="98" fill="none" stroke={PALETTE.ink} strokeWidth="0.8" />
          {/* Centre line */}
          <line x1="1" y1="50" x2="99" y2="50" stroke={PALETTE.ink} strokeWidth="0.5" strokeDasharray="2,2" />
          {/* Centre circle */}
          <circle cx="50" cy="50" r="10" fill="none" stroke={PALETTE.ink} strokeWidth="0.5" />
          {/* Penalty areas */}
          <rect x="1" y="15" width="98" height="25" fill="none" stroke={PALETTE.ink} strokeWidth="0.5" opacity={0.6} />
          <rect x="1" y="60" width="98" height="25" fill="none" stroke={PALETTE.ink} strokeWidth="0.5" opacity={0.6} />
          {/* 6-yard boxes */}
          <rect x="1" y="28" width="98" height="9" fill="none" stroke={PALETTE.ink} strokeWidth="0.4" opacity={0.4} />
          <rect x="1" y="63" width="98" height="9" fill="none" stroke={PALETTE.ink} strokeWidth="0.4" opacity={0.4} />
        </svg>

        {/* Player dots */}
        {positions.map((pos, i) => {
          const isGK = pos.role === 'GK';
          const name = playerNames?.[i];
          const label = name
            ? name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
            : showRoles
            ? shortRole(pos.role)
            : '';
          const dotSize = isGK ? 20 : 18;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isGK ? 2 : 1,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: '50%',
                  background: isGK ? PALETTE.mustard : PALETTE.ink,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                <span
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: isGK ? 7 : 6,
                    fontWeight: 700,
                    color: isGK ? PALETTE.ink : PALETTE.cream,
                    lineHeight: 1,
                  }}
                >
                  {label}
                </span>
              </div>
              {/* Role hint below dot */}
              {isGK && (
                <span
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontFamily: TYPE.mono,
                    fontSize: 6,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: PALETTE.inkLight,
                    marginTop: 2,
                  }}
                >
                  GK
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Line labels (compact row) */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          fontFamily: TYPE.mono,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
        }}
      >
        {lines.map((line) => (
          <span key={line.label}>
            <span style={{ color: PALETTE.navy }}>{line.label}</span>
            {' '}
            {line.positions.map((p) => shortRole(p.role)).join(' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
