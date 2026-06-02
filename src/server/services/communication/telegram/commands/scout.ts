import type { TelegramCommand, CommandContext, ResolvedIdentity } from '../types';

type ScoutHandlers = {
  handleScoutRequest: (chatId: number, opponent: string, userId: string, squadId: string) => Promise<void>;
  sendMarkdown: (chatId: number, text: string) => Promise<unknown>;
};

export class ScoutCommand implements TelegramCommand {
  pattern = /\/scout(?:\s+(.+))?/;
  description = 'Get an AI scouting report on an opponent';

  constructor(private handlers?: ScoutHandlers) {}

  setHandlers(handlers: ScoutHandlers): void {
    this.handlers = handlers;
  }

  getRateLimit(): { max: number; windowMs: number } {
    return { max: 3, windowMs: 60_000 };
  }

  async execute(ctx: CommandContext, identity?: ResolvedIdentity): Promise<void> {
    const h = this.handlers;
    if (!h) return;

    const opponent = ctx.args?.trim();

    if (!opponent) {
      await h.sendMarkdown(ctx.chatId,
        [
          "🔍 *Scout an opponent*",
          "",
          "Get an AI-generated scouting report with tactical analysis.",
          "",
          "Usage: `/scout Red Lions`",
          "",
          "_Costs $0.10 USDC from your squad's agent budget._",
        ].join("\n")
      );
      return;
    }

    if (!identity) {
      await h.sendMarkdown(ctx.chatId, "⚠️ Link your account first. Use /start to get started.");
      return;
    }

    if (identity.squads.length === 0) {
      await h.sendMarkdown(ctx.chatId, "⚠️ You need to be in a squad to use scouting.");
      return;
    }

    const squadId = identity.squads[0].squadId;
    await h.handleScoutRequest(ctx.chatId, opponent, identity.userId, squadId);
  }
}

export const scoutCommand = new ScoutCommand();
