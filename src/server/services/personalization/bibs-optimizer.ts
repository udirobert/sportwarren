/**
 * Bibs Optimizer — kickabout team-allocation algorithm.
 *
 * Primary B wedge: given tonight's confirmed signups + the format the
 * captain picked (5v5, 6v6, 7v7, 8v8), suggest two balanced teams
 * with a recommended role per player.
 *
 * Why this exists: the captain's eyeball balance ("right, you and you
 * vs me and them") is reliable for a 4-person friendly but loses to
 * twin attributes once a group has memory. By session 4 the system
 * knows which CB has been carrying defensively, which winger's pace
 * has dropped — the captain can lean on that signal instead of vibes.
 *
 * Algorithm:
 *   1. Compute Overall per confirmed player (via computeOverall).
 *   2. Snake-draft into two teams (1→Red, 2→Blue, 3→Blue, 4→Red, …).
 *      This is the canonical fairness shape for balanced drafts.
 *   3. Within each team, suggest a role per player based on their
 *      attribute profile + stated position (DEF/MID/FWD/GK).
 *   4. Compute aggregate Overall per team + a verdict tag ("tightest"
 *      / "close" / "lopsided") for the captain to interpret.
 *
 * What this is NOT (yet):
 *   - Position-slotted formation (no "4-3-3" — kickabout is fluid)
 *   - Historical co-play awareness ("avoid Pete + Tom on same team
 *     because they always lose together")
 *   - Winner-stays-on rotation suggestions
 *   - Bench prioritisation
 *
 * Those join in v2; for Tuesday this is the snake-draft minimum.
 */

import type { PrismaClient } from '@prisma/client';
import type { AttributeKey } from './twin-types';
import { computeOverall } from './position-baselines';

export type SuggestedRole = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface BibsPlayer {
  profileId: string;
  userId: string;
  name: string;
  position: string | null;
  attrs: Record<AttributeKey, number>;
  level: number;
  overall: number;
  suggestedRole: SuggestedRole;
}

export interface BibsTeam {
  name: 'Reds' | 'Blues';
  players: BibsPlayer[];
  aggregateOverall: number;
  byRole: Record<SuggestedRole, BibsPlayer[]>;
}

export interface BibsResult {
  ok: true;
  format: { playersPerSide: number };
  teams: [BibsTeam, BibsTeam];
  bench: BibsPlayer[];
  balance: {
    diff: number;
    diffPct: number;
    verdict: 'tightest' | 'close' | 'lopsided';
    label: string;
  };
  reasoning: string[];
}

export interface BibsError {
  ok: false;
  reason: 'too_few_players' | 'no_twins';
  message: string;
  confirmedCount: number;
  needed: number;
}

const POSITION_TO_ROLE: Record<string, SuggestedRole> = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF', FB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID',
  LW: 'FWD', RW: 'FWD', W: 'FWD', ST: 'FWD', CF: 'FWD',
};

function suggestRoleForPlayer(
  position: string | null,
  attrs: Record<AttributeKey, number>,
): SuggestedRole {
  // Stated position is the primary signal — kickabouts are casual,
  // and a player who calls themselves a CB wants to stand in defence.
  if (position) {
    const code = position.toUpperCase();
    if (POSITION_TO_ROLE[code]) return POSITION_TO_ROLE[code];
  }
  // No position — derive from attribute profile.
  const def = (attrs.defending ?? 50) + (attrs.physical ?? 50) * 0.7;
  const mid = (attrs.passing ?? 50) * 1.2 + (attrs.dribbling ?? 50) * 0.5;
  const fwd = (attrs.shooting ?? 50) * 1.3 + (attrs.pace ?? 50) * 0.6;
  if (def >= mid && def >= fwd) return 'DEF';
  if (mid >= fwd) return 'MID';
  return 'FWD';
}

function verdictFromDiffPct(diffPct: number): BibsResult['balance']['verdict'] {
  if (diffPct < 2) return 'tightest';
  if (diffPct < 5) return 'close';
  return 'lopsided';
}

function balanceLabel(verdict: BibsResult['balance']['verdict']): string {
  switch (verdict) {
    case 'tightest': return 'tightest split possible';
    case 'close':    return 'close — fair fight';
    case 'lopsided': return 'lopsided — consider swapping one';
  }
}

function groupByRole(players: BibsPlayer[]): Record<SuggestedRole, BibsPlayer[]> {
  const out: Record<SuggestedRole, BibsPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of players) out[p.suggestedRole].push(p);
  return out;
}

/**
 * Try a single one-for-one swap between teams to tighten balance.
 * Only swaps players sharing the same suggested role so each team
 * keeps its structural shape.
 */
function attemptBalanceSwap(red: BibsPlayer[], blue: BibsPlayer[]): boolean {
  const redSum = red.reduce((s, p) => s + p.overall, 0);
  const blueSum = blue.reduce((s, p) => s + p.overall, 0);
  const initial = Math.abs(redSum - blueSum);
  if (initial < 3) return false;

  let bestImprovement = 0;
  let bestSwap: { ri: number; bi: number } | null = null;

  for (let ri = 0; ri < red.length; ri++) {
    for (let bi = 0; bi < blue.length; bi++) {
      if (red[ri].suggestedRole !== blue[bi].suggestedRole) continue;
      const after = Math.abs(initial + 2 * (blue[bi].overall - red[ri].overall) * (redSum > blueSum ? -1 : 1));
      const improvement = initial - after;
      if (improvement > bestImprovement) {
        bestImprovement = improvement;
        bestSwap = { ri, bi };
      }
    }
  }

  if (bestSwap) {
    const { ri, bi } = bestSwap;
    [red[ri], blue[bi]] = [blue[bi], red[ri]];
    return true;
  }
  return false;
}

export async function bibsOptimizer(input: {
  prisma: PrismaClient;
  squadId: string;
  confirmedUserIds: string[];
  playersPerSide: number;
}): Promise<BibsResult | BibsError> {
  const { prisma, squadId, confirmedUserIds, playersPerSide } = input;

  const needed = playersPerSide * 2;
  if (confirmedUserIds.length < 4) {
    return {
      ok: false,
      reason: 'too_few_players',
      message: `Need at least 4 confirmed lads to balance teams. You've got ${confirmedUserIds.length}.`,
      confirmedCount: confirmedUserIds.length,
      needed: 4,
    };
  }

  // Hydrate twin + user data
  const memberships = await prisma.squadMember.findMany({
    where: { squadId, userId: { in: confirmedUserIds } },
    include: {
      user: {
        include: {
          playerProfile: { include: { twin: true } },
        },
      },
    },
  });

  const players: BibsPlayer[] = memberships
    .map((m) => {
      const profile = m.user.playerProfile;
      const twin = profile?.twin;
      if (!profile || !twin) return null;
      const attrs = (twin.baseAttributes as Record<AttributeKey, number> | null) ?? {
        pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
      };
      const overall = computeOverall(attrs, m.user.position, twin.level, twin.prestige);
      return {
        profileId: profile.id,
        userId: m.userId,
        name: m.user.name ?? 'Player',
        position: m.user.position,
        attrs,
        level: twin.level,
        overall,
        suggestedRole: suggestRoleForPlayer(m.user.position, attrs),
      };
    })
    .filter((p): p is BibsPlayer => p !== null);

  if (players.length === 0) {
    return {
      ok: false,
      reason: 'no_twins',
      message: 'None of the confirmed players have twin profiles yet. Re-run the seed.',
      confirmedCount: confirmedUserIds.length,
      needed: 1,
    };
  }

  // Sort strongest-first for snake draft
  players.sort((a, b) => b.overall - a.overall);

  // Snake-draft into two teams up to capacity
  const capacity = playersPerSide * 2;
  const draftable = players.slice(0, capacity);
  const bench = players.slice(capacity);

  const red: BibsPlayer[] = [];
  const blue: BibsPlayer[] = [];
  draftable.forEach((p, i) => {
    // Snake pattern: 0→R, 1→B, 2→B, 3→R, 4→R, 5→B …
    const cycle = Math.floor(i / 2);
    const goesToRed = i % 2 === 0 ? cycle % 2 === 0 : cycle % 2 === 1;
    if (goesToRed) red.push(p);
    else blue.push(p);
  });

  // Attempt a balance swap if helpful
  attemptBalanceSwap(red, blue);

  const redOverall = red.reduce((s, p) => s + p.overall, 0);
  const blueOverall = blue.reduce((s, p) => s + p.overall, 0);
  const diff = Math.abs(redOverall - blueOverall);
  const avg = (redOverall + blueOverall) / 2 || 1;
  const diffPct = (diff / avg) * 100;
  const verdict = verdictFromDiffPct(diffPct);

  // Reasoning lines for the captain
  const reasoning: string[] = [];
  reasoning.push(
    `Drafted ${draftable.length} confirmed lads into ${playersPerSide}-a-side — snake order by Overall.`,
  );
  reasoning.push(
    `Reds aggregate ${redOverall} (avg ${Math.round(redOverall / red.length)}) vs Blues ${blueOverall} (avg ${Math.round(blueOverall / blue.length)}).`,
  );
  if (bench.length > 0) {
    reasoning.push(
      `${bench.length} on the bench: ${bench.map((b) => b.name).join(', ')}. Rotate in via winner-stays-on.`,
    );
  }
  reasoning.push(`Balance: ${diffPct.toFixed(1)}% — ${balanceLabel(verdict)}.`);

  const teams: [BibsTeam, BibsTeam] = [
    {
      name: 'Reds',
      players: red,
      aggregateOverall: redOverall,
      byRole: groupByRole(red),
    },
    {
      name: 'Blues',
      players: blue,
      aggregateOverall: blueOverall,
      byRole: groupByRole(blue),
    },
  ];

  if (confirmedUserIds.length < needed) {
    reasoning.unshift(
      `Heads-up: only ${confirmedUserIds.length} confirmed for ${playersPerSide}v${playersPerSide} (need ${needed}). Going with what we have.`,
    );
  }

  return {
    ok: true,
    format: { playersPerSide },
    teams,
    bench,
    balance: { diff, diffPct, verdict, label: balanceLabel(verdict) },
    reasoning,
  };
}
