import { createHash, randomBytes, randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { FORMATIONS, getDefaultFormationForSize } from "@/lib/formations";
import { buildTacticalPlanQuery, type ImportedTacticalPlan } from "@/lib/pitch/tacticalPlan";
import type { Formation, PlayStyle, SquadSize } from "@/types";

const VALID_SIZES: SquadSize[] = [5, 6, 7, 11];
const VALID_STYLES: PlayStyle[] = ["balanced", "possession", "direct", "counter", "high_press", "low_block"];
const COLOR_RE = /^#?[0-9a-fA-F]{3,8}$/;

export interface TacticalPlanShareRecord {
  id: string;
  slug: string;
  plan: ImportedTacticalPlan;
  source: string;
  viewCount: number;
  copyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

type TacticalPlanShareRow = {
  id: string;
  slug: string;
  formation: string;
  play_style: string;
  squad_size: number;
  color: string | null;
  names: unknown;
  source: string;
  view_count: number;
  copy_count: number;
  created_at: Date;
  updated_at: Date;
};

function normalizeNames(input: unknown, size: SquadSize): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((name) => String(name || "").trim())
    .filter(Boolean)
    .map((name) => name.slice(0, 28))
    .slice(0, size);
}

export function normalizeTacticalPlan(input: unknown): ImportedTacticalPlan {
  const data = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

  const rawSize = Number(data.size || 5) as SquadSize;
  const size = VALID_SIZES.includes(rawSize) ? rawSize : 5;

  const rawFormation = String(data.formation || "") as Formation;
  const formation = rawFormation in FORMATIONS ? rawFormation : getDefaultFormationForSize(size);

  const rawStyle = String(data.style || data.playStyle || "balanced") as PlayStyle;
  const style = VALID_STYLES.includes(rawStyle) ? rawStyle : "balanced";

  const rawColor = typeof data.color === "string" ? data.color.trim() : "";
  const color = rawColor && COLOR_RE.test(rawColor)
    ? rawColor.startsWith("#") ? rawColor : `#${rawColor}`
    : undefined;

  return {
    formation,
    style,
    size,
    color,
    names: normalizeNames(data.names, size),
    source: "playground",
  };
}

export function getTacticalPlanTitle(plan: ImportedTacticalPlan): string {
  return `${plan.size}v${plan.size} / ${plan.formation} / ${plan.style.replace("_", " ")}`;
}

export function buildTacticalPlanSharePath(slug: string): string {
  return `/play/${encodeURIComponent(slug)}`;
}

export function buildTacticalPlanFallbackPath(plan: ImportedTacticalPlan): string {
  return `/?${buildTacticalPlanQuery(plan)}`;
}

function fingerprintPlan(plan: ImportedTacticalPlan): string {
  const stable = JSON.stringify({
    formation: plan.formation,
    style: plan.style,
    size: plan.size,
    color: plan.color || null,
    names: plan.names,
  });
  return createHash("sha256").update(stable).digest("hex");
}

function generateSlug(): string {
  return randomBytes(5).toString("base64url");
}

function rowToRecord(row: TacticalPlanShareRow): TacticalPlanShareRecord {
  const size = VALID_SIZES.includes(row.squad_size as SquadSize) ? row.squad_size as SquadSize : 5;
  const formation = row.formation in FORMATIONS ? row.formation as Formation : getDefaultFormationForSize(size);
  const style = VALID_STYLES.includes(row.play_style as PlayStyle) ? row.play_style as PlayStyle : "balanced";

  return {
    id: row.id,
    slug: row.slug,
    plan: {
      formation,
      style,
      size,
      color: row.color || undefined,
      names: normalizeNames(row.names, size),
      source: "playground",
    },
    source: row.source,
    viewCount: row.view_count,
    copyCount: row.copy_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createTacticalPlanShare(input: unknown): Promise<TacticalPlanShareRecord> {
  const plan = normalizeTacticalPlan(input);
  const fingerprint = fingerprintPlan(plan);

  const existing = await prisma.$queryRaw<TacticalPlanShareRow[]>`
    SELECT id, slug, formation, play_style, squad_size, color, names, source, view_count, copy_count, created_at, updated_at
    FROM tactical_plan_shares
    WHERE fingerprint = ${fingerprint}
    LIMIT 1
  `;

  if (existing[0]) {
    return rowToRecord(existing[0]);
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = generateSlug();
    try {
      const rows = await prisma.$queryRaw<TacticalPlanShareRow[]>`
        INSERT INTO tactical_plan_shares (
          id, slug, fingerprint, formation, play_style, squad_size, color, names, plan, source
        )
        VALUES (
          ${randomUUID()}, ${slug}, ${fingerprint}, ${plan.formation}, ${plan.style}, ${plan.size}, ${plan.color || null},
          ${JSON.stringify(plan.names)}::jsonb, ${JSON.stringify(plan)}::jsonb, ${plan.source}
        )
        RETURNING id, slug, formation, play_style, squad_size, color, names, source, view_count, copy_count, created_at, updated_at
      `;
      return rowToRecord(rows[0]);
    } catch (error: unknown) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
      if (code !== "23505" || attempt === 2) {
        throw error;
      }
    }
  }

  throw new Error("Failed to create tactical plan share");
}

export async function getTacticalPlanShare(slug: string, options?: { incrementView?: boolean }): Promise<TacticalPlanShareRecord | null> {
  const cleanSlug = slug.trim();
  if (!/^[a-zA-Z0-9_-]{4,32}$/.test(cleanSlug)) return null;

  const rows = options?.incrementView
    ? await prisma.$queryRaw<TacticalPlanShareRow[]>`
        UPDATE tactical_plan_shares
        SET view_count = view_count + 1, last_viewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE slug = ${cleanSlug}
        RETURNING id, slug, formation, play_style, squad_size, color, names, source, view_count, copy_count, created_at, updated_at
      `
    : await prisma.$queryRaw<TacticalPlanShareRow[]>`
        SELECT id, slug, formation, play_style, squad_size, color, names, source, view_count, copy_count, created_at, updated_at
        FROM tactical_plan_shares
        WHERE slug = ${cleanSlug}
        LIMIT 1
      `;

  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function recordTacticalPlanShareCopy(slug: string): Promise<void> {
  const cleanSlug = slug.trim();
  if (!/^[a-zA-Z0-9_-]{4,32}$/.test(cleanSlug)) return;

  await prisma.$executeRaw`
    UPDATE tactical_plan_shares
    SET copy_count = copy_count + 1, updated_at = CURRENT_TIMESTAMP
    WHERE slug = ${cleanSlug}
  `;
}

// ---------------------------------------------------------------------------
// Share claims
// ---------------------------------------------------------------------------

export interface ShareClaimRecord {
  id: string;
  shareId: string;
  positionIndex: number;
  displayName: string;
  remixSlug: string | null;
  claimedAt: Date;
}

type ShareClaimRow = {
  id: string;
  share_id: string;
  position_index: number;
  display_name: string;
  remix_slug: string | null;
  claimed_at: Date;
};

function rowToClaim(row: ShareClaimRow): ShareClaimRecord {
  return {
    id: row.id,
    shareId: row.share_id,
    positionIndex: row.position_index,
    displayName: row.display_name,
    remixSlug: row.remix_slug,
    claimedAt: row.claimed_at,
  };
}

export async function claimSharePosition(
  shareId: string,
  positionIndex: number,
  displayName: string,
): Promise<{ claim: ShareClaimRecord; alreadyClaimed: boolean }> {
  const cleanName = String(displayName || "").trim().slice(0, 28);
  if (!cleanName) throw new Error("Display name is required");
  if (positionIndex < 0 || positionIndex > 30) throw new Error("Invalid position index");

  // Check if already claimed
  const existing = await prisma.$queryRaw<ShareClaimRow[]>`
    SELECT id, share_id, position_index, display_name, remix_slug, claimed_at
    FROM share_claims
    WHERE share_id = ${shareId} AND position_index = ${positionIndex}
    LIMIT 1
  `;

  if (existing[0]) {
    return { claim: rowToClaim(existing[0]), alreadyClaimed: true };
  }

  // Generate a remix slug — shorter than the share slug, but still URL-safe
  const remixSlug = randomBytes(4).toString("base64url");

  const rows = await prisma.$queryRaw<ShareClaimRow[]>`
    INSERT INTO share_claims (id, share_id, position_index, display_name, remix_slug, updated_at)
    VALUES (${randomUUID()}, ${shareId}, ${positionIndex}, ${cleanName}, ${remixSlug}, CURRENT_TIMESTAMP)
    ON CONFLICT (share_id, position_index) DO UPDATE
      SET display_name = EXCLUDED.display_name, updated_at = CURRENT_TIMESTAMP
    RETURNING id, share_id, position_index, display_name, remix_slug, claimed_at
  `;

  return { claim: rowToClaim(rows[0]), alreadyClaimed: false };
}

export async function getShareClaims(shareId: string): Promise<ShareClaimRecord[]> {
  const rows = await prisma.$queryRaw<ShareClaimRow[]>`
    SELECT id, share_id, position_index, display_name, remix_slug, claimed_at
    FROM share_claims
    WHERE share_id = ${shareId}
    ORDER BY position_index ASC
  `;
  return rows.map(rowToClaim);
}

export async function getShareClaimsBySlug(shareSlug: string): Promise<ShareClaimRecord[]> {
  const cleanSlug = shareSlug.trim();
  if (!/^[a-zA-Z0-9_-]{4,32}$/.test(cleanSlug)) return [];

  const rows = await prisma.$queryRaw<ShareClaimRow[]>`
    SELECT sc.id, sc.share_id, sc.position_index, sc.display_name, sc.remix_slug, sc.claimed_at
    FROM share_claims sc
    JOIN tactical_plan_shares tps ON tps.id = sc.share_id
    WHERE tps.slug = ${cleanSlug}
    ORDER BY sc.position_index ASC
  `;
  return rows.map(rowToClaim);
}
