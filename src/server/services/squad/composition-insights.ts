/**
 * Fluid Squad Composition Insights
 *
 * Computes player pair/group win rates, formation performance, and key
 * tactical affinities from verified match results. The engine that powers
 * the "When Dave and Sami start together, win rate is 73%" screenshotable
 * insight the VISION doc calls the single most powerful viral feature.
 *
 * All functions are pure (no I/O) — aggregation is done by the caller.
 */

import type { PrismaClient } from '@prisma/client';

// ── Public types ────────────────────────────────────────────────────────────

export interface PlayerIdentity {
  userId: string;
  name: string;
  position: string | null;
}

export interface MatchWithParticipants {
  matchId: string;
  /** Whether the target squad was the home side for this match */
  isHome: boolean;
  /** Goals scored by the target squad */
  goalsFor: number;
  /** Goals conceded by the target squad */
  goalsAgainst: number;
  status: string;
  matchDate: Date;
  playerProfileIds: string[];
  /** Formation the squad used in this match (from homeFormation/awayFormation) */
  formation: string | null;
}

export interface PairStat {
  playerA: PlayerIdentity;
  playerB: PlayerIdentity;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number; // 0–100
  totalGoals: number; // goals scored by the squad when both played
}

export interface TrioStat {
  players: [PlayerIdentity, PlayerIdentity, PlayerIdentity];
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
}

export interface FormationStat {
  formation: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
}

export interface PlayerScoringImpact {
  player: PlayerIdentity;
  matchesWithGoal: number;
  winsWhenScores: number;
  winRateWhenScores: number;
  totalGoals: number;
}

export interface DefensivePairStat {
  playerA: PlayerIdentity;
  playerB: PlayerIdentity;
  matchesPlayed: number;
  cleanSheets: number;
  cleanSheetRate: number;
}

export interface CompositionInsights {
  /** Top 5 player pairs sorted by win rate (min 3 matches together) */
  topPairs: PairStat[];
  /** Top 5 player trios sorted by win rate (min 2 matches together) */
  topTrios: TrioStat[];
  /** Top 5 defensive pairs sorted by clean sheet rate (min 2 matches) */
  topDefensivePairs: DefensivePairStat[];
  /** Formation performance breakdown */
  formationStats: FormationStat[];
  /** Player scoring impact — who makes the biggest difference */
  topScoringImpact: PlayerScoringImpact[];
  /** The single most shareable insight for the captain */
  headlineInsight: string | null;
  /** Metadata about the dataset */
  meta: {
    totalMatches: number;
    totalPlayers: number;
  };
}

// ── Engine ──────────────────────────────────────────────────────────────────

/**
 * Aggregates raw match + participation data into composition insights.
 * Pure function — all data must be fetched before calling.
 *
 * The matches parameter must already have goalsFor/goalsAgainst computed
 * from the target squad's perspective (done by fetchSquadMatchParticipation).
 */
export function computeCompositionInsights(params: {
  matches: MatchWithParticipants[];
  playerMap: Map<string, PlayerIdentity>;
}): CompositionInsights {
  const { matches, playerMap } = params;
  const resolvedMatches = matches.filter((m) => m.status === 'verified' || m.status === 'finalized');

  if (resolvedMatches.length < 2) {
    return {
      topPairs: [],
      topTrios: [],
      topDefensivePairs: [],
      formationStats: [],
      topScoringImpact: [],
      headlineInsight: null,
      meta: { totalMatches: resolvedMatches.length, totalPlayers: playerMap.size },
    };
  }

  // ── 1. Pair aggregation ─────────────────────────────────────────────────
  const pairMap = new Map<string, PairAgg>();

  for (const match of resolvedMatches) {
    const pids = [...new Set(match.playerProfileIds)].sort();
    if (pids.length < 2) continue;

    const isWin = match.goalsFor > match.goalsAgainst;
    const isDraw = match.goalsFor === match.goalsAgainst;

    // Generate all unique pairs within this match
    for (let i = 0; i < pids.length; i++) {
      for (let j = i + 1; j < pids.length; j++) {
        const key = `${pids[i]}::${pids[j]}`;
        let agg = pairMap.get(key);
        if (!agg) {
          agg = { profileA: pids[i], profileB: pids[j], matches: 0, wins: 0, draws: 0, losses: 0, totalGoals: 0 };
          pairMap.set(key, agg);
        }
        agg.matches += 1;
        if (isWin) agg.wins += 1;
        else if (isDraw) agg.draws += 1;
        else agg.losses += 1;
        agg.totalGoals += match.goalsFor;
      }
    }
  }

  // ── 2. Build PairStat results ───────────────────────────────────────────
  const topPairs: PairStat[] = [];
  for (const agg of pairMap.values()) {
    if (agg.matches < 3) continue; // minimum sample
    const a = playerMap.get(agg.profileA);
    const b = playerMap.get(agg.profileB);
    if (!a || !b) continue;

    topPairs.push({
      playerA: a,
      playerB: b,
      matchesPlayed: agg.matches,
      wins: agg.wins,
      draws: agg.draws,
      losses: agg.losses,
      winRate: Math.round((agg.wins / agg.matches) * 100),
      totalGoals: agg.totalGoals,
    });
  }

  topPairs.sort((a, b) => b.winRate - a.winRate);
  const topPairsResult = topPairs.slice(0, 5);

  // ── 3. Formation stats ─────────────────────────────────────────────────
  const formationMap = new Map<string, { matches: number; wins: number; draws: number; losses: number }>();

  for (const match of resolvedMatches) {
    const f = match.formation;
    if (!f) continue;

    const isWin = match.goalsFor > match.goalsAgainst;
    const isDraw = match.goalsFor === match.goalsAgainst;

    let rec = formationMap.get(f);
    if (!rec) {
      rec = { matches: 0, wins: 0, draws: 0, losses: 0 };
      formationMap.set(f, rec);
    }
    rec.matches += 1;
    if (isWin) rec.wins += 1;
    else if (isDraw) rec.draws += 1;
    else rec.losses += 1;
  }

  const formationStats: FormationStat[] = [];
  for (const [formation, rec] of formationMap) {
    if (rec.matches < 2) continue;
    formationStats.push({
      formation,
      matchesPlayed: rec.matches,
      wins: rec.wins,
      draws: rec.draws,
      losses: rec.losses,
      winRate: Math.round((rec.wins / rec.matches) * 100),
    });
  }
  formationStats.sort((a, b) => b.winRate - a.winRate);

  // ── 4. Scoring impact ──────────────────────────────────────────────────
  // Track win rate when a player is on the pitch in matches where the
  // squad scored at least one goal.
  const scoringMap = new Map<string, { matches: number; wins: number; totalGoals: number }>();

  for (const match of resolvedMatches) {
    if (match.goalsFor === 0) continue;
    const isWin = match.goalsFor > match.goalsAgainst;

    for (const pid of match.playerProfileIds) {
      let rec = scoringMap.get(pid);
      if (!rec) {
        rec = { matches: 0, wins: 0, totalGoals: 0 };
        scoringMap.set(pid, rec);
      }
      rec.matches += 1;
      if (isWin) rec.wins += 1;
      rec.totalGoals += match.goalsFor;
    }
  }

  const topScoringImpact: PlayerScoringImpact[] = [];
  for (const [pid, rec] of scoringMap) {
    const player = playerMap.get(pid);
    if (!player || rec.matches < 2) continue;
    topScoringImpact.push({
      player,
      matchesWithGoal: rec.matches,
      winsWhenScores: rec.wins,
      winRateWhenScores: Math.round((rec.wins / rec.matches) * 100),
      totalGoals: rec.totalGoals,
    });
  }
  topScoringImpact.sort((a, b) => b.winRateWhenScores - a.winRateWhenScores);

  // ── 5. Defensive pairs (clean sheets) ──────────────────────────────────
  // A "clean sheet" means the squad conceded 0 goals.
  // We credit pairings where both players participated in a clean-sheet match.
  const defPairMap = new Map<string, { matches: number; cleanSheets: number }>();

  for (const match of resolvedMatches) {
    const pids = [...new Set(match.playerProfileIds)].sort();
    if (pids.length < 2) continue;

    const isCleanSheet = match.goalsAgainst === 0;

    for (let i = 0; i < pids.length; i++) {
      for (let j = i + 1; j < pids.length; j++) {
        const key = `${pids[i]}::${pids[j]}`;
        let rec = defPairMap.get(key);
        if (!rec) {
          rec = { matches: 0, cleanSheets: 0 };
          defPairMap.set(key, rec);
        }
        rec.matches += 1;
        if (isCleanSheet) rec.cleanSheets += 1;
      }
    }
  }

  const topDefensivePairs: DefensivePairStat[] = [];
  for (const [key, rec] of defPairMap) {
    if (rec.matches < 2) continue;
    const [pidA, pidB] = key.split('::') as [string, string];
    const a = playerMap.get(pidA);
    const b = playerMap.get(pidB);
    if (!a || !b) continue;

    topDefensivePairs.push({
      playerA: a,
      playerB: b,
      matchesPlayed: rec.matches,
      cleanSheets: rec.cleanSheets,
      cleanSheetRate: Math.round((rec.cleanSheets / rec.matches) * 100),
    });
  }
  topDefensivePairs.sort((a, b) => b.cleanSheetRate - a.cleanSheetRate);

  // ── 6. Trio aggregation ────────────────────────────────────────────────
  const trioMap = new Map<string, { profileIds: [string, string, string]; matches: number; wins: number; draws: number; losses: number }>();

  for (const match of resolvedMatches) {
    const pids = [...new Set(match.playerProfileIds)].sort();
    if (pids.length < 3) continue;

    const isWin = match.goalsFor > match.goalsAgainst;
    const isDraw = match.goalsFor === match.goalsAgainst;

    // Generate all unique trios within this match
    for (let i = 0; i < pids.length; i++) {
      for (let j = i + 1; j < pids.length; j++) {
        for (let k = j + 1; k < pids.length; k++) {
          const key = `${pids[i]}::${pids[j]}::${pids[k]}`;
          let agg = trioMap.get(key);
          if (!agg) {
            agg = { profileIds: [pids[i], pids[j], pids[k]], matches: 0, wins: 0, draws: 0, losses: 0 };
            trioMap.set(key, agg);
          }
          agg.matches += 1;
          if (isWin) agg.wins += 1;
          else if (isDraw) agg.draws += 1;
          else agg.losses += 1;
        }
      }
    }
  }

  const topTrios: TrioStat[] = [];
  for (const agg of trioMap.values()) {
    if (agg.matches < 2) continue; // minimum sample (lower than pairs — trios are rarer)
    const [pidA, pidB, pidC] = agg.profileIds;
    const a = playerMap.get(pidA);
    const b = playerMap.get(pidB);
    const c = playerMap.get(pidC);
    if (!a || !b || !c) continue;

    topTrios.push({
      players: [a, b, c],
      matchesPlayed: agg.matches,
      wins: agg.wins,
      draws: agg.draws,
      losses: agg.losses,
      winRate: Math.round((agg.wins / agg.matches) * 100),
    });
  }

  topTrios.sort((a, b) => b.winRate - a.winRate);
  const topTriosResult = topTrios.slice(0, 5);

  // ── 7. Headline insight ────────────────────────────────────────────────
  let headlineInsight: string | null = null;

  if (topPairsResult.length > 0) {
    const best = topPairsResult[0];
    if (best.matchesPlayed >= 3 && best.winRate >= 60) {
      headlineInsight = `When ${best.playerA.name} and ${best.playerB.name} play together, the win rate is ${best.winRate}% (${best.wins}W-${best.draws}D-${best.losses}L in ${best.matchesPlayed} matches).`;
    }
  }

  if (!headlineInsight && topScoringImpact.length > 0 && topScoringImpact[0].winRateWhenScores >= 60) {
    const top = topScoringImpact[0];
    headlineInsight = `With ${top.player.name} on the pitch, the squad wins ${top.winRateWhenScores}% of matches (${top.winsWhenScores}W in ${top.matchesWithGoal} games).`;
  }

  if (!headlineInsight && formationStats.length > 0 && formationStats[0].matchesPlayed >= 3 && formationStats[0].winRate >= 60) {
    const best = formationStats[0];
    headlineInsight = `${best.formation} is the squad's best formation at ${best.winRate}% win rate (${best.wins}W-${best.draws}D-${best.losses}L in ${best.matchesPlayed} matches).`;
  }

  if (!headlineInsight && topTriosResult.length > 0 && topTriosResult[0].matchesPlayed >= 2 && topTriosResult[0].winRate >= 60) {
    const best = topTriosResult[0];
    headlineInsight = `When ${best.players[0].name}, ${best.players[1].name} and ${best.players[2].name} play together, the win rate is ${best.winRate}% (${best.wins}W-${best.draws}D-${best.losses}L in ${best.matchesPlayed} matches).`;
  }

  return {
    topPairs: topPairsResult,
    topTrios: topTriosResult,
    topDefensivePairs: topDefensivePairs.slice(0, 5),
    formationStats: formationStats.slice(0, 5),
    topScoringImpact: topScoringImpact.slice(0, 3),
    headlineInsight,
    meta: { totalMatches: resolvedMatches.length, totalPlayers: playerMap.size },
  };
}

// ── Internal types ──────────────────────────────────────────────────────────

interface PairAgg {
  profileA: string;
  profileB: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  totalGoals: number;
}

// ── Database fetch helper ───────────────────────────────────────────────────

/**
 * Fetches all settled matches for a squad with participant player profile IDs.
 * Goals are already scoped to the target squad's perspective (goalsFor/goalsAgainst).
 */
export async function fetchSquadMatchParticipation(
  prisma: PrismaClient,
  squadId: string,
): Promise<{
  matches: MatchWithParticipants[];
  playerMap: Map<string, PlayerIdentity>;
}> {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ homeSquadId: squadId }, { awaySquadId: squadId }],
      status: { in: ['verified', 'finalized'] },
    },
    include: {
      playerStats: {
        select: {
          profileId: true,
          profile: {
            select: {
              userId: true,
              user: { select: { name: true, position: true } },
            },
          },
        },
      },
    },
    orderBy: { matchDate: 'desc' },
  });

  const playerMap = new Map<string, PlayerIdentity>();
  const resultMatches: MatchWithParticipants[] = [];

  for (const match of matches) {
    const isHome = match.homeSquadId === squadId;
    const goalsFor = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
    const goalsAgainst = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);
    const profileIds = match.playerStats.map((ps) => ps.profileId);

    // Populate player map
    for (const ps of match.playerStats) {
      if (!playerMap.has(ps.profileId)) {
        playerMap.set(ps.profileId, {
          userId: ps.profile.userId,
          name: ps.profile.user?.name ?? 'Unknown Player',
          position: ps.profile.user?.position ?? null,
        });
      }
    }

    resultMatches.push({
      matchId: match.id,
      isHome,
      goalsFor,
      goalsAgainst,
      status: match.status,
      matchDate: match.matchDate,
      playerProfileIds: profileIds,
      formation: isHome ? match.homeFormation : match.awayFormation,
    });
  }

  return { matches: resultMatches, playerMap };
}
