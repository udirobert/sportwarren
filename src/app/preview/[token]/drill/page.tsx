/**
 * Daily drill page — the chess.com puzzle equivalent.
 *
 *   /preview/<token>/drill
 *
 * Server fetches the player's twin, picks the attribute most in need
 * (weighted toward the lowest), and renders one drill targeting it.
 * The player taps "Mark as done" to claim the +1 attribute + XP via
 * the server action. Once per UTC day per twin.
 *
 * Honor system for v1 — there's no mechanism that verifies they
 * actually ran the sprint intervals. Post-Tuesday this is the surface
 * that gates Strava OAuth: linking the activity feed turns the drill
 * grant into verified third-party proof.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PALETTE } from '../../_components/MiniAvatar';
import { ATTRIBUTE_KEYS, type AttributeKey } from '@/server/services/personalization/twin-types';
import { DrillClient } from './DrillClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

type Attrs = Record<AttributeKey, number>;

const DRILL_TYPES: Record<AttributeKey, string[]> = {
  pace: ['Sprint Intervals · 6×40m', 'Ladder Drills · 10 min', 'Shuttle Runs · 12×20m'],
  shooting: ['Finishing Practice · 25 shots', 'Penalty Sequence · 10 reps', 'Volley Set · 20 reps'],
  passing: ['One-Touch Circuit · 15 min', 'Long Ball Targets · 30 balls', 'Wall Passing · 5 min/foot'],
  dribbling: ['Cone Weave · 4 sets', 'Close Control · 10 min', '1v1 Skills · 8 reps'],
  defending: ['Defensive Shape · 15 min', 'Tackle Timing · 12 reps', 'Heading Practice · 20 reps'],
  physical: ['Strength Circuit · 4 rounds', 'Endurance Run · 5km', 'Agility Course · 6 reps'],
};

function pickTargetAttribute(attrs: Attrs, seed: number): AttributeKey {
  const values = ATTRIBUTE_KEYS.map((k) => ({ key: k, value: attrs[k] ?? 50 }));
  values.sort((a, b) => a.value - b.value);
  // Weighted toward the bottom — index 0 (weakest) gets the highest weight.
  const weights = values.map((_, i) => Math.max(1, values.length - i));
  const total = weights.reduce((s, w) => s + w, 0);
  // Deterministic per-day via the seed
  let r = (seed % 10000) / 10000 * total;
  for (let i = 0; i < values.length; i++) {
    r -= weights[i];
    if (r <= 0) return values[i].key;
  }
  return values[0].key;
}

function pickDrillType(attr: AttributeKey, seed: number): string {
  const options = DRILL_TYPES[attr];
  return options[seed % options.length];
}

const ATTR_LABEL: Record<AttributeKey, { short: string; label: string }> = {
  pace: { short: 'PAC', label: 'Pace' },
  shooting: { short: 'SHO', label: 'Shooting' },
  passing: { short: 'PAS', label: 'Passing' },
  dribbling: { short: 'DRI', label: 'Dribbling' },
  defending: { short: 'DEF', label: 'Defending' },
  physical: { short: 'PHY', label: 'Physical' },
};

export default async function DrillPage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: { playerProfile: { include: { twin: true } } },
  });

  if (!user || user.chain !== 'preview') notFound();

  const twin = user.playerProfile?.twin;
  if (!twin) notFound();

  const attrs = (twin.baseAttributes as Attrs | null) ?? {
    pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
  };

  // Daily seed — same drill all day for the player. Deterministic per
  // (twinId, UTC-date) so reloads don't re-pick.
  const now = new Date();
  const utcDay = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  const seedStr = `${twin.id}-${utcDay}`;
  const seed = seedStr.split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 0);

  const targetAttribute = pickTargetAttribute(attrs, seed);
  const drillType = pickDrillType(targetAttribute, seed);
  const attrMeta = ATTR_LABEL[targetAttribute];

  const alreadyDoneToday = twin.lastDailyDrillAt &&
    twin.lastDailyDrillAt.getUTCFullYear() === now.getUTCFullYear() &&
    twin.lastDailyDrillAt.getUTCMonth() === now.getUTCMonth() &&
    twin.lastDailyDrillAt.getUTCDate() === now.getUTCDate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Ribbon */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div style={{ width: 28, height: 4, background: PALETTE.red }} />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 14,
          }}
        >
          Daily drill · {now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </div>

        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 0.95,
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          Your weakest attribute<br />asked for work.
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            color: PALETTE.inkLight,
            lineHeight: 1.55,
            marginTop: 16,
            marginBottom: 32,
            maxWidth: 480,
          }}
        >
          Today's drill targets <strong>{attrMeta.label}</strong> — your
          twin's lowest stat at <strong>{attrs[targetAttribute]}</strong>.
          Do it for real, tap done. <em>One drill per day.</em>
        </p>

        {/* The drill card */}
        <div
          style={{
            background: PALETTE.ink,
            color: PALETTE.cream,
            padding: 28,
            marginBottom: 24,
            borderLeft: `8px solid ${PALETTE.mustard}`,
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: PALETTE.mustard,
              marginBottom: 10,
            }}
          >
            Target · {attrMeta.short} {attrs[targetAttribute]} → {Math.min(99, attrs[targetAttribute] + 1)}
          </div>
          <div
            style={{
              fontFamily: 'Antonio, Impact, sans-serif',
              fontSize: 40,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
            }}
          >
            {drillType}
          </div>
        </div>

        <DrillClient
          token={token}
          targetAttribute={targetAttribute}
          alreadyDone={!!alreadyDoneToday}
        />

        <Link
          href={`/preview/${encodeURIComponent(token)}`}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block',
            marginTop: 32,
          }}
        >
          ← Back to your twin
        </Link>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            marginTop: 40,
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          Honor system — for now. Future: link Strava and the drill auto-claims
          when the activity hits your feed.
        </p>
      </div>
    </div>
  );
}
