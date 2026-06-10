"use client";

import React, { useEffect, useState } from 'react';
import { useWallet, STORAGE_KEYS } from '@/contexts/WalletContext';
import { trpc } from '@/lib/trpc-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, RefreshCcw, AlertTriangle, Zap, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackGuestMigrationPromptShown, trackGuestMigrationAccepted } from '@/lib/analytics';

export const GuestMigrationPrompt: React.FC = () => {
    const { hasAccount, isGuest } = useWallet();
    const [showPrompt, setShowPrompt] = useState(false);

    const migrateMutation = trpc.auth.migrateGuestProgress.useMutation({
        onSuccess: (data) => {
            alert(data.message);
            setShowPrompt(false);
            localStorage.removeItem(STORAGE_KEYS.GUEST_PENDING_MIGRATION);
            localStorage.removeItem('sw_guest_drafts');
            localStorage.removeItem('sw_guest_xp');
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    useEffect(() => {
        // Only show if the user has claimed a real account, NOT as guest, and we have pending guest progress
        if (hasAccount && !isGuest && localStorage.getItem(STORAGE_KEYS.GUEST_PENDING_MIGRATION) === 'true') {
            const hasDrafts = localStorage.getItem('sw_guest_drafts');
            const hasXP = localStorage.getItem('sw_guest_xp');
            const xpVal = parseInt(hasXP || '0', 10) || 0;
            let draftCount = 0;
            if (hasDrafts) {
                try { draftCount = JSON.parse(hasDrafts).length; } catch { /* ignore */ }
            }

            if (hasDrafts || hasXP) {
                setShowPrompt(true);
                trackGuestMigrationPromptShown(xpVal, draftCount);
            } else {
                // Nothing to migrate
                localStorage.removeItem(STORAGE_KEYS.GUEST_PENDING_MIGRATION);
            }
        }
    }, [hasAccount, isGuest]);

    if (!showPrompt) return null;

    const handleMigrate = () => {
        const draftsStr = localStorage.getItem('sw_guest_drafts');
        const xpStr = localStorage.getItem('sw_guest_xp');

        let draftedPlayerIds: string[] = [];
        let accumulatedXP = 0;

        if (draftsStr) {
            try { draftedPlayerIds = JSON.parse(draftsStr); } catch { /* ignore */ }
        }
        if (xpStr) {
            accumulatedXP = parseInt(xpStr, 10) || 0;
        }

        trackGuestMigrationAccepted(accumulatedXP, draftedPlayerIds.length);
        migrateMutation.mutate({
            guestData: {
                draftedPlayerIds,
                accumulatedXP
            }
        });
    };

    const handleDismiss = () => {
        localStorage.removeItem(STORAGE_KEYS.GUEST_PENDING_MIGRATION);
        localStorage.removeItem('sw_guest_drafts');
        localStorage.removeItem('sw_guest_xp');
        setShowPrompt(false);
    };

    // Compute guest progress for loss-aversion preview
    const guestXP = parseInt(localStorage.getItem('sw_guest_xp') || '0', 10) || 0;
    let guestDraftCount = 0;
    try { guestDraftCount = JSON.parse(localStorage.getItem('sw_guest_drafts') || '[]').length; } catch { /* ignore */ }

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 50 }}
                    className="fixed bottom-6 right-6 z-[100] max-w-sm w-full"
                >
                    <Card className="bg-gray-900 border-amber-500/50 shadow-2xl p-5 relative overflow-hidden">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Trophy className="w-16 h-16 text-amber-500" />
                        </div>

                        {/* Urgency header */}
                        <div className="flex items-start gap-2.5 mb-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                            <div>
                                <h3 className="text-lg font-black italic text-white uppercase tracking-tight">Claim Your Progress</h3>
                                <p className="text-xs font-bold text-amber-300 mt-0.5">
                                    Guest data is temporary — lock it in now
                                </p>
                            </div>
                        </div>

                        {/* Progress preview */}
                        <div className="mb-4 grid grid-cols-2 gap-2">
                            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-center">
                                <Zap className="mx-auto h-4 w-4 text-amber-400 mb-1" />
                                <div className="text-xl font-black tabular-nums text-white">{guestXP.toLocaleString()}</div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">XP at risk</div>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-center">
                                <Users className="mx-auto h-4 w-4 text-sky-400 mb-1" />
                                <div className="text-xl font-black tabular-nums text-white">{guestDraftCount}</div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Draft picks</div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-300 leading-relaxed font-medium mb-4">
                            You have <span className="text-white font-bold">{guestXP.toLocaleString()} XP</span> and <span className="text-white font-bold">{guestDraftCount} draft picks</span> at risk — claim them before your guest session expires.
                        </p>

                        <div className="flex space-x-3">
                            <Button
                                onClick={handleMigrate}
                                disabled={migrateMutation.isPending}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg flex-1 font-black uppercase tracking-widest text-xs"
                            >
                                {migrateMutation.isPending ? (
                                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Trophy className="w-4 h-4 mr-2" />
                                )}
                                Claim Now
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDismiss}
                                disabled={migrateMutation.isPending}
                                className="border-gray-700 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-bold"
                            >
                                Discard
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
