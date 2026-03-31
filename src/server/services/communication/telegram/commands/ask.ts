import type { TelegramCommand, CommandContext, ResolvedIdentity } from '../types';

type AskHandlers = {
  handleAiStaffQuery: (chatId: number, query: string) => Promise<void>;
  handleGeneralAiQuery: (chatId: number, text: string) => Promise<void>;
  sendMarkdown: (chatId: number, text: string) => Promise<unknown>;
};

export class AskCommand implements TelegramCommand {
  pattern = /\/ask(?:\s+(.+))?/;
  description = 'Ask AI Staff a question';

  constructor(private handlers?: AskHandlers) {}

  setHandlers(handlers: AskHandlers): void {
    this.handlers = handlers;
  }

  getRateLimit(): { max: number; windowMs: number } {
    return { max: 10, windowMs: 60_000 };
  }

  async execute(ctx: CommandContext, _identity?: ResolvedIdentity): Promise<void> {
    const h = this.handlers;
    if (!h) return;

    const query = ctx.args?.trim();

    if (!query) {
      await h.sendMarkdown(ctx.chatId,
        [
          "Ask our AI Staff anything about your squad.",
          "",
          "Examples:",
          "/ask Coach what formation should we use?",
          "/ask Scout analyze Red Lions",
          "/ask Physio who needs rest?",
          "/ask Analyst show my shooting stats",
          "",
          "Available staff: Coach, Scout, Physio, Analyst, Commercial",
        ].join("\n")
      );
      return;
    }

    await h.handleAiStaffQuery(ctx.chatId, query);
  }
}

/**
 * General AI chat handler for non-command messages.
 * Registered separately as a message handler, not a command.
 */
export function setupGeneralChatHandler(
  bot: any,
  handleGeneralAiQuery: (chatId: number, text: string) => Promise<void>
): void {
  bot.on("message", async (msg: any) => {
    if (msg.text?.startsWith("/") || !msg.text) return;
    await handleGeneralAiQuery(msg.chat.id, msg.text);
  });
}
