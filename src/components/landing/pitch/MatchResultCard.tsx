"use client";

import React, { forwardRef, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Trophy, RotateCcw, Share2, Swords } from "lucide-react";
import { motion } from "framer-motion";
import type { Formation } from "@/types";

export interface MatchResultData {
  homeScore: number;
  awayScore: number;
  homeFormation: Formation;
  awayFormation: Formation;
  homeColor: string;
  awayColor: string;
  homeNames: string[];
  awayNames: string[];
  events: Array<{ time: string; text: string; type: "goal" | "action" | "incident" }>;
  possession: { home: number; away: number };
}

interface MatchResultCardProps {
  result: MatchResultData;
  onRematch: () => void;
  onShare: () => void;
  onNewChallenge: () => void;
}

/**
 * Displays the result of a simulation between two formations.
 * Shown after a counter-play simulation completes.
 */
export const MatchResultCard: React.FC<MatchResultCardProps> = ({
  result,
  onRematch,
  onShare,
  onNewChallenge,
}) => {
  const isDraw = result.homeScore === result.awayScore;
  const homeWon = result.homeScore > result.awayScore;
  const winner = homeWon ? "home" : "away";

  const goalEvents = useMemo(
    () => result.events.filter((e) => e.type === "goal"),
    [result.events]
  );

  const resultText = isDraw
    ? "Draw"
    : homeWon
    ? "You Win!"
    : "They Win!";

  const resultColor = isDraw
    ? "text-amber-400"
    : homeWon
    ? "text-green-400"
    : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 py-3 border-b border-white/[0.06]">
          <Swords className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
            Match Result
          </span>
        </div>

        {/* Scoreboard */}
        <div className="py-6 px-4">
          <div className="flex items-center justify-center gap-6">
            {/* Home */}
            <div className="text-center flex-1">
              <div
                className="w-8 h-8 rounded-full mx-auto mb-2 border-2"
                style={{
                  backgroundColor: result.homeColor,
                  borderColor: homeWon ? "#4ade80" : "rgba(255,255,255,0.1)",
                }}
              />
              <p className="text-[10px] font-mono text-gray-400 mb-1">
                {result.homeFormation}
              </p>
              <p className="text-[10px] text-gray-500">You</p>
            </div>

            {/* Score */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="flex items-center gap-2"
              >
                <span className={`text-4xl font-black tabular-nums ${homeWon ? "text-green-400" : "text-gray-300"}`}>
                  {result.homeScore}
                </span>
                <span className="text-xl text-gray-600">-</span>
                <span className={`text-4xl font-black tabular-nums ${!homeWon && !isDraw ? "text-red-400" : "text-gray-300"}`}>
                  {result.awayScore}
                </span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`text-sm font-black uppercase tracking-wider mt-2 ${resultColor}`}
              >
                {resultText}
              </motion.p>
            </div>

            {/* Away */}
            <div className="text-center flex-1">
              <div
                className="w-8 h-8 rounded-full mx-auto mb-2 border-2"
                style={{
                  backgroundColor: result.awayColor,
                  borderColor: !homeWon && !isDraw ? "#f87171" : "rgba(255,255,255,0.1)",
                }}
              />
              <p className="text-[10px] font-mono text-gray-400 mb-1">
                {result.awayFormation}
              </p>
              <p className="text-[10px] text-gray-500">Opponent</p>
            </div>
          </div>

          {/* Possession bar */}
          <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500">
            <span>{result.possession.home}%</span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-500/60 rounded-l-full"
                style={{ width: `${result.possession.home}%` }}
              />
              <div
                className="h-full bg-red-500/60 rounded-r-full"
                style={{ width: `${result.possession.away}%` }}
              />
            </div>
            <span>{result.possession.away}%</span>
          </div>
        </div>

        {/* Goal events */}
        {goalEvents.length > 0 && (
          <div className="px-4 pb-3 border-t border-white/[0.06] pt-3">
            <div className="space-y-1">
              {goalEvents.map((evt, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="text-gray-600 w-8 text-right tabular-nums">{evt.time}</span>
                  <span className="text-green-400">&#9917;</span>
                  <span className="text-gray-300">{evt.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 p-4 border-t border-white/[0.06]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRematch}
            className="flex-1 text-gray-400 hover:text-white hover:bg-white/10 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Rematch
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="flex-1 text-gray-400 hover:text-white hover:bg-white/10 text-xs"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Share Result
          </Button>
          <Button
            size="sm"
            onClick={onNewChallenge}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold"
          >
            <Trophy className="w-3.5 h-3.5 mr-1.5" />
            Challenge Back
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
