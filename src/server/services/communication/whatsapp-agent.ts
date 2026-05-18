/**
 * WhatsApp ↔ Kite AI agent commander.
 *
 * Parses inbound WhatsApp messages into Kite agent intents and replies with
 * the on-chain attestation (tx hash + KiteScan link).
 *
 * Intents (case-insensitive, prefix "kite" optional):
 *   help                          – show usage
 *   find <query>                  – kiteAIService.searchMarketplace
 *   hire <agentId> [days]         – kiteAIService.hireAgent (needs squad link)
 *   scout <opponent>              – paid x402 call to KITE_SCOUT_SERVICE_URL
 *   pay <wallet> <usdc>           – kiteAIService.processSquadWagePayment
 *   status                        – analytics for the user's squad-manager agent
 *
 * Everything else (free-text) is acknowledged and ignored — the existing
 * availability-button flow keeps working untouched.
 */
import { prisma } from "@/lib/db";
import { kiteAIService } from "../ai/kite";
import { readX402Config } from "../blockchain/x402-client";
import { redisService } from "../redis";
import { generateInference } from "@/lib/ai/inference";

const EXPLORER_BASE = process.env.KITE_EXPLORER_URL || "https://testnet.kitescan.ai";
const SCOUT_SERVICE_URL = process.env.KITE_SCOUT_SERVICE_URL || "";
const SCOUT_MAX_USDC = Number(process.env.KITE_SCOUT_MAX_USDC || "0.50");
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || "sportwarrenbot";

const NLU_SYSTEM_PROMPT = `You are Marcus, Academy Director at SportWarren — a grassroots football platform that pairs real matches with on-chain agents on the Kite chain. You are talking on WhatsApp.

Rules (non-negotiable):
- Reply as Marcus. Never mention LLMs, models, OpenAI, Anthropic, Venice, Llama, or any provider. If asked who you are, say "I'm Marcus, Academy Director at SportWarren."
- Reply in at most 2 short sentences. No markdown asterisks, no bullet lists — WhatsApp renders them literally.
- Plain text only. Backticks around literal commands are OK.
- End with one concrete next step the user can copy.

The user can issue these deterministic commands (case-insensitive):
  help                  – show menu
  find <query>          – discover paid x402 services on Kite
  hire <agentId> [days] – delegate to an agent
  scout <opponent>      – paid scouting (settles on Kite)
  pay <wallet> <usdc>   – pay wages on Kite
  status                – agent analytics
  link <WA-XXXXXX>      – link this WhatsApp to a SportWarren account

If the user's intent clearly matches one command, reply with EXACTLY: RUN:<command>
(e.g. "scout Arsenal please" → RUN:scout Arsenal)
Otherwise reply as Marcus and suggest the closest command.`;

export type Reply = string;

export type CommanderSendText = (to: string, text: string) => Promise<void>;

export interface ResolvedActor {
  userId: string;
  squadId: string | null;
  displayName: string;
}

const HELP = [
  "🛰️ *SportWarren · Kite Agent*",
  "",
  "Commands:",
  "• `find <query>`  – discover paid x402 services",
  "• `hire <id> [days]`  – delegate to an agent",
  "• `scout <opponent>`  – paid scouting via Kite",
  "• `pay <wallet> <usdc>`  – pay wages on Kite",
  "• `status`  – your agent analytics",
  "• `link <WA-XXXXXX>`  – link this number to a SportWarren account",
  "• `help`  – this message",
  "",
  "Or just describe what you want — I'll figure it out.",
].join("\n");

const UNLINKED_REPLY = [
  "👋 This number isn't linked to a SportWarren account yet.",
  "",
  "Public commands you can use right now:",
  "• `help` – menu",
  "• `find <query>` – browse paid x402 services on Kite",
  "",
  "To unlock `hire`, `scout`, `pay`, `status`:",
  `1. Open our Telegram bot: https://t.me/${TELEGRAM_BOT_USERNAME}`,
  "2. Send `/linkwhatsapp` — you'll get a code like `WA-3F9A1C`.",
  "3. Reply to me with `link WA-3F9A1C`.",
].join("\n");

export async function resolveActor(whatsappNumber: string): Promise<ResolvedActor | null> {
  const identity = await prisma.platformIdentity.findUnique({
    where: {
      platform_platformUserId: {
        platform: "whatsapp",
        platformUserId: whatsappNumber,
      },
    },
    include: { user: { include: { squads: { take: 1, where: { status: "active" } } } } },
  });
  if (!identity) return null;
  return {
    userId: identity.userId,
    squadId: identity.user.squads[0]?.squadId ?? null,
    displayName: identity.user.name || identity.user.email || "Player",
  };
}

function fmtTx(txHash: string | undefined | null): string {
  if (!txHash) return "(no tx)";
  return `${EXPLORER_BASE}/tx/${txHash}`;
}

// ─── Link code consumption ───────────────────────────────────────────────────

async function consumeLinkCode(code: string, whatsappNumber: string): Promise<Reply> {
  const userId = await redisService.get(`kite:link:${code}`);
  if (!userId) {
    return "❌ Code expired or invalid. Run `/linkwhatsapp` in Telegram to get a fresh one.";
  }
  // Consume the code
  await redisService.del(`kite:link:${code}`);

  // Upsert PlatformIdentity
  await prisma.platformIdentity.upsert({
    where: { platform_platformUserId: { platform: "whatsapp", platformUserId: whatsappNumber } },
    update: { userId },
    create: { platform: "whatsapp", platformUserId: whatsappNumber, userId },
  });

  return "✅ Linked! This WhatsApp number is now connected to your SportWarren account.\n\nTry `status` or `scout <opponent>` to get started.";
}

// ─── AI fallback (NLU) ──────────────────────────────────────────────────────

async function aiFallback(
  rawText: string,
  from: string,
  /** Prevent infinite recursion if AI keeps returning RUN: */
  depth = 0,
): Promise<Reply | null> {
  try {
    const result = await generateInference(
      [{ role: "user", content: rawText }],
      { systemPrompt: NLU_SYSTEM_PROMPT, max_tokens: 120, temperature: 0.2 },
    );
    if (!result?.content) return null;

    // If the AI recognized a command, execute it directly.
    const runMatch = result.content.trim().match(/^RUN:(.+)$/i);
    if (runMatch && depth === 0) {
      const suggested = runMatch[1].trim();
      console.log(`[whatsapp-agent] AI mapped "${rawText}" → "${suggested}"`);
      // Recursive dispatch; cmd is now deterministic so won't re-enter AI.
      return dispatchWhatsAppCommand(suggested, from, /*aiDepth*/ depth + 1);
    }

    // Strip any leaked RUN: prefix if recursion budget exhausted
    return result.content.replace(/^RUN:\s*/i, "").trim();
  } catch (err) {
    console.error("[whatsapp-agent] aiFallback error", err);
    return null;
  }
}

/**
 * Dispatch a single text message to the appropriate Kite-agent action.
 * Returns a reply string the caller should send back via WhatsApp.
 */
export async function dispatchWhatsAppCommand(
  rawText: string,
  from: string,
  aiDepth = 0,
): Promise<Reply> {
  const text = rawText.trim().replace(/^kite\s+/i, "");
  const [head, ...rest] = text.split(/\s+/);
  const cmd = head?.toLowerCase() ?? "";
  const args = rest;

  if (!cmd || cmd === "help" || cmd === "/help" || cmd === "start" || cmd === "/start") {
    return HELP;
  }

  // Public commands — usable by anyone, no identity needed.
  if (cmd === "find" || cmd === "search") {
    const query = args.join(" ").trim() || "scout";
    const results = await kiteAIService.searchMarketplace(query);
    if (!results.length) return `🔎 No services found for "${query}".`;
    const lines = results.slice(0, 5).map((r, i) =>
      `${i + 1}. *${r.name}* — ${r.price} USDC\n   id: \`${r.id}\``,
    );
    return [`🔎 *Marketplace · ${query}*`, "", ...lines].join("\n");
  }

  if (cmd === "link") {
    const code = (args[0] || "").trim().toUpperCase();
    if (!/^WA-[A-F0-9]{6}$/.test(code)) {
      return "Usage: `link WA-XXXXXX`\nGet a code from our Telegram bot: `/linkwhatsapp`.";
    }
    return await consumeLinkCode(code, from);
  }

  const actor = await resolveActor(from);
  if (!actor) {
    // Try AI fallback first — maybe the user said "I want to link my account"
    const fallback = aiDepth === 0 ? await aiFallback(rawText, from, aiDepth) : null;
    if (fallback) return fallback;
    return UNLINKED_REPLY;
  }

  switch (cmd) {

    case "hire": {
      const targetId = args[0];
      const days = Number(args[1] || "7");
      if (!targetId) return "Usage: `hire <agentId> [days]`";
      if (!actor.squadId) return "❌ You need to belong to a squad to hire an agent.";
      const ok = await kiteAIService.hireAgent(targetId, actor.squadId, days);
      if (!ok) return `❌ Hire failed — reputation too low or agent has no service URL.`;
      return [
        `✅ Hired \`${targetId}\` for ${days}d.`,
        `Attestation saved on Kite.`,
        `Tip: try \`scout <opponent>\` to use them.`,
      ].join("\n");
    }

    case "scout": {
      if (!SCOUT_SERVICE_URL) {
        return "❌ KITE_SCOUT_SERVICE_URL is not configured on this deployment.";
      }
      const opponent = args.join(" ").trim();
      if (!opponent) return "Usage: `scout <opponent name>`";
      if (!actor.squadId) return "❌ You need to belong to a squad to commission scouting.";
      const manager = await kiteAIService.upsertSquadManagerAgent(actor.squadId);
      // Best-effort: top up a session if none exists
      try {
        await kiteAIService.createSession({
          agentId: manager.id,
          taskSummary: `WhatsApp scout: ${opponent}`,
          maxPerTxUsdc: SCOUT_MAX_USDC,
          maxTotalUsdc: SCOUT_MAX_USDC * 3,
          ttlSeconds: 3600,
          scope: { source: "whatsapp", opponent },
          approvedBy: actor.userId,
        });
      } catch {/* session exists or budget caps it later */}

      const res = await kiteAIService.executePaidRequest<{ summary?: string }>({
        agentId: manager.id,
        url: SCOUT_SERVICE_URL,
        method: "POST",
        body: { opponent, requestedBy: actor.userId },
        maxAmountUsdc: SCOUT_MAX_USDC,
        subject: { type: "squad", id: actor.squadId },
        kind: "scout_report",
      });
      if (!res.ok) return `❌ Scout failed: ${res.error}`;
      const lines = [
        `🛰️ *Scouting · ${opponent}*`,
        res.data?.summary ? `\n${res.data.summary}` : "Report attached to attestation.",
        "",
        `Settled on Kite → ${fmtTx(res.payment?.txHash)}`,
      ];
      return lines.join("\n");
    }

    case "pay": {
      const wallet = args[0];
      const amount = Number(args[1] || "0");
      if (!wallet || !amount) return "Usage: `pay <0xwallet> <usdcAmount>`";
      if (!actor.squadId) return "❌ Squad context required for wage payments.";
      const tx = await kiteAIService.processSquadWagePayment(actor.squadId, wallet, amount);
      if (!tx) return "❌ Payment refused (budget or limit exceeded).";
      return [
        `💸 *Wage paid*`,
        `${amount} USDC → \`${wallet.slice(0, 6)}…${wallet.slice(-4)}\``,
        `Settled on Kite → ${fmtTx(tx.transactionId)}`,
      ].join("\n");
    }

    case "status": {
      if (!actor.squadId) return "❌ No squad linked to this WhatsApp number.";
      const manager = await kiteAIService.upsertSquadManagerAgent(actor.squadId);
      const analytics = await kiteAIService.getAgentAnalytics(manager.id);
      if (!analytics) return "No activity yet.";
      const cfg = readX402Config();
      return [
        `📊 *${manager.name}*`,
        `Network: ${cfg.network}`,
        `Interactions: ${analytics.totalInteractions}`,
        `Success rate: ${(analytics.successRate * 100).toFixed(0)}%`,
        `Revenue / spend: ${analytics.revenue} USDC`,
      ].join("\n");
    }

    default: {
      const fallback = aiDepth === 0 ? await aiFallback(rawText, from, aiDepth) : null;
      if (fallback) return fallback;
      return `Didn't quite catch that. Try \`help\` to see what I can do. — Marcus`;
    }
  }
}
