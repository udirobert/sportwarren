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
  Shield, Vote, Activity, Info, UserPlus, CheckCircle2, MessageCircle, Diamond
} from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { CreateSquadFlow } from "@/components/squad/CreateSquadFlow";
import { JoinSquadFlow } from "@/components/squad/JoinSquadFlow";
import { SquadPreview } from "@/components/squad/SquadPreview";
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
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import type { Player, PlayerPosition, Tactics, Formation, PlayStyle, TeamInstructions } from "@/types";
import { buildSquadInviteUrl } from "@/lib/squad/invite";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { buildDerivedAvatarPresentation } from "@/lib/avatar/builders";
import type { AvatarPresentation } from "@/lib/avatar/types";

type SquadTab = "overview" | "tactics" | "transfers" | "treasury" | "governance";

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
  return buildDerivedAvatarPresentation({
    userId: member.id,
    name: member.name,
    imageUrl: member.avatar,
    role: member.role,
    position: member.position,
    level: member.stats?.level,
    totalMatches: member.stats?.matches,
    totalGoals: member.stats?.goals,
  });
}

export default function SquadPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SquadTab>("overview");
  const [showCreateSquadFlow, setShowCreateSquadFlow] = useState(false);
  const [showJoinSquadFlow, setShowJoinSquadFlow] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [inviteShareState, setInviteShareState] = useState<"idle" | "copied" | "shared" | "error">("idle");
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

  const initialTactics: Tactics | undefined = useMemo((): Tactics | undefined => {
    if (!tacticsData) return undefined;
    const f = String(tacticsData.formation ?? '');
    const validSet = new Set([
      '4-4-2', '4-3-3', '4-2-3-1', '4-5-1', '4-1-4-1',
      '3-5-2', '3-4-3', '5-3-2', '5-4-1', '4-3-1-2',
      '1-2-1', '1-1-2', '1-3-1', '1-2-2', '1-2-1-1',
      '1-4-1', '1-3-2', '1-3-1-1', '2-3-1',
    ]);
    if (!validSet.has(f)) return undefined;
    const data: Record<string, unknown> = tacticsData as Record<string, unknown>;
    return {
      formation: f as Formation,
      style: (typeof data.playStyle === 'string' ? data.playStyle : 'balanced') as PlayStyle,
      instructions: (data.instructions as TeamInstructions) ?? { width: 'normal', tempo: 'normal', passing: 'mixed', pressing: 'medium', defensiveLine: 'normal' },
      setPieces: (data.setPieces as Tactics['setPieces']) ?? { corners: 'near_post', freeKicks: 'shoot', penalties: '' },
    };
  }, [tacticsData]);

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
          router.push('/squad?new=1');
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
          router.push('/squad?new=1');
        }}
        onCancel={() => setShowJoinSquadFlow(false)}
      />
    );
  }

  if (squadWorkspaceGate.status === "blocked" && !showSample) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 nav-spacer-top nav-spacer-bottom text-gray-900 dark:text-gray-100 space-y-4">
        <VerificationBanner />
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
      </div>
    );
  }

  return (
    <div ref={pullRef as React.RefObject<HTMLDivElement>} className="max-w-6xl mx-auto px-4 py-4 md:py-6 nav-spacer-top nav-spacer-bottom space-y-4 md:space-y-6 text-gray-900 dark:text-gray-100 relative">
      <VerificationBanner />
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
                {leadershipShowcase.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3">
                    {leadershipShowcase.map((member) => {
                      if (!member) return null;
                      const avatarPresentation = buildSquadMemberAvatar(member as any);

                      return (
                        <div key={member.id} className="flex items-center gap-2 rounded-xl bg-gray-50 px-2.5 py-2">
                          <PlayerAvatar
                            presentation={avatarPresentation}
                            size="sm"
                            showBadge={false}
                          />
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold text-gray-900">{member.name}</div>
                            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                              {member.role === 'captain' ? 'Captain' : 'Vice captain'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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

            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-900">
                    <UserPlus className="w-4 h-4" />
                    <h3 className="font-semibold">Invite teammates before kickoff</h3>
                  </div>
                  <p className="mt-1 text-sm text-blue-800">
                    Share the squad invite so players can connect a wallet, join the squad, and make tonight&apos;s result count toward their record.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="secondary" onClick={handleShareSquadInvite}>
                    {inviteShareState === "shared"
                      ? "Invite Shared"
                      : inviteShareState === "copied"
                        ? "Invite Copied"
                        : "Copy Invite Link"}
                  </Button>
                  {inviteShareState === "copied" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready for Chat Share                    </span>
                  )}
                </div>
              </div>
              {inviteShareState === "error" && (
                <p className="mt-2 text-xs text-red-600">
                  We couldn&apos;t copy the squad invite on this device. Try again from a browser with clipboard access.
                </p>
              )}
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
    </div>
  );
}
