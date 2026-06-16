"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { trpc } from "@/lib/trpc-client";
import { MatchEnginePreview } from "@/components/dashboard/MatchEnginePreview";
import { MatchScoreCard } from "@/components/match/MatchScoreCard";
import { MatchKeepsakeCard } from "@/components/match/MatchKeepsakeCard";
import { AlertCircle, Shield, CheckCircle2, ArrowLeft, Star } from "lucide-react";

export default function PublicMatchPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: match, isLoading, error } = trpc.match.getById.useQuery(
    { id },
    { enabled: !!id },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading match...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="bg-gray-900 border-gray-800 p-8 max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Match not found</h2>
          <p className="text-gray-400 text-sm mb-4">
            This link may be invalid or the match has been removed.
          </p>
          <Link href="/">
            <Button variant="secondary" size="sm">Go to homepage</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const m = match as any;
  const homeName = m.homeSquad?.name ?? "Home";
  const awayName = m.awaySquad?.name ?? "Away";
  const isVerified = m.status === "verified";
  const isPending = m.status === "pending";
  const isDisputed = m.status === "disputed";

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Status header */}
      <div className="bg-black/50 border-b border-white/5 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">SportWarren</span>
          </Link>
          <div className="flex items-center space-x-2">
            {isVerified && (
              <span className="flex items-center space-x-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            )}
            {isPending && (
              <span className="flex items-center space-x-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                <span>Pending verification</span>
              </span>
            )}
            {isDisputed && (
              <span className="flex items-center space-x-1 text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" />
                <span>Disputed</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Score card + share actions */}
        <MatchScoreCard
          homeName={homeName}
          awayName={awayName}
          homeScore={match.homeScore ?? 0}
          awayScore={match.awayScore ?? 0}
          matchDate={new Date(match.matchDate).toLocaleDateString()}
          matchUrl={typeof window !== "undefined" ? window.location.href : ""}
        />

        {/* Keepsake card — the memento, replaces both ShareCard + reveal ceremony */}
        <MatchKeepsakeCard
          matchId={id}
          homeTeam={{ name: homeName }}
          awayTeam={{ name: awayName }}
          homeScore={match.homeScore ?? 0}
          awayScore={match.awayScore ?? 0}
          date={new Date(match.matchDate).toLocaleDateString()}
          playerStats={m.playerStats ?? []}
        />

        {/* Match visualization */}
        <MatchEnginePreview
          squadId={m.homeSquadId}
          awaySquadId={m.awaySquadId}
          playersPerSide={m.playersPerSide ?? 11}
          hasKeeper={m.hasKeeper ?? true}
        />

        {/* The keepsake card includes the reveal ceremony + share actions */}

        {/* Verifications list */}
        {m.verifications?.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Verifications
            </h4>
            <div className="space-y-2 text-xs">
              {m.verifications.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                      {v.verifier?.name?.[0] || "A"}
                    </div>
                    <span className="text-white font-medium">{v.verifier?.name ?? "Anonymous"}</span>
                    {v.verifier?.playerProfile?.reputationScore !== undefined && (
                      <span className="text-gray-500">
                        Rep: {v.verifier.playerProfile.reputationScore}
                      </span>
                    )}
                  </div>
                  <span
                    className={
                      v.verified ? "text-green-400 font-bold" : "text-red-400 font-bold"
                    }
                  >
                    {v.verified ? "Confirmed" : "Disputed"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Match Fee card — escrow status without protocol jargon */}
        {isVerified && m.yellowFeeSessionId && (
          <Card className="bg-gray-900 border-blue-500/30 p-4">
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-3 h-3" /> Match Fee
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <span
                  className={
                    m.yellowFeeSettledAt
                      ? "text-emerald-300 font-bold"
                      : "text-amber-300 font-bold"
                  }
                >
                  {m.yellowFeeSettledAt
                    ? "Settled"
                    : "Locked (refunds if match disputed)"}
                </span>
              </div>
              {m.yellowFeeSettledAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Settled at</span>
                  <span className="text-emerald-300 font-bold">
                    {new Date(m.yellowFeeSettledAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Public result badge */}
        {isVerified && (
          <Card className="bg-gray-900 border-emerald-500/30 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Public Result
                </h4>
                <p className="text-xs text-emerald-200/70 mt-0.5">
                  Match result is publicly verifiable — other managers can
                  request a copy through SportWarren.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Peer ratings CTA */}
        {isVerified && (
          <Card className="bg-gradient-to-br from-gray-900 to-indigo-950/20 border-indigo-500/30 p-6 text-center shadow-lg shadow-indigo-500/10">
            <div className="mx-auto w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Teammate Scouting</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Rate your teammates performance to award them XP and build your Scout reputation.
            </p>
            <Link href={`/match/${m.id}/rate`}>
              <Button className="w-full md:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11">
                Rate Teammates
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
