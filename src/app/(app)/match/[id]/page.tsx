"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { trpc } from "@/lib/trpc-client";
import { useWallet } from "@/contexts/WalletContext";
import { MatchEnginePreview } from "@/components/dashboard/MatchEnginePreview";
import { Trophy, Shield, Share2, Copy, CheckCircle2, AlertCircle, ArrowLeft, MessageCircle, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buildTelegramShareUrl } from "@/lib/telegram/deep-links";

export default function PublicMatchPage() {
    const params = useParams();
    const id = params?.id as string;
    const { isGuest, hasAccount } = useWallet();
    const [copied, setCopied] = useState(false);
    const [revealResults, setRevealResults] = useState(false);

    const { data: match, isLoading, error } = trpc.match.getById.useQuery(
        { id },
        { enabled: !!id }
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
                        <a
                            href={buildTelegramShareUrl(
                                `⚽ ${homeName} ${match.homeScore ?? 0} - ${match.awayScore ?? 0} ${awayName}`,
                                window.location.href
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button size="sm" variant="secondary" className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30">
                                <MessageCircle className="w-3 h-3 mr-1.5 text-blue-400" />
                                Share to Telegram
                            </Button>
                        </a>
                    </div>
                </Card>

                {/* Match Visualization */}
                <MatchEnginePreview
                    squadId={match.homeSquadId}
                    awaySquadId={match.awaySquadId}
                    playersPerSide={match.playersPerSide ?? 11}
                    hasKeeper={match.hasKeeper ?? true}
                />

                {/* Consensus Reveal Ceremony */}
                {isVerified && !revealResults && (
                  <Card className="bg-gradient-to-br from-indigo-900 to-black border-indigo-500/50 p-8 text-center relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-indigo-500/10"
                      animate={{ 
                        opacity: [0.1, 0.2, 0.1],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-white mb-2 italic uppercase">Consensus Complete</h3>
                    <p className="text-indigo-200/70 mb-6 text-sm">Peer ratings are in. The squad's tactical DNA has evolved.</p>
                    <Button 
                      size="lg" 
                      className="bg-white text-indigo-900 hover:bg-indigo-100 font-black px-12 h-14 text-xl tracking-tighter rounded-none skew-x-[-12deg]"
                      onClick={() => setRevealResults(true)}
                    >
                      <span className="skew-x-[12deg]">REVEAL RESULTS</span>
                    </Button>
                  </Card>
                )}

                <AnimatePresence>
                {isVerified && revealResults && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {/* MOTM Celebration */}
                    <Card className="bg-yellow-500 p-1 border-none rounded-none skew-x-[-3deg]">
                      <div className="bg-black p-6 flex items-center justify-between skew-x-[3deg]">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Trophy className="w-12 h-12 text-yellow-500" />
                            <motion.div 
                              className="absolute inset-0 bg-yellow-400/20 rounded-full"
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">Match Excellence</div>
                            <h3 className="text-2xl font-black text-white italic uppercase leading-none">Man of the Match</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-white italic">KIPCHOGE</div>
                          <div className="text-xs text-yellow-500 font-bold uppercase">78% Consensus</div>
                        </div>
                      </div>
                    </Card>

                    {/* Player Stats / Attribute Changes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {match.playerStats.slice(0, 4).map((stats, idx) => (
                        <motion.div
                          key={stats.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="bg-gray-900 border-white/5 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center font-bold text-gray-500">
                                {stats.profile?.user?.name?.[0] || 'P'}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">{stats.profile?.user?.name}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Rating: {((stats as any).rating || 7.5).toFixed(1)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-[10px] text-gray-500 uppercase">Passing</div>
                                <div className="text-xs font-bold text-green-400">+2 🔼</div>
                              </div>
                              <div className="h-8 w-[1px] bg-white/5" />
                              <div className="text-right">
                                <div className="text-[10px] text-gray-500 uppercase">Pace</div>
                                <div className="text-xs font-bold text-white">74</div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-center">
                      <Link href={`/match/${match.id}/rate`}>
                        <Button variant="secondary" size="sm">View Full Performance Report</Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>

                {/* Verifications list */}
                {match.verifications.length > 0 && (
                    <Card className="bg-gray-900 border-gray-800 p-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Verifications</h4>
                        <div className="space-y-2 text-xs">
                            {match.verifications.map((v) => (
                                <div key={v.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                            {v.verifier?.name?.[0] || 'A'}
                                        </div>
                                        <span className="text-white font-medium">{v.verifier?.name ?? "Anonymous"}</span>
                                        {v.verifier?.playerProfile?.reputationScore !== undefined && (
                                            <span className="text-gray-500">Rep: {v.verifier.playerProfile.reputationScore}</span>
                                        )}
                                    </div>
                                    <span className={v.verified ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                                        {v.verified ? "Confirmed" : "Disputed"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Peer Ratings Section */}
                {isVerified && (
                  <Card className="bg-gradient-to-br from-gray-900 to-indigo-950/20 border-indigo-500/30 p-6 text-center shadow-lg shadow-indigo-500/10">
                    <div className="mx-auto w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">Teammate Scouting</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                      Rate your teammates performance to award them XP and build your Scout reputation.
                    </p>
                    <Link href={`/match/${match.id}/rate`}>
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
