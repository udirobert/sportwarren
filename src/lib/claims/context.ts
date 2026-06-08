/**
 * Claim Context Serialization
 * Bridges anonymous share claims → authenticated profile creation.
 * Single source of truth for the pending-claim shape and lifecycle.
 */

import type { PlayerPosition } from "@/types";

export interface PendingClaimContext {
  shareSlug: string;
  positionIndex: number;
  role: string;
  displayName: string;
  formation: string;
  remixSlug: string;
  claimToken: string;
}

const STORAGE_KEY = "sw_pending_claim";

/**
 * Map a formation role code (e.g. "CB", "CAM", "LW") to the coarse
 * PlayerPosition accepted by the profile API.
 */
export function roleToPosition(role: string): PlayerPosition {
  if (role === "GK") return "GK";
  if (role.includes("B") || role.includes("WB")) return "DF";
  if (role === "ST") return "ST";
  if (role.includes("W")) return "WG";
  return "MF";
}

export function isPendingClaimContext(value: unknown): value is PendingClaimContext {
  if (!value || typeof value !== "object") return false;
  const ctx = value as Partial<PendingClaimContext>;
  return (
    typeof ctx.shareSlug === "string" &&
    /^[a-zA-Z0-9_-]{4,32}$/.test(ctx.shareSlug) &&
    Number.isInteger(ctx.positionIndex) &&
    typeof ctx.positionIndex === "number" &&
    ctx.positionIndex >= 0 &&
    ctx.positionIndex <= 30 &&
    typeof ctx.role === "string" &&
    ctx.role.length > 0 &&
    ctx.role.length <= 8 &&
    typeof ctx.displayName === "string" &&
    ctx.displayName.trim().length >= 2 &&
    ctx.displayName.length <= 40 &&
    typeof ctx.formation === "string" &&
    ctx.formation.length > 0 &&
    ctx.formation.length <= 16 &&
    typeof ctx.remixSlug === "string" &&
    /^[a-zA-Z0-9_-]{6,64}$/.test(ctx.remixSlug) &&
    typeof ctx.claimToken === "string" &&
    ctx.claimToken.length > 20 &&
    ctx.claimToken.length <= 512
  );
}

export function encodePendingClaim(ctx: PendingClaimContext): string {
  return btoa(encodeURIComponent(JSON.stringify(ctx)));
}

export function decodePendingClaim(encoded: string): PendingClaimContext | null {
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(decodeURIComponent(encoded)))) as unknown;
    return isPendingClaimContext(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export function storePendingClaim(ctx: PendingClaimContext): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, encodePendingClaim(ctx));
  } catch {
    // ignore serialization failures
  }
}

export function getPendingClaim(): PendingClaimContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return decodePendingClaim(raw);
  } catch {
    return null;
  }
}

export function clearPendingClaim(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
