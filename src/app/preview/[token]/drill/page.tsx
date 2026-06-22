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
import { getPreviewUser } from '../../_lib/get-preview-user';
import Link from 'next/link';
import {
  PALETTE,
  TYPE,
  TRACKING,
  V3PageShell,
  V3Ribbon,
  V3IdentityLine,
  V3Heading,
} from '@/components/v3';
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

/**
 * Pick the drill target attribute. Weighted by:
 *  - Your own gap below the squad average for each attribute
 *    (creates squad-level momentum — the whole group works on the
 *    same weakness, so the squad's collective Overall climbs together)
 *  - Your absolute floor (player-level weakness)
 * Falls back to pure player-weakest if no squad context is available.
 */
function pickTargetAttribute(
  attrs: Attrs,
  seed: number,
  squadAvgByAttr?: Partial<Record<AttributeKey, number>>,
): AttributeKey {
  const values = ATTRIBUTE_KEYS.map((k) => {
    const my = attrs[k] ?? 50;
    const squadAvg = squadAvgByAttr?.[k];
    // Gap below squad avg (positive when you're behind the group)
    const gapBelow = squadAvg !== undefined ? Math.max(0, squadAvg - my) : 0;
    // Absolute weakness component (lower attrs get higher weight)
    const floor = 99 - my;
    // Combine: squad gap weighted slightly more than absolute floor
    // so collective weaknesses become collective drills.
    return { key: k, score: gapBelow * 1.5 + floor };
  });
  values.sort((a, b) => b.score - a.score);
  // Weighted draw toward the top (index 0 = most-needed)
  const weights = values.map((_, i) => Math.max(1, values.length - i));
  const total = weights.reduce((s, w) => s + w, 0);
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

  const user = await getPreviewUser(token, {
    include: {
      playerProfile: { include: { twin: true } },
      squads: { select: { squadId: true } },
    },
  });

  if (!user) notFound();

  const twin = user.playerProfile?.twin;
  if (!twin) notFound();

  const attrs = (twin.baseAttributes as Attrs | null) ?? {
    pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
  };

  // Squad-wide attribute averages — used to bias drill picking toward
  // the squad's collective weakness, not just the player's. This is
  // how the daily drill becomes a co-protagonist mechanic: when the
  // whole group is weak in PAS, everyone gets passing drills.
  const squadId = user.squads[0]?.squadId;
  const squadTwins = squadId
    ? await prisma.playerTwin.findMany({
        where: { profile: { user: { squads: { some: { squadId } } } } },
        select: { profileId: true, baseAttributes: true },
      })
    : [];
  const squadAvgByAttr: Partial<Record<AttributeKey, number>> = {};
  for (const k of ATTRIBUTE_KEYS) {
    const vals = squadTwins
      .map((t) => (t.baseAttributes as Attrs | null)?.[k])
      .filter((v): v is number => typeof v === 'number');
    if (vals.length > 0) {
      squadAvgByAttr[k] = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
    }
  }

  // Daily seed — same drill all day for the player. Deterministic per
  // (twinId, UTC-date) so reloads don't re-pick.
  const now = new Date();
  const utcDay = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  const seedStr = `${twin.id}-${utcDay}`;
  const seed = seedStr.split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 0);

  const targetAttribute = pickTargetAttribute(attrs, seed, squadAvgByAttr);
  const drillType = pickDrillType(targetAttribute, seed);
  const attrMeta = ATTR_LABEL[targetAttribute];

  // Squad gap commentary — surface when the picked attribute is one
  // the whole squad lags on, not just this player. This is the
  // co-protagonist mechanic made visible.
  const squadAvgForTarget = squadAvgByAttr[targetAttribute];
  const myValueForTarget = attrs[targetAttribute];
  const squadGap = squadAvgForTarget !== undefined
    ? Math.round(squadAvgForTarget - myValueForTarget)
    : null;
  const squadWideWeak = squadAvgForTarget !== undefined && squadAvgForTarget < 50;

  const alreadyDoneToday = twin.lastDailyDrillAt &&
    twin.lastDailyDrillAt.getUTCFullYear() === now.getUTCFullYear() &&
    twin.lastDailyDrillAt.getUTCMonth() === now.getUTCMonth() &&
    twin.lastDailyDrillAt.getUTCDate() === now.getUTCDate();

  return (
    <V3PageShell>
      <V3Ribbon />
      <V3IdentityLine
        context={`Daily drill · ${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`}
        showDot={false}
        marginBottom={14}
      />

      <V3Heading size="large">
        Your weakest attribute<br />asked for work.
      </V3Heading>

      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 13,
          color: PALETTE.inkLight,
          lineHeight: 1.55,
          marginTop: 16,
          marginBottom: 20,
          maxWidth: 480,
        }}
      >
        Today&apos;s drill targets <strong>{attrMeta.label}</strong> — your
        card at <strong>{attrs[targetAttribute]}</strong>.
        Do it for real, tap done. <em>One drill per day.</em>
      </p>

      {squadWideWeak && squadGap !== null && squadGap >= 0 && (
        <div
          style={{
            background: 'rgba(212,164,55,0.12)',
            border: `1px solid ${PALETTE.mustard}`,
            padding: '12px 14px',
            marginBottom: 24,
            fontFamily: TYPE.mono,
            fontSize: 11,
            lineHeight: 1.55,
            color: PALETTE.ink,
          }}
        >
          <strong>Squad-wide weakness.</strong> The whole group averages{' '}
          <strong>{squadAvgForTarget}</strong> in {attrMeta.label.toLowerCase()}.
          Everyone working on the same thing — that&apos;s how the squad climbs together.
        </div>
      )}

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
            fontFamily: TYPE.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: TRACKING.capWide,
            textTransform: 'uppercase',
            color: PALETTE.mustard,
            marginBottom: 10,
          }}
        >
          Target · {attrMeta.short} {attrs[targetAttribute]} → {Math.min(99, attrs[targetAttribute] + 1)}
        </div>
        <div
          style={{
            fontFamily: TYPE.display,
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
          fontFamily: TYPE.mono,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: TRACKING.cap,
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
          fontFamily: TYPE.mono,
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
    </V3PageShell>
  );
}
