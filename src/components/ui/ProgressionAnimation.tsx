'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const ATTRIBUTE_LABELS: Record<string, string> = {
  pace: 'Pace',
  shooting: 'Shooting',
  passing: 'Passing',
  dribbling: 'Dribbling',
  defending: 'Defending',
  physical: 'Physical',
};

interface AttributeDelta {
  key: string;
  delta: number;
}

interface ProgressionAnimationProps {
  xpDelta: number;
  attributeDeltas: AttributeDelta[];
  levelUp?: boolean;
  newLevel?: number;
  onComplete?: () => void;
}

export function ProgressionAnimation({
  xpDelta,
  attributeDeltas,
  levelUp,
  newLevel,
  onComplete,
}: ProgressionAnimationProps) {
  const [showXP, setShowXP] = React.useState(false);
  const [showAttributes, setShowAttributes] = React.useState(false);
  const [animatedXP, setAnimatedXP] = React.useState(0);

  useEffect(() => {
    // Start XP counter animation after a brief delay
    const xpTimer = setTimeout(() => setShowXP(true), 200);

    // Start attribute bars after XP begins
    const attrTimer = setTimeout(() => setShowAttributes(true), 600);

    // Call onComplete after all animations finish (~2s total)
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => {
      clearTimeout(xpTimer);
      clearTimeout(attrTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Animate XP counter from 0 to xpDelta
  useEffect(() => {
    if (!showXP || xpDelta === 0) return;

    const duration = 1200; // 1.2s
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = xpDelta / steps;

    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= xpDelta) {
        setAnimatedXP(xpDelta);
        clearInterval(interval);
      } else {
        setAnimatedXP(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [showXP, xpDelta]);

  return (
    <div className="space-y-3">
      {/* XP Counter */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
              +{animatedXP} XP
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attribute Bars */}
      <AnimatePresence>
        {showAttributes && attributeDeltas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {attributeDeltas.map(({ key, delta }) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {ATTRIBUTE_LABELS[key] || key}
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    +{delta.toFixed(1)}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Badge */}
      <AnimatePresence>
        {levelUp && newLevel && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center gap-2 py-3"
          >
            <div className="px-4 py-2 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/30">
              <div className="text-sm font-black text-white uppercase tracking-wide">
                Level {newLevel}!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
