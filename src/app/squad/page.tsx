"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SquadDAO } from "@/components/squad/SquadDAO";
import { TacticsBoard } from "@/components/squad/TacticsBoard";
import { TransferMarket } from "@/components/squad/TransferMarket";
import { Treasury } from "@/components/squad/Treasury";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users, Target, ArrowRightLeft, Wallet, 
  Shield, Vote, Activity, Info
} from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { MOCK_SQUAD_PLAYERS } from "@/lib/mocks";
import { trpc } from "@/lib/trpc-client";
import { useTreasury } from "@/hooks/squad/useTreasury";
import { useTransfers } from "@/hooks/squad/useTransfers";
import { PendingActionsPanel } from "@/components/operations/PendingActionsPanel";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

type SquadTab = "overview" | "tactics" | "transfers" | "treasury" | "governance";

export default function SquadPage() {
  const [activeTab, setActiveTab] = useState<SquadTab>("overview");
  const { data: memberships } = trpc.squad.getMySquads.useQuery(undefined, {
    retry: false,
  });

  const activeMembership = memberships?.[0];
  const activeSquad = activeMembership?.squad;
  const activeSquadId = activeSquad?.id;

  const { checklistItems } = useOnboarding();
  const squadChecklistDone = checklistItems.find(i => i.id === 'open_office')?.completed ?? false;

  const treasuryState = useTreasury(activeSquadId);
  const transfersState = useTransfers(activeSquadId);

  const squadBalance = treasuryState.treasury?.balance ?? activeSquad?.treasuryBalance ?? 15000;
  const squadCurrency = treasuryState.treasury?.currency ?? "ALGO";
  const activeOffers = transfersState.incomingOffers.length + transfersState.outgoingOffers.length;

  const [isNewSquad, setIsNewSquad] = useState(false);
  const utils = trpc.useUtils();
  const pullRef = usePullToRefresh({
    onRefresh: () => utils.squad.getMySquads.invalidate(),
  });

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

  const handleMakeOffer = (playerId: string, amount: number, type: 'transfer' | 'loan') => {
    return transfersState.makeOffer(playerId, amount, type);
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

  return (
    <div ref={pullRef as React.RefObject<HTMLDivElement>} className="max-w-6xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-6 space-y-4 md:space-y-6">
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
            <Link href="/" className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
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
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
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
              <div className="text-2xl font-bold text-gray-900">{activeSquad?._count.members ?? 16}</div>
              <div className="text-sm text-gray-600">Players</div>
            </Card>
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-green-600">{squadBalance.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{squadCurrency} Balance</div>
            </Card>
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-blue-600">4-3-3</div>
              <div className="text-sm text-gray-600">Formation</div>
            </Card>
            <Card className="text-center py-3">
              <div className="text-2xl font-bold text-purple-600">{activeOffers}</div>
              <div className="text-sm text-gray-600">Active Offers</div>
            </Card>
          </div>

          <PendingActionsPanel squadId={activeSquadId} variant="compact" />

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{activeSquad?.name ?? "Northside United"}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Squad Overview</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Founded: 2018</li>
                  <li>• Home Ground: {activeSquad?.homeGround ?? "Hackney Marshes"}</li>
                  <li>• League Position: 3rd</li>
                  <li>• Form: WWDLW</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Recent Activity</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Won vs Red Lions (3-1)</li>
                  <li>• New offer for Marcus Johnson</li>
                  <li>• Tactics updated by captain</li>
                  <li>• Treasury deposit: +500 ALGO</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('tactics')}>
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Current Tactics</h3>
              </div>
              <p className="text-gray-600">Formation: 4-3-3</p>
              <p className="text-gray-600">Style: Balanced</p>
              <Button variant="outline" className="mt-4 w-full">
                Edit Tactics
              </Button>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('transfers')}>
              <div className="flex items-center space-x-3 mb-3">
                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Transfer Activity</h3>
              </div>
              <p className="text-gray-600">Incoming offers: {transfersState.incomingOffers.length}</p>
              <p className="text-gray-600">Outgoing offers: {transfersState.outgoingOffers.length}</p>
              <Button variant="outline" className="mt-4 w-full">
                View Transfers
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
                  Submit results, review pending verifications, and monitor match fee settlement from one place.
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
          players={MOCK_SQUAD_PLAYERS}
          onSave={(tactics) => console.log('Saving tactics:', tactics)}
        />
      )}

      {activeTab === 'transfers' && (
        <TransferMarket
          squadBalance={squadBalance}
          incomingOffers={transfersState.incomingOffers}
          outgoingOffers={transfersState.outgoingOffers}
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
        <SquadDAO />
      )}
    </div>
  );
}
