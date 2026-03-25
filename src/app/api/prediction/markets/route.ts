import { NextRequest, NextResponse } from "next/server";
import { getActiveMarkets } from "@/server/services/prediction/market";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const sportType = searchParams.get("sportType") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const markets = await getActiveMarkets({ category, sportType, limit, offset });

    return NextResponse.json({ markets });
  } catch (error) {
    console.error("Failed to fetch markets:", error);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}