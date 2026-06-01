import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PEER_RATING } from '@/lib/match/constants';
import { generateRateToken } from '@/lib/auth/rate-token';
import { redisService } from '@/server/services/redis';

/**
 * Cron endpoint to send rating reminder DMs to players who haven't rated yet.
 * Frequency: Every 2 hours (crontab: 0 &#42;/2 * * *)
 *
 * Finds verified matches where the rating window is still open and the match
 * was verified 6-20 hours ago. Sends a WhatsApp DM with a personalized rate
 * link to each unrated player.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const twentyHoursAgo = new Date(now.getTime() - 20 * 60 * 60 * 1000);

    // Find verified matches with open rating windows, verified 6-20h ago
    const matches = await prisma.match.findMany({
      where: {
        status: { in: ['verified', 'finalized'] },
        peerRatingsClosed: false,
        peerRatingsCloseAt: { gt: now },
        updatedAt: { lte: sixHoursAgo, gte: twentyHoursAgo },
      },
      include: {
        homeSquad: {
          include: {
            members: {
              include: {
                user: {
                  include: {
                    playerProfile: { select: { id: true } },
                    platformIdentities: { where: { platform: 'whatsapp' }, select: { platformUserId: true } },
                  },
                },
              },
            },
          },
        },
        awaySquad: {
          include: {
            members: {
              include: {
                user: {
                  include: {
                    playerProfile: { select: { id: true } },
                    platformIdentities: { where: { platform: 'whatsapp' }, select: { platformUserId: true } },
                  },
                },
              },
            },
          },
        },
        peerRatings: {
          select: { raterId: true },
          distinct: ['raterId'],
        },
      },
      take: 20,
    });

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matches need rating reminders',
        reminded: 0,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || process.env.CLIENT_URL;
    if (!baseUrl) {
      return NextResponse.json({ success: true, message: 'No CLIENT_URL set', reminded: 0 });
    }

    // Dynamically import WhatsApp service
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whatsappService: any = null;
    try {
      const { getWhatsAppService } = await import('@/server/services/communication/whatsapp');
      whatsappService = getWhatsAppService();
    } catch {
      // WhatsApp not configured
    }

    let totalReminded = 0;

    for (const match of matches) {
      // Find who has already rated
      const ratedProfileIds = new Set(match.peerRatings.map(r => r.raterId));

      // Collect all squad members
      const allMembers = [
        ...match.homeSquad.members,
        ...match.awaySquad.members,
      ];

      // Find unrated members with WhatsApp identities
      const unratedWithWhatsApp = allMembers.filter(m => {
        if (!m.user.playerProfile) return false;
        if (ratedProfileIds.has(m.user.playerProfile.id)) return false;
        if (m.user.platformIdentities.length === 0) return false;
        return true;
      });

      if (unratedWithWhatsApp.length === 0) continue;

      const hoursLeft = match.peerRatingsCloseAt
        ? Math.max(1, Math.round((match.peerRatingsCloseAt.getTime() - now.getTime()) / (60 * 60 * 1000)))
        : PEER_RATING.WINDOW_HOURS;

      for (const member of unratedWithWhatsApp) {
        const whatsappNumber = member.user.platformIdentities[0]?.platformUserId;
        if (!whatsappNumber) continue;

        // Dedup: only remind once per player per match
        const reminderKey = `rating-reminder:${match.id}:${member.userId}`;
        try {
          const alreadySent = await redisService.get(reminderKey);
          if (alreadySent) continue;

          const token = generateRateToken(match.id, member.userId);
          const rateUrl = `${baseUrl}/match/${match.id}/rate?rt=${token}`;

          const dm = [
            `Reminder: Your teammates are waiting for your ratings!`,
            ``,
            `${match.homeSquad.name} ${match.homeScore ?? '?'} - ${match.awayScore ?? '?'} ${match.awaySquad.name}`,
            ``,
            `Rating window closes in ${hoursLeft}h. Your feedback earns you Scout XP.`,
            ``,
            rateUrl,
          ].join('\n');

          if (whatsappService) {
            await whatsappService.sendText(whatsappNumber, dm);
            // Mark as reminded (7-day TTL — well past the rating window)
            await redisService.set(reminderKey, '1', 7 * 24 * 60 * 60);
            totalReminded++;
          }
        } catch (err) {
          console.error(`[RATING REMINDER] Failed to send to ${whatsappNumber}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      matchesChecked: matches.length,
      reminded: totalReminded,
    });
  } catch (error) {
    console.error('Rating reminders cron failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
