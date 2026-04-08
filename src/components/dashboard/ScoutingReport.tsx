"use client";

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, ShieldAlert, Target, TrendingUp, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { useJourneyState } from '@/hooks/useJourneyState';

interface ScoutingReportProps {
  squadId?: string;
}

export const ScoutingReport: React.FC<ScoutingReportProps> = ({ squadId }) => {
  const { hasAccount, hasWallet, isGuest, isVerified } = useJourneyState();
  const { data: feed, isLoading } = trpc.market.listScoutingFeed.useQuery(
    { squadId: squadId || '' },
    { enabled: !!squadId && hasWallet && isVerified, staleTime: 30 * 1000 }
  );

  if (!hasAccount || isGuest) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-gray-100 p-2">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Scouting Report</h2>
            <p className="mt-1 text-sm text-gray-600">
              Scouting becomes useful once you are running a real squad with a transfer market to act on.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!hasWallet || !isVerified) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-100 p-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Scouting Report</h2>
            <p className="mt-1 text-sm text-gray-600">
              Verify your wallet to unlock the live scouting feed and act on real transfer signals.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!squadId) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-gray-100 p-2">
            <Target className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Scouting Report</h2>
            <p className="mt-1 text-sm text-gray-600">
              Create or join a squad first. The scouting board is only meaningful when there is a real roster to improve.
            </p>
            <div className="mt-4">
              <Link href="/squad">
                <Button size="sm">Open Squad Setup</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading && !feed) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-blue-900 text-white animate-pulse">
        <div className="h-4 w-32 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-800 rounded"></div>
          <div className="h-8 bg-gray-800 rounded"></div>
        </div>
      </Card>
    );
  }

  const primaryTarget = feed?.listings?.[0] ?? feed?.prospects?.[0] ?? null;
  const sourceLabel = primaryTarget?.isDraftEligible ? 'Free Agent Signal' : 'Transfer Listing';

  if (!primaryTarget) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-gray-100 p-2">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Scouting Report</h2>
            <p className="mt-1 text-sm text-gray-600">
              The live scouting feed is quiet right now. New targets will appear here when real squad and player activity generates market signals.
            </p>
            <div className="mt-4">
              <Link href="/squad?tab=transfers">
                <Button size="sm" variant="outline">Open Transfer Market</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-blue-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Search className="w-24 h-24" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-500/20 p-1.5 rounded-lg border border-blue-500/30">
              <Search className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Scouting Report</h2>
              <p className="text-xs text-gray-400">{sourceLabel}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full">
            <span className="text-xs font-black text-blue-400 uppercase">
              {primaryTarget.reputationTier}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xl font-black tracking-tight">{primaryTarget.name}</div>
            <div className="flex items-center space-x-2 text-blue-300">
              <span className="text-xs font-bold uppercase">
                {primaryTarget.position} • {primaryTarget.currentClub}
              </span>
              <div className="w-1 h-1 bg-blue-300 rounded-full" />
              <span className="text-xs font-mono">
                Rep {primaryTarget.reputationScore}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-blue-400 uppercase">Suggested Opening Offer</div>
            <div className="text-sm font-black">{primaryTarget.askingPrice.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black/30 rounded-lg p-2 border border-white/5">
            <div className="text-xs font-black uppercase text-gray-400">Overall</div>
            <div className="mt-1 text-lg font-black">{primaryTarget.overall}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-2 border border-white/5">
            <div className="text-xs font-black uppercase text-gray-400">Market Value</div>
            <div className="mt-1 text-lg font-black">{primaryTarget.marketValuation.toLocaleString()}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-2 border border-white/5">
            <div className="flex items-center gap-1 text-xs font-black uppercase text-gray-400">
              <TrendingUp className="w-3 h-3" />
              Demand
            </div>
            <div className="mt-1 text-lg font-black">
              {primaryTarget.isDraftEligible ? 'Open' : 'Active'}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link href="/squad?tab=transfers" className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Open Transfer Market
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
            onClick={() => {
              // Strategy: Link to Match Engine with preset tactics
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Zap className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
