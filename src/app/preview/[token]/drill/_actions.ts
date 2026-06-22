/**
 * Daily drill server action — preview-tier.
 *
 * Routed through TwinService.recordEvent({ kind: 'daily_drill' }) with
 * skipMoment + skipNotification so the full event-sourced pipeline
 * applies the XP/level/attribute deltas without firing Kite signing
 * or moment rendering (neither is wanted for preview-tier twins).
 *
 * Once-per-UTC-day cap enforced via `lastDailyDrillAt` on PlayerTwin.
 * The drill itself is honor-system for v1 — "mark as done" doesn't
 * verify anyone actually ran sprint intervals. Strava OAuth is the
 * verified-third-party path that supplants honor-system in v2.
 */

'use server';

import { prisma } from '@/lib/db';
import { getPreviewUser } from '../../_lib/get-preview-user';
import { getTwinService } from '@/server/services/personalization/twin-service';
import type { AttributeKey } from '@/server/services/personalization/twin-types';

type Attrs = Record<AttributeKey, number>;

const DRILL_TYPES: Record<AttributeKey, string[]> = {
  pace: ['Sprint Intervals', 'Ladder Drills', 'Shuttle Runs'],
  shooting: ['Finishing Practice', 'Penalty Shootout', 'Volley Training'],
  passing: ['Passing Circuit', 'Long Ball Practice', 'One-Touch Drills'],
  dribbling: ['Cone Weave', 'Close Control', '1v1 Skills'],
  defending: ['Defensive Shape', 'Tackle Timing', 'Heading Practice'],
  physical: ['Strength Training', 'Endurance Run', 'Agility Course'],
};

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

  const user = await getPreviewUser(token, {
    include: { playerProfile: { include: { twin: true } } },
  });
  if (!user) return { ok: false, reason: 'not_preview' };

  const profile = user.playerProfile;
  const twin = profile?.twin;
  if (!profile || !twin) return { ok: false, reason: 'no_twin' };

  const now = new Date();
  if (twin.lastDailyDrillAt && isSameUTCDay(twin.lastDailyDrillAt, now)) {
    return { ok: false, reason: 'already_done' };
  }

  // XP curve: 15 base + 2 per 5 levels, matches the existing daily_drill
  // service so the in-app widget and preview drill behave identically.
  const xpAwarded = 15 + Math.floor(twin.level / 5) * 2;
  const drillType = DRILL_TYPES[targetAttribute][0]; // deterministic for this call

  // Route through TwinService — the daily_drill applier handles the
  // attribute clamp, XP add, level recompute, and lastDailyDrillAt
  // bookkeeping atomically.
  const twinService = getTwinService();
  const result = await twinService.recordEvent(
    {
      kind: 'daily_drill',
      twinId: twin.id,
      drill: {
        attribute: targetAttribute,
        xpAwarded,
        attributeDelta: 1,
        drillType,
      },
    },
    { skipMoment: true, skipNotification: true },
  );

  // Re-read for the UI's "this is now your card" surface.
  const updatedTwin = await prisma.playerTwin.findUnique({
    where: { id: twin.id },
    select: { baseAttributes: true, xp: true, level: true },
  });
  const after = (updatedTwin?.baseAttributes as Attrs | null) ?? undefined;

  return {
    ok: true,
    attribute: targetAttribute,
    attributeDelta: result.diff.attributeDeltas[targetAttribute] ?? 1,
    xpAwarded,
    newXp: updatedTwin?.xp ?? twin.xp + xpAwarded,
    newLevel: updatedTwin?.level ?? twin.level,
    after,
  };
}
