"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Activity, Loader2, TrendingUp, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc-client';
import { useJourneyState } from '@/hooks/useJourneyState';

interface TrainingCenterProps {
  userId?: string;
}

const QUICK_ACTIONS = [
  { id: 'run', label: 'Log Run', icon: TrendingUp, duration: 35, intensity: 'medium' as const },
  { id: 'hiit', label: 'Log HIIT', icon: Zap, duration: 20, intensity: 'high' as const },
  { id: 'gym', label: 'Log Gym', icon: Users, duration: 45, intensity: 'medium' as const },
];

function formatActivityType(type: string) {
  return type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const TrainingCenter: React.FC<TrainingCenterProps> = ({ userId }) => {
  const { hasAccount, hasWallet, isGuest, isVerified } = useJourneyState();
  const { data: training, refetch, isLoading } = trpc.player.getTrainingData.useQuery(
    { userId: userId || '' },
    { enabled: !!userId, staleTime: 30 * 1000 }
  );

  const syncMutation = trpc.player.syncActivity.useMutation({
    onSuccess: () => refetch(),
  });

  const handleQuickSync = (type: 'run' | 'hiit' | 'gym', duration: number, intensity: 'low' | 'medium' | 'high') => {
    if (!userId) {
      return;
    }

    syncMutation.mutate({
      userId,
      type,
      duration,
      intensity,
      source: 'manual',
    });
  };

  if (!hasAccount || isGuest) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-orange-100 p-2">
            <Activity className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Training Center</h2>
            <p className="mt-1 text-sm text-gray-600">
              Claim an account to turn training sessions into real sharpness and XP.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!hasWallet || !isVerified || !userId) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-orange-100 p-2">
            <Zap className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Training Center</h2>
            <p className="mt-1 text-sm text-gray-600">
              Verify your wallet to load the protected training log and record sessions against your real player profile.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading && !training) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-5 w-40 rounded bg-gray-100" />
        <div className="mt-4 h-3 w-full rounded bg-gray-100" />
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-20 rounded-xl bg-gray-100" />
          ))}
        </div>
      </Card>
    );
  }

  const weeklyTarget = training?.weeklyTarget ?? 150;
  const weeklyProgress = training?.weeklyProgress ?? 0;
  const sharpness = training?.sharpness ?? 0;
  const activities = training?.activities?.slice(0, 3) ?? [];

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-900">Training Center</h2>
        </div>
        <div className="flex items-center space-x-1 bg-orange-100 px-2 py-0.5 rounded-full">
          <span className="text-[10px] font-black text-orange-700 uppercase">{sharpness}% Sharpness</span>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
          <span>Weekly Goal</span>
          <span>{weeklyProgress} / {weeklyTarget} mins</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (weeklyProgress / weeklyTarget) * 100)}%` }}
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleQuickSync(action.id as 'run' | 'hiit' | 'gym', action.duration, action.intensity)}
              disabled={syncMutation.isPending}
              className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all border border-transparent hover:border-orange-200 group disabled:opacity-60"
            >
              <Icon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase">{action.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">Recent Sessions</h3>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            {activities.length > 0 ? `${activities.length} logged` : 'No sessions yet'}
          </span>
        </div>

        {activities.length > 0 ? (
          <div className="space-y-2">
            {activities.map((activity: any) => (
              <div key={activity.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{formatActivityType(activity.type)}</div>
                  <div className="text-xs text-gray-500">
                    {activity.duration} mins · {activity.intensity} intensity · {activity.source}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-orange-600">+{activity.xpGained ?? 0} XP</div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center">
            <Activity className="mx-auto h-4 w-4 text-gray-400" />
            <p className="mt-2 text-sm font-semibold text-gray-900">No training logged yet</p>
            <p className="mt-1 text-sm text-gray-600">
              Record the next run, HIIT block, or gym session to move sharpness with real activity.
            </p>
          </div>
        )}
      </div>

      {syncMutation.isPending && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      )}
    </Card>
  );
};
