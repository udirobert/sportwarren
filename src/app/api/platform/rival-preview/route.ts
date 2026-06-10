import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { simulateTournamentMatch } from '@/lib/tournament/tournament-simulation';
import type { TournamentEntry } from '@/lib/tournament/tournament-simulation';

export interface RivalPreviewPayload {
  formation: string;
  style: string;
  color: string;
  names: string[];
  size: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RivalPreviewPayload;
    const { formation, style, color, names, size } = body;

    // Pick a random active squad from the platform as the rival
    const rivalSquad = await prisma.squad.findFirst({
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: { id: true, name: true },
    });

    // Fallback names if DB is empty or no squad found
    const rivalNames = rivalSquad ? ['Rival', 'Away'] : ['Training Squad', 'B Team'];

    // Build user entry
    const userPlayers = names.slice(0, size).map((name, i) => ({
      id: `user-${i}`,
      name: name || `Player ${i + 1}`,
      position: i === 0 ? 'GK' : i <= 2 ? 'DF' : i <= 5 ? 'MF' : 'ST',
      attributes: { pace: 70, shooting: 65, passing: 70, dribbling: 68, defending: 65, physical: 70 },
    }));

    const userEntry: TournamentEntry = {
      id: 'user-squad',
      name: names[0] || 'Your Squad',
      players: userPlayers,
      formation,
      playStyle: style as 'balanced' | 'attacking' | 'defensive' | 'possession' | 'counter',
    };

    const rivalEntry: TournamentEntry = {
      id: rivalSquad?.id ?? 'rival-squad',
      name: rivalSquad?.name ?? 'Training Squad',
      players: rivalNames.map((n, i) => ({
        id: `rival-${i}`,
        name: n,
        position: i === 0 ? 'GK' : i <= 2 ? 'DF' : i <= 5 ? 'MF' : 'ST',
        attributes: { pace: 65, shooting: 65, passing: 65, dribbling: 65, defending: 65, physical: 65 },
      })),
      formation: '4-4-2',
      playStyle: 'balanced',
    };

    const result = simulateTournamentMatch(userEntry, rivalEntry, Date.now());

    return NextResponse.json({
      user: { name: userEntry.name, formation, color, score: result.homeScore },
      rival: { name: rivalEntry.name, formation: rivalEntry.formation, color: '#ef4444', score: result.awayScore },
      possession: result.possession,
      events: result.events,
      winProbability: Math.round((result.homeScore / Math.max(result.homeScore + result.awayScore, 1)) * 100),
    });
  } catch (err) {
    console.error('[RIVAL-PREVIEW] Failed:', err);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}
