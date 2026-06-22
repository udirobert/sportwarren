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
