import { NextResponse, type NextRequest } from "next/server";
import {
  buildTacticalPlanSharePath,
  createTacticalPlanShare,
  recordTacticalPlanShareCopy,
} from "@/server/services/tactical-plan-share";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const record = await createTacticalPlanShare(body?.plan ?? body);
    const path = buildTacticalPlanSharePath(record.slug);
    const url = new URL(path, request.nextUrl.origin).toString();

    return NextResponse.json({
      ok: true,
      slug: record.slug,
      path,
      url,
      plan: record.plan,
    });
  } catch (error) {
    console.error("[tactics/share] POST failed", error);
    return NextResponse.json({ ok: false, error: "Failed to create tactic share" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = typeof body?.slug === "string" ? body.slug : "";
    await recordTacticalPlanShareCopy(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[tactics/share] PATCH failed", error);
    return NextResponse.json({ ok: false, error: "Failed to update tactic share" }, { status: 500 });
  }
}
