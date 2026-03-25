"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Shield, UserPlus, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { useWallet } from "@/contexts/WalletContext";
import { useMySquads, useSquadDetails } from "@/hooks/squad/useSquad";

export default function PublicSquadInvitePage() {
  const params = useParams();
  const router = useRouter();
  const squadId = params?.squadId as string;
  const { hasAccount, hasWallet, isGuest, isVerified } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [pendingJoin, setPendingJoin] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinedNow, setJoinedNow] = useState(false);

  const {
    squad,
    members,
    loading,
    error,
    joinSquad,
    isJoining,
  } = useSquadDetails(squadId);
  const { memberships, loading: _membershipsLoading } = useMySquads();

  const existingMembership = useMemo(
    () => memberships.find((membership) => membership.squad.id === squadId),
    [memberships, squadId],
  );
  const captain = useMemo(
    () => members.find((member) => member.role === "captain") ?? null,
    [members],
  );

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

    if (!hasWallet || !isVerified || isGuest || !hasAccount) {
      setPendingJoin(true);
      setShowWalletModal(true);
      return;
    }

    try {
      await joinSquad();
      setJoinedNow(true);
    } catch (joinError) {
      setJoinError(joinError instanceof Error ? joinError.message : "Could not join this squad yet.");
    }
  };

  const statusLabel = existingMembership || joinedNow
    ? "You are in this squad"
    : loading
      ? "Loading squad"
      : "Open squad invite";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">Loading squad invite...</div>
      </div>
    );
  }

  if (error || !squad) {
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
          <Card className="bg-gray-900 border-gray-800 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-300">
                  <UserPlus className="w-3.5 h-3.5" />
                  Squad Invite
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-white">{squad.name}</h1>
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
                <div className="mt-2 text-lg font-bold text-white">{squad.shortName}</div>
                <div className="mt-1 text-sm text-gray-400">{squad.homeGround || "Home ground not set yet"}</div>
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
                  2. Sign in and connect a wallet to unlock protected squad actions.
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  3. Join the squad so tonight&apos;s match can count toward their player progression.
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  4. Claim their name and preferred position so they show up properly in squad tactics and match records.
                </div>
              </div>

              {joinError && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {joinError}
                </div>
              )}

              {(existingMembership || joinedNow) ? (
                <div className="mt-6 space-y-3">
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
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={handleJoin}
                    loading={isJoining || pendingJoin}
                    variant="secondary"
                  >
                    {hasWallet && isVerified ? "Join squad now" : "Connect wallet and join"}
                  </Button>
                  <Link href="/settings?tab=wallet">
                    <Button variant="outline">Review wallet setup</Button>
                  </Link>
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
                  The match should become more than a chat message. Joining the squad links the player to the result, the squad story, and future progression.                </p>
                <p>
                  The protected join flow is wallet-backed because squad actions are authenticated. For tonight, the fastest path is Algorand if the player only cares about profile, XP, and recorded match history.
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
