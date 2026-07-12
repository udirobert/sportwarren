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
 * Short challenge links: `/?challenge={slug}`, where the slug resolves
 * (via GET /api/tactics/share?slug=) to the opponent's plan — the only
 * thing a challenge_received recipient actually reads (ChallengeOverlay
 * shows just the opponent's formation; the recipient's own counter is
 * always suggestCounterFormation(opponent.formation), computed fresh,
 * never read from the URL). Replaces the old raw vs_f/vs_s/vs_c/vs_n
 * (+ a redundant, unused "mine" formation/style/color/size/names) encoding.
 * decodeFormationFromUrl below is UNCHANGED and still decodes that old long
 * form, so links already sent/saved before this change keep working.
 */
export function buildChallengeSharePath(slug: string): string {
  return `/?challenge=${encodeURIComponent(slug)}`;
}

const SLUG_RE = /^[a-zA-Z0-9_-]{4,32}$/;

export function decodeChallengeSlugFromUrl(sp: URLSearchParams): string | null {
  const slug = sp.get("challenge");
  return slug && SLUG_RE.test(slug) ? slug : null;
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
