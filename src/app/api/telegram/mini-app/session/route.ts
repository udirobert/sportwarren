import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyTelegramWebAppInitData } from "@/server/services/communication/telegram-auth";
import {
  createIdentityMiniAppSession,
  ensureTelegramIdentityForMiniApp,
  findSquadGroupByChatId,
  updateActiveSquadContext,
} from "@/server/services/communication/platform-connections";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  initData: z.string().min(1, "Telegram init data is required"),
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

  const verification = verifyTelegramWebAppInitData(parsed.data.initData);
  if (!verification.ok) {
    return NextResponse.json(
      { error: verification.error },
      { status: 401 },
    );
  }

  const identity = await ensureTelegramIdentityForMiniApp(prisma, {
    platformUserId: verification.data.platformUserId,
    chatId: verification.data.chatId,
    username: verification.data.username,
    displayName: verification.data.displayName,
    photoUrl: verification.data.photoUrl,
  });

  if (!identity) {
    return NextResponse.json(
      { error: "Could not resolve Telegram identity." },
      { status: 500 },
    );
  }

  const memberships = identity.user.squads;
  const membershipBySquad = new Map(
    memberships.map((membership) => [membership.squad.id, membership]),
  );

  let activeSquadId = identity.activeSquadId && membershipBySquad.has(identity.activeSquadId)
    ? identity.activeSquadId
    : null;

  if (verification.data.chatId) {
    const linkedGroup = await findSquadGroupByChatId(prisma, verification.data.chatId);
    if (linkedGroup?.squadId && membershipBySquad.has(linkedGroup.squadId)) {
      activeSquadId = linkedGroup.squadId;
    }
  }

  if (!activeSquadId && memberships.length > 0) {
    activeSquadId = memberships[0].squad.id;
  }

  if (activeSquadId && activeSquadId !== identity.activeSquadId) {
    await updateActiveSquadContext(prisma, identity.id, activeSquadId);
  }

  const session = await createIdentityMiniAppSession(
    prisma,
    identity.id,
    activeSquadId ?? undefined,
  );

  const activeSquad = activeSquadId ? membershipBySquad.get(activeSquadId)?.squad : null;

  return NextResponse.json(
    {
      token: session.token,
      hasSquad: Boolean(activeSquad),
      activeSquadId: activeSquad?.id ?? null,
      activeSquadName: activeSquad?.name ?? null,
      squadCount: memberships.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
