"use client";

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Activity, Heart, TrendingUp, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc-client';
import { useJourneyState } from '@/hooks/useJourneyState';
import { useSquadDetails } from '@/hooks/squad/useSquad';
import { isPendingMatchStatus, isSettledMatchStatus } from '@/lib/match/summary';
import { Avatar } from '@/components/ui/Avatar';

interface SquadDynamicsProps {
  squadId?: string;
}

function getCoverageTone(value: number) {
  if (value >= 80) return 'text-green-600';
  if (value >= 50) return 'text-amber-600';
  return 'text-red-500';
}

export const SquadDynamics: React.FC<SquadDynamicsProps> = ({ squadId }) => {
  const { hasAccount, isGuest, isVerified } = useJourneyState();
  const { squad, members, loading: membersLoading } = useSquadDetails(squadId);
  const { data: tactics, isLoading: tacticsLoading } = trpc.squad.getTactics.useQuery(
    { squadId: squadId || '' },
    { enabled: !!squadId && isVerified, staleTime: 30 * 1000 }
  );
  const { data: rawMatchData, isLoading: matchesLoading } = trpc.match.list.useQuery(
    { squadId, limit: 8 },
    { enabled: !!squadId, staleTime: 30 * 1000 }
  );
  const simpleMatchData = rawMatchData as { matches?: Array<{ status?: string | null; matchDate?: string | null }> } | undefined;

  const matches = useMemo(
    () => simpleMatchData?.matches ?? [],
    [simpleMatchData]
  );
  const settledMatches = useMemo(
    () => matches.filter((match) => isSettledMatchStatus(match.status)),
    [matches]
  );
  const pendingMatches = useMemo(
    () => matches.filter((match) => isPendingMatchStatus(match.status)),
    [matches]
  );

  const leadershipGroup = members.filter((member) => member.role === 'captain' || member.role === 'vice_captain');
  const topScorer = [...members]
    .filter((member) => member.stats)
    .sort((left, right) => (right.stats?.goals ?? 0) - (left.stats?.goals ?? 0))[0];

  const rotationCoverage = Math.min(100, Math.round((members.length / 11) * 100));
  const recentSettledMatches = settledMatches.filter((match) => {
    if (!match.matchDate) {
      return false;
    }

    const playedAt = new Date(match.matchDate);
    return !Number.isNaN(playedAt.getTime()) && (Date.now() - playedAt.getTime()) <= 1000 * 60 * 60 * 24 * 30;
  });
  const matchRhythm = Math.min(100, recentSettledMatches.length * 25);
  const leadershipCoverage = Math.min(100, leadershipGroup.length * 50);
  const loading = Boolean(squadId) && (membersLoading || tacticsLoading || matchesLoading);

  if (!hasAccount || isGuest) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-gray-100 p-2">
            <Activity className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Squad Dynamics</h2>
            <p className="mt-1 text-sm text-gray-600">
              Squad chemistry becomes real once you are running an actual roster with results, roles, and tactics to manage.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!squadId) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-gray-100 p-2">
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Squad Dynamics</h2>
            <p className="mt-1 text-sm text-gray-600">
              Create or join a squad first. This surface only matters once there is a real roster to evaluate.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (loading && !squad) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-5 w-40 rounded bg-gray-100" />
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-20 rounded-xl bg-gray-100" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-green-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-900">Squad Dynamics</h2>
        </div>
        <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-100 rounded-full">
          <span className="text-[10px] font-black text-green-700 uppercase">
            {tactics?.formation || 'Shape unset'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Zap className="w-3 h-3 text-orange-500" />
            <span className="text-xs font-bold text-gray-500 uppercase">Rotation</span>
          </div>
          <div className={`text-xl font-black ${getCoverageTone(rotationCoverage)}`}>{rotationCoverage}%</div>
          <div className="w-full bg-gray-100 h-1 rounded-full mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rotationCoverage}%` }}
              className="bg-orange-500 h-1 rounded-full"
            />
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Heart className="w-3 h-3 text-red-500" />
            <span className="text-xs font-bold text-gray-500 uppercase">Rhythm</span>
          </div>
          <div className={`text-xl font-black ${getCoverageTone(matchRhythm)}`}>{matchRhythm}%</div>
          <div className="w-full bg-gray-100 h-1 rounded-full mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${matchRhythm}%` }}
              className="bg-red-500 h-1 rounded-full"
            />
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-bold text-gray-500 uppercase">Leadership</span>
          </div>
          <div className={`text-xl font-black ${getCoverageTone(leadershipCoverage)}`}>{leadershipCoverage}%</div>
          <div className="w-full bg-gray-100 h-1 rounded-full mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${leadershipCoverage}%` }}
              className="bg-blue-500 h-1 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-100 pt-3">
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Team Report</span>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700 font-medium">Active roster</span>
          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
            {members.length} members
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700 font-medium">Verified results</span>
          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
            {settledMatches.length}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700 font-medium">Pending reviews</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
            pendingMatches.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100'
          }`}>
            {pendingMatches.length}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700 font-medium">Top scorer</span>
          <div className="flex items-center gap-1.5 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
            {topScorer ? (
              <>
                <Avatar
                  src={topScorer.avatar || undefined}
                  name={topScorer.name}
                  size="xs"
                />
                <span>{topScorer.name} • {topScorer.stats?.goals ?? 0}G</span>
              </>
            ) : (
              'No goals logged yet'
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
