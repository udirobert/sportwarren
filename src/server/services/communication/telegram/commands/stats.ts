import { BaseCommand } from './base';
import type { CommandContext, ResolvedIdentity } from '../types';
import { prisma } from "@/lib/db";
import { getUserSquads } from '../middleware/identity';
import { getErrorMessage } from '../responses/errors';

/**
 * Stats Command - View squad statistics
 */
export class StatsCommand extends BaseCommand {
  pattern = /\/stats(?:\s+(.+))?/;
  description = 'View your squad statistics';

  async executeWithIdentity(ctx: CommandContext, identity: ResolvedIdentity): Promise<void> {
    const squads = await getUserSquads(ctx.chatId);
    
    if (squads.length === 0) {
      await ctx.bot.sendMessage(ctx.chatId, getErrorMessage('NO_SQUAD'), { parse_mode: 'Markdown' });
      return;
    }

    // Find squad (by name arg or single squad)
    let squad = squads[0];
    if (ctx.args && squads.length > 1) {
      const found = squads.find(s => s.squadName.toLowerCase().includes(ctx.args!.toLowerCase()));
      if (found) squad = found;
    }

    // Get all finalized/verified matches for this squad
    const squadMatches = await prisma.match.findMany({
      where: {
        OR: [
          { homeSquadId: squad.squadId },
          { awaySquadId: squad.squadId },
        ],
        status: { in: ['verified', 'finalized'] },
      },
      select: { homeSquadId: true, awaySquadId: true, homeScore: true, awayScore: true },
    });

    const matches = squadMatches.length;

    // Calculate wins/losses/draws from match scores
    let winsCount = 0;
    let lossesCount = 0;
    let drawsCount = 0;
    
    for (const match of squadMatches) {
      const isHome = match.homeSquadId === squad.squadId;
      const ourScore = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
      const theirScore = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);
      
      if (ourScore > theirScore) winsCount++;
      else if (ourScore < theirScore) lossesCount++;
      else drawsCount++;
    }

    // Note: Can't filter by computed result in Prisma - need to fetch and compute
    // For now, show total matches and let users see results in match list
    const winRate = matches > 0 ? Math.round((winsCount / matches) * 100) : 0;
    const lossRate = matches > 0 ? Math.round((lossesCount / matches) * 100) : 0;
    const drawRate = matches > 0 ? Math.round((drawsCount / matches) * 100) : 0;

    const message = `📊 *${squad.squadName}* Stats

• *Matches:* ${matches}
• *Wins:* ${winsCount} (${winRate}%)
• *Draws:* ${drawsCount}
• *Losses:* ${lossesCount}

_Use /app for detailed analytics_`;

    await ctx.bot.sendMessage(ctx.chatId, message, { parse_mode: 'Markdown' });
  }
}