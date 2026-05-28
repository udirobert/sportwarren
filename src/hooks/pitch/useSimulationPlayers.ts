"use client";

import { useMemo } from "react";
import type { Formation } from "@/types";
import { FORMATIONS } from "@/lib/formations";
import type { PlayerPuck } from "@/lib/match/matchEngine";

export interface SimulationPlayerInput {
  names: string[];
  formation: Formation;
  primaryColor?: string;
  playersPerSide?: number;
}

function createPlayer(
  id: string,
  name: string,
  x: number,
  y: number,
  team: "home" | "away",
  role: string,
  stats: PlayerPuck["stats"],
  avatar?: string
): PlayerPuck {
  return {
    id,
    name,
    avatar,
    x,
    y,
    vx: 0,
    vy: 0,
    team,
    role,
    stats,
    reputationTier:
      stats.level > 15 ? "platinum" : stats.level > 8 ? "gold" : "silver",
    homePos: { x, y },
    history: [],
    cooldownUntil: 0,
  };
}

const AWAY_NAMES = [
  "GK",
  "Rival",
  "Stone",
  "Park",
  "Cruz",
  "Osei",
  "Nkosi",
  "Levi",
  "Dani",
  "Ramos",
  "Finn",
  "Musa",
  "Sven",
  "Ito",
  "Bale",
  "Zara",
];

function roleStatBonus(role: string) {
  return {
    paceBonus: role === "ST" || role.endsWith("W") ? 8 : 0,
    passingBonus: role === "CM" ? 8 : 0,
  };
}

/**
 * Creates a seeded PlayerPuck[] from custom player names and a formation.
 * Used by FormationPlayground to bridge the personalization hook with the match engine.
 */
export function createSeededPlayers(
  input: SimulationPlayerInput
): PlayerPuck[] {
  const { names, formation, playersPerSide = 11 } = input;
  const formationData = FORMATIONS[formation] || FORMATIONS["4-4-2"];
  const homeFormation = formationData.map((s) => [s.x, s.y, s.role] as [number, number, string]);
  const awayFormation = homeFormation.map(
    ([x, y, role]) => [100 - x, y, role] as [number, number, string]
  );

  const homeNames = names.length >= playersPerSide
    ? names.slice(0, playersPerSide)
    : [
        ...names,
        ...Array.from({ length: playersPerSide - names.length }, (_, i) => `Player ${names.length + i + 1}`),
      ];
  const awayNames = AWAY_NAMES.slice(0, playersPerSide);

  const homePlayers = homeFormation.map(([x, y, role], i) => {
    const name = homeNames[i] || `Home ${i}`;
    const level = 8;
    const base = 60 + level * 1.5;
    const { paceBonus, passingBonus } = roleStatBonus(role);
    return createPlayer(`h${i}`, name, x, y, "home", role, {
      level,
      pace: Math.min(99, base + paceBonus),
      agility: Math.min(99, base + 2),
      strength: Math.min(99, base - 5),
      passing: Math.min(99, base + passingBonus),
    });
  });

  const awayPlayers = awayFormation.map(([x, y, role], i) => {
    const name = awayNames[i] || `Away ${i}`;
    const level = 10 + Math.floor(Math.random() * 8);
    const base = 60 + level * 1.5;
    const { paceBonus, passingBonus } = roleStatBonus(role);
    return createPlayer(`a${i}`, name, x, y, "away", role, {
      level,
      pace: Math.min(99, base + paceBonus),
      agility: Math.min(99, base + 2),
      strength: Math.min(99, base - 5),
      passing: Math.min(99, base + passingBonus),
    });
  });

  return [...homePlayers, ...awayPlayers];
}

/**
 * Hook wrapper that memoizes the seeded players.
 */
export function useSimulationPlayers(input: SimulationPlayerInput): PlayerPuck[] {
  return useMemo(
    () => createSeededPlayers(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.formation, input.playersPerSide, input.names.join(",")]
  );
}
