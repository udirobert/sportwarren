import { BaseCommand } from './base';
import type { CommandContext, ResolvedIdentity } from '../types';
import { buildHelpText } from './registry';

/**
 * Help Command
 * ENHANCEMENT FIRST: Reuses registry for command list
 */
export class HelpCommand extends BaseCommand {
  pattern = /\/help/;
  description = 'Show available commands';

  async executeWithIdentity(ctx: CommandContext, identity: ResolvedIdentity): Promise<void> {
    const helpText = buildHelpText();
    await ctx.bot.sendMessage(ctx.chatId, helpText, { parse_mode: 'Markdown' });
  }
}