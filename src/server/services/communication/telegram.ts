import { randomBytes } from "crypto";
import { generateInference } from "@/lib/ai/inference";
import { AGENT_PERSONAS } from "../ai/prompts";
import TelegramBot from "node-telegram-bot-api";
import { prisma } from "@/lib/db";

// Modular commands (DRY: Auto-discovered command registry)
import { registerCommands } from "./telegram/commands/registry";

import {
  getSquadMembership,
  getUserActiveMemberships,
  isSquadLeader,
} from "@/server/services/permissions";
import { submitMatchResult } from "../match-workflow";
import {
  buildTelegramMiniAppUrl,
  connectTelegramChatByToken,
  createIdentityMiniAppSession,
  extractTelegramConnectToken,
  findPlatformIdentityByChatId,
  findSquadGroupByChatId,
  isTelegramConnectToken,
} from "./platform-connections";
import {
  parseTelegramMatchResult,
  type ParsedTelegramMatchResult,
} from "./telegram-match-parser";
import {
  buildVerificationNudgeMessage,
  shouldSendNudge,
} from "@/lib/telegram/verification-nudge";
import {
  cancelPendingTreasuryActivity,
  ensureSquadTreasury,
  recordPendingTreasuryActivity,
  settlePendingTreasuryActivity,
  TreasuryBalanceError,
} from "../economy/treasury-ledger";

interface PendingMatchDraft extends ParsedTelegramMatchResult {
  id: string;
  chatId: number;
  squadId: string;
  submittedBy: string;
  createdAt: number;
}

type LinkedSquadGroup = NonNullable<
  Awaited<ReturnType<typeof findSquadGroupByChatId>>
>;
type AuthorizedSquadGroup = LinkedSquadGroup & {
  platformUserId: string;
  userId: string;
};
type AuthorizedTelegramCaptainActor =
  | { error: string }
  | {
      squadGroup: AuthorizedSquadGroup;
      membership: NonNullable<Awaited<ReturnType<typeof getSquadMembership>>>;
    };

const MATCH_DRAFT_TTL_MS = 15 * 60 * 1000;
const MATCH_FEE_TON = 1;
const GENERAL_CHAT_MEMORY_LIMIT = 6;
const GENERAL_CHAT_MEMORY_TTL_MS = 60 * 60 * 1000;

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_LOG_MAX = 5; // Max 5 /log commands per minute
const RATE_LIMIT_ASK_MAX = 10; // Max 10 /ask commands per minute

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface GeneralChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface TelegramRedisStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

function readMetadataString(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export class TelegramService {
  private bot: TelegramBot;
  private redisService: TelegramRedisStore | null;
  private pendingMatchDrafts = new Map<string, PendingMatchDraft>();
  private generalChatMemory = new Map<number, GeneralChatMessage[]>();
  // In-memory rate limiting (userId -> { command: count })
  private rateLimitLog = new Map<string, number[]>();
  private rateLimitAsk = new Map<string, number[]>();

  constructor(redisService: TelegramRedisStore | null = null) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
    }

    this.redisService = redisService;

    const useWebhook = process.env.TELEGRAM_WEBHOOK_URL?.trim();

    this.bot = new TelegramBot(token, { polling: !useWebhook });

    if (!useWebhook) {
      this.bot.on("polling_error", (error: Error) => {
        if (!error.message.includes("409 Conflict")) {
          console.error("Telegram polling error:", error.message);
        }
      });
    }

    this.setupCommands();
    this.setupEventHandlers();

    // MODULAR: Register modular commands (DRY: Auto-discovery)
    registerCommands(this.bot);
  }

  getBot(): TelegramBot {
    return this.bot;
  }

  // Helper to send messages with Markdown parsing
  private async sendMarkdown(chatId: number, text: string, options?: TelegramBot.SendMessageOptions): Promise<TelegramBot.Message> {
    return this.bot.sendMessage(chatId, text, { parse_mode: "Markdown", ...options });
  }

  async setWebhook(webhookUrl: string): Promise<void> {
    try {
      await this.bot.setWebHook(webhookUrl);
      console.log(`✅ Telegram webhook set to ${webhookUrl}`);
    } catch (error) {
      console.error("❌ Failed to set Telegram webhook:", error);
      throw error;
    }
  }

  async deleteWebhook(): Promise<void> {
    try {
      await this.bot.deleteWebHook();
      console.log("✅ Telegram webhook deleted");
    } catch (error) {
      console.error("❌ Failed to delete Telegram webhook:", error);
    }
  }

  private setupCommands(): void {
    // ORGANIZED: Grouped commands for better UX
    // Telegram supports hierarchical commands: /group shows children in menu
    this.bot
      .setMyCommands([
        // === PRIMARY COMMANDS (always visible) ===
        {
          command: "start",
          description: "Link or view your squad",
        },
        {
          command: "help",
          description: "Show all commands",
        },
        // === SQUAD GROUP ===
        { command: "squad", description: "Squad commands" }, // Parent
        { command: "squad log", description: "Submit match result" },
        { command: "squad stats", description: "View squad stats" },
        { command: "squad available", description: "Set availability" },
        { command: "squad roster", description: "View availability" },
        { command: "squad fixtures", description: "View fixtures" },
        // === ACCOUNT GROUP ===
        { command: "account", description: "Account commands" }, // Parent
        { command: "account app", description: "Open Mini App" },
        { command: "account profile", description: "View profile" },
        { command: "account myteams", description: "View all squads" },
        { command: "account link", description: "Link Telegram to SportWarren" },
        { command: "account unlink", description: "Unlink Telegram from SportWarren" },
        // === AI GROUP ===
        { command: "ask", description: "Ask AI Staff (e.g. /ask Coach)" }, // Single command
        // === TREASURY GROUP (captains only) ===
        { command: "treasury", description: "Treasury commands" }, // Parent
        { command: "treasury view", description: "Open treasury" },
        { command: "treasury fee", description: "Propose match fee" },
      ])
      .catch((error: Error) => {
        console.warn("Failed to register Telegram commands:", error.message);
      });
  }

  private setupEventHandlers(): void {
    this.bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const startParam = match?.[1]?.trim();
      console.log(`[TELEGRAM] /start received chatId=${chatId}`);

      try {
        await this.bot.sendChatAction(chatId, "typing");

        if (startParam && isTelegramConnectToken(startParam)) {
          await this.handleConnectStart(
            chatId,
            extractTelegramConnectToken(startParam),
            msg.from,
          );
          return;
        }

        const squadGroup = await this.requireLinkedChat(chatId);
        if (squadGroup?.squadId) {
          const summary = await this.buildSquadSummaryCard(squadGroup.squadId);
          await this.sendMarkdown(chatId, summary);
          console.log(`[TELEGRAM] /start sent squad summary chatId=${chatId}`);
          return;
        }

        await this.sendMarkdown(chatId, this.buildHelpMessage());
        console.log(`[TELEGRAM] /start sent help chatId=${chatId}`);
      } catch (error) {
        console.error(`[TELEGRAM] /start failed chatId=${chatId}:`, error);
        await this.bot.sendMessage(
          chatId,
          "SportWarren is warming up. Try /app in a moment.",
        );
      }
    });

    this.bot.onText(/\/log(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id?.toString();
      const matchText = match?.[1]?.trim();

      // Rate limit check
      if (userId) {
        const rateLimit = this.checkRateLimit(userId, this.rateLimitLog, RATE_LIMIT_LOG_MAX);
        if (!rateLimit.allowed) {
          const waitSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
          await this.sendMarkdown(
            chatId,
            `⏳ *Slow down!* You've hit the limit for /log. Try again in ${waitSeconds}s.`,
          );
          return;
        }
      }

      if (!matchText) {
        await this.sendMarkdown(
          chatId,
          "⚽ Please include the result.\n\nExample: `/log 4-2 win vs Red Lions`",
        );
        return;
      }

      await this.handleMatchLog(chatId, matchText);
    });

    this.bot.onText(/\/fixtures/, async (msg) => {
      await this.handleFixturesRequest(msg.chat.id);
    });

    // === GROUPED COMMAND HANDLERS (squad.*, account.*, treasury.*) ===
    
    // Squad group
    this.bot.onText(/\/squad(?:\s+(.+))?/, async (msg, match) => {
      const subcommand = match?.[1]?.trim();
      const chatId = msg.chat.id;
      
      if (!subcommand || subcommand === 'help') {
        await this.sendMarkdown(chatId, 
          "*Squad Commands:*\n" +
          "/squad log <score> - Submit match\n" +
          "/squad stats - View stats\n" +
          "/squad available yes/no - Set availability\n" +
          "/squad roster - View squad availability\n" +
          "/squad fixtures - View upcoming matches"
        );
        return;
      }
      
      // Route to appropriate handler
      const [cmd, ...args] = subcommand.split(' ');
      const argsStr = args.join(' ');
      
      switch (cmd.toLowerCase()) {
        case 'log':
          if (argsStr) {
            await this.handleMatchLog(chatId, argsStr);
          } else {
            await this.sendMarkdown(chatId, "Usage: /squad log 4-2 win vs Red Lions");
          }
          break;
        case 'stats':
          await this.handleStatsRequest(chatId);
          break;
        case 'available':
          await this.handleAvailability(chatId, argsStr || undefined);
          break;
        case 'roster':
          await this.handleRoster(chatId);
          break;
        case 'fixtures':
          await this.handleFixturesRequest(chatId);
          break;
        default:
          await this.sendMarkdown(chatId, `Unknown squad command: /squad ${cmd}. Try /squad help`);
      }
    });

    // Account group
    this.bot.onText(/\/account(?:\s+(.+))?/, async (msg, match) => {
      const subcommand = match?.[1]?.trim();
      const chatId = msg.chat.id;
      const userId = msg.from?.id?.toString();
      
      if (!subcommand || subcommand === 'help') {
        await this.sendMarkdown(chatId, 
          "*Account Commands:*\n" +
          "/account app - Open Mini App\n" +
          "/account profile - View profile\n" +
          "/account myteams - View all your squads\n" +
          "/account link - Generate link code\n" +
          "/account unlink - Unlink this chat"
        );
        return;
      }
      
      const [cmd, ...rest] = subcommand.split(' ');
      const args = rest.join(' ');
      
      switch (cmd.toLowerCase()) {
        case 'app':
          await this.handleMiniAppRequest(chatId, 'squad', userId);
          break;
        case 'profile':
          await this.handleMiniAppRequest(chatId, 'profile', userId);
          break;
        case 'myteams':
          await this.handleMyTeams(chatId);
          break;
        case 'link':
          await this.handleAccountLink(chatId, msg);
          break;
        case 'unlink':
          await this.handleAccountUnlink(chatId, msg);
          break;
        default:
          await this.sendMarkdown(chatId, `Unknown account command: /account ${cmd}. Try /account help`);
      }
    });

    // Treasury group
    this.bot.onText(/\/treasury(?:\s+(.+))?/, async (msg, match) => {
      const subcommand = match?.[1]?.trim();
      const chatId = msg.chat.id;
      
      if (!subcommand || subcommand === 'help') {
        await this.sendMarkdown(chatId, 
          "*Treasury Commands:*\n" +
          "/treasury view - Open treasury\n" +
          "/treasury fee <matchId> [amount] - Propose fee"
        );
        return;
      }
      
      const [cmd, ...args] = subcommand.split(' ');
      const argsStr = args.join(' ');
      
      switch (cmd.toLowerCase()) {
        case 'view':
          await this.handleMiniAppRequest(chatId, 'treasury', msg.from?.id?.toString());
          break;
        case 'fee':
          if (argsStr) {
            await this.handleFeeProposal(chatId, argsStr, msg.from);
          } else {
            await this.bot.sendMessage(chatId, "Usage: /treasury fee <matchId> [amount]");
          }
          break;
        default:
          await this.sendMarkdown(chatId, `Unknown treasury command: /treasury ${cmd}. Try /treasury help`);
      }
    });

    // Legacy flat commands (still work for backwards compatibility)
    this.bot.onText(/\/myteams/, async (msg) => {
      const chatId = msg.chat.id;
      await this.handleMyTeams(chatId);
    });

    this.bot.onText(/\/fee(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const args = match?.[1]?.trim();

      if (!args) {
        await this.bot.sendMessage(
          chatId,
          "Usage: /fee <matchId> [amount]\n\nExample: /fee abc123 2\n\nProposes a match fee (in TON) to be paid from the squad treasury.",
        );
        return;
      }

      await this.handleFeeProposal(chatId, args, msg.from);
    });

    this.bot.onText(/\/treasury/, async (msg) => {
      await this.handleMiniAppRequest(msg.chat.id, "treasury", msg.from?.id?.toString());
    });

    this.bot.onText(/\/app/, async (msg) => {
      await this.handleMiniAppRequest(msg.chat.id, "squad", msg.from?.id?.toString());
    });

    this.bot.onText(/\/profile/, async (msg) => {
      await this.handleMiniAppRequest(msg.chat.id, "profile", msg.from?.id?.toString());
    });

    this.bot.onText(/\/ask(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id?.toString();
      const query = match?.[1]?.trim();

      // Rate limit check
      if (userId) {
        const rateLimit = this.checkRateLimit(userId, this.rateLimitAsk, RATE_LIMIT_ASK_MAX);
        if (!rateLimit.allowed) {
          const waitSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
          await this.sendMarkdown(
            chatId,
            `⏳ *Slow down!* You've hit the limit for /ask. Try again in ${waitSeconds}s.`,
          );
          return;
        }
      }

      if (!query) {
        await this.sendMarkdown(
          chatId,
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
          ].join("\n"),
        );
        return;
      }

      await this.handleAiStaffQuery(chatId, query);
    });

    this.bot.on("inline_query", async (query) => {
      await this.handleInlineQuery(query);
    });

    this.bot.on("callback_query", async (query) => {
      await this.handleCallbackQuery(query);
    });

    this.bot.on("message", async (msg) => {
      if (msg.text?.startsWith("/") || !msg.text) return;
      console.log(
        `[TELEGRAM] general message received chatId=${msg.chat.id} text=${JSON.stringify(msg.text.slice(0, 120))}`,
      );
      await this.handleGeneralAiQuery(msg.chat.id, msg.text);
    });
  }

  private buildHelpMessage(): string {
    return [
      "Stop playing ghost matches.",
      "",
      "Log the score. Track your stats. Build your legacy.",
      "Every match. Every stat. Forever.",
      "",
      "Commands:",
      "/app — Open Mini App",
      "/profile — Your Stats",
      "/log 4-2 win vs Red Lions",
      "/stats — Squad Stats",
      "/fixtures — Upcoming Matches",
      "/treasury — Squad Economy",
      "/ask coach — AI Analysis",
      "/help — Show this message",
      "",
      "Linking:",
      "Captains can link group chats from Settings > Connections > Telegram for squad-wide commands.",
    ].join("\n");
  }

  private async handleMiniAppRequest(
    chatId: number,
    tab: "squad" | "match" | "profile" | "treasury" | "ai" = "squad",
    telegramUserId?: string,
  ): Promise<void> {
    // Try user-scoped identity first, fall back to group-scoped
    const identity = await this.resolvePlatformIdentity(chatId, telegramUserId);

    if (!identity) {
      const onboardingUrl = buildTelegramMiniAppUrl({ mode: "onboarding" });
      const keyboard = onboardingUrl
        ? {
            inline_keyboard: [
              [
                {
                  text: "Start Your Legacy ⚽",
                  web_app: { url: onboardingUrl },
                },
              ],
            ],
          }
        : undefined;

      await this.sendMarkdown(
        chatId,
        [
          "Stop playing ghost matches.",
          "",
          "Log matches in 30 seconds. Stats that level up like FIFA. Banter with AI coaches.",
          "Every match. Every stat. Forever.",
          "",
          keyboard
            ? "Tap below to create or join a squad — everything happens right here in Telegram."
            : "Mini App launch is unavailable right now. Ask support to configure NEXT_PUBLIC_CLIENT_URL or CLIENT_URL.",
        ].join("\n"),
        keyboard ? { reply_markup: keyboard } : undefined,
      );
      return;
    }

    const memberships = identity.user.squads;
    const activeSquadId = identity.activeSquadId;
    const activeSquad = activeSquadId
      ? memberships.find((m) => m.squad.id === activeSquadId)?.squad
      : memberships[0]?.squad;

    if (!activeSquad) {
      const onboardingUrl = buildTelegramMiniAppUrl({ mode: "onboarding" });
      const keyboard = onboardingUrl
        ? {
            inline_keyboard: [
              [
                {
                  text: "Create or Join a Squad ⚽",
                  web_app: { url: onboardingUrl },
                },
              ],
            ],
          }
        : undefined;

      await this.bot.sendMessage(
        chatId,
        [
          "Stop playing ghost matches.",
          "",
          "You're in, but you need a squad. Log matches in 30 seconds. Build your legacy.",
          "Every match. Every stat. Forever.",
          keyboard
            ? "Tap below to create or join a squad."
            : "Mini App launch is unavailable right now. Ask support to configure NEXT_PUBLIC_CLIENT_URL or CLIENT_URL.",
        ].join("\n"),
        keyboard ? { reply_markup: keyboard } : undefined,
      );
      return;
    }

    try {
      const session = await createIdentityMiniAppSession(prisma, identity.id, activeSquad.id);
      const urlWithTab = `${session.url}&tab=${tab}`;

      const tabLabels: Record<string, string> = {
        squad: "Squad Dashboard",
        match: "Match Center",
        profile: "Player Profile",
        treasury: "Treasury",
        ai: "AI Staff",
      };

      const tabEmojis: Record<string, string> = {
        squad: "🏠",
        match: "⚽",
        profile: "👤",
        treasury: "💰",
        ai: "🤖",
      };

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: `${tabEmojis[tab]} Open ${tabLabels[tab]}`,
              web_app: { url: urlWithTab },
            },
          ],
        ],
      };

      const descriptions: Record<string, string> = {
        squad: "View your squad dashboard, form, and AI insights.",
        match: "Log matches, verify results, and track XP gains.",
        profile: "View your FIFA-style attributes and progression.",
        treasury: "Connect TON wallet and manage squad finances.",
        ai: "Chat with AI staff for tactical and commercial guidance.",
      };

      const squadLabel = memberships.length > 1
        ? `${activeSquad.name} (${memberships.length} squads)`
        : activeSquad.name || "Squad";

      await this.bot.sendMessage(
        chatId,
        [
          `${tabEmojis[tab]} ${squadLabel} — ${tabLabels[tab]}`,
          "",
          descriptions[tab],
          "",
          "Every match. Every stat. Forever.",
        ].join("\n"),
        { reply_markup: keyboard },
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The Telegram Mini App is not configured on this deployment.";
      await this.bot.sendMessage(chatId, message);
    }
  }

  private async handleAiStaffQuery(
    chatId: number,
    query: string,
  ): Promise<void> {
    const squadGroup = await this.requireLinkedChat(chatId);
    if (!squadGroup?.squadId) {
      await this.bot.sendMessage(
        chatId,
        "Link this chat from SportWarren Settings before using AI Staff.",
      );
      return;
    }

    // Parse the query to identify the staff member
    const staffPatterns: Record<string, RegExp> = {
      coach: /^coach\s+/i,
      scout: /^scout\s+/i,
      physio: /^physio\s+/i,
      analyst: /^analyst\s+/i,
      commercial: /^commercial\s+/i,
    };

    let staffMember = "coach"; // default
    let cleanQuery = query;

    for (const [staff, pattern] of Object.entries(staffPatterns)) {
      if (pattern.test(query)) {
        staffMember = staff;
        cleanQuery = query.replace(pattern, "").trim();
        break;
      }
    }

    // Send typing indicator
    await this.bot.sendChatAction(chatId, "typing");

    try {
      const squadStats = await this.getSquadStatsForAi(squadGroup.squadId);

      // Use unified prioritized inference
      const systemPrompt = AGENT_PERSONAS[staffMember.toUpperCase() as keyof typeof AGENT_PERSONAS]?.systemPrompt 
        || AGENT_PERSONAS.COACH_KITE.systemPrompt;

      const aiResponse = await generateInference([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Squad Context: ${JSON.stringify(squadStats)}. User Query: ${cleanQuery}` }
      ]);

      if (aiResponse) {
        await this.bot.sendMessage(chatId, aiResponse.content);
        return;
      }

      // Fallback to static templates if AI fails
      const staffResponses: Record<string, (q: string, stats: any) => string> =
        {
          coach: (_q, stats) =>
            [
              `🎯 Coach Analysis`,
              "",
              `Based on your ${stats.matches} recent matches (${stats.form}):`,
              "",
              stats.winRate > 60
                ? "Your current approach is working well. Keep the momentum going."
                : stats.winRate < 40
                  ? "Consider adjusting your tactics. The current setup isn't producing results."
                  : "Solid foundation, but there's room for improvement in the final third.",
              "",
              `Try the Mini App for detailed tactical adjustments.`,
            ].join("\n"),

          scout: (q, _stats) =>
            [
              `🔍 Scout Report`,
              "",
              `Query: "${q}"`,
              "",
              `I'll analyze this opponent and prepare a report.`,
              `For detailed analysis, use the Mini App Match Center.`,
            ].join("\n"),

          physio: (_q, stats) =>
            [
              `💪 Physio Report`,
              "",
              `Squad fitness overview:`,
              `• ${stats.matches} matches played recently`,
              `• Check individual sharpness in Player Profiles`,
              "",
              `Rest players with low sharpness before big matches.`,
            ].join("\n"),

          analyst: (_q, stats) =>
            [
              `📊 Performance Analysis`,
              "",
              `Season so far: ${stats.wins}W ${stats.draws}D ${stats.losses}L`,
              `Goals: ${stats.goalsFor} scored, ${stats.goalsAgainst} conceded`,
              `Win rate: ${stats.winRate}%`,
              "",
              `View detailed stats in the Mini App Profile tab.`,
            ].join("\n"),

          commercial: (_q, _stats) =>
            [
              `💼 Commercial Report`,
              "",
              `Squad treasury and finances are managed in the Mini App.`,
              `Use /treasury to open the TON wallet interface.`,
            ].join("\n"),
        };

      const response =
        staffResponses[staffMember]?.(cleanQuery, squadStats) ||
        `The ${staffMember} is reviewing your request. Use the Mini App for detailed insights.`;

      await this.bot.sendMessage(chatId, response);
    } catch (error) {
      console.error("AI Staff query error:", error);
      await this.bot.sendMessage(
        chatId,
        "AI staff is warming up. Try again in a moment.",
      );
    }
  }

  private async handleGeneralAiQuery(chatId: number, text: string): Promise<void> {
    await this.bot.sendChatAction(chatId, "typing");

    try {
      const linkedChat = await this.requireLinkedChat(chatId);
      const history = this.getGeneralChatHistory(chatId);
      const guidanceRules = [
        "You are the SportWarren assistant.",
        "Tone: direct, punchy, football-first. No corporate phrasing.",
        "Never call the user \"Boss\".",
        "Keep replies short (2-4 sentences).",
        "Style anchors: \"Stop ghost matches.\" / \"Log the score. Track your stats. Build your legacy.\" / \"Every match. Every stat. Forever.\"",
        linkedChat?.squadId
          ? "The user has a linked squad, so guide them to the most relevant next action."
          : "The user is new, so explain that /app opens Telegram-native onboarding where they can create or join a squad.",
        "If they ask how to open the Mini App, tell them to type /app.",
        "If they want to log a result, tell them to use /log 4-2 win vs Red Lions.",
        "If they want stats, tell them to use /stats or /stats Marcus.",
        "If they want fixtures, tell them to use /fixtures.",
        "If they want treasury or TON actions, tell them to use /treasury.",
        "If they want staff analysis, tell them to use /ask coach <question>.",
        "If the message is just a greeting, welcome them and suggest the single best next step.",
        "Treat follow-up questions as referring to the recent conversation if context is available.",
        "Do not pretend an action has already happened.",
      ].join("\n");

      const response = await generateInference([
        {
          role: "system",
          content: guidanceRules,
        },
        ...history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: "user" as const, content: text },
      ]);

      if (response?.content) {
        this.appendGeneralChatMessage(chatId, "user", text);
        this.appendGeneralChatMessage(chatId, "assistant", response.content);
        await this.sendMarkdown(chatId, response.content);
        console.log(`[TELEGRAM] general AI response sent chatId=${chatId}`);
        return;
      }

      console.warn(`[TELEGRAM] general AI empty response chatId=${chatId}`);
    } catch (error) {
      console.warn(`[TELEGRAM] general AI query failed chatId=${chatId}:`, error);
    }

    this.appendGeneralChatMessage(chatId, "user", text);
    const fallback = this.buildGeneralGuidanceFallback();
    this.appendGeneralChatMessage(chatId, "assistant", fallback);
    await this.sendMarkdown(chatId, fallback);
    console.log(`[TELEGRAM] general fallback sent chatId=${chatId}`);
  }

  private buildGeneralGuidanceFallback(): string {
    return [
      "SportWarren Telegram",
      "",
      "Type /app to open onboarding and get moving.",
      "Log the score. Track your stats. Build your legacy.",
    ].join("\n");
  }

  private getGeneralChatHistory(chatId: number): Array<Pick<GeneralChatMessage, "role" | "content">> {
    const cutoff = Date.now() - GENERAL_CHAT_MEMORY_TTL_MS;
    const recentMessages = (this.generalChatMemory.get(chatId) || [])
      .filter((message) => message.createdAt >= cutoff)
      .slice(-GENERAL_CHAT_MEMORY_LIMIT);

    if (recentMessages.length === 0) {
      this.generalChatMemory.delete(chatId);
      return [];
    }

    this.generalChatMemory.set(chatId, recentMessages);
    return recentMessages.map(({ role, content }) => ({ role, content }));
  }

  private appendGeneralChatMessage(
    chatId: number,
    role: GeneralChatMessage["role"],
    content: string,
  ): void {
    const existing = this.getGeneralChatHistory(chatId).map((message) => ({
      ...message,
      createdAt: Date.now(),
    }));
    existing.push({ role, content, createdAt: Date.now() });
    this.generalChatMemory.set(chatId, existing.slice(-GENERAL_CHAT_MEMORY_LIMIT));
  }

  private async getSquadStatsForAi(squadId: string): Promise<{
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    winRate: number;
    form: string;
  }> {
    const matches = await prisma.match.findMany({
      where: {
        status: { in: ["verified", "finalized"] },
        OR: [{ homeSquadId: squadId }, { awaySquadId: squadId }],
      },
      orderBy: { matchDate: "desc" },
      take: 10,
    });

    let wins = 0,
      draws = 0,
      losses = 0,
      goalsFor = 0,
      goalsAgainst = 0;
    const form: string[] = [];

    matches.forEach((match) => {
      const isHome = match.homeSquadId === squadId;
      const ourScore = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
      const theirScore = isHome
        ? (match.awayScore ?? 0)
        : (match.homeScore ?? 0);

      goalsFor += ourScore;
      goalsAgainst += theirScore;

      if (ourScore > theirScore) {
        wins++;
        form.push("W");
      } else if (ourScore < theirScore) {
        losses++;
        form.push("L");
      } else {
        draws++;
        form.push("D");
      }
    });

    const total = wins + draws + losses;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    return {
      matches: total,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      winRate,
      form: form.slice(0, 5).join(" ") || "No matches",
    };
  }

  private pruneExpiredDrafts(): void {
    const cutoff = Date.now() - MATCH_DRAFT_TTL_MS;
    for (const [draftId, draft] of this.pendingMatchDrafts.entries()) {
      if (draft.createdAt < cutoff) {
        this.pendingMatchDrafts.delete(draftId);
      }
    }
  }

  private createDraftId(): string {
    return randomBytes(6).toString("hex");
  }

  private getDraftKey(draftId: string): string {
    return `telegram:match-draft:${draftId}`;
  }

  private checkRateLimit(
    userId: string,
    limitMap: Map<string, number[]>,
    maxRequests: number,
  ): RateLimitResult {
    const now = Date.now();
    const timestamps = limitMap.get(userId) || [];

    // Filter to within window
    const recent = timestamps.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
    );

    const remaining = Math.max(0, maxRequests - recent.length);
    const allowed = recent.length < maxRequests;

    if (allowed) {
      recent.push(now);
    }

    limitMap.set(userId, recent);
    const resetAt = recent.length > 0 ? recent[0] + RATE_LIMIT_WINDOW_MS : now;

    return { allowed, remaining, resetAt };
  }

  private async storePendingDraft(draft: PendingMatchDraft): Promise<void> {
    this.pendingMatchDrafts.set(draft.id, draft);

    if (!this.redisService) {
      return;
    }

    await this.redisService.set(
      this.getDraftKey(draft.id),
      JSON.stringify(draft),
      Math.floor(MATCH_DRAFT_TTL_MS / 1000),
    );
  }

  private async getPendingDraft(
    draftId: string,
  ): Promise<PendingMatchDraft | null> {
    this.pruneExpiredDrafts();

    const inMemoryDraft = this.pendingMatchDrafts.get(draftId);
    if (inMemoryDraft) {
      return inMemoryDraft;
    }

    if (!this.redisService) {
      return null;
    }

    const serializedDraft = await this.redisService.get(
      this.getDraftKey(draftId),
    );
    if (!serializedDraft) {
      return null;
    }

    try {
      const parsed = JSON.parse(serializedDraft) as PendingMatchDraft;
      if (
        typeof parsed?.id !== "string" ||
        typeof parsed.chatId !== "number" ||
        typeof parsed.squadId !== "string" ||
        typeof parsed.submittedBy !== "string" ||
        typeof parsed.createdAt !== "number" ||
        typeof parsed.teamScore !== "number" ||
        typeof parsed.opponentScore !== "number" ||
        typeof parsed.outcome !== "string" ||
        typeof parsed.opponent !== "string"
      ) {
        return null;
      }

      this.pendingMatchDrafts.set(parsed.id, parsed);
      return parsed;
    } catch {
      return null;
    }
  }

  private async deletePendingDraft(draftId: string): Promise<void> {
    this.pendingMatchDrafts.delete(draftId);

    if (!this.redisService) {
      return;
    }

    await this.redisService.del(this.getDraftKey(draftId));
  }

  private async resolvePlatformIdentity(chatId: number, telegramUserId?: string) {
    // Try user-scoped resolution first (DM context)
    if (telegramUserId) {
      const { findPlatformIdentityByUserId } = await import("./platform-connections");
      const identity = await findPlatformIdentityByUserId(prisma, telegramUserId);
      if (identity) return identity;
    }
    // Fall back to group-scoped resolution (group context)
    return findPlatformIdentityByChatId(prisma, String(chatId));
  }

  private async requireLinkedChat(chatId: number) {
    return findSquadGroupByChatId(prisma, String(chatId));
  }

  private async requireLinkedCaptainActor(
    chatId: number,
    telegramUserId: string,
  ): Promise<AuthorizedTelegramCaptainActor> {
    const squadGroup = await this.requireLinkedChat(chatId);
    if (!squadGroup?.squadId) {
      return {
        error: "This chat is not linked to a SportWarren squad yet.",
      };
    }

    if (
      !squadGroup.platformUserId ||
      squadGroup.platformUserId !== telegramUserId
    ) {
      return {
        error:
          "Only the Telegram account that linked this squad can manage treasury actions right now.",
      };
    }

    // Resolve the user through PlatformIdentity
    const identity = await findPlatformIdentityByChatId(prisma, String(chatId));
    if (!identity?.userId) {
      return {
        error: "Could not resolve your SportWarren account from this Telegram chat.",
      };
    }

    const membership = await getSquadMembership(
      prisma,
      squadGroup.squadId,
      identity.userId,
    );
    if (!membership || !isSquadLeader(membership.role)) {
      return {
        error: "Only squad captains can manage treasury actions.",
      };
    }

    return {
      squadGroup: {
        ...squadGroup,
        platformUserId: squadGroup.platformUserId!,
        userId: identity.userId,
      },
      membership,
    };
  }

  // Helper for /account link
  private async handleAccountLink(chatId: number, msg: TelegramBot.Message): Promise<void> {
    const identity = await findPlatformIdentityByChatId(prisma, String(chatId));
    if (identity) {
      await this.sendMarkdown(chatId, `✅ This chat is already linked to a SportWarren account.`);
      return;
    }
    
    await this.sendMarkdown(chatId, 
      "*Link Your Telegram*\n\n" +
      "1. Open SportWarren Mini App\n" +
      "2. Go to Settings → Connections\n" +
      "3. Click 'Link Telegram' to generate a code\n" +
      "4. Return here and type: /link <code>"
    );
  }

  // Helper for /account unlink  
  private async handleAccountUnlink(chatId: number, msg: TelegramBot.Message): Promise<void> {
    const identity = await findPlatformIdentityByChatId(prisma, String(chatId));
    if (!identity) {
      await this.sendMarkdown(chatId, "⚠️ This chat is not linked to any account.");
      return;
    }

    await prisma.platformIdentity.delete({
      where: { id: identity.id },
    }).catch(() => {});

    await this.sendMarkdown(chatId, 
      `✅ *Unlinked*\n\nThis chat has been disconnected from SportWarren.`
    );
  }

  private async handleConnectStart(
    chatId: number,
    token: string,
    user: TelegramBot.User | undefined,
  ): Promise<void> {
    if (!user) {
      await this.bot.sendMessage(
        chatId,
        "We could not read your Telegram account. Please try again from the Telegram app.",
      );
      return;
    }

    try {
      const result = await connectTelegramChatByToken(prisma, token, {
        chatId: String(chatId),
        platformUserId: String(user.id),
        username: user.username,
      });

      if (!result) {
        await this.bot.sendMessage(
          chatId,
          "That link is no longer valid. Generate a fresh Telegram link from SportWarren Settings and try again.",
        );
        return;
      }

      await this.bot.sendMessage(
        chatId,
        "Telegram is now linked to your SportWarren squad. You can return to the app, or start with /log, /stats, or /fixtures.",
      );
    } catch (error) {
      await this.bot.sendMessage(
        chatId,
        error instanceof Error
          ? error.message
          : "We could not complete Telegram linking right now.",
      );
    }
  }

  private async handleMatchLog(
    chatId: number,
    matchText: string,
  ): Promise<void> {
    try {
      this.pruneExpiredDrafts();

      // Resolve the submitting user through PlatformIdentity
      const identity = await findPlatformIdentityByChatId(prisma, String(chatId));
      if (!identity?.userId) {
        await this.sendMarkdown(
          chatId,
          "⚠️ Could not resolve your SportWarren account from this Telegram chat.",
        );
        return;
      }

      // Get user's active memberships across all squads
      const memberships = await getUserActiveMemberships(prisma, identity.userId);
      
      if (memberships.length === 0) {
        await this.sendMarkdown(
          chatId,
          "⚠️ You're not a member of any squad yet.\n\n*To get started:*\n1. Open the Mini App (/app)\n2. Create or join a squad",
        );
        return;
      }

      let targetSquadId: string | null = null;
      let targetSquadName: string | null = null;

      // Check if chat is linked to a specific squad
      const squadGroup = await this.requireLinkedChat(chatId);
      
      if (squadGroup?.squadId) {
        // Chat is linked to a squad - use that one
        targetSquadId = squadGroup.squadId;
        targetSquadName = squadGroup.squad?.name || null;
      } else if (memberships.length === 1) {
        // No chat link but only one squad - use that one
        targetSquadId = memberships[0].squadId;
        targetSquadName = memberships[0].squad.name;
      } else {
        // No chat link and multiple squads - need to ask which one
        const keyboard = {
          inline_keyboard: memberships.map((m: any) => [
            { text: m.squad.name, callback_data: `select_squad_log:${m.squad.id}:${Buffer.from(matchText).toString('base64')}` }
          ]),
        };
        await this.bot.sendMessage(
          chatId,
          "⚽ You're a member of multiple squads. Which one is this match for?",
          { reply_markup: keyboard }
        );
        return;
      }

      // Check if user is captain of the target squad
      const membership = memberships.find((m: any) => m.squadId === targetSquadId);
      if (!membership || !isSquadLeader(membership.role)) {
        await this.sendMarkdown(
          chatId,
          `⚠️ Only captains can log matches for *${targetSquadName}*.`,
        );
        return;
      }

      const parsed = parseTelegramMatchResult(matchText);
      if (!parsed) {
        await this.bot.sendMessage(
          chatId,
          [
            "Could not parse that result.",
            "",
            "Try one of these formats:",
            "4-2 win vs Red Lions",
            "lost 1-3 to Sunday Legends",
            "drew 2-2 with Park Rangers",
          ].join("\n"),
        );
        return;
      }

      const draftId = this.createDraftId();
      const draft: PendingMatchDraft = {
        id: draftId,
        chatId,
        squadId: targetSquadId!,
        submittedBy: identity.userId,
        createdAt: Date.now(),
        ...parsed,
      };

      await this.storePendingDraft(draft);

      const keyboard = {
        inline_keyboard: [
          [
            { text: "Confirm", callback_data: `confirm_match:${draftId}` },
            { text: "Cancel", callback_data: `cancel_match:${draftId}` },
          ],
        ],
      };

      const squadLabel = targetSquadName || "Your squad";
      const message = [
        "Match log draft",
        "",
        `${squadLabel} ${draft.teamScore} - ${draft.opponentScore} ${draft.opponent}`,
        `Outcome: ${draft.outcome}`,
        "",
        "Submit this result to the verification queue?",
      ].join("\n");

      await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
    } catch (error) {
      console.error("Error handling Telegram match log:", error);
      await this.bot.sendMessage(
        chatId,
        "We could not prepare that match log. Please try again.",
      );
    }
  }

  /**
   * Handle squad selection for multi-squad users logging a match
   */
  private async handleSquadSelectedForLog(
    chatId: number,
    squadId: string,
    matchText: string,
  ): Promise<void> {
    try {
      // Get user's identity
      const identity = await findPlatformIdentityByChatId(prisma, String(chatId));
      if (!identity?.userId) {
        await this.sendMarkdown(
          chatId,
          "⚠️ Could not resolve your account. Please try again.",
        );
        return;
      }

      // Get user's memberships and find the selected one
      const memberships = await getUserActiveMemberships(prisma, identity.userId);
      const membership = memberships.find((m: any) => m.squadId === squadId);

      if (!membership) {
        await this.sendMarkdown(
          chatId,
          "⚠️ You're not a member of that squad. Please try again.",
        );
        return;
      }

      // Check captain permissions
      if (!isSquadLeader(membership.role)) {
        await this.sendMarkdown(
          chatId,
          `⚠️ Only captains can log matches for *${membership.squad.name}*.`,
        );
        return;
      }

      // Parse the match result
      const parsed = parseTelegramMatchResult(matchText);
      if (!parsed) {
        await this.bot.sendMessage(
          chatId,
          [
            "Could not parse that match result.",
            "",
            "Try: 4-2 win vs Red Lions",
          ].join("\n"),
        );
        return;
      }

      // Create the draft
      const draftId = this.createDraftId();
      const draft: PendingMatchDraft = {
        id: draftId,
        chatId,
        squadId,
        submittedBy: identity.userId,
        createdAt: Date.now(),
        ...parsed,
      };

      await this.storePendingDraft(draft);

      // Send confirmation
      const keyboard = {
        inline_keyboard: [
          [
            { text: "Confirm", callback_data: `confirm_match:${draftId}` },
            { text: "Cancel", callback_data: `cancel_match:${draftId}` },
          ],
        ],
      };

      const squadLabel = membership.squad.name;
      const message = [
        "Match log draft",
        "",
        `${squadLabel} ${draft.teamScore} - ${draft.opponentScore} ${draft.opponent}`,
        `Outcome: ${draft.outcome}`,
        "",
        "Submit this result to the verification queue?",
      ].join("\n");

      await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
    } catch (error) {
      console.error("Error handling squad selection for match log:", error);
      await this.sendMarkdown(
        chatId,
        "⚠️ Something went wrong. Please try /log again.",
      );
    }
  }

  private async resolveOpponentSquad(squadId: string, opponentName: string) {
    const exactMatch = await prisma.squad.findFirst({
      where: {
        id: { not: squadId },
        OR: [
          { name: { equals: opponentName, mode: "insensitive" } },
          { shortName: { equals: opponentName, mode: "insensitive" } },
        ],
      },
    });

    if (exactMatch) {
      return exactMatch;
    }

    const closeMatches = await prisma.squad.findMany({
      where: {
        id: { not: squadId },
        OR: [
          { name: { contains: opponentName, mode: "insensitive" } },
          { shortName: { contains: opponentName, mode: "insensitive" } },
        ],
      },
      take: 2,
      orderBy: { createdAt: "asc" },
    });

    if (closeMatches.length === 1) {
      return closeMatches[0];
    }

    return null;
  }

  private async processMatchLog(
    draft: PendingMatchDraft,
  ): Promise<{ id: string; shareSlug: string | null; opponentName: string }> {
    const membership = await getSquadMembership(
      prisma,
      draft.squadId,
      draft.submittedBy,
    );
    if (!membership || !isSquadLeader(membership.role)) {
      throw new Error(
        "Only current squad captains can submit Telegram match logs.",
      );
    }

    const squad = await prisma.squad.findUnique({
      where: { id: draft.squadId },
    });

    if (!squad) {
      throw new Error("The linked SportWarren squad no longer exists.");
    }

    const opponent = await this.resolveOpponentSquad(
      draft.squadId,
      draft.opponent,
    );
    if (!opponent) {
      throw new Error(
        `We could not find a squad named "${draft.opponent}". Use the exact SportWarren squad name and try again.`,
      );
    }

    const match = await submitMatchResult({
      prisma,
      homeSquadId: squad.id,
      awaySquadId: opponent.id,
      homeScore: draft.teamScore,
      awayScore: draft.opponentScore,
      submittedBy: draft.submittedBy,
      submittedByMembershipId: membership.id, // Multi-squad attribution
      matchDate: new Date(),
    });

    await this.deletePendingDraft(draft.id);

    return {
      id: match.id,
      shareSlug: match.shareSlug ?? null,
      opponentName: opponent.name,
    };
  }

  private async handleStatsRequest(
    chatId: number,
    playerName?: string,
  ): Promise<void> {
    const squadGroup = await this.requireLinkedChat(chatId);
    if (!squadGroup?.squadId) {
      await this.bot.sendMessage(
        chatId,
        "Link this chat from SportWarren Settings before requesting live stats.",
      );
      return;
    }

    if (playerName) {
      const profile = await prisma.playerProfile.findFirst({
        where: {
          user: {
            squads: {
              some: { squadId: squadGroup.squadId },
            },
            name: {
              contains: playerName,
              mode: "insensitive",
            },
          },
        },
        include: {
          user: {
            select: { name: true },
          },
        },
      });

      if (!profile) {
        await this.bot.sendMessage(
          chatId,
          `No player named "${playerName}" was found in the linked squad.`,
        );
        return;
      }

      await this.bot.sendMessage(
        chatId,
        [
          `${profile.user.name || "Player"} stats`,
          "",
          `Matches: ${profile.totalMatches}`,
          `Goals: ${profile.totalGoals}`,
          `Assists: ${profile.totalAssists}`,
          `Reputation: ${profile.reputationScore}`,
          `Season XP: ${profile.seasonXP}`,
        ].join("\n"),
      );
      return;
    }

    const squad = await prisma.squad.findUnique({
      where: { id: squadGroup.squadId },
      select: { name: true },
    });

    const matches = await prisma.match.findMany({
      where: {
        status: { in: ["verified", "finalized"] },
        OR: [
          { homeSquadId: squadGroup.squadId },
          { awaySquadId: squadGroup.squadId },
        ],
      },
      select: {
        homeSquadId: true,
        awaySquadId: true,
        homeScore: true,
        awayScore: true,
      },
    });

    const totals = matches.reduce(
      (summary, m) => {
        const isHome = m.homeSquadId === squadGroup.squadId;
        const goalsFor = isHome
          ? (m.homeScore ?? 0)
          : (m.awayScore ?? 0);
        const goalsAgainst = isHome
          ? (m.awayScore ?? 0)
          : (m.homeScore ?? 0);

        summary.goalsFor += goalsFor;
        summary.goalsAgainst += goalsAgainst;

        if (goalsFor > goalsAgainst) summary.wins += 1;
        else if (goalsFor < goalsAgainst) summary.losses += 1;
        else summary.draws += 1;

        return summary;
      },
      { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 },
    );

    await this.bot.sendMessage(
      chatId,
      [
        `📊 ${squad?.name || "Squad"} Combined Stats`,
        "",
        `Record: ${totals.wins}W - ${totals.draws}D - ${totals.losses}L`,
        `Goals: ${totals.goalsFor} For / ${totals.goalsAgainst} Against`,
        "",
        "Use /app for full fixture history and player breakdowns.",
      ].join("\n"),
    );
  }

  private async buildSquadSummaryCard(squadId: string): Promise<string> {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      include: {
        treasury: true,
        matchesHome: {
          where: { status: { in: ["verified", "finalized"] } },
          orderBy: { matchDate: "desc" },
          take: 1,
          include: { awaySquad: { select: { name: true } } },
        },
        matchesAway: {
          where: { status: { in: ["verified", "finalized"] } },
          orderBy: { matchDate: "desc" },
          take: 1,
          include: { homeSquad: { select: { name: true } } },
        },
      },
    });

    if (!squad) return "Squad not found.";

    const lastMatchHome = squad.matchesHome[0];
    const lastMatchAway = squad.matchesAway[0];

    let latestMatch: any = null;
    if (lastMatchHome && lastMatchAway) {
      latestMatch =
        lastMatchHome.matchDate > lastMatchAway.matchDate
          ? { ...lastMatchHome, type: "home" }
          : { ...lastMatchAway, type: "away" };
    } else if (lastMatchHome) {
      latestMatch = { ...lastMatchHome, type: "home" };
    } else if (lastMatchAway) {
      latestMatch = { ...lastMatchAway, type: "away" };
    }

    const treasuryBalance = squad.treasury?.balance ?? 0;
    const formattedBalance = (treasuryBalance / 1000).toFixed(2);

    let matchSection = "No verified matches yet.";
    if (latestMatch) {
      const opponent =
        latestMatch.type === "home"
          ? latestMatch.awaySquad.name
          : latestMatch.homeSquad.name;
      const scoreLine =
        latestMatch.type === "home"
          ? `${latestMatch.homeScore} - ${latestMatch.awayScore}`
          : `${latestMatch.awayScore} - ${latestMatch.homeScore}`;

      matchSection = `🏟 Last Result: ${squad.name} ${scoreLine} ${opponent}`;
    }

    return [
      `🛡 SportWarren Squad Card: ${squad.name}`,
      "",
      matchSection,
      `💰 Treasury: ${formattedBalance} TON`,
      "",
      "Use /app to open the Mini App for tactics and rewards.",
    ].join("\n");
  }

  private async handleFixturesRequest(chatId: number): Promise<void> {
    const squadGroup = await this.requireLinkedChat(chatId);
    if (!squadGroup?.squadId) {
      await this.sendMarkdown(
        chatId,
        "⚠️ *This chat is not linked to a squad.*\n\nYour captain needs to link this group from *Settings → Connections → Telegram* before you can see fixtures.",
      );
      return;
    }

    const challenges = await prisma.matchChallenge.findMany({
      where: {
        proposedDate: { gte: new Date() },
        OR: [
          { fromSquadId: squadGroup.squadId },
          { toSquadId: squadGroup.squadId },
        ],
        status: { in: ["pending", "accepted"] },
      },
      include: {
        fromSquad: { select: { name: true } },
        toSquad: { select: { name: true } },
        pitch: { select: { name: true, location: true } },
      },
      orderBy: { proposedDate: "asc" },
      take: 3,
    });

    if (challenges.length === 0) {
      await this.bot.sendMessage(
        chatId,
        "No scheduled fixtures are currently stored for this squad.",
      );
      return;
    }

    const message = challenges
      .map((challenge) => {
        const isHome = challenge.fromSquadId === squadGroup.squadId;
        const opponent = isHome
          ? challenge.toSquad.name
          : challenge.fromSquad.name;
        const pitch =
          challenge.pitch?.name || challenge.pitch?.location || "Pitch TBD";

        return [
          challenge.proposedDate.toLocaleString(),
          `vs ${opponent}`,
          pitch,
        ].join("\n");
      })
      .join("\n\n");

    await this.sendMarkdown(chatId, `*Upcoming fixtures*\n\n${message}`);
  }

  /**
   * Handle /available command - set user availability for upcoming matches
   */
  private async handleAvailability(chatId: number, args?: string): Promise<void> {
    // Get user identity (for multi-squad users)
    const platformIdentity = await findPlatformIdentityByChatId(prisma, String(chatId));
    if (!platformIdentity) {
      await this.sendMarkdown(
        chatId,
        "⚠️ *Not linked to SportWarren.*\n\nUse /start to link your Telegram account first."
      );
      return;
    }

    // Get all squads the user is a member of
    const memberships = await getUserActiveMemberships(prisma, platformIdentity.userId);
    
    if (memberships.length === 0) {
      await this.sendMarkdown(
        chatId,
        "⚠️ *No squads found.*\n\nYou haven't joined any squads yet. Open the Mini App to create or join a squad."
      );
      return;
    }

    // Parse availability: /available yes/no/[day] for specific squad
    // Format: /available [yes|no|maybe] [squad-name]
    // Example: /available yes Tuesday League
    const argsParts = args?.trim().split(/\s+/) || [];
    let availability: "available" | "unavailable" | "maybe" | null = null;
    let squadFilter: string | null = null;

    if (argsParts.length > 0) {
      const firstArg = argsParts[0].toLowerCase();
      if (["yes", "y", "available"].includes(firstArg)) {
        availability = "available";
      } else if (["no", "n", "unavailable"].includes(firstArg)) {
        availability = "unavailable";
      } else if (["maybe", "m"].includes(firstArg)) {
        availability = "maybe";
      }
      
      if (argsParts.length > 1) {
        squadFilter = argsParts.slice(1).join(" ");
      }
    }

    // Filter memberships if squad specified
    let targetSquads = memberships;
    if (squadFilter) {
      targetSquads = memberships.filter((m: typeof memberships[number]) => 
        m.squad.name.toLowerCase().includes(squadFilter!.toLowerCase())
      );
      
      if (targetSquads.length === 0) {
        await this.sendMarkdown(
          chatId,
          `⚠️ *Squad not found: "${squadFilter}"*\n\nYour squads: ${memberships.map((m: typeof memberships[number]) => m.squad.name).join(", ")}`
        );
        return;
      }
    }

    if (!availability) {
      // Show current availability status
      const lines: string[] = ["*Your Availability*\n"];
      
      for (const membership of targetSquads) {
        // TODO: Query availability from SquadSchedule or PlayerAvailability
        lines.push(`• ${membership.squad.name}: _Not set_`);
      }
      
      lines.push("\n📝 *Set availability:*");
      lines.push("/available yes - Mark as available for all squads");
      lines.push("/available no [squad-name] - Mark unavailable");
      lines.push("/available maybe Tuesday - Uncertain");
      
      await this.sendMarkdown(chatId, lines.join("\n"));
      return;
    }

    // Set availability for target squads
    // Query each squad's schedule to get their playing day
    const results: string[] = [];
    
    for (const membership of targetSquads) {
      // Get the squad's schedule
      const schedule = await prisma.squadSchedule.findUnique({
        where: { squadId: membership.squad.id },
      });
      
      const dayOfWeek = schedule?.dayOfWeek || 0; // 0 means no schedule set
      const dayName = dayOfWeek === 1 ? "Monday" : dayOfWeek === 2 ? "Tuesday" : 
                      dayOfWeek === 3 ? "Wednesday" : dayOfWeek === 4 ? "Thursday" :
                      dayOfWeek === 5 ? "Friday" : dayOfWeek === 6 ? "Saturday" : 
                      dayOfWeek === 7 ? "Sunday" : "Unknown";
      
      // Upsert availability record
      const isAvailableStatus = availability === "available";
      
      await prisma.squadAvailability.upsert({
        where: {
          userId_squadId_dayOfWeek: {
            userId: platformIdentity.userId,
            squadId: membership.squad.id,
            dayOfWeek,
          },
        },
        create: {
          userId: platformIdentity.userId,
          squadId: membership.squad.id,
          dayOfWeek,
          isAvailable: isAvailableStatus,
          timeSlot: "any",
        },
        update: {
          isAvailable: isAvailableStatus,
          timeSlot: "any",
        },
      });
      
      results.push(`${membership.squad.name} (${dayName})`);
    }

    const emoji = availability === "available" ? "✅" : availability === "unavailable" ? "❌" : "🤔";
    
    // Check for conflicts with other squads
    if (targetSquads.length > 1 && availability === "available") {
      // Find other squads user is in but didn't set availability for
      const allMySquads = memberships.map((m: typeof memberships[number]) => m.squad.id);
      const targetSquadIds = targetSquads.map((m: typeof memberships[number]) => m.squad.id);
      
      const otherSquads = memberships.filter(
        (m: typeof memberships[number]) => !targetSquadIds.includes(m.squad.id)
      );
      
      if (otherSquads.length > 0) {
        const conflictMsg = `\n\n⚠️ *Note:* You have ${otherSquads.length} other squad(s): ${otherSquads.map((m: typeof memberships[number]) => m.squad.name).join(", ")}. Use /available ${availability} [squad-name] to set availability for them too.`;
        
        await this.sendMarkdown(
          chatId,
          `${emoji} *Availability set:*\n${results.join("\n")}\n\nStatus: ${availability}${conflictMsg}`
        );
        return;
      }
    }
    
    await this.sendMarkdown(
      chatId,
      `${emoji} *Availability set:*\n${results.join("\n")}\n\nStatus: ${availability}\n\nThis applies to your regular ${results.length > 1 ? "matches" : "match"} this week.`
    );
  }

  /**
   * Handle /myteams command - view all squads and their status
   */
  private async handleMyTeams(chatId: number): Promise<void> {
    const platformIdentity = await findPlatformIdentityByChatId(prisma, String(chatId));
    
    if (!platformIdentity) {
      await this.sendMarkdown(
        chatId,
        "⚠️ *Not linked to SportWarren.*\n\nUse /start to link your Telegram account first."
      );
      return;
    }

    const memberships = await getUserActiveMemberships(prisma, platformIdentity.userId);
    
    if (memberships.length === 0) {
      await this.sendMarkdown(
        chatId,
        "⚠️ *No squads found.*\n\nYou haven't joined any squads yet. Open the Mini App to create or join a squad."
      );
      return;
    }

    // Check which squads this chat is linked to
    const chatSquadIds = new Set<string>();
    const squadGroup = await findSquadGroupByChatId(prisma, String(chatId));
    if (squadGroup) {
      chatSquadIds.add(squadGroup.squadId);
    }

    const lines: string[] = ["*Your Squads*\n"];
    
    for (const membership of memberships) {
      const isLinked = chatSquadIds.has(membership.squad.id);
      const role = membership.role;
      const roleEmoji = role === "captain" ? "👑" : role === "admin" ? "⭐" : "👤";
      
      lines.push(`${roleEmoji} *${membership.squad.name}*`);
      lines.push(`   Role: ${role}`);
      lines.push(`   Linked: ${isLinked ? "✅ This chat" : "❌ Not linked"}`);
      
      // TODO: Show availability status for this week
      lines.push("");
    }

    lines.push("📝 *Commands:*");
    lines.push("/available yes - Set availability for upcoming matches");
    lines.push("/available no [squad] - Mark unavailable");
    lines.push("/available maybe [squad] - Not sure yet");
    
    if (memberships.length > 1) {
      lines.push("\n💡 *Tip:* You can specify a squad: /available yes Tuesday League");
    }

    await this.sendMarkdown(chatId, lines.join("\n"));
  }

  /**
   * Handle /roster command - captains view squad availability
   */
  private async handleRoster(chatId: number, dayFilter?: string): Promise<void> {
    // Get the squad group (chat must be linked to a squad)
    const squadGroup = await findSquadGroupByChatId(prisma, String(chatId));
    
    if (!squadGroup) {
      await this.sendMarkdown(
        chatId,
        "⚠️ *Not linked to a squad.*\n\nThis chat isn't linked to any squad. Ask your captain to link this group from the Mini App."
      );
      return;
    }

    // Check if user is a captain/admin of this squad
    const platformIdentity = await findPlatformIdentityByChatId(prisma, String(chatId));
    if (!platformIdentity) {
      await this.sendMarkdown(chatId, "⚠️ *Not linked.*\n\nUse /start to link your account.");
      return;
    }

    const memberships = await getUserActiveMemberships(prisma, platformIdentity.userId);
    const membership = memberships.find((m: typeof memberships[number]) => m.squad.id === squadGroup.squadId);
    
    if (!membership || !["captain", "admin"].includes(membership.role)) {
      await this.sendMarkdown(
        chatId,
        "⛔ *Access denied.*\n\nOnly captains and admins can view the roster."
      );
      return;
    }

    const squad = squadGroup.squad;
    
    // Get squad schedule to know which day to show
    const schedule = await prisma.squadSchedule.findUnique({
      where: { squadId: squad.id },
    });

    const dayOfWeek = schedule?.dayOfWeek || 0;
    const dayName = dayOfWeek === 1 ? "Monday" : dayOfWeek === 2 ? "Tuesday" : 
                    dayOfWeek === 3 ? "Wednesday" : dayOfWeek === 4 ? "Thursday" :
                    dayOfWeek === 5 ? "Friday" : dayOfWeek === 6 ? "Saturday" : 
                    dayOfWeek === 7 ? "Sunday" : null;

    // If dayFilter provided, override
    let targetDay = dayOfWeek;
    if (dayFilter) {
      const dayMap: Record<string, number> = {
        monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
        friday: 5, saturday: 6, sunday: 7,
      };
      targetDay = dayMap[dayFilter.toLowerCase()] || dayOfWeek;
    }

    if (!targetDay) {
      await this.sendMarkdown(
        chatId,
        `⚠️ No schedule set for this squad.\n\nAsk your captain to set up the squad schedule in Settings.`
      );
      return;
    }

    // Get all squad members with their availability for this day
    const members = await prisma.squadMember.findMany({
      where: { squadId: squad.id },
      include: {
        user: {
          include: {
            // Get availability for the target day
            availabilities: {
              where: { dayOfWeek: targetDay },
            },
          },
        },
      },
    });

    // Categorize members
    const available: string[] = [];
    const unavailable: string[] = [];
    const notSet: string[] = [];

    for (const member of members) {
      const availability = member.user.availabilities[0];
      const name = member.user.name || `User ${member.userId.slice(0, 6)}`;
      
      if (!availability) {
        notSet.push(name);
      } else if (availability.isAvailable) {
        available.push(name);
      } else {
        unavailable.push(name);
      }
    }

    const targetDayName = targetDay === 1 ? "Monday" : targetDay === 2 ? "Tuesday" : 
                          targetDay === 3 ? "Wednesday" : targetDay === 4 ? "Thursday" :
                          targetDay === 5 ? "Friday" : targetDay === 6 ? "Saturday" : "Sunday";

    // Build response
    const lines: string[] = [];
    lines.push(`*📋 Roster for ${squad.name}*`);
    lines.push(`📅 ${targetDayName}${dayName && targetDay !== dayOfWeek ? ` (all: ${dayName})` : ""}`);
    lines.push("");

    if (available.length > 0) {
      lines.push(`✅ *Available (${available.length}):*`);
      lines.push(available.map(n => `• ${n}`).join("\n"));
      lines.push("");
    }

    if (unavailable.length > 0) {
      lines.push(`❌ *Unavailable (${unavailable.length}):*`);
      lines.push(unavailable.map(n => `• ${n}`).join("\n"));
      lines.push("");
    }

    if (notSet.length > 0) {
      lines.push(`⚪ *Not set (${notSet.length}):*`);
      lines.push(notSet.map(n => `• ${n}`).join("\n"));
      lines.push("");
    }

    lines.push("---");
    lines.push(`*Total:* ${members.length} members`);
    lines.push(`*Available:* ${available.length} | *Unavailable:* ${unavailable.length} | *Not set:* ${notSet.length}`);
    lines.push("");
    lines.push("📝 _Use /available yes in your chat to mark yourself available_");

    await this.sendMarkdown(chatId, lines.join("\n"));
  }

  private async handleFeeProposal(
    chatId: number,
    args: string,
    user: TelegramBot.User | undefined,
  ): Promise<void> {
    if (!user) {
      await this.bot.sendMessage(
        chatId,
        "Could not read your Telegram account.",
      );
      return;
    }

    const actor = await this.requireLinkedCaptainActor(chatId, String(user.id));
    if ("error" in actor) {
      await this.bot.sendMessage(chatId, actor.error);
      return;
    }

    const { squadGroup } = actor;

    const parts = args.split(/\s+/);
    const matchId = parts[0]?.trim() || "";
    const feeAmount = Number(parts[1]) || MATCH_FEE_TON;

    if (!matchId) {
      await this.bot.sendMessage(
        chatId,
        "Provide a match ID. Example: /fee abc123 2",
      );
      return;
    }

    if (feeAmount <= 0 || feeAmount > 100) {
      await this.bot.sendMessage(
        chatId,
        "Fee amount must be between 0 and 100 TON.",
      );
      return;
    }

    try {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        select: {
          id: true,
          homeSquadId: true,
          awaySquadId: true,
          homeSquad: { select: { name: true } },
          awaySquad: { select: { name: true } },
          homeScore: true,
          awayScore: true,
        },
      });

      if (!match) {
        await this.bot.sendMessage(
          chatId,
          `Match "${matchId}" not found. Use /log to create a match first.`,
        );
        return;
      }

      if (
        match.homeSquadId !== squadGroup.squadId &&
        match.awaySquadId !== squadGroup.squadId
      ) {
        await this.bot.sendMessage(
          chatId,
          "That match does not belong to your squad.",
        );
        return;
      }

      const treasury = await ensureSquadTreasury(prisma, squadGroup.squadId);
      if (treasury.balance < feeAmount) {
        await this.bot.sendMessage(
          chatId,
          `Insufficient treasury balance (${treasury.balance} TON) for a ${feeAmount} TON fee.`,
        );
        return;
      }

      const feeReference = `telegram-match-fee:${squadGroup.squadId}:${match.id}:${feeAmount}`;
      const feeTx = await recordPendingTreasuryActivity({
        prisma,
        squadId: squadGroup.squadId,
        type: "expense",
        category: "match_fee_pending",
        amount: feeAmount,
        description: `Match fee for ${match.homeSquad.name} vs ${match.awaySquad.name}`,
        txHash: feeReference,
        metadata: {
          source: "telegram-match-fee",
          matchId: match.id,
          proposedByUserId: squadGroup.userId,
          proposedByTelegramUserId: String(user.id),
          homeSquad: match.homeSquad.name,
          awaySquad: match.awaySquad.name,
          score: `${match.homeScore ?? "?"}-${match.awayScore ?? "?"}`,
          feeReference,
        },
      });

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: `✅ Approve ${feeAmount} TON`,
              callback_data: `approve_fee:${feeTx.transaction.id}`,
            },
            {
              text: "❌ Reject",
              callback_data: `reject_fee:${feeTx.transaction.id}`,
            },
          ],
        ],
      };

      const message = [
        `⚽ Match Fee Proposal`,
        "",
        `${match.homeSquad.name} vs ${match.awaySquad.name}`,
        `Score: ${match.homeScore ?? "?"} - ${match.awayScore ?? "?"}`,
        "",
        `Fee: ${feeAmount} TON from squad treasury`,
        `Balance: ${treasury.balance} TON`,
        "",
        "Approve to deduct from treasury?",
      ].join("\n");

      await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
    } catch (error) {
      console.error("Error handling fee proposal:", error);
      await this.bot.sendMessage(
        chatId,
        "Could not create the fee proposal. Please try again.",
      );
    }
  }

  private async handleFeeCallback(
    query: TelegramBot.CallbackQuery,
    action: "approve_fee" | "reject_fee",
    transactionId: string,
  ): Promise<void> {
    const chatId = query.message?.chat.id;
    const messageId = query.message?.message_id;
    const telegramUserId = String(query.from.id);

    if (!chatId || !messageId || !query.id || !transactionId) {
      if (query.id) {
        await this.bot.answerCallbackQuery(query.id);
      }
      return;
    }

    const actor = await this.requireLinkedCaptainActor(chatId, telegramUserId);
    if ("error" in actor) {
      await this.bot.answerCallbackQuery(query.id, {
        text: actor.error,
        show_alert: true,
      });
      return;
    }

    const { squadGroup } = actor;
    const pendingTransaction = await prisma.treasuryTransaction.findFirst({
      where: {
        id: transactionId,
        treasury: {
          squadId: squadGroup.squadId,
        },
      },
      include: {
        treasury: true,
      },
    });

    if (
      !pendingTransaction ||
      pendingTransaction.type !== "expense" ||
      pendingTransaction.category !== "match_fee_pending"
    ) {
      await this.bot.answerCallbackQuery(query.id, {
        text: "That fee proposal is no longer pending.",
        show_alert: false,
      });
      return;
    }

    const homeSquad =
      readMetadataString(pendingTransaction.metadata, "homeSquad") ??
      "Home Squad";
    const awaySquad =
      readMetadataString(pendingTransaction.metadata, "awaySquad") ??
      "Away Squad";
    const score =
      readMetadataString(pendingTransaction.metadata, "score") ?? "?-?";
    const matchId =
      readMetadataString(pendingTransaction.metadata, "matchId") ?? "unknown";

    try {
      if (action === "reject_fee") {
        await cancelPendingTreasuryActivity({
          prisma,
          squadId: squadGroup.squadId,
          transactionId,
          expectedType: "expense",
          expectedCategory: "match_fee_pending",
        });

        await this.bot.editMessageText(
          [
            "Match fee rejected.",
            "",
            `${homeSquad} vs ${awaySquad}`,
            `Score: ${score}`,
            `Match ID: ${matchId}`,
            "",
            "No treasury funds were moved.",
          ].join("\n"),
          {
            chat_id: chatId,
            message_id: messageId,
          },
        );
        await this.bot.answerCallbackQuery(query.id, { text: "Fee rejected" });
        return;
      }

      const settled = await settlePendingTreasuryActivity({
        prisma,
        squadId: squadGroup.squadId,
        transactionId,
        settledByUserId: squadGroup.userId,
        settledTxHash: pendingTransaction.txHash,
        expectedType: "expense",
        expectedCategory: "match_fee_pending",
        nextCategory: "match_fee",
        metadataPatch: {
          approvedByTelegramUserId: telegramUserId,
          approvedVia: "telegram",
        },
      });

      await this.bot.editMessageText(
        [
          "Match fee approved.",
          "",
          `${homeSquad} vs ${awaySquad}`,
          `Score: ${score}`,
          `Match ID: ${matchId}`,
          "",
          `Deducted: ${pendingTransaction.amount} TON`,
          `Updated balance: ${settled.treasury.balance} TON`,
        ].join("\n"),
        {
          chat_id: chatId,
          message_id: messageId,
        },
      );
      await this.bot.answerCallbackQuery(query.id, { text: "Fee approved" });
    } catch (error) {
      const message =
        error instanceof TreasuryBalanceError
          ? "Treasury balance is no longer sufficient for that fee."
          : error instanceof Error
            ? error.message
            : "Could not update the fee proposal.";

      await this.bot.answerCallbackQuery(query.id, {
        text: message,
        show_alert: false,
      });
    }
  }

  private async handleInlineQuery(
    query: TelegramBot.InlineQuery,
  ): Promise<void> {
    const queryText = query.query.toLowerCase();
    const results: TelegramBot.InlineQueryResultArticle[] = [];

    if (queryText.includes("log") || queryText.includes("match")) {
      results.push({
        type: "article",
        id: "log-match",
        title: "Log match result",
        description: "Insert a SportWarren match log command",
        input_message_content: {
          message_text: "/log 4-2 win vs Red Lions",
        },
      });
    }

    if (queryText.includes("stats")) {
      results.push({
        type: "article",
        id: "view-stats",
        title: "View squad stats",
        description: "Insert the SportWarren stats command",
        input_message_content: {
          message_text: "/stats",
        },
      });
    }

    await this.bot.answerInlineQuery(query.id, results);
  }

  private async handleCallbackQuery(
    query: TelegramBot.CallbackQuery,
  ): Promise<void> {
    const data = query.data;
    const chatId = query.message?.chat.id;
    const messageId = query.message?.message_id;

    if (!data || !chatId || !messageId) {
      if (query.id) {
        await this.bot.answerCallbackQuery(query.id);
      }
      return;
    }

    const [action, draftId] = data.split(":");

    // Handle squad selection for multi-squad users
    if (action === "select_squad_log") {
      const parts = data.split(":");
      if (parts.length >= 3) {
        const selectedSquadId = parts[1];
        const matchTextBase64 = parts.slice(2).join(":"); // Rejoin in case base64 had colons
        const matchText = Buffer.from(matchTextBase64, 'base64').toString('utf8');
        
        await this.handleSquadSelectedForLog(chatId, selectedSquadId, matchText);
        await this.bot.answerCallbackQuery(query.id);
        return;
      }
    }

    if (action === "approve_fee" || action === "reject_fee") {
      await this.handleFeeCallback(query, action, draftId);
      return;
    }

    const draft = draftId ? await this.getPendingDraft(draftId) : null;

    if (!draft || draft.chatId !== chatId) {
      await this.bot.answerCallbackQuery(query.id, {
        text: "That draft expired. Send /log again.",
        show_alert: false,
      });
      return;
    }

    if (action === "cancel_match") {
      await this.deletePendingDraft(draft.id);
      await this.bot.editMessageText("Match logging cancelled.", {
        chat_id: chatId,
        message_id: messageId,
      });
      await this.bot.answerCallbackQuery(query.id);
      return;
    }

    if (action !== "confirm_match") {
      await this.bot.answerCallbackQuery(query.id);
      return;
    }

    try {
      const match = await this.processMatchLog(draft);
      await this.bot.editMessageText(
        `Match submitted successfully.\n\nMatch ID: ${match.id}\nOpponent: ${match.opponentName}\nStatus: pending verification`,
        {
          chat_id: chatId,
          message_id: messageId,
        },
      );
      await this.bot.answerCallbackQuery(query.id, { text: "Match submitted" });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not submit that match.";
      await this.bot.editMessageText(
        `Telegram match logging failed.\n\n${message}`,
        {
          chat_id: chatId,
          message_id: messageId,
        },
      );
      await this.bot.answerCallbackQuery(query.id, {
        text: "Submission failed",
        show_alert: false,
      });
    }
  }

  async sendMatchNotification(chat_id: string, message: string, options: TelegramBot.SendMessageOptions = {}): Promise<void> {
    const numericChatId = Number.parseInt(chat_id, 10);
    if (Number.isNaN(numericChatId)) {
      console.warn("Invalid Telegram chat ID:", chat_id);
      return;
    }

    try {
      await this.bot.sendMessage(numericChatId, message, {
        parse_mode: "Markdown",
        ...options
      });
    } catch (error) {
      console.error("Failed to send Telegram notification:", error);
    }
  }

  async sendMatchUpdate(chatId: string, update: any): Promise<void> {
    const message = [
      "Live update",
      "",
      `${update.homeTeam} ${update.homeScore} - ${update.awayScore} ${update.awayTeam}`,
      update.event || "No event details provided.",
      update.minute ? `${update.minute}'` : "Minute unavailable",
    ].join("\n");

    await this.sendMatchNotification(chatId, message);
  }

  async sendVerificationNudge(
    chatId: string,
    squadName: string,
    pendingMatches: Array<{
      id: string;
      opponent: string;
      homeScore: number;
      awayScore: number;
      isHome: boolean;
      requiredVerifications: number;
      verificationCount: number;
      createdAt: Date;
      lastNudgeAt?: Date | null;
    }>,
  ): Promise<void> {
    const matchesToNudge = pendingMatches.filter((match) =>
      shouldSendNudge(match.createdAt, match.lastNudgeAt),
    );

    if (matchesToNudge.length === 0) return;

    const message = buildVerificationNudgeMessage({
      squadName,
      pendingMatches: matchesToNudge,
      chatId,
    });

    if (!message) return;

    const numericChatId = Number(chatId);
    if (Number.isNaN(numericChatId)) return;

    try {
      await this.bot.sendMessage(numericChatId, message, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("Failed to send verification nudge:", error);
    }
  }

  public async sendPeerRatingPrompt(chatId: string | number, matchId: string, squadName: string): Promise<void> {
    const url = buildTelegramMiniAppUrl({ mode: `match_${matchId}_rate` });
    if (!url) return;

    await this.bot.sendMessage(
      chatId,
      [
        `⭐ *Post-Match Scout Report*`,
        ``,
        `The match for *${squadName}* is verified!`,
        `It's time to rate your teammates' performance and vote for Man of the Match.`,
        ``,
        `Your feedback earns you Scout XP and helps your teammates level up.`,
      ].join("\n"),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⭐ Rate Teammates",
                web_app: { url },
              },
            ],
          ],
        },
      },
    );
  }

  public async sendConsensusResults(chatId: string | number, matchId: string, squadName: string): Promise<void> {
    const url = buildTelegramMiniAppUrl({ mode: `match_${matchId}` });
    if (!url) return;

    await this.bot.sendMessage(
      chatId,
      [
        `📊 *Scout Report Results*`,
        ``,
        `Peer ratings for *${squadName}* are in!`,
        `The consensus has been calculated and XP has been awarded to all participants.`,
        ``,
        `Check the match center to see the final ratings and the Man of the Match.`,
      ].join("\n"),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📊 View Results",
                web_app: { url },
              },
            ],
          ],
        },
      },
    );
  }
}

let telegramServiceSingleton: TelegramService | null | undefined;

export function getTelegramService(): TelegramService | null {
  if (telegramServiceSingleton !== undefined) {
    return telegramServiceSingleton;
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    telegramServiceSingleton = null;
    return telegramServiceSingleton;
  }

  try {
    telegramServiceSingleton = new TelegramService();
  } catch (error) {
    console.error("Failed to initialize Telegram service singleton:", error);
    telegramServiceSingleton = null;
  }

  return telegramServiceSingleton;
}
