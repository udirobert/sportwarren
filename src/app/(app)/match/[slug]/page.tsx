"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { trpc } from "@/lib/trpc-client";
import { useWallet } from "@/contexts/WalletContext";
import { MatchEnginePreview } from "@/components/dashboard/MatchEnginePreview";
import { Trophy, Shield, Share2, Copy, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function PublicMatchPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { isGuest, hasAccount } = useWallet();
    const [copied, setCopied] = useState(false);

    const { data: match, isLoading, error } = trpc.match.getBySlug.useQuery(
        { slug },
        { enabled: !!slug }
    );

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard unavailable
        }
    };

    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title: `${match?.homeSquad?.name ?? 'Home'} vs ${match?.awaySquad?.name ?? 'Away'}`,
                text: "Check out this match on SportWarren",
                url: window.location.href,
            });
        } catch {
            handleCopyLink();
        }
    };

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
                    <p className="text-gray-400 text-sm mb-4">This link may be invalid or the match has been removed.</p>
                    <Link href="/">
                        <Button variant="secondary" size="sm">Go to homepage</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const homeName = match.homeSquad?.name ?? "Home";
    const awayName = match.awaySquad?.name ?? "Away";
    const isVerified = match.status === "verified";
    const isPending = match.status === "pending";
    const isDisputed = match.status === "disputed";

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Header */}
            <div className="bg-black/50 border-b border-white/5 p-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
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
                {/* Score Card */}
                <Card className="bg-gray-900 border-gray-800 p-6">
                    <div className="flex items-center justify-center space-x-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-sm font-bold text-white">{homeName}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-white font-mono">
                                {match.homeScore ?? 0} <span className="text-gray-500">-</span> {match.awayScore ?? 0}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {new Date(match.matchDate).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-sm font-bold text-white">{awayName}</div>
                        </div>
                    </div>

                    {/* Share actions */}
                    <div className="flex items-center justify-center space-x-3 mt-6 pt-4 border-t border-white/5">
                        <Button size="sm" variant="secondary" onClick={handleCopyLink}>
                            {copied ? <CheckCircle2 className="w-3 h-3 mr-1.5 text-green-400" /> : <Copy className="w-3 h-3 mr-1.5" />}
                            {copied ? "Copied" : "Copy link"}
                        </Button>
                        {typeof navigator !== "undefined" && "share" in navigator && (
                            <Button size="sm" variant="secondary" onClick={handleNativeShare}>
                                <Share2 className="w-3 h-3 mr-1.5" />
                                Share
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Match Visualization */}
                <MatchEnginePreview
                    squadId={match.homeSquadId}
                    awaySquadId={match.awaySquadId}
                    playersPerSide={match.playersPerSide ?? 11}
                    hasKeeper={match.hasKeeper ?? true}
                />

                {/* Verification status + CTA */}
                {isPending && (
                    <Card className="bg-gray-900 border-yellow-800/30 p-6 text-center">
                        <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-white mb-1">This match is pending verification</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            {homeName} submitted this result. Share the link with {awayName}&apos;s captain to verify.
                        </p>
                        {!hasAccount || isGuest ? (
                            <Link href="/">
                                <Button size="sm">Sign in to verify this match</Button>
                            </Link>
                        ) : (
                            <Link href={`/match?mode=detail&matchId=${match.id}`}>
                                <Button size="sm">Verify this result</Button>
                            </Link>
                        )}
                    </Card>
                )}

                {/* Verifications list */}
                {match.verifications.length > 0 && (
                    <Card className="bg-gray-900 border-gray-800 p-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Verifications</h4>
                        <div className="space-y-2">
                            {match.verifications.map((v) => (
                                <div key={v.id} className="flex items-center justify-between text-sm">
                                    <span className="text-white">{v.verifier?.name ?? "Anonymous"}</span>
                                    <span className={v.verified ? "text-green-400" : "text-red-400"}>
                                        {v.verified ? "Confirmed" : "Disputed"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
