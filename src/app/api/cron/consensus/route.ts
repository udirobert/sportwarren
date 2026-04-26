import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateConsensus } from '@/lib/match/peer-consensus';
import { PEER_RATING } from '@/lib/match/constants';

/**
 * Cron endpoint to trigger peer consensus calculations
 * @description This endpoint should be called by a scheduled job (Vercel Cron, Railway, etc.)
 * Frequency: Every 15 minutes
 * 
 * Protected by a secret token in the Authorization header
 * 
 * @example
 * ```json
 * { crons: [{ path: '/api/cron/consensus', schedule: '0 0,15,30,45 * * *' }] }
 * ```
 */
export async function GET(request: Request) {
  console.log('[Cron] Starting peer consensus calculation job...');
  // Verify cron secret (prevent unauthorized access)
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find matches with expired rating windows that haven't been closed
    const expiredMatches = await prisma.match.findMany({
      where: {
        peerRatingsClosed: false,
        peerRatingsCloseAt: {
          lte: new Date(),
        },
        status: 'verified',
      },
      select: {
        id: true,
        homeSquadId: true,
        awaySquadId: true,
        homeScore: true,
        awayScore: true,
        homeSquad: { select: { name: true } },
        awaySquad: { select: { name: true } },
      },
    });

    if (expiredMatches.length === 0) {
      console.log('[Cron] No expired rating windows found.');
      return NextResponse.json({
        success: true,
        message: 'No expired rating windows found',
        processed: 0,
      });
    }

    console.log(`[Cron] Found ${expiredMatches.length} matches with expired rating windows.`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;
    const BATCH_SIZE = 10; // Limit per invocation to prevent race conditions

    for (const match of expiredMatches.slice(0, BATCH_SIZE)) {
      try {
        const result = await calculateConsensus(prisma, match.id);
        results.push({
          matchId: match.id,
          homeSquad: match.homeSquad.name,
          awaySquad: match.awaySquad.name,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          success: result.success,
          playersRated: result.playersRated,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to calculate consensus for match ${match.id}:`, error);
        results.push({
          matchId: match.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        errorCount++;
      }
    }

    console.log(`[Cron] Consensus job complete: ${successCount} successful, ${errorCount} failed.`);

    return NextResponse.json({
      success: true,
      processed: Math.min(expiredMatches.length, BATCH_SIZE),
      total: expiredMatches.length,
      successful: successCount,
      failed: errorCount,
      ratingWindowHours: PEER_RATING.WINDOW_HOURS,
      results,
    });
  } catch (error) {
    console.error('Cron consensus job failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}