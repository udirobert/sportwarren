import { NextRequest, NextResponse } from "next/server";
import { getMarketById, getMarketStats } from "@/server/services/prediction/market";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const market = await getMarketById(resolvedParams.id);

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    const stats = await getMarketStats(resolvedParams.id);

    return NextResponse.json({ market: stats });
  } catch (error) {
    console.error("Failed to fetch market:", error);
    return NextResponse.json(
      { error: "Failed to fetch market" },
      { status: 500 }
    );
  }
}