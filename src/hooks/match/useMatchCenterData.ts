"use client";

import { useMemo } from "react";
import { trpc } from "@/lib/trpc-client";

interface MatchCenterData {
  availableOpponents: Array<{ id: string; name: string }>;
}

export function useMatchCenterData(activeSquadId?: string): MatchCenterData {
  const { data: squadPool } = trpc.squad.list.useQuery(
    { limit: 20 },
    { staleTime: 30 * 1000 },
  );

  // Compute directly with simplified types to avoid deep instantiation
  const rawSquads = squadPool?.squads ?? [];
  const filtered: Array<{ id: string; name: string }> = [];
  for (const s of rawSquads) {
    if (s.id !== activeSquadId) {
      filtered.push({ id: s.id, name: s.name });
    }
  }

  return {
    availableOpponents: filtered,
  };
}
