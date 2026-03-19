"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Star, Trophy, UserCheck } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { trpc } from '@/lib/trpc-client';
import type { TransferMarketPlayer } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface DraftEngineProps {
  prospects?: TransferMarketPlayer[];
  loading?: boolean;
}

export const DraftEngine: React.FC<DraftEngineProps> = ({
  prospects = [],
  loading = false,
}) => {
  const { isGuest } = useWallet();
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftStep, setDraftStep] = useState(0);
  const [selectedProspect, setSelectedProspect] = useState<TransferMarketPlayer | null>(null);
  const { completeChecklistItem } = useOnboarding();
  const utils = trpc.useUtils();

  const signMutation = trpc.market.signProspect.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.market.listProspects.invalidate(),
        utils.market.listScoutingFeed.invalidate(),
      ]);
      alert(data.message);
      completeChecklistItem('use_draft');
      setIsDrafting(false);
      setDraftStep(0);
      setSelectedProspect(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const startDraft = () => {
    if (!prospects.length) {
      return;
    }

    setIsDrafting(true);
    setDraftStep(1);

    setTimeout(() => setDraftStep(2), 2000);
    setTimeout(() => {
      const picked = prospects[Math.floor(Math.random() * prospects.length)];
      setSelectedProspect(picked);
      setDraftStep(3);
    }, 4500);
  };

  const handleContract = () => {
    if (!selectedProspect) {
      return;
    }

    if (isGuest) {
      const currentDraftsStr = localStorage.getItem('sw_guest_drafts');
      let drafts: string[] = [];
      if (currentDraftsStr) {
        try {
          drafts = JSON.parse(currentDraftsStr);
        } catch {}
      }

      if (!drafts.includes(selectedProspect.id)) {
        drafts.push(selectedProspect.id);
        localStorage.setItem('sw_guest_drafts', JSON.stringify(drafts));
      }

      alert(`[GUEST MODE] ${selectedProspect.name} recruited! Connect wallet to permanently sign them.`);
      completeChecklistItem('use_draft');
      setIsDrafting(false);
      setDraftStep(0);
      setSelectedProspect(null);
      return;
    }

    signMutation.mutate({ playerId: selectedProspect.id });
  };

  return (
    <Card className="relative overflow-hidden border-gray-800 bg-gray-900 text-white">
      <div className="pointer-events-none absolute top-0 right-0 p-6 opacity-10">
        <Sparkles className="h-48 w-48" />
      </div>

      <div className="relative z-10">
        {!isDrafting ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/20">
              <Trophy className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Prospect Draft Engine</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
              Prospect pulls only open when the scouting network has active signals for your squad.
            </p>
            <Button
              onClick={startDraft}
              disabled={loading || prospects.length === 0}
              className="mt-8 bg-blue-600 px-10 py-6 font-black uppercase tracking-widest text-white hover:bg-blue-700"
            >
              {loading ? 'Loading scouting feed...' : prospects.length > 0 ? 'Begin Draft Selection' : 'No Draft Signals Yet'}
            </Button>
            {!loading && prospects.length === 0 && (
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
                  <Search className="mx-auto mb-6 h-16 w-16 animate-pulse text-blue-400" />
                  <h4 className="text-xl font-bold italic uppercase">Connecting to Peer-to-Peer Scouting Network...</h4>
                  <p className="mt-2 font-mono text-xs uppercase tracking-widest text-gray-500">
                    Scanning Pitch ID signatures on Base & Algorand
                  </p>
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
                  <div className="mb-6 flex justify-center space-x-2">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="h-3 w-3 animate-bounce rounded-full bg-blue-500"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <h4 className="text-xl font-bold italic uppercase">Evaluating Reputation Multipliers...</h4>
                  <p className="mt-2 font-mono text-xs uppercase tracking-widest text-gray-500">
                    Cross-referencing match history vs local hero thresholds
                  </p>
                </motion.div>
              )}

              {draftStep === 3 && selectedProspect && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <span className="mb-4 inline-block rounded-full bg-green-500 px-3 py-1 text-[10px] font-black uppercase text-black">
                    Selection Confirmed
                  </span>
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20">
                    <UserCheck className="h-12 w-12 text-white" />
                  </div>
                  <h4 className="text-3xl font-black uppercase tracking-tighter italic">{selectedProspect.name}</h4>
                  <div className="mt-2 flex items-center justify-center space-x-3">
                    <span className="font-bold uppercase text-blue-400">{selectedProspect.position}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-700" />
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-bold uppercase">{selectedProspect.currentClub}</span>
                    </div>
                  </div>

                  <div className="mx-auto mt-8 grid max-w-xs grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs font-black uppercase text-gray-500">Market Valuation</div>
                      <div className="text-lg font-bold">{selectedProspect.marketValuation.toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs font-black uppercase text-gray-500">Suggested Signing Bonus</div>
                      <div className="text-lg font-bold">{selectedProspect.askingPrice.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mt-8 space-x-3">
                    <Button
                      onClick={handleContract}
                      disabled={signMutation.isPending}
                      className="bg-white font-black uppercase text-blue-900 hover:bg-blue-100"
                    >
                      {signMutation.isPending ? 'Signing...' : 'Contract Player'}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={signMutation.isPending}
                      onClick={() => {
                        setIsDrafting(false);
                        setDraftStep(0);
                        setSelectedProspect(null);
                      }}
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
