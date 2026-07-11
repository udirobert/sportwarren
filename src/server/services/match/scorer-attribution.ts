/**
 * Scorer → player attribution for chat-logged matches.
 *
 * The match parser (`@/lib/ai/match-parser`) captures goalscorers/assisters by
 * NAME ("I bagged 2, Sammy got the other"). This turns those names into the
 * logging squad's `PlayerProfile`s and writes them onto `PlayerMatchStats`.
 *
 * INTEGRITY FIRST — stats are how the group remembers a player, so this resolver
 * is deliberately conservative: it only credits a goal when it is confident who
 * scored (self-reference, an exact name, or a unique first name). Anything
 * ambiguous is returned as `unresolved` and logged as a plain team goal rather
 * than guessed onto the wrong player. Career totals + XP stay gated behind match
 * verification (`applyMatchXP` reads these rows), so nothing counts until the
 * result is verified.
 */

import type { PrismaClient } from '@prisma/client';
import type { MatchScorer, MatchAssister } from '@/lib/ai/match-parser';
import { ensureMatchParticipationStats } from '@/server/services/match-workflow';

export interface AttributionMember {
  profileId: string;
  userId: string;
  name: string | null;
}

export interface ResolvedGoal {
  profileId: string;
  name: string;
  goals: number;
}

export interface ResolvedAssist {
  profileId: string;
  name: string;
  assists: number;
}

export interface ScorerResolution {
  goals: ResolvedGoal[];
  assists: ResolvedAssist[];
  /** Names we could not confidently attribute — surfaced to the user, never guessed. */
  unresolved: string[];
}

// First-person / addressee references collapse to the person who logged the match.
const SELF_REFS = new Set(['i', 'me', 'my', 'myself', 'self', 'you', 'us', 'we']);

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolve a single scorer name to a member, or null if not confident.
 * Order: self-reference → exact full name → unique first-name token.
 * Ambiguous (≥2 candidates) or unknown → null (never guessed).
 */
function resolveName(
  rawName: string,
  members: AttributionMember[],
  submitterUserId: string,
): AttributionMember | null {
  const n = normalize(rawName);
  if (!n) return null;

  if (SELF_REFS.has(n)) {
    return members.find((m) => m.userId === submitterUserId) ?? null;
  }

  const named = members.filter((m) => m.name && normalize(m.name));

  const exact = named.filter((m) => normalize(m.name!) === n);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return null; // two members share a name — don't guess

  // Unique first-name token match. Deliberately NOT prefix/fuzzy: "Sammy" must
  // not silently credit "Sam" — a wrong credit is worse than an uncredited goal.
  const firstToken = n.split(' ')[0];
  const byFirst = named.filter((m) => normalize(m.name!).split(' ')[0] === firstToken);
  if (byFirst.length === 1) return byFirst[0];

  return null;
}

/**
 * Resolve parsed scorers/assisters against a squad's members. Pure — no I/O.
 * Aggregates per profile so a name appearing twice can't overwrite itself.
 */
export function resolveScorers(input: {
  members: AttributionMember[];
  scorers: MatchScorer[];
  assists: MatchAssister[];
  submitterUserId: string;
}): ScorerResolution {
  const { members, scorers, assists, submitterUserId } = input;

  const goalsByProfile = new Map<string, ResolvedGoal>();
  const assistsByProfile = new Map<string, ResolvedAssist>();
  const unresolved: string[] = [];

  for (const s of scorers ?? []) {
    if (!s?.name || !(s.goals > 0)) continue;
    const m = resolveName(s.name, members, submitterUserId);
    if (!m) {
      unresolved.push(s.name);
      continue;
    }
    const prev = goalsByProfile.get(m.profileId);
    goalsByProfile.set(m.profileId, {
      profileId: m.profileId,
      name: m.name ?? s.name,
      goals: (prev?.goals ?? 0) + s.goals,
    });
  }

  for (const a of assists ?? []) {
    if (!a?.name || !(a.assists > 0)) continue;
    const m = resolveName(a.name, members, submitterUserId);
    if (!m) {
      unresolved.push(a.name);
      continue;
    }
    const prev = assistsByProfile.get(m.profileId);
    assistsByProfile.set(m.profileId, {
      profileId: m.profileId,
      name: m.name ?? a.name,
      assists: (prev?.assists ?? 0) + a.assists,
    });
  }

  return {
    goals: [...goalsByProfile.values()],
    assists: [...assistsByProfile.values()],
    unresolved,
  };
}

/**
 * Write a resolution onto the match's `PlayerMatchStats` rows. Seeds the
 * zero-goal participation rows first (idempotent), then sets goals/assists for
 * the resolved profiles. `updateMany` is a no-op for a profile without a row
 * (e.g. a member with no PlayerProfile), so this never throws on a miss.
 */
export async function applyScorerAttribution(
  prisma: PrismaClient,
  matchId: string,
  resolution: ScorerResolution,
): Promise<void> {
  if (resolution.goals.length === 0 && resolution.assists.length === 0) return;

  await ensureMatchParticipationStats(prisma, matchId);

  for (const g of resolution.goals) {
    await prisma.playerMatchStats.updateMany({
      where: { matchId, profileId: g.profileId },
      data: { goals: g.goals },
    });
  }
  for (const a of resolution.assists) {
    await prisma.playerMatchStats.updateMany({
      where: { matchId, profileId: a.profileId },
      data: { assists: a.assists },
    });
  }
}
