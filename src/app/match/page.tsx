"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MatchCapture } from "@/components/match/MatchCapture";
import { MatchConsensusPanel } from "@/components/match/MatchConsensus";
import { MatchConfirmation } from "@/components/match/MatchConfirmation";
import { XPGainSummary } from "@/components/player/XPGainPopup";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { trpc } from "@/lib/trpc-client";
import { useMatchVerification } from "@/hooks/match/useMatchVerification";
import { useMatchCenterData } from "@/hooks/match/useMatchCenterData";
import { useWallet } from "@/contexts/WalletContext";
import { VerificationBanner } from "@/components/common/VerificationBanner";
import {
  Trophy,
  Shield,
  Activity,
  Sparkles,
  Cpu,
  AlertCircle,
  Clock3,
  CheckCircle2,
  Camera,
  MapPin,
  Mic,
  Users,
  Info,
} from "lucide-react";
import { MOCK_XP_SUMMARY } from "@/lib/mocks";
import { useOnboarding } from "@/hooks/useOnboarding";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

type ViewMode = "capture" | "verify" | "detail" | "xp-summary" | "history";

export default function MatchPage() {
  const [requestedMode, setRequestedMode] = useState<string | null>(null);
  const [requestedMatchId, setRequestedMatchId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("capture");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showXPSummary, setShowXPSummary] = useState(false);
  const [xpSummaryData, setXpSummaryData] = useState<{ totalXP: number; attributeGains: { attribute: string; xp: number; oldRating: number; newRating: number }[] } | null>(null);
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>("");
  const { isVerified } = useWallet();

  const { activeSquad, activeSquadId, availableOpponents } = useMatchCenterData(isVerified);

  const {
    matches,
    pendingMatches,
    settledMatches,
    railEnabledCount,
    submitMatchResult,
    verifyMatch,
    getMatchById,
    loading,
  } = useMatchVerification(activeSquadId);

  const finalizeMatchXP = trpc.player.finalizeMatchXP.useMutation();
  const utils = trpc.useUtils();
  const pullRef = usePullToRefresh({
    onRefresh: () => utils.squad.getMySquads.invalidate(),
  });

  const { checklistItems } = useOnboarding();
  const matchChecklistDone = checklistItems.find(i => i.id === 'view_match_engine')?.completed ?? false;

  const selectedMatch = selectedMatchId ? getMatchById(selectedMatchId) : null;
  const hasOpponent = Boolean(selectedOpponentId);

  useEffect(() => {
    if (!selectedOpponentId && availableOpponents[0]?.id) {
      setSelectedOpponentId(availableOpponents[0].id);
    }
  }, [availableOpponents, selectedOpponentId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setRequestedMode(params.get("mode"));
    setRequestedMatchId(params.get("matchId"));
    const opponentId = params.get("opponentSquadId");
    if (opponentId) setSelectedOpponentId(opponentId);
  }, []);

  useEffect(() => {
    if (requestedMode === "detail" && requestedMatchId) {
      setSelectedMatchId(requestedMatchId);
      setViewMode("detail");
      return;
    }

    if (requestedMode === "verify" || requestedMode === "capture" || requestedMode === "history") {
      setViewMode(requestedMode);
      return;
    }

    setViewMode(pendingMatches.length > 0 ? "verify" : "capture");
  }, [pendingMatches.length, requestedMatchId, requestedMode]);

  const handleMatchSubmit = async (result: any) => {
    if (!activeSquadId || !selectedOpponentId) {
      return;
    }

    await submitMatchResult({
      homeSquadId: activeSquadId,
      awaySquadId: selectedOpponentId,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      matchDate: result.timestamp,
      latitude: result.evidence?.gps?.lat,
      longitude: result.evidence?.gps?.lng,
    });

    setShowXPSummary(true);
    setViewMode("xp-summary");
  };

  const handleVerify = async (matchId: string, verified: boolean) => {
    await verifyMatch(matchId, verified);
    if (verified) {
      try {
        const result = await finalizeMatchXP.mutateAsync({ matchId });
        if (result?.results?.length) {
          const totalXP = result.results.reduce((sum: number, r: any) => sum + (r.totalXP || 0), 0);
          const attributeGains = result.results.flatMap((r: any) =>
            Object.entries(r.attributeBreakdown || {}).map(([attribute, xpGained]) => ({
              attribute,
              xpGained: xpGained as number,
              newRating: 0,
            }))
          );
          setXpSummaryData({ totalXP, attributeGains: attributeGains.map((g: any) => ({ attribute: g.attribute, xp: g.xpGained, oldRating: 0, newRating: 0 })) });
        }
      } catch {
        // finalizeMatchXP may fail if match not yet fully verified — fall back to mock
      }
      setShowXPSummary(true);
      setViewMode("xp-summary");
    } else {
      setViewMode("verify");
    }
  };

  if (!activeSquadId || !activeSquad) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 text-gray-900 dark:text-gray-100">
        <Card className="py-12 text-center border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Match Center</h1>
          <p className="mx-auto mb-6 max-w-md text-gray-600">
            Join or create a squad before submitting or verifying matches.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/squad">
              <Button>Create or Join Squad</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div ref={pullRef as React.RefObject<HTMLDivElement>} className="mx-auto max-w-6xl space-y-6 px-4 py-6 pb-24 md:pb-6">
      <VerificationBanner />
      <div className="rounded-3xl border border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_45%),linear-gradient(135deg,#f5fffb,#ecfdf5)] p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="section-kicker mb-3 bg-white/80 dark:bg-gray-800/80 text-emerald-700">
              Match Operations
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Match Center</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Submit results, clear pending verifications, and track fee settlement for {activeSquad.name}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/squad">
              <Button variant="outline">Back to Squad</Button>
            </Link>
            <Button onClick={() => setViewMode(pendingMatches.length > 0 ? "verify" : "capture")}>
              {pendingMatches.length > 0 ? "Review Pending Matches" : "Submit a Match"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-yellow-200 bg-yellow-50/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Pending Verification</p>
              <p className="text-3xl font-bold text-gray-900">{pendingMatches.length}</p>
            </div>
            <Clock3 className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700">Settled / Reviewed</p>
              <p className="text-3xl font-bold text-gray-900">{settledMatches.length}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
        </Card>
        <Card className="border-blue-200 bg-blue-50/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Yellow Fee Rail</p>
              <p className="text-3xl font-bold text-gray-900">{railEnabledCount}</p>
            </div>
            <Cpu className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 md:static md:mx-0 md:px-0 md:py-0 md:bg-transparent md:backdrop-blur-none md:border-0">
        <div className="flex flex-wrap gap-2 rounded-2xl bg-gray-100 p-1">
        {[
          { key: "verify", label: `Verify (${pendingMatches.length})`, icon: Shield },
          { key: "capture", label: "Submit Match", icon: Activity },
          { key: "history", label: `History (${settledMatches.length})`, icon: Trophy },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as ViewMode)}
            className={`flex flex-1 items-center justify-center space-x-2 rounded-xl px-4 py-3 min-h-[44px] transition-all ${
              viewMode === key ? "bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
        </div>
      </div>

      {/* First-visit hint — shown until the user has submitted their first match */}
      {matches.length === 0 && !matchChecklistDone && (
        <Card className="border-blue-200 bg-blue-50/70 py-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold text-blue-900">Submit your first match result</p>
              <p className="mt-1 text-sm text-blue-700">
                Use <strong>Submit Match</strong> to log a result. Your opponent will receive a verification request — once both sides confirm, XP and reputation are awarded automatically.
              </p>
            </div>
            <button onClick={() => setViewMode("capture")} className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
              Get started
            </button>
          </div>
        </Card>
      )}

      {viewMode === "capture" && (
        <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-4">
            <Card>
              <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr] md:items-end">
                <div>
                  <div className="section-kicker bg-emerald-50 text-emerald-700">
                    Match Setup
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-gray-900">New Match Submission</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Use your active squad and pick the opponent before you start tracking the match.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Opponent Squad</label>
                  <select
                    value={selectedOpponentId}
                    onChange={(event) => setSelectedOpponentId(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    {availableOpponents.map((squad) => (
                      <option key={squad.id} value={squad.id}>
                        {squad.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {hasOpponent ? (
              <MatchCapture
                homeTeam={activeSquad.name}
                awayTeam={availableOpponents.find((squad) => squad.id === selectedOpponentId)?.name || "Opponent"}
                onSubmit={handleMatchSubmit}
              />
            ) : (
              <Card className="py-10 text-center">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
                <p className="text-gray-600">Add another squad to unlock live match submission.</p>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Match Day Checklist</h3>
                <span className="section-kicker bg-emerald-50 text-emerald-700">Capture</span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Select opponent",
                    status: hasOpponent ? "Opponent locked in" : "Choose a squad to start",
                    icon: Users,
                    done: hasOpponent,
                  },
                  {
                    label: "Track scoreline",
                    status: "Use the live tracker after kick-off",
                    icon: Activity,
                    done: false,
                  },
                  {
                    label: "Submit for verification",
                    status: "Send result to the opposing captain",
                    icon: Shield,
                    done: false,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white/70 px-3 py-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.status}</div>
                      </div>
                      {item.done && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Evidence Pack</h3>
                <span className="section-kicker bg-gray-100 text-gray-500">Optional</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "GPS stamp", detail: "Auto-captured at kickoff", icon: MapPin },
                  { label: "Voice note", detail: "Captain confirmation", icon: Mic },
                  { label: "Photo proof", detail: "Scoreboard or team shot", icon: Camera },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.detail}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ready</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/70">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Verification Flow</h4>
                  <p className="text-sm text-emerald-700 mt-1">
                    Submit the result, the opposing captain confirms, and XP + reputation update automatically.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {viewMode === "verify" && (
        <div className="space-y-4">
          {pendingMatches.length === 0 ? (
            <Card className="py-10 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
              <h2 className="text-lg font-semibold text-gray-900">No pending match reviews</h2>
              <p className="mt-1 text-gray-600">Your verification queue is clear. Submit the next result from here.</p>
            </Card>
          ) : (
            pendingMatches.map((match) => (
              <Card
                key={match.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => {
                  setSelectedMatchId(match.id);
                  setViewMode("detail");
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        PENDING
                      </span>
                      <span className="text-sm text-gray-500">
                        {match.verifications.filter((entry) => entry.verified).length}/{match.requiredVerifications} verified
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{match.homeTeam}</div>
                        <div className="text-2xl font-bold text-emerald-600">{match.homeScore}</div>
                      </div>
                      <div className="font-bold text-gray-400">VS</div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{match.awayTeam}</div>
                        <div className="text-2xl font-bold text-rose-600">{match.awayScore}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {match.paymentRail?.enabled && (
                      <div className="mb-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        Yellow Fee Locked
                      </div>
                    )}
                    Review
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {viewMode === "history" && (
        <div className="space-y-4">
          {settledMatches.length === 0 ? (
            <Card className="py-10 text-center text-gray-600">No settled matches yet.</Card>
          ) : (
            settledMatches.map((match) => (
              <Card key={match.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        match.status === "verified"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {match.status.toUpperCase()}
                      </span>
                      {match.paymentRail?.enabled && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                          {match.paymentRail.assetSymbol} Fee Rail
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {match.homeTeam} {match.homeScore} - {match.awayScore} {match.awayTeam}
                    </h3>
                    <p className="text-sm text-gray-500">{match.timestamp.toLocaleString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMatchId(match.id);
                      setViewMode("detail");
                    }}
                  >
                    Open Details
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {viewMode === "detail" && selectedMatch && (
        <div className="space-y-4">
          <Button onClick={() => setViewMode(selectedMatch.status === "pending" ? "verify" : "history")} variant="outline">
            ← Back
          </Button>

          <MatchConsensusPanel match={selectedMatch} />

          <MatchConfirmation
            match={selectedMatch}
            userAddress="CURRENT_USER_ADDR"
            isCaptain
            userTeam={selectedMatch.submitterTeam === "home" ? "away" : "home"}
            onVerify={(verified) => handleVerify(selectedMatch.id, verified)}
            onDispute={(reason) => {
              console.log("Disputed:", reason);
              handleVerify(selectedMatch.id, false);
            }}
          />
        </div>
      )}

      {viewMode === "detail" && selectedMatchId && !selectedMatch && (
        <Card className="py-10 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Match not available</h2>
          <p className="mt-1 text-gray-600">That match is no longer in your active queue. Return to the current verification list.</p>
          <div className="mt-4">
            <Button onClick={() => setViewMode("verify")} variant="outline">
              Open verification queue
            </Button>
          </div>
        </Card>
      )}

      {viewMode === "xp-summary" && showXPSummary && (
        <div className="space-y-4">
          <Button
            onClick={() => {
              setShowXPSummary(false);
              setViewMode("verify");
            }}
            variant="outline"
          >
            ← Back to Matches
          </Button>

          <XPGainSummary
            totalXP={xpSummaryData?.totalXP ?? MOCK_XP_SUMMARY.totalXP}
            attributeGains={(xpSummaryData?.attributeGains ?? MOCK_XP_SUMMARY.attributeGains) as any}
          />

          <Card className="py-6 text-center">
            <Sparkles className="mx-auto mb-3 h-12 w-12 text-yellow-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">XP Applied</h3>
            <p className="mb-4 text-gray-600">
              Your attributes have been updated from the submitted or verified match.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/reputation">
                <Button variant="outline">View Reputation →</Button>
              </Link>
              <Button
                onClick={() => {
                  setShowXPSummary(false);
                  setViewMode("verify");
                }}
              >
                Back to Matches
              </Button>
            </div>
          </Card>
        </div>
      )}

      {loading && (
        <Card className="border-dashed py-4 text-center text-sm text-gray-500">
          Refreshing match operations...
        </Card>
      )}
    </div>
  );
}
