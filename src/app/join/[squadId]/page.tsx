"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Shield, UserPlus, Users, Wallet, Target, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { useWallet } from "@/contexts/WalletContext";
import { useMySquads, useSquadDetails } from "@/hooks/squad/useSquad";
import { trpc } from "@/lib/trpc-client";
import { usePrivy } from "@privy-io/react-auth";

export default function PublicSquadInvitePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const squadId = params?.squadId as string;
  const playerName = searchParams.get('player') || '';
  const isImportClaim = playerName.trim().length > 0;

  const { address, hasAccount, hasWallet, isGuest, isVerified } = useWallet();
  const { authenticated, login } = usePrivy();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [pendingJoin, setPendingJoin] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinedNow, setJoinedNow] = useState(false);
  const [joinedPending, setJoinedPending] = useState(false);

  // Import claim state
  const [pendingPlayer, setPendingPlayer] = useState<{ name: string; position: string | null; isPlaceholder: boolean } | null>(null);
  const [pendingPlayerLoading, setPendingPlayerLoading] = useState(false);
  const [pendingPlayerError, setPendingPlayerError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const {
    squad,
    members,
    loading,
    error,
    joinSquad,
    isJoining,
  } = useSquadDetails(isImportClaim ? undefined : squadId);
  const { memberships, loading: _membershipsLoading } = useMySquads();

  const joinPendingMutation = trpc.squad.joinPending.useMutation({
    onSuccess: () => {
      setJoinedPending(true);
      setJoinedNow(true);
    },
    onError: (err) => {
      setJoinError(err.message);
    },
  });

  const existingMembership = useMemo(
    () => memberships.find((membership) => membership.squad.id === squadId),
    [memberships, squadId],
  );
  const isPendingMember = existingMembership?.status === 'pending';
  const captain = useMemo(
    () => members.find((member) => member.role === "captain") ?? null,
    [members],
  );

  // Import claim: fetch pending player + squad info in one call
  const [claimSquadInfo, setClaimSquadInfo] = useState<{ name: string; shortName: string } | null>(null);
  useEffect(() => {
    if (!isImportClaim || !squadId || !playerName) return;

    let cancelled = false;
    setPendingPlayerLoading(true);
    setPendingPlayerError(null);

    const url = `/api/import/claim/${squadId}?player=${encodeURIComponent(playerName)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.squad) setClaimSquadInfo(data.squad);
        if (data.error) {
          setPendingPlayerError(data.error);
          setPendingPlayer(null);
        } else {
          setPendingPlayer(data.pendingPlayer);
          if (!data.pendingPlayer) {
            setPendingPlayerError(data.message || 'No pending invite found for this player.');
          }
        }
      })
      .catch(() => {
        if (cancelled) return;
        setPendingPlayerError('Failed to look up invite. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setPendingPlayerLoading(false);
      });

    return () => { cancelled = true; };
  }, [isImportClaim, squadId, playerName]);

  const handleClaim = async () => {
    if (!address || !squadId || !playerName) {
      setClaimError('Please sign in to claim your spot.');
      return;
    }

    setIsClaiming(true);
    setClaimError(null);

    try {
      const res = await fetch(`/api/import/claim/${squadId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          claimingWalletAddress: address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim spot');
      }

      setClaimSuccess(true);
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Failed to claim spot');
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    if (!pendingJoin || !isVerified || existingMembership || isJoining) {
      return;
    }

    let cancelled = false;

    const completeJoin = async () => {
      try {
        setJoinError(null);
        await joinSquad();
        if (cancelled) return;
        setJoinedNow(true);
        setPendingJoin(false);
      } catch (joinError) {
        if (cancelled) return;
        setJoinError(joinError instanceof Error ? joinError.message : "Could not join this squad yet.");
        setPendingJoin(false);
      }
    };

    completeJoin();

    return () => {
      cancelled = true;
    };
  }, [existingMembership, isJoining, isVerified, joinSquad, pendingJoin]);

  const handleJoin = async () => {
    setJoinError(null);

    // Not authenticated at all — trigger Privy login (email or social)
    if (!authenticated && !hasAccount) {
      login();
      return;
    }

    // Has account but no wallet — join as pending member
    if (hasAccount && !hasWallet) {
      joinPendingMutation.mutate({ squadId });
      return;
    }

    // Has wallet but not verified — show wallet modal
    if (!isVerified || isGuest) {
      setPendingJoin(true);
      setShowWalletModal(true);
      return;
    }

    // Fully verified — join as active member
    try {
      await joinSquad();
      setJoinedNow(true);
    } catch (joinError) {
      setJoinError(joinError instanceof Error ? joinError.message : "Could not join this squad yet.");
    }
  };

  const statusLabel = existingMembership || joinedNow
    ? isPendingMember || joinedPending
      ? "Joined (pending wallet)"
      : "You are in this squad"
    : loading
      ? "Loading squad"
      : "Open squad invite";

  // For import claims, the claim flow handles loading/error states independently.
  if (!isImportClaim && loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">Loading squad invite...</div>
      </div>
    );
  }

  if (!isImportClaim && (error || !squad)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-900 border-gray-800 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-white mb-2">Squad not found</h1>
          <p className="text-sm text-gray-400 mb-5">
            This invite link is invalid, or the squad no longer exists.
          </p>
          <Link href="/">
            <Button variant="secondary" size="sm">Go to homepage</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isLoading = isJoining || pendingJoin || joinPendingMutation.isPending;

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="bg-black/50 border-b border-white/5 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">SportWarren</span>
            </Link>
            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-300">
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          {isImportClaim ? (
            <>
              {/* ── Import claim flow ── */}
              {pendingPlayerLoading ? (
                <Card className="bg-gray-900 border-gray-800 p-8 text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 w-32 bg-white/10 rounded mx-auto" />
                    <div className="h-6 w-48 bg-white/10 rounded mx-auto" />
                    <div className="h-20 w-full bg-white/5 rounded" />
                  </div>
                </Card>
              ) : pendingPlayerError ? (
                <Card className="bg-gray-900 border-gray-800 p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                  <h1 className="text-xl font-bold text-white mb-2">Invite not found</h1>
                  <p className="text-sm text-gray-400 mb-6">{pendingPlayerError}</p>
                  <div className="flex flex-col items-center gap-2">
                    <Link href="/">
                      <Button variant="secondary" size="sm">Go to homepage</Button>
                    </Link>
                    <p className="text-xs text-gray-600 mt-2">
                      If you think this is a mistake, ask your captain to send a new invite link.
                    </p>
                  </div>
                </Card>
              ) : claimSuccess ? (
                <Card className="bg-gray-900 border-gray-800 p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h1 className="text-2xl font-black text-white mb-2">Spot claimed!</h1>
                  <p className="text-sm text-gray-300 mb-6">
                    You&apos;ve claimed <span className="font-bold text-white">{playerName}</span>&apos;s spot in <span className="font-bold text-white">{claimSquadInfo?.name || 'the squad'}</span>.
                    Your gameplay history and stats are now linked to your account.
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <Button
                      onClick={() => router.push('/dashboard')}
                      variant="secondary"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                    <Button
                      onClick={() => router.push(`/dashboard/squads/${squadId}`)}
                      variant="outline"
                    >
                      Open Squad
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  <Card className="bg-gray-900 border-gray-800 p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                          <Target className="w-3.5 h-3.5" />
                          Your spot is waiting
                        </div>
                        <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
                          {claimSquadInfo?.name || 'Loading...'}
                        </h1>
                        <p className="mt-2 text-sm text-gray-300">
                          Your captain already added you to the roster. Claim your spot to link your
                          gameplay history, stats, and progression to this squad.
                        </p>
                      </div>
                      {pendingPlayer && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 text-center">
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Your name on the roster</div>
                          <div className="mt-1 text-xl font-black text-white">{pendingPlayer.name}</div>
                          {pendingPlayer.position && (
                            <div className="mt-1 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold text-gray-300 inline-block">
                              {pendingPlayer.position}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Squad</div>
                        <div className="mt-2 text-lg font-bold text-white">{claimSquadInfo?.shortName || '—'}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Role</div>
                        <div className="mt-2 text-lg font-bold text-white">{pendingPlayer?.position || 'Player'}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Status</div>
                        <div className="mt-2 text-lg font-bold text-amber-400">Ready to claim</div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800 p-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Claim your spot
                    </h2>
                    <p className="mt-2 text-sm text-gray-300">
                      Your captain added you during import. Click below to link your account to your
                      roster spot. Your imported stats (goals, assists, matches) will be attached
                      to your profile.
                    </p>

                    {claimError && (
                      <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {claimError}
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      {!address || isGuest ? (
                        <div className="flex-1 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-200 text-center">
                          <Button
                            onClick={() => {
                              if (!authenticated && !hasAccount) {
                                login();
                              } else {
                                setShowWalletModal(true);
                              }
                            }}
                            variant="secondary"
                            className="w-full"
                          >
                            Sign in to claim your spot
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleClaim}
                          loading={isClaiming}
                          variant="secondary"
                          className="flex-1"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          {isClaiming ? 'Claiming...' : 'Claim my spot'}
                        </Button>
                      )}
                    </div>
                  </Card>
                </>
              )}
            </>
          ) : (
            <>
              {/* ── Normal squad invite flow ── */}
              <Card className="bg-gray-900 border-gray-800 p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-300">
                      <UserPlus className="w-3.5 h-3.5" />
                      Squad Invite
                    </div>
                    <h1 className="mt-4 text-3xl font-black tracking-tight text-white">{squad!.name}</h1>
                    <p className="mt-2 text-sm text-gray-300">
                      Join this squad before tonight&apos;s match so the result can attach to your player record and start counting toward your progression.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Captain</div>
                    <div className="mt-1 font-semibold text-white">{captain?.name ?? "Captain not set"}</div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Squad</div>
                    <div className="mt-2 text-lg font-bold text-white">{squad!.shortName}</div>
                    <div className="mt-1 text-sm text-gray-400">{squad!.homeGround || "Home ground not set yet"}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Players</div>
                    <div className="mt-2 text-lg font-bold text-white">{members.length}</div>
                    <div className="mt-1 text-sm text-gray-400">Current registered members</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">What unlocks</div>
                    <div className="mt-2 text-lg font-bold text-white">XP + match history</div>
                    <div className="mt-1 text-sm text-gray-400">Tonight&apos;s result starts building your record</div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <Card className="bg-gray-900 border-gray-800 p-6">
                  <h2 className="text-lg font-bold text-white">What the player needs to do</h2>
                  <div className="mt-4 space-y-3 text-sm text-gray-300">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      1. Open this invite link.
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      2. Sign in with email or wallet to join the squad.
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      3. Join the squad so tonight&apos;s match can count toward their player progression.
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      4. Connect a wallet later to unlock full features like tactics and match verification.
                    </div>
                  </div>

                  {joinError && (
                    <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {joinError}
                    </div>
                  )}

                  {(existingMembership || joinedNow) ? (
                    <div className="mt-6 space-y-3">
                      {(isPendingMember || joinedPending) ? (
                        <>
                          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                            <CheckCircle2 className="w-4 h-4" />
                            You&apos;re on the roster! Connect a wallet to unlock full features.
                          </div>
                          <p className="text-sm text-gray-300">
                            Tactics, transfers, match verification, and XP tracking all require a connected wallet. You can do this anytime from settings.
                          </p>
                          <div className="flex gap-3">
                            <Link href="/settings?tab=wallet">
                              <Button variant="secondary">
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet
                              </Button>
                            </Link>
                            <Button onClick={() => router.push("/squad")} variant="outline">
                              Open squad
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                            <CheckCircle2 className="w-4 h-4" />
                            You are ready for tonight&apos;s match flow.
                          </div>
                          <p className="text-sm text-gray-300">
                            One more useful step: claim your name and preferred position before the lineup is set.
                          </p>
                          <div className="flex gap-3">
                            <Button onClick={() => router.push("/settings?tab=profile")} variant="secondary">
                              Claim profile
                            </Button>
                            <Button onClick={() => router.push("/squad")} variant="secondary">
                              Open squad
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={handleJoin}
                        loading={isLoading}
                        variant="secondary"
                      >
                        {hasWallet && isVerified
                          ? "Join squad now"
                          : hasAccount
                            ? "Join squad"
                            : "Sign in and join"}
                      </Button>
                      {hasWallet && (
                        <Link href="/settings?tab=wallet">
                          <Button variant="outline">Review wallet setup</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </Card>

                <Card className="bg-gray-900 border-gray-800 p-6">
                  <div className="flex items-center gap-2 text-white">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-bold">Why this matters tonight</h2>
                  </div>
                  <div className="mt-4 space-y-4 text-sm text-gray-300">
                    <p>
                      The match should become more than a chat message. Joining the squad links the player to the result, the squad story, and future progression.
                    </p>
                    <p>
                      You can join with just an email — connect a wallet later when you want your stats to count on the leaderboard. The fastest path for tonight is to sign in and join now.
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-white">
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="font-semibold">Best send order</span>
                      </div>
                      <p className="mt-2">
                        Share this squad invite with teammates before kickoff. After full time, send the generated match verification link to the opposing captain.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnected={() => setPendingJoin(true)}
        forceWalletSetup
      />
    </>
  );
}
