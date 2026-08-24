import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { simulateTournamentMatch } from '@/lib/tournament/tournament-simulation';
import type { TournamentEntry, TournamentPlayer } from '@/lib/tournament/tournament-simulation';
import type { Formation, PlayStyle } from '@/types/index';

export interface RivalPreviewPayload {
  formation: string;
  style: string;
  color: string;
  names: string[];
  size: number;
}

const FALLBACK_FORMATION: Formation = '4-4-2';
const ALLOWED_STYLES: PlayStyle[] = ['balanced', 'possession', 'direct', 'counter', 'high_press', 'low_block'];
const MIN_TEAM_SIZE = 2;
const MAX_TEAM_SIZE = 18;
const MAX_NAME_COUNT = MAX_TEAM_SIZE;
const MAX_NAME_LENGTH = 80;

function toFormation(value: string): Formation {
  return value as Formation;
}

function toPlayStyle(value: string): PlayStyle {
  return ALLOWED_STYLES.includes(value as PlayStyle) ? (value as PlayStyle) : 'balanced';
}

function buildPlayers(names: string[], size: number, overall: number): TournamentPlayer[] {
  return Array.from({ length: size }, (_, i) => ({
    name: names[i] || `Player ${i + 1}`,
    position: i === 0 ? 'GK' : i <= 2 ? 'DF' : i <= 5 ? 'MF' : 'ST',
    overall,
  }));
}

function averageOverall(players: TournamentPlayer[]): number {
  if (players.length === 0) return 50;
  return players.reduce((sum, player) => sum + player.overall, 0) / players.length;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid preview payload' }, { status: 400 });
    }
    const { formation, style, color, names, size } = body as Partial<RivalPreviewPayload>;
    const candidateSize = typeof size === 'number' ? size : Number.NaN;
    if (
      typeof formation !== 'string' ||
      typeof style !== 'string' ||
      typeof color !== 'string' || color.length > 32 ||
      !Number.isInteger(candidateSize) || candidateSize < MIN_TEAM_SIZE || candidateSize > MAX_TEAM_SIZE ||
      !Array.isArray(names) || names.length > MAX_NAME_COUNT ||
      names.some((name) => typeof name !== 'string' || name.length > MAX_NAME_LENGTH)
    ) {
      return NextResponse.json({ error: 'Invalid preview payload' }, { status: 400 });
    }
    const teamSize = candidateSize;
    const playerNames = names as string[];

    const rivalSquad = await prisma.squad.findFirst({
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: { id: true, name: true },
    });

    const rivalNames = rivalSquad ? ['Rival', 'Away'] : ['Training Squad', 'B Team'];
    const sanitizedNames = playerNames.map((name) => name.trim());
    const userPlayers = buildPlayers(sanitizedNames, teamSize, 68);
    const rivalPlayers = buildPlayers(rivalNames, teamSize, 65);

    const userEntry: TournamentEntry = {
      id: 'user-squad',
      formation: toFormation(formation),
      playStyle: toPlayStyle(style),
      color,
      players: userPlayers,
    };

    const rivalEntry: TournamentEntry = {
      id: rivalSquad?.id ?? 'rival-squad',
      formation: FALLBACK_FORMATION,
      playStyle: 'balanced',
      color: '#ef4444',
      players: rivalPlayers,
    };

    const result = simulateTournamentMatch(userEntry, rivalEntry, Date.now());
    const strengthDiff = averageOverall(userPlayers) - averageOverall(rivalPlayers);
    const winProbability = Math.round(Math.max(5, Math.min(95, 50 + strengthDiff * 2)));

    return NextResponse.json({
      user: { name: sanitizedNames[0] || 'Your Squad', formation: userEntry.formation, color, score: result.homeScore },
      rival: { name: rivalSquad?.name ?? 'Training Squad', formation: rivalEntry.formation, color: rivalEntry.color, score: result.awayScore },
      possession: result.possession,
      events: result.events,
      winProbability,
    });
  } catch (err) {
    console.error('[RIVAL-PREVIEW] Failed:', err);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}
