/**
 * V3PlayerCard — the canonical chess.com card surface.
 *
 * Single source of truth for the player card pattern (Overall +
 * 6 attribute bars + level). Consumed by:
 *   - /preview/[token] (player's own card)
 *   - /player/[handle] (public profile)
 *   - /squad/[shortName] (members list — compact variant)
 *   - /session/[id]/analysis/[token] (post-session)
 *   - homepage hero (visual demo via the showcase variant)
 *
 * Three variants:
 *   - full    : prominent Overall + 6 bars + comparison vs group
 *   - compact : Overall + name, no bars (for roster lists)
 *   - showcase: full + animated, used on marketing surfaces
 *
 * The bars accept an optional `groupAvgByAttr` for the per-attribute
 * comparison tick. When omitted, just renders the value without the tick.
 *
 * V3 Risograph register throughout — Antonio for display numbers,
 * JetBrains Mono for data, cream + mustard + red + navy + sage palette.
 */

import React from 'react';
import { MiniAvatar, PALETTE } from '@/app/preview/_components/MiniAvatar';
import {
  ATTRIBUTE_KEYS,
  type AttributeKey,
} from '@/server/services/personalization/twin-types';
import { compareToGroup } from '@/server/services/personalization/position-baselines';

export type Attrs = Record<AttributeKey, number>;

export interface V3PlayerCardData {
  name: string;
  position: string | null;
  level: number;
  overall: number;
  attrs: Attrs;
  avatar?: {
    kit?: string;
    accent?: string;
    skin?: string;
    hair?: string;
    hairStyle?: string;
    number?: string;
  };
}

export interface V3PlayerCardProps {
  data: V3PlayerCardData;
  variant?: 'full' | 'compact' | 'showcase';
  groupAvgByAttr?: Partial<Record<AttributeKey, number>>;
  groupSize?: number;
}

const ATTR_META: Record<AttributeKey, { short: string; label: string; accent: 'red' | 'sage' | 'mustard' | 'navy'; movedBy: string }> = {
  pace:      { short: 'PAC', label: 'Pace',      accent: 'mustard', movedBy: 'Link Strava · run splits' },
  shooting:  { short: 'SHO', label: 'Shooting',  accent: 'red',     movedBy: 'Goals + peer ratings' },
  passing:   { short: 'PAS', label: 'Passing',   accent: 'navy',    movedBy: 'Match data + peer consensus' },
  dribbling: { short: 'DRI', label: 'Dribbling', accent: 'sage',    movedBy: 'Match data + peer ratings' },
  defending: { short: 'DEF', label: 'Defending', accent: 'navy',    movedBy: 'Tackles + peer ratings' },
  physical:  { short: 'PHY', label: 'Physical',  accent: 'red',     movedBy: 'Bleep test + Strava' },
};

export function V3PlayerCard({
  data,
  variant = 'full',
  groupAvgByAttr,
  groupSize,
}: V3PlayerCardProps) {
  if (variant === 'compact') {
    return <CompactCard data={data} />;
  }

  return (
    <div>
      {/* Overall badge — the chess.com single number */}
      <div
        style={{
          background: PALETTE.ink,
          color: PALETTE.cream,
          padding: '20px 22px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 18,
          borderLeft: `8px solid ${PALETTE.mustard}`,
        }}
      >
        {data.avatar && (
          <MiniAvatar
            kit={data.avatar.kit}
            accent={data.avatar.accent}
            skin={data.avatar.skin}
            hair={data.avatar.hair}
            hairStyle={data.avatar.hairStyle ?? 'short'}
            number={data.avatar.number ?? ''}
            size={64}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: PALETTE.mustard,
              marginBottom: 4,
            }}
          >
            {data.name} · {data.position ?? '—'} · L{data.level}
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: PALETTE.cream,
              opacity: 0.8,
            }}
          >
            Overall rating
          </div>
        </div>
        <div
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: '-0.03em',
            color: PALETTE.mustard,
          }}
        >
          {data.overall}
        </div>
      </div>

      {/* Six-bar attribute card */}
      {(groupAvgByAttr && groupSize !== undefined) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 12,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: PALETTE.navy }}>Card · {data.position ?? '—'}</span>
          <span style={{ color: PALETTE.inkLight, fontSize: 10 }}>
            vs {groupSize} lads in the group
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ATTRIBUTE_KEYS.map((key) => {
          const meta = ATTR_META[key];
          const accentColor = PALETTE[meta.accent];
          const value = data.attrs[key] ?? 50;
          const groupVals = groupAvgByAttr?.[key];
          const hasGroup = typeof groupVals === 'number';
          const verdict = hasGroup
            ? compareToGroup(value, [groupVals!]).verdict
            : null;
          const verdictColor =
            verdict === 'ahead' ? PALETTE.sage : verdict === 'behind' ? PALETTE.red : PALETTE.inkLight;
          const verdictCopy =
            !hasGroup
              ? null
              : verdict === 'ahead'
              ? `+${value - groupVals!} vs group`
              : verdict === 'behind'
              ? `${value - groupVals!} vs group`
              : `parity (${groupVals} group avg)`;

          return (
            <div
              key={key}
              style={{
                border: `1px solid ${PALETTE.ink}`,
                padding: '12px 14px 14px',
                background: PALETTE.cream,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Antonio, Impact, sans-serif',
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    color: accentColor,
                    minWidth: 48,
                  }}
                >
                  {meta.short}
                </span>
                <span
                  style={{
                    fontFamily: 'Antonio, Impact, sans-serif',
                    fontSize: 28,
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {value}
                </span>
                {verdictCopy && (
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: verdictColor,
                      marginLeft: 'auto',
                    }}
                  >
                    {verdictCopy}
                  </span>
                )}
              </div>

              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 6,
                  background: 'rgba(0,0,0,0.08)',
                  marginBottom: variant === 'showcase' ? 0 : 8,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.max(0, Math.min(99, value))}%`,
                    background: accentColor,
                  }}
                />
                {hasGroup && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -3,
                      left: `${Math.max(0, Math.min(99, groupVals!))}%`,
                      width: 2,
                      height: 12,
                      background: PALETTE.ink,
                      transform: 'translateX(-1px)',
                    }}
                  />
                )}
              </div>

              {variant !== 'showcase' && (
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: PALETTE.inkLight,
                  }}
                >
                  → {meta.movedBy}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompactCard({ data }: { data: V3PlayerCardData }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        border: `1px solid ${PALETTE.ink}`,
        background: PALETTE.cream,
      }}
    >
      {data.avatar && (
        <MiniAvatar
          kit={data.avatar.kit}
          accent={data.avatar.accent}
          skin={data.avatar.skin}
          hair={data.avatar.hair}
          hairStyle={data.avatar.hairStyle ?? 'short'}
          number={data.avatar.number ?? ''}
          size={40}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {data.name}
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
          }}
        >
          {data.position ?? '—'} · L{data.level}
        </div>
      </div>
      <div
        style={{
          fontFamily: 'Antonio, Impact, sans-serif',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: PALETTE.mustard,
          background: PALETTE.ink,
          padding: '4px 10px',
        }}
      >
        {data.overall}
      </div>
    </div>
  );
}

// Shared helper consumers can use to normalise twin row → card data.
export function buildPlayerCardData(input: {
  user: { name: string | null; position: string | null; avatarKitColor?: string | null; avatarAccentColor?: string | null; avatarSkinTone?: string | null; avatarHairColor?: string | null; avatarHairStyle?: string | null; avatarNumber?: string | null };
  attrs: Attrs;
  level: number;
  overall: number;
}): V3PlayerCardData {
  return {
    name: input.user.name ?? 'Player',
    position: input.user.position,
    level: input.level,
    overall: input.overall,
    attrs: input.attrs,
    avatar: {
      kit: input.user.avatarKitColor ?? undefined,
      accent: input.user.avatarAccentColor ?? undefined,
      skin: input.user.avatarSkinTone ?? undefined,
      hair: input.user.avatarHairColor ?? undefined,
      hairStyle: input.user.avatarHairStyle ?? 'short',
      number: input.user.avatarNumber ?? '',
    },
  };
}
