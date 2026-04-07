'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Minus, Trophy, Zap, MessageSquare, User, X } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { Skeleton } from '@/components/ui/Skeleton';

interface QuickLogWidgetProps {
  squadId: string;
  homeTeam: string;
  awayTeam: string;
  onLog: (data: any) => void;
}

export const QuickLogWidget: React.FC<QuickLogWidgetProps> = ({
  squadId,
  homeTeam,
  awayTeam,
  onLog
}) => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
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
    setIsSubmitting(true);
    try {
      await onLog({
        homeScore,
        awayScore,
        homeTeam,
        awayTeam,
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
            <div className="text-xs font-bold text-gray-500 uppercase truncate max-w-full">{awayTeam}</div>
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
              teammates?.map(player => (
                <button
                  key={player.id}
                  onClick={() => toggleScorer(player.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                    selectedScorers.includes(player.id)
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    {player.avatar ? (
                      <img src={player.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3 h-3 text-gray-400 mx-auto mt-0.5" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold truncate max-w-[60px]">{player.name.split(' ')[0]}</span>
                </button>
              ))
            )}
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:border-gray-300 transition-all">
              <Plus className="w-3 h-3" />
              <span className="text-[10px] font-bold">Other</span>
            </button>
          </div>
        </div>

        <Button 
          onClick={handleLog} 
          disabled={isSubmitting}
          className="w-full h-10 text-sm font-bold shadow-md shadow-emerald-500/20"
        >
          {isSubmitting ? 'Logging...' : 'Log Result'}
        </Button>
      </div>
    </Card>
  );
};
