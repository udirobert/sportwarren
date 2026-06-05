/**
 * Twin simulation service — overnight round-robin tournaments between
 * player twins.
 *
 * Flow:
 *   1. `createRoundRobin` — creates a TwinSimulation + participants + match
 *      pairings (round-robin, each twin plays every other twin once).
 *   2. `runSimulation` — for each match, derives a TournamentEntry from each
 *      twin's baseAttributes, calls the existing `simulateTournamentMatch`
 *      engine, writes scores, computes standings.
 *   3. `settleResults` — for each participant, calls
 *      `TwinService.recordEvent({ kind: 'sim_completed', ... })` which fires
 *      the applier, creates moments for podium finishers, and dispatches
 *      notifications.
 *
 * The cron at `/api/cron/twin-sim` picks up pending sims daily and runs
 * steps 2+3 automatically.
 */

import { prisma } from '@/lib/db';
import { simulateTournamentMatch, type TournamentEntry, type TournamentPlayer } from '@/lib/tournament/tournament-simulation';
import { getTwinService } from './twin-service';
import type { AttributeKey } from './twin-types';

interface TwinWithUser {
  id: string;
  level: number;
  baseAttributes: unknown;
  profile: {
    user: {
      id: string;
      name: string | null;
    };
  };
}

function twinToEntry(twin: TwinWithUser): TournamentEntry {
  const attrs = (twin.baseAttributes as Record<AttributeKey, number>) ?? {};
  const attack = Math.round(((attrs.pace ?? 50) + (attrs.shooting ?? 50)) / 2);
  const midfield = Math.round(((attrs.passing ?? 50) + (attrs.dribbling ?? 50)) / 2);
  const defense = Math.round(((attrs.defending ?? 50) + (attrs.physical ?? 50)) / 2);

  const players: TournamentPlayer[] = [
    { name: 'GK', position: 'GK', overall: defense },
    { name: 'CB', position: 'CB', overall: defense },
    { name: 'CB', position: 'CB', overall: defense },
    { name: 'LB', position: 'LB', overall: Math.round((defense + midfield) / 2) },
    { name: 'RB', position: 'RB', overall: Math.round((defense + midfield) / 2) },
    { name: 'CM', position: 'CM', overall: midfield },
    { name: 'CM', position: 'CM', overall: midfield },
    { name: 'CAM', position: 'CAM', overall: Math.round((midfield + attack) / 2) },
    { name: 'LW', position: 'LW', overall: attack },
    { name: 'RW', position: 'RW', overall: attack },
    { name: 'ST', position: 'ST', overall: attack },
  ];

  return {
    id: twin.id,
    formation: '4-3-3',
    playStyle: 'balanced',
    color: '#3b82f6',
    players,
  };
}

function generateRoundRobinPairings(twinIds: string[]): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < twinIds.length; i++) {
    for (let j = i + 1; j < twinIds.length; j++) {
      pairs.push([twinIds[i], twinIds[j]]);
    }
  }
  return pairs;
}

export async function createRoundRobin(name: string, twinIds: string[]) {
  if (twinIds.length < 4) throw new Error('TWIN_SIM_MIN_PARTICIPANTS:Need at least 4 twins');
  if (twinIds.length > 16) throw new Error('TWIN_SIM_MAX_PARTICIPANTS:Max 16 twins');

  const uniqueIds = [...new Set(twinIds)];
  const pairings = generateRoundRobinPairings(uniqueIds);

  const sim = await prisma.twinSimulation.create({
    data: {
      name,
      format: 'round_robin',
      status: 'pending',
      participants: {
        create: uniqueIds.map((twinId) => ({ twinId })),
      },
      matches: {
        create: pairings.map(([home, away]) => ({
          homeTwinId: home,
          awayTwinId: away,
        })),
      },
    },
    include: { participants: true, matches: true },
  });

  return sim;
}

export async function runSimulation(simId: string): Promise<{ settled: number }> {
  const sim = await prisma.twinSimulation.findUnique({
    where: { id: simId },
    include: {
      participants: { include: { twin: { include: { profile: { include: { user: true } } } } } },
      matches: true,
    },
  });
  if (!sim) throw new Error(`Simulation not found: ${simId}`);
  if (sim.status !== 'pending') throw new Error(`Simulation already ${sim.status}`);

  await prisma.twinSimulation.update({
    where: { id: simId },
    data: { status: 'running', startedAt: new Date() },
  });

  const twinMap = new Map<string, TwinWithUser>();
  for (const p of sim.participants) {
    twinMap.set(p.twinId, {
      id: p.twin.id,
      level: p.twin.level,
      baseAttributes: p.twin.baseAttributes,
      profile: { user: { id: p.twin.profile.user.id, name: p.twin.profile.user.name } },
    });
  }

  const standings = new Map<string, { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number }>();
  for (const twinId of twinMap.keys()) {
    standings.set(twinId, { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });
  }

  for (const match of sim.matches) {
    const homeTwin = twinMap.get(match.homeTwinId);
    const awayTwin = twinMap.get(match.awayTwinId);
    if (!homeTwin || !awayTwin) continue;

    const homeEntry = twinToEntry(homeTwin);
    const awayEntry = twinToEntry(awayTwin);
    const result = simulateTournamentMatch(homeEntry, awayEntry);

    await prisma.twinSimulationMatch.update({
      where: { id: match.id },
      data: { homeScore: result.homeScore, awayScore: result.awayScore, playedAt: new Date() },
    });

    const homeStanding = standings.get(match.homeTwinId)!;
    const awayStanding = standings.get(match.awayTwinId)!;
    homeStanding.goalsFor += result.homeScore;
    homeStanding.goalsAgainst += result.awayScore;
    awayStanding.goalsFor += result.awayScore;
    awayStanding.goalsAgainst += result.homeScore;

    if (result.homeScore > result.awayScore) {
      homeStanding.wins++;
      homeStanding.points += 3;
      awayStanding.losses++;
    } else if (result.awayScore > result.homeScore) {
      awayStanding.wins++;
      awayStanding.points += 3;
      homeStanding.losses++;
    } else {
      homeStanding.draws++;
      awayStanding.draws++;
      homeStanding.points += 1;
      awayStanding.points += 1;
    }
  }

  for (const [twinId, s] of standings) {
    await prisma.twinSimulationParticipant.updateMany({
      where: { simulationId: simId, twinId },
      data: { wins: s.wins, draws: s.draws, losses: s.losses, goalsFor: s.goalsFor, goalsAgainst: s.goalsAgainst, points: s.points },
    });
  }

  await prisma.twinSimulation.update({
    where: { id: simId },
    data: { status: 'completed', completedAt: new Date() },
  });

  return { settled: sim.participants.length };
}

export async function settleResults(simId: string): Promise<number> {
  const sim = await prisma.twinSimulation.findUnique({
    where: { id: simId },
    include: { participants: true },
  });
  if (!sim) throw new Error(`Simulation not found: ${simId}`);
  if (sim.status !== 'completed') throw new Error(`Simulation not completed: ${sim.status}`);

  const sorted = [...sim.participants].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });

  const totalParticipants = sorted.length;
  const totalPrize = sim.totalPrizeUsdc;
  const prizeDistribution = [0.5, 0.3, 0.15];

  const twinService = getTwinService();
  let settled = 0;

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const position = i + 1;
    const prizeUsdc = position <= 3 ? totalPrize * (prizeDistribution[position - 1] ?? 0) : 0;
    const pointsAwarded = Math.max(10, 100 - (position - 1) * 15);

    try {
      await twinService.recordEvent({
        kind: 'sim_completed',
        twinId: p.twinId,
        simulationId: simId,
        result: {
          position,
          participants: totalParticipants,
          pointsAwarded,
          prizeUsdc,
          goalsScored: p.goalsFor,
          goalsConceded: p.goalsAgainst,
        },
      });

      if (prizeUsdc > 0) {
        await prisma.twinSimulationParticipant.updateMany({
          where: { simulationId: simId, twinId: p.twinId },
          data: { prizeUsdc },
        });
      }

      settled++;
    } catch (e) {
      console.error(`[TwinSim] Failed to settle twin ${p.twinId} in sim ${simId}:`, e);
    }
  }

  await prisma.twinSimulation.update({
    where: { id: simId },
    data: { status: 'settled' },
  });

  return settled;
}
