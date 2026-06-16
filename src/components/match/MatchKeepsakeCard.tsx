'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Share2,
  Download,
  MessageCircle,
  Send,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildTelegramShareUrl } from '@/lib/telegram/deep-links';
import { buildWhatsAppShareUrl } from '@/lib/share/match-result-card';

interface KeepsakeTeamInfo {
  name: string;
  avatar?: string;
}

interface PlayerStat {
  id: string;
  profile?: {
    user?: {
      name?: string;
    };
  };
  rating?: number;
}

interface MatchKeepsakeCardProps {
  matchId: string;
  homeTeam: KeepsakeTeamInfo;
  awayTeam: KeepsakeTeamInfo;
  homeScore: number;
  awayScore: number;
  date: string;
  /** Optional MOTM highlight */
  motmName?: string;
  motmConsensus?: string;
  /** Optional player highlights */
  playerName?: string;
  playerGoals?: number;
  playerAssists?: number;
  xpGained?: number;
  /** Player stats for the stats grid */
  playerStats?: PlayerStat[];
}

function buildShareText(
  homeName: string,
  awayName: string,
  homeScore: number,
  awayScore: number,
): string {
  const resultEmoji =
    homeScore > awayScore ? '🏆' : homeScore < awayScore ? '😤' : '🤝';
  return `${resultEmoji} ${homeName} ${homeScore} - ${awayScore} ${awayName}\n\nEvery match leaves a mark.\nTrack your football career on SportWarren.`;
}

function getMatchUrl(matchId: string): string {
  if (typeof window === 'undefined') return `https://sportwarren.com/match/${matchId}`;
  return `${window.location.origin}/match/${matchId}`;
}

export function MatchKeepsakeCard({
  matchId,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  date,
  motmName,
  motmConsensus,
  playerName,
  playerGoals,
  playerAssists,
  xpGained,
  playerStats,
}: MatchKeepsakeCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const satoriRef = useRef<HTMLDivElement>(null); // Ref for the card section captured by satori API

  const isWin = homeScore > awayScore;
  const isDraw = homeScore === awayScore;

  const accentColor = isWin
    ? 'from-emerald-500/20 to-emerald-600/10'
    : isDraw
      ? 'from-amber-500/20 to-amber-600/10'
      : 'from-rose-500/20 to-rose-600/10';
  const borderAccent = isWin
    ? 'border-emerald-500/30'
    : isDraw
      ? 'border-amber-500/30'
      : 'border-rose-500/30';
  const scoreColor = isWin
    ? 'text-emerald-400'
    : isDraw
      ? 'text-amber-400'
      : 'text-rose-400';
  const resultLabel = isWin ? 'VICTORY' : isDraw ? 'DRAW' : 'MATCH';

  /**
   * Fetch a pristine PNG from the satori API route, or fall back to
   * client-side html-to-image capture if the server call fails.
   */
  const fetchKeepsakePng = useCallback(async (): Promise<Blob | null> => {
    try {
      const res = await fetch(`/api/keepsake/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeam: homeTeam.name,
          awayTeam: awayTeam.name,
          homeScore,
          awayScore,
          date,
          motmName,
          motmConsensus,
        }),
      });
      if (res.ok) return await res.blob();
    } catch {
      // Fall through to html-to-image
    }

    // Fallback: capture the DOM card via html-to-image
    if (!satoriRef.current) return null;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(satoriRef.current, { quality: 0.95, pixelRatio: 2 });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch {
      return null;
    }
  }, [matchId, homeTeam.name, awayTeam.name, homeScore, awayScore, date, motmName, motmConsensus]);

  const handleDownload = useCallback(async () => {
    setIsSharing(true);
    try {
      const blob = await fetchKeepsakePng();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `match-${homeTeam.name.toLowerCase().replace(/\s+/g, '-')}-${awayTeam.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsSharing(false);
    }
  }, [fetchKeepsakePng, homeTeam.name, awayTeam.name]);

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      const blob = await fetchKeepsakePng();
      const text = buildShareText(homeTeam.name, awayTeam.name, homeScore, awayScore);
      const url = getMatchUrl(matchId);

      if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], 'keepsake.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'keepsake.png', { type: 'image/png' });
        await navigator.share({ title: 'Match Result', text, url, files: [file] });
      } else if (blob) {
        // Fallback: download + copy link
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'match-keepsake.png';
        link.href = blobUrl;
        link.click();
        URL.revokeObjectURL(blobUrl);
        await navigator.clipboard.writeText(`${text}\n${url}`);
      }
    } catch {
      // User cancelled
    } finally {
      setIsSharing(false);
    }
  }, [fetchKeepsakePng, homeTeam, awayTeam, homeScore, awayScore, matchId]);

  const handleWhatsApp = useCallback(() => {
    const text = buildShareText(homeTeam.name, awayTeam.name, homeScore, awayScore);
    window.open(buildWhatsAppShareUrl(text, getMatchUrl(matchId)), '_blank');
  }, [homeTeam, awayTeam, homeScore, awayScore, matchId]);

  const handleTelegram = useCallback(() => {
    const text = buildShareText(homeTeam.name, awayTeam.name, homeScore, awayScore);
    window.open(buildTelegramShareUrl(text, getMatchUrl(matchId)), '_blank');
  }, [homeTeam, awayTeam, homeScore, awayScore, matchId]);

  // ── Pre-reveal teaser ──
  if (!revealed) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 p-8 text-center relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          animate={{ opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute bottom-4 left-4 w-20 h-20 border border-white rounded-full" />
        </motion.div>

        <div className="relative z-10">
          <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">
            This match left a mark
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            {homeTeam.name} {homeScore} – {awayScore} {awayTeam.name} &middot;{' '}
            {date}
          </p>
          <Button
            size="lg"
            onClick={() => setRevealed(true)}
            className="bg-white text-gray-900 hover:bg-gray-100 font-black px-10 h-12 tracking-tight"
          >
            View Keepsake
          </Button>
        </div>
      </Card>
    );
  }

  // ── Post-reveal keepsake card ──
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        {/* The keepsake card — captured for PNG via satori API */}
        <div
          ref={satoriRef}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 ${borderAccent} border p-6`}
        >
          {/* Subtle background ornament */}
          <div
            className={`absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br ${accentColor} blur-3xl pointer-events-none`}
          />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Result label + date */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-black uppercase tracking-[0.25em] ${scoreColor}`}
              >
                {resultLabel}
              </span>
              <span className="text-[10px] tracking-wider text-gray-500 font-mono">
                {date}
              </span>
            </div>

            {/* Score — the hero element */}
            <div className="flex items-center justify-center gap-6 py-1">
              <div className="flex-1 text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide truncate max-w-[120px] ml-auto">
                  {homeTeam.name}
                </p>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-white tabular-nums tracking-tight">
                  {homeScore}
                </span>
                <span className="text-xl text-gray-600 font-bold">–</span>
                <span className="text-5xl font-black text-white tabular-nums tracking-tight">
                  {awayScore}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide truncate max-w-[120px]">
                  {awayTeam.name}
                </p>
              </div>
            </div>

            {/* MOTM highlight */}
            {motmName && (
              <div className="flex items-center justify-center gap-2">
                <Trophy className={`w-4 h-4 ${scoreColor}`} />
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  {motmName}
                </span>
                {motmConsensus && (
                  <span className="text-[10px] text-gray-500 font-medium">
                    {motmConsensus} consensus
                  </span>
                )}
              </div>
            )}

            {/* Player highlight */}
            {(playerName || playerGoals !== undefined || playerAssists !== undefined || xpGained !== undefined) && (
              <div className="flex items-center justify-center gap-4 pt-3 border-t border-white/5">
                {playerName && (
                  <span className="text-xs font-bold text-white">{playerName}</span>
                )}
                {playerGoals !== undefined && playerGoals > 0 && (
                  <span className="text-[10px] font-semibold text-gray-400">
                    {playerGoals} goal{playerGoals > 1 ? 's' : ''}
                  </span>
                )}
                {playerAssists !== undefined && playerAssists > 0 && (
                  <span className="text-[10px] font-semibold text-gray-400">
                    {playerAssists} assist{playerAssists > 1 ? 's' : ''}
                  </span>
                )}
                {xpGained !== undefined && xpGained > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-400">
                    +{xpGained} XP
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] font-black tracking-[0.3em] text-gray-600 uppercase">
                SportWarren
              </span>
              <span className="text-[9px] text-gray-600 italic tracking-wide">
                Every match leaves a mark
              </span>
            </div>
          </div>
        </div>

        {/* Player stats grid (from the original reveal ceremony) */}
        {playerStats && playerStats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {playerStats.slice(0, 4).map((stats, idx) => (
              <motion.div
                key={stats.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card className="bg-gray-900 border-white/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center font-bold text-gray-500 text-xs">
                      {stats.profile?.user?.name?.[0] || 'P'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {stats.profile?.user?.name}
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase">
                        {stats.rating ? `Rating: ${stats.rating.toFixed(1)}` : 'No rating'}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Share actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 gap-2"
          >
            <Share2 className="w-4 h-4" />
            {isSharing ? 'Preparing…' : 'Share Keepsake'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            disabled={isSharing}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Save
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleWhatsApp}
            className="gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 border-emerald-600/30"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            WhatsApp
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTelegram}
            className="gap-2 bg-blue-600/10 hover:bg-blue-600/20 border-blue-600/30"
          >
            <Send className="w-4 h-4 text-blue-400" />
            Telegram
          </Button>
        </div>

        {/* Link to full ratings */}
        <div className="text-center pt-1">
          <a
            href={`/match/${matchId}/rate`}
            aria-label="View full match performance report"
            className="text-[10px] font-bold text-gray-500 hover:text-gray-300 transition-colors underline decoration-dotted"
          >
            View full performance report &rarr;
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
