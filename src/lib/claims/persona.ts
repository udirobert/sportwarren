import type { AttributeKey } from "@/server/services/personalization/twin-types";
import type { PlayerPosition } from "@/types";

export interface PendingPersonaContext {
  displayName: string;
  position: PlayerPosition;
  savedAt: number;
  formation?: string;
  avatarBase64?: string;
  avatarMimeType?: string;
  attributeDeltas?: Partial<Record<AttributeKey, number>>;
  squadNickname?: string;
  squadColor?: string;
}

const STORAGE_KEY = "sw_pending_persona";
const TTL_MS = 86_400_000; // 24 hours

const PLAYER_POSITIONS: PlayerPosition[] = ["GK", "DF", "MF", "ST", "WG"];

export function isPendingPersonaContext(value: unknown): value is PendingPersonaContext {
  if (!value || typeof value !== "object") return false;
  const ctx = value as Partial<PendingPersonaContext>;
  return (
    typeof ctx.displayName === "string" &&
    ctx.displayName.trim().length >= 2 &&
    ctx.displayName.length <= 40 &&
    typeof ctx.position === "string" &&
    PLAYER_POSITIONS.includes(ctx.position as PlayerPosition) &&
    typeof ctx.savedAt === "number" &&
    Number.isFinite(ctx.savedAt) &&
    (ctx.formation === undefined || (typeof ctx.formation === "string" && ctx.formation.length > 0 && ctx.formation.length <= 16)) &&
    (ctx.avatarBase64 === undefined || typeof ctx.avatarBase64 === "string") &&
    (ctx.avatarMimeType === undefined || typeof ctx.avatarMimeType === "string") &&
    (ctx.attributeDeltas === undefined || (typeof ctx.attributeDeltas === "object" && ctx.attributeDeltas !== null && Object.values(ctx.attributeDeltas).every(v => typeof v === "number"))) &&
    (ctx.squadNickname === undefined || typeof ctx.squadNickname === "string") &&
    (ctx.squadColor === undefined || typeof ctx.squadColor === "string")
  );
}

export function storePendingPersona(ctx: PendingPersonaContext): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    // ignore storage failures; sign-up can still continue without prefill
  }
}

export function getPendingPersona(): PendingPersonaContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isPendingPersonaContext(parsed)) return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      clearPendingPersona();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPersona(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Read + clear atomically so a mid-flow refresh can't re-prefill. */
export function consumePendingPersona(): PendingPersonaContext | null {
  const persona = getPendingPersona();
  if (persona) clearPendingPersona();
  return persona;
}

/** Merge partial updates into the existing pending persona without
 *  overwriting unrelated fields (e.g. update squad color without
 *  touching name/position). */
export function patchPendingPersona(partial: Partial<Omit<PendingPersonaContext, 'savedAt'>>): void {
  if (typeof window === "undefined") return;
  const existing = getPendingPersona();
  const next: PendingPersonaContext = {
    displayName: existing?.displayName ?? partial.displayName ?? '',
    position: existing?.position ?? partial.position ?? 'MF',
    savedAt: Date.now(),
    formation: partial.formation ?? existing?.formation,
    avatarBase64: partial.avatarBase64 ?? existing?.avatarBase64,
    avatarMimeType: partial.avatarMimeType ?? existing?.avatarMimeType,
    attributeDeltas: partial.attributeDeltas ?? existing?.attributeDeltas,
    squadNickname: partial.squadNickname ?? existing?.squadNickname,
    squadColor: partial.squadColor ?? existing?.squadColor,
  };
  storePendingPersona(next);
}
