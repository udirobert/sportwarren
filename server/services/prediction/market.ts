import { prisma } from "@/lib/db";
import { openaiService } from "../openai";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateMarketInput {
  question: string;
  description?: string;
  category: string;
  sportType?: string;
  options: string[]; // ["Team A wins", "Draw", "Team B wins"]
  deadline: Date;
  settleBy: Date;
  creatorId: string;
  creatorName?: string;
}

export interface PlaceBetInput {
  marketId: string;
  optionId: string;
  userId: string;
  userName?: string;
  amount: number; // in nanoTON
  messageId?: string;
}

export interface SettleMarketInput {
  marketId: string;
  winningOptionId: string;
  aiReasoning: string;
}

// ============================================================================
// MARKET CREATION
// ============================================================================

export async function createPredictionMarket(input: CreateMarketInput) {
  // Validate deadline is in the future
  if (new Date(input.deadline) <= new Date()) {
    throw new Error("Deadline must be in the future");
  }

  // Validate we have at least 2 options
  if (input.options.length < 2) {
    throw new Error("At least 2 options are required");
  }

  // Create market with options in a transaction
  const market = await prisma.$transaction(async (tx) => {
    // Create the market
    const newMarket = await tx.predictionMarket.create({
      data: {
        question: input.question,
        description: input.description,
        category: input.category,
        sportType: input.sportType,
        creatorId: input.creatorId,
        creatorName: input.creatorName,
        deadline: input.deadline,
        settleBy: input.settleBy,
        status: "active",
      },
    });

    // Create options with default odds
    // Simple odds calculation: if n options, each starts at n.0
    const baseOdds = input.options.length;
    await tx.predictionOption.createMany({
      data: input.options.map((text, index) => ({
        marketId: newMarket.id,
        text,
        odds: baseOdds - index * 0.2, // Slight variation: first option slightly favored
        totalBet: 0,
      })),
    });

    return newMarket;
  });

  // Fetch the created market with options
  return getMarketById(market.id);
}

export async function getMarketById(marketId: string) {
  return prisma.predictionMarket.findUnique({
    where: { id: marketId },
    include: {
      options: {
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { bets: true },
      },
    },
  });
}

export async function getActiveMarkets(options?: {
  category?: string;
  sportType?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = {
    status: "active",
    deadline: { gt: new Date() }, // Only markets where betting is still open
  };

  if (options?.category) {
    where.category = options.category;
  }

  if (options?.sportType) {
    where.sportType = options.sportType;
  }

  return prisma.predictionMarket.findMany({
    where,
    include: {
      options: {
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { bets: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit || 20,
    skip: options?.offset || 0,
  });
}

// ============================================================================
// BETTING
// ============================================================================

export async function placeBet(input: PlaceBetInput) {
  // Validate market is still active
  const market = await prisma.predictionMarket.findUnique({
    where: { id: input.marketId },
    include: { options: true },
  });

  if (!market) {
    throw new Error("Market not found");
  }

  if (market.status !== "active") {
    throw new Error("Market is no longer active");
  }

  if (new Date() > new Date(market.deadline)) {
    throw new Error("Betting deadline has passed");
  }

  // Validate option belongs to this market
  const option = market.options.find((o) => o.id === input.optionId);
  if (!option) {
    throw new Error("Invalid option for this market");
  }

  // Calculate potential win
  const potentialWin = Math.floor(input.amount * option.odds);

  // Place bet in transaction
  const bet = await prisma.$transaction(async (tx) => {
    // Create the bet
    const newBet = await tx.predictionBet.create({
      data: {
        marketId: input.marketId,
        optionId: input.optionId,
        userId: input.userId,
        userName: input.userName,
        amount: input.amount,
        potentialWin,
        status: "pending",
        messageId: input.messageId,
      },
    });

    // Update option's total bet
    await tx.predictionOption.update({
      where: { id: input.optionId },
      data: { totalBet: { increment: input.amount } },
    });

    // Update market's total pool
    await tx.predictionMarket.update({
      where: { id: input.marketId },
      data: { totalPool: { increment: input.amount } },
    });

    return newBet;
  });

  return bet;
}

export async function getUserBetsForMarket(userId: string, marketId: string) {
  return prisma.predictionBet.findMany({
    where: {
      userId,
      marketId,
    },
    include: {
      option: true,
    },
  });
}

// ============================================================================
// AI OUTCOME VERIFICATION
// ============================================================================

export async function verifyOutcomeWithAI(marketId: string): Promise<{
  recommendedOptionId: string;
  reasoning: string;
  confidence: number;
}> {
  const market = await getMarketById(marketId);
  if (!market) {
    throw new Error("Market not found");
  }

  // Build the prompt for AI
  const optionsList = market.options
    .map((o, i) => `${i + 1}. ${o.text}`)
    .join("\n");

  const prompt = `You are an AI sports analyst verifying the outcome of a prediction market.

MARKET QUESTION: ${market.question}
${market.description ? `DESCRIPTION: ${market.description}` : ""}
CATEGORY: ${market.category}
${market.sportType ? `SPORT: ${market.sportType}` : ""}

OPTIONS:
${optionsList}

DEADLINE: ${market.deadline.toISOString()}
SETTLE BY: ${market.settleBy.toISOString()}

Today's date is ${new Date().toISOString()}.

Please search for and verify the actual result of this event. Then respond with:
1. The winning option number (1, 2, 3, etc.)
2. A brief explanation of why this is the correct outcome
3. Your confidence level (0.0 to 1.0)

Respond in JSON format:
{
  "winningOption": <number>,
  "reasoning": "<explanation>",
  "confidence": <number between 0 and 1>
}`;

  try {
    const response = await openaiService.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a sports prediction verification AI. Search for the actual result and verify the outcome.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");

    return {
      recommendedOptionId: market.options[result.winningOption - 1]?.id || "",
      reasoning: result.reasoning || "No reasoning provided",
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    console.error("AI verification failed:", error);
    throw new Error("Failed to verify outcome with AI");
  }
}

// ============================================================================
// MARKET SETTLEMENT
// ============================================================================

export async function settleMarket(input: SettleMarketInput) {
  const market = await prisma.predictionMarket.findUnique({
    where: { id: input.marketId },
    include: {
      options: {
        include: {
          bets: {
            where: { status: "pending" },
          },
        },
      },
    },
  });

  if (!market) {
    throw new Error("Market not found");
  }

  if (market.status !== "active") {
    throw new Error("Market is not active");
  }

  // Validate winning option
  const winningOption = market.options.find((o) => o.id === input.winningOptionId);
  if (!winningOption) {
    throw new Error("Invalid winning option");
  }

  // Calculate creator fee (5%)
  const creatorFee = Math.floor(market.totalPool * 0.05);

  // Settle in transaction
  await prisma.$transaction(async (tx) => {
    // Update market status
    await tx.predictionMarket.update({
      where: { id: input.marketId },
      data: {
        status: "settled",
        result: input.winningOptionId,
        aiVerified: true,
        aiReasoning: input.aiReasoning,
        creatorFee,
      },
    });

    // Update all bets
    for (const option of market.options) {
      const isWinner = option.id === input.winningOptionId;

      // Update all bets for this option
      await tx.predictionBet.updateMany({
        where: {
          optionId: option.id,
          status: "pending",
        },
        data: {
          status: isWinner ? "won" : "lost",
        },
      });
    }
  });

  return getMarketById(input.marketId);
}

// ============================================================================
// STATS
// ============================================================================

export async function getMarketStats(marketId: string) {
  const market = await prisma.predictionMarket.findUnique({
    where: { id: marketId },
    include: {
      options: {
        include: {
          bets: true,
        },
      },
      bets: true,
      _count: {
        select: { bets: true },
      },
    },
  });

  if (!market) {
    return null;
  }

  // Calculate stats
  const totalBetters = new Set(market.bets.map((b) => b.userId)).size;
  const winningBets = market.bets.filter((b) => b.status === "won");
  const totalPayout = winningBets.reduce((sum, b) => sum + b.potentialWin, 0);

  return {
    marketId: market.id,
    question: market.question,
    totalPool: market.totalPool,
    totalBetters,
    betCount: market._count.bets,
    totalPayout,
    creatorFee: market.creatorFee,
    options: market.options.map((o) => ({
      id: o.id,
      text: o.text,
      odds: o.odds,
      totalBet: o.totalBet,
      betCount: o.bets.length,
    })),
  };
}