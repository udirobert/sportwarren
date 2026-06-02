import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PEER_RATING } from '@/lib/match/constants';
import { generateRateToken } from '@/lib/auth/rate-token';
import { redisService } from '@/server/services/redis';

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
                    platformIdentities: {
                      select: { platform: true, platformUserId: true },
                    },
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
                    platformIdentities: {
                      select: { platform: true, platformUserId: true },
                    },
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whatsappService: any = null;
    try {
      const { getWhatsAppService } = await import('@/server/services/communication/whatsapp');
      whatsappService = getWhatsAppService();
    } catch {
      // WhatsApp not configured
    }

    let telegramService: import('@/server/services/communication/telegram').TelegramService | null = null;
    try {
      const { getTelegramService } = await import('@/server/services/communication/telegram');
      telegramService = getTelegramService();
    } catch {
      // Telegram not configured
    }

    let totalReminded = 0;

    for (const match of matches) {
      const ratedProfileIds = new Set(match.peerRatings.map(r => r.raterId));

      const allMembers = [
        ...match.homeSquad.members,
        ...match.awaySquad.members,
      ];

      const unrated = allMembers.filter(m => {
        if (!m.user.playerProfile) return false;
        if (ratedProfileIds.has(m.user.playerProfile.id)) return false;
        if (m.user.platformIdentities.length === 0) return false;
        return true;
      });

      if (unrated.length === 0) continue;

      const hoursLeft = match.peerRatingsCloseAt
        ? Math.max(1, Math.round((match.peerRatingsCloseAt.getTime() - now.getTime()) / (60 * 60 * 1000)))
        : PEER_RATING.WINDOW_HOURS;

      for (const member of unrated) {
        const whatsappIdentity = member.user.platformIdentities.find(id => id.platform === 'whatsapp');
        const telegramIdentity = member.user.platformIdentities.find(id => id.platform === 'telegram');

        const reminderKey = `rating-reminder:${match.id}:${member.userId}`;
        try {
          const alreadySent = await redisService.get(reminderKey);
          if (alreadySent) continue;

          let sent = false;

          if (whatsappIdentity?.platformUserId && whatsappService) {
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

            await whatsappService.sendText(whatsappIdentity.platformUserId, dm);
            sent = true;
          }

          if (!sent && telegramIdentity?.platformUserId && telegramService) {
            const squadName = match.homeSquad.members.some(m => m.userId === member.userId)
              ? match.homeSquad.name
              : match.awaySquad.name;
            await telegramService.sendPeerRatingPrompt(
              Number(telegramIdentity.platformUserId),
              match.id,
              squadName,
            );
            sent = true;
          }

          if (sent) {
            await redisService.set(reminderKey, '1', 7 * 24 * 60 * 60);
            totalReminded++;
          }
        } catch (err) {
          console.error(`[RATING REMINDER] Failed for user ${member.userId}:`, err);
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
