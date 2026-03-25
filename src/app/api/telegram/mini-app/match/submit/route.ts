import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { submitTelegramMiniAppMatch } from "@/server/services/communication/telegram-mini-app";

export const dynamic = "force-dynamic";

const submitMatchSchema = z.object({
  token: z.string().min(1, "Mini App token is required"),
  opponentName: z.string().min(2, "Opponent squad name is required"),
  homeScore: z.number().int().min(0, "Home score cannot be negative"),
  awayScore: z.number().int().min(0, "Away score cannot be negative"),
  isHome: z.boolean(),
  matchDate: z.string().datetime().optional(),
  yellowSettlement: z
    .object({
      sessionId: z.string().min(1, "Yellow session ID is required"),
      version: z.number().int().nonnegative("Yellow version must be non-negative"),
      settlementId: z.string().min(1).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = submitMatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const match = await submitTelegramMiniAppMatch(prisma, {
      ...parsed.data,
      matchDate: parsed.data.matchDate ? new Date(parsed.data.matchDate) : undefined,
    });

    return NextResponse.json(match);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit match" },
      { status: 400 },
    );
  }
}
