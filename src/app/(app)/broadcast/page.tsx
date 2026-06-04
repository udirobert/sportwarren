"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useWallet } from '@/contexts/WalletContext';
import { useActiveSquad } from '@/contexts/ActiveSquadContext';
import { useDigitalTwinBroadcastAccess } from '@/hooks/useDigitalTwinBroadcastAccess';
import type { MatchBroadcastTwinData } from '@/components/match3d';
import { trackDigitalTwin3DInteraction } from '@/lib/digital-twin/analytics';

const MatchBroadcast3DView = dynamic(
  () => import('@/components/match3d').then(mod => ({ default: mod.MatchBroadcast3DView })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
          <span className="text-sm font-medium">Preparing broadcast view…</span>
        </div>
      </div>
    ),
  }
);

export default function DigitalTwinBroadcastPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
      </div>
    }>
      <DigitalTwinBroadcastPageContent />
    </Suspense>
  );
}

interface SimpleBroadcastTwinData {
  level?: number;
  energy?: number;
  prestige?: number;
  nextLevelXp?: number;
  xp?: number;
  baseAttributes?: Record<string, number>;
  narrative?: string | null;
}

function DigitalTwinBroadcastPageContent() {
  const searchParams = useSearchParams();
  const { preferences } = useUserPreferences();
  const { isGuest, hasAccount, authStatus } = useWallet();
  const { activeSquadId } = useActiveSquad();
  const squadId = searchParams.get('squadId') || activeSquadId || undefined;
  const isVerified = !isGuest && authStatus.state === 'valid';
  const { data: stats } = useDashboardData({
    isGuest,
    hasAccount,
    isVerified,
    squadId,
  });
  const { twin, access } = useDigitalTwinBroadcastAccess({
    squadId,
    preferences,
    totalMatches: stats?.matches ?? 0,
  });
  const hasTrackedOpenRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const trackingKey = `${squadId ?? 'no-squad'}:${access.state}`;
    if (hasTrackedOpenRef.current === trackingKey) {
      return;
    }

    hasTrackedOpenRef.current = trackingKey;
    trackDigitalTwin3DInteraction({
      action: 'broadcast_opened',
      squadId,
      access,
      source: 'broadcast_page',
    });
  }, [access, squadId]);

  const broadcastTwin: SimpleBroadcastTwinData | null = twin ? {
    level: twin.level,
    energy: twin.energy,
    prestige: twin.prestige,
    nextLevelXp: twin.nextLevelXp,
    xp: twin.xp,
    baseAttributes: ((twin as any).baseAttributes ?? {}) as Record<string, number>,
    narrative: twin.narrative,
  } : null;

  return <MatchBroadcast3DView squadId={squadId} access={access} twin={broadcastTwin as any} />;
}
