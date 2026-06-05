'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Swords, Minus } from 'lucide-react';
import { ProgressionAnimation } from '@/components/ui/ProgressionAnimation';
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay';
import { trpc } from '@/lib/trpc-client';

export function PostMatchReaction() {
  const [dismissed, setDismissed] = React.useState(false);
  const [showCelebration, setShowCelebration] = React.useState(false);

  const { data: reaction, isLoading } = trpc.player.getRecentMatchReaction.useQuery(undefined, {
    retry: 1,
    staleTime: 60_000,
  });

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleAnimationComplete = () => {
    if (reaction?.twinDiff?.levelUp) {
      setShowCelebration(true);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  if (isLoading || !reaction || dismissed) {
    return null;
  }

  const { match, twinDiff } = reaction;

  const resultConfig = {
    win: {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      label: 'Victory',
      gradient: 'from-yellow-500 via-amber-500 to-yellow-600',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
    },
    loss: {
      icon: <Swords className="w-6 h-6 text-red-500" />,
      label: 'Defeat',
      gradient: 'from-red-500 via-rose-500 to-red-600',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
    },
    draw: {
      icon: <Minus className="w-6 h-6 text-blue-500" />,
      label: 'Draw',
      gradient: 'from-blue-500 via-indigo-500 to-blue-600',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
  }[match.result];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-5 relative overflow-hidden"
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors z-20"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="relative z-10">
          {/* Result badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl ${resultConfig.bg} border ${resultConfig.border} flex items-center justify-center`}>
              {resultConfig.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-lg font-black bg-gradient-to-r ${resultConfig.gradient} bg-clip-text text-transparent uppercase`}>
                  {resultConfig.label}
                </h3>
              </div>
              <p className="text-xs text-gray-400">
                vs {match.opponent} · {match.score}
              </p>
            </div>
          </div>

          {/* Twin reaction */}
          {twinDiff && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <ProgressionAnimation
                xpDelta={twinDiff.xpDelta}
                attributeDeltas={twinDiff.attributeDeltas}
                levelUp={twinDiff.levelUp}
                newLevel={twinDiff.newLevel}
                onComplete={handleAnimationComplete}
              />
            </div>
          )}
        </div>
      </motion.div>

      <CelebrationOverlay
        isVisible={showCelebration}
        type="achievement"
        title="Level Up!"
        subtitle={`You reached level ${twinDiff?.newLevel}`}
        onComplete={handleCelebrationComplete}
      />
    </>
  );
}
