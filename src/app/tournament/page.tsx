"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc-client";
import TournamentBracket from "@/components/landing/pitch/TournamentBracket";
import { FORMATIONS } from "@/lib/formations";
import type { Formation, PlayStyle } from "@/types";

const PLAY_STYLES: { value: PlayStyle; label: string }[] = [
  { value: "balanced", label: "Balanced" },
  { value: "possession", label: "Possession" },
  { value: "direct", label: "Direct" },
  { value: "counter", label: "Counter" },
  { value: "high_press", label: "High Press" },
  { value: "low_block", label: "Low Block" },
];

const FORMATION_LIST = Object.keys(FORMATIONS) as unknown as Formation[];

type FlowState = "browse" | "create" | "enter" | "bracket";

export default function TournamentPage() {
  const [flow, setFlow] = useState<FlowState>("browse");
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  // Create form
  const [createName, setCreateName] = useState("");
  const [createType, setCreateType] = useState<"squad" | "individual">("individual");

  // Entry form
  const [entryFormation, setEntryFormation] = useState<Formation>("4-3-3");
  const [entryStyle, setEntryStyle] = useState<PlayStyle>("balanced");
  const [entryColor, setEntryColor] = useState("#3b82f6");

  const { data: tournaments, refetch: refetchTournaments } = trpc.tournament.list.useQuery({
    status: flow === "browse" ? undefined : undefined,
    limit: 20,
  });

  const { data: tournament, refetch: refetchTournament } = trpc.tournament.get.useQuery(
    { id: selectedTournamentId! },
    { enabled: !!selectedTournamentId }
  );

  const createMutation = trpc.tournament.create.useMutation({
    onSuccess: (data: any) => {
      setSelectedTournamentId(data.id);
      setFlow("enter");
      refetchTournaments();
    },
  });

  const enterMutation = trpc.tournament.enter.useMutation({
    onSuccess: () => {
      refetchTournament();
    },
  });

  const startMutation = trpc.tournament.start.useMutation({
    onSuccess: () => {
      setFlow("bracket");
      refetchTournament();
    },
  });

  const handleCreate = useCallback(() => {
    if (!createName.trim()) return;
    createMutation.mutate({
      name: createName.trim(),
      type: createType,
    });
  }, [createName, createType, createMutation]);

  const handleEnter = useCallback(() => {
    if (!selectedTournamentId) return;
    enterMutation.mutate({
      tournamentId: selectedTournamentId,
      formation: entryFormation as any,
      playStyle: entryStyle,
      color: entryColor,
    });
  }, [selectedTournamentId, entryFormation, entryStyle, entryColor, enterMutation]);

  const handleStart = useCallback(() => {
    if (!selectedTournamentId) return;
    startMutation.mutate({ tournamentId: selectedTournamentId });
  }, [selectedTournamentId, startMutation]);

  // Build bracket data for display
  const buildBracketData = () => {
    if (!tournament) return null;

    const toBracketMatch = (m: any): any => ({
      homeName: m.homeEntry?.squadId
        ? `Squad ${m.homeEntry.seedNumber}`
        : `Seed ${m.homeEntry?.seedNumber}`,
      awayName: m.awayEntry?.squadId
        ? `Squad ${m.awayEntry.seedNumber}`
        : `Seed ${m.awayEntry?.seedNumber}`,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      homeColor: m.homeEntry?.color || "#3b82f6",
      awayColor: m.awayEntry?.color || "#ef4444",
      isWinner: (side: "home" | "away") => {
        if (m.homeScore === null || m.awayScore === null) return false;
        return side === "home" ? m.homeScore >= m.awayScore : m.awayScore >= m.homeScore;
      },
    });

    const qf = tournament.matches
      .filter((m: any) => m.round === "quarter")
      .map(toBracketMatch);
    const sf = tournament.matches
      .filter((m: any) => m.round === "semi")
      .map(toBracketMatch);
    const finalMatch = tournament.matches.find((m: any) => m.round === "final");
    const final_ = finalMatch ? toBracketMatch(finalMatch) : null;

    // Determine champion
    let champion: string | undefined;
    if (final_ && finalMatch) {
      const winnerEntry =
        finalMatch.homeScore! >= finalMatch.awayScore!
          ? finalMatch.homeEntry
          : finalMatch.awayEntry;
      champion = winnerEntry?.squadId
        ? `Squad ${winnerEntry.seedNumber}`
        : `Seed ${winnerEntry?.seedNumber}`;
    }

    return { qf, sf, final_, champion };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">⚽</span>
          <div>
            <h1 className="text-2xl font-bold">Tournaments</h1>
            <p className="text-sm text-slate-400">
              8 entries. Single elimination. Simulated matches. Real bragging rights.
            </p>
          </div>
          {flow === "browse" && (
            <button
              onClick={() => setFlow("create")}
              className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold transition-colors"
            >
              Create Tournament
            </button>
          )}
        </div>

        {/* Browse tournaments */}
        {flow === "browse" && (
          <div className="grid gap-4 md:grid-cols-2">
            {tournaments?.map((t: any) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTournamentId(t.id);
                  setFlow(t.status === "completed" ? "bracket" : "enter");
                }}
                className="text-left p-4 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {t.status === "completed" ? "🏆" : t.status === "active" ? "⚡" : "🔓"}
                  </span>
                  <span className="font-semibold">{t.name}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {t.type === "squad" ? "Squad" : "Individual"} ·{" "}
                  {t._count.entries} / {t.maxEntries} entries ·{" "}
                  {t.status}
                </div>
              </button>
            ))}
            {(!tournaments || tournaments.length === 0) && (
              <div className="col-span-2 text-center py-12 text-slate-500">
                No tournaments yet. Create one to get started!
              </div>
            )}
          </div>
        )}

        {/* Create tournament */}
        {flow === "create" && (
          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tournament Name
              </label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Weekend Cup"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type
              </label>
              <div className="flex gap-3">
                {(["individual", "squad"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCreateType(t)}
                    className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      createType === t
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {t === "squad" ? "Squad" : "Individual"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setFlow("browse")}
                className="flex-1 py-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!createName.trim() || createMutation.isPending}
                className="flex-1 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors font-semibold"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}

        {/* Enter tournament */}
        {flow === "enter" && tournament && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{tournament.name}</h2>
              <p className="text-sm text-slate-400">
                {tournament.entries.length} / {tournament.maxEntries} entries
              </p>
            </div>

            {/* Current entries */}
            {tournament.entries.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  Entries
                </div>
                {tournament.entries.map((e: any) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: e.color }}
                    />
                    <span className="font-mono text-xs text-slate-500">
                      #{e.seedNumber}
                    </span>
                    <span className="flex-1">{e.formation}</span>
                    <span className="text-xs text-slate-500">{e.playStyle}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Entry form */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Formation
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {FORMATION_LIST.map((f) => (
                    <button
                      key={f}
                      onClick={() => setEntryFormation(f)}
                      className={`py-2 px-1 rounded-lg text-xs font-mono transition-colors ${
                        entryFormation === f
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Play Style
                </label>
                <select
                  value={entryStyle}
                  onChange={(e) => setEntryStyle(e.target.value as PlayStyle)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100"
                >
                  {PLAY_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={entryColor}
                  onChange={(e) => setEntryColor(e.target.value)}
                  className="w-full h-10 rounded-lg bg-slate-800 border border-slate-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setFlow("browse")}
                className="flex-1 py-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleEnter}
                disabled={enterMutation.isPending}
                className="flex-1 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors font-semibold"
              >
                {enterMutation.isPending ? "Entering..." : "Enter Tournament"}
              </button>
            </div>

            {/* Start button (for creator) */}
            {tournament.entries.length >= 4 &&
              tournament.status === "open" && (
                <button
                  onClick={handleStart}
                  disabled={startMutation.isPending}
                  className="w-full py-3 rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 transition-colors font-semibold"
                >
                  {startMutation.isPending
                    ? "Simulating..."
                    : `Start Tournament (${tournament.entries.length} entries)`}
                </button>
              )}
          </div>
        )}

        {/* Bracket view */}
        {flow === "bracket" && tournament && (
          <div>
            <button
              onClick={() => setFlow("browse")}
              className="mb-4 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Back to tournaments
            </button>
            {(() => {
              const data = buildBracketData();
              if (!data) return <div>Loading bracket...</div>;
              return (
                <TournamentBracket
                  name={tournament.name}
                  type={tournament.type as "squad" | "individual"}
                  quarterFinals={data.qf}
                  semiFinals={data.sf}
                  final={data.final_}
                  champion={data.champion}
                />
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
