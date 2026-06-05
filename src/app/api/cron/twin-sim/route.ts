import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runSimulation, settleResults } from '@/server/services/personalization/twin-sim';

/**
 * Cron endpoint — runs pending overnight twin simulations.
 *
 * Picks up TwinSimulation rows with status 'pending' and at least 4
 * participants, runs the round-robin, and settles results via
 * TwinService.recordEvent for each participant.
 *
 * Schedule: daily at midnight
 */
export async function GET(request: Request) {
  console.log('[Cron] Starting twin simulation runner...');
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pending = await prisma.twinSimulation.findMany({
      where: { status: 'pending' },
      include: { _count: { select: { participants: true } } },
    });

    const eligible = pending.filter((s) => s._count.participants >= 4);
    let processed = 0;

    for (const sim of eligible) {
      try {
        await runSimulation(sim.id);
        await settleResults(sim.id);
        processed++;
      } catch (e) {
        console.error(`[Cron] Sim ${sim.id} failed:`, e);
      }
    }

    console.log(`[Cron] Twin sim complete: ${processed}/${eligible.length} simulations settled.`);
    return NextResponse.json({ processed, eligible: eligible.length });
  } catch (error) {
    console.error('[Cron] Twin simulation runner failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
