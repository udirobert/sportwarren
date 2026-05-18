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
 *   scouts                        – list recent scouting reports
 *   budget                        – show remaining daily scout budget
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
const SCOUT_MAX_USDC_SQUAD = Number(process.env.KITE_SCOUT_MAX_USDC_SQUAD || "2.50");
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || "sportwarrenbot";

const NLU_SYSTEM_PROMPT = `You are Marcus, Academy Director at SportWarren. You talk to amateur football squads on WhatsApp.

WHAT SPORTWARREN IS
A grassroots football platform with on-chain AI agents. Every squad has an autonomous "manager" agent on the Kite chain that can discover paid services, hire other agents, scout opponents, and pay player wages — all settling in USDC on Kite with an on-chain attestation (receipt). Squads are organised on our Telegram bot and (now) reachable on WhatsApp.

COMMANDS (case-insensitive)
- help — show this list
- find <query> — discover paid services on Kite (e.g. find scout, find coach)
- scout <opponent> — your agent buys an AI scouting report on an opponent; settles on Kite, ~$0.50
- scouts — list your recent scouting reports with explorer links
- budget — show how much scouting budget you have left today
- hire <agentId> [days] — delegate work to another agent for N days; gated by reputation
- pay <0xwallet> <usdc> — pay a player wages directly on Kite chain in USDC
- status — show your squad agent's interactions, spend and success rate
- link <WA-XXXXXX> — link this WhatsApp to your SportWarren account (get the code from /linkwhatsapp on our Telegram bot)

HOW TO REPLY
1. Always speak as Marcus. Never mention AI, LLMs, models, OpenAI, Anthropic, Venice, Llama or any provider. If asked who you are: "I'm Marcus, Academy Director at SportWarren."
2. Plain text only. No asterisks, no bullets, no headings — WhatsApp renders them literally. Backticks around literal commands are OK.
3. Max 3 short sentences.

OUTPUT MODE — pick exactly one, never mix:

  MODE A (action) — when the user clearly wants to DO something that maps to a command. Reply with a SINGLE line, nothing else:
    RUN:<command with args>
  Examples:
    "scout Arsenal" → RUN:scout Arsenal
    "show me my scouts" → RUN:scouts
    "what's my budget" → RUN:budget
    "pay 0xabc 5" → RUN:pay 0xabc 5
    "show me my stats" → RUN:status

  MODE B (explain) — when the user is asking what something means, how the app works, or chatting. Give a real explanation as Marcus in 1-3 sentences and end with ONE concrete command they can copy. NEVER include the literal text "RUN:" anywhere in MODE B replies.
  Examples:
    "what is scouting" → "Scouting is when your squad agent pays a small fee on the Kite chain for an AI report on an opponent — useful before a match. Try \`scout Liverpool\` to see one."
    "how do i use this" → "I run your squad's on-chain agent on Kite. Link this number with \`link WA-XXXXXX\` (get a code from /linkwhatsapp on our Telegram bot) and you'll unlock scout, hire, pay and status."`;

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
  "*Scouting*",
  "• `scout <opponent>`  – paid AI scouting report ($0.50 USDC)",
  "• `scouts`           – show your recent reports with explorer links",
  "• `budget`           – how much scout budget remains today",
  "• `trigger-auto-scout` – demo: auto-scout your next opponent now",
  "",
  "*Actions*",
  "• `find <query>`     – discover paid x402 services",
  "• `hire <id> [days]` – delegate to an agent",
  "• `pay <wallet> <usdc>` – pay wages on Kite",
  "• `status`           – your agent analytics",
  "• `cost`             – pricing for all services",
  "• `attestations`     – view recent on-chain attestations",
  "",
  "*Account*",
  "• `whoami`           – show your linked identity and squad",
  "• `link <WA-XXXXXX>` – link this number to your SportWarren account",
  "• `unlink`           – unlink this WhatsApp number",
  "• `help`             – this message",
  "",
  "Just describe what you want — I'll figure it out.",
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

/** Allow-list of commands the AI can actually trigger via RUN: */
const RUN_ALLOWED = new Set([
  "help", "find", "search", "hire", "scout", "scouts", "budget", "pay", "status", "link",
  "whoami", "unlink", "cost", "attestations", "trigger-auto-scout",
]);

async function aiFallback(
  rawText: string,
  from: string,
  /** Prevent infinite recursion if AI keeps returning RUN: */
  depth = 0,
): Promise<Reply | null> {
  try {
    const result = await generateInference(
      [{ role: "user", content: rawText }],
      { systemPrompt: NLU_SYSTEM_PROMPT, max_tokens: 160, temperature: 0.2 },
    );
    if (!result?.content) return null;

    const raw = result.content.trim();

    // MODE A: response is *only* a RUN line (single line, nothing else).
    if (depth === 0) {
      const pure = raw.match(/^RUN:\s*(\S.+?)\s*$/i);
      if (pure && !/\n/.test(raw)) {
        const cmd = pure[1].split(/\s+/)[0].toLowerCase();
        if (RUN_ALLOWED.has(cmd)) {
          console.log(`[whatsapp-agent] AI mapped "${rawText}" → "${pure[1]}"`);
          return dispatchWhatsAppCommand(pure[1], from, depth + 1);
        }
      }
    }

    // MODE B (or model misbehaved): treat as prose and scrub any RUN: leakage.
    const prose = raw
      .split("\n")
      .filter((line) => !/^\s*RUN:/i.test(line))
      .join("\n")
      .replace(/\s*RUN:\S+(?:\s+\S+)*\s*$/i, "")  // trailing "RUN:foo bar"
      .trim();

    if (prose && depth === 0) {
      return [
        prose,
        "",
        `⚡ To unlock full commands, link via Telegram: https://t.me/${TELEGRAM_BOT_USERNAME} then /linkwhatsapp`,
      ].join("\n");
    }

    return prose || null;
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

      // --- SPENDING GUARDS (dual cap: per-user + per-squad) ---
      const userSpending = await kiteAIService.checkUserSpending(actor.userId, SCOUT_MAX_USDC, SCOUT_MAX_USDC);
      if (!userSpending.ok) {
        return `❌ Your daily scout limit reached (${SCOUT_MAX_USDC} USDC/person).`;
      }
      if (actor.squadId) {
        const squadSpending = await kiteAIService.checkSquadSpending(actor.squadId, SCOUT_MAX_USDC, SCOUT_MAX_USDC_SQUAD);
        if (!squadSpending.ok) {
          return `❌ Squad daily scout limit reached (${SCOUT_MAX_USDC_SQUAD} USDC/squad).`;
        }
      }

      const manager = await kiteAIService.upsertSquadManagerAgent(actor.squadId);
      // Best-effort: top up a session if none exists
      try {
        await kiteAIService.createSession({
          agentId: manager.id,
          taskSummary: `WhatsApp scout: ${opponent}`,
          maxPerTxUsdc: SCOUT_MAX_USDC,
          maxTotalUsdc: SCOUT_MAX_USDC * 5, // Allow a few reports per session
          ttlSeconds: 3600,
          scope: { source: "whatsapp", opponent },
          approvedBy: actor.userId,
        });
      } catch {/* session exists or budget caps it later */}

      const res = await kiteAIService.executePaidRequest<{ summary?: string; dataSources?: string[] }>({
        agentId: manager.id,
        url: SCOUT_SERVICE_URL,
        method: "POST",
        body: { opponent, requestedBy: actor.userId },
        maxAmountUsdc: SCOUT_MAX_USDC,
        subject: { type: "squad", id: actor.squadId },
        kind: "scout_report",
      });
      if (!res.ok) return `❌ Scout failed: ${res.error}`;

      // Read remaining budget to include in the reply
      const remaining = await kiteAIService.getUserSpending(actor.userId, SCOUT_MAX_USDC);

      const txUrl = fmtTx(res.payment?.txHash);
      const dataSources = (res.data as any)?.dataSources as string[] | undefined;
      const dataSourceLine = dataSources?.length
        ? `📊 Data: ${dataSources.join(" · ")}`
        : "📊 Data: AI-generated (no stored match data)";
      const lines = [
        `🛰️ *Scouting Report · ${opponent}*`,
        res.data?.summary ? `\n${res.data.summary}` : "\n(Report data is available on-chain via the attestation.)",
        "",
        `✅ *Settled on Kite*`,
        `Receipt: ${txUrl}`,
        dataSourceLine,
        `Budget: ${remaining.remaining.toFixed(2)} left today. \`scouts\` → all reports.`,
      ];
      return lines.join("\n");
    }

    case "trigger-auto-scout":
    case "autoscout":
    case "auto-scout": {
      if (!actor.squadId) return "❌ No squad linked — join or create a squad first.";
      // Find the next upcoming match for the user's squad
      const upcoming = await prisma.match.findFirst({
        where: {
          OR: [{ homeSquadId: actor.squadId }, { awaySquadId: actor.squadId }],
          matchDate: { gt: new Date() },
          status: 'pending',
        },
        select: {
          id: true,
          matchDate: true,
          homeSquadId: true,
          awaySquadId: true,
          homeSquad: { select: { name: true } },
          awaySquad: { select: { name: true } },
        },
        orderBy: { matchDate: 'asc' },
      });
      if (!upcoming) return "❌ No upcoming matches found for your squad.";
      const isHome = upcoming.homeSquadId === actor.squadId
      const opponent = isHome ? upcoming.awaySquad.name : upcoming.homeSquad.name;
      const matchTime = upcoming.matchDate.toLocaleString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit',
      });

      // Execute the auto-scout inline
      const manager = await kiteAIService.upsertSquadManagerAgent(actor.squadId);
      try {
        await kiteAIService.createSession({
          agentId: manager.id,
          taskSummary: `Demo trigger: auto-scout ${opponent}`,
          maxPerTxUsdc: SCOUT_MAX_USDC,
          maxTotalUsdc: SCOUT_MAX_USDC * 5,
          ttlSeconds: 600,
          scope: { source: 'whatsapp-trigger', opponent },
          approvedBy: actor.userId,
        });
      } catch { /* skip */ }

      const res = await kiteAIService.executePaidRequest<{ summary?: string; dataSources?: string[] }>({
        agentId: manager.id,
        url: SCOUT_SERVICE_URL,
        method: 'POST',
        body: { opponent, requestedBy: actor.userId },
        maxAmountUsdc: SCOUT_MAX_USDC,
        subject: { type: 'squad', id: actor.squadId },
        kind: 'scout_report',
      });
      if (!res.ok) return `❌ Auto-scout failed: ${res.error}`;

      const txUrl = fmtTx(res.payment?.txHash);
      const summary = res.data?.summary || 'No summary available.';
      const dataSources = (res.data as any)?.dataSources as string[] | undefined;
      const dataSourceLine = dataSources?.length
        ? `📊 Data: ${dataSources.join(' · ')}`
        : '📊 Data: AI-generated (no stored match data)';

      return [
        `🛰️ *Auto-Scout Demo*`,
        `Match: vs *${opponent}* (${matchTime})`,
        '',
        summary,
        '',
        `✅ *Settled on Kite*`,
        `Receipt: ${txUrl}`,
        dataSourceLine,
        `Price: ${SCOUT_MAX_USDC.toFixed(2)} USDC`,
        '',
        'This is what the autonomous cron does 24h before every match. Try `help` to see all commands.',
      ].join('\n');
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

    case "scouts": {
      const reports = await prisma.attestation.findMany({
        where: {
          kind: "scout_report",
          OR: [
            ...(actor.squadId
              ? [{ subjectType: "squad", subjectId: actor.squadId }]
              : []),
            { subjectType: "player", subjectId: actor.userId },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      });
      if (!reports.length) {
        return "No scouting reports yet. Try `scout <opponent>` to commission one.";
      }

      // Deduplicate by opponent name — x402-client writes an audit attestation
      // AND the scout route writes a content attestation for each scout
      const seen = new Set<string>();
      const uniq: typeof reports = [];
      for (const r of reports) {
        const payload = r.payload as Record<string, string> | null;
        const name = payload?.opponent ?? "";
        if (!name || seen.has(name)) continue;
        seen.add(name);
        uniq.push(r);
        if (uniq.length >= 5) break;
      }

      if (!uniq.length) {
        return "No scouting reports yet. Try `scout <opponent>` to commission one.";
      }

      const lines = [`📋 *Recent Scouts (${uniq.length})*`, ""];
      for (const r of uniq) {
        const payload = r.payload as Record<string, string> | null;
        const name = payload?.opponent ?? "unknown";
        const date = r.createdAt.toLocaleDateString("en-GB", {
          day: "numeric", month: "short",
        });
        const link = fmtTx(r.txHash);
        lines.push(`• ${date} — *${name}*`);
        lines.push(`  ${link}`);
      }
      lines.push("", "`scout <opponent>` → new report · `budget` → check limit");
      return lines.join("\n");
    }

    case "budget": {
      if (!actor.squadId) return "❌ No squad linked to this WhatsApp number.";
      const spending = await kiteAIService.getUserSpending(actor.userId, SCOUT_MAX_USDC);
      const pct = SCOUT_MAX_USDC > 0 ? (spending.spent / SCOUT_MAX_USDC) * 100 : 0;
      const barLen = 12;
      const filled = Math.round((pct / 100) * barLen);
      const bar = "█".repeat(filled) + "░".repeat(Math.max(0, barLen - filled));

      const tips: string[] = [];
      if (spending.remaining >= SCOUT_MAX_USDC) {
        tips.push("You have a full daily budget — try `scout <opponent>` to start.");
      } else if (spending.remaining > 0) {
        tips.push(`You can still scout \`${Math.floor(spending.remaining / SCOUT_MAX_USDC)}\` more opponent(s) today.`);
      } else {
        tips.push("Limit resets tomorrow. Check `scouts` to review what you've got.");
      }

      return [
        `💳 *Scout Budget · Today*`,
        `Daily limit: $${SCOUT_MAX_USDC.toFixed(2)} USDC`,
        `Spent: $${spending.spent.toFixed(2)} · Remaining: $${spending.remaining.toFixed(2)}`,
        `${bar}`,  // Uses WhatsApp monospace
        "",
        tips[0],
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
        `Try \`scouts\` to see your reports or \`budget\` to check limit.`,
      ].join("\n");
    }

    case "whoami": {
      const squadInfo = actor.squadId
        ? "Squad: " + actor.squadId.slice(0, 8) + ".."
        : "No active squad.";
      const identities = await prisma.platformIdentity.findMany({
        where: { userId: actor.userId },
        select: { platform: true },
      });
      const platforms = identities.map((i) => i.platform).join(", ") || "none";
      return [
        "*" + actor.displayName + "*",
        "ID: " + actor.userId.slice(0, 8) + "..",
        squadInfo,
        `Linked platforms: ${platforms}`,
        "",
        "Try `status` for agent analytics or `scout <opponent>` for a report.",
      ].join("\n");
    }

    case "unlink": {
      await prisma.platformIdentity.deleteMany({
        where: { platform: "whatsapp", platformUserId: from },
      });
      return "✅ WhatsApp unlinked from your SportWarren account.\n\nTo re-link, get a fresh code from `/linkwhatsapp` in Telegram and reply with `link WA-XXXXXX`.";
    }

    case "cost": {
      return [
        "💳 *Service Pricing*",
        "",
        "• `scout <opponent>` — $0.50 USDC (AI scouting report + Kite attestation)",
        "• `hire <id> [days]` — varies by agent (reputation-gated)",
        "• `pay <wallet> <usdc>` — direct USDC transfer on Kite",
        "",
        "All prices in USDC on Kite Testnet. Daily budget limits apply per user and per squad.",
        "Check `budget` for your remaining scout budget.",
      ].join("\n");
    }

    case "attestations": {
      const atts = await prisma.attestation.findMany({
        where: {
          OR: [
            ...(actor.squadId
              ? [{ subjectType: "squad", subjectId: actor.squadId }]
              : []),
            { subjectType: "player", subjectId: actor.userId },
            { subjectType: "agent" as const, subjectId: actor.userId },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      if (!atts.length) {
        return "No on-chain attestations yet. Try `scout <opponent>` or `pay <wallet> <usdc>` to create one.";
      }
      const lines = [`📜 *Recent Attestations (${atts.length})*`, ""];
      for (const a of atts) {
        const date = a.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        const link = fmtTx(a.txHash);
        const amount = a.amountUsdc ? ` ${a.amountUsdc.toFixed(2)}` : "";
        lines.push(`• ${date} — *${a.kind}*${amount}`);
        lines.push(`  ${link}`);
      }
      lines.push("", "`attestations` refreshes · `scouts` for scout reports only.");
      return lines.join("\n");
    }

    default: {
      const fallback = aiDepth === 0 ? await aiFallback(rawText, from, aiDepth) : null;
      if (fallback) return fallback;
      return `Didn't quite catch that. Try \`help\` to see what I can do. — Marcus`;
    }
  }
}
