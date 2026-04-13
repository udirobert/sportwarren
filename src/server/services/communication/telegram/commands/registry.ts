import type { TelegramCommand } from '../types';
import type TelegramBot from 'node-telegram-bot-api';

/**
 * Command Registry
 * DRY: Auto-discovers and registers all commands
 * PREVENT BLOAT: Single place to manage all commands
 */

// Simple commands (modular - straightforward)
import { StatsCommand } from './stats';
import { AvailableCommand } from './availability';
import { RsvpCommand } from './rsvp';
import { PaidCommand } from './paid';
import { RosterCommand } from './roster';
import { HelpCommand } from './help';

// Grouped commands (complex routing)
import { SquadCommand } from './squad';
import { AccountCommand } from './account';
import { TreasuryCommand } from './treasury-cmd';
import { AskCommand } from './ask';

// Singleton command instances for handler wiring
export const squadCommand = new SquadCommand();
export const accountCommand = new AccountCommand();
export const treasuryCommand = new TreasuryCommand();
export const askCommand = new AskCommand();

/**
 * All available commands
 * ORGANIZED: Single source of truth for command list
 */
export const COMMANDS: TelegramCommand[] = [
  // Simple commands (straightforward, no complex workflows)
  new StatsCommand(),
  new AvailableCommand(),
  new RsvpCommand(),
  new PaidCommand(),
  new RosterCommand(),
  new HelpCommand(),

  // Grouped commands (route to subcommands, handlers wired via wireCommandHandlers)
  squadCommand,
  accountCommand,
  treasuryCommand,
  askCommand,
];

/**
 * Wire grouped command handlers from TelegramService
 * Called during service construction to connect commands to service methods
 */
export function wireCommandHandlers(handlers: {
  squad: {
    handleMatchLog: (chatId: number, matchText: string) => Promise<void>;
    handleStatsRequest: (chatId: number) => Promise<void>;
    handleAvailability: (chatId: number, args?: string) => Promise<void>;
    handleRoster: (chatId: number) => Promise<void>;
    handleFixturesRequest: (chatId: number) => Promise<void>;
    sendMarkdown: (chatId: number, text: string) => Promise<unknown>;
  };
  account: {
    handleMiniAppRequest: (chatId: number, tab: string, userId?: string) => Promise<void>;
    handleMyTeams: (chatId: number) => Promise<void>;
    handleAccountLink: (chatId: number, msg: any) => Promise<void>;
    handleAccountUnlink: (chatId: number, msg: any) => Promise<void>;
    sendMarkdown: (chatId: number, text: string) => Promise<unknown>;
  };
  treasury: {
    handleMiniAppRequest: (chatId: number, tab: string, userId?: string) => Promise<void>;
    handleFeeProposal: (chatId: number, args: string, user: any) => Promise<void>;
    sendMarkdown: (chatId: number, text: string) => Promise<unknown>;
    sendMessage: (chatId: number, text: string) => Promise<unknown>;
  };
  ask: {
    handleAiStaffQuery: (chatId: number, query: string) => Promise<void>;
    handleGeneralAiQuery: (chatId: number, text: string) => Promise<void>;
    sendMarkdown: (chatId: number, text: string) => Promise<unknown>;
  };
}): void {
  squadCommand.setHandlers(handlers.squad);
  accountCommand.setHandlers(handlers.account);
  treasuryCommand.setHandlers(handlers.treasury);
  askCommand.setHandlers(handlers.ask);
}

/**
 * Get command by pattern
 * CLEAN: Lookup helper
 */
export function getCommandByPattern(pattern: RegExp): TelegramCommand | undefined {
  return COMMANDS.find(cmd => cmd.pattern.source === pattern.source);
}

/**
 * Build unified help text
 * SINGLE SOURCE OF TRUTH for help messages
 */
export function buildHelpText(): string {
  return `📋 *Available Commands*

*Primary*
/start - Link or view your squad
/help - Show this help

*Squad Commands*
/squad log <score> - Submit match result
/squad stats - View squad stats
/rsvp yes/no - Confirm next match
/paid - Mark yourself as paid
/squad available yes/no - Set weekly preference
/squad roster - View availability list

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
/treasury fee <matchId> [amount] - Propose match fee

_Use /start to get started_`;
}

/**
 * Build the short welcome help message (used by /start when no squad linked)
 */
export function buildWelcomeMessage(): string {
  return [
    "Stop playing ghost matches.",
    "",
    "Log the score. Track your stats. Build your legacy.",
    "Every match. Every stat. Forever.",
    "",
    "Commands:",
    "/squad log 4-2 win vs Red Lions",
    "/squad stats — Squad Stats",
    "/squad fixtures — Upcoming Matches",
    "/account app — Open Mini App",
    "/account profile — Your Stats",
    "/ask coach — AI Analysis",
    "/treasury — Squad Economy",
    "/help — Show all commands",
    "",
    "Linking:",
    "Captains can link group chats from Settings > Connections > Telegram for squad-wide commands.",
  ].join("\n");
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

  // Legacy aliases — execute grouped command actions directly
  bot.onText(/\/app/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id?.toString();
    const { createCommandContext } = await import('../middleware/identity');
    const ctx = createCommandContext(bot, chatId, userId, msg, 'app');
    await accountCommand.execute(ctx);
  });

  bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id?.toString();
    const { createCommandContext } = await import('../middleware/identity');
    const ctx = createCommandContext(bot, chatId, userId, msg, 'profile');
    await accountCommand.execute(ctx);
  });

  bot.onText(/\/myteams/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id?.toString();
    const { createCommandContext } = await import('../middleware/identity');
    const ctx = createCommandContext(bot, chatId, userId, msg, 'myteams');
    await accountCommand.execute(ctx);
  });

  console.log(`✅ Registered ${COMMANDS.length} commands + 3 legacy aliases`);
}
