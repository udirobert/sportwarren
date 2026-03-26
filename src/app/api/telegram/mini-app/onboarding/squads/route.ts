import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { searchTelegramMiniAppOnboardingSquads } from "@/server/services/communication/telegram-mini-app";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  token: z.string().min(1, "Mini App token is required"),
  q: z.string().optional().default(""),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    token: request.nextUrl.searchParams.get("token"),
    q: request.nextUrl.searchParams.get("q") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 },
    );
  }

  try {
    const squads = await searchTelegramMiniAppOnboardingSquads(
      prisma,
      parsed.data.token,
      parsed.data.q,
    );

    return NextResponse.json(
      { squads },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load squads." },
      { status: 400 },
    );
  }
}
