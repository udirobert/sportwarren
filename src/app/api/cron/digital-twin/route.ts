import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTwinService } from '@/server/services/personalization/twin-service';
import { refreshSquadEnergy } from '@/server/services/personalization/squad-energy';

/**
 * Cron endpoint — twin lifecycle housekeeping.
 *
 * Responsibilities:
 *   1. Refresh squad energy for squads with recent verified matches
 *      (SquadTwin.energy is the single source of truth; the legacy
 *      `Squad.squadEnergy` column is dropped in PR 2).
 *   2. Emit `coaching_expired` events for player twins whose coaching
 *      effects have lapsed. The applier drops the modifier; the
 *      notification fan-out fires the milestone.
 *
 * @example
 * ```json
 * { crons: [{ path: '/api/cron/digital-twin', schedule: '0 0 0,6,12,18 * *' }] }
 * ```
 */
export async function GET(request: Request) {
  console.log('[Cron] Starting twin housekeeping...');
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recentMatches = await prisma.match.findMany({
      where: {
        status: 'verified',
        matchDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { id: true, homeSquadId: true, awaySquadId: true },
    });

    const processedSquads = new Set<string>();
    let energyUpdates = 0;
    for (const match of recentMatches) {
      for (const squadId of [match.homeSquadId, match.awaySquadId]) {
        if (!processedSquads.has(squadId)) {
          try {
            await refreshSquadEnergy(squadId, match.id, prisma);
            processedSquads.add(squadId);
            energyUpdates++;
          } catch (err) {
            console.error(`Failed to refresh energy for squad ${squadId}:`, err);
          }
        }
      }
    }

    // Coaching expiry sweep
    const now = new Date();
    const expiredEffects = await prisma.coachingEffect.findMany({
      where: { active: true, expiresAt: { lte: now } },
    });
    let coachingExpired = 0;
    const twinService = getTwinService();
    for (const effect of expiredEffects) {
      try {
        if (effect.targetType === 'player') {
          const twin = await prisma.playerTwin.findUnique({
            where: { profileId: effect.targetId },
          });
          if (!twin) continue;
          await twinService.recordEvent({
            kind: 'coaching_expired',
            twinId: twin.id,
            effectId: effect.id,
          });
        }
        await prisma.coachingEffect.update({
          where: { id: effect.id },
          data: { active: false },
        });
        coachingExpired++;
      } catch (err) {
        console.warn(`Coaching expiry failed for effect ${effect.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      matchesProcessed: recentMatches.length,
      squadsUpdated: processedSquads.size,
      energyUpdates,
      coachingExpired,
    });
  } catch (error) {
    console.error('Cron twin housekeeping failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
