'use client';

import { useMemo } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useActiveSquad } from '@/contexts/ActiveSquadContext';
import { getJourneyContent, getJourneyNextAction } from '@/lib/journey/content';
import { getJourneyStage } from '@/lib/journey/stage';

export function useJourneyState() {
  const { hasAccount, hasWallet, isGuest, authStatus, isVerified } = useWallet();
  const { memberships, refresh } = useActiveSquad();
  const { completedCount, totalCount } = useOnboarding();

  const squadCount = memberships.length;

  const journeyStage = useMemo(() => getJourneyStage({
    isGuest,
    hasAccount,
    hasWallet,
    authState: authStatus.state,
    squadCount,
    completedChecklistCount: completedCount,
    totalChecklistCount: totalCount,
  }), [
    authStatus.state,
    completedCount,
    hasAccount,
    hasWallet,
    isGuest,
    squadCount,
    totalCount,
  ]);

  const journeyContent = useMemo(() => getJourneyContent(journeyStage), [journeyStage]);
  const nextAction = useMemo(() => getJourneyNextAction(journeyStage), [journeyStage]);

  return {
    journeyStage,
    journeyContent,
    nextAction,
    memberships,
    refreshSquads: refresh,
    hasAccount,
    hasWallet,
    isGuest,
    isVerified,
    squadCount,
    completedCount,
    totalCount,
  };
}
