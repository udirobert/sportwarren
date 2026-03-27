"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { 
  Users, Target, Shield, Zap, MapPin, 
  Save, RotateCcw 
} from 'lucide-react';
import type { Tactics, Formation, PlayStyle, TeamInstructions, Player } from '@/types';
import { POSITION_COLORS, POSITION_NAMES } from '@/lib/utils';
import { 
  FORMATIONS, 
  ROLE_LABELS,
  PLAY_STYLES,
  PLAY_STYLE_LABELS,
  TACTICAL_PRESETS,
  SET_PIECE_OPTIONS,
  buildAutoLineup,
  reconcileLineup,
  scorePlayerForRole,
  getRolePosition,
} from '@/lib/formations';
import { PitchCanvas } from './PitchCanvas';

interface TacticsBoardProps {
  players: Player[];
  initialTactics?: Tactics;
  initialLineup?: string[];
  onSave?: (tactics: Tactics, lineup: string[]) => void;
  readOnly?: boolean;
}


export const TacticsBoard: React.FC<TacticsBoardProps> = ({
  players,
  initialTactics,
  initialLineup,
  onSave,
  readOnly = false,
}) => {
  const playerById = useMemo(() => {
    const map = new Map<string, Player>();
    players.forEach((p) => map.set(p.id, p));
    return map;
  }, [players]);

  const [tactics, setTactics] = useState<Tactics>(initialTactics || {
    formation: '4-3-3',
    style: 'balanced',
    instructions: {
      width: 'normal',
      tempo: 'normal',
      passing: 'mixed',
      pressing: 'medium',
      defensiveLine: 'normal',
    },
    setPieces: {
      corners: 'near_post',
      freeKicks: 'cross',
      penalties: players[0]?.id || '',
    },
  });

  const [selectedFormation, setSelectedFormation] = useState<Formation>(tactics.formation);
  const [hasChanges, setHasChanges] = useState(false);

  const formationPositions = FORMATIONS[selectedFormation];
  const formationRoles = useMemo(() => formationPositions.map((pos) => pos.role), [formationPositions]);

  const handleFormationChange = (formation: Formation) => {
    setSelectedFormation(formation);
    setTactics(prev => ({ ...prev, formation }));
    setHasChanges(true);
  };

  const handleStyleChange = (style: PlayStyle) => {
    setTactics(prev => ({ ...prev, style }));
    setHasChanges(true);
  };

  const handleInstructionChange = (key: keyof TeamInstructions, value: string) => {
    setTactics(prev => ({
      ...prev,
      instructions: { ...prev.instructions, [key]: value },
    }));
    setHasChanges(true);
  };

  const handleSetPieceChange = (key: keyof Tactics['setPieces'], value: string) => {
    setTactics(prev => ({
      ...prev,
      setPieces: { ...prev.setPieces, [key]: value },
    }));
    setHasChanges(true);
  };

  const handleApplyPreset = (preset: (typeof TACTICAL_PRESETS)[number]) => {
    setSelectedFormation(preset.formation);
    setTactics(prev => ({
      ...prev,
      formation: preset.formation,
      style: preset.style,
      instructions: { ...prev.instructions, ...preset.instructions },
    }));
    setHasChanges(true);
  };

  const impactSummary = useMemo(() => {
    const points: string[] = [];
    const style = PLAY_STYLE_LABELS[tactics.style]?.name ?? 'Balanced';
    points.push(`${style} focus with ${tactics.instructions.passing} passing.`);

    const press = tactics.instructions.pressing;
    if (press === 'high') points.push('Aggressive press; expect more turnovers and stamina cost.');
    if (press === 'low') points.push('Low press; deny space but invite pressure.');
    if (press === 'medium') points.push('Mid press; balanced risk in the middle third.');

    const line = tactics.instructions.defensiveLine;
    if (line === 'high') points.push('High line: compresses play, vulnerable to counters.');
    if (line === 'deep') points.push('Deep line: safer box defense, fewer high recoveries.');
    if (line === 'normal') points.push('Normal line: stable shape, slower transitions.');

    return points.slice(0, 3);
  }, [tactics]);

  const changeSummary = useMemo(() => {
    if (!initialTactics) return [];
    const changes: Array<{ label: string; from: string; to: string }> = [];
    if (initialTactics.formation !== tactics.formation) {
      changes.push({ label: 'Formation', from: initialTactics.formation, to: tactics.formation });
    }
    if (initialTactics.style !== tactics.style) {
      changes.push({ label: 'Style', from: initialTactics.style, to: tactics.style });
    }
    (Object.keys(initialTactics.instructions) as Array<keyof TeamInstructions>).forEach((key) => {
      if (initialTactics.instructions[key] !== tactics.instructions[key]) {
        changes.push({ label: key, from: initialTactics.instructions[key], to: tactics.instructions[key] });
      }
    });
    (Object.keys(initialTactics.setPieces) as Array<keyof Tactics['setPieces']>).forEach((key) => {
      if (initialTactics.setPieces[key] !== tactics.setPieces[key]) {
        const fromLabel = key === 'penalties' ? (playerById.get(initialTactics.setPieces.penalties)?.name || 'Unassigned') : initialTactics.setPieces[key];
        const toLabel = key === 'penalties' ? (playerById.get(tactics.setPieces.penalties)?.name || 'Unassigned') : tactics.setPieces[key];
        changes.push({ label: key, from: fromLabel, to: toLabel });
      }
    });
    return changes;
  }, [initialTactics, tactics, playerById]);

  const [lineup, setLineup] = useState<string[]>(() => {
    if (initialLineup && initialLineup.length > 0) {
      return reconcileLineup(formationRoles, players, initialLineup);
    }
    return buildAutoLineup(formationRoles, players);
  });

  useEffect(() => {
    setLineup((prev) => reconcileLineup(formationRoles, players, prev));
  }, [formationRoles, players]);

  useEffect(() => {
    if (initialLineup && initialLineup.length > 0) {
      setLineup(reconcileLineup(formationRoles, players, initialLineup));
    }
  }, [initialLineup, formationRoles, players]);

  const assignedCount = useMemo(() => lineup.filter(Boolean).length, [lineup]);
  const goalkeeperSlot = formationRoles.findIndex((role) => role === 'GK');
  const goalkeeperSelected = goalkeeperSlot >= 0 ? lineup[goalkeeperSlot] : null;
  const missingPositionCount = useMemo(() => players.filter((p) => !p.position).length, [players]);

  const handleLineupSelect = (slotIndex: number, playerId: string) => {
    setLineup((prev) => {
      const next = [...prev];
      if (playerId) {
        const duplicate = next.findIndex((id, idx) => id === playerId && idx !== slotIndex);
        if (duplicate >= 0) next[duplicate] = '';
      }
      next[slotIndex] = playerId;
      return next;
    });
    setHasChanges(true);
  };

  const handleAutoAssign = () => {
    setLineup(buildAutoLineup(formationRoles, players));
    setHasChanges(true);
  };

  const handleClearLineup = () => {
    setLineup(Array.from({ length: formationRoles.length }).map(() => ''));
    setHasChanges(true);
  };

  const handleDropOnSlot = (slotIndex: number, payload: { playerId?: string; fromSlot?: number }) => {
    if (payload.fromSlot !== undefined && payload.fromSlot === slotIndex) return;
    if (payload.playerId) {
      handleLineupSelect(slotIndex, payload.playerId);
    }
  };

  const handleBenchDrop = (payload: { fromSlot?: number }) => {
    if (payload.fromSlot === undefined) return;
    setLineup((prev) => {
      const next = [...prev];
      next[payload.fromSlot!] = '';
      return next;
    });
    setHasChanges(true);
  };

  const getDragPayload = (event: React.DragEvent) => {
    try {
      const raw = event.dataTransfer.getData('application/sportwarren-player');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const handleSave = () => {
    onSave?.(tactics, lineup);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (initialTactics) {
      setTactics(initialTactics);
      setSelectedFormation(initialTactics.formation);
    }
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Formation Display */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Formation
          </h3>
          {!readOnly && (
            <select
              value={selectedFormation}
              onChange={(e) => handleFormationChange(e.target.value as Formation)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {Object.keys(FORMATIONS).map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          )}
        </div>

        {/* Pitch Visualization - Now using reusable PitchCanvas */}
        <PitchCanvas
          formation={selectedFormation}
          lineup={lineup}
          players={players}
          readOnly={readOnly}
          onLineupChange={setLineup}
        />

        <p className="text-sm text-gray-600 mt-3">
          {formationPositions.length - 1} outfield players + 1 goalkeeper
        </p>
      </Card>

      {/* Lineup Configuration */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" />
              Lineup
            </h3>
            <p className="text-xs text-gray-500 mt-1">Assigned {assignedCount} / {formationRoles.length} roles</p>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleAutoAssign} className="text-xs px-3 py-1.5">
                Auto-assign
              </Button>
              <Button variant="outline" onClick={handleClearLineup} className="text-xs px-3 py-1.5">
                Clear
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {players.map((player) => (
            <div
              key={player.id}
              draggable={!readOnly}
              onDragStart={(e) => {
                e.dataTransfer.setData('application/sportwarren-player', JSON.stringify({ playerId: player.id }));
                e.dataTransfer.effectAllowed = 'move';
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-gray-200 bg-white text-xs cursor-grab"
            >
              <span className={`px-2 py-0.5 rounded ${POSITION_COLORS[player.position]}`}>{player.position}</span>
              <span className="text-gray-700">{player.name}</span>
              {player.status !== 'available' && <span className="text-amber-600 capitalize">({player.status.replace('_', ' ')})</span>}
            </div>
          ))}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const payload = getDragPayload(e);
              if (payload) handleBenchDrop(payload);
            }}
            className="ml-auto px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-xs text-gray-500"
          >
            Drop here to bench
          </div>
        </div>

        {missingPositionCount > 0 && (
          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            {missingPositionCount} player{missingPositionCount === 1 ? '' : 's'} missing a preferred position. Ask them to set it for more accurate lineup scoring.
            <Link href="/profile" className="ml-2 font-semibold underline">
              Update profile
            </Link>
          </div>
        )}

        {goalkeeperSlot >= 0 && !goalkeeperSelected && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            No goalkeeper assigned. Select a GK to avoid defensive penalties.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          {formationRoles.map((role, idx) => {
            const selectedId = lineup[idx];
            const selected = selectedId ? playerById.get(selectedId) : undefined;
            const rolePosition = getRolePosition(role);
            const sortedPlayers = [...players].sort((a, b) => scorePlayerForRole(b, role) - scorePlayerForRole(a, role));
            return (
              <div
                key={`${role}-${idx}`}
                className="rounded-lg border border-gray-200 p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const payload = getDragPayload(e);
                  if (payload) handleDropOnSlot(idx, payload);
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded">{role}</span>
                      <span className="text-xs text-gray-500">{ROLE_LABELS[role] ?? 'Role'}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Preferred: {POSITION_NAMES[rolePosition]}
                    </div>
                  </div>
                  <select
                    value={selectedId}
                    onChange={(e) => !readOnly && handleLineupSelect(idx, e.target.value)}
                    disabled={readOnly}
                    className="min-w-[170px] px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="">Unassigned</option>
                    {sortedPlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name} · {POSITION_NAMES[player.position]}{player.status !== 'available' ? ` (${player.status})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {selected && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span
                      draggable={!readOnly}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/sportwarren-player', JSON.stringify({ playerId: selected.id, fromSlot: idx }));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`px-2 py-0.5 rounded cursor-grab ${POSITION_COLORS[selected.position]}`}
                    >
                      {selected.position}
                    </span>
                    <span className={`capitalize ${selected.status === 'available' ? 'text-green-600' : 'text-amber-600'}`}>
                      {selected.status.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tactical Presets */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-gray-700" />
          Tactical Presets
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {TACTICAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => !readOnly && handleApplyPreset(preset)}
              disabled={readOnly}
              className="p-3 rounded-lg border border-gray-200 text-left hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{preset.name}</span>
                <span className="text-xs text-gray-500">{preset.formation}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
              <div className="text-[11px] text-gray-600 mt-2">
                {PLAY_STYLE_LABELS[preset.style]?.name} • {preset.instructions.passing} passing • {preset.instructions.pressing} press
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Play Style */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Play Style
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PLAY_STYLES.map((style) => {
            const { name, description, icon } = PLAY_STYLE_LABELS[style];
            const isSelected = tactics.style === style;
            return (
              <button
                key={style}
                onClick={() => !readOnly && handleStyleChange(style)}
                disabled={readOnly}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{icon}</div>
                <div className="font-medium text-gray-900">{name}</div>
                <div className="text-xs text-gray-500">{description}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tactical Impact */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-amber-600" />
          Tactical Impact
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          {impactSummary.map((point) => (
            <div key={point} className="flex items-start space-x-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{point}</span>
            </div>
          ))}
        </div>
        {hasChanges && changeSummary.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Change Summary</div>
            <div className="grid md:grid-cols-2 gap-2">
              {changeSummary.map((change, idx) => (
                <div key={`${change.label}-${idx}`} className="text-xs text-gray-600 bg-gray-50 rounded-md px-2 py-1">
                  <span className="font-medium capitalize">{change.label}</span>: {change.from} → {change.to}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Team Instructions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Team Instructions
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: 'width', label: 'Width', options: ['narrow', 'normal', 'wide'] },
            { key: 'tempo', label: 'Tempo', options: ['slow', 'normal', 'fast'] },
            { key: 'passing', label: 'Passing', options: ['short', 'mixed', 'long'] },
            { key: 'pressing', label: 'Pressing', options: ['low', 'medium', 'high'] },
            { key: 'defensiveLine', label: 'Defensive Line', options: ['deep', 'normal', 'high'] },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="flex space-x-1">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => !readOnly && handleInstructionChange(key as keyof TeamInstructions, opt)}
                    disabled={readOnly}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize transition-all ${
                      tactics.instructions[key as keyof TeamInstructions] === opt
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Set Pieces */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-600" />
          Set Pieces
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Corners</label>
            <select
              value={tactics.setPieces.corners}
              onChange={(e) => !readOnly && handleSetPieceChange('corners', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {SET_PIECE_OPTIONS.corners.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Free Kicks</label>
            <select
              value={tactics.setPieces.freeKicks}
              onChange={(e) => !readOnly && handleSetPieceChange('freeKicks', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {SET_PIECE_OPTIONS.freeKicks.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Penalty Taker</label>
            <select
              value={tactics.setPieces.penalties}
              onChange={(e) => !readOnly && handleSetPieceChange('penalties', e.target.value)}
              disabled={readOnly || players.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {players.length === 0 && <option value="">No players available</option>}
              {players.map((player) => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">Use your most composed finisher for penalties.</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      {!readOnly && hasChanges && (
        <div className="flex space-x-3">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Tactics
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
};
