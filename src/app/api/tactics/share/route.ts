import { NextResponse, type NextRequest } from "next/server";
import {
  buildTacticalPlanSharePath,
  createTacticalPlanShare,
  getTacticalPlanShare,
  recordTacticalPlanShareCopy,
} from "@/server/services/tactical-plan-share";

export const runtime = "nodejs";

/**
 * Resolve a short slug back to its plan — lets a shortened challenge link
 * (`/?challenge={slug}`) fetch the opponent's formation client-side instead
 * of encoding it as raw query params. Doesn't increment the share's view
 * count — that's the `/play/[slug]` page's own metric (a distinct "viewed
 * the claim page" signal), not "resolved a challenge overlay".
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const record = await getTacticalPlanShare(slug);
  if (!record) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, plan: record.plan });
}

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
