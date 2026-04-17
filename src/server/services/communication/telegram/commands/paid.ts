import { BaseCommand } from './base';
import type { CommandContext, ResolvedIdentity } from '../types';
import { prisma } from "@/lib/db";
import { getUserSquads } from '../middleware/identity';
import { getErrorMessage } from '../responses/errors';

/**
 * Paid Command - Mark yourself as paid for the next match
 */
export class PaidCommand extends BaseCommand {
  pattern = /\/paid(?:\s+(.+))?/;
  description = 'Mark yourself as paid for the next match (e.g., /paid £5)';

  async executeWithIdentity(ctx: CommandContext, identity: ResolvedIdentity): Promise<void> {
    const squads = await getUserSquads(ctx.chatId);
    if (squads.length === 0) {
      await ctx.bot.sendMessage(ctx.chatId, getErrorMessage('NO_SQUAD'), { parse_mode: 'Markdown' });
      return;
    }

    const squadId = squads[0].squadId;
    const upcomingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { homeSquadId: squadId },
          { awaySquadId: squadId },
        ],
        status: 'pending',
        matchDate: { gte: new Date() },
      },
      include: {
        homeSquad: true,
        awaySquad: true,
      },
      orderBy: { matchDate: 'asc' },
    });

    if (!upcomingMatch) {
      await ctx.bot.sendMessage(ctx.chatId, "📅 *No Upcoming Matches*\n\nYou can only mark payments for scheduled matches.", { parse_mode: 'Markdown' });
      return;
    }

    // Upsert payment status
    await prisma.matchRsvp.upsert({
      where: {
        userId_matchId: {
          userId: identity.userId,
          matchId: upcomingMatch.id,
        },
      },
      create: {
        userId: identity.userId,
        matchId: upcomingMatch.id,
        status: 'available', // Assume they are playing if they paid
        isPaid: true,
        paidAt: new Date(),
        amountPaid: 500, // Default £5
        respondedAt: new Date(),
      },
      update: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    await ctx.bot.sendMessage(
      ctx.chatId,
      `✅ *Payment Confirmed*\n\nThanks! You've been marked as paid for the match vs *${upcomingMatch.homeSquadId === squadId ? upcomingMatch.awaySquad.name : upcomingMatch.homeSquad.name}*.\n\n💰 Amount: £5.00`,
      { parse_mode: 'Markdown' }
    );
  }
}
