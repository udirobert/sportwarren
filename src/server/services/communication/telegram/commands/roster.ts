import { BaseCommand } from './base';
import type { CommandContext, ResolvedIdentity } from '../types';
import { getUserSquads } from '../middleware/identity';
import { getErrorMessage } from '../responses/errors';
import { isSquadLeader } from "@/server/services/permissions";

/**
 * Roster Command - View squad availability (captains only)
 */
export class RosterCommand extends BaseCommand {
  pattern = /\/roster(?:\s+(.+))?/;
  description = 'View squad availability for the week (captains only)';

  async executeWithIdentity(ctx: CommandContext, identity: ResolvedIdentity): Promise<void> {
    const squads = await getUserSquads(ctx.chatId);
    
    if (squads.length === 0) {
      await ctx.bot.sendMessage(ctx.chatId, getErrorMessage('NO_SQUAD'), { parse_mode: 'Markdown' });
      return;
    }

    const squadId = squads[0].squadId;

    // Get membership to check role
    const { prisma } = await import('@/lib/db');
    const membership = await prisma.squadMember.findFirst({
      where: { userId: identity.userId, squadId },
    });
    const isCaptain = isSquadLeader(membership?.role);
    if (!isCaptain) {
      await ctx.bot.sendMessage(ctx.chatId, getErrorMessage('NOT_CAPTAIN'), { parse_mode: 'Markdown' });
      return;
    }

    // Get availability for this squad
    const availability = await prisma.squadAvailability.findMany({
      where: { squadId },
      include: { user: true },
    });

    // Group by day - use isAvailable (not available)
    const byDay: Record<number, string[]> = {
      0: [], // Sunday
      2: [], // Tuesday
      6: [], // Saturday
    };

    for (const a of availability) {
      if (a.isAvailable) {
        const name = a.user.name ?? a.user.email ?? 'Unknown';
        byDay[a.dayOfWeek].push(name);
      }
    }

    const dayNames = ['Sunday', 'Tuesday', 'Saturday'];
    let message = `📋 *${squads[0].squadName}* Roster\n\n`;

    for (const [dayIdx, dayName] of dayNames.entries()) {
      const dayKey = [0, 2, 6][dayIdx];
      const players = byDay[dayKey];
      message += `*${dayName}:* ${players.length > 0 ? players.join(', ') : '_No availability yet_'}\n`;
    }

    await ctx.bot.sendMessage(ctx.chatId, message, { parse_mode: 'Markdown' });
  }
}