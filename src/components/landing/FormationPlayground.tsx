"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PitchCanvas } from "@/components/squad/PitchCanvas";
import { MatchEnginePreview } from "@/components/dashboard/MatchEnginePreview";
import { usePitchPersonalization } from "@/hooks/pitch/usePitchPersonalization";
import { useSquadDetails } from "@/hooks/squad/useSquad";
import { useActiveSquad } from "@/contexts/ActiveSquadContext";
import { FORMATIONS, getFormationsBySquadSize, getDefaultFormationForSize, PLAY_STYLE_LABELS } from "@/lib/formations";
import { POSITIONS_BY_SQUAD_SIZE, DEFAULT_PLAYER_NAMES, SQUAD_SIZES, PLAY_STYLES, SQUAD_COLORS } from "@/lib/pitch.constants";
import { decodeFormationFromUrl, syncStateToUrl, suggestCounterFormation, encodeChallengeUrl } from "@/lib/pitch/shareUrl";
import type { PlaygroundFlow } from "@/lib/pitch/shareUrl";
import type { Formation, PlayStyle, SquadSize } from "@/types";
import {
  Play, Settings2, ChevronLeft, ChevronRight,
  Palette, Users, Zap, Swords,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackFeatureUsed } from "@/lib/analytics";
import { ExportPanel } from "@/components/landing/pitch/ExportPanel";
import { ChallengeOverlay } from "@/components/landing/pitch/ChallengeOverlay";
import { MatchResultCard, type MatchResultData } from "@/components/landing/pitch/MatchResultCard";

type PlaygroundMode = "tactics" | "simulation";

interface OpponentState {
  formation: Formation;
  style: PlayStyle;
  color: string;
  names: string[];
}

export const FormationPlayground: React.FC = () => {
  // ── Read initial state from URL ──
  const urlState = useMemo(() => {
    if (typeof window === "undefined") return {};
    return decodeFormationFromUrl(new URLSearchParams(window.location.search));
  }, []);

  // ── Challenge flow ──
  const [flow, setFlow] = useState<PlaygroundFlow>(urlState.flow || "build");
  const [opponent, setOpponent] = useState<OpponentState | null>(
    urlState.vs_formation
      ? { formation: urlState.vs_formation, style: (urlState.vs_style as PlayStyle) || "balanced", color: urlState.vs_color || "#ef4444", names: urlState.vs_names || [] }
      : null
  );
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // ── Shared tactic state (initialized from URL where available) ──
  const [squadSize, setSquadSize] = useState<SquadSize>((urlState.size as SquadSize) || 11);
  const [formation, setFormation] = useState<Formation>((urlState.formation as Formation) || "4-4-2");
  const [playStyle, setPlayStyle] = useState<PlayStyle>((urlState.style as PlayStyle) || "balanced");
  const [primaryColor, setPrimaryColor] = useState(urlState.color || "#10b981");
  const [pitchTheme, setPitchTheme] = useState<'premier-league' | 'sunday-league' | 'night-match' | 'easy-on-eyes'>('premier-league');
  const [enablePlayerMovement, setEnablePlayerMovement] = useState(false);
  const [drawArrows, setDrawArrows] = useState(false);
  const [arrows, setArrows] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);
  const [drawingArrow, setDrawingArrow] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // ── Mode toggle ──
  const [mode, setMode] = useState<PlaygroundMode>("tactics");

  // ── UI state ──

  // ── Refs ──
  const pitchRef = useRef<HTMLDivElement>(null);

  // ── Personalization hook (shared across modes) ──
  const personalization = usePitchPersonalization(formation);

  // ── Real squad data (when logged in) ──
  const { activeSquadId } = useActiveSquad();
  const { members: realMembers } = useSquadDetails(activeSquadId);
  const hasRealMembers = realMembers.length > 0;

  // ── Inject URL names on first mount ──
  const urlNamesApplied = useRef(false);
  useEffect(() => {
    if (urlNamesApplied.current) return;
    if (urlState.names && urlState.names.length > 0) {
      personalization.setNames(urlState.names);
      personalization.setShowNames(true);
    }
    urlNamesApplied.current = true;
  }, [urlState.names, personalization]);

  // ── Sync state to URL on change (skip during challenge/result) ──
  useEffect(() => {
    if (flow === "challenge_received" || flow === "result") return;
    syncStateToUrl({
      formation,
      style: playStyle,
      color: primaryColor,
      size: squadSize,
      names: personalization.names,
    });
  }, [formation, playStyle, primaryColor, squadSize, personalization.names, flow]);

  // ── Derived ──
  const formationList = useMemo(
    () => getFormationsBySquadSize(squadSize),
    [squadSize]
  );
  const formationIndex = useMemo(
    () => formationList.indexOf(formation),
    [formationList, formation]
  );

  const suggestedCounter = useMemo(
    () => (opponent ? suggestCounterFormation(opponent.formation) : "4-3-3"),
    [opponent]
  );

  // ── Challenge flow handlers ──
  const handleAcceptChallenge = useCallback(() => {
    setFormation(suggestedCounter);
    setFlow("counter_setup");
    setMode("simulation");
    trackFeatureUsed("challenge_accepted", { opponent: opponent?.formation, counter: suggestedCounter });
  }, [suggestedCounter, opponent]);

  const handleSimResult = useCallback(
    (result: { homeScore: number; awayScore: number; events: Array<{ time: string; text: string; type: string }> }) => {
      if (!opponent) return;
      const goalEvents = result.events.filter((e) => e.type === "goal");
      setMatchResult({
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        homeFormation: formation,
        awayFormation: opponent.formation,
        homeColor: primaryColor,
        awayColor: opponent.color,
        homeNames: personalization.names.filter(Boolean),
        awayNames: opponent.names,
        events: (goalEvents.length > 0 ? goalEvents : result.events.slice(-5)).map((e) => ({
          time: e.time,
          text: e.text,
          type: e.type as "goal" | "action" | "incident",
        })),
        possession: {
          home: 50 + Math.floor(Math.random() * 20) - 10,
          away: 50 + Math.floor(Math.random() * 20) - 10,
        },
      });
      setFlow("result");
      trackFeatureUsed("challenge_result", {
        home: formation,
        away: opponent.formation,
        score: `${result.homeScore}-${result.awayScore}`,
      });
    },
    [opponent, formation, primaryColor, personalization.names]
  );

  const handleRematch = useCallback(() => {
    setMatchResult(null);
    setFlow("counter_setup");
    setMode("simulation");
  }, []);

  const handleChallengeBack = useCallback(() => {
    if (!opponent) return;
    const url = encodeChallengeUrl(
      { formation, style: playStyle, color: primaryColor, size: squadSize, names: personalization.names },
      { formation: opponent.formation, style: opponent.style, color: opponent.color, names: opponent.names },
    );
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).catch(() => {});
    trackFeatureUsed("challenge_back", { formation, vs: opponent.formation });
    setFlow("build");
    setOpponent(null);
    setMatchResult(null);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 3000);
  }, [opponent, formation, playStyle, primaryColor, squadSize, personalization.names]);

  const handleNewChallenge = useCallback(() => {
    setFlow("build");
    setOpponent(null);
    setMatchResult(null);
  }, []);

  // ── Formation navigation ──
  const nextFormation = useCallback(() => {
    if (!formationList.length) return;
    const next =
      formationList[(Math.max(0, formationIndex) + 1) % formationList.length];
    setFormation(next);
    trackFeatureUsed("tactics_preview_change", {
      type: "formation",
      value: next,
    });
  }, [formationList, formationIndex]);

  const prevFormation = useCallback(() => {
    if (!formationList.length) return;
    const prev =
      formationList[
        (Math.max(0, formationIndex) - 1 + formationList.length) %
          formationList.length
      ];
    setFormation(prev);
    trackFeatureUsed("tactics_preview_change", {
      type: "formation",
      value: prev,
    });
  }, [formationList, formationIndex]);

  const handleSquadSizeChange = useCallback(
    (newSize: SquadSize) => {
      setSquadSize(newSize);
      setFormation(getDefaultFormationForSize(newSize));
      personalization.initDefaults(newSize);
      trackFeatureUsed("tactics_preview_change", {
        type: "squadSize",
        value: newSize.toString(),
      });
    },
    [personalization]
  );

  // ── Players for PitchCanvas (real squad data when logged in, mock for guests) ──
  const pitchPlayers = useMemo(() => {
    const positions = POSITIONS_BY_SQUAD_SIZE[squadSize];

    if (hasRealMembers) {
      // Use real squad members, filling remaining slots with defaults
      const defaults = [...DEFAULT_PLAYER_NAMES];
      return Array.from({ length: squadSize }, (_, i) => {
        const member = realMembers[i];
        if (member) {
          return {
            id: member.id,
            name: personalization.names[i] || member.name,
            avatar: personalization.avatars[i] || member.avatar || undefined,
            position: (member.position || positions[i]) as any,
            status: "available" as const,
            address: member.id,
          };
        }
        return {
          id: `default-${i}`,
          name: personalization.names[i] || defaults[i] || `Player ${i + 1}`,
          avatar: personalization.avatars[i] || undefined,
          position: positions[i] as any,
          status: "available" as const,
          address: `0x${i + 1}`,
        };
      });
    }

    // Guest / no squad — use personalization names + defaults
    return [...DEFAULT_PLAYER_NAMES].slice(0, squadSize).map((name, i) => ({
      id: String(i + 1),
      name: personalization.names[i] || name,
      avatar: personalization.avatars[i] || undefined,
      position: positions[i] as any,
      status: "available" as const,
      address: `0x${i + 1}`,
    }));
  }, [squadSize, personalization.names, personalization.avatars, hasRealMembers, realMembers]);

  const handleLineupChange = useCallback(
    (newLineup: string[]) => {
      // Update personalization names based on new lineup order
      const newNames = newLineup.map((playerId) => {
        const player = pitchPlayers.find(p => p.id === playerId);
        return player?.name || '';
      });
      personalization.setNames(newNames);
      trackFeatureUsed("tactics_preview_change", {
        type: "lineup",
        value: "reordered",
      });
    },
    [pitchPlayers, personalization]
  );

  const lineup = useMemo(
    () =>
      Array.from({ length: FORMATIONS[formation].length }, (_, i) =>
        String(i + 1)
      ),
    [formation]
  );

  // ── Player names for simulation (real members when available, else personalization) ──
  const simulationPlayerNames = useMemo(() => {
    if (hasRealMembers) {
      return realMembers
        .slice(0, squadSize)
        .map((m, i) => personalization.names[i] || m.name.split(" ")[0]);
    }
    return personalization.names.filter((n) => n && n !== "GK");
  }, [hasRealMembers, realMembers, personalization.names, squadSize]);

  // ── Mode toggle ──
  const switchToMode = useCallback(
    (target: PlaygroundMode) => {
      setMode(target);
      trackFeatureUsed("formation_playground_toggle", { mode: target, formation });
    },
    [formation]
  );

  // ── CHALLENGE RECEIVED: full-screen overlay ──
  if (flow === "challenge_received" && opponent) {
    return (
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-0">
        <Card className="relative bg-gray-950/95 border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl shadow-amber-500/5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <ChallengeOverlay
            opponentFormation={opponent.formation}
            opponentStyle={opponent.style}
            opponentColor={opponent.color}
            opponentNames={opponent.names}
            suggestedFormation={suggestedCounter}
            onAccept={handleAcceptChallenge}
          />
        </Card>
      </div>
    );
  }

  // ── RESULT: full-screen result card ──
  if (flow === "result" && matchResult) {
    return (
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-0">
        <div ref={pitchRef}>
          <MatchResultCard
            result={matchResult}
            onRematch={handleRematch}
            onShare={() => {
              if (!pitchRef.current) return;
              import("html-to-image").then(({ toPng }) =>
                toPng(pitchRef.current!, { quality: 0.95, pixelRatio: 2, backgroundColor: "#0b1322" }).then((dataUrl) => {
                  fetch(dataUrl).then((r) => r.blob()).then((blob) => {
                    const file = new File([blob], "match-result.png", { type: "image/png" });
                    if (navigator.share && navigator.canShare({ files: [file] })) {
                      navigator.share({ title: "Match Result", files: [file] });
                    }
                  });
                })
              );
            }}
            onNewChallenge={handleNewChallenge}
          />
        </div>
      </div>
    );
  }

  // ── BUILD / COUNTER_SETUP: main playground ──
  const isCounterMode = flow === "counter_setup";

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-0">
      <Card className="relative bg-gray-950/95 dark:bg-gray-950/95 border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl shadow-green-500/5">
        {/* Top accent */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${isCounterMode ? "via-amber-500/60" : "via-green-500/60"} to-transparent`} />

        {/* Opponent banner (counter mode) */}
        {isCounterMode && opponent && (
          <div className="flex items-center justify-center gap-3 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold text-amber-300">
              Countering <span className="font-mono">{opponent.formation}</span>
              {opponent.names.filter(Boolean).length > 0 && (
                <span className="text-amber-400/60 ml-1">
                  ({opponent.names.filter(Boolean).slice(0, 2).join(", ")})
                </span>
              )}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNewChallenge} className="text-[10px] text-amber-400/60 hover:text-amber-300 h-5 px-2">
              Cancel
            </Button>
          </div>
        )}

        {/* ── Header: Mode Toggle + Formation Nav ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 pb-0">
          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-800/80 rounded-xl p-1">
            <button
              onClick={() => switchToMode("tactics")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                mode === "tactics"
                  ? "bg-green-500/25 text-green-300 shadow-sm shadow-green-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Tactics
            </button>
            <button
              onClick={() => switchToMode("simulation")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                mode === "simulation"
                  ? "bg-green-500/25 text-green-300 shadow-sm shadow-green-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              {isCounterMode ? "Simulate" : "Play It"}
            </button>
          </div>

          {/* Formation Nav */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 bg-white/[0.06] rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevFormation}
                className="h-7 w-7 p-0 text-white hover:text-white hover:bg-white/10 rounded-md"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-sm font-mono font-bold text-white w-14 text-center tabular-nums">
                {formation}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextFormation}
                className="h-7 w-7 p-0 text-white hover:text-white hover:bg-white/10 rounded-md"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Export buttons */}
            <ExportPanel
              pitchRef={pitchRef}
              formation={formation}
              playStyle={playStyle}
            />
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className={`grid grid-cols-1 ${mode === 'simulation' ? 'lg:grid-cols-1' : 'lg:grid-cols-[1fr_280px]'} gap-0`}>
          {/* Pitch area */}
          <div ref={pitchRef} className="p-3 sm:p-5 relative">
            <AnimatePresence mode="wait">
              {mode === "tactics" ? (
                <motion.div
                  key="tactics"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <PitchCanvas
                    formation={formation}
                    lineup={lineup}
                    players={pitchPlayers}
                    readOnly={!enablePlayerMovement}
                    onLineupChange={handleLineupChange}
                    showPlayerNames={personalization.showNames}
                    showExport={false}
                    primaryColor={primaryColor}
                    playStyle={playStyle}
                    theme="hero"
                    size="md"
                    pitchTheme={pitchTheme}
                    blurAvatars={personalization.blurFaces}
                    blurRadius={
                      personalization.blurLevel === "low"
                        ? 4
                        : personalization.blurLevel === "high"
                        ? 12
                        : 8
                    }
                  />
                  
                  {/* Arrow Drawing Overlay */}
                  {drawArrows && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair z-10"
                      style={{ background: 'transparent' }}
                      onMouseDown={(e) => {
                        if (!drawArrows) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        setDrawingArrow({ x1: x, y1: y, x2: x, y2: y });
                      }}
                      onMouseMove={(e) => {
                        if (!drawingArrow) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        setDrawingArrow({ ...drawingArrow, x2: x, y2: y });
                      }}
                      onMouseUp={() => {
                        if (drawingArrow) {
                          setArrows([...arrows, drawingArrow]);
                          setDrawingArrow(null);
                        }
                      }}
                      onMouseLeave={() => {
                        if (drawingArrow) {
                          setArrows([...arrows, drawingArrow]);
                          setDrawingArrow(null);
                        }
                      }}
                    >
                      {/* Existing arrows */}
                      {arrows.map((arrow, i) => (
                        <g key={i}>
                          <line
                            x1={`${arrow.x1}%`}
                            y1={`${arrow.y1}%`}
                            x2={`${arrow.x2}%`}
                            y2={`${arrow.y2}%`}
                            stroke="#fbbf24"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                          />
                        </g>
                      ))}
                      
                      {/* Arrow being drawn */}
                      {drawingArrow && (
                        <line
                          x1={`${drawingArrow.x1}%`}
                          y1={`${drawingArrow.y1}%`}
                          x2={`${drawingArrow.x2}%`}
                          y2={`${drawingArrow.y2}%`}
                          stroke="#fbbf24"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          markerEnd="url(#arrowhead)"
                        />
                      )}
                      
                      {/* Arrow marker definition */}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="10"
                          refX="9"
                          refY="3"
                          orient="auto"
                        >
                          <path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" />
                        </marker>
                      </defs>
                    </svg>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="simulation"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <MatchEnginePreview
                    formation={formation}
                    playersPerSide={
                      FORMATIONS[formation].length <= 5
                        ? 5
                        : FORMATIONS[formation].length <= 7
                        ? FORMATIONS[formation].length - 1
                        : 11
                    }
                    homeColor={primaryColor}
                    playerNames={simulationPlayerNames}
                    awayPlayerNames={opponent?.names}
                    onMatchEnd={isCounterMode ? handleSimResult : undefined}
                    squadId={hasRealMembers ? activeSquadId : undefined}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side controls - only show in tactics mode */}
          {mode === 'tactics' && (
          <div className="border-t lg:border-t-0 lg:border-l border-white/[0.06] p-4 space-y-4 bg-gray-950/50">
            {/* Squad Size */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 block">
                Squad Size
              </label>
              <div className="grid grid-cols-4 gap-1">
                {SQUAD_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSquadSizeChange(size)}
                    className={`px-2 py-1.5 rounded-md text-[11px] font-bold text-center transition-all ${
                      squadSize === size
                        ? "bg-green-500/25 text-green-300 shadow-sm"
                        : "bg-gray-800 text-gray-400 hover:text-green-300"
                    }`}
                  >
                    {size}v{size}
                  </button>
                ))}
              </div>
            </div>

            {/* Play Style */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 block">
                <Zap className="w-3 h-3 inline mr-1" />
                Style
              </label>
              <div className="grid grid-cols-2 gap-1">
                {PLAY_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setPlayStyle(style)}
                    className={`px-2 py-1.5 rounded-md text-[10px] font-bold text-center transition-all truncate ${
                      playStyle === style
                        ? "bg-green-500/25 text-green-300"
                        : "bg-gray-800 text-gray-400 hover:text-green-300"
                    }`}
                  >
                    {PLAY_STYLE_LABELS[style].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Kit Color */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 block">
                <Palette className="w-3 h-3 inline mr-1" />
                Kit Colour
              </label>
              <div className="flex gap-1.5">
                {SQUAD_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      primaryColor === color
                        ? "border-white scale-110"
                        : "border-transparent hover:border-white/30"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Pitch Theme */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 block">
                Pitch Style
              </label>
              <div className="grid grid-cols-2 gap-1">
                {(['premier-league', 'sunday-league', 'night-match', 'easy-on-eyes'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setPitchTheme(theme)}
                    className={`px-2 py-1.5 rounded-md text-[10px] font-bold text-center transition-all capitalize ${
                      pitchTheme === theme
                        ? "bg-green-500/25 text-green-300"
                        : "bg-gray-800 text-gray-400 hover:text-green-300"
                    }`}
                  >
                    {theme.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Movement Toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePlayerMovement}
                  onChange={(e) => setEnablePlayerMovement(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-green-500"
                />
                <span className="text-[11px] font-bold text-gray-300">
                  Move Players
                </span>
              </label>
              {enablePlayerMovement && (
                <p className="text-[9px] text-gray-500 mt-1 ml-5">
                  Drag players to reposition
                </p>
              )}
            </div>

            {/* Arrow Drawing Toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={drawArrows}
                  onChange={(e) => setDrawArrows(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-green-500"
                />
                <span className="text-[11px] font-bold text-gray-300">
                  Draw Arrows
                </span>
              </label>
              {drawArrows && (
                <div className="mt-1 ml-5 space-y-1">
                  <p className="text-[9px] text-gray-500">
                    Click & drag to draw
                  </p>
                  {arrows.length > 0 && (
                    <button
                      onClick={() => setArrows([])}
                      className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Show Names Toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={personalization.showNames}
                  onChange={(e) =>
                    personalization.setShowNames(e.target.checked)
                  }
                  className="w-3.5 h-3.5 rounded accent-green-500"
                />
                <span className="text-[11px] font-bold text-gray-300">
                  <Users className="w-3 h-3 inline mr-1" />
                  Show Names
                </span>
              </label>
            </div>

            {/* Player Name Inputs (when unlocked) */}
            {personalization.unlocked && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 block">
                  Player Names
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {personalization.names.slice(0, squadSize).map((name, i) => (
                    <input
                      key={i}
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const newNames = [...personalization.names];
                        newNames[i] = e.target.value;
                        personalization.setNames(newNames);
                      }}
                      placeholder={`Player ${i + 1}`}
                      className="w-full px-2 py-1 bg-gray-800 border border-white/10 rounded text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unlock hint */}
            {!personalization.unlocked && (
              <button
                onClick={() => personalization.setUnlocked(true)}
                className="w-full text-[10px] text-green-400 hover:text-green-300 font-bold uppercase tracking-wider py-1.5 border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-all"
              >
                Customize Player Names
              </button>
            )}
          </div>
          )}
        </div>

        {/* Copied toast */}
        <AnimatePresence>
          {showCopiedToast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50"
            >
              Challenge link copied — send it to your opponent!
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};
