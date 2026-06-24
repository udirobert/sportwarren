/**
 * Perception aggregation — single source of truth.
 *
 * Used by:
 *   - /preview/[token]/page.tsx (dashboard data fetch)
 *   - /api/og/card/[token]/route.tsx (share PNG render)
 *   - (future) /squad/[shortName]/doctrine (squad-wide aggregates)
 *
 * Returns a shape the UI can consume directly — no further transforms
 * needed downstream. If a new aggregation flavour is needed (per-position,
 * per-scenario across squad, etc.) add another exported function here
 * rather than re-rolling inline in a page handler.
 */

import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db';

export type ChoiceLetter = 'a' | 'b' | 'c' | 'd';

export interface ChoiceCounts {
  a: number;
  b: number;
  c: number;
  d: number;
  total: number;
}

export interface ScenarioAggregate {
  descriptive: ChoiceCounts;
  prescriptive: ChoiceCounts;
}

export type PerceptionAggregate = Record<string, ScenarioAggregate>;

/** Raw row shape returned when we want rater attribution (Tier 2 voices). */
export interface ReceivedVoice {
  scenarioId: string;
  choice: string;
  kind: string;
  raterId: string;
  raterPosition: string | null;
}

export interface AggregateResult {
  /** {scenarioId: {descriptive, prescriptive}} — bar chart data. */
  aggregate: PerceptionAggregate;
  /** Distinct raters who have weighed in on this player. */
  uniqueRaters: number;
  /** Total received rows (descriptive + prescriptive across all scenarios). */
  totalReceived: number;
  /** Per-row data for Tier 2 position-anonymized voices. */
  voices: ReceivedVoice[];
}

const emptyCounts = (): ChoiceCounts => ({ a: 0, b: 0, c: 0, d: 0, total: 0 });

/**
 * Aggregate all PlayerPerception rows where the given profile is the target.
 *
 * Always returns both the {scenario: {descriptive, prescriptive}} shape
 * AND the flat voices list — callers pay only the query cost once and
 * decide which shape they need per surface.
 */
export async function aggregateReceivedPerceptions(
  profileId: string,
  opts?: { prisma?: PrismaClient },
): Promise<AggregateResult> {
  const db = opts?.prisma ?? defaultPrisma;

  const rows = await db.playerPerception.findMany({
    where: { targetId: profileId },
    select: {
      scenarioId: true,
      choice: true,
      kind: true,
      raterId: true,
      rater: {
        select: {
          user: { select: { position: true } },
        },
      },
    },
  });

  const aggregate: PerceptionAggregate = {};
  const voices: ReceivedVoice[] = [];
  const raterIds = new Set<string>();

  for (const r of rows) {
    raterIds.add(r.raterId);

    if (!aggregate[r.scenarioId]) {
      aggregate[r.scenarioId] = { descriptive: emptyCounts(), prescriptive: emptyCounts() };
    }
    const bucket =
      r.kind === 'prescriptive'
        ? aggregate[r.scenarioId].prescriptive
        : aggregate[r.scenarioId].descriptive;
    const c = r.choice as ChoiceLetter;
    if (c === 'a' || c === 'b' || c === 'c' || c === 'd') {
      bucket[c] += 1;
      bucket.total += 1;
    }

    voices.push({
      scenarioId: r.scenarioId,
      choice: r.choice,
      kind: r.kind,
      raterId: r.raterId,
      raterPosition: r.rater?.user?.position ?? null,
    });
  }

  return {
    aggregate,
    uniqueRaters: raterIds.size,
    totalReceived: rows.length,
    voices,
  };
}

/** {position: {scenarioId: {descriptive, prescriptive}}} — the captain's view. */
export type SquadDoctrineAggregate = Record<string, PerceptionAggregate>;

export interface SquadDoctrineResult {
  /** Position → scenario → counts. "Unknown" bucket for players with no position. */
  byPosition: SquadDoctrineAggregate;
  /** Total perception rows considered (across the whole squad). */
  totalRows: number;
  /** Distinct raters who have contributed. */
  uniqueRaters: number;
  /** Distinct targets who have received at least one perception. */
  uniqueTargets: number;
}

/**
 * Aggregate every PlayerPerception row whose target is a member of the
 * given squad, grouped by the *target's* position. The captain reads
 * this to see "across all my CBs, what do the lads think they DO vs
 * SHOULD do" — the foundation of a tactical doctrine.
 *
 * Anonymized by design: no rater or target identities leak through the
 * return shape, only positional buckets and choice counts.
 */
export async function aggregateSquadDoctrine(
  squadId: string,
  opts?: { prisma?: PrismaClient },
): Promise<SquadDoctrineResult> {
  const db = opts?.prisma ?? defaultPrisma;

  const rows = await db.playerPerception.findMany({
    where: {
      target: { user: { squads: { some: { squadId } } } },
    },
    select: {
      scenarioId: true,
      choice: true,
      kind: true,
      raterId: true,
      targetId: true,
      target: {
        select: {
          user: { select: { position: true } },
        },
      },
    },
  });

  const byPosition: SquadDoctrineAggregate = {};
  const raterIds = new Set<string>();
  const targetIds = new Set<string>();

  for (const r of rows) {
    raterIds.add(r.raterId);
    targetIds.add(r.targetId);

    const position = r.target?.user?.position ?? 'Unknown';
    if (!byPosition[position]) byPosition[position] = {};
    if (!byPosition[position][r.scenarioId]) {
      byPosition[position][r.scenarioId] = {
        descriptive: emptyCounts(),
        prescriptive: emptyCounts(),
      };
    }
    const bucket =
      r.kind === 'prescriptive'
        ? byPosition[position][r.scenarioId].prescriptive
        : byPosition[position][r.scenarioId].descriptive;
    const c = r.choice as ChoiceLetter;
    if (c === 'a' || c === 'b' || c === 'c' || c === 'd') {
      bucket[c] += 1;
      bucket.total += 1;
    }
  }

  return {
    byPosition,
    totalRows: rows.length,
    uniqueRaters: raterIds.size,
    uniqueTargets: targetIds.size,
  };
}

/**
 * Aggregate perceptions for many target profiles in a single query.
 *
 * Used by the sim commentary generator — given a set of players in a
 * match, returns each player's per-scenario buckets so the narrative
 * can be coloured by "what the lads said about them."
 */
export async function aggregatePerceptionsForPlayers(
  profileIds: string[],
  opts?: { prisma?: PrismaClient },
): Promise<Map<string, PerceptionAggregate>> {
  const db = opts?.prisma ?? defaultPrisma;
  if (profileIds.length === 0) return new Map();

  const rows = await db.playerPerception.findMany({
    where: { targetId: { in: profileIds } },
    select: {
      targetId: true,
      scenarioId: true,
      choice: true,
      kind: true,
    },
  });

  const byTarget = new Map<string, PerceptionAggregate>();
  for (const r of rows) {
    let agg = byTarget.get(r.targetId);
    if (!agg) {
      agg = {};
      byTarget.set(r.targetId, agg);
    }
    if (!agg[r.scenarioId]) {
      agg[r.scenarioId] = { descriptive: emptyCounts(), prescriptive: emptyCounts() };
    }
    const bucket =
      r.kind === 'prescriptive'
        ? agg[r.scenarioId].prescriptive
        : agg[r.scenarioId].descriptive;
    const c = r.choice as ChoiceLetter;
    if (c === 'a' || c === 'b' || c === 'c' || c === 'd') {
      bucket[c] += 1;
      bucket.total += 1;
    }
  }

  return byTarget;
}

/**
 * Pick the modal choice for a ChoiceCounts bucket, or null if no data.
 * Used to find the "winning" option for headline generation.
 */
export function topChoice(counts: ChoiceCounts): ChoiceLetter | null {
  if (counts.total === 0) return null;
  const entries: Array<[ChoiceLetter, number]> = [
    ['a', counts.a],
    ['b', counts.b],
    ['c', counts.c],
    ['d', counts.d],
  ];
  let best: ChoiceLetter = 'a';
  let bestCount = -1;
  for (const [k, v] of entries) {
    if (v > bestCount) {
      bestCount = v;
      best = k;
    }
  }
  return best;
}

/**
 * Find the single strongest hot take from aggregated squad doctrine data.
 * Scores each (position, scenario) pair by consensus strength and returns
 * the winner, or null if there aren't enough data points (fewer than 2
 * total responses in any bucket).
 *
 * Used by the clubhouse leaderboard tiles, the broadcast flow, and future
 * surfaces that need to surface "what the lads agree on about each role."
 */
export function findSquadHotTake(
  byPosition: SquadDoctrineAggregate,
  scenarios: Array<{ id: string; options: Array<{ id: string; label: string }> }>,
): {
  position: string;
  scenarioId: string;
  choice: string;
  label: string;
  count: number;
  total: number;
} | null {
  let best: {
    position: string;
    scenarioId: string;
    choice: string;
    label: string;
    count: number;
    total: number;
  } | null = null;
  for (const [position, scenariosMap] of Object.entries(byPosition)) {
    for (const [scenarioId, buckets] of Object.entries(scenariosMap)) {
      const top = topChoice(buckets.descriptive);
      if (!top) continue;
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) continue;
      const opt = scenario.options.find((o) => o.id === top);
      if (!opt) continue;
      const count = buckets.descriptive[top];
      const total = buckets.descriptive.total;
      if (total < 2) continue;
      const score = total * (count / total);
      if (!best || score > best.count) {
        best = { position, scenarioId, choice: top, label: opt.label, count, total };
      }
    }
  }
  return best;
}
