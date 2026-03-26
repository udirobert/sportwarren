import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { joinTelegramMiniAppSquad } from "@/server/services/communication/telegram-mini-app";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  token: z.string().min(1, "Mini App token is required"),
  squadId: z.string().min(1, "Squad ID is required"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 },
    );
  }

  try {
    const squad = await joinTelegramMiniAppSquad(prisma, parsed.data);
    return NextResponse.json({ squad });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to join squad." },
      { status: 400 },
    );
  }
}
