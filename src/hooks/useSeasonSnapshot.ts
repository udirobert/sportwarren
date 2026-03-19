"use client";

import { useMemo } from 'react';
import { useCurrentPlayerAttributes } from '@/hooks/player/usePlayerAttributes';
import { useJourneyState } from '@/hooks/useJourneyState';
import {
  buildSeasonRecord,
  enrichPlayerAttributesWithSeasonContext,
} from '@/lib/player/season-summary';
import { trpc } from '@/lib/trpc-client';
import { isPendingMatchStatus, isSettledMatchStatus } from '@/lib/match/summary';

export function useSeasonSnapshot(matchLimit: number = 8) {
  const { memberships, hasWallet, isVerified } = useJourneyState();
  const primaryMembership = memberships?.[0];
  const primarySquad = primaryMembership?.squad;
  const primarySquadId = primarySquad?.id;
  const { attributes, loading: attributesLoading } = useCurrentPlayerAttributes(hasWallet && isVerified);
  const { data: matchData, isLoading: matchesLoading, refetch: refreshMatches } = trpc.match.list.useQuery(
    { squadId: primarySquadId, limit: matchLimit },
    { enabled: !!primarySquadId, staleTime: 30 * 1000 }
  );

  const matches = useMemo(() => matchData?.matches ?? [], [matchData]);
  const pendingMatches = useMemo(
    () => matches.filter((match: any) => isPendingMatchStatus(match.status)),
    [matches]
  );
  const settledMatches = useMemo(
    () => matches.filter((match: any) => isSettledMatchStatus(match.status)),
    [matches]
  );
  const seasonRecord = useMemo(
    () => buildSeasonRecord(matches, primarySquadId),
    [matches, primarySquadId]
  );
  const seasonAttributes = useMemo(
    () => enrichPlayerAttributesWithSeasonContext(attributes, matches, primarySquadId),
    [attributes, matches, primarySquadId]
  );

  return {
    primaryMembership,
    primarySquad,
    primarySquadId,
    attributes: seasonAttributes,
    attributesLoading,
    matches,
    matchesLoading,
    pendingMatches,
    settledMatches,
    pendingMatchesCount: pendingMatches.length,
    settledMatchesCount: settledMatches.length,
    latestSettledMatch: settledMatches[0] ?? null,
    seasonRecord,
    refreshMatches,
  };
}
