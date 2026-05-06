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
  stateLabel: string;
  stateDetail: string;
  momentumLabel: string;
  intensityLabel: string;
  conditionLabel: string;
  cameraLabel: string;
  highlightLabel: string;
  highlightTone: 'calm' | 'pressure' | 'surge';
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
    const hasSnapshot = Boolean(snapshot);
    const hasTwin = Boolean(twin);

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

    const highlightTone: MatchBroadcastViewModel['highlightTone'] = squadEnergy >= 80
      ? 'surge'
      : attack >= 70
        ? 'pressure'
        : 'calm';

    const cameraLabel = highlightTone === 'surge'
      ? 'Spotlight tracking'
      : highlightTone === 'pressure'
        ? 'Press-side follow cam'
        : 'Broadcast wide';

    const highlightLabel = highlightTone === 'surge'
      ? 'Momentum spike detected'
      : highlightTone === 'pressure'
        ? 'Pressure sequence building'
        : 'Shape and spacing focus';

    const keyMetrics = [
      { label: 'Squad', value: squadId || 'No active squad' },
      { label: 'Access', value: access.state },
      { label: 'Energy', value: `${squadEnergy}%` },
      { label: 'Season points', value: `${twin?.seasonPoints ?? 0}` },
      { label: 'Teamwork', value: `${teamwork}` },
      { label: 'Feed', value: hasSnapshot ? 'Live simulation' : hasTwin ? 'Twin baseline only' : 'Awaiting twin sync' },
    ];

    const heroTitle = access.canLaunch
      ? hasSnapshot
        ? 'Broadcast beta is live for this squad'
        : 'Broadcast beta is ready for first sessions'
      : access.canSeeEntryPoint
        ? access.reason === 'capability_limited'
          ? 'Broadcast beta is visible but device-limited'
          : 'Broadcast beta is staged for rollout'
        : 'Broadcast beta is not available yet';

    const heroSubtitle = twin?.narrative
      || (access.canLaunch
        ? hasSnapshot
          ? 'This beta surface mirrors the shared match simulation and highlights the moments that would drive a future renderer.'
          : 'Access is unlocked. We are currently showing twin-driven signals while live simulation data catches up.'
        : access.reason === 'capability_limited'
          ? 'Your access path is recognized, but this device is currently held on the lighter preview path to keep the experience stable.'
          : 'The 3D layer remains a guided beta preview until your squad or account qualifies for broader rollout.');

    const stateLabel = access.canLaunch
      ? hasSnapshot
        ? 'Live simulation connected'
        : hasTwin
          ? 'Renderer-ready preview'
          : 'Unlocked, waiting on twin sync'
      : access.canSeeEntryPoint
        ? access.reason === 'capability_limited'
          ? 'Capability-limited preview'
          : 'Rollout preview only'
        : 'Hidden from rollout';

    const stateDetail = access.canLaunch
      ? hasSnapshot
        ? 'Event highlights, commentary, and camera semantics are being derived from the active match snapshot.'
        : hasTwin
          ? 'The beta shell is active, but no live snapshot is attached yet. Signals are currently inferred from twin state only.'
          : 'Access is unlocked, but twin data has not loaded yet. Keep the 2D view as the tactical source of truth.'
      : access.canSeeEntryPoint
        ? access.reason === 'capability_limited'
          ? 'Reduced motion or low-power constraints are keeping this experience on the lightweight placeholder path.'
          : 'The shell is visible so beta users can understand the offer, provide feedback, and track unlock progress.'
        : 'This account is outside the current rollout cohort.';

    return {
      heroTitle,
      heroSubtitle,
      scoreline: `${score.home} - ${score.away}`,
      phaseLabel,
      statusTone,
      stateLabel,
      stateDetail,
      momentumLabel,
      intensityLabel,
      conditionLabel,
      cameraLabel,
      highlightLabel,
      highlightTone,
      commentary: commentary.length > 0
        ? commentary
        : access.canLaunch
          ? hasSnapshot
            ? ['Live simulation is connected, but no commentary events have been emitted yet.']
            : ['No live snapshot yet — the 2D preview remains the primary simulation surface while beta signals warm up.']
          : ['This beta surface is currently in preview mode. The 2D match view remains the tactical source of truth.'],
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
