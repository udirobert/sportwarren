import { useMemo } from 'react';
import { trpc } from '@/lib/trpc-client';
import { resolveDigitalTwin3DAccess } from '@/lib/digital-twin/access';
import type { UserPreferences } from '@/types';

interface UseDigitalTwinBroadcastAccessInput {
  squadId?: string;
  preferences: Pick<UserPreferences, 'unlockedFeatures' | 'usagePatterns'>;
  totalMatches?: number;
  avatarRecentUnlock?: unknown;
}

export function useDigitalTwinBroadcastAccess({
  squadId,
  preferences,
  totalMatches = 0,
  avatarRecentUnlock,
}: UseDigitalTwinBroadcastAccessInput) {
  const twinQuery = trpc.squad.getDigitalTwin.useQuery(
    { squadId: squadId || '' },
    { enabled: !!squadId }
  );

  const access = useMemo(() => resolveDigitalTwin3DAccess({
    preferences,
    hasPremiumAccess: Boolean(twinQuery.data?.digitalTwin3dEnabled),
    hasStreakAccess:
      Boolean(avatarRecentUnlock) ||
      totalMatches >= 5 ||
      (twinQuery.data?.digitalTwin3dTier === 'streak_reward') ||
      (twinQuery.data?.seasonPoints ?? 0) >= 12 ||
      (twinQuery.data?.squadEnergy ?? 0) >= 85,
  }), [avatarRecentUnlock, preferences, totalMatches, twinQuery.data?.digitalTwin3dEnabled, twinQuery.data?.digitalTwin3dTier, twinQuery.data?.seasonPoints, twinQuery.data?.squadEnergy]);

  return {
    twin: twinQuery.data,
    twinQuery,
    access,
    isLoading: twinQuery.isLoading,
  };
}
