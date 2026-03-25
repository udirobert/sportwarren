import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyTelegramMiniAppMatch } from "@/server/services/communication/telegram-mini-app";

export const dynamic = "force-dynamic";

const verifyMatchSchema = z.object({
  token: z.string().min(1, "Mini App token is required"),
  matchId: z.string().min(1, "Match ID is required"),
  verified: z.boolean(),
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
  const parsed = verifyMatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const result = await verifyTelegramMiniAppMatch(prisma, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify match" },
      { status: 400 },
    );
  }
}
