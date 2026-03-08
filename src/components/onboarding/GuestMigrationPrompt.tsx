"use client";

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { trpc } from '@/lib/trpc-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GuestMigrationPrompt: React.FC = () => {
    const { connected, isGuest } = useWallet();
    const [showPrompt, setShowPrompt] = useState(false);

    const migrateMutation = trpc.auth.migrateGuestProgress.useMutation({
        onSuccess: (data) => {
            alert(data.message);
            setShowPrompt(false);
            localStorage.removeItem('sw_guest_drafts');
            localStorage.removeItem('sw_guest_xp');
            localStorage.removeItem('sw_is_guest');
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    useEffect(() => {
        // Only show if user is logged in, NOT as guest, and they HAVE a guest flag lingering
        if (connected && !isGuest && localStorage.getItem('sw_is_guest') === 'true') {
            const hasDrafts = localStorage.getItem('sw_guest_drafts');
            const hasXP = localStorage.getItem('sw_guest_xp');

            if (hasDrafts || hasXP) {
                setShowPrompt(true);
            } else {
                // Nothing to migrate
                localStorage.removeItem('sw_is_guest');
            }
        }
    }, [connected, isGuest]);

    if (!showPrompt) return null;

    const handleMigrate = () => {
        const draftsStr = localStorage.getItem('sw_guest_drafts');
        const xpStr = localStorage.getItem('sw_guest_xp');

        let draftedPlayerIds: string[] = [];
        let accumulatedXP = 0;

        if (draftsStr) {
            try { draftedPlayerIds = JSON.parse(draftsStr); } catch (e) { }
        }
        if (xpStr) {
            accumulatedXP = parseInt(xpStr, 10) || 0;
        }

        migrateMutation.mutate({
            guestData: {
                draftedPlayerIds,
                accumulatedXP
            }
        });
    };

    const handleDismiss = () => {
        localStorage.removeItem('sw_is_guest');
        localStorage.removeItem('sw_guest_drafts');
        localStorage.removeItem('sw_guest_xp');
        setShowPrompt(false);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 50 }}
                    className="fixed bottom-6 right-6 z-[100] max-w-sm w-full"
                >
                    <Card className="bg-gray-900 border-blue-500/50 shadow-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Trophy className="w-16 h-16 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tight mb-2">Claim Your Progress</h3>
                        <p className="text-sm text-gray-300 leading-relaxed font-semibold mb-4 pr-10">
                            We noticed you made some progress during your guest session! Want to sync your draft picks and match XP to your connected account?
                        </p>

                        <div className="flex space-x-3">
                            <Button
                                onClick={handleMigrate}
                                disabled={migrateMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex-1"
                            >
                                {migrateMutation.isPending ? (
                                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Trophy className="w-4 h-4 mr-2" />
                                )}
                                Claim Rewards
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDismiss}
                                disabled={migrateMutation.isPending}
                                className="border-gray-700 text-gray-400 hover:text-white hover:bg-white/10"
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
