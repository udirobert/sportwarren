import type { Formation, PlayStyle, SquadSize } from "@/types";

/**
 * Draft persistence for the homepage formation playground.
 *
 * The playground used to live-sync its full state (formation, style, color,
 * size, names) into the visible URL on every interaction (`syncStateToUrl`
 * in shareUrl.ts). That meant every visitor's address bar grew a long query
 * string just from playing with the widget — not from deliberately sharing
 * anything. This replaces that with localStorage, mirroring the existing
 * `@/lib/claims/persona` pattern: refresh-survival for in-progress edits,
 * with a clean URL. Real incoming links (an actual share/challenge URL)
 * still work — decodeFormationFromUrl (shareUrl.ts) is unchanged and still
 * takes priority over a stored draft.
 */

export interface PlaygroundDraft {
  formation: Formation;
  style: PlayStyle;
  color: string;
  size: SquadSize;
  names: string[];
  savedAt: number;
}

const STORAGE_KEY = "sw_playground_draft";
const TTL_MS = 86_400_000; // 24h — matches persona.ts's convention
const VALID_SIZES: SquadSize[] = [5, 6, 7, 11];

function isPlaygroundDraft(value: unknown): value is PlaygroundDraft {
  if (!value || typeof value !== "object") return false;
  const d = value as Partial<PlaygroundDraft>;
  return (
    typeof d.formation === "string" &&
    typeof d.style === "string" &&
    typeof d.color === "string" &&
    typeof d.size === "number" &&
    VALID_SIZES.includes(d.size as SquadSize) &&
    Array.isArray(d.names) &&
    d.names.every((n) => typeof n === "string") &&
    typeof d.savedAt === "number" &&
    Number.isFinite(d.savedAt)
  );
}

export function storePlaygroundDraft(draft: Omit<PlaygroundDraft, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch {
    // ignore storage failures (private browsing, quota) — the playground
    // still works, it just won't survive a refresh
  }
}

export function getPlaygroundDraft(): PlaygroundDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isPlaygroundDraft(parsed)) return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
