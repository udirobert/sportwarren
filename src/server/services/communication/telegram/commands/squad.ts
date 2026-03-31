import type { TelegramCommand, CommandContext, ResolvedIdentity } from '../types';

type SquadHandlers = {
  handleMatchLog: (chatId: number, matchText: string) => Promise<void>;
  handleStatsRequest: (chatId: number) => Promise<void>;
  handleAvailability: (chatId: number, args?: string) => Promise<void>;
  handleRoster: (chatId: number) => Promise<void>;
  handleFixturesRequest: (chatId: number) => Promise<void>;
  sendMarkdown: (chatId: number, text: string) => Promise<unknown>;
};

export class SquadCommand implements TelegramCommand {
  pattern = /\/squad(?:\s+(.+))?/;
  description = 'Squad commands (log, stats, available, roster, fixtures)';

  constructor(private handlers?: SquadHandlers) {}

  setHandlers(handlers: SquadHandlers): void {
    this.handlers = handlers;
  }

  async execute(ctx: CommandContext, _identity?: ResolvedIdentity): Promise<void> {
    const h = this.handlers;
    if (!h) return;

    const subcommand = ctx.args?.trim();

    if (!subcommand || subcommand === 'help') {
      await h.sendMarkdown(ctx.chatId,
        "*Squad Commands:*\n" +
        "/squad log <score> - Submit match\n" +
        "/squad stats - View stats\n" +
        "/squad available yes/no - Set availability\n" +
        "/squad roster - View squad availability\n" +
        "/squad fixtures - View upcoming matches"
      );
      return;
    }

    const [cmd, ...rest] = subcommand.split(' ');
    const argsStr = rest.join(' ');

    switch (cmd.toLowerCase()) {
      case 'log':
        if (argsStr) {
          await h.handleMatchLog(ctx.chatId, argsStr);
        } else {
          await h.sendMarkdown(ctx.chatId, "Usage: /squad log 4-2 win vs Red Lions");
        }
        break;
      case 'stats':
        await h.handleStatsRequest(ctx.chatId);
        break;
      case 'available':
        await h.handleAvailability(ctx.chatId, argsStr || undefined);
        break;
      case 'roster':
        await h.handleRoster(ctx.chatId);
        break;
      case 'fixtures':
        await h.handleFixturesRequest(ctx.chatId);
        break;
      default:
        await h.sendMarkdown(ctx.chatId, `Unknown squad command: /squad ${cmd}. Try /squad help`);
    }
  }
}
