/**
 * Session payoff resolver — the standalone "how did our bet land" bundle
 * for a player in a session.
 *
 * Used by the shareable payoff OG card (`/api/og/payoff`) and the share
 * metadata on the analysis page. The analysis page itself derives the same
 * verdict inline from its already-loaded rich stats (stat cells, rank,
 * per-attribute deltas), so it doesn't re-query through here — this is the
 * self-contained path for surfaces that only need the payoff summary.
 *
 * Resolution logic is NOT duplicated: this delegates to the single-source
 * generatePrediction + resolvePrediction (predictions.ts). Only the
 * outcome-from-session aggregation lives here.
 */

import type { PrismaClient } from '@prisma/client';
import { baselineForPosition, computeOverall } from './position-baselines';
import { generatePrediction, resolvePrediction, type PredictionVerdict } from './predictions';
import { ATTRIBUTE_KEYS, type AttributeKey } from './twin-types';

type Attrs = Record<AttributeKey, number>;

export interface SessionPayoff {
  name: string;
  position: string | null;
  overall: number;
  goals: number;
  assists: number;
  boldCall: string;
  verdict: PredictionVerdict;
}

/**
 * Resolve a player's opening-bet payoff for a session. Returns null when the
 * player token or session can't be found.
 */
export async function resolveSessionPayoff(
  prisma: PrismaClient,
  sessionId: string,
  playerToken: string,
): Promise<SessionPayoff | null> {
  const player = await prisma.user.findUnique({
    where: { walletAddress: playerToken },
    include: { playerProfile: { include: { twin: true } } },
  });
  if (!player?.playerProfile) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { matches: { include: { playerStats: true } } },
  });
  if (!session) return null;

  const profileId = player.playerProfile.id;
  const allStats = session.matches.flatMap((m) => m.playerStats);
  const myStats = allStats.filter((s) => s.profileId === profileId);
  const goals = myStats.reduce((s, st) => s + st.goals, 0);
  const assists = myStats.reduce((s, st) => s + st.assists, 0);

  // Rank among the night's scorers.
  const byProfile = new Map<string, number>();
  for (const st of allStats) byProfile.set(st.profileId, (byProfile.get(st.profileId) ?? 0) + st.goals);
  const ranked = [...byProfile.entries()].sort((a, b) => b[1] - a[1]);
  const myRank = ranked.findIndex(([pid]) => pid === profileId) + 1 || null;

  // Peer ratings this session.
  const ratings = await prisma.peerRating.findMany({
    where: { targetId: profileId, match: { sessionId } },
    select: { score: true },
  });
  const avgRating = ratings.length > 0 ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : null;

  // Attribute movement on the doubted stat (before-snapshot vs current).
  const currentAttrs: Attrs =
    (player.playerProfile.twin?.baseAttributes as Attrs | null) ?? baselineForPosition(player.position);
  const overall = computeOverall(
    currentAttrs,
    player.position,
    player.playerProfile.twin?.level ?? 1,
    player.playerProfile.twin?.prestige ?? 0,
  );
  const beforeMap = session.beforeAttributes as Record<string, Partial<Attrs>> | null;
  const before = beforeMap?.[profileId] ?? null;

  const prediction = generatePrediction({
    position: player.position,
    attrs: baselineForPosition(player.position),
    seed: profileId,
  });

  const wk = prediction.weakness.key;
  const beforeWeak = before?.[wk];
  const weaknessDelta =
    typeof beforeWeak === 'number' && ATTRIBUTE_KEYS.includes(wk) ? currentAttrs[wk] - beforeWeak : 0;

  const verdict = resolvePrediction(prediction, {
    goals,
    assists,
    wasTopScorer: myRank === 1 && goals > 0,
    avgRating,
    weaknessDelta,
  });

  return {
    name: player.name ?? 'Player',
    position: player.position,
    overall,
    goals,
    assists,
    boldCall: prediction.boldCall,
    verdict,
  };
}
