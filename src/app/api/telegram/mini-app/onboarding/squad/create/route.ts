import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createTelegramMiniAppSquad } from "@/server/services/communication/telegram-mini-app";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  token: z.string().min(1, "Mini App token is required"),
  name: z.string().trim().min(2, "Squad name must be at least 2 characters"),
  shortName: z.string().trim().min(2, "Short name is required").max(5, "Short name must be 2-5 characters"),
  homeGround: z.string().trim().max(64, "Home ground can be up to 64 characters").optional(),
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
    const squad = await createTelegramMiniAppSquad(prisma, parsed.data);
    return NextResponse.json({ squad });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create squad." },
      { status: 400 },
    );
  }
}
