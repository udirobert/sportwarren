'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, CheckCircle2, Flame, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc-client';
import { useToast } from '@/contexts/ToastContext';

const ATTRIBUTE_LABELS: Record<string, string> = {
  pace: 'Pace',
  shooting: 'Shooting',
  passing: 'Passing',
  dribbling: 'Dribbling',
  defending: 'Defending',
  physical: 'Physical',
};

export function DailyDrillWidget() {
  const { addToast } = useToast();
  const utils = trpc.useUtils();

  const { data: status, isLoading: statusLoading } = trpc.player.getDailyDrillStatus.useQuery(undefined, {
    retry: 1,
    staleTime: 10_000,
  });

  const completeDrill = trpc.player.completeDailyDrill.useMutation({
    onSuccess: (data) => {
      addToast({
        tone: 'success',
        title: 'Drill Complete!',
        message: `+${data.drill.xpAwarded} XP · +1 ${ATTRIBUTE_LABELS[data.drill.attribute] || data.drill.attribute}`,
      });
      utils.player.getDailyDrillStatus.invalidate();
      utils.player.getTwinSummary.invalidate();
    },
    onError: (error) => {
      addToast({
        tone: 'error',
        title: 'Drill Failed',
        message: error.message,
      });
    },
  });

  const handleComplete = () => {
    completeDrill.mutate();
  };

  if (statusLoading) {
    return (
      <Card className="animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        </div>
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </Card>
    );
  }

  const alreadyCompleted = !status?.available;

  return (
    <Card className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        {alreadyCompleted ? (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Drill Complete</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Come back tomorrow for your next drill
              </p>
            </div>
            {status?.currentStreak && status.currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-[10px] font-black text-orange-600 dark:text-orange-400">
                  {status.currentStreak}d
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="available"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Daily Drill</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Complete to boost your twin's stats
                </p>
              </div>
              {status?.currentStreak && status.currentStreak > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] font-black text-orange-600 dark:text-orange-400">
                    {status.currentStreak}d streak
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wide">
                  Today's Focus
                </span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Random attribute boost · 15-30 XP · +1 to weakest stat
              </p>
            </div>

            <Button
              onClick={handleComplete}
              loading={completeDrill.isPending}
              className="w-full"
            >
              Complete Drill
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
