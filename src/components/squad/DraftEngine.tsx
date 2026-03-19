"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, Search, UserCheck, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { trpc } from '@/lib/trpc-client';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useWallet } from '@/contexts/WalletContext';

export const DraftEngine: React.FC = () => {
    const { isGuest } = useWallet();
    const [isDrafting, setIsDrafting] = useState(false);
    const [draftStep, setDraftStep] = useState(0);
    const [selectedProspect, setSelectedProspect] = useState<any>(null);

    const { completeChecklistItem } = useOnboarding();

    // Dynamic prospect pool from server
    const { data: serverProspects, isLoading: prospectsLoading } = trpc.market.listProspects.useQuery();
    const prospects = serverProspects ?? [];

    const signMutation = trpc.market.signProspect.useMutation({
        onSuccess: (data) => {
            alert(data.message);
            completeChecklistItem('use_draft');
            setIsDrafting(false);
            setDraftStep(0);
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const startDraft = () => {
        if (!prospects.length) {
            return;
        }

        setIsDrafting(true);
        setDraftStep(1);

        // Simulate "Searching Labs / Academies"
        setTimeout(() => setDraftStep(2), 2000);
        setTimeout(() => {
            const picked = prospects[Math.floor(Math.random() * prospects.length)];
            setSelectedProspect(picked);
            setDraftStep(3);
        }, 4500);
    };

    const handleContract = () => {
        if (!selectedProspect) return;

        if (isGuest) {
            // Save to guest local storage instead
            const currentDraftsStr = localStorage.getItem('sw_guest_drafts');
            let drafts = [];
            if (currentDraftsStr) {
                try { drafts = JSON.parse(currentDraftsStr); } catch (e) { }
            }
            if (!drafts.includes(selectedProspect.id)) {
                drafts.push(selectedProspect.id);
                localStorage.setItem('sw_guest_drafts', JSON.stringify(drafts));
            }
            alert(`[GUEST MODE] ${selectedProspect.name} recruited! Connect wallet to permanently sign them.`);
            completeChecklistItem('use_draft');
            setIsDrafting(false);
            setDraftStep(0);
        } else {
            signMutation.mutate({ playerId: selectedProspect.id });
        }
    };

    return (
        <Card className="bg-gray-900 border-gray-800 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Sparkles className="w-48 h-48" />
            </div>

            <div className="relative z-10">
                {!isDrafting ? (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                            <Trophy className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">Prospect Draft Engine</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto mt-2">
                            Prospect pulls only open when the scouting network has active signals for your squad.
                        </p>
                        <Button
                            onClick={startDraft}
                            disabled={prospectsLoading || prospects.length === 0}
                            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest px-10 py-6"
                        >
                            {prospectsLoading ? 'Loading scouting feed...' : prospects.length > 0 ? 'Begin Draft Selection' : 'No Draft Signals Yet'}
                        </Button>
                        {!prospectsLoading && prospects.length === 0 && (
                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                                Check back after the scouting feed publishes new prospects.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="py-10">
                        <AnimatePresence mode="wait">
                            {draftStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="text-center"
                                >
                                    <Search className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-pulse" />
                                    <h4 className="text-xl font-bold italic uppercase">Connecting to Peer-to-Peer Scouting Network...</h4>
                                    <p className="text-gray-500 font-mono text-xs mt-2 uppercase tracking-widest">Scanning Pitch ID signatures on Base & Algorand</p>
                                </motion.div>
                            )}

                            {draftStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="text-center"
                                >
                                    <div className="flex justify-center space-x-2 mb-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                        ))}
                                    </div>
                                    <h4 className="text-xl font-bold italic uppercase">Evaluating Reputation Multipliers...</h4>
                                    <p className="text-gray-500 font-mono text-xs mt-2 uppercase tracking-widest">Cross-referencing match history vs local hero thresholds</p>
                                </motion.div>
                            )}

                            {draftStep === 3 && selectedProspect && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center"
                                >
                                    <span className="bg-green-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase mb-4 inline-block">Selection Confirmed</span>
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
                                        <UserCheck className="w-12 h-12 text-white" />
                                    </div>
                                    <h4 className="text-3xl font-black tracking-tighter uppercase italic">{selectedProspect.name}</h4>
                                    <div className="flex items-center justify-center space-x-3 mt-2">
                                        <span className="text-blue-400 font-bold uppercase">{selectedProspect.position}</span>
                                        <div className="w-1.5 h-1.5 bg-gray-700 rounded-full" />
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-bold">LEGENDARY POTENTIAL</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 grid grid-cols-2 gap-3 max-w-xs mx-auto">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                            <div className="text-xs font-black text-gray-500 uppercase">Est. Market Value</div>
                                            <div className="text-lg font-bold">{(selectedProspect.marketValuation * 1.5).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                            <div className="text-xs font-black text-gray-500 uppercase">Draft Salary</div>
                                            <div className="text-lg font-bold">250 / wk</div>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-x-3">
                                        <Button
                                            onClick={handleContract}
                                            disabled={signMutation.isPending}
                                            className="bg-white text-blue-900 hover:bg-blue-100 font-black uppercase"
                                        >
                                            {signMutation.isPending ? 'Signing...' : 'Contract Player'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            disabled={signMutation.isPending}
                                            onClick={() => { setIsDrafting(false); setDraftStep(0); }}
                                            className="border-white/10 text-gray-400 hover:text-white"
                                        >
                                            Return to Market
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </Card>
    );
};
