"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Zap, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface NlMatchEvent {
  minute: number;
  text: string;
  type: string;
  player?: string;
  side: "home" | "away";
}

interface NlMatchResult {
  events: NlMatchEvent[];
  homeScore: number;
  awayScore: number;
}

interface NaturalLanguageMatchSimProps {
  formation?: string;
  style?: string;
  names?: string[];
}

const EXAMPLE_COMMANDS = [
  "Argentine winger dribbles past two defenders and curls into the far post",
  "Goalkeeper makes a diving save, then launches a counter-attack",
  "Midfielder threads a through ball to the striker who chips the keeper",
  "Defender makes a last-ditch tackle, wins the ball, and starts a 3-on-2",
];

export const NaturalLanguageMatchSim: React.FC<NaturalLanguageMatchSimProps> = ({
  formation = "4-4-2",
  style = "balanced",
  names = [],
}) => {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NlMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runSim = async () => {
    if (!command.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentMinute(0);
    setIsPlaying(false);
    try {
      const res = await fetch("/api/sim/nl-match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ command, formation, style, names }),
      });
      if (!res.ok) throw new Error("Sim failed");
      const data = (await res.json()) as NlMatchResult;
      setResult(data);
    } catch (e) {
      setError("Could not simulate that scenario. Try a different description.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPlaying || !result) return;
    const durationMs = 60000; // 60 seconds total
    const tickMs = 200; // update every 200ms
    const maxMinute = Math.max(...result.events.map((e) => e.minute), 60);
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += tickMs;
      const progress = Math.min(elapsed / durationMs, 1);
      const minute = Math.round(progress * maxMinute);
      setCurrentMinute(minute);
      if (progress >= 1) {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, tickMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, result]);

  const displayedEvents = result
    ? result.events.filter((e) => e.minute <= currentMinute)
    : [];

  const upcomingEvents = result
    ? result.events.filter((e) => e.minute > currentMinute)
    : [];

  return (
    <div className="mx-auto mb-8 w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-black uppercase tracking-widest text-sky-400">
              Match Simulator
            </h3>
          </div>

          {/* Command input */}
          <div className="space-y-3">
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Describe the action... e.g. 'Argentine winger dribbles past two defenders and curls into the far post'"
              rows={3}
              maxLength={200}
              className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm font-medium text-white placeholder-gray-500 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {EXAMPLE_COMMANDS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setCommand(ex)}
                    className="rounded-md bg-white/[0.05] px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-sky-300 hover:bg-white/[0.08] transition-colors truncate max-w-[140px]"
                    title={ex}
                  >
                    {ex.length > 24 ? ex.slice(0, 24) + "…" : ex}
                  </button>
                ))}
              </div>
              <button
                onClick={runSim}
                disabled={loading || !command.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:scale-[1.02] disabled:opacity-40"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {loading ? "Simulating…" : "Play it out"}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-center text-xs text-red-300">{error}</p>
          )}

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-4"
              >
                {/* Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Timeline
                    </span>
                    <span className="text-xs font-black tabular-nums text-sky-400">
                      {currentMinute}&apos;/60
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                      style={{ width: `${Math.min((currentMinute / 60) * 100, 100)}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>

                  {/* Event markers */}
                  <div className="relative flex h-6 items-center">
                    {result.events.map((ev) => {
                      const pos = (ev.minute / 60) * 100;
                      const shown = ev.minute <= currentMinute;
                      return (
                        <div
                          key={`${ev.minute}-${ev.text}`}
                          className={`absolute h-2 w-2 -translate-x-1/2 rounded-full transition-all ${
                            shown
                              ? ev.side === "home"
                                ? "bg-emerald-400 scale-125"
                                : "bg-rose-400 scale-125"
                              : "bg-white/20 scale-75"
                          }`}
                          style={{ left: `${pos}%` }}
                          title={`${ev.minute}' — ${ev.text}`}
                        />
                      );
                    })}
                  </div>

                  {/* Event feed */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {displayedEvents.map((ev, i) => (
                      <motion.div
                        key={`${ev.minute}-${i}`}
                        initial={{ opacity: 0, x: ev.side === "home" ? -8 : 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-start gap-2 text-xs ${
                          ev.side === "home" ? "text-emerald-200" : "text-rose-200"
                        }`}
                      >
                        <span className="w-7 shrink-0 text-right text-[10px] font-bold text-gray-500 tabular-nums">
                          {ev.minute}&apos;
                        </span>
                        <span className="flex-1">{ev.text}</span>
                        {ev.type === "goal" && (
                          <Zap className="h-3 w-3 shrink-0 text-amber-400" />
                        )}
                      </motion.div>
                    ))}
                    {upcomingEvents.length > 0 && (
                      <div className="flex items-center gap-2 py-1 text-[10px] text-gray-500 italic">
                        <span className="w-7" />
                        <span>{upcomingEvents.length} more events…</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final score */}
                {currentMinute >= 60 && (
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-center flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">You</p>
                      <p className="text-2xl font-black text-emerald-400">{result.homeScore}</p>
                    </div>
                    <div className="px-2 text-xs font-bold text-gray-500">FT</div>
                    <div className="text-center flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Opponent</p>
                      <p className="text-2xl font-black text-rose-400">{result.awayScore}</p>
                    </div>
                  </div>
                )}

                {/* Playback controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentMinute(0);
                      setIsPlaying(true);
                    }}
                    disabled={isPlaying}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-gray-200 hover:bg-white/[0.1] transition-colors disabled:opacity-40"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Replay
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
