"use client";

import { useMemo } from "react";
import { trpc } from "@/lib/trpc-client";

interface MatchCenterData {
  activeSquad: { id: string; name: string } | undefined;
  activeSquadId: string | undefined;
  availableOpponents: Array<{ id: string; name: string }>;
}

export function useMatchCenterData(isVerified: boolean): MatchCenterData {
  const { data: memberships } = trpc.squad.getMySquads.useQuery(undefined, {
    enabled: isVerified,
    retry: false,
  });
  const activeMembership = memberships?.[0];
  const activeSquad = activeMembership?.squad;
  const activeSquadId = activeSquad?.id;

  const { data: squadPool } = trpc.squad.list.useQuery(
    { limit: 20 },
    { staleTime: 30 * 1000 },
  );

  const availableOpponents = useMemo(
    () => (squadPool?.squads || []).filter((squad) => squad.id !== activeSquadId),
    [activeSquadId, squadPool?.squads],
  );

  return {
    activeSquad,
    activeSquadId,
    availableOpponents,
  };
}
