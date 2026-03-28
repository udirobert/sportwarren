import { randomBytes } from "crypto";
import { generateInference } from "@/lib/ai/inference";
import { AGENT_PERSONAS } from "../ai/prompts";
import TelegramBot from "node-telegram-bot-api";
import { prisma } from "@/lib/db";
import {
  getSquadMembership,
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

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_LOG_MAX = 5; // Max 5 /log commands per minute
const RATE_LIMIT_ASK_MAX = 10; // Max 10 /ask commands per minute

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
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
  }

  getBot(): TelegramBot {
    return this.bot;
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
    this.bot
      .setMyCommands([
        {
          command: "start",
          description: "Link Telegram to your SportWarren squad",
        },
        { command: "app", description: "Open the full SportWarren Mini App" },
        {
          command: "log",
          description: "Submit a match result for verification",
        },
        { command: "stats", description: "View real player or squad stats" },
        { command: "fixtures", description: "View scheduled squad fixtures" },
        {
          command: "ask",
          description:
            "Ask AI Staff a question (e.g. /ask Coach about tactics)",
        },
        {
          command: "fee",
          description: "Propose a match fee from the treasury",
        },
        { command: "treasury", description: "Open treasury in the Mini App" },
        { command: "profile", description: "View your player profile" },
        {
          command: "help",
          description: "Show Telegram commands and linking help",
        },
      ])
      .catch((error: Error) => {
        console.warn("Failed to register Telegram commands:", error.message);
      });
  }

  private setupEventHandlers(): void {
    this.bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const startParam = match?.[1]?.trim();

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
        await this.bot.sendMessage(chatId, summary);
        return;
      }

      await this.bot.sendMessage(chatId, this.buildHelpMessage());
    });

    this.bot.onText(/\/help/, async (msg) => {
      await this.bot.sendMessage(msg.chat.id, this.buildHelpMessage());
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
          await this.bot.sendMessage(
            chatId,
            `⏳ Slow down! You've hit the limit for /log. Try again in ${waitSeconds}s.`,
          );
          return;
        }
      }

      if (!matchText) {
        await this.bot.sendMessage(
          chatId,
          "Please include the result. Example: /log 4-2 win vs Red Lions",
        );
        return;
      }

      await this.handleMatchLog(chatId, matchText);
    });

    this.bot.onText(/\/stats(?:\s+(.+))?/, async (msg, match) => {
      await this.handleStatsRequest(msg.chat.id, match?.[1]?.trim());
    });

    this.bot.onText(/\/fixtures/, async (msg) => {
      await this.handleFixturesRequest(msg.chat.id);
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
          await this.bot.sendMessage(
            chatId,
            `⏳ Slow down! You've hit the limit for /ask. Try again in ${waitSeconds}s.`,
          );
          return;
        }
      }

      if (!query) {
        await this.bot.sendMessage(
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

      await this.bot.sendMessage(
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
        "Do not pretend an action has already happened.",
      ].join("\n");

      const response = await generateInference([
        {
          role: "system",
          content: guidanceRules,
        },
        { role: "user", content: text },
      ]);

      if (response?.content) {
        await this.bot.sendMessage(chatId, response.content);
        return;
      }
    } catch (error) {
      console.warn("General AI query failed:", error);
    }

    await this.bot.sendMessage(chatId, this.buildGeneralGuidanceFallback());
  }

  private buildGeneralGuidanceFallback(): string {
    return [
      "SportWarren Telegram",
      "",
      "Type /app to open onboarding and get moving.",
      "Log the score. Track your stats. Build your legacy.",
    ].join("\n");
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

      const squadGroup = await this.requireLinkedChat(chatId);
      if (!squadGroup?.squadId) {
        await this.bot.sendMessage(
          chatId,
          "This chat is not linked to a SportWarren squad yet. Link Telegram from Settings before logging matches.",
        );
        return;
      }

      // Resolve the submitting user through PlatformIdentity
      const identity = await findPlatformIdentityByChatId(prisma, String(chatId));
      if (!identity?.userId) {
        await this.bot.sendMessage(
          chatId,
          "Could not resolve your SportWarren account from this Telegram chat.",
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
        squadId: squadGroup.squadId,
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

      const squadLabel = squadGroup.squad?.name || "Your squad";
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
      await this.bot.sendMessage(
        chatId,
        "Link this chat from SportWarren Settings before requesting fixtures.",
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

    await this.bot.sendMessage(chatId, `Upcoming fixtures\n\n${message}`);
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

export const telegramService = new TelegramService();
