"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatchPreviewCard } from '@/components/match/MatchPreviewCard';
import { useActiveSquad } from '@/contexts/ActiveSquadContext';
import { useTactics } from '@/hooks/squad/useTactics';
import { trpc } from '@/lib/trpc-client';
import { 
  ChevronLeft, 
  Zap,
  Sword,
  Info
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function MatchPreviewPage() {
  const router = useRouter();
  // const matchId = params.id as string;
  const { activeSquad, activeSquadId } = useActiveSquad();
  const { tactics } = useTactics(activeSquadId || undefined);

  // In a real app, we'd fetch specific match data
  // For now, we'll use the first recent match as a mock if matchId is 'next'
  const { data: stats, isLoading } = trpc.match.list.useQuery(
    { squadId: activeSquadId || '', limit: 1 },
    { enabled: !!activeSquadId }
  );

  const opponentName = stats?.matches?.[0]?.opponent || "Upcoming Opponent";
  const matchDate = stats?.matches?.[0]?.timestamp ? new Date(stats.matches[0].timestamp) : new Date();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6 nav-spacer-top">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 nav-spacer-top nav-spacer-bottom space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-emerald-100 text-emerald-700">
             Match Preview
           </span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">
          Match Preview
        </h1>
        <p className="text-gray-600">
          Scouting report and tactical breakdown for your upcoming clash with {opponentName}.
        </p>
      </div>

      <MatchPreviewCard 
        homeSquad={activeSquad?.squad?.name || "Your Squad"}
        awaySquad={opponentName}
        matchDate={matchDate}
        venue="Home Ground"
        homeFormation={tactics?.formation || '4-4-2'}
        homeWinPct={65}
        awayWinPct={20}
        drawPct={15}
        isRivalry={true}
        rivalryContext="Local Derby"
        tacticalInsight="Opponent tends to play a high line. Look for balls over the top to your pacey forwards."
        scoutingReport="They have won 3 of their last 5 matches. Their left winger is their primary creative outlet."
        keyThreats={["Fast left winger", "Dangerous on set pieces"]}
        keyOpportunities={["Slow center backs", "High defensive line"]}
        simulationSummary="Based on current form and tactical matching, your squad has a strong advantage at home."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Zap className="w-5 h-5" />
            <h3 className="font-bold">Staff Recommendation</h3>
          </div>
          <p className="text-sm text-gray-600 italic">
            "Coach says we should stick to our attacking 4-3-3. Their midfield struggle to track runners from deep, so let's exploit that space."
          </p>
          <div className="pt-4 flex gap-2">
            <Link href="/squad?tab=tactics">
              <Button size="sm">Adjust Tactics</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Sword className="w-5 h-5" />
            <h3 className="font-bold">Match Hype</h3>
          </div>
          <p className="text-sm text-gray-600">
            Generate a shareable hype card to rally your teammates and intimidate the opposition.
          </p>
          <div className="pt-4 flex gap-2">
            <Button size="sm" variant="outline">Generate Hype Card</Button>
            <Button size="sm" variant="outline">Share to Group Chat</Button>
          </div>
        </Card>
      </div>
      
      <Card className="p-8 border-dashed border-2 flex flex-col items-center text-center space-y-4 bg-gray-50/50">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
           <Info className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Post-Match Flow</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Once the final whistle blows, return here to log the result and claim your XP.
          </p>
        </div>
        <Link href="/match?mode=capture">
          <Button variant="secondary">Log Result</Button>
        </Link>
      </Card>
    </div>
  );
}
