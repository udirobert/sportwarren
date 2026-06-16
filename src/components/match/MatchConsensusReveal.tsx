'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerStat {
  id: string;
  profile?: {
    user?: {
      name?: string;
    };
  };
  rating?: number;
}

interface MatchConsensusRevealProps {
  homeName: string;
  awayName: string;
  matchId: string;
  playerStats: PlayerStat[];
}

export function MatchConsensusReveal({
  homeName,
  awayName,
  matchId,
  playerStats,
}: MatchConsensusRevealProps) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <Card className="bg-gradient-to-br from-indigo-900 to-black border-indigo-500/50 p-8 text-center relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-indigo-500/10"
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-white mb-2 italic uppercase">Consensus Complete</h3>
        <p className="text-indigo-200/70 mb-6 text-sm">
          Peer ratings are in. The squad's tactical DNA has evolved.
        </p>
        <Button
          size="lg"
          className="bg-white text-indigo-900 hover:bg-indigo-100 font-black px-12 h-14 text-xl tracking-tighter rounded-none skew-x-[-12deg]"
          onClick={() => setRevealed(true)}
        >
          <span className="skew-x-[12deg]">REVEAL RESULTS</span>
        </Button>
      </Card>
    );
  }

  // Hardcoded MOTM name from original — kept for now; will be dynamic in P3.2
  const motmName = 'KIPCHOGE';
  const motmConsensus = '78%';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* MOTM Celebration */}
        <Card className="bg-yellow-500 p-1 border-none rounded-none skew-x-[-3deg]">
          <div className="bg-black p-6 flex items-center justify-between skew-x-[3deg]">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Trophy className="w-12 h-12 text-yellow-500" />
                <motion.div
                  className="absolute inset-0 bg-yellow-400/20 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">
                  Match Excellence
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase leading-none">
                  Man of the Match
                </h3>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white italic">{motmName}</div>
              <div className="text-xs text-yellow-500 font-bold uppercase">{motmConsensus} Consensus</div>
            </div>
          </div>
        </Card>

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playerStats.slice(0, 4).map((stats, idx) => (
            <motion.div
              key={stats.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-gray-900 border-white/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center font-bold text-gray-500">
                    {stats.profile?.user?.name?.[0] || 'P'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{stats.profile?.user?.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase">
                      Rating: {(stats.rating || 7.5).toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase">Passing</div>
                    <div className="text-xs font-bold text-green-400">+2 🔼</div>
                  </div>
                  <div className="h-8 w-[1px] bg-white/5" />
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase">Pace</div>
                    <div className="text-xs font-bold text-white">74</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href={`/match/${matchId}/rate`}>
            <Button variant="secondary" size="sm">
              View Full Performance Report
            </Button>
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
