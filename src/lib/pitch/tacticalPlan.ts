import { FORMATIONS, getDefaultFormationForSize } from "@/lib/formations";
import type { Formation, PlayStyle, SquadSize, Tactics, TeamInstructions } from "@/types";

export interface ImportedTacticalPlan {
  formation: Formation;
  style: PlayStyle;
  size: SquadSize;
  color?: string;
  names: string[];
  source: "playground";
}

const VALID_SIZES: SquadSize[] = [5, 6, 7, 11];
const VALID_STYLES: PlayStyle[] = ["balanced", "possession", "direct", "counter", "high_press", "low_block"];

export function instructionsForPlayStyle(style: PlayStyle, size: SquadSize): TeamInstructions {
  const smallSided = size !== 11;
  const defaults: Record<PlayStyle, TeamInstructions> = {
    balanced: { width: smallSided ? "normal" : "normal", tempo: "normal", passing: "mixed", pressing: "medium", defensiveLine: "normal" },
    possession: { width: smallSided ? "normal" : "wide", tempo: "slow", passing: "short", pressing: "medium", defensiveLine: "normal" },
    direct: { width: "normal", tempo: "fast", passing: "long", pressing: "medium", defensiveLine: "normal" },
    counter: { width: "narrow", tempo: "fast", passing: smallSided ? "mixed" : "long", pressing: "low", defensiveLine: "deep" },
    high_press: { width: smallSided ? "narrow" : "wide", tempo: "fast", passing: "mixed", pressing: "high", defensiveLine: "high" },
    low_block: { width: "narrow", tempo: "normal", passing: "mixed", pressing: "low", defensiveLine: "deep" },
  };
  return defaults[style];
}

export function tacticalPlanToTactics(plan: ImportedTacticalPlan): Tactics {
  return {
    formation: plan.formation,
    style: plan.style,
    instructions: instructionsForPlayStyle(plan.style, plan.size),
    setPieces: {
      corners: "near_post",
      freeKicks: "cross",
      penalties: "",
    },
  };
}

export function parseTacticalPlanSearchParams(params: URLSearchParams): ImportedTacticalPlan | null {
  const rawSize = Number(params.get("size") || 5) as SquadSize;
  const size = VALID_SIZES.includes(rawSize) ? rawSize : 5;

  const rawFormation = params.get("formation") as Formation | null;
  const fallbackFormation = getDefaultFormationForSize(size);
  const formation = rawFormation && rawFormation in FORMATIONS ? rawFormation : fallbackFormation;

  const rawStyle = params.get("style") as PlayStyle | null;
  const style = rawStyle && VALID_STYLES.includes(rawStyle) ? rawStyle : "balanced";

  const rawColor = params.get("color");
  const color = rawColor && /^#?[0-9a-fA-F]{3,8}$/.test(rawColor)
    ? rawColor.startsWith("#") ? rawColor : `#${rawColor}`
    : undefined;

  const names = (params.get("names") || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, size);

  const hasPlanSignal = params.has("formation") || params.has("style") || params.has("size") || params.has("color") || params.has("names");
  if (!hasPlanSignal) return null;

  return {
    formation,
    style,
    size,
    color,
    names,
    source: "playground",
  };
}

export function buildTacticalPlanQuery(plan: ImportedTacticalPlan): string {
  const params = new URLSearchParams();
  params.set("formation", plan.formation);
  params.set("style", plan.style);
  params.set("size", String(plan.size));
  if (plan.color) params.set("color", plan.color);
  if (plan.names.length > 0) params.set("names", plan.names.join(","));
  return params.toString();
}
