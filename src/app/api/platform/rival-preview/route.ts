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

function toFormation(value: string): Formation {
  return value as Formation;
}

function toPlayStyle(value: string): PlayStyle {
  return ALLOWED_STYLES.includes(value as PlayStyle) ? (value as PlayStyle) : 'balanced';
}

function buildPlayers(names: string[], size: number, overall: number): TournamentPlayer[] {
  return Array.from({ length: Math.max(size, 2) }, (_, i) => ({
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
    const body = (await request.json()) as RivalPreviewPayload;
    const { formation, style, color, names, size } = body;

    const rivalSquad = await prisma.squad.findFirst({
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: { id: true, name: true },
    });

    const rivalNames = rivalSquad ? ['Rival', 'Away'] : ['Training Squad', 'B Team'];
    const userPlayers = buildPlayers(names, size, 68);
    const rivalPlayers = buildPlayers(rivalNames, size, 65);

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
      user: { name: names[0] || 'Your Squad', formation: userEntry.formation, color, score: result.homeScore },
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
