"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MatchCapture } from "@/components/match/MatchCapture";
import { MatchConsensusPanel } from "@/components/match/MatchConsensus";
import { MatchConfirmation } from "@/components/match/MatchConfirmation";
import { MatchEnginePreview } from "@/components/dashboard/MatchEnginePreview";
import { MatchPreviewView } from "@/components/match/MatchPreviewView";
import { MatchVerifyView } from "@/components/match/MatchVerifyView";
import { MatchHistoryView } from "@/components/match/MatchHistoryView";
import { MatchXPSummaryView } from "@/components/match/MatchXPSummaryView";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { trpc } from "@/lib/trpc-client";
import { useMatchVerification } from "@/hooks/match/useMatchVerification";
import { useEvidenceCapture } from "@/hooks/match/useEvidenceCapture";
import { useMatchCenterData } from "@/hooks/match/useMatchCenterData";
import { useWallet } from "@/contexts/WalletContext";
import { JourneyGateCard } from "@/components/common/JourneyGateCard";
import { PageShell } from "@/components/common/PageShell";
import { ChainLabel } from "@/components/common/ChainLabel";
import { TelegramContextualTip } from "@/components/common/TelegramContextualTip";
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
import { getJourneyActionGate } from "@/lib/journey/action-gates";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useJourneyState } from "@/hooks/useJourneyState";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { trackCoreGrowthEvent, trackFeatureUsed, trackMatchSubmission } from "@/lib/analytics";
import { useCurrentPlayerAttributes } from "@/hooks/player/usePlayerAttributes";
import { buildTacticalPlanQuery, parseTacticalPlanSearchParams, type ImportedTacticalPlan } from "@/lib/pitch/tacticalPlan";
import { PLAY_STYLE_LABELS } from "@/lib/formations";
import { useToast } from "@/contexts/ToastContext";

type ViewMode = "preview" | "capture" | "verify" | "detail" | "xp-summary" | "history";
type XPResultState = "idle" | "pending" | "available";

export default function MatchPage() {
  const [requestedMode, setRequestedMode] = useState<string | null>(null);
  const [requestedMatchId, setRequestedMatchId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showXPSummary, setShowXPSummary] = useState(false);
  const [xpSummaryData, setXpSummaryData] = useState<{ totalXP: number; attributeGains: { attribute: string; xp: number; oldRating: number; newRating: number }[] } | null>(null);
  const [xpResultState, setXpResultState] = useState<XPResultState>("idle");
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>("");
  const [lastSubmittedMatchId, setLastSubmittedMatchId] = useState<string | null>(null);
  const [inviteShareState, setInviteShareState] = useState<"idle" | "copied" | "shared" | "error">("idle");
  const [importedPlan, setImportedPlan] = useState<ImportedTacticalPlan | null>(null);
  const { chain, hasAccount, hasWallet, isVerified } = useWallet();
  const { journeyStage, memberships } = useJourneyState();
  const { attributes: currentPlayerAttributes } = useCurrentPlayerAttributes(isVerified);
  const { addToast } = useToast();
  const activeMembership = memberships[0];
  const activeSquad = activeMembership?.squad;
  const activeSquadId = activeSquad?.id;
  const isSquadLeader = activeMembership?.role === "captain" || activeMembership?.role === "vice_captain";
  const matchCenterGate = getJourneyActionGate('match_center', {
    stage: journeyStage,
    hasAccount,
    hasWallet,
    isVerified,
    hasSquad: Boolean(activeSquadId),
    chain,
  });

  const { availableOpponents } = useMatchCenterData(activeSquadId);

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
  const evidenceCapture = useEvidenceCapture();
  const [gpsCaptured, setGpsCaptured] = useState(false);

  const handleGpsCapture = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setGpsCaptured(true),
      () => setGpsCaptured(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleVoiceToggle = () => {
    if (evidenceCapture.state.isRecording) {
      void evidenceCapture.stopRecording();
    } else {
      void evidenceCapture.startRecording();
    }
  };

  const handlePhotoCapture = () => {
    void evidenceCapture.capturePhoto();
  };

  const finalizeMatchXP = trpc.player.finalizeMatchXP.useMutation();
  const utils = trpc.useUtils();
  const pullRef = usePullToRefresh({
    onRefresh: () => utils.squad.getMySquads.invalidate(),
  });

  const { checklistItems, completeChecklistItem } = useOnboarding();
  const firstMatchSubmitted = checklistItems.find((item) => item.id === "log_match")?.completed ?? false;
  const verificationInviteShared = checklistItems.find((item) => item.id === "join_squad")?.completed ?? false;
  const identityConnected = checklistItems.find((item) => item.id === "claim_identity")?.completed ?? false;
  const inviteTargetMatchId = lastSubmittedMatchId ?? pendingMatches[0]?.id ?? null;
  const currentPlayerId = currentPlayerAttributes?.address ?? "";

  const selectedMatch = selectedMatchId ? getMatchById(selectedMatchId) : null;
  const selectedMatchUserTeam = selectedMatch
    ? activeSquad?.name === selectedMatch.homeTeam
      ? "home"
      : activeSquad?.name === selectedMatch.awayTeam
        ? "away"
        : null
    : null;
  const hasOpponent = Boolean(selectedOpponentId);
  const importedPlanQuery = useMemo(
    () => importedPlan ? buildTacticalPlanQuery(importedPlan) : "",
    [importedPlan],
  );
  const tacticsHref = importedPlanQuery ? `/squad?tab=tactics&${importedPlanQuery}` : "/squad?tab=tactics";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setRequestedMode(params.get("mode"));
    setRequestedMatchId(params.get("matchId"));
    const opponentId = params.get("opponentSquadId");
    if (opponentId) setSelectedOpponentId(opponentId);
    const plan = parseTacticalPlanSearchParams(params);
    if (plan) {
      setImportedPlan(plan);
      trackFeatureUsed("match_capture_plan_imported", {
        source: "playground",
        formation: plan.formation,
        style: plan.style,
        size: plan.size,
      });
    }
  }, []);

  useEffect(() => {
    if (requestedMode === "detail" && requestedMatchId) {
      setSelectedMatchId(requestedMatchId);
      setViewMode("detail");
      return;
    }

    if (requestedMode === "verify" || requestedMode === "capture" || requestedMode === "history" || requestedMode === "preview") {
      setViewMode(requestedMode as ViewMode);
      return;
    }

    // First session after onboarding: open capture directly so the
    // user doesn't have to navigate from "Launch Your Season" to the
    // match center manually. The flag is session-scoped, set by
    // OnboardingFlow on personalization complete.
    if (typeof window !== "undefined" && matches.length === 0) {
      const firstSession = sessionStorage.getItem("sw_first_match_session") === "1";
      if (firstSession) {
        sessionStorage.removeItem("sw_first_match_session");
        setViewMode("capture");
        return;
      }
    }

    setViewMode(pendingMatches.length > 0 ? "verify" : settledMatches.length > 0 ? "history" : "preview");
  }, [pendingMatches.length, settledMatches.length, requestedMatchId, requestedMode, matches.length]);

  useEffect(() => {
    if (!selectedOpponentId && availableOpponents[0]?.id) {
      setSelectedOpponentId(availableOpponents[0].id);
    }
  }, [availableOpponents, selectedOpponentId]);

  const openVerificationQueue = () => {
    setViewMode("verify");
    trackCoreGrowthEvent("verification_queue_reviewed", {
      source: "match_center",
      pending_count: pendingMatches.length,
    });
  };

  const buildShareUrl = (shareSlug: string) => {
    const relative = `/match/${encodeURIComponent(shareSlug)}`;
    if (typeof window === "undefined") {
      return relative;
    }
    return `${window.location.origin}${relative}`;
  };

  const buildVerificationInviteUrl = buildShareUrl;

  const handleShareVerificationInvite = async () => {
    if (!inviteTargetMatchId) {
      openVerificationQueue();
      return;
    }

    const inviteUrl = buildVerificationInviteUrl(inviteTargetMatchId);
    try {
      let shareMethod: "clipboard" | "web_share" = "clipboard";
      if (navigator.share && window.matchMedia("(max-width: 1024px)").matches) {
        await navigator.share({
          title: "Verify our SportWarren match",
          text: "Please verify this match result.",
          url: inviteUrl,
        });
        shareMethod = "web_share";
        setInviteShareState("shared");
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        setInviteShareState("copied");
      }

      completeChecklistItem("join_squad");
      trackFeatureUsed("verification_invite_shared", {
        match_id: inviteTargetMatchId,
        share_method: shareMethod,
      });
      trackCoreGrowthEvent("opponent_verification_invite_shared", {
        match_id: inviteTargetMatchId,
        share_method: shareMethod,
        source: "match_kickoff_card",
      });
    } catch {
      setInviteShareState("error");
    }
  };

  const handleMatchSubmit = async (result: any) => {
    if (!activeSquadId || !selectedOpponentId) {
      return;
    }

    const { id: submittedMatchId, shareSlug } = await submitMatchResult({
      homeSquadId: activeSquadId,
      awaySquadId: selectedOpponentId,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      matchDate: result.timestamp,
      latitude: result.evidence?.gps?.lat,
      longitude: result.evidence?.gps?.lng,
    });

    // Surface the Yellow fee rail that was locked during submit. The fee
    // is reserved (escrow) and will be split on verification per
    // getMatchFeeDistribution (winner takes pool minus 20% platform fee).
    const feeAmount = Number(process.env.NEXT_PUBLIC_YELLOW_MATCH_FEE_AMOUNT || 1);
    addToast({
      tone: "info",
      title: "Fee session locked",
      message: `${feeAmount.toFixed(2)} USDC reserved. Settles on opponent verification.`,
    });

    const opponentName = availableOpponents.find((squad) => squad.id === selectedOpponentId)?.name || "unknown";
    setLastSubmittedMatchId(submittedMatchId);
    setInviteShareState("idle");
    completeChecklistItem("log_match");
    trackMatchSubmission(submittedMatchId, "capture");
    trackFeatureUsed("first_match_submitted", {
      match_id: submittedMatchId,
      opponent: opponentName,
      imported_plan: Boolean(importedPlan),
      formation: importedPlan?.formation ?? null,
      style: importedPlan?.style ?? null,
      size: importedPlan?.size ?? null,
    });
    trackCoreGrowthEvent("first_match_submitted", {
      match_id: submittedMatchId,
      opponent: opponentName,
      source: "match_capture",
      imported_plan: Boolean(importedPlan),
      formation: importedPlan?.formation ?? null,
      style: importedPlan?.style ?? null,
      size: importedPlan?.size ?? null,
    });

    // Auto-copy share link
    const shareUrl = buildShareUrl(shareSlug);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setInviteShareState("copied");
    } catch {
      // clipboard unavailable
    }

    setXpSummaryData(null);
    setXpResultState("idle");
    setShowXPSummary(false);
    
    // Haptic feedback
    import("@/lib/utils").then(({ triggerHaptic }) => triggerHaptic("success"));
    
    openVerificationQueue();
  };

  const handleVerify = async (matchId: string, verified: boolean) => {
    // Haptic feedback for interaction
    import("@/lib/utils").then(({ triggerHaptic }) => triggerHaptic("medium"));

    await verifyMatch(matchId, verified);
    if (verified) {
      let nextSummary: { totalXP: number; attributeGains: { attribute: string; xp: number; oldRating: number; newRating: number }[] } | null = null;
      try {
        const result = await finalizeMatchXP.mutateAsync({ matchId });
        
        // Haptic for successful verification result
        import("@/lib/utils").then(({ triggerHaptic }) => triggerHaptic("success"));

        type FinalizedXPResult = {
          totalXP?: number | null;
          attributeBreakdown?: Record<string, number> | null;
        };
        const finalizedResults = (result?.results ?? []) as FinalizedXPResult[];
        if (finalizedResults.length) {
          const totalXP = finalizedResults.reduce((sum, item) => sum + (item.totalXP || 0), 0);
          const attributeGains = finalizedResults.flatMap((item) =>
            Object.entries(item.attributeBreakdown || {}).map(([attribute, xpGained]) => ({
              attribute,
              xpGained: xpGained as number,
              newRating: 0,
            }))
          );
          nextSummary = {
            totalXP,
            attributeGains: attributeGains.map((g: any) => ({
              attribute: g.attribute,
              xp: g.xpGained,
              oldRating: 0,
              newRating: 0,
            })),
          };
        }
      } catch {
        nextSummary = null;
      }
      setXpSummaryData(nextSummary);
      setXpResultState(nextSummary ? "available" : "pending");
      completeChecklistItem("log_match");
      setShowXPSummary(true);
      setViewMode("xp-summary");
    } else {
      setXpSummaryData(null);
      setXpResultState("idle");
      setShowXPSummary(false);
      openVerificationQueue();
    }
  };

  if (matchCenterGate.status === "blocked") {
    return (
      <PageShell maxWidth="4xl" className="space-y-4">
        {importedPlan && (
          <Card className="border-emerald-200 bg-emerald-50/80 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-emerald-900">Your match plan is ready</p>
                <p className="mt-1 text-sm text-emerald-700">
                  Start your season, then save {importedPlan.size}v{importedPlan.size} · {importedPlan.formation} · {PLAY_STYLE_LABELS[importedPlan.style]?.name ?? importedPlan.style} as your first setup.
                </p>
              </div>
              <Link
                href={tacticsHref}
                className="inline-flex min-h-[40px] items-center justify-center rounded-lg border-2 border-gray-300 bg-transparent px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-green-500 hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Review setup
              </Link>
            </div>
          </Card>
        )}
        <JourneyGateCard
          icon={Trophy}
          eyebrow={matchCenterGate.eyebrow}
          title={matchCenterGate.title}
          description={matchCenterGate.description}
          primaryAction={matchCenterGate.primaryAction}
          secondaryAction={matchCenterGate.secondaryAction}
        />
      </PageShell>
    );
  }

  return (
    <PageShell ref={pullRef as React.RefObject<HTMLDivElement>} className="space-y-6">
      <div className="rounded-3xl border border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_45%),linear-gradient(135deg,#f5fffb,#ecfdf5)] p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="section-kicker mb-3 bg-white/80 dark:bg-gray-800/80 text-emerald-700">
              Match Day
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Match Preview</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Review tactics, scouting reports, and upcoming fixtures before you hit the pitch.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={tacticsHref}>
              <Button>Customize Lineup</Button>
            </Link>
            <Link href="/match/preview/next">
              <Button variant="outline">Tactical Preview</Button>
            </Link>
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
              <p className="text-sm text-blue-700"><ChainLabel chain="yellow" /> Fee Rail</p>
              <p className="text-3xl font-bold text-gray-900">{railEnabledCount}</p>
            </div>
            <Cpu className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      <div className="sticky top-14 md:top-0 z-10 -mx-4 px-4 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 md:static md:mx-0 md:px-0 md:py-0 md:bg-transparent md:backdrop-blur-none md:border-0">
        <div className="flex flex-wrap gap-2 rounded-2xl bg-gray-100 p-1">
        {[
          { key: "preview", label: "Match Preview", icon: Cpu },
          { key: "verify", label: `Review (${pendingMatches.length})`, icon: Shield },
          { key: "history", label: `History (${settledMatches.length})`, icon: Trophy },
          { key: "capture", label: "Submit Result", icon: Activity },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              if (key === "verify") {
                openVerificationQueue();
              } else {
                setViewMode(key as ViewMode);
              }
            }}
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

      {/* Season kickoff path: submit -> share -> save */}
      {!(firstMatchSubmitted && verificationInviteShared && identityConnected) && (
        <Card className="border-emerald-200 bg-emerald-50/80 py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-900">Season Kickoff Path</p>
              <p className="mt-1 text-sm text-emerald-700">
                Your provisional stats are waiting — log your first match and verify it with the opposing team to make them real.
              </p>
              <div className="mt-3 space-y-2">
                {[
                  {
                    label: "Complete your player card",
                    done: checklistItems.find((i) => i.id === "complete_card")?.completed ?? false,
                  },
                  {
                    label: "Set your formation",
                    done: checklistItems.find((i) => i.id === "set_formation")?.completed ?? false,
                  },
                  { label: "Log your first match result", done: firstMatchSubmitted },
                  { label: "Verify with opponent", done: verificationInviteShared },
                ].map((step) => (
                  <div key={step.label} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`h-4 w-4 ${step.done ? "text-emerald-600" : "text-gray-300"}`} />
                    <span className={step.done ? "text-emerald-800" : "text-gray-700"}>{step.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={tacticsHref}>
                  <Button size="sm">Set your formation</Button>
                </Link>
                {!firstMatchSubmitted && (
                  <Button size="sm" onClick={() => setViewMode("capture")}>Log first match</Button>
                )}
                {firstMatchSubmitted && !verificationInviteShared && (
                  <Button size="sm" onClick={handleShareVerificationInvite}>
                    {inviteShareState === "shared" ? "Invite Shared" : inviteShareState === "copied" ? "Invite Copied" : "Copy match link"}
                  </Button>
                )}
                {firstMatchSubmitted && verificationInviteShared && !identityConnected && (
                  <Link href="/settings?tab=wallet">
                    <Button size="sm" variant="outline">Save progress</Button>
                  </Link>
                )}
              </div>
              {inviteShareState === "error" && (
                <p className="mt-2 text-xs text-rose-600">
                  Couldn&apos;t copy the invite link on this device. Open the verification queue and share the match from there.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* First-visit hint — shown until the user has submitted their first match */}
      {matches.length === 0 && !firstMatchSubmitted && (
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

      {importedPlan && (
        <Card className="border-emerald-200 bg-emerald-50/80 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-emerald-900">Match plan loaded from playground</p>
              <p className="mt-1 text-sm text-emerald-700">
                {importedPlan.size}v{importedPlan.size} · {importedPlan.formation} · {PLAY_STYLE_LABELS[importedPlan.style]?.name ?? importedPlan.style} will be attached to this session&apos;s analytics.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={tacticsHref}>
                <Button size="sm" variant="outline">Adjust tactics</Button>
              </Link>
              <Button
                size="sm"
                onClick={() => setViewMode("capture")}
              >
                Submit result
              </Button>
            </div>
          </div>
        </Card>
      )}

      {viewMode === "preview" && (
        <MatchPreviewView squadId={activeSquadId} />
      )}

      {viewMode === "capture" && (
        <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-4">
            <TelegramContextualTip context="match-log" />
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
                  {importedPlan && (
                    <div className="mt-3 inline-flex flex-wrap items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <span>{importedPlan.size}v{importedPlan.size}</span>
                      <span>·</span>
                      <span>{importedPlan.formation}</span>
                      <span>·</span>
                      <span>{PLAY_STYLE_LABELS[importedPlan.style]?.name ?? importedPlan.style}</span>
                    </div>
                  )}
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
              <JourneyGateCard
                icon={Users}
                eyebrow="Opponent Needed"
                title="Add another squad before submitting a live match"
                description="The match center needs a second squad in the network so the result can be challenged, verified, and carried into the community surfaces."
                primaryAction={{ label: "Browse community squads", href: "/community" }}
                secondaryAction={{ label: "Back to squad console", href: "/squad" }}
                className="py-10"
              />
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
                <button
                  type="button"
                  onClick={handleGpsCapture}
                  className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${gpsCaptured ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">GPS stamp</div>
                      <div className="text-xs text-gray-500">{gpsCaptured ? 'Location captured' : 'Tap to capture location'}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${gpsCaptured ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {gpsCaptured ? 'Captured' : 'Capture'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors ${
                    evidenceCapture.state.isRecording
                      ? 'border-red-300 bg-red-50/40'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      evidenceCapture.state.isRecording ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Mic className={`w-4 h-4 ${evidenceCapture.state.isRecording ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Voice note</div>
                      <div className="text-xs text-gray-500">
                        {evidenceCapture.state.isRecording
                          ? 'Recording — tap to stop'
                          : evidenceCapture.state.capturedAudio.length > 0
                            ? `${evidenceCapture.state.capturedAudio.length} captured`
                            : 'Captain confirmation'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    evidenceCapture.state.isRecording ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {evidenceCapture.state.isRecording ? 'Stop' : 'Record'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handlePhotoCapture}
                  className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      evidenceCapture.state.capturedPhotos.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Photo proof</div>
                      <div className="text-xs text-gray-500">
                        {evidenceCapture.state.capturedPhotos.length > 0
                          ? `${evidenceCapture.state.capturedPhotos.length} photo${evidenceCapture.state.capturedPhotos.length === 1 ? '' : 's'} captured`
                          : 'Scoreboard or team shot'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    evidenceCapture.state.capturedPhotos.length > 0 ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {evidenceCapture.state.capturedPhotos.length > 0 ? 'Captured' : 'Capture'}
                  </span>
                </button>
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
        <MatchVerifyView
          pendingMatches={pendingMatches}
          onSelectMatch={(id) => {
            setSelectedMatchId(id);
            setViewMode("detail");
          }}
        />
      )}

      {viewMode === "history" && (
        <MatchHistoryView
          settledMatches={settledMatches}
          onSelectMatch={(id) => {
            setSelectedMatchId(id);
            setViewMode("detail");
          }}
        />
      )}

      {viewMode === "detail" && selectedMatch && (
        <div className="space-y-4">
          <Button
            onClick={() => (selectedMatch.status === "pending" ? openVerificationQueue() : setViewMode("history"))}
            variant="outline"
          >
            ← Back
          </Button>

          <MatchConsensusPanel match={selectedMatch} />

          <MatchConfirmation
            match={selectedMatch}
            userAddress={currentPlayerId}
            isCaptain={isSquadLeader}
            userTeam={selectedMatchUserTeam}
            onVerify={(verified) => handleVerify(selectedMatch.id, verified)}
            onDispute={(reason) => {
              console.log("Disputed:", reason);
              handleVerify(selectedMatch.id, false);
            }}
            showPreview={true}
          />

          <MatchEnginePreview squadId={activeSquadId || undefined} />
        </div>
      )}

      {viewMode === "detail" && selectedMatchId && !selectedMatch && (
        <Card className="py-10 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Match not available</h2>
          <p className="mt-1 text-gray-600">That match is no longer in your active queue. Return to the current verification list.</p>
          <div className="mt-4">
            <Button onClick={openVerificationQueue} variant="outline">
              Open verification queue
            </Button>
          </div>
        </Card>
      )}

      {viewMode === "xp-summary" && showXPSummary && (
        <MatchXPSummaryView
          xpResultState={xpResultState}
          xpSummaryData={xpSummaryData}
          onBack={() => {
            setShowXPSummary(false);
            setXpResultState("idle");
            openVerificationQueue();
          }}
        />
      )}

      {loading && (
        <Card className="border-dashed py-4 text-center text-sm text-gray-500">
          Refreshing match operations...
        </Card>
      )}
    </PageShell>
  );
}
