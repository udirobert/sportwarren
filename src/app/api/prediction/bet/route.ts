import { NextRequest, NextResponse } from "next/server";
import { placeBet } from "@/server/services/prediction/market";
import {
  extractWalletFromHeaders,
  verifyWalletSignature,
  isSupportedWalletChain,
} from "@/lib/auth/wallet";
import { checkRateLimit } from "@/server/services/security/rate-limiter";

const MAX_BET_AMOUNT_TON = 100;

export async function POST(request: NextRequest) {
  try {
    // Authenticate via wallet signature (same primitives as tRPC)
    const headers = request.headers;
    const walletInfo = extractWalletFromHeaders(headers);
    const chain = walletInfo.chain?.toLowerCase();

    if (!walletInfo.address || !chain || !isSupportedWalletChain(chain)) {
      return NextResponse.json(
        { error: "Wallet authentication required" },
        { status: 401 }
      );
    }

    if (!walletInfo.signature || !walletInfo.message || !walletInfo.timestamp) {
      return NextResponse.json(
        { error: "Wallet signature required" },
        { status: 401 }
      );
    }

    const verification = await verifyWalletSignature({
      address: walletInfo.address,
      chain,
      signature: walletInfo.signature,
      message: walletInfo.message,
      timestamp: parseInt(walletInfo.timestamp, 10),
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Invalid wallet signature" },
        { status: 401 }
      );
    }

    // Rate limit: 10 bets per minute per wallet
    const rateLimitResult = await checkRateLimit(
      `bet:${walletInfo.address}`,
      { windowMs: 60_000, max: 10, keyPrefix: "prediction", strict: true }
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many bets. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { marketId, optionId, amount } = body;

    if (!marketId || !optionId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid bet amount" },
        { status: 400 }
      );
    }

    if (amount > MAX_BET_AMOUNT_TON) {
      return NextResponse.json(
        { error: `Maximum bet amount is ${MAX_BET_AMOUNT_TON} TON` },
        { status: 400 }
      );
    }

    const bet = await placeBet({
      marketId,
      optionId,
      userId: walletInfo.address,
      userName: undefined,
      amount,
    });

    return NextResponse.json({ bet });
  } catch (error: any) {
    console.error("Failed to place bet:", error);
    return NextResponse.json(
      { error: error.message || "Failed to place bet" },
      { status: 400 }
    );
  }
}