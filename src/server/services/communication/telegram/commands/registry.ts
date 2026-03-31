import type { TelegramCommand } from '../types';
import type TelegramBot from 'node-telegram-bot-api';

/**
 * Command Registry
 * DRY: Auto-discovers and registers all commands
 * PREVENT BLOAT: Single place to manage all commands
 */

// Import commands - DRY: Auto-discovery pattern
// CONSOLIDATION: Only include commands that belong in modular format
// - /log, /fee kept in legacy (sophisticated workflows)
// - /link, /unlink now under /account group (telegram.ts)
import { StatsCommand } from './stats';
import { AvailableCommand } from './availability';
import { RosterCommand } from './roster';
import { HelpCommand } from './help';

/**
 * All available commands
 * ORGANIZED: Single source of truth for command list
 * CONSOLIDATION: Link/unlink moved to /account group in telegram.ts
 */
export const COMMANDS: TelegramCommand[] = [
  // Simple commands (modular - straightforward, no complex workflows)
  new StatsCommand(),
  new AvailableCommand(),
  new RosterCommand(),
  new HelpCommand(),
  // CONSOLIDATION: /log, /fee, /link, /unlink remain in legacy telegram.ts
  // - /log has draft->confirm/cancel flow with expiry
  // - /fee has approve/reject callback workflow
  // - /link, /unlink now under /account group
];

/**
 * Get command by pattern
 * CLEAN: Lookup helper
 */
export function getCommandByPattern(pattern: RegExp): TelegramCommand | undefined {
  return COMMANDS.find(cmd => cmd.pattern.source === pattern.source);
}

/**
 * Build help text from all commands
 * ENHANCEMENT FIRST: Reuse command descriptions
 */
export function buildHelpText(): string {
  // ORGANIZED: Show grouped command structure for better UX
  return `📋 *Available Commands*

*Primary*
/start - Link or view your squad
/help - Show this help

*Squad Commands*
/squad log <score> - Submit match result
/squad stats - View squad stats
/squad available yes/no - Set availability
/squad roster - View squad availability
/squad fixtures - View upcoming matches

*Account Commands*
/account app - Open Mini App
/account profile - View profile
/account myteams - View all your squads
/account link - Link Telegram to SportWarren
/account unlink - Unlink Telegram

*AI Staff*
/ask <question> - Ask AI Staff

*Treasury (Captains)*
/treasury view - View treasury
/treasury fee - Submit fee request

_Use /start to get started_`;
}

/**
 * Register all commands with bot
 * MODULAR: Called once during bot setup
 */
export function registerCommands(bot: TelegramBot): void {
  for (const command of COMMANDS) {
    bot.onText(command.pattern, async (msg: TelegramBot.Message, match: RegExpMatchArray | null) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id?.toString();
      const args = match?.[1]?.trim();
      
      const { createCommandContext, resolveIdentity, checkRateLimit } = await import('../middleware/identity');
      
      // Check rate limit
      const rateLimit = command.getRateLimit?.();
      if (rateLimit && userId) {
        const limitResult = await checkRateLimit(userId, rateLimit.max, rateLimit.windowMs);
        if (!limitResult.allowed) {
          const waitSeconds = Math.ceil((limitResult.resetAt - Date.now()) / 1000);
          await bot.sendMessage(
            chatId,
            `⏳ *Slow down!* You've hit the limit. Try again in ${waitSeconds}s.`,
            { parse_mode: 'Markdown' }
          );
          return;
        }
      }
      
      // Create context and resolve identity
      const ctx = createCommandContext(bot, chatId, userId, msg, args);
      const identity = await resolveIdentity(chatId);
      
      // Execute command
      try {
        await command.execute(ctx, identity ?? undefined);
      } catch (error) {
        console.error(`Command error:`, error);
        await bot.sendMessage(
          chatId,
          '⚠️ Something went wrong. Please try again.',
          { parse_mode: 'Markdown' }
        );
      }
    });
  }
  
  console.log(`✅ Registered ${COMMANDS.length} commands`);
}