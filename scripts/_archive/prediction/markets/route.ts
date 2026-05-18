import { NextRequest, NextResponse } from "next/server";
import { getActiveMarkets } from "@/server/services/prediction/market";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category") || undefined;
    const sportType = request.nextUrl.searchParams.get("sportType") || undefined;
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    const markets = await getActiveMarkets({ category, sportType, limit, offset });

    return NextResponse.json({ markets });
  } catch (error) {
    console.error("Failed to fetch markets:", error);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}
