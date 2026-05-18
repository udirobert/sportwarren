import TelegramBot from "node-telegram-bot-api";
import {
  createPredictionMarket,
  getActiveMarkets,
  getMarketById,
  placeBet,
  getMarketStats,
  verifyOutcomeWithAI,
  settleMarket,
} from "./market";

// ============================================================================
// COMMAND HANDLERS
// ============================================================================

export async function handleCreateMarket(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  args: string[]
) {
  const chatId = msg.chat.id;
  const userId = msg.from?.id?.toString() || "";
  const userName = msg.from?.username;

  // Parse arguments: /predict create "Question?" "Option1" "Option2" "Option3" --deadline 24h
  if (args.length < 4) {
    await bot.sendMessage(
      chatId,
      `📋 Create a prediction market:\n\n` +
        `/predict create "Who will win the match?" "Team A" "Draw" "Team B" --deadline 24h\n\n` +
        `Options:\n` +
        `- Category: --category sports (default: sports)\n` +
        `- Sport: --sport football\n` +
        `- Deadline: --deadline 24h (hours)\n` +
        `- Settle by: --settle 48h (hours from now)`
    );
    return;
  }

  // Simple parsing - find the question (first quoted string)
  const questionMatch = msg.text?.match(/"([^"]+)"/);
  if (!questionMatch) {
    await bot.sendMessage(chatId, "❌ Please provide the question in quotes.");
    return;
  }

  const question = questionMatch[1];

  // Extract options (remaining quoted strings)
  const allQuotes = msg.text?.match(/"([^"]+)"/g) || [];
  const options = allQuotes.slice(1).map((q) => q.replace(/"/g, ""));

  if (options.length < 2) {
    await bot.sendMessage(chatId, "❌ Please provide at least 2 options in quotes.");
    return;
  }

  // Parse flags
  const text = msg.text || "";
  const category = text.includes("--category")
    ? text.match(/--category\s+(\w+)/)?.[1] || "sports"
    : "sports";
  const sportType = text.includes("--sport")
    ? text.match(/--sport\s+(\w+)/)?.[1]
    : undefined;
  const deadlineHours = parseInt(text.match(/--deadline\s+(\d+)/)?.[1] || "24");
  const settleHours = parseInt(text.match(/--settle\s+(\d+)/)?.[1] || "48");

  const deadline = new Date(Date.now() + deadlineHours * 60 * 60 * 1000);
  const settleBy = new Date(Date.now() + settleHours * 60 * 60 * 1000);

  try {
    const market = await createPredictionMarket({
      question,
      category,
      sportType,
      options,
      deadline,
      settleBy,
      creatorId: userId,
      creatorName: userName,
    });

    if (!market) {
      throw new Error("Failed to load the created market.");
    }

    const optionsText = market.options
      .map((o, i) => `${i + 1}. ${o.text} (odds: ${o.odds.toFixed(2)})`)
      .join("\n");

    await bot.sendMessage(
      chatId,
      `🎯 *Prediction Market Created!*\n\n` +
        `*Question:* ${market.question}\n\n` +
        `*Options:*\n${optionsText}\n\n` +
        `💰 Total pool: ${(market.totalPool / 1e9).toFixed(2)} TON\n` +
        `⏰ Betting closes: ${market.deadline.toLocaleString()}\n\n` +
        `ID: \`${market.id}\``,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Failed to create market:", error);
    await bot.sendMessage(chatId, "❌ Failed to create market. Please try again.");
  }
}

export async function handleListMarkets(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  args: string[]
) {
  const chatId = msg.chat.id;

  const category = args.includes("--sports")
    ? "sports"
    : args.includes("--politics")
    ? "politics"
    : args.includes("--crypto")
    ? "crypto"
    : undefined;

  const markets = await getActiveMarkets({ category, limit: 10 });

  if (markets.length === 0) {
    await bot.sendMessage(chatId, "📭 No active prediction markets right now.");
    return;
  }

  const marketsText = await Promise.all(
    markets.slice(0, 5).map(async (m, i) => {
      return `${i + 1}. ${m.question.substring(0, 50)}...\n` +
        `   💰 ${(m.totalPool / 1e9).toFixed(2)} TON · ${m._count.bets} bets\n` +
        `   ID: \`${m.id.substring(0, 8)}...\``;
    })
  );

  await bot.sendMessage(
    chatId,
    `🎯 *Active Prediction Markets*\n\n${marketsText.join("\n\n")}\n\n` +
      `Use /predict bet <market_id> <option> <amount> to place a bet.`,
    { parse_mode: "Markdown" }
  );
}

export async function handlePlaceBet(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  args: string[]
) {
  const chatId = msg.chat.id;
  const userId = msg.from?.id?.toString() || "";
  const userName = msg.from?.username;

  // Parse: /predict bet <market_id> <option_number> <amount_in_ton>
  if (args.length < 4) {
    await bot.sendMessage(
      chatId,
      `📝 Place a bet:\n\n` +
        `/predict bet <market_id> <option_number> <amount>\n\n` +
        `Example: /predict bet abc123 1 5\n\n` +
        `This bets 5 TON on option 1.`
    );
    return;
  }

  const marketId = args[1];
  const optionNumber = parseInt(args[2]);
  const amountTON = parseFloat(args[3]);

  if (isNaN(optionNumber) || isNaN(amountTON)) {
    await bot.sendMessage(chatId, "❌ Invalid parameters.");
    return;
  }

  const amountNanoTON = Math.floor(amountTON * 1e9);

  try {
    // Get market to find option
    const market = await getMarketById(marketId);
    if (!market) {
      await bot.sendMessage(chatId, "❌ Market not found.");
      return;
    }

    const option = market.options[optionNumber - 1];
    if (!option) {
      await bot.sendMessage(chatId, `❌ Invalid option. Choose 1-${market.options.length}.`);
      return;
    }

    const bet = await placeBet({
      marketId,
      optionId: option.id,
      userId,
      userName,
      amount: amountNanoTON,
      messageId: msg.message_id?.toString(),
    });

    const potentialWin = (bet.potentialWin / 1e9).toFixed(2);

    await bot.sendMessage(
      chatId,
      `✅ *Bet Placed!*\n\n` +
        `Market: ${market.question.substring(0, 40)}...\n` +
        `Bet: ${amountTON} TON on "${option.text}"\n` +
        `💎 Potential win: ${potentialWin} TON\n` +
        `Odds: ${option.odds.toFixed(2)}`,
      { parse_mode: "Markdown" }
    );
  } catch (error: any) {
    await bot.sendMessage(chatId, `❌ ${error.message || "Failed to place bet."}`);
  }
}

export async function handleMarketInfo(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  args: string[]
) {
  const chatId = msg.chat.id;

  if (!args[1]) {
    await bot.sendMessage(chatId, "Usage: /predict info <market_id>");
    return;
  }

  const marketId = args[1];
  const stats = await getMarketStats(marketId);

  if (!stats) {
    await bot.sendMessage(chatId, "❌ Market not found.");
    return;
  }

  const optionsText = stats.options
    .map(
      (o, i) =>
        `${i + 1}. ${o.text}\n` +
        `   💰 ${(o.totalBet / 1e9).toFixed(2)} TON staked (${o.betCount} bets)\n` +
        `   📊 Odds: ${o.odds.toFixed(2)}`
    )
    .join("\n\n");

  await bot.sendMessage(
    chatId,
    `🎯 *${stats.question.substring(0, 50)}...*\n\n` +
      `💎 *Total Pool:* ${(stats.totalPool / 1e9).toFixed(2)} TON\n` +
      `👥 *Betters:* ${stats.totalBetters}\n` +
      `🎫 *Total Bets:* ${stats.betCount}\n\n` +
      `*Options:*\n${optionsText}\n\n` +
      `Use /predict bet ${marketId.substring(0, 8)} <option> <amount> to bet!`,
    { parse_mode: "Markdown" }
  );
}

export async function handleSettleMarket(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  args: string[]
) {
  const chatId = msg.chat.id;
  // Parse: /predict settle <market_id> <option_number>
  if (args.length < 3) {
    await bot.sendMessage(
      chatId,
      `⚖️ Settle a market:\n\n` +
        `/predict settle <market_id> <option_number>\n\n` +
        `This will verify with AI and settle the market.`
    );
    return;
  }

  const marketId = args[1];
  parseInt(args[2]);

  try {
    // First, verify with AI
    await bot.sendMessage(chatId, "🤖 Verifying outcome with AI...");

    const verification = await verifyOutcomeWithAI(marketId);

    await bot.sendMessage(
      chatId,
      `🤖 *AI Verification Result*\n\n` +
        `Confidence: ${(verification.confidence * 100).toFixed(0)}%\n` +
        `Reasoning: ${verification.reasoning.substring(0, 200)}...`,
      { parse_mode: "Markdown" }
    );

    // Settle the market
    const market = await settleMarket({
      marketId,
      winningOptionId: verification.recommendedOptionId,
      aiReasoning: verification.reasoning,
    });

    const winningOption = market?.options.find((o) => o.id === market.result);

    await bot.sendMessage(
      chatId,
      `✅ *Market Settled!*\n\n` +
        `🏆 Winner: ${winningOption?.text || "Unknown"}\n` +
        `💰 Total pool: ${(market?.totalPool || 0) / 1e9} TON\n` +
        `👤 Creator fee: ${((market?.creatorFee || 0) / 1e9).toFixed(2)} TON`,
      { parse_mode: "Markdown" }
    );
  } catch (error: any) {
    console.error("Settle failed:", error);
    await bot.sendMessage(chatId, `❌ ${error.message || "Failed to settle market."}`);
  }
}

// ============================================================================
// COMMAND REGISTRATION
// ============================================================================

export function setupPredictionCommands(bot: TelegramBot) {
  // /predict commands
  bot.onText(/\/predict(?:\s+(.*))?/, async (msg, match) => {
    const args = (match?.[1] || "").split(/\s+/).filter(Boolean);
    const command = args[0] || "help";

    switch (command) {
      case "create":
        await handleCreateMarket(bot, msg, args);
        break;
      case "list":
      case "markets":
        await handleListMarkets(bot, msg, args);
        break;
      case "bet":
        await handlePlaceBet(bot, msg, args);
        break;
      case "info":
      case "view":
        await handleMarketInfo(bot, msg, args);
        break;
      case "settle":
        await handleSettleMarket(bot, msg, args);
        break;
      default:
        await bot.sendMessage(
          msg.chat.id,
          `🎯 *Prediction Markets*\n\n` +
            `/predict create "Question" "Option1" "Option2" --deadline 24h\n` +
            `  Create a new prediction market\n\n` +
            `/predict list\n` +
            `  Show active markets\n\n` +
            `/predict bet <id> <option> <amount>\n` +
            `  Place a bet\n\n` +
            `/predict info <id>\n` +
            `  View market details\n\n` +
            `/predict settle <id> <option>\n` +
            `  Settle a market (creator only)`,
          { parse_mode: "Markdown" }
        );
    }
  });

  console.log("✅ Prediction commands registered");
}
