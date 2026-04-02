/**
 * Formation Definitions - Single Source of Truth
 * Consolidated formation data used across TacticsBoard, PitchCanvas, and MatchEngine
 * 
 * Coordinate system: x: 0-100 (left to right), y: 0-100 (top to bottom)
 * GK at y:90 (near bottom goal), ST at y:20 (near top goal)
 * Lines are spaced ~25 units apart for consistent visual balance
 */

import type { Formation, PlayStyle, TeamInstructions, Tactics, PlayerPosition, SquadSize } from '@/types';

export interface FormationPosition {
  x: number;
  y: number;
  role: string;
}

export const FORMATIONS: Record<Formation, FormationPosition[]> = {
  // Classic 4-4-2: balanced, two banks of four, two strikers
  '4-4-2': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 20, y: 45, role: 'LM' }, { x: 40, y: 45, role: 'CM' }, { x: 60, y: 45, role: 'CM' }, { x: 80, y: 45, role: 'RM' },
    { x: 40, y: 20, role: 'ST' }, { x: 60, y: 20, role: 'ST' },
  ],

  // 4-3-3: attacking, three midfielders, wingers + striker
  '4-3-3': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 30, y: 50, role: 'CM' }, { x: 50, y: 45, role: 'CM' }, { x: 70, y: 50, role: 'CM' },
    { x: 20, y: 25, role: 'LW' }, { x: 50, y: 20, role: 'ST' }, { x: 80, y: 25, role: 'RW' },
  ],

  // 4-2-3-1: defensive midfielder pivot, three attacking mids, lone striker
  '4-2-3-1': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 40, y: 55, role: 'CDM' }, { x: 60, y: 55, role: 'CDM' },
    { x: 25, y: 38, role: 'CAM' }, { x: 50, y: 35, role: 'CAM' }, { x: 75, y: 38, role: 'CAM' },
    { x: 50, y: 18, role: 'ST' },
  ],

  // 3-5-2: three center backs, five midfielders (including wingbacks), two strikers
  '3-5-2': [
    { x: 50, y: 90, role: 'GK' },
    { x: 30, y: 70, role: 'CB' }, { x: 50, y: 70, role: 'CB' }, { x: 70, y: 70, role: 'CB' },
    { x: 20, y: 50, role: 'LWB' }, { x: 35, y: 48, role: 'CM' }, { x: 50, y: 45, role: 'CM' }, { x: 65, y: 48, role: 'CM' }, { x: 80, y: 50, role: 'RWB' },
    { x: 40, y: 22, role: 'ST' }, { x: 60, y: 22, role: 'ST' },
  ],

  // 5-3-2: five defenders, three midfielders, two strikers
  '5-3-2': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LWB' }, { x: 35, y: 70, role: 'CB' }, { x: 50, y: 70, role: 'CB' }, { x: 65, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RWB' },
    { x: 35, y: 48, role: 'CM' }, { x: 50, y: 45, role: 'CM' }, { x: 65, y: 48, role: 'CM' },
    { x: 40, y: 22, role: 'ST' }, { x: 60, y: 22, role: 'ST' },
  ],

  // 4-5-1: defensive, five midfielders, lone striker
  '4-5-1': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 20, y: 50, role: 'LM' }, { x: 38, y: 48, role: 'CM' }, { x: 50, y: 45, role: 'CM' }, { x: 62, y: 48, role: 'CM' }, { x: 80, y: 50, role: 'RM' },
    { x: 50, y: 22, role: 'ST' },
  ],

  // 4-1-4-1: single defensive midfielder, four attacking mids, lone striker
  '4-1-4-1': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 50, y: 55, role: 'CDM' },
    { x: 20, y: 40, role: 'LM' }, { x: 40, y: 38, role: 'CM' }, { x: 60, y: 38, role: 'CM' }, { x: 80, y: 40, role: 'RM' },
    { x: 50, y: 20, role: 'ST' },
  ],

  // 3-4-3: three center backs, four midfielders, three forwards
  '3-4-3': [
    { x: 50, y: 90, role: 'GK' },
    { x: 30, y: 70, role: 'CB' }, { x: 50, y: 70, role: 'CB' }, { x: 70, y: 70, role: 'CB' },
    { x: 20, y: 50, role: 'LM' }, { x: 40, y: 48, role: 'CM' }, { x: 60, y: 48, role: 'CM' }, { x: 80, y: 50, role: 'RM' },
    { x: 20, y: 25, role: 'LW' }, { x: 50, y: 20, role: 'ST' }, { x: 80, y: 25, role: 'RW' },
  ],

  // 4-3-1-2: four defenders, three midfield, one attacking mid, two strikers
  '4-3-1-2': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 30, y: 52, role: 'CM' }, { x: 50, y: 50, role: 'CM' }, { x: 70, y: 52, role: 'CM' },
    { x: 50, y: 35, role: 'CAM' },
    { x: 40, y: 20, role: 'ST' }, { x: 60, y: 20, role: 'ST' },
  ],

  // 5-4-1: five defenders, four midfielders, lone striker
  '5-4-1': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LWB' }, { x: 35, y: 70, role: 'CB' }, { x: 50, y: 70, role: 'CB' }, { x: 65, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RWB' },
    { x: 25, y: 48, role: 'LM' }, { x: 42, y: 46, role: 'CM' }, { x: 58, y: 46, role: 'CM' }, { x: 75, y: 48, role: 'RM' },
    { x: 50, y: 22, role: 'ST' },
  ],

  // ============ SMALL-SIDED FORMATIONS ============
  
  // 5-a-side (4 outfield + GK)
  '1-2-1': [  // GK + 1 defender + 2 midfielders + 1 striker
    { x: 50, y: 90, role: 'GK' },
    { x: 50, y: 70, role: 'CB' },
    { x: 30, y: 50, role: 'CM' }, { x: 70, y: 50, role: 'CM' },
    { x: 50, y: 25, role: 'ST' },
  ],
  
  '1-1-2': [  // GK + 1 defender + 1 midfielder + 2 strikers
    { x: 50, y: 90, role: 'GK' },
    { x: 50, y: 70, role: 'CB' },
    { x: 50, y: 50, role: 'CM' },
    { x: 35, y: 25, role: 'ST' }, { x: 65, y: 25, role: 'ST' },
  ],

  // 6-a-side (5 outfield + GK)
  '1-3-1': [  // GK + 3 defenders + 1 midfielder + 1 striker
    { x: 50, y: 90, role: 'GK' },
    { x: 25, y: 70, role: 'LB' }, { x: 50, y: 70, role: 'CB' }, { x: 75, y: 70, role: 'RB' },
    { x: 50, y: 50, role: 'CM' },
    { x: 50, y: 25, role: 'ST' },
  ],

  '1-2-2': [  // GK + 2 defenders + 2 midfielders + 2 strikers
    { x: 50, y: 90, role: 'GK' },
    { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' },
    { x: 30, y: 50, role: 'CM' }, { x: 70, y: 50, role: 'CM' },
    { x: 35, y: 25, role: 'ST' }, { x: 65, y: 25, role: 'ST' },
  ],

  '1-2-1-1': [  // GK + 2 defenders + 1 midfielder + 1 striker + 1 support
    { x: 50, y: 90, role: 'GK' },
    { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' },
    { x: 50, y: 55, role: 'CDM' },
    { x: 50, y: 40, role: 'CAM' },
    { x: 50, y: 20, role: 'ST' },
  ],

  // 7-a-side (6 outfield + GK)
  '1-4-1': [  // GK + 4 defenders + 1 midfielder + 1 striker
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 50, y: 50, role: 'CM' },
    { x: 50, y: 25, role: 'ST' },
  ],

  '1-3-2': [  // GK + 3 defenders + 2 midfielders + 1 striker
    { x: 50, y: 90, role: 'GK' },
    { x: 30, y: 70, role: 'CB' }, { x: 50, y: 70, role: 'CB' }, { x: 70, y: 70, role: 'CB' },
    { x: 35, y: 50, role: 'CM' }, { x: 65, y: 50, role: 'CM' },
    { x: 50, y: 25, role: 'ST' },
  ],

  '1-3-1-1': [  // GK + 3 defenders + 1 defensive mid + 1 attacking mid + 1 striker
    { x: 50, y: 90, role: 'GK' },
    { x: 30, y: 70, role: 'CB' }, { x: 50, y: 70, role: 'CB' }, { x: 70, y: 70, role: 'CB' },
    { x: 50, y: 55, role: 'CDM' },
    { x: 50, y: 40, role: 'CAM' },
    { x: 50, y: 20, role: 'ST' },
  ],

  '2-3-1': [  // GK + 2 defenders + 3 midfielders + 1 striker (flat back 2)
    { x: 50, y: 90, role: 'GK' },
    { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' },
    { x: 25, y: 50, role: 'LM' }, { x: 50, y: 45, role: 'CM' }, { x: 75, y: 50, role: 'RM' },
    { x: 50, y: 25, role: 'ST' },
  ],
};

export const ROLE_LABELS: Record<string, string> = {
  GK: 'Goalkeeper',
  LB: 'Left Back',
  CB: 'Centre Back',
  RB: 'Right Back',
  LWB: 'Left Wing Back',
  RWB: 'Right Wing Back',
  CDM: 'Defensive Mid',
  CM: 'Centre Mid',
  LM: 'Left Mid',
  RM: 'Right Mid',
  CAM: 'Attacking Mid',
  LW: 'Left Winger',
  RW: 'Right Winger',
  ST: 'Striker',
};

export const PLAY_STYLES: PlayStyle[] = ['balanced', 'possession', 'direct', 'counter', 'high_press', 'low_block'];

export const PLAY_STYLE_LABELS: Record<PlayStyle, { name: string; description: string; icon: string }> = {
  balanced: { name: 'Balanced', description: 'Control the tempo, stay dangerous', icon: '⚖️' },
  possession: { name: 'Possession', description: 'Suffocate them with the ball', icon: '🎯' },
  direct: { name: 'Direct', description: 'Vertical, fast, no mercy', icon: '🚀' },
  counter: { name: 'Counter Attack', description: 'Absorb, then strike on the break', icon: '⚡' },
  high_press: { name: 'High Press', description: 'Hunt them down from the first whistle', icon: '🔥' },
  low_block: { name: 'Low Block', description: 'Compact, disciplined, unbreakable', icon: '🛡️' },
};

export const SET_PIECE_OPTIONS = {
  corners: [
    { value: 'near_post', label: 'Near Post' },
    { value: 'far_post', label: 'Far Post' },
    { value: 'edge_of_box', label: 'Edge of Box' },
    { value: 'short', label: 'Short' },
  ],
  freeKicks: [
    { value: 'shoot', label: 'Shoot on Goal' },
    { value: 'cross', label: 'Cross In' },
    { value: 'short_pass', label: 'Short Pass' },
  ],
};

export const DEFAULT_TACTICS: Tactics = {
  formation: '4-4-2',
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
    penalties: '',
  },
};

export const TACTICAL_PRESETS: Array<{
  id: string;
  name: string;
  description: string;
  formation: Formation;
  style: PlayStyle;
  instructions: TeamInstructions;
}> = [
  {
    id: 'pressure',
    name: 'Pressure Lock',
    description: 'Suffocate build-up, win the ball early.',
    formation: '4-3-3',
    style: 'high_press',
    instructions: { width: 'wide', tempo: 'fast', passing: 'mixed', pressing: 'high', defensiveLine: 'high' },
  },
  {
    id: 'possession',
    name: 'Control Room',
    description: 'Dominate midfield, stretch the pitch.',
    formation: '4-3-3',
    style: 'possession',
    instructions: { width: 'wide', tempo: 'slow', passing: 'short', pressing: 'medium', defensiveLine: 'normal' },
  },
  {
    id: 'counter',
    name: 'Counter Wire',
    description: 'Stay compact, break fast.',
    formation: '4-5-1',
    style: 'counter',
    instructions: { width: 'narrow', tempo: 'fast', passing: 'long', pressing: 'low', defensiveLine: 'deep' },
  },
  {
    id: 'direct',
    name: 'Vertical Punch',
    description: 'Direct routes, win second balls.',
    formation: '4-4-2',
    style: 'direct',
    instructions: { width: 'normal', tempo: 'fast', passing: 'long', pressing: 'medium', defensiveLine: 'normal' },
  },
];

/**
 * Get the position for a given role
 * Maps roles to their preferred player position category
 */
export function getRolePosition(role: string): PlayerPosition {
  const roleToPosition: Record<string, PlayerPosition> = {
    GK: 'GK',
    LB: 'DF', CB: 'DF', RB: 'DF',
    LWB: 'DF', RWB: 'DF',
    CDM: 'MF', CM: 'MF', LM: 'MF', RM: 'MF', CAM: 'MF',
    LW: 'WG', RW: 'WG',
    ST: 'ST',
  };
  return roleToPosition[role] || 'MF';
}

/**
 * Score a player for a given role based on position compatibility
 * Higher score = better fit
 */
export function scorePlayerForRole(player: { position: string }, role: string): number {
  const rolePos = getRolePosition(role);
  if (player.position === rolePos) return 3;
  if (rolePos === 'MF' && (player.position === 'DF' || player.position === 'WG')) return 1;
  if (rolePos === 'WG' && player.position === 'ST') return 1;
  return 0;
}

/**
 * Build an automatic lineup based on formation and available players
 */
export function buildAutoLineup(
  formationRoles: string[],
  players: Array<{ id: string; position: string }>
): string[] {
  const assigned = new Set<string>();
  return formationRoles.map((role) => {
    const candidates = players
      .filter((p) => !assigned.has(p.id))
      .sort((a, b) => scorePlayerForRole(b, role) - scorePlayerForRole(a, role));
    const pick = candidates[0];
    if (pick) assigned.add(pick.id);
    return pick?.id || '';
  });
}

/**
 * Reconcile a lineup when formation changes
 * Keeps players in the same relative positions when possible
 */
export function reconcileLineup(
  formationRoles: string[],
  players: Array<{ id: string; position: string }>,
  previousLineup: string[]
): string[] {
  const available = new Set(players.map((p) => p.id));
  const kept = previousLineup.filter((id) => id && available.has(id));
  const used = new Set(kept);

  return formationRoles.map((_role, idx) => {
    const prev = previousLineup[idx];
    if (prev && available.has(prev) && !used.has(prev)) {
      used.add(prev);
      return prev;
    }
    const candidates = players.filter((p) => !used.has(p.id));
    const pick = candidates[0];
    if (pick) used.add(pick.id);
    return pick?.id || '';
  });
}

/**
 * Get formations available for a given squad size
 */
export function getFormationsBySquadSize(size: SquadSize): Formation[] {
  const allFormations = Object.keys(FORMATIONS) as Formation[];
  
  if (size === 11) {
    return allFormations.filter(f => !['1-2-1', '1-1-2', '1-3-1', '1-2-2', '1-2-1-1', '1-4-1', '1-3-2', '1-3-1-1', '2-3-1'].includes(f));
  }
  
  return allFormations.filter(f => {
    const positions = FORMATIONS[f];
    const outfieldCount = positions.length - 1; // Exclude GK
    return outfieldCount === size - 1;
  });
}

/**
 * Get the default formation for a squad size
 */
export function getDefaultFormationForSize(size: SquadSize): Formation {
  const formations = getFormationsBySquadSize(size);
  if (size === 11) return '4-4-2';
  if (size === 7) return '1-4-1';
  if (size === 6) return '1-3-1';
  if (size === 5) return '1-2-1';
  return '4-4-2';
}