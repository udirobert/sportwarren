import type { TelegramCommand, CommandContext, ResolvedIdentity } from '../types';

type TreasuryHandlers = {
  handleMiniAppRequest: (chatId: number, tab: string, userId?: string) => Promise<void>;
  handleFeeProposal: (chatId: number, args: string, user: any) => Promise<void>;
  sendMarkdown: (chatId: number, text: string) => Promise<unknown>;
  sendMessage: (chatId: number, text: string) => Promise<unknown>;
};

export class TreasuryCommand implements TelegramCommand {
  pattern = /\/treasury(?:\s+(.+))?/;
  description = 'Treasury commands (view, fee)';

  constructor(private handlers?: TreasuryHandlers) {}

  setHandlers(handlers: TreasuryHandlers): void {
    this.handlers = handlers;
  }

  async execute(ctx: CommandContext, _identity?: ResolvedIdentity): Promise<void> {
    const h = this.handlers;
    if (!h) return;

    const subcommand = ctx.args?.trim();

    if (!subcommand || subcommand === 'help') {
      await h.sendMarkdown(ctx.chatId,
        "*Treasury Commands:*\n" +
        "/treasury view - Open treasury\n" +
        "/treasury fee <matchId> [amount] - Propose fee"
      );
      return;
    }

    const [cmd, ...rest] = subcommand.split(' ');
    const argsStr = rest.join(' ');

    switch (cmd.toLowerCase()) {
      case 'view':
        await h.handleMiniAppRequest(ctx.chatId, 'treasury', ctx.userId);
        break;
      case 'fee':
        if (argsStr) {
          await h.handleFeeProposal(ctx.chatId, argsStr, ctx.message?.from);
        } else {
          await h.sendMessage(ctx.chatId, "Usage: /treasury fee <matchId> [amount]");
        }
        break;
      default:
        await h.sendMarkdown(ctx.chatId, `Unknown treasury command: /treasury ${cmd}. Try /treasury help`);
    }
  }
}
