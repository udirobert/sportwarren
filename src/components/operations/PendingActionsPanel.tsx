"use client";

import Link from "next/link";
import { AlertCircle, ArrowRightLeft, CheckCircle2, Clock3, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMatchVerification } from "@/hooks/match/useMatchVerification";
import { useTransfers } from "@/hooks/squad/useTransfers";
import { useTreasury } from "@/hooks/squad/useTreasury";

interface PendingActionsPanelProps {
  squadId?: string;
  variant?: "full" | "compact";
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "amber" | "blue" | "rose";
}

const TONE_STYLES: Record<ActionItem["tone"], string> = {
  amber: "border-amber-200 bg-amber-50/80",
  blue: "border-blue-200 bg-blue-50/80",
  rose: "border-rose-200 bg-rose-50/80",
};

export function PendingActionsPanel({ squadId, variant = "full" }: PendingActionsPanelProps) {
  const { pendingMatches } = useMatchVerification(squadId);
  const { incomingOffers } = useTransfers(squadId);
  const { treasury } = useTreasury(squadId);

  const firstPendingMatch = pendingMatches[0];
  const wageBudget = treasury?.allowances.weeklyWages ?? 0;
  const treasuryNeedsAttention = Boolean(
    treasury &&
      wageBudget > 0 &&
      treasury.balance < wageBudget,
  );

  const actions: ActionItem[] = [];

  if (pendingMatches.length > 0) {
    actions.push({
      id: "matches",
      title: `${pendingMatches.length} match ${pendingMatches.length === 1 ? "needs" : "need"} review`,
      description: firstPendingMatch
        ? `${firstPendingMatch.homeTeam} vs ${firstPendingMatch.awayTeam} is waiting for verification.`
        : "Open the match queue and clear pending verifications.",
      href: firstPendingMatch ? `/match?mode=detail&matchId=${firstPendingMatch.id}` : "/match?mode=verify",
      cta: firstPendingMatch ? "Review match" : "Open queue",
      icon: Clock3,
      tone: "amber",
    });
  }

  if (incomingOffers.length > 0) {
    actions.push({
      id: "transfers",
      title: `${incomingOffers.length} transfer ${incomingOffers.length === 1 ? "offer" : "offers"} pending`,
      description: "Respond to incoming transfer business before the current window moves on.",
      href: "/squad?tab=transfers",
      cta: "Review offers",
      icon: ArrowRightLeft,
      tone: "blue",
    });
  }

  if (treasuryNeedsAttention) {
    actions.push({
      id: "treasury",
      title: "Treasury top-up recommended",
      description: `Balance is ${treasury?.balance.toLocaleString()} against a weekly wages budget of ${wageBudget.toLocaleString()}.`,
      href: "/squad?tab=treasury",
      cta: "Open treasury",
      icon: Wallet,
      tone: "rose",
    });
  }

  if (variant === "compact") {
    return (
      <Card className="border-dashed">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
            <p className="text-sm text-gray-600">
              {actions.length > 0 ? "Clear the current operational queue." : "No urgent squad actions right now."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.length > 0 ? (
              actions.map((action) => (
                <Link key={action.id} href={action.href}>
                  <Button variant="outline">{action.cta}</Button>
                </Link>
              ))
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                All caught up
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 bg-white">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Pending Actions
          </div>
          <h2 className="text-xl font-bold text-gray-900">Operational queue</h2>
          <p className="mt-1 text-sm text-gray-600">
            Surface the next move across matches, transfers, and treasury from one place.
          </p>
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">Queue is clear</h3>
          <p className="mt-1 text-sm text-gray-600">No pending reviews, transfer responses, or treasury interventions.</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.id} className={`rounded-2xl border p-4 ${TONE_STYLES[action.tone]}`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Icon className="h-5 w-5 text-gray-900" />
                  <Link href={action.href}>
                    <Button size="sm" variant="outline">{action.cta}</Button>
                  </Link>
                </div>
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{action.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
