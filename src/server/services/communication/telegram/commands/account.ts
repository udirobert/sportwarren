import type { TelegramCommand, CommandContext, ResolvedIdentity } from '../types';

type AccountHandlers = {
  handleMiniAppRequest: (chatId: number, tab: string, userId?: string) => Promise<void>;
  handleMyTeams: (chatId: number) => Promise<void>;
  handleAccountLink: (chatId: number, msg: any) => Promise<void>;
  handleAccountUnlink: (chatId: number, msg: any) => Promise<void>;
  sendMarkdown: (chatId: number, text: string) => Promise<unknown>;
};

export class AccountCommand implements TelegramCommand {
  pattern = /\/account(?:\s+(.+))?/;
  description = 'Account commands (app, profile, myteams, link, unlink)';

  constructor(private handlers?: AccountHandlers) {}

  setHandlers(handlers: AccountHandlers): void {
    this.handlers = handlers;
  }

  async execute(ctx: CommandContext, _identity?: ResolvedIdentity): Promise<void> {
    const h = this.handlers;
    if (!h) return;

    const subcommand = ctx.args?.trim();

    if (!subcommand || subcommand === 'help') {
      await h.sendMarkdown(ctx.chatId,
        "*Account Commands:*\n" +
        "/account app - Open Mini App\n" +
        "/account profile - View profile\n" +
        "/account myteams - View all your squads\n" +
        "/account link - Generate link code\n" +
        "/account unlink - Unlink this chat"
      );
      return;
    }

    const [cmd] = subcommand.split(' ');

    switch (cmd.toLowerCase()) {
      case 'app':
        await h.handleMiniAppRequest(ctx.chatId, 'squad', ctx.userId);
        break;
      case 'profile':
        await h.handleMiniAppRequest(ctx.chatId, 'profile', ctx.userId);
        break;
      case 'myteams':
        await h.handleMyTeams(ctx.chatId);
        break;
      case 'link':
        await h.handleAccountLink(ctx.chatId, ctx.message);
        break;
      case 'unlink':
        await h.handleAccountUnlink(ctx.chatId, ctx.message);
        break;
      default:
        await h.sendMarkdown(ctx.chatId, `Unknown account command: /account ${cmd}. Try /account help`);
    }
  }
}
