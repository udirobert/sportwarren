'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';
import { trpc } from '@/lib/trpc-client';
import { getPreviewClaim, clearPreviewClaim } from '@/lib/preview-claim';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, RefreshCcw, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PreviewClaimPrompt: React.FC = () => {
  const { hasAccount, isGuest } = useWallet();
  const { addToast } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);
  const [claimData, setClaimData] = useState<ReturnType<typeof getPreviewClaim>>(null);

  const claimMutation = trpc.auth.claimPreviewIdentity.useMutation({
    onSuccess: (data) => {
      addToast({
        tone: 'success',
        title: 'Card Linked',
        message: data.message,
      });
      setShowPrompt(false);
      clearPreviewClaim();
    },
    onError: (err) => {
      addToast({
        tone: 'error',
        title: 'Link Failed',
        message: err.message,
      });
    },
  });

  useEffect(() => {
    if (hasAccount && !isGuest) {
      const stored = getPreviewClaim();
      if (stored) {
        setClaimData(stored);
        setShowPrompt(true);
      }
    }
  }, [hasAccount, isGuest]);

  if (!showPrompt || !claimData) return null;

  const handleClaim = () => {
    claimMutation.mutate({ previewToken: claimData.previewToken });
  };

  const handleDismiss = () => {
    clearPreviewClaim();
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
          <Card className="bg-gray-900 border-emerald-500/50 shadow-2xl p-5 relative overflow-hidden">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy className="w-16 h-16 text-emerald-500" />
            </div>

            <div className="flex items-start gap-2.5 mb-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <h3 className="text-lg font-black italic text-white uppercase tracking-tight">
                  Link Your Card
                </h3>
                <p className="text-xs font-bold text-emerald-300 mt-0.5">
                  Found your preview from {claimData.squadName ?? 'your squad'}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed font-medium mb-3">
              We found your preview card{claimData.name ? ` for ${claimData.name}` : ''}{' '}
              from {claimData.squadName ?? 'your squad'}. Link it to your account
              to keep your ratings, attributes, and history permanently.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Once linked, the captain&apos;s preview link retires — your card
              lives here from now on.
            </p>

            <div className="flex space-x-3">
              <Button
                onClick={handleClaim}
                disabled={claimMutation.isPending}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg flex-1 font-black uppercase tracking-widest text-xs"
              >
                {claimMutation.isPending ? (
                  <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trophy className="w-4 h-4 mr-2" />
                )}
                Link Now
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                disabled={claimMutation.isPending}
                className="border-gray-700 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-bold"
              >
                Later
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
