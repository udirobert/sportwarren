import { useMemo } from 'react';
import type { DigitalTwin3DAccessResult } from '@/lib/digital-twin/access';
import type { MatchSimulationSnapshot } from '@/lib/match/matchSimulation';

export interface MatchBroadcastTwinData {
  level?: number;
  squadEnergy?: number;
  seasonPoints?: number;
  nextLevelXp?: number;
  xp?: number;
  digitalAttributes?: Partial<{
    attack: number;
    defense: number;
    midfield: number;
    teamwork: number;
    prestige: number;
  }>;
  narrative?: string | null;
}

export interface MatchBroadcastViewModel {
  heroTitle: string;
  heroSubtitle: string;
  scoreline: string;
  phaseLabel: string;
  statusTone: 'live' | 'paused' | 'locked';
  momentumLabel: string;
  intensityLabel: string;
  conditionLabel: string;
  commentary: string[];
  keyMetrics: Array<{ label: string; value: string }>;
}

interface UseMatchBroadcastViewModelInput {
  squadId?: string;
  access: DigitalTwin3DAccessResult;
  snapshot?: MatchSimulationSnapshot | null;
  twin?: MatchBroadcastTwinData | null;
}

export function useMatchBroadcastViewModel({ squadId, access, snapshot, twin }: UseMatchBroadcastViewModelInput): MatchBroadcastViewModel {
  return useMemo(() => {
    const score = snapshot?.score ?? { home: 0, away: 0 };
    const phaseLabel = formatPhase(snapshot?.matchPhase);
    const commentary = snapshot?.commentary?.slice(-3).map(item => item.text) ?? [];
    const squadEnergy = twin?.squadEnergy ?? 0;
    const attack = Math.round(twin?.digitalAttributes?.attack ?? 50);
    const defense = Math.round(twin?.digitalAttributes?.defense ?? 50);
    const teamwork = Math.round(twin?.digitalAttributes?.teamwork ?? 50);
    const statusTone = access.canLaunch ? 'live' : access.canSeeEntryPoint ? 'paused' : 'locked';

    const momentumLabel = squadEnergy >= 80
      ? 'Surging'
      : squadEnergy >= 60
        ? 'Stable'
        : squadEnergy >= 40
          ? 'Managing load'
          : 'Recovery needed';

    const intensityLabel = attack >= 75
      ? 'Aggressive front-foot pressure'
      : attack >= 60
        ? 'Balanced attacking rhythm'
        : 'Controlled, low-risk build-up';

    const conditionLabel = squadEnergy >= 75
      ? 'Sharp'
      : squadEnergy >= 50
        ? 'Match-ready'
        : 'Fatigue visible';

    const keyMetrics = [
      { label: 'Squad', value: squadId || 'No active squad' },
      { label: 'Energy', value: `${squadEnergy}%` },
      { label: 'Season points', value: `${twin?.seasonPoints ?? 0}` },
      { label: 'Teamwork', value: `${teamwork}` },
      { label: 'Defense', value: `${defense}` },
    ];

    return {
      heroTitle: access.canLaunch ? 'Broadcast mode unlocked' : 'Broadcast mode staged for rollout',
      heroSubtitle: twin?.narrative || 'The 3D layer will mirror the shared match simulation and explain how real-world inputs affect the squad’s digital twin.',
      scoreline: `${score.home} - ${score.away}`,
      phaseLabel,
      statusTone,
      momentumLabel,
      intensityLabel,
      conditionLabel,
      commentary: commentary.length > 0 ? commentary : ['No live events yet — 2D preview remains the primary simulation surface.'],
      keyMetrics,
    };
  }, [access, snapshot, squadId, twin]);
}

function formatPhase(phase: MatchSimulationSnapshot['matchPhase'] | undefined): string {
  switch (phase) {
    case 'first_half':
      return 'First half';
    case 'halftime':
      return 'Half time';
    case 'second_half':
      return 'Second half';
    case 'fulltime':
      return 'Full time';
    default:
      return 'Pre-match';
  }
}
