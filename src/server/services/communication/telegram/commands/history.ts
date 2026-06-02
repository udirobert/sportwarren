import { BaseCommand } from './base';
import type { CommandContext, ResolvedIdentity } from '../types';
import { prisma } from "@/lib/db";
import { getUserSquads } from '../middleware/identity';
import { getErrorMessage } from '../responses/errors';

export class HistoryCommand extends BaseCommand {
  pattern = /\/history(?:\s+(.+))?/;
  description = 'View recent match results';

  async executeWithIdentity(ctx: CommandContext, identity: ResolvedIdentity): Promise<void> {
    const squads = await getUserSquads(ctx.chatId);

    if (squads.length === 0) {
      await ctx.bot.sendMessage(ctx.chatId, getErrorMessage('NO_SQUAD'), { parse_mode: 'Markdown' });
      return;
    }

    let squad = squads[0];
    if (ctx.args && squads.length > 1) {
      const found = squads.find(s => s.squadName.toLowerCase().includes(ctx.args!.toLowerCase()));
      if (found) squad = found;
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { homeSquadId: squad.squadId },
          { awaySquadId: squad.squadId },
        ],
        status: { in: ['verified', 'finalized'] },
      },
      orderBy: { matchDate: 'desc' },
      take: 5,
      include: {
        homeSquad: { select: { name: true } },
        awaySquad: { select: { name: true } },
      },
    });

    if (matches.length === 0) {
      await ctx.bot.sendMessage(ctx.chatId, `No matches recorded for *${squad.squadName}* yet.`, { parse_mode: 'Markdown' });
      return;
    }

    const lines = matches.map((m) => {
      const isHome = m.homeSquadId === squad.squadId;
      const ourScore = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
      const theirScore = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
      const opponent = isHome ? m.awaySquad.name : m.homeSquad.name;
      const result = ourScore > theirScore ? 'W' : ourScore < theirScore ? 'L' : 'D';
      const date = m.matchDate
        ? new Date(m.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : '—';
      return `${result === 'W' ? '✅' : result === 'L' ? '❌' : '🤝'} ${date}  ${ourScore}-${theirScore} vs ${opponent}`;
    });

    const message = `📋 *${squad.squadName}* — Last ${matches.length} matches\n\n${lines.join('\n')}`;
    await ctx.bot.sendMessage(ctx.chatId, message, { parse_mode: 'Markdown' });
  }
}
