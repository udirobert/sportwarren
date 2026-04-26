'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Minus, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { buildAvatarPresentationFromSummary } from '@/lib/avatar/adapters';

interface QuickLogOpponent {
  id: string;
  name: string;
}

interface QuickLogPayload {
  awaySquadId: string;
  awayTeam: string;
  awayScore: number;
  homeScore: number;
  homeTeam: string;
  scorerIds: string[];
  status: 'pending';
  timestamp: Date;
}

interface QuickLogTeammate {
  id: string;
  name: string;
  avatar?: string | null;
  position?: string | null;
  level?: number;
  totalMatches?: number;
  totalGoals?: number;
  totalAssists?: number;
  reputationScore?: number;
}

interface QuickLogWidgetProps {
  squadId: string;
  homeTeam: string;
  opponents: QuickLogOpponent[];
  onLog: (data: QuickLogPayload) => Promise<void>;
}

export const QuickLogWidget: React.FC<QuickLogWidgetProps> = ({
  squadId,
  homeTeam,
  opponents,
  onLog
}) => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [selectedOpponentId, setSelectedOpponentId] = useState('');
  const [selectedScorers, setSelectedScorers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: teammates, isLoading } = trpc.squad.getTopTeammates.useQuery({
    squadId,
    limit: 5
  });

  const toggleScorer = (userId: string) => {
    setSelectedScorers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleLog = async () => {
    const selectedOpponent = opponents.find((opponent) => opponent.id === selectedOpponentId);
    if (!selectedOpponent) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onLog({
        awaySquadId: selectedOpponent.id,
        homeScore,
        awayScore,
        homeTeam,
        awayTeam: selectedOpponent.name,
        scorerIds: selectedScorers,
        timestamp: new Date(),
        status: 'pending'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-emerald-500/30 bg-gradient-to-br from-white to-emerald-50/50">
      <div className="absolute top-0 right-0 p-2">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-white uppercase tracking-tighter">
          <Zap className="w-2.5 h-2.5" />
          Quick Log
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Opponent</div>
          <select
            value={selectedOpponentId}
            onChange={(event) => setSelectedOpponentId(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-emerald-400 focus:outline-none"
            disabled={isSubmitting || opponents.length === 0}
          >
            <option value="">
              {opponents.length > 0 ? 'Select opponent squad' : 'No opponents available'}
            </option>
            {opponents.map((opponent) => (
              <option key={opponent.id} value={opponent.id}>
                {opponent.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="text-xs font-bold text-gray-500 uppercase truncate max-w-full">{homeTeam}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHomeScore(s => Math.max(0, s - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200 transition-colors"
              >-</button>
              <span className="text-3xl font-black text-emerald-600 w-8 text-center">{homeScore}</span>
              <button
                onClick={() => setHomeScore(s => s + 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200 transition-colors"
              >+</button>
            </div>
          </div>

          <div className="text-sm font-black text-gray-300">VS</div>

          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="text-xs font-bold text-gray-500 uppercase truncate max-w-full">
              {opponents.find((opponent) => opponent.id === selectedOpponentId)?.name || 'Opponent'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAwayScore(s => Math.max(0, s - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200 transition-colors"
              >-</button>
              <span className="text-3xl font-black text-red-600 w-8 text-center">{awayScore}</span>
              <button
                onClick={() => setAwayScore(s => s + 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200 transition-colors"
              >+</button>
            </div>
          </div>
        </div>

        {/* Scorer Selection - Friends Context */}
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Who scored?</div>
          <div className="flex flex-wrap gap-2">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-20 rounded-lg" />)
            ) : (
              teammates?.map((player: QuickLogTeammate) => {
                const avatarPresentation = buildAvatarPresentationFromSummary({
                  id: player.id,
                  name: player.name,
                  avatar: player.avatar,
                  position: player.position,
                  level: player.level,
                  totalMatches: player.totalMatches,
                  totalGoals: player.totalGoals,
                  totalAssists: player.totalAssists,
                  reputationScore: player.reputationScore,
                });

                return (
                <button
                  key={player.id}
                  onClick={() => toggleScorer(player.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                    selectedScorers.includes(player.id)
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200'
                  }`}
                >
                  <PlayerAvatar
                    presentation={avatarPresentation}
                    size="xs"
                    showBadge={false}
                    showCaptainMarker={false}
                    showSquadAccent={false}
                    showStateFx={false}
                  />
                  <span className="text-[10px] font-bold truncate max-w-[60px]">{player.name.split(' ')[0]}</span>
                </button>
                );
              })
            )}
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:border-gray-300 transition-all">
              <Plus className="w-3 h-3" />
              <span className="text-[10px] font-bold">Other</span>
            </button>
          </div>
        </div>

        <Button
          onClick={handleLog}
          disabled={isSubmitting || !selectedOpponentId}
          className="w-full h-10 text-sm font-bold shadow-md shadow-emerald-500/20"
        >
          {isSubmitting ? 'Logging...' : 'Log Result'}
        </Button>
      </div>
    </Card>
  );
};
