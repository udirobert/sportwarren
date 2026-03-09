"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MatchCapture } from "@/components/match/MatchCapture";
import { MatchConsensusPanel } from "@/components/match/MatchConsensus";
import { MatchConfirmation } from "@/components/match/MatchConfirmation";
import { XPGainSummary } from "@/components/player/XPGainPopup";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { trpc } from "@/lib/trpc-client";
import { useMatchVerification } from "@/hooks/match/useMatchVerification";
import {
  Trophy,
  Shield,
  Activity,
  Sparkles,
  Cpu,
  AlertCircle,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { MOCK_XP_SUMMARY } from "@/lib/mocks";

type ViewMode = "capture" | "verify" | "detail" | "xp-summary" | "history";

export default function MatchPage() {
  const [requestedMode, setRequestedMode] = useState<string | null>(null);
  const [requestedMatchId, setRequestedMatchId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("capture");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showXPSummary, setShowXPSummary] = useState(false);
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>("");

  const { data: memberships } = trpc.squad.getMySquads.useQuery(undefined, {
    retry: false,
  });
  const activeMembership = memberships?.[0];
  const activeSquad = activeMembership?.squad;
  const activeSquadId = activeSquad?.id;

  const { data: squadPool } = trpc.squad.list.useQuery(
    { limit: 20 },
    { staleTime: 30 * 1000 },
  );

  const {
    matches,
    submitMatchResult,
    verifyMatch,
    getMatchById,
    loading,
  } = useMatchVerification(activeSquadId);

  const selectedMatch = selectedMatchId ? getMatchById(selectedMatchId) : null;
  const availableOpponents = useMemo(
    () => (squadPool?.squads || []).filter((squad) => squad.id !== activeSquadId),
    [activeSquadId, squadPool?.squads],
  );
  const pendingMatches = useMemo(
    () => matches.filter((match) => match.status === "pending"),
    [matches],
  );
  const settledMatches = useMemo(
    () => matches.filter((match) => match.status !== "pending"),
    [matches],
  );
  const railEnabledCount = useMemo(
    () => matches.filter((match) => match.paymentRail?.enabled).length,
    [matches],
  );

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
      setShowXPSummary(true);
      setViewMode("xp-summary");
    } else {
      setViewMode("verify");
    }
  };

  if (!activeSquadId || !activeSquad) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Card className="py-12 text-center">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Match Center</h1>
          <p className="mx-auto mb-6 max-w-md text-gray-600">
            Join or create a squad before submitting or verifying matches.
          </p>
          <Link href="/squad">
            <Button>Open Squad Management</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="rounded-3xl border border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_45%),linear-gradient(135deg,#f5fffb,#ecfdf5)] p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
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

      <div className="flex flex-wrap gap-2 rounded-2xl bg-gray-100 p-1">
        {[
          { key: "verify", label: `Verify (${pendingMatches.length})`, icon: Shield },
          { key: "capture", label: "Submit Match", icon: Activity },
          { key: "history", label: `History (${settledMatches.length})`, icon: Trophy },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as ViewMode)}
            className={`flex flex-1 items-center justify-center space-x-2 rounded-xl px-4 py-3 transition-all ${
              viewMode === key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {viewMode === "capture" && (
        <div className="space-y-4">
          <Card>
            <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr] md:items-end">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">New Match Submission</h2>
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

          {selectedOpponentId ? (
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
            totalXP={MOCK_XP_SUMMARY.totalXP}
            attributeGains={MOCK_XP_SUMMARY.attributeGains}
          />

          <Card className="py-6 text-center">
            <Sparkles className="mx-auto mb-3 h-12 w-12 text-yellow-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">XP Applied</h3>
            <p className="mb-4 text-gray-600">
              Your attributes have been updated from the submitted or verified match.
            </p>
            <Button
              onClick={() => {
                setShowXPSummary(false);
                setViewMode("verify");
              }}
            >
              Continue
            </Button>
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
