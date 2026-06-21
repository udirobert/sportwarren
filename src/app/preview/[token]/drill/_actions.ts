/**
 * Daily drill server action — preview-tier only.
 *
 * Mirrors the design of the sim-claim action: bypasses TwinService
 * (which fires Kite signing + moment generation + notifications) and
 * writes attribute deltas + XP directly to PlayerTwin.
 *
 * Once-per-UTC-day cap enforced via `lastDailyDrillAt`. The drill
 * itself is honor-system for v1 — "mark as done" doesn't verify
 * anyone actually ran sprint intervals. Post-Tuesday this is the
 * surface that gates Strava OAuth: the verified-third-party path
 * is what makes the drill grant move attributes.
 */

'use server';

import { prisma } from '@/lib/db';
import type { AttributeKey } from '@/server/services/personalization/twin-types';

type Attrs = Record<AttributeKey, number>;

export interface DrillClaimResult {
  ok: boolean;
  reason?: 'already_done' | 'no_twin' | 'not_preview';
  attribute?: AttributeKey;
  attributeDelta?: number;
  xpAwarded?: number;
  newXp?: number;
  newLevel?: number;
  after?: Attrs;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(99, n));
}

function isSameUTCDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export async function claimDailyDrill(input: {
  token: string;
  targetAttribute: AttributeKey;
}): Promise<DrillClaimResult> {
  const { token, targetAttribute } = input;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: { playerProfile: { include: { twin: true } } },
  });

  if (!user || user.chain !== 'preview') return { ok: false, reason: 'not_preview' };

  const profile = user.playerProfile;
  const twin = profile?.twin;
  if (!profile || !twin) return { ok: false, reason: 'no_twin' };

  const now = new Date();
  if (twin.lastDailyDrillAt && isSameUTCDay(twin.lastDailyDrillAt, now)) {
    return { ok: false, reason: 'already_done' };
  }

  const before = (twin.baseAttributes as Attrs | null) ?? {
    pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
  };

  const after: Attrs = { ...before, [targetAttribute]: clamp(before[targetAttribute] + 1) };
  const xpAwarded = 15 + Math.floor(twin.level / 5) * 2;
  const newXp = twin.xp + xpAwarded;
  // Level math: 100 XP per level, capped at 99 to match attribute scale convention.
  const newLevel = Math.min(99, Math.floor(newXp / 100) + 1);

  await prisma.playerTwin.update({
    where: { id: twin.id },
    data: {
      baseAttributes: after as object,
      xp: newXp,
      level: newLevel,
      lastDailyDrillAt: now,
    },
  });

  return {
    ok: true,
    attribute: targetAttribute,
    attributeDelta: after[targetAttribute] - before[targetAttribute],
    xpAwarded,
    newXp,
    newLevel,
    after,
  };
}
