import { BaseCommand } from './base';
import type { CommandContext, ResolvedIdentity } from '../types';
import { prisma } from "@/lib/db";
import { getUserSquads } from '../middleware/identity';
import { SUCCESS, getErrorMessage } from '../responses/errors';

/**
 * Available Command - Set your availability
 */
export class AvailableCommand extends BaseCommand {
  pattern = /\/available(?:\s+(.+))?/;
  description = 'Set your availability for matches (e.g., /available Saturday)';

  async executeWithIdentity(ctx: CommandContext, identity: ResolvedIdentity): Promise<void> {
    const dayInput = ctx.args?.trim();
    
    if (!dayInput) {
      await ctx.bot.sendMessage(
        ctx.chatId,
        "📅 *Set Your Availability*\n\nUsage: /available [day]\n\nExample: /available Saturday\n\nDays: Tuesday, Saturday, Sunday",
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Parse day
    const dayMap: Record<string, number> = {
      'tuesday': 2,
      'saturday': 6,
      'sunday': 0,
    };
    
    const dayOfWeek = dayMap[dayInput.toLowerCase()];
    if (dayOfWeek === undefined) {
      await ctx.bot.sendMessage(
        ctx.chatId,
        "Invalid day. Use: Tuesday, Saturday, or Sunday",
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const squads = await getUserSquads(ctx.chatId);
    if (squads.length === 0) {
      await ctx.bot.sendMessage(ctx.chatId, getErrorMessage('NO_SQUAD'), { parse_mode: 'Markdown' });
      return;
    }

    const squadId = squads[0].squadId;
    const dayName = ['Sunday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek] ?? dayInput;

    // Upsert availability
    await prisma.squadAvailability.upsert({
      where: {
        userId_squadId_dayOfWeek: {
          userId: identity.userId,
          squadId,
          dayOfWeek,
        },
      },
      create: {
        userId: identity.userId,
        squadId,
        dayOfWeek,
        isAvailable: true,
      },
      update: {
        isAvailable: true,
      },
    });

    await ctx.bot.sendMessage(
      ctx.chatId,
      SUCCESS.AVAILABILITY_SET(dayName),
      { parse_mode: 'Markdown' }
    );
  }
}