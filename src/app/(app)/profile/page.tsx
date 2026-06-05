"use client";

import React from 'react';
import { trpc } from '@/lib/trpc-client';
import { PlayerIdentityCard } from '@/components/identity/PlayerIdentityCard';
import { Skeleton } from '@/components/ui/Skeleton';

function ProfileSkeleton() {
  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="rounded-xl bg-slate-900 border border-slate-700 p-6 animate-pulse">
        <div className="flex items-end gap-4 mb-6">
          <div className="h-20 w-20 rounded-xl bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-slate-700 rounded" />
            <div className="h-3 w-48 bg-slate-800 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-slate-800 rounded-lg" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 bg-slate-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: identity, isLoading, error } = trpc.player.getMyIdentity.useQuery(undefined, {
    retry: 1,
    staleTime: 30_000,
  });

  if (isLoading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
          <p className="text-red-400 text-sm">Failed to load profile: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <div className="rounded-xl bg-slate-900 border border-slate-700 p-6 text-center">
          <p className="text-slate-400 text-sm">No player profile found. Play a match to create your identity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <PlayerIdentityCard identity={identity} />
    </div>
  );
}
