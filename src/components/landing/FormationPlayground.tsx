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
import { patchPendingPersona, getPendingPersona } from "@/lib/claims/persona";
import { decodeFormationFromUrl, suggestCounterFormation, encodeChallengeUrl } from "@/lib/pitch/shareUrl";
import { storePlaygroundDraft, getPlaygroundDraft } from "@/lib/pitch/playgroundDraft";
import type { PlaygroundFlow } from "@/lib/pitch/shareUrl";
import type { Formation, PlayStyle, SquadSize, PlayerPosition } from "@/types";
import {
  Play, Settings2, ChevronLeft, ChevronRight,
  Palette, Users, Zap, Swords, Save, ClipboardList, Share2, Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackCoreGrowthEvent, trackFeatureUsed } from "@/lib/analytics";
import { ExportPanel } from "@/components/landing/pitch/ExportPanel";
import { ChallengeOverlay } from "@/components/landing/pitch/ChallengeOverlay";
import { MatchResultCard, type MatchResultData } from "@/components/landing/pitch/MatchResultCard";

export interface PlaygroundStateSnapshot {
  formation: Formation;
  style: PlayStyle;
  color: string;
  names: string[];
  size: SquadSize;
}

interface FormationPlaygroundProps {
  initialName?: string;
  initialPosition?: PlayerPosition;
  /**
   * Called whenever the current formation changes. Used by the hero to
   * pipe the active formation into PlayerCardPreview so the persona context
   * carries it through to onboarding (Path D: playground → save card →
   * personalize prefill).
   */
  onFormationChange?: (formation: Formation) => void;
  /**
   * Called whenever any playground state changes (formation, style, color,
   * names, size). Used by the hero to pipe context into the NL Match Sim
   * and Rival Preview so the user's accumulated investment carries forward.
   */
  onStateChange?: (state: PlaygroundStateSnapshot) => void;
}

const POSITION_TO_PITCH_INDEX: Record<PlayerPosition, number> = {
  GK: 0, DF: 1, MF: 2, WG: 3, ST: 4,
};

type PlaygroundMode = "tactics" | "simulation";

interface OpponentState {
  formation: Formation;
  style: PlayStyle;
  color: string;
  names: string[];
}

export const FormationPlayground: React.FC<FormationPlaygroundProps> = ({ initialName, initialPosition, onFormationChange, onStateChange }) => {
  // ── Challenge flow ──
  const [flow, setFlow] = useState<PlaygroundFlow>("build");
  const [opponent, setOpponent] = useState<OpponentState | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Challenge link copied — send it to your opponent!");
  const [isSharingPlan, setIsSharingPlan] = useState(false);

  // ── Shared tactic state (initialized from URL where available) ──
  const initialSquadSize = 5;
  const [squadSize, setSquadSize] = useState<SquadSize>(initialSquadSize);
  const [formation, setFormation] = useState<Formation>(
    getDefaultFormationForSize(initialSquadSize)
  );
  const [playStyle, setPlayStyle] = useState<PlayStyle>("balanced");
  const [primaryColor, setPrimaryColor] = useState("#10b981");
  const [squadNickname, setSquadNickname] = useState("");
  const [urlStateReady, setUrlStateReady] = useState(false);
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
  const avatarInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Personalization hook (shared across modes) ──
  const personalization = usePitchPersonalization(formation);

  const handleAvatarUpload = useCallback((index: number, file: File) => {
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newAvatars = [...personalization.avatars];
      newAvatars[index] = dataUrl;
      personalization.setAvatars(newAvatars);
    };
    reader.readAsDataURL(file);
  }, [personalization]);

  // ── Wire card preview name/position into the first pitch slot ──
  // Destructured to keep the dep array tight; the hook return is memoized
  // but the values themselves are the only ones this effect actually reads.
  const { names: pitchNames, setNames: setPitchNames, showNames: pitchShowNames, setShowNames: setPitchShowNames } = personalization;
  useEffect(() => {
    if (!initialName) return;
    const idx = initialPosition ? POSITION_TO_PITCH_INDEX[initialPosition] : 0;
    if (pitchNames[idx] === initialName) return;
    const next = [...pitchNames];
    next[idx] = initialName;
    setPitchNames(next);
    if (!pitchShowNames) setPitchShowNames(true);
  }, [initialName, initialPosition, pitchNames, pitchShowNames, setPitchNames, setPitchShowNames]);

  // ── Real squad data (when logged in) ──
  const { activeSquadId } = useActiveSquad();
  const { members: realMembers } = useSquadDetails(activeSquadId);
  const hasRealMembers = realMembers.length > 0;

  // ── Apply URL state after mount to avoid SSR/client hydration drift ──
  const urlStateApplied = useRef(false);
  useEffect(() => {
    if (urlStateApplied.current || typeof window === "undefined") return;

    // If the URL contains Privy OAuth callback params, skip formation decode.
    // The OAuth code needs to remain in the URL for Privy SDK to process it.
    // The sync-to-URL effect below will strip them if we run formation decode now.
    if (window.location.search.includes("privy_oauth_state=")) return;

    const parsed = decodeFormationFromUrl(new URLSearchParams(window.location.search));
    const hasUrlState = Boolean(
      parsed.formation || parsed.style || parsed.color || parsed.size ||
      parsed.vs_formation || (parsed.names && parsed.names.length > 0),
    );

    // A real incoming link (someone followed a share/challenge URL) always
    // wins. Otherwise, restore an in-progress draft from localStorage —
    // same refresh-survival the old URL-sync gave, without growing the
    // address bar on every visit. See playgroundDraft.ts.
    const draft = hasUrlState ? null : getPlaygroundDraft();

    const parsedSize = (parsed.size as SquadSize | undefined) || draft?.size || initialSquadSize;

    if (parsed.size || draft?.size) setSquadSize(parsedSize);
    if (parsed.formation) {
      setFormation(parsed.formation);
    } else if (draft?.formation) {
      setFormation(draft.formation);
    } else if (parsed.size) {
      setFormation(getDefaultFormationForSize(parsedSize));
    }
    if (parsed.style) setPlayStyle(parsed.style as PlayStyle);
    else if (draft?.style) setPlayStyle(draft.style);
    if (parsed.color) setPrimaryColor(parsed.color);
    else if (draft?.color) setPrimaryColor(draft.color);
    if (parsed.flow) setFlow(parsed.flow);
    if (parsed.vs_formation) {
      setOpponent({
        formation: parsed.vs_formation,
        style: (parsed.vs_style as PlayStyle) || "balanced",
        color: parsed.vs_color || "#ef4444",
        names: parsed.vs_names || [],
      });
    }
    if (parsed.names && parsed.names.length > 0) {
      personalization.setNames(parsed.names);
      personalization.setShowNames(true);
    } else if (draft?.names && draft.names.length > 0) {
      personalization.setNames(draft.names);
      personalization.setShowNames(true);
    }
    urlStateApplied.current = true;
    setUrlStateReady(true);
  }, [initialSquadSize, personalization]);

  // ── Persist state as a draft on change (skip during challenge/result) ──
  // Was a live URL sync (syncStateToUrl) — every visitor's address bar grew
  // a long query string just from playing with the widget. localStorage
  // gives the same refresh-survival without the visible URL pollution.
  useEffect(() => {
    if (!urlStateReady) return;
    if (flow === "challenge_received" || flow === "result") return;
    storePlaygroundDraft({
      formation,
      style: playStyle,
      color: primaryColor,
      size: squadSize,
      names: personalization.names,
    });
  }, [formation, playStyle, primaryColor, squadSize, personalization.names, flow, urlStateReady]);

  // Load any pending persona squad branding into playground state
  useEffect(() => {
    const pending = getPendingPersona();
    if (pending?.squadNickname) setSquadNickname(pending.squadNickname);
    if (pending?.squadColor) setPrimaryColor(pending.squadColor);
  }, []);

  // Persist squad branding changes to localStorage (progressive commitment)
  useEffect(() => {
    if (!urlStateReady) return;
    patchPendingPersona({ squadNickname, squadColor: primaryColor });
  }, [squadNickname, primaryColor, urlStateReady]);

  // ── Emit formation changes to the parent (for persona prefill) ──
  // Gated on urlStateReady so the initial mount and the URL-settled value
  // don't fire duplicate emits. onFormationChange intentionally NOT in deps
  // — we only want to re-run when the formation value itself changes.
  useEffect(() => {
    if (urlStateReady) onFormationChange?.(formation);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [formation, urlStateReady]);

  // ── Emit full playground state to parent (for NL sim + rival preview) ──
  // Fires whenever any state that the downstream simulators consume changes.
  // onStateChange intentionally NOT in deps — we only want to re-run when
  // the values themselves change.
  useEffect(() => {
    if (!urlStateReady) return;
    onStateChange?.({
      formation,
      style: playStyle,
      color: primaryColor,
      names: personalization.names.filter(Boolean),
      size: squadSize,
    });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [formation, playStyle, primaryColor, personalization.names, squadSize, urlStateReady]);

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

  const matchFormatLabel = useMemo(
    () => squadSize === 11 ? "11v11 full XI" : `${squadSize}v${squadSize} small-sided`,
    [squadSize]
  );

  const tacticalNotes = useMemo(() => {
    const formatNotes: Record<SquadSize, string> = {
      5: "5-a-side rewards quick support angles and one disciplined last player.",
      6: "6-a-side gives you a spare runner; the midfield line has to recover fast.",
      7: "7-a-side opens the flanks, so shape matters as much as individual pace.",
      11: "11v11 gives the full pitch picture once the squad grows.",
    };
    const styleNotes: Record<PlayStyle, string> = {
      balanced: "Balanced keeps your team compact enough to survive transitions.",
      possession: "Possession asks the nearest two players to stay available.",
      direct: "Direct play looks early for the striker and second runner.",
      counter: "Counter attack keeps depth, then releases runners into space.",
      high_press: "High press pushes the first line up and forces hurried passes.",
      low_block: "Low block compresses the middle and protects the goal mouth.",
    };
    return [formatNotes[squadSize], styleNotes[playStyle]];
  }, [playStyle, squadSize]);

  const planQuery = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("formation", formation);
    sp.set("style", playStyle);
    sp.set("size", String(squadSize));
    sp.set("color", primaryColor);
    const names = personalization.names.filter(Boolean);
    if (names.length > 0) sp.set("names", names.join(","));
    return sp.toString();
  }, [formation, playStyle, primaryColor, squadSize, personalization.names]);

  const saveSetupHref = `/squad?tab=tactics&new=1&${planQuery}`;
  const logMatchHref = `/match?mode=capture&${planQuery}`;

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
    setToastMessage("Challenge link copied — send it to your opponent!");
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 3000);
  }, [opponent, formation, playStyle, primaryColor, squadSize, personalization.names]);

  const handleSharePlan = useCallback(async () => {
    const fallbackUrl = `${window.location.origin}${window.location.pathname}?${planQuery}`;
    const shareText = `${squadSize}v${squadSize} ${formation} ${PLAY_STYLE_LABELS[playStyle].name} setup. Claim your spot and build your player card.`;
    let shareUrl = fallbackUrl;
    let shareSource = "playground_query_link";

    setIsSharingPlan(true);
    try {
      const response = await fetch("/api/tactics/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan: {
            formation,
            style: playStyle,
            size: squadSize,
            color: primaryColor,
            names: personalization.names.filter(Boolean),
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.url) {
        shareUrl = payload.url;
        shareSource = "playground_short_link";
      }
    } catch {
      shareUrl = fallbackUrl;
    }

    try {
      if (navigator.share && window.matchMedia("(max-width: 1024px)").matches) {
        await navigator.share({
          title: "SportWarren tactical setup",
          text: shareText,
          url: shareUrl,
        });
        setToastMessage("Claim link shared — bring the squad into the shape.");
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setToastMessage(shareSource === "playground_short_link"
          ? "Claimable setup link copied — send it to the squad."
          : "Claim link copied — bring the squad into the shape.");
      }
      trackFeatureUsed("setup_link_copied", { formation, style: playStyle, size: squadSize, source: shareSource });
      trackCoreGrowthEvent("playground_plan_shared", {
        formation,
        style: playStyle,
        size: squadSize,
        source: shareSource,
      });
    } catch {
      setToastMessage("Couldn't copy the setup link on this device.");
    } finally {
      setIsSharingPlan(false);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 3000);
    }
  }, [formation, personalization.names, planQuery, playStyle, primaryColor, squadSize]);

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
        <Card className="relative !bg-gray-950/95 !border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl shadow-amber-500/5">
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
      <Card className="relative !bg-gray-950/95 !border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl shadow-green-500/5">
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
              squadSize={squadSize}
              names={personalization.names.slice(0, squadSize)}
              color={primaryColor}
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
                  <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                        Applied plan
                      </span>
                      {[matchFormatLabel, formation, PLAY_STYLE_LABELS[playStyle].name].map((label) => (
                        <span
                          key={label}
                          className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-gray-200"
                        >
                          {label}
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-gray-200">
                        <span className="h-2.5 w-2.5 rounded-full border border-white/50" style={{ backgroundColor: primaryColor }} />
                        Kit
                      </span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300/80">
                      Claim spots first. Full XI when you need it.
                    </div>
                  </div>
                  <MatchEnginePreview
                    formation={formation}
                    awayFormation={opponent?.formation}
                    playStyle={playStyle}
                    awayPlayStyle={opponent?.style}
                    playersPerSide={FORMATIONS[formation].length}
                    homeColor={primaryColor}
                    awayColor={opponent?.color}
                    playerNames={simulationPlayerNames}
                    awayPlayerNames={opponent?.names}
                    onMatchEnd={isCounterMode ? handleSimResult : undefined}
                    squadId={hasRealMembers ? activeSquadId : undefined}
                  />
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                      <div>
                        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                          Match read
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {tacticalNotes.map((note) => (
                            <div key={note} className="border-l border-emerald-400/40 pl-3 text-xs font-medium leading-relaxed text-gray-300">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <a
                          href={saveSetupHref}
                          onClick={() => {
                            trackFeatureUsed("save_setup_clicked", { formation, style: playStyle, size: squadSize });
                            trackCoreGrowthEvent("playground_setup_saved", {
                              formation,
                              style: playStyle,
                              size: squadSize,
                              source: "playground",
                            });
                          }}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                        >
                          <Save className="h-4 w-4" />
                          Save setup
                        </a>
                        {isCounterMode && opponent ? (
                          <button
                            type="button"
                            onClick={handleChallengeBack}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-100 transition hover:bg-amber-400/15"
                          >
                            <Share2 className="h-4 w-4" />
                            Challenge back
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSharePlan}
                            disabled={isSharingPlan}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-gray-100 transition hover:bg-white/[0.1]"
                          >
                            <Share2 className="h-4 w-4" />
                            {isSharingPlan ? "Preparing..." : "Share claim link"}
                          </button>
                        )}
                        <a
                          href={logMatchHref}
                          onClick={() => trackFeatureUsed("log_match_from_playground_clicked", { formation, style: playStyle, size: squadSize })}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-gray-100 transition hover:bg-white/[0.1]"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Log result
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side controls - only show in tactics mode */}
          {mode === 'tactics' && (
          <div className="border-t lg:border-t-0 lg:border-l border-white/[0.06] p-4 space-y-4 bg-gray-950/50">
            {/* Squad Size */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                  Match Format
                </label>
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-300/70">
                  5s / 6s / 7s first
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {SQUAD_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSquadSizeChange(size)}
                    className={`px-2 py-1.5 rounded-md text-[11px] font-bold text-center transition-all ${
                      squadSize === size
                        ? "bg-green-500/25 text-green-300 shadow-sm"
                        : size === 11
                        ? "bg-gray-900 text-gray-500 hover:text-green-300"
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

            {/* Squad Name (pre-auth branding — deepens investment) */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 block">
                <Users className="w-3 h-3 inline mr-1" />
                Squad Name
              </label>
              <input
                type="text"
                placeholder="Your squad name"
                maxLength={24}
                value={squadNickname}
                onChange={(e) => setSquadNickname(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium text-white placeholder-gray-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
              />
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
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {personalization.names.slice(0, squadSize).map((name, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => avatarInputRefs.current[i]?.click()}
                        className="relative flex-shrink-0 w-7 h-7 rounded-full border border-white/10 bg-gray-800 overflow-hidden hover:border-green-500/50 transition-all"
                        title="Upload photo"
                      >
                        {personalization.avatars[i] ? (
                          <img
                            src={personalization.avatars[i]!}
                            alt={name || `Player ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-3 h-3 text-gray-500 mx-auto my-auto" />
                        )}
                      </button>
                      <input
                        ref={(el) => { avatarInputRefs.current[i] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(i, file);
                          e.target.value = '';
                        }}
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          const newNames = [...personalization.names];
                          newNames[i] = e.target.value;
                          personalization.setNames(newNames);
                        }}
                        placeholder={`Player ${i + 1}`}
                        className="flex-1 px-2 py-1 bg-gray-800 border border-white/10 rounded text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                      />
                    </div>
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
                Create Player Cards
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
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};
