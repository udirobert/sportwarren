import { BaseCommand } from './base';
import type { CommandContext, ResolvedIdentity } from '../types';
import { parseTelegramMatchResult } from "../../telegram-match-parser";
import { submitMatchResult, MatchWorkflowError } from "@/server/services/match-workflow";
import { prisma } from "@/lib/db";
import { getUserSquads } from '../middleware/identity';
import { SUCCESS, getErrorMessage } from '../responses/errors';

/**
 * Log Command - Record match results
 * MODULAR: Own file, testable in isolation
 * 
 * NOTE: This is a simplified version. The main telegram.ts has more sophisticated
 * logic with match drafts and confirmations. This version works for linked users.
 */
export class LogCommand extends BaseCommand {
  pattern = /\/log(?:\s+(.+))?/;
  description = 'Log a match result (e.g., /log 4-2 win vs Red Lions)';

  getRateLimit() {
    return { max: 5, windowMs: 60000 }; // 5 per minute
  }

  async executeWithIdentity(ctx: CommandContext, identity: ResolvedIdentity): Promise<void> {
    const matchText = ctx.args;

    if (!matchText) {
      await ctx.bot.sendMessage(
        ctx.chatId,
        "Please include the result.\n\nExample: `/log 4-2 win vs Red Lions`",
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Parse the match result - returns null if invalid
    const parsed = parseTelegramMatchResult(matchText);
    
    if (!parsed) {
      await ctx.bot.sendMessage(
        ctx.chatId,
        `Couldn't parse that. Use format: /log [score] [result] vs [opponent]\n\nExample: /log 4-2 win vs Red Lions`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Get user's squad(s)
    const squads = await getUserSquads(ctx.chatId);
    
    if (squads.length === 0) {
      await ctx.bot.sendMessage(ctx.chatId, getErrorMessage('NO_SQUAD'), { parse_mode: 'Markdown' });
      return;
    }

    // Use first squad as home for now (simplified - opponent is away)
    const homeSquadId = squads[0].squadId;

    // Look up opponent squad by name
    const opponentSquad = await prisma.squad.findFirst({
      where: { name: { contains: parsed.opponent, mode: 'insensitive' } },
    });
    
    if (!opponentSquad) {
      await ctx.bot.sendMessage(
        ctx.chatId,
        `Squad "${parsed.opponent}" not found. Create it in the SportWarren app first.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    try {
      await submitMatchResult({
        prisma,
        homeSquadId,
        awaySquadId: opponentSquad.id,
        homeScore: parsed.teamScore,
        awayScore: parsed.opponentScore,
        submittedBy: identity.userId,
        matchDate: new Date(),
      });

      await ctx.bot.sendMessage(
        ctx.chatId,
        SUCCESS.MATCH_LOGGED(parsed.opponent, `${parsed.teamScore}-${parsed.opponentScore}`),
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Error logging match:', error);
      
      let errorMessage = 'Failed to log match. Please try again.';
      if (error instanceof MatchWorkflowError) {
        errorMessage = error.message;
      }
      
      await ctx.bot.sendMessage(
        ctx.chatId,
        errorMessage,
        { parse_mode: 'Markdown' }
      );
    }
  }
}