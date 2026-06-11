import type { Formation, PlayStyle, SquadSize } from "@/types";
import { FORMATIONS } from "@/lib/formations";

export type PlaygroundFlow = "build" | "challenge_received" | "counter_setup" | "result";

export interface FormationUrlState {
  formation: Formation;
  style: PlayStyle;
  color: string;
  size: SquadSize;
  names: string[];
  /** When set, this is a challenge URL — these are the opponent's formation details */
  vs_formation?: Formation;
  vs_style?: PlayStyle;
  vs_color?: string;
  vs_names?: string[];
}

const VALID_SIZES: SquadSize[] = [5, 6, 7, 11];

/**
 * Encode formation state into URL search params.
 * Player names are comma-separated and URI-encoded.
 */
export function encodeFormationToUrl(params: FormationUrlState): string {
  const sp = new URLSearchParams();
  sp.set("formation", params.formation);
  sp.set("style", params.style);
  sp.set("color", params.color);
  sp.set("size", String(params.size));
  if (params.names.length > 0) {
    sp.set("names", params.names.join(","));
  }
  if (params.vs_formation) {
    sp.set("vs_f", params.vs_formation);
    if (params.vs_style) sp.set("vs_s", params.vs_style);
    if (params.vs_color) sp.set("vs_c", params.vs_color);
    if (params.vs_names && params.vs_names.length > 0) sp.set("vs_n", params.vs_names.join(","));
  }
  return `${window.location.pathname}?${sp.toString()}`;
}

/**
 * Encode a challenge URL: my formation vs opponent's formation.
 */
export function encodeChallengeUrl(
  mine: FormationUrlState,
  opponent: { formation: Formation; style: PlayStyle; color: string; names: string[] },
): string {
  const sp = new URLSearchParams();
  // My formation (the challenger's)
  sp.set("formation", mine.formation);
  sp.set("style", mine.style);
  sp.set("color", mine.color);
  sp.set("size", String(mine.size));
  if (mine.names.length > 0) sp.set("names", mine.names.join(","));
  // Opponent's formation
  sp.set("vs_f", opponent.formation);
  sp.set("vs_s", opponent.style);
  sp.set("vs_c", opponent.color);
  if (opponent.names.length > 0) sp.set("vs_n", opponent.names.join(","));
  // Flow marker
  sp.set("flow", "counter");
  return `${window.location.pathname}?${sp.toString()}`;
}

/**
 * Decode URL search params into formation state.
 * Returns null for invalid/missing params so callers can fall back to defaults.
 */
export function decodeFormationFromUrl(
  sp: URLSearchParams
): Partial<FormationUrlState> & { flow?: PlaygroundFlow } {
  const result: Partial<FormationUrlState> & { flow?: PlaygroundFlow } = {};

  const formation = sp.get("formation") as Formation | null;
  if (formation && formation in FORMATIONS) {
    result.formation = formation;
  }

  const style = sp.get("style") as PlayStyle | null;
  if (style) {
    result.style = style;
  }

  const color = sp.get("color");
  if (color && /^#?[0-9a-fA-F]{3,8}$/.test(color)) {
    result.color = color.startsWith("#") ? color : `#${color}`;
  }

  const size = sp.get("size");
  if (size) {
    const parsed = parseInt(size, 10) as SquadSize;
    if (VALID_SIZES.includes(parsed)) {
      result.size = parsed;
    }
  }

  const names = sp.get("names");
  if (names) {
    const parsed = names.split(",").map(decodeURIComponent).filter(Boolean);
    if (parsed.length > 0) {
      result.names = parsed;
    }
  }

  // ── Challenge (opponent) params ──
  const vsFormation = sp.get("vs_f") as Formation | null;
  if (vsFormation && vsFormation in FORMATIONS) {
    result.vs_formation = vsFormation;
  }

  const vsStyle = sp.get("vs_s") as PlayStyle | null;
  if (vsStyle) result.vs_style = vsStyle;

  const vsColor = sp.get("vs_c");
  if (vsColor && /^#?[0-9a-fA-F]{3,8}$/.test(vsColor)) {
    result.vs_color = vsColor.startsWith("#") ? vsColor : `#${vsColor}`;
  }

  const vsNames = sp.get("vs_n");
  if (vsNames) {
    const parsed = vsNames.split(",").map(decodeURIComponent).filter(Boolean);
    if (parsed.length > 0) result.vs_names = parsed;
  }

  // Flow detection
  const flow = sp.get("flow");
  if (flow === "counter" && result.vs_formation) {
    result.flow = "challenge_received";
  }

  return result;
}

/**
 * Sync current formation state to the browser URL without navigation.
 * Preserves non-formation query params (e.g. Privy OAuth state/code) so
 * OAuth callbacks aren't stripped during playground interaction.
 */
export function syncStateToUrl(params: FormationUrlState): void {
  if (typeof window === "undefined") return;

  const currentUrl = new URL(window.location.href);
  const incomingSp = new URLSearchParams(
    encodeFormationToUrl(params).replace(/^[^?]*\?/, ""),
  );

  // Copy all existing params, then overlay formation params on top.
  // This preserves third-party params (privy_oauth_state, etc.) while
  // keeping formation state up to date.
  const merged = new URLSearchParams(currentUrl.search);
  for (const [key, value] of incomingSp) {
    merged.set(key, value);
  }

  const mergedQuery = merged.toString();
  const url = mergedQuery
    ? `${currentUrl.pathname}?${mergedQuery}`
    : currentUrl.pathname;

  window.history.replaceState(null, "", url);
}

/**
 * Generate a human-readable share caption.
 */
export function generateShareCaption(formation: Formation, names: string[]): string {
  const namedPlayers = names.filter(Boolean);
  if (namedPlayers.length >= 3) {
    return `My ${formation}: ${namedPlayers.slice(0, 3).join(", ")} and ${namedPlayers.length - 3} more. Can you beat it?`;
  }
  return `Check out my ${formation} setup on SportWarren!`;
}

/**
 * Generate a challenge caption for sharing.
 */
export function generateChallengeCaption(
  opponentFormation: Formation,
  myFormation: Formation,
): string {
  return `I'm countering your ${opponentFormation} with ${myFormation}. Think you can beat it?`;
}

/**
 * Suggest a complementary formation to counter the given one.
 * Based on tactical principles: counter width with compact shapes, etc.
 */
export function suggestCounterFormation(oppFormation: Formation): Formation {
  const counters: Record<string, Formation> = {
    "4-3-3": "4-5-1",      // compact mid blocks width
    "4-4-2": "4-3-3",      // overload the midfield 3
    "4-2-3-1": "3-5-2",    // wingbacks exploit the gaps
    "4-5-1": "4-3-1-2",    // narrow diamond bypasses mid block
    "4-1-4-1": "3-4-3",    // wide forwards stretch the lone CDM
    "3-5-2": "4-4-2",      // classic wide pairs vs narrow 3
    "3-4-3": "5-3-2",      // 5-back smothers the front 3
    "5-3-2": "4-3-3",      // stretch the 5-back with width
    "5-4-1": "4-3-3",      // attack the flanks they vacate
    "4-3-1-2": "3-4-3",    // width bypasses the narrow diamond
  };
  return counters[oppFormation] || "4-3-3";
}
