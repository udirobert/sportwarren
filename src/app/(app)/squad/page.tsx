"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SquadDAO } from "@/components/squad/SquadDAO";
import { TacticsBoard } from "@/components/squad/TacticsBoard";
import { TransferMarket } from "@/components/squad/TransferMarket";
import { Treasury } from "@/components/squad/Treasury";
import { JourneyGateCard } from "@/components/common/JourneyGateCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users, Target, ArrowRightLeft, Wallet, 
  Shield, Vote, Activity, Info
} from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { CreateSquadFlow } from "@/components/squad/CreateSquadFlow";
import { trpc } from "@/lib/trpc-client";
import { useTreasury } from "@/hooks/squad/useTreasury";
import { useTransfers } from "@/hooks/squad/useTransfers";
import { PendingActionsPanel } from "@/components/operations/PendingActionsPanel";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useSquadDetails } from "@/hooks/squad/useSquad";
import { useWallet } from "@/contexts/WalletContext";
import { VerificationBanner } from "@/components/common/VerificationBanner";
import { getJourneyActionGate } from "@/lib/journey/action-gates";
import { describeMatchForSquad } from "@/lib/match/summary";
import { useJourneyState } from "@/hooks/useJourneyState";
import type { Player, PlayerPosition, Tactics, Formation, PlayStyle, TeamInstructions } from "@/types";

type SquadTab = "overview" | "tactics" | "transfers" | "treasury" | "governance";

const PLAY_STYLE_LABELS: Record<PlayStyle, string> = {
  balanced: "Balanced",
  possession: "Possession",
  direct: "Direct",
  counter: "Counter Attack",
  high_press: "High Press",
  low_block: "Low Block",
};

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

export default function SquadPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SquadTab>("overview");
  const [showCreateSquadFlow, setShowCreateSquadFlow] = useState(false);
  const { chain, hasAccount, hasWallet, isVerified } = useWallet();
  const { journeyStage, memberships, refreshSquads } = useJourneyState();

  const activeMembership = memberships?.[0];
  const activeSquadId = activeMembership?.squad?.id;
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
  const { squad: detailedSquad, members } = useSquadDetails(activeSquadId);
  const activeSquad = detailedSquad ?? activeMembership?.squad;

  const { checklistItems } = useOnboarding();
  const squadChecklistDone = true; // open_office removed from checklist

  const treasuryState = useTreasury(activeSquadId);
  const transfersState = useTransfers(activeSquadId);
  const { data: recentMatchesData, isLoading: recentMatchesLoading } = trpc.match.list.useQuery(
    { squadId: activeSquadId, limit: 5 },
    { enabled: !!activeSquadId, staleTime: 30 * 1000 }
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

  const initialTactics: Tactics | undefined = useMemo(() => {
    if (!tacticsData) return undefined;
    const data = tacticsData as unknown;
    return {
      formation: (data as { formation: unknown }).formation as Formation,
      style: (data as { playStyle: unknown }).playStyle as PlayStyle,
      instructions: (data as { instructions: unknown }).instructions as TeamInstructions,
      setPieces: (data as { setPieces: unknown }).setPieces as Tactics['setPieces'],
    };
  }, [tacticsData]);

  const squadSize = members.length || activeSquad?.memberCount || 0;
  const captain = useMemo(() => members.find((member) => member.role === 'captain') ?? null, [members]);
  const viceCaptains = useMemo(() => members.filter((member) => member.role === 'vice_captain'), [members]);
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
    if (tab === "overview" || tab === "tactics" || tab === "transfers" || tab === "treasury" || tab === "governance") {
      setActiveTab(tab);
    }
    if (params.get("new") === "1") {
      setIsNewSquad(true);
    }
  }, []);

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

  if (showCreateSquadFlow) {
    return (
      <CreateSquadFlow
        onCreated={async () => {
          setShowCreateSquadFlow(false);
          await refreshSquads();
          router.push('/squad?new=1');
        }}
      />
    );
  }

  if (squadWorkspaceGate.status === "blocked") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 nav-spacer-top nav-spacer-bottom text-gray-900 dark:text-gray-100">
        <JourneyGateCard
          icon={Shield}
          eyebrow={squadWorkspaceGate.eyebrow}
          title={squadWorkspaceGate.title}
          description={squadWorkspaceGate.description}
          primaryAction={squadWorkspaceGate.primaryAction}
          secondaryAction={squadWorkspaceGate.secondaryAction}
          onPrimaryAction={squadWorkspaceGate.reason === 'missing_squad' ? () => setShowCreateSquadFlow(true) : undefined}
        />
      </div>
    );
  }

  return (
    <div ref={pullRef as React.RefObject<HTMLDivElement>} className="max-w-6xl mx-auto px-4 py-4 md:py-6 nav-spacer-top nav-spacer-bottom space-y-4 md:space-y-6 text-gray-900 dark:text-gray-100">
      <VerificationBanner />
      {/* Header — compact on mobile */}
      <div className="flex items-center gap-3 md:block md:text-center">
        <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 md:mx-auto md:mb-4">
          <Shield className="w-5 h-5 md:w-8 md:h-8 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">{activeSquad?.name ?? 'Squad Management'}</h1>
          <p className="text-sm text-gray-500 truncate md:hidden">{activeSquad ? 'Manage your team' : 'Tactics · Transfers · Treasury'}</p>
          <p className="hidden md:block text-gray-600 mt-1">{activeSquad ? `Manage ${activeSquad.name}` : 'Manage your team, tactics, transfers, and finances'}</p>
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
            </div>
            <button onClick={() => setIsNewSquad(false)} className="shrink-0 text-green-600 hover:text-green-800 text-lg leading-none">×</button>
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
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as SquadTab)}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 md:px-4 rounded-md transition-all whitespace-nowrap min-w-max touch-manipulation ${
              activeTab === key
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
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
          {/* Quick Stats — moved here so tab bar is near the top on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-gray-900">{squadSize}</div>
              <div className="text-sm text-gray-600">Players</div>
            </Card>
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-green-600">{squadBalance.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{squadCurrency} Balance</div>
            </Card>
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-blue-600">{initialTactics?.formation ?? 'Unset'}</div>
              <div className="text-sm text-gray-600">Formation</div>
            </Card>
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-purple-600">{recentRecord.label}</div>
              <div className="text-sm text-gray-600">Recent Record</div>
            </Card>
          </div>

          <PendingActionsPanel squadId={activeSquadId} variant="compact" />

          <Card>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeSquad?.name ?? "Squad Overview"}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Live operating view across squad setup, recent fixtures, treasury movement, and market activity.
                </p>
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-700">
                {recentMatchesLoading || scoutingFeedLoading ? 'Syncing live data' : 'Live data connected'}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
                <h3 className="font-semibold text-gray-900">Squad Profile</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-gray-500">Founded</dt>
                    <dd className="text-right font-medium text-gray-900">
                      {activeSquad?.founded
                        ? formatDateLabel(activeSquad.founded, { month: 'short', year: 'numeric' })
                        : 'Not available'}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-gray-500">Home ground</dt>
                    <dd className="text-right font-medium text-gray-900">{activeSquad?.homeGround || 'Not set yet'}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-gray-500">Leadership</dt>
                    <dd className="text-right font-medium text-gray-900">
                      {captain
                        ? `${captain.name}${viceCaptains.length > 0 ? ` + ${viceCaptains.length} vice captain${viceCaptains.length > 1 ? 's' : ''}` : ''}`
                        : 'No captain assigned yet'}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-gray-500">Coverage</dt>
                    <dd className="text-right font-medium text-gray-900">
                      {coveredPositions}/5 positions covered{rotationGap > 0 ? ` • ${rotationGap} short of full rotation` : ' • full rotation'}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-gray-500">Recent form</dt>
                    <dd className="text-right font-medium text-gray-900">{recentRecord.form}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-gray-500">Average level</dt>
                    <dd className="text-right font-medium text-gray-900">{averageLevel ?? 'Building data'}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <h3 className="font-semibold text-gray-900">Live Activity</h3>
                <div className="mt-4 space-y-3">
                  {overviewEvents.length > 0 ? overviewEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={event.href}
                      className="block rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50/60"
                    >
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="mt-1 text-sm text-gray-600">{event.detail}</p>
                    </Link>
                  )) : (
                    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center">
                      <p className="font-medium text-gray-900">
                        {recentMatchesLoading ? 'Loading squad activity...' : 'No live squad activity yet'}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Log a match, move in the market, or use the treasury to start building the squad timeline.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('tactics')}>
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Current Tactics</h3>
              </div>
              <p className="text-gray-600">Formation: {initialTactics?.formation ?? 'Not saved yet'}</p>
              <p className="text-gray-600">Style: {initialTactics ? PLAY_STYLE_LABELS[initialTactics.style] : 'Choose a play style'}</p>
              <p className="text-gray-600">{lineupSlots > 0 ? `${lineupSlots} lineup slots assigned` : 'No lineup saved yet'}</p>
              <Button variant="outline" className="mt-4 w-full">
                Edit Tactics
              </Button>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('transfers')}>
              <div className="flex items-center space-x-3 mb-3">
                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Market Pulse</h3>
              </div>
              <p className="text-gray-600">Incoming offers: {transfersState.incomingOffers.length}</p>
              <p className="text-gray-600">Live squad targets: {scoutingFeed?.listings.length ?? 0}</p>
              <p className="text-gray-600">
                {missingPositions.length > 0
                  ? `Priority: add ${missingPositions.join(', ')} depth`
                  : `Priority: upgrade quality across ${activeOffers} active market thread${activeOffers === 1 ? '' : 's'}`}
              </p>
              <Button variant="outline" className="mt-4 w-full">
                Open Market
              </Button>
            </Card>
          </div>

          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Match Operations</h3>
                </div>
                <p className="text-gray-600">
                  {pendingReviewCount > 0
                    ? `${pendingReviewCount} match ${pendingReviewCount === 1 ? 'is' : 'are'} waiting for review.`
                    : 'No matches are waiting for review right now.'} {settledRecentMatches.length > 0
                    ? `${settledRecentMatches.length} recent verified result${settledRecentMatches.length === 1 ? '' : 's'} are already shaping squad form.`
                    : 'Log your next result to start building the live performance record.'}
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/match?mode=verify">
                  <Button variant="outline">Review Matches</Button>
                </Link>
                <Link href="/match?mode=capture">
                  <Button>Open Match Center</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'tactics' && (
        <TacticsBoard
          players={squadPlayers}
          initialTactics={initialTactics}
          initialLineup={tacticsData?.lineup || undefined}
          onSave={(tactics, lineup) => {
            if (!activeSquadId) return;
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
    </div>
  );
}
