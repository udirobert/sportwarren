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

  const availableOpponents = useMemo(
    () => (squadPool?.squads || []).filter((squad) => squad.id !== activeSquadId),
    [activeSquadId, squadPool?.squads],
  );

  return {
    availableOpponents,
  };
}
