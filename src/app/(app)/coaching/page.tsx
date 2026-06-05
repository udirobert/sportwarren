"use client";

import React, { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { Card } from '@/components/ui/Card';
import { PageShell } from '@/components/common/PageShell';
import { Dumbbell, Star, Clock, X } from 'lucide-react';

const ATTRIBUTES = [
  { key: 'pace', label: 'Pace' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'passing', label: 'Passing' },
  { key: 'dribbling', label: 'Dribbling' },
  { key: 'defending', label: 'Defending' },
  { key: 'physical', label: 'Physical' },
] as const;

const DURATIONS = [
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
] as const;

export default function CoachingPage() {
  const [hireCoach, setHireCoach] = useState<string | null>(null);
  const { data: coaches, isLoading: coachesLoading } = trpc.coaching.listCoaches.useQuery();
  const { data: profile } = trpc.player.getMyIdentity.useQuery();

  const profileId = (profile as any)?.profile?.id;
  const { data: effects } = trpc.coaching.getActiveEffects.useQuery(
    { targetType: 'player', targetId: profileId ?? '' },
    { enabled: !!profileId },
  );

  const utils = trpc.useUtils();
  const cancelMutation = trpc.coaching.cancelEffect.useMutation({
    onSuccess: () => {
      utils.coaching.getActiveEffects.invalidate();
    },
  });

  return (
    <PageShell maxWidth="2xl">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Coaching Marketplace</h1>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Active Effects */}
        {effects && effects.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-green-500" />
              Active Coaching
            </h2>
            <div className="space-y-2">
              {effects.map((effect) => (
                <Card key={effect.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        +{effect.modifier} {effect.attribute}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {effect.coachAgent?.name ?? 'Coach'} &middot; expires {new Date(effect.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => cancelMutation.mutate({ effectId: effect.id })}
                      className="text-red-400 hover:text-red-300 p-1"
                      disabled={cancelMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Available Coaches */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Available Coaches
          </h2>
          {coachesLoading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
            </div>
          ) : !coaches?.length ? (
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No coaches available right now.</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {coaches.map((coach) => (
                <Card key={coach.id}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{coach.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{coach.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{coach.reputation}</span>
                      </div>
                    </div>
                    {coach.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {coach.capabilities.slice(0, 4).map((cap) => (
                          <span key={cap} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {coach.servicePrice ? `${coach.servicePrice} ${coach.serviceAsset}` : 'Free'}
                      </span>
                      <button
                        onClick={() => setHireCoach(coach.id)}
                        disabled={!profileId}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Hire
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Hire Modal */}
        {hireCoach && profileId && (
          <HireModal
            coachAgentId={hireCoach}
            targetId={profileId}
            onClose={() => setHireCoach(null)}
          />
        )}
      </div>
    </PageShell>
  );
}

function HireModal({ coachAgentId, targetId, onClose }: { coachAgentId: string; targetId: string; onClose: () => void }) {
  const [attribute, setAttribute] = useState<string>('pace');
  const [duration, setDuration] = useState(7);
  const [modifier] = useState(3);

  const utils = trpc.useUtils();
  const hire = trpc.coaching.hireCoach.useMutation({
    onSuccess: () => {
      utils.coaching.getActiveEffects.invalidate();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hire Coach</h3>

        <div>
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Attribute</label>
          <select
            value={attribute}
            onChange={(e) => setAttribute(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2 text-sm text-gray-900 dark:text-white"
          >
            {ATTRIBUTES.map((a) => (
              <option key={a.key} value={a.key}>{a.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Duration</label>
          <div className="mt-1 flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.days}
                onClick={() => setDuration(d.days)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                  duration === d.days
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>+{modifier} {attribute} for {duration} days</span>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-bold bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => hire.mutate({
              targetType: 'player',
              targetId,
              coachAgentId,
              attribute: attribute as any,
              modifier,
              durationDays: duration,
              costUsdc: 0,
            })}
            disabled={hire.isPending}
            className="flex-1 py-2 rounded-lg text-sm font-bold bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 transition-colors"
          >
            {hire.isPending ? 'Hiring...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
