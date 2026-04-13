import { BaseCommand } from './base';
import type { CommandContext, ResolvedIdentity } from '../types';
import { prisma } from "@/lib/db";
import { getUserSquads } from '../middleware/identity';
import { SUCCESS, getErrorMessage } from '../responses/errors';

/**
 * RSVP Command - Confirm you're playing in the next match
 */
export class RsvpCommand extends BaseCommand {
  pattern = /\/rsvp(?:\s+(.+))?/;
  description = 'Confirm you\'re playing in the next match (e.g., /rsvp yes)';

  async executeWithIdentity(ctx: CommandContext, identity: ResolvedIdentity): Promise<void> {
    const response = ctx.args?.trim().toLowerCase();
    
    // Find the next upcoming match for the user's squad
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
      await ctx.bot.sendMessage(
        ctx.chatId,
        "📅 *No Upcoming Matches*\n\nThere are no matches scheduled for your squad at the moment.",
        { parse_mode: 'Markdown' }
      );
      return;
    }

    if (!response) {
      await ctx.bot.sendMessage(
        ctx.chatId,
        `📅 *Upcoming Match RSVP*\n\n*vs ${upcomingMatch.homeSquadId === squadId ? upcomingMatch.awaySquad.name : upcomingMatch.homeSquad.name}*\n📅 ${upcomingMatch.matchDate.toLocaleDateString()}\n\nUsage: /rsvp [yes|no|maybe]`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    let status: 'available' | 'unavailable' | 'maybe';
    if (['yes', 'in', 'available', 'y'].includes(response)) status = 'available';
    else if (['no', 'out', 'unavailable', 'n'].includes(response)) status = 'unavailable';
    else if (['maybe', 'm'].includes(response)) status = 'maybe';
    else {
      await ctx.bot.sendMessage(ctx.chatId, "Please use /rsvp [yes|no|maybe]");
      return;
    }

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
        status,
        respondedAt: new Date(),
      },
      update: {
        status,
        respondedAt: new Date(),
      },
    });

    const statusText = status === 'available' ? '✅ You\'re IN!' : status === 'unavailable' ? '❌ You\'re OUT.' : '🤔 You\'re a MAYBE.';
    await ctx.bot.sendMessage(
      ctx.chatId,
      `*RSVP Confirmed*\n\n${statusText}\n\nMatch: vs ${upcomingMatch.homeSquadId === squadId ? upcomingMatch.awaySquad.name : upcomingMatch.homeSquad.name}`,
      { parse_mode: 'Markdown' }
    );
  }
}
