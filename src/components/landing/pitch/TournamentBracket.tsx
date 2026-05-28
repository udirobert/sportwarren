"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BracketMatch {
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  homeColor: string;
  awayColor: string;
  isWinner: (side: "home" | "away") => boolean;
}

interface TournamentBracketProps {
  name: string;
  type: "squad" | "individual";
  quarterFinals: BracketMatch[];
  semiFinals: BracketMatch[];
  final: BracketMatch | null;
  champion?: string;
  onShare?: () => void;
}

function MatchCard({ match, index }: { match: BracketMatch; index: number }) {
  const played = match.homeScore !== null && match.awayScore !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-lg overflow-hidden border border-white/10 bg-slate-800/50 backdrop-blur-sm"
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 text-sm ${
          match.isWinner("home") ? "bg-emerald-900/40" : ""
        }`}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: match.homeColor }}
        />
        <span className="flex-1 truncate">{match.homeName}</span>
        <span className="font-mono font-bold">
          {played ? match.homeScore : "-"}
        </span>
      </div>
      <div className="border-t border-white/5" />
      <div
        className={`flex items-center gap-2 px-3 py-2 text-sm ${
          match.isWinner("away") ? "bg-emerald-900/40" : ""
        }`}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: match.awayColor }}
        />
        <span className="flex-1 truncate">{match.awayName}</span>
        <span className="font-mono font-bold">
          {played ? match.awayScore : "-"}
        </span>
      </div>
    </motion.div>
  );
}

export default function TournamentBracket({
  name,
  type,
  quarterFinals,
  semiFinals,
  final: finalMatch,
  champion,
  onShare,
}: TournamentBracketProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} — Tournament Bracket`,
          text: champion
            ? `🏆 ${champion} won the ${name} tournament!`
            : `Check out the ${name} bracket!`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShowShareMenu(true);
      setTimeout(() => setShowShareMenu(false), 2000);
    }
    onShare?.();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">{champion ? "🏆" : "⚽"}</div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">{name}</h3>
          <p className="text-xs text-slate-400">
            {type === "squad" ? "Squad Tournament" : "Individual Tournament"}
          </p>
        </div>
        <button
          onClick={handleShare}
          className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
        >
          {showShareMenu ? "Copied!" : "Share"}
        </button>
      </div>

      {/* Bracket */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4">
        {/* Quarter-finals */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Quarter-finals
          </div>
          {quarterFinals.map((match, i) => (
            <MatchCard key={`qf-${i}`} match={match} index={i} />
          ))}
        </div>

        {/* Connector lines */}
        <div className="flex flex-col gap-3 justify-around h-full">
          {Array.from({ length: Math.ceil(quarterFinals.length / 2) }).map(
            (_, i) => (
              <div
                key={`conn-${i}`}
                className="w-8 border-t border-slate-600"
                style={{ marginTop: i === 0 ? 0 : -12 }}
              />
            )
          )}
        </div>

        {/* Semi-finals */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Semi-finals
          </div>
          {semiFinals.map((match, i) => (
            <MatchCard key={`sf-${i}`} match={match} index={i + 4} />
          ))}
        </div>

        {/* Connector */}
        <div className="flex flex-col justify-center">
          <div className="w-8 border-t border-slate-600" />
        </div>

        {/* Final */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          <div className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold mb-1">
            Final
          </div>
          {finalMatch ? (
            <MatchCard match={finalMatch} index={8} />
          ) : (
            <div className="rounded-lg border border-dashed border-slate-600 p-4 text-center text-xs text-slate-500">
              TBD
            </div>
          )}
        </div>

        {/* Champion */}
        {champion && (
          <>
            <div className="flex flex-col justify-center">
              <div className="w-8 border-t border-amber-500" />
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="flex flex-col items-center gap-2"
            >
              <div className="text-4xl">🏆</div>
              <div className="text-sm font-bold text-amber-400">{champion}</div>
              <div className="text-[10px] text-slate-500">Champion</div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
