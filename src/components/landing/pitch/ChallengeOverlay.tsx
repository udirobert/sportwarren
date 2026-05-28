"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Swords, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import type { Formation } from "@/types";
import { PLAY_STYLE_LABELS } from "@/lib/formations";
import type { PlayStyle } from "@/types";

interface ChallengeOverlayProps {
  opponentFormation: Formation;
  opponentStyle?: PlayStyle;
  opponentColor?: string;
  opponentNames?: string[];
  suggestedFormation: Formation;
  onAccept: () => void;
}

/**
 * Shown when a user opens a challenge URL.
 * Displays the opponent's formation and invites them to counter it.
 */
export const ChallengeOverlay: React.FC<ChallengeOverlayProps> = ({
  opponentFormation,
  opponentStyle,
  opponentColor = "#ef4444",
  opponentNames = [],
  suggestedFormation,
  onAccept,
}) => {
  const namedPlayers = opponentNames.filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center py-10 px-6"
    >
      {/* Challenge badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-6"
      >
        <Swords className="w-5 h-5 text-amber-400" />
        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400">
          Formation Challenge
        </span>
        <Swords className="w-5 h-5 text-amber-400 scale-x-[-1]" />
      </motion.div>

      {/* Opponent info */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <p className="text-gray-400 text-xs mb-2">Someone is challenging you with</p>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-4 h-4 rounded-full border-2 border-white/20"
            style={{ backgroundColor: opponentColor }}
          />
          <span className="text-2xl font-mono font-black text-white">
            {opponentFormation}
          </span>
          {opponentStyle && (
            <span className="text-xs text-gray-500 capitalize">
              {PLAY_STYLE_LABELS[opponentStyle]?.name || opponentStyle}
            </span>
          )}
        </div>
        {namedPlayers.length > 0 && (
          <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
            {namedPlayers.slice(0, 5).join(", ")}
            {namedPlayers.length > 5 && ` +${namedPlayers.length - 5} more`}
          </p>
        )}
      </motion.div>

      {/* VS divider */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="relative w-12 h-12 flex items-center justify-center mb-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full" />
        <span className="text-lg font-black text-green-400">vs</span>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <p className="text-gray-400 text-xs">
          Pick your formation and prove it on the pitch
        </p>
        <Button
          onClick={onAccept}
          className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto shadow-lg shadow-green-500/20"
        >
          <Shield className="w-4 h-4" />
          Counter with {suggestedFormation}
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-[10px] text-gray-600">
          Or pick a different formation after accepting
        </p>
      </motion.div>
    </motion.div>
  );
};
