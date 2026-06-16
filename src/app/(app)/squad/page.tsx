"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SquadDAO } from "@/components/squad/SquadDAO";
import { TacticsBoard } from "@/components/squad/TacticsBoard";
import { TransferMarket } from "@/components/squad/TransferMarket";
import { Treasury } from "@/components/squad/Treasury";
import { JourneyGateCard } from "@/components/common/JourneyGateCard";
import { PageShell } from "@/components/common/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users, Target, ArrowRightLeft, Wallet,
  Shield, Vote, Activity, Info, UserPlus, CheckCircle2, MessageCircle, Diamond, Settings,
  CalendarDays,
} from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { CreateSquadFlow } from "@/components/squad/CreateSquadFlow";
import { JoinSquadFlow } from "@/components/squad/JoinSquadFlow";
import { SquadPreview } from "@/components/squad/SquadPreview";
import { trpc } from "@/lib/trpc-client";
import { useTreasury } from "@/hooks/squad/useTreasury";
import { useTransfers } from "@/hooks/squad/useTransfers";
import { PendingActionsPanel } from "@/components/operations/PendingActionsPanel";
import { SquadAutonomySettings } from "@/components/squad/SquadAutonomySettings";
import { motion } from 'framer-motion';
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useSquadDetails } from "@/hooks/squad/useSquad";
import { useWallet } from "@/contexts/WalletContext";
import SquadMomentsGallery from "@/components/moments/SquadMomentsGallery";
import { getJourneyActionGate } from "@/lib/journey/action-gates";
import { describeMatchForSquad } from "@/lib/match/summary";
import { useJourneyState } from "@/hooks/useJourneyState";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import type { Player, PlayerPosition, Tactics, Formation, PlayStyle, TeamInstructions } from "@/types";
import { buildSquadInviteUrl } from "@/lib/squad/invite";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { buildAvatarPresentationFromSummary } from "@/lib/avatar/adapters";
import type { AvatarPresentation } from "@/lib/avatar/types";
import { buildTacticalPlanQuery, parseTacticalPlanSearchParams, tacticalPlanToTactics, type ImportedTacticalPlan } from "@/lib/pitch/tacticalPlan";
import { trackCoreGrowthEvent, trackFeatureUsed } from "@/lib/analytics";

type SquadTab = "overview" | "tactics" | "transfers" | "treasury" | "governance" | "settings" | "moments";

const PLAY_STYLE_LABELS: Record<PlayStyle, string> = {
  balanced: "Balanced",
  possession: "Possession",
  direct: "Direct",
  counter: "Counter Attack",
  high_press: "High Press",
  low_block: "Low Block",
};

const SAMPLE_MEMBERS = [
  { id: 'm1', name: 'Marcus J.', role: 'captain', position: 'GK', stats: { level: 45 } },
  { id: 'm2', name: 'David L.', role: 'vice_captain', position: 'DF', stats: { level: 42 } },
  { id: 'm3', name: 'Sarah K.', role: 'member', position: 'DF', stats: { level: 38 } },
  { id: 'm4', name: 'Alex R.', role: 'member', position: 'MF', stats: { level: 44 } },
  { id: 'm5', name: 'Elena G.', role: 'member', position: 'MF', stats: { level: 41 } },
  { id: 'm6', name: 'Chris W.', role: 'member', position: 'WG', stats: { level: 46 } },
  { id: 'm7', name: 'Jordan B.', role: 'member', position: 'ST', stats: { level: 48 } },
  { id: 'm8', name: 'Toni M.', role: 'member', position: 'ST', stats: { level: 43 } },
];

type OverviewEvent = {
  id: string;
  title: string;
  detail: string;
  href: string;
  timestamp: number;
};

function parseTimestamp(value: unknown): number {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function formatDateLabel(value: unknown, options?: Intl.DateTimeFormatOptions): string {
  const timestamp = parseTimestamp(value);
  if (timestamp === 0) {
    return "Not available";
  }

  return new Date(timestamp).toLocaleDateString(undefined, options);
}

function buildSquadMemberAvatar(member: {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
  position?: string | null;
  stats?: {
    level?: number;
    matches?: number;
    goals?: number;
  };
}): AvatarPresentation {
  return buildAvatarPresentationFromSummary({
    id: member.id,
    name: member.name,
    avatar: member.avatar,
    role: member.role,
    position: member.position,
    level: member.stats?.level,
    totalMatches: member.stats?.matches,
    totalGoals: member.stats?.goals,
  });
}

function buildPersistedTactics(tacticsData: unknown): Tactics | undefined {
  if (!tacticsData) return undefined;
  const data = tacticsData as Record<string, unknown>;
  const f = String(data.formation ?? '');
  const validSet = new Set([
    '4-4-2', '4-3-3', '4-2-3-1', '4-5-1', '4-1-4-1',
    '3-5-2', '3-4-3', '5-3-2', '5-4-1', '4-3-1-2',
    '1-2-1', '1-1-2', '1-3-1', '1-2-2', '1-2-1-1',
    '1-4-1', '1-3-2', '1-3-1-1', '2-3-1',
  ]);
  if (!validSet.has(f)) return undefined;
  return {
    formation: f as Formation,
    style: (typeof data.playStyle === 'string' ? data.playStyle : 'balanced') as PlayStyle,
    instructions: (data.instructions as TeamInstructions) ?? { width: 'normal', tempo: 'normal', passing: 'mixed', pressing: 'medium', defensiveLine: 'normal' },
    setPieces: (data.setPieces as Tactics['setPieces']) ?? { corners: 'near_post', freeKicks: 'shoot', penalties: '' },
  };
}

export default function SquadPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SquadTab>("overview");
  const [showCreateSquadFlow, setShowCreateSquadFlow] = useState(false);
  const [showJoinSquadFlow, setShowJoinSquadFlow] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [inviteShareState, setInviteShareState] = useState<"idle" | "copied" | "shared" | "error">("idle");
  const [importedPlan, setImportedPlan] = useState<ImportedTacticalPlan | null>(null);
  const { chain, hasAccount, hasWallet, isVerified } = useWallet();
  const { journeyStage, memberships, refreshSquads } = useJourneyState();

  const activeMembership = memberships?.[0];
  const activeSquadId = showSample ? 'sample-squad' : activeMembership?.squad?.id;
  const squadWorkspaceGate = getJourneyActionGate('squad_workspace', {
    stage: journeyStage,
    hasAccount,
    hasWallet,
    isVerified,
    hasSquad: Boolean(activeSquadId),
    chain,
  });
  const governanceGate = getJourneyActionGate('squad_governance', {
    stage: journeyStage,
    hasAccount,
    hasWallet,
    isVerified,
    hasSquad: Boolean(activeSquadId),
    chain,
  });
  const { squad: detailedSquad, members: realMembers } = useSquadDetails(showSample ? undefined : activeSquadId);
  const activeSquad = useMemo(
    () => (showSample
      ? { id: 'sample-squad', name: 'Warriors Pro', shortName: 'WAR', treasuryBalance: 50000, memberCount: 8 } as any
      : (detailedSquad ?? activeMembership?.squad)),
    [activeMembership?.squad, detailedSquad, showSample],
  );
  const members = showSample ? SAMPLE_MEMBERS as any[] : realMembers;
  const { connections } = usePlatformConnections({ squadId: showSample ? undefined : activeSquadId });
  const telegramConnected = connections.telegram?.connected;

  const { checklistItems: _checklistItems } = useOnboarding();
  const squadChecklistDone = true; // open_office removed from checklist

  const treasuryState = useTreasury(showSample ? undefined : activeSquadId);
  const transfersState = useTransfers(showSample ? undefined : activeSquadId);
  const { data: recentMatchesData, isLoading: recentMatchesLoading } = trpc.match.list.useQuery(
    { squadId: showSample ? undefined : activeSquadId, limit: 5 },
    { enabled: !!activeSquadId && !showSample, staleTime: 30 * 1000 }
  );
  const { data: scoutingFeed, isLoading: scoutingFeedLoading } = trpc.market.listScoutingFeed.useQuery(
    { squadId: activeSquadId || '' },
    { enabled: !!activeSquadId && isVerified, staleTime: 30 * 1000 }
  );

  const squadBalance = treasuryState.treasury?.balance ?? activeSquad?.treasuryBalance ?? 0;
  const squadCurrency = treasuryState.treasury?.currency ?? "ALGO";
  const activeOffers = transfersState.incomingOffers.length + transfersState.outgoingOffers.length;

  const [isNewSquad, setIsNewSquad] = useState(false);
  const utils = trpc.useUtils();
  const pullRef = usePullToRefresh({
    onRefresh: () => utils.squad.getMySquads.invalidate(),
  });

  const { data: tacticsData } = trpc.squad.getTactics.useQuery(
    { squadId: activeSquadId || '' },
    { enabled: !!activeSquadId && isVerified, staleTime: 30 * 1000 }
  );
  const saveTacticsMutation = trpc.squad.saveTactics.useMutation({
    onSuccess: () => {
      utils.squad.getTactics.invalidate();
    },
  });

  const squadPlayers: Player[] = useMemo(() => {
    if (!members.length) return [];
    const defaults: PlayerPosition[] = ['GK', 'DF', 'DF', 'MF', 'MF', 'WG', 'ST', 'ST'];
    return members.map((member, idx) => ({
      id: member.id,
      address: activeSquad?.id || member.id,
      name: member.name,
      position: member.position ?? defaults[idx % defaults.length],
      status: 'available',
    }));
  }, [members, activeSquad]);

  const importedTactics = useMemo(
    () => importedPlan ? tacticalPlanToTactics(importedPlan) : undefined,
    [importedPlan],
  );

  const initialTactics: Tactics | undefined = importedTactics ?? buildPersistedTactics(tacticsData);

  const squadSize = members.length || activeSquad?.memberCount || 0;
  const captain = useMemo(() => members.find((member) => member.role === 'captain') ?? null, [members]);
  const viceCaptains = useMemo(() => members.filter((member) => member.role === 'vice_captain'), [members]);
  const leadershipShowcase = useMemo(
    () => [captain, ...viceCaptains].filter(Boolean).slice(0, 3),
    [captain, viceCaptains],
  );
  const averageLevel = useMemo(() => {
    if (members.length === 0) {
      return null;
    }

    return Math.round(
      members.reduce((total, member) => total + (member.stats?.level ?? 0), 0) / members.length
    );
  }, [members]);
  const positionCounts = useMemo(() => (
    members.reduce<Record<string, number>>((counts, member) => {
      if (member.position) {
        counts[member.position] = (counts[member.position] ?? 0) + 1;
      }
      return counts;
    }, {})
  ), [members]);
  const coveredPositions = Object.keys(positionCounts).length;
  const missingPositions = useMemo(
    () => ['GK', 'DF', 'MF', 'ST', 'WG'].filter((position) => !positionCounts[position]),
    [positionCounts]
  );
  const rotationGap = Math.max(0, 8 - squadSize);
  const lineupSlots = useMemo(() => {
    const rawLineup = (tacticsData as { lineup?: unknown } | undefined)?.lineup;
    if (!Array.isArray(rawLineup)) {
      return 0;
    }

    return rawLineup.filter(Boolean).length;
  }, [tacticsData]);
  const recentMatches = useMemo(() => recentMatchesData?.matches ?? [], [recentMatchesData]);
  const pendingReviewCount = useMemo(
    () => recentMatches.filter((match: any) => match.status === 'pending').length,
    [recentMatches]
  );
  const settledRecentMatches = useMemo(
    () => recentMatches.filter((match: any) => match.status === 'verified' || match.status === 'finalized'),
    [recentMatches]
  );
  const recentRecord = useMemo(() => {
    let wins = 0;
    let draws = 0;
    let losses = 0;

    settledRecentMatches.forEach((match: any) => {
      const summary = describeMatchForSquad(match, activeSquadId);
      if (summary.result === 'W') wins += 1;
      if (summary.result === 'D') draws += 1;
      if (summary.result === 'L') losses += 1;
    });

    return {
      wins,
      draws,
      losses,
      label: settledRecentMatches.length > 0 ? `${wins}-${draws}-${losses}` : 'No results',
      form: settledRecentMatches.length > 0
        ? settledRecentMatches.map((match: any) => describeMatchForSquad(match, activeSquadId).result).join('')
        : 'No verified results yet',
    };
  }, [activeSquadId, settledRecentMatches]);
  const overviewEvents = useMemo<OverviewEvent[]>(() => {
    const events: OverviewEvent[] = [];

    recentMatches.slice(0, 3).forEach((match: any) => {
      const summary = describeMatchForSquad(match, activeSquadId);
      const createdAt = parseTimestamp(match.createdAt || match.matchDate);
      const statusLabel =
        match.status === 'pending'
          ? 'Awaiting verification'
          : match.status === 'verified'
            ? 'Verified result'
            : match.status === 'finalized'
              ? 'Finalized result'
              : 'Match updated';

      events.push({
        id: `match-${match.id}`,
        title: match.status === 'pending'
          ? `${match.homeSquad?.name || 'Home squad'} vs ${match.awaySquad?.name || 'Away squad'} needs review`
          : `${summary.result} ${summary.goalsFor}-${summary.goalsAgainst} vs ${summary.opponent}`,
        detail: `${statusLabel} • ${formatDateLabel(match.createdAt || match.matchDate, { month: 'short', day: 'numeric' })}`,
        href: `/match?mode=detail&matchId=${match.id}`,
        timestamp: createdAt,
      });
    });

    const incomingOffer = transfersState.incomingOffers[0];
    if (incomingOffer) {
      events.push({
        id: `incoming-offer-${incomingOffer.id}`,
        title: `${incomingOffer.fromSquadName || incomingOffer.fromSquad} made an offer for ${incomingOffer.player.name}`,
        detail: `${incomingOffer.offerAmount.toLocaleString()} ${squadCurrency} • review in transfers`,
        href: '/squad?tab=transfers',
        timestamp: incomingOffer.timestamp.getTime(),
      });
    }

    const outgoingOffer = transfersState.outgoingOffers[0];
    if (outgoingOffer) {
      events.push({
        id: `outgoing-offer-${outgoingOffer.id}`,
        title: `Offer sent for ${outgoingOffer.player.name}`,
        detail: `${outgoingOffer.offerAmount.toLocaleString()} ${squadCurrency} to ${outgoingOffer.toSquadName || outgoingOffer.toSquad}`,
        href: '/squad?tab=transfers',
        timestamp: outgoingOffer.timestamp.getTime(),
      });
    }

    const latestTreasuryTransaction = treasuryState.treasury?.transactions[0];
    if (latestTreasuryTransaction) {
      const verb = latestTreasuryTransaction.type === 'income' ? 'Treasury funded' : 'Treasury spend logged';
      events.push({
        id: `treasury-${latestTreasuryTransaction.id}`,
        title: `${verb}: ${latestTreasuryTransaction.amount.toLocaleString()} ${squadCurrency}`,
        detail: latestTreasuryTransaction.description || 'Latest treasury ledger entry',
        href: '/squad?tab=treasury',
        timestamp: latestTreasuryTransaction.timestamp.getTime(),
      });
    }

    return events
      .filter((event) => event.timestamp > 0)
      .sort((left, right) => right.timestamp - left.timestamp)
      .slice(0, 4);
  }, [
    activeSquadId,
    recentMatches,
    squadCurrency,
    transfersState.incomingOffers,
    transfersState.outgoingOffers,
    treasuryState.treasury?.transactions,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "overview" || tab === "tactics" || tab === "transfers" || tab === "treasury" || tab === "governance" || tab === "settings") {
      setActiveTab(tab);
    }
    if (params.get("new") === "1") {
      setIsNewSquad(true);
    }
    const plan = parseTacticalPlanSearchParams(params);
    if (plan) {
      setImportedPlan(plan);
      setActiveTab("tactics");
      trackCoreGrowthEvent("tactics_customized", {
        source: "playground_import",
        formation: plan.formation,
        style: plan.style,
        size: plan.size,
      });
    }
  }, []);

  const importedPlanQuery = useMemo(
    () => importedPlan ? buildTacticalPlanQuery(importedPlan) : "",
    [importedPlan],
  );

  const handleMakeOffer = (playerId: string, targetSquadId: string, amount: number, type: 'transfer' | 'loan') => {
    return transfersState.makeOffer(playerId, targetSquadId, amount, type);
  };

  const handleRespondToOffer = (offerId: string, accept: boolean) => {
    return transfersState.respondToOffer(offerId, accept);
  };

  const handleDeposit = (amount: number) => {
    return treasuryState.deposit(amount);
  };

  const handleWithdraw = (amount: number, reason: string) => {
    return treasuryState.withdraw(amount, reason, "other");
  };

  const handleShareSquadInvite = async () => {
    if (!activeSquadId) {
      return;
    }

    const inviteUrl = buildSquadInviteUrl(activeSquadId);
    try {
      if (navigator.share && window.matchMedia("(max-width: 1024px)").matches) {
        await navigator.share({
          title: `Join ${activeSquad?.name ?? "our squad"} on SportWarren`,
          text: "Join the squad so tonight's match counts toward your player record.",
          url: inviteUrl,
        });
        setInviteShareState("shared");
        return;
      }

      await navigator.clipboard.writeText(inviteUrl);
      setInviteShareState("copied");
    } catch {
      setInviteShareState("error");
    }
  };

  if (showCreateSquadFlow) {
    return (
      <CreateSquadFlow
        onCreated={async () => {
          setShowCreateSquadFlow(false);
          await refreshSquads();
          router.push(importedPlanQuery ? `/squad?tab=tactics&new=1&${importedPlanQuery}` : '/squad?new=1');
        }}
        onCancel={() => setShowCreateSquadFlow(false)}
      />
    );
  }

  if (showJoinSquadFlow) {
    return (
      <JoinSquadFlow
        onJoined={async () => {
          setShowJoinSquadFlow(false);
          await refreshSquads();
          router.push(importedPlanQuery ? `/squad?tab=tactics&new=1&${importedPlanQuery}` : '/squad?new=1');
        }}
        onCancel={() => setShowJoinSquadFlow(false)}
      />
    );
  }

  if (squadWorkspaceGate.status === "blocked" && !showSample) {
    return (
      <PageShell maxWidth="4xl" className="space-y-4">
        {importedPlan && (
          <Card className="border-emerald-200 bg-emerald-50/80 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-emerald-900">Your setup is ready</p>
                <p className="mt-1 text-sm text-emerald-700">
                  Start your squad to save {importedPlan.size}v{importedPlan.size} · {importedPlan.formation} · {PLAY_STYLE_LABELS[importedPlan.style]} as your first tactical identity.
                </p>
              </div>
              {squadWorkspaceGate.reason === 'missing_squad' && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateSquadFlow(true)}
                >
                  Create squad from setup
                </Button>
              )}
            </div>
          </Card>
        )}
        <SquadPreview
          title={squadWorkspaceGate.title}
          description={squadWorkspaceGate.description}
          primaryAction={squadWorkspaceGate.primaryAction ? {
            label: squadWorkspaceGate.primaryAction.label,
            href: squadWorkspaceGate.primaryAction.href,
            onClick: squadWorkspaceGate.reason === 'missing_squad' ? () => setShowCreateSquadFlow(true) : undefined
          } : undefined}
          secondaryAction={{
            label: "See Pro Squad",
            onClick: () => setShowSample(true),
          }}
          onCreateSquad={squadWorkspaceGate.reason === 'missing_squad' ? () => setShowCreateSquadFlow(true) : undefined}
          onJoinSquad={squadWorkspaceGate.reason === 'missing_squad' ? () => setShowJoinSquadFlow(true) : undefined}
        />
      </PageShell>
    );
  }

  return (
    <PageShell ref={pullRef as React.RefObject<HTMLDivElement>} className="space-y-4 md:space-y-6 relative">
      {showSample && (
        <div className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Viewing Pro Squad Sample</p>
          </div>
          <Button size="sm" variant="outline" className="text-white border-white/40 hover:bg-white/10 h-8" onClick={() => setShowSample(false)}>
            Exit Preview
          </Button>
        </div>
      )}
      {/* Header — compact on mobile */}
      <div className="flex items-center gap-3 md:block md:text-center">
        <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 md:mx-auto md:mb-4">
          <Shield className="w-5 h-5 md:w-8 md:h-8 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">{activeSquad?.name ?? 'Squad Management'}</h1>
            {telegramConnected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <MessageCircle className="w-3 h-3" />
                Telegram
              </span>
            )}
            {treasuryState.treasury?.tonRail?.enabled && treasuryState.treasury?.tonRail?.walletAddress && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                <Diamond className="w-3 h-3" />
                TON
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate md:hidden">{activeSquad ? 'Manage your team' : 'Tactics · Transfers · Treasury'}</p>
          <p className="hidden md:block text-gray-600 dark:text-gray-300 mt-1">{activeSquad ? `Manage ${activeSquad.name}` : 'Manage your team, tactics, transfers, and finances'}</p>
        </div>
      </div>

      {/* New squad welcome banner */}
      {isNewSquad && (
        <Card className="border-green-200 bg-green-50/70 py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-900">Squad created! Here's what to do next.</p>
              <p className="mt-1 text-sm text-green-700">
                Set your <button onClick={() => setActiveTab('tactics')} className="underline font-medium">formation</button>,
                fund your <button onClick={() => setActiveTab('treasury')} className="underline font-medium">treasury</button>,
                then <Link href="/match?mode=capture" className="underline font-medium">log your first match</Link> to start building reputation.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={handleShareSquadInvite}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {inviteShareState === "shared"
                    ? "Invite Shared"
                    : inviteShareState === "copied"
                      ? "Invite Copied"
                      : "Invite Teammates"}
                </Button>
              </div>
              {inviteShareState === "error" && (
                <p className="mt-2 text-xs text-red-600">
                  Couldn&apos;t copy the invite link on this device. Open the squad on mobile and share again.
                </p>
              )}
            </div>
            <button onClick={() => setIsNewSquad(false)} className="shrink-0 text-green-600 hover:text-green-800 text-lg leading-none" aria-label="Dismiss banner">×</button>
          </div>
        </Card>
      )}

      {importedPlan && (
        <Card className="border-emerald-200 bg-emerald-50/80 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-emerald-900">Playground setup imported</p>
              <p className="mt-1 text-sm text-emerald-700">
                {importedPlan.size}v{importedPlan.size} · {importedPlan.formation} · {PLAY_STYLE_LABELS[importedPlan.style]} is ready in Tactics.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => setActiveTab('tactics')}
              >
                Review tactics
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShareSquadInvite}
              >
                Invite teammates
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* First-visit hint — shown until the user has opened the office/staff room */}
      {!squadChecklistDone && (
        <Card className="border-blue-200 bg-blue-50/70 py-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold text-blue-900">Set up your squad</p>
              <p className="mt-1 text-sm text-blue-700">
                Use the <strong>Tactics</strong> tab to set your formation, <strong>Treasury</strong> to manage finances, and <strong>Transfers</strong> to respond to incoming offers. Head to the Dashboard to open the Staff Office.
              </p>
            </div>
            <Link href="/dashboard" className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </Card>
      )}

      {/* Navigation Tabs — scrollable on mobile */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {[
          { key: 'overview', label: 'Overview', icon: Users },
          { key: 'tactics', label: 'Tactics', icon: Target },
          { key: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
          { key: 'treasury', label: 'Treasury', icon: Wallet },
          { key: 'governance', label: 'Governance', icon: Vote },
          { key: 'moments', label: 'Moments', icon: CalendarDays },
          { key: 'settings', label: 'Settings', icon: Settings },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as SquadTab)}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 md:px-4 rounded-md transition-all whitespace-nowrap min-w-max touch-manipulation ${
              activeTab === key
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="font-medium text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Ribbon — broadcast-style metrics bar */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            <div className="relative grid grid-cols-2 md:grid-cols-4">
              <div className="flex flex-col items-center justify-center px-4 py-4 md:py-5 border-r border-b md:border-b-0 border-white/[0.06] last:border-r-0">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-white">{squadSize}</span>
                <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Players</span>
              </div>
              <div className="flex flex-col items-center justify-center px-4 py-4 md:py-5 border-r border-b md:border-b-0 border-white/[0.06] last:border-r-0">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-400">{squadBalance.toLocaleString()}</span>
                <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">{squadCurrency} Balance</span>
              </div>
              <div className="flex flex-col items-center justify-center px-4 py-4 md:py-5 border-r border-white/[0.06] last:border-r-0">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-sky-400">{initialTactics?.formation ?? '—'}</span>
                <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Formation</span>
              </div>
              <div className="flex flex-col items-center justify-center px-4 py-4 md:py-5 border-r border-white/[0.06] last:border-r-0">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-amber-400">{recentRecord.label}</span>
                <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Recent Form</span>
              </div>
            </div>
          </div>

          <PendingActionsPanel squadId={activeSquadId} variant="compact" />

          {/* Squad Profile + Live Activity — atmospheric two-col panel */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.06)_0%,transparent_60%)]" />
            <div className="relative">
              {/* Panel header */}
              <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white">{activeSquad?.name ?? "Squad Overview"}</h2>
                  <p className="mt-0.5 text-sm text-gray-400">
                    Squad profile, recent fixtures, and live activity
                  </p>
                </div>
                <div className="inline-flex items-center rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  {recentMatchesLoading || scoutingFeedLoading ? 'Syncing' : 'Live'}
                </div>
              </div>

              {/* Two-column content */}
              <div className="grid gap-px bg-white/[0.06] lg:grid-cols-2">
                {/* Squad Profile */}
                <div className="bg-gray-900 p-5">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Squad Profile</h3>
                  {leadershipShowcase.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {leadershipShowcase.map((member) => {
                        if (!member) return null;
                        const avatarPresentation = buildSquadMemberAvatar(member as any);
                        return (
                          <div key={member.id} className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-2.5 py-2 border border-white/[0.06]">
                            <PlayerAvatar
                              presentation={avatarPresentation}
                              size="sm"
                              showBadge={false}
                            />
                            <div className="min-w-0">
                              <div className="truncate text-xs font-bold text-white">{member.name}</div>
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                {member.role === 'captain' ? 'Captain' : 'Vice captain'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <dl className="mt-4 space-y-2.5 text-sm">
                    {[
                      { label: 'Founded', value: activeSquad?.founded ? formatDateLabel(activeSquad.founded, { month: 'short', year: 'numeric' }) : 'Not available' },
                      { label: 'Home ground', value: activeSquad?.homeGround || 'Not set yet' },
                      { label: 'Leadership', value: captain ? `${captain.name}${viceCaptains.length > 0 ? ` + ${viceCaptains.length} vice captain${viceCaptains.length > 1 ? 's' : ''}` : ''}` : 'No captain assigned yet' },
                      { label: 'Coverage', value: `${coveredPositions}/5 positions covered${rotationGap > 0 ? ` • ${rotationGap} short of full rotation` : ' • full rotation'}` },
                      { label: 'Form', value: recentRecord.form },
                      { label: 'Avg. Level', value: averageLevel ?? 'Building data' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4">
                        <dt className="text-gray-500">{label}</dt>
                        <dd className="text-right font-medium text-white">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Live Activity */}
                <div className="bg-gray-900 p-5">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Live Activity</h3>
                  <div className="mt-3 space-y-2">
                    {overviewEvents.length > 0 ? overviewEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={event.href}
                        className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5"
                      >
                        <p className="text-sm font-bold text-white">{event.title}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{event.detail}</p>
                      </Link>
                    )) : (
                      <div className="rounded-xl border border-dashed border-white/[0.06] px-4 py-6 text-center">
                        <p className="text-sm font-semibold text-gray-300">
                          {recentMatchesLoading ? 'Loading squad activity...' : 'No live squad activity yet'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Log a match, move in the market, or use the treasury to start building the timeline.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invite section — attached at the bottom */}
              <div className="border-t border-white/[0.06] bg-indigo-950/30 px-5 py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-300">
                      <UserPlus className="w-4 h-4" />
                      <h3 className="text-sm font-bold">Invite teammates before kickoff</h3>
                    </div>
                    <p className="mt-0.5 text-xs text-indigo-400/80">
                      Share the invite so players can connect a wallet and make tonight&apos;s result count toward their record.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="secondary" className="bg-white/[0.08] text-white hover:bg-white/[0.12] border-white/[0.12]" onClick={handleShareSquadInvite}>
                      {inviteShareState === "shared"
                        ? "Invite Shared"
                        : inviteShareState === "copied"
                          ? "Invite Copied"
                          : "Copy Invite Link"}
                    </Button>
                    {inviteShareState === "copied" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready for chat share
                      </span>
                    )}
                  </div>
                </div>
                {inviteShareState === "error" && (
                  <p className="mt-2 text-[10px] text-red-400">
                    Couldn&apos;t copy the squad invite on this device. Try again from a browser with clipboard access.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CTA tiles — Tactics + Market Pulse with staggered entrance */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid md:grid-cols-2 gap-4"
          >
            <motion.button
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
              }}
              onClick={() => setActiveTab('tactics')}
              className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-gray-900 to-gray-900 p-5 text-left transition-all hover:border-emerald-500/40 hover:from-emerald-950/60 active:scale-[0.99]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.06)_0%,transparent_60%)]" />
              <div className="relative">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Current Tactics</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-400">Formation: <span className="font-semibold text-gray-200">{initialTactics?.formation ?? 'Not saved'}</span></p>
                  <p className="text-sm text-gray-400">Style: <span className="font-semibold text-gray-200">{initialTactics ? PLAY_STYLE_LABELS[initialTactics.style] : 'Choose'}</span></p>
                  <p className="text-sm text-gray-400">{lineupSlots > 0 ? `${lineupSlots} lineup slots assigned` : 'No lineup saved yet'}</p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                  Edit Tactics
                  <span className="text-emerald-500 transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </div>
            </motion.button>

            <motion.button
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
              }}
              onClick={() => setActiveTab('transfers')}
              className="group relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/40 via-gray-900 to-gray-900 p-5 text-left transition-all hover:border-sky-500/40 hover:from-sky-950/60 active:scale-[0.99]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.06)_0%,transparent_60%)]" />
              <div className="relative">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20">
                  <ArrowRightLeft className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">Market Pulse</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-400">Incoming offers: <span className="font-semibold text-gray-200">{transfersState.incomingOffers.length}</span></p>
                  <p className="text-sm text-gray-400">Live targets: <span className="font-semibold text-gray-200">{scoutingFeed?.listings.length ?? 0}</span></p>
                  <p className="text-sm text-gray-400">
                    {missingPositions.length > 0
                      ? `Priority: add ${missingPositions.join(', ')} depth`
                      : `${activeOffers} active market thread${activeOffers === 1 ? '' : 's'}`}
                  </p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 transition-colors group-hover:bg-sky-500/20">
                  Open Market
                  <span className="text-sky-500 transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* Match Operations — action ribbon with delayed entrance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.25 }}
            className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-gray-900 to-gray-900"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            <div className="relative flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Match Operations</h3>
                  <p className="mt-0.5 text-sm text-gray-400 max-w-xl">
                    {pendingReviewCount > 0
                      ? `${pendingReviewCount} match${pendingReviewCount === 1 ? '' : 'es'} waiting for review.`
                      : 'No matches waiting for review.'} {settledRecentMatches.length > 0
                      ? `${settledRecentMatches.length} recent verified result${settledRecentMatches.length === 1 ? '' : 's'} shaping form.`
                      : 'Log your next result to start building the live record.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href="/match?mode=verify">
                  <Button size="sm" variant="secondary" className="bg-white/[0.08] text-white hover:bg-white/[0.12] border-white/[0.12]">
                    Review Matches
                  </Button>
                </Link>
                <Link href="/match?mode=capture">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    Match Center
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'tactics' && (
        <TacticsBoard
          players={squadPlayers}
          initialTactics={initialTactics}
          initialLineup={tacticsData?.lineup || undefined}
          onSave={(tactics, lineup) => {
            if (!activeSquadId) return;
            trackFeatureUsed("tactics_saved", {
              source: importedPlan ? "playground_import" : "squad_page",
              formation: tactics.formation,
              style: tactics.style,
              size: importedPlan?.size ?? null,
            });
            trackCoreGrowthEvent("tactics_customized", {
              source: importedPlan ? "playground_import" : "squad_page",
              formation: tactics.formation,
              style: tactics.style,
              size: importedPlan?.size ?? null,
            });
            saveTacticsMutation.mutate({
              squadId: activeSquadId,
              formation: tactics.formation,
              playStyle: tactics.style,
              instructions: tactics.instructions,
              setPieces: tactics.setPieces,
              lineup,
            });
          }}
        />
      )}

      {activeTab === 'transfers' && (
        <TransferMarket
          squadBalance={squadBalance}
          incomingOffers={transfersState.incomingOffers}
          outgoingOffers={transfersState.outgoingOffers}
          marketListings={scoutingFeed?.listings ?? []}
          draftProspects={scoutingFeed?.prospects ?? []}
          marketFeedLoading={scoutingFeedLoading}
          currencyLabel={squadCurrency}
          paymentRailEnabled={Boolean(treasuryState.treasury?.paymentRail?.enabled)}
          onMakeOffer={handleMakeOffer}
          onRespondToOffer={handleRespondToOffer}
        />
      )}

      {activeTab === 'treasury' && (
        <Treasury
          treasury={treasuryState.treasury ?? undefined}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          onSetTonWalletAddress={treasuryState.setTonWalletAddress}
          onReconcilePendingTopUp={treasuryState.reconcilePendingTopUp}
        />
      )}

      {activeTab === 'governance' && (
        governanceGate.status === 'blocked' ? (
          <JourneyGateCard
            icon={Vote}
            eyebrow={governanceGate.eyebrow}
            title={governanceGate.title}
            description={governanceGate.description}
            primaryAction={governanceGate.primaryAction}
            secondaryAction={governanceGate.secondaryAction}
          />
        ) : (
          <SquadDAO />
        )
      )}

      {activeTab === 'moments' && (
        <SquadMomentsGallery subjectType="squad" subjectId={activeSquadId ?? ''} />
      )}

      {activeTab === 'settings' && (
        <SquadAutonomySettings squadId={activeSquadId} />
      )}
    </PageShell>
  );
}
