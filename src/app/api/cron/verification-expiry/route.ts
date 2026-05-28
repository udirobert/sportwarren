import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Cron endpoint to auto-verify matches after 6 hours with no disputes.
 * Frequency: Every 15 minutes
 *
 * Matches that were submitted via Telegram group verification and have
 * not received 2+ disputes within 6 hours are auto-verified (silence = consent).
 *
 * @example
 * ```json
 * { crons: [{ path: '/api/cron/verification-expiry', schedule: '5,20,35,50 * * * *' }] }
 * ```
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    // Find matches that are still pending and were created more than 6 hours ago
    const staleMatches = await prisma.match.findMany({
      where: {
        status: 'pending',
        createdAt: { lte: sixHoursAgo },
      },
      include: {
        verifications: true,
        homeSquad: {
          include: { groups: { where: { platform: 'telegram' } } },
        },
        awaySquad: {
          include: { groups: { where: { platform: 'telegram' } } },
        },
      },
      take: 10, // Batch limit
    });

    if (staleMatches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired pending matches',
        processed: 0,
      });
    }

    let verifiedCount = 0;
    let disputedCount = 0;

    for (const match of staleMatches) {
      const disputes = match.verifications.filter(v => !v.verified);

      if (disputes.length >= 2) {
        // Enough disputes to mark as disputed
        await prisma.match.update({
          where: { id: match.id },
          data: { status: 'disputed' },
        });
        disputedCount++;
        continue;
      }

      // Auto-verify: silence = consent
      // Use the match-workflow's verification logic to trigger all side effects
      try {
        const { verifyMatchResult } = await import(
          '@/server/services/match-workflow'
        );

        // We need a synthetic verifier. Use the submitter's ID with a special path
        // that bypasses the "submitter cannot verify own" check by using a system user.
        // Instead, we directly update the match status and run post-verification logic.
        const { ensureMatchParticipationStats } = await import(
          '@/server/services/match-workflow'
        );
        const { distributeMatchRewards } = await import(
          '@/server/services/economy/treasury-ledger'
        );
        const { PEER_RATING } = await import('@/lib/match/constants');
        const { notifyMatchVerified } = await import(
          '@/server/services/communication/match-notifications'
        );

        const updatedMatch = await prisma.match.update({
          where: { id: match.id },
          data: {
            status: 'verified',
            peerRatingsCloseAt: new Date(
              Date.now() + PEER_RATING.WINDOW_HOURS * 60 * 60 * 1000,
            ),
          },
        });

        // Seed participation stats and distribute rewards
        await ensureMatchParticipationStats(prisma, match.id);
        const seededStats = await prisma.playerMatchStats.findMany({
          where: { matchId: match.id },
        });

        const homeScore = match.homeScore ?? 0;
        const awayScore = match.awayScore ?? 0;
        const isDraw = homeScore === awayScore;

        await distributeMatchRewards({
          prisma,
          squadId: match.homeSquadId,
          matchId: match.id,
          isWinner: homeScore > awayScore,
          isDraw,
          playerStats: seededStats,
        });

        await distributeMatchRewards({
          prisma,
          squadId: match.awaySquadId,
          matchId: match.id,
          isWinner: awayScore > homeScore,
          isDraw,
          playerStats: seededStats,
        });

        // Notify match verified (sends peer rating prompt)
        await notifyMatchVerified(
          match.id,
          match.homeSquad.name,
          match.awaySquad.name,
        );

        // Update the group verification messages if the Telegram service is available
        try {
          const { getTelegramService } = await import(
            '@/server/services/communication/telegram'
          );
          const telegramService = getTelegramService();
          if (telegramService) {
            await telegramService.resolveGroupVerificationExternal(match.id);
          }
        } catch {
          // Telegram service may not be available in all environments
        }

        verifiedCount++;
      } catch (err) {
        console.error(
          `Failed to auto-verify match ${match.id}:`,
          err,
        );
      }
    }

    return NextResponse.json({
      success: true,
      processed: staleMatches.length,
      verified: verifiedCount,
      disputed: disputedCount,
    });
  } catch (error) {
    console.error('Verification expiry cron failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
