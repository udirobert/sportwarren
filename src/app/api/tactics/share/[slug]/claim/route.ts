import { NextResponse, type NextRequest } from "next/server";
import { FORMATIONS } from "@/lib/formations";
import {
  getTacticalPlanShare,
  claimSharePosition,
  getShareClaims,
} from "@/server/services/tactical-plan-share";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/tactics/share/[slug]/claim
 * Returns all current claims for a share (for the pitch overlay polling).
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const record = await getTacticalPlanShare(slug);
  if (!record) {
    return NextResponse.json({ ok: false, error: "Share not found" }, { status: 404 });
  }

  const claims = await getShareClaims(record.id);
  return NextResponse.json({ ok: true, claims });
}

/**
 * POST /api/tactics/share/[slug]/claim
 * Body: { positionIndex: number; displayName: string }
 *
 * Returns:
 *   200 { ok: true, claim, alreadyClaimed: false, remixUrl }  — slot claimed
 *   409 { ok: false, alreadyClaimed: true, claim, claimedBy }  — slot already taken
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const positionIndex = typeof body.positionIndex === "number" ? body.positionIndex : Number(body.positionIndex);
  const displayName = typeof body.displayName === "string" ? body.displayName : "";

  if (!Number.isInteger(positionIndex) || positionIndex < 0) {
    return NextResponse.json({ ok: false, error: "positionIndex must be a non-negative integer" }, { status: 400 });
  }
  if (!displayName.trim()) {
    return NextResponse.json({ ok: false, error: "displayName is required" }, { status: 400 });
  }

  const record = await getTacticalPlanShare(slug);
  if (!record) {
    return NextResponse.json({ ok: false, error: "Share not found" }, { status: 404 });
  }

  // Fix 4: validate against the actual rendered slot count for this formation,
  // not plan.size — these can diverge if size and formation were set independently.
  const formationSlots = FORMATIONS[record.plan.formation] ?? [];
  if (positionIndex >= formationSlots.length) {
    return NextResponse.json(
      { ok: false, error: "Position index out of range for this formation" },
      { status: 400 },
    );
  }

  try {
    const { claim, alreadyClaimed } = await claimSharePosition(record.id, positionIndex, displayName);

    if (alreadyClaimed) {
      // Fix 1: return 409 with the actual claimant's name so the UI can show it.
      return NextResponse.json(
        {
          ok: false,
          alreadyClaimed: true,
          claim,
          claimedBy: claim.displayName,
        },
        { status: 409 },
      );
    }

    // Fix 3: derive base URL from the incoming request, with env override.
    const base = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const remixUrl = claim.remixSlug
      ? `${base}/play/${encodeURIComponent(slug)}?me=${positionIndex}&remix=${encodeURIComponent(claim.remixSlug)}`
      : `${base}/play/${encodeURIComponent(slug)}?me=${positionIndex}`;

    return NextResponse.json({
      ok: true,
      claim,
      alreadyClaimed: false,
      remixUrl,
    });
  } catch (error) {
    console.error("[tactics/share/claim] POST failed", error);
    return NextResponse.json({ ok: false, error: "Failed to claim position" }, { status: 500 });
  }
}
