import { NextRequest, NextResponse } from "next/server";
import { placeBet } from "@/server/services/prediction/market";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, optionId, amount, userId, userName } = body;

    if (!marketId || !optionId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For now, use a placeholder userId if not provided
    // In production, this would come from the authenticated session
    const resolvedUserId = userId || "anonymous";
    const resolvedUserName = userName || undefined;

    const bet = await placeBet({
      marketId,
      optionId,
      userId: resolvedUserId,
      userName: resolvedUserName,
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