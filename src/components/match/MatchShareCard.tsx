'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  shareMatchResult,
  buildWhatsAppShareUrl,
  buildTwitterShareUrl,
  buildShareText,
  buildShareUrl,
  type ShareableMatchData,
} from '@/lib/share/match-result-card';

interface MatchShareCardProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  playerName?: string;
  playerGoals?: number;
  playerAssists?: number;
  xpGained?: number;
}

export function MatchShareCard({
  matchId,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  date,
  playerName,
  playerGoals,
  playerAssists,
  xpGained,
}: MatchShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const matchData: ShareableMatchData = useMemo(() => ({
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    date,
    playerName,
    playerGoals,
    playerAssists,
    xpGained,
  }), [homeTeam, awayTeam, homeScore, awayScore, date, playerName, playerGoals, playerAssists, xpGained]);

  const isWin = homeScore > awayScore;
  const isDraw = homeScore === awayScore;
  const resultLabel = isWin ? 'VICTORY' : isDraw ? 'DRAW' : 'DEFEAT';
  const resultGradient = isWin
    ? 'from-green-600 to-emerald-700'
    : isDraw
      ? 'from-gray-600 to-gray-700'
      : 'from-red-600 to-rose-700';

  const handleShare = useCallback(async () => {
    await shareMatchResult(matchData, matchId, cardRef.current);
  }, [matchData, matchId]);

  const handleWhatsApp = useCallback(() => {
    const text = buildShareText(matchData);
    const url = buildShareUrl(matchId);
    window.open(buildWhatsAppShareUrl(text, url), '_blank');
  }, [matchData, matchId]);

  const handleTwitter = useCallback(() => {
    const text = buildShareText(matchData);
    const url = buildShareUrl(matchId);
    window.open(buildTwitterShareUrl(text, url), '_blank');
  }, [matchData, matchId]);

  return (
    <div className="space-y-3">
      {/* Shareable card (captured as image) */}
      <div
        ref={cardRef}
        className={`bg-gradient-to-br ${resultGradient} rounded-2xl p-6 text-white relative overflow-hidden`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute bottom-4 left-4 w-20 h-20 border border-white rounded-full" />
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-3">
            {resultLabel}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 text-left">
              <p className="text-sm font-bold uppercase tracking-wide truncate">{homeTeam}</p>
            </div>
            <div className="flex items-center gap-3 mx-4">
              <span className="text-4xl font-black tabular-nums">{homeScore}</span>
              <span className="text-lg text-white/50 font-bold">-</span>
              <span className="text-4xl font-black tabular-nums">{awayScore}</span>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-bold uppercase tracking-wide truncate">{awayTeam}</p>
            </div>
          </div>

          {(playerGoals !== undefined || playerAssists !== undefined || xpGained !== undefined) && (
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wide text-white/80 border-t border-white/20 pt-3">
              {playerName && <span>{playerName}</span>}
              {playerGoals !== undefined && playerGoals > 0 && (
                <span>{playerGoals} Goal{playerGoals > 1 ? 's' : ''}</span>
              )}
              {playerAssists !== undefined && playerAssists > 0 && (
                <span>{playerAssists} Assist{playerAssists > 1 ? 's' : ''}</span>
              )}
              {xpGained !== undefined && xpGained > 0 && (
                <span className="ml-auto">+{xpGained} XP</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 text-[10px] text-white/50 font-medium">
            <span>{date}</span>
            <span className="font-black tracking-wider">SPORTWARREN</span>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleShare}
          className="flex-1 gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Result
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleWhatsApp}
          className="gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTwitter}
          className="gap-2 hidden sm:flex"
        >
          Post
        </Button>
      </div>
    </div>
  );
}
