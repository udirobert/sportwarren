import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDigitalTwinService } from '@/server/services/ai/digital-twin';

/**
 * Cron endpoint to regenerate squad energy based on recent activity
 * @description Called periodically to update squad energy levels
 * 
 * Squad energy regenerates based on:
 * - Participation in recent matches
 * - Financial compliance (RSVP payments)
 * - Active streak bonuses
 * 
 * @example
 * ```json
 * { crons: [{ path: '/api/cron/digital-twin', schedule: '0 0 0,6,12,18 * *' }] }
 * ```
 */
export async function GET(request: Request) {
  console.log('[Cron] Starting digital twin energy refresh...');
  // Verify cron secret
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dtService = getDigitalTwinService(prisma);

    // Find verified matches in the last 7 days that haven't had energy updated
    const recentMatches = await prisma.match.findMany({
      where: {
        status: 'verified',
        matchDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: {
        id: true,
        homeSquadId: true,
        awaySquadId: true,
      },
    });

    console.log(`[Cron] Found ${recentMatches.length} recent matches for energy refresh.`);

    const processedSquads = new Set<string>();
    let energyUpdates = 0;

    for (const match of recentMatches) {
      // Update both squads
      for (const squadId of [match.homeSquadId, match.awaySquadId]) {
        if (!processedSquads.has(squadId)) {
          try {
            await dtService.updateSquadEnergy(squadId, match.id);
            processedSquads.add(squadId);
            energyUpdates++;
          } catch (error) {
            console.error(`Failed to update energy for squad ${squadId}:`, error);
          }
        }
      }
    }

    console.log(`[Cron] Energy refresh complete: ${processedSquads.size} squads updated.`);

    return NextResponse.json({
      success: true,
      matchesProcessed: recentMatches.length,
      squadsUpdated: processedSquads.size,
      energyUpdates,
    });
  } catch (error) {
    console.error('Cron digital twin refresh failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}