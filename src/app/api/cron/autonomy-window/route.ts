import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { autonomyPolicy } from '@/server/services/ai/autonomy-policy';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron:autonomy-window] Checking for upcoming matches...');

  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingMatches = await prisma.match.findMany({
      where: {
        matchDate: { gte: windowStart, lte: windowEnd },
        status: 'pending',
      },
      select: {
        id: true,
        homeSquadId: true,
        awaySquadId: true,
        homeSquad: { select: { name: true } },
        awaySquad: { select: { name: true } },
      },
    });

    if (upcomingMatches.length === 0) {
      console.log('[Cron:autonomy-window] No upcoming matches in window.');
      return NextResponse.json({ success: true, squadsElevated: 0, matches: 0 });
    }

    const elevated = new Set<string>();
    const details: Array<{ squadId: string; squadName: string; matchId: string; opponent: string }> = [];

    for (const match of upcomingMatches) {
      for (const [squadId, squadName, opponentName] of [
        [match.homeSquadId, match.homeSquad.name, match.awaySquad.name],
        [match.awaySquadId, match.awaySquad.name, match.homeSquad.name],
      ] as [string, string, string][]) {
        if (elevated.has(squadId)) continue;
        elevated.add(squadId);
        await autonomyPolicy.setWindowOverride(squadId, 'automate', 172_800); // 48h TTL
        details.push({ squadId, squadName, matchId: match.id, opponent: opponentName });
        console.log(`[Cron:autonomy-window] Elevated ${squadName} (${squadId}) -> automate for match vs ${opponentName}`);
      }
    }

    console.log(`[Cron:autonomy-window] Elevated ${elevated.size} squads across ${upcomingMatches.length} matches.`);

    return NextResponse.json({
      success: true,
      matches: upcomingMatches.length,
      squadsElevated: elevated.size,
      details,
    });
  } catch (error) {
    console.error('[Cron:autonomy-window] Failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
