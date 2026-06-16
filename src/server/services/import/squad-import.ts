/**
 * Squad Import Service — captain-first spreadsheet import flow (P2.1).
 *
 * Lifecycle of an import:
 *   1. Parse raw CSV/text input into structured rows
 *   2. Auto-detect column headers → internal field names
 *   3. Create the squad with the captain as owner
 *   4. For each imported player, create a placeholder User row +
 *      a pending SquadMember + a SquadPlayerContext with any stats
 *   5. Return the created squad + invite-ready player list
 *
 * After import, the captain shares invite links. When a real user claims
 * their spot, the placeholder record is upgraded with their real wallet.
 */

import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface ImportedPlayer {
  name: string;
  position?: string;
  goals: number;
  assists: number;
  matchesPlayed: number;
}

export interface ImportedMatch {
  /** ISO date string for when the match was played */
  date: string;
  /** Opponent name */
  opponent: string;
  /** Goals scored by the importing squad */
  goalsFor: number;
  /** Goals conceded */
  goalsAgainst: number;
  /** Competition name (optional) */
  competition?: string;
  /** Venue: home, away, or neutral */
  venue?: 'home' | 'away' | 'neutral';
}

/** Player-level column field types */
export type PlayerField = 'name' | 'position' | 'goals' | 'assists' | 'matchesPlayed' | 'skip';

/** Match-history column field types */
export type MatchField = 'date' | 'opponent' | 'goalsFor' | 'goalsAgainst' | 'competition' | 'venue' | 'skip';

export interface ColumnMapping {
  /** The internal field this column maps to */
  field: PlayerField | MatchField;
  /** Display label shown in the mapping UI */
  label: string;
}

export interface ImportPreview {
  /** Headers detected from the first row */
  headers: string[];
  /** First few rows for preview */
  previewRows: string[][];
  /** Auto-detected column mapping */
  autoMapping: ColumnMapping[];
  /** Total rows (excluding header) */
  totalRows: number;
}

export interface ImportResult {
  squadId: string;
  squadName: string;
  players: ImportedPlayer[];
  captainInviteUrl: string;
  playerInviteUrls: Array<{ name: string; url: string }>;
}

// ────────────────────────────────────────────────────────────────────────────
// Known column-header patterns for auto-detection
// ────────────────────────────────────────────────────────────────────────────

// ── Player column patterns ──
const PLAYER_HEADER_PATTERNS: Array<{ patterns: RegExp[]; field: PlayerField; label: string }> = [
  {
    patterns: [/^name$/i, /^player$/i, /^full\s*name$/i, /^player\s*name$/i, /^nom$/i],
    field: 'name',
    label: 'Player Name',
  },
  {
    patterns: [/^pos/i, /^position$/i, /^role$/i, /^rôle$/i],
    field: 'position',
    label: 'Position',
  },
  {
    patterns: [/^goals?$/i, /^g$/i, /^buts?$/i],
    field: 'goals',
    label: 'Goals',
  },
  {
    patterns: [/^assists?$/i, /^a$/i, /^assists?$/i, /^passes\s*d/i],
    field: 'assists',
    label: 'Assists',
  },
  {
    patterns: [/^matches$/i, /^apps$/i, /^games$/i, /^appearances$/i, /^played$/i, /^match(es)?\s*played$/i],
    field: 'matchesPlayed',
    label: 'Matches Played',
  },
];

// ── Match-history column patterns ──
const MATCH_HEADER_PATTERNS: Array<{ patterns: RegExp[]; field: MatchField; label: string }> = [
  {
    patterns: [/^date$/i, /^match\s*date$/i, /^datum$/i],
    field: 'date',
    label: 'Match Date',
  },
  {
    patterns: [/^opponent$/i, /^vs\.?$/i, /^versus$/i, /^against$/i, /^adversaire$/i],
    field: 'opponent',
    label: 'Opponent',
  },
  {
    patterns: [/^goals?\s*for$/i, /^goals?\s*scored$/i, /^gf$/i, /^scored$/i, /^for$/i, /^our\s*goals?$/i],
    field: 'goalsFor',
    label: 'Goals For',
  },
  {
    patterns: [/^goals?\s*against$/i, /^goals?\s*conceded$/i, /^ga$/i, /^conceded$/i, /^against$/i, /^their\s*goals?$/i],
    field: 'goalsAgainst',
    label: 'Goals Against',
  },
  {
    patterns: [/^competition$/i, /^comp$/i, /^tournament$/i, /^cup$/i, /^league$/i],
    field: 'competition',
    label: 'Competition',
  },
  {
    patterns: [/^venue$/i, /^home\s*\/?\s*away$/i, /^h\/?a$/i, /^location$/i],
    field: 'venue',
    label: 'Venue',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// CSV Parser
// ────────────────────────────────────────────────────────────────────────────

/**
 * Parse raw CSV/TSV/delimited text into rows of strings.
 * Handles quoted fields, commas, tabs, and semicolons as delimiters.
 */
function parseDelimitedText(raw: string, delimiter?: string): string[][] {
  const lines = raw.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter from first line if not specified
  if (!delimiter) {
    const firstLine = lines[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const semiCount = (firstLine.match(/;/g) || []).length;

    if (tabCount > commaCount && tabCount > semiCount) delimiter = '\t';
    else if (semiCount > commaCount && semiCount > tabCount) delimiter = ';';
    else delimiter = ',';
  }

  return lines.map(line => {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    return row;
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Column auto-detection
// ────────────────────────────────────────────────────────────────────────────

function detectColumnMapping(headers: string[], context: 'player' | 'match' = 'player'): ColumnMapping[] {
  const patterns = context === 'player' ? PLAYER_HEADER_PATTERNS : MATCH_HEADER_PATTERNS;
  return headers.map(header => {
    const trimmed = header.trim();
    for (const pattern of patterns) {
      if (pattern.patterns.some(re => re.test(trimmed))) {
        return { field: pattern.field, label: pattern.label };
      }
    }
    return { field: 'skip', label: trimmed };
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Parse rows into structured players using a column mapping
// ────────────────────────────────────────────────────────────────────────────

function parsePlayers(
  rows: string[][],
  headers: string[],
  mapping: ColumnMapping[],
): ImportedPlayer[] {
  return rows.map(row => {
    const player: ImportedPlayer = { name: '', goals: 0, assists: 0, matchesPlayed: 0 };
    for (let i = 0; i < Math.min(row.length, mapping.length); i++) {
      const field = mapping[i].field;
      const value = row[i]?.trim() ?? '';

      switch (field) {
        case 'name':
          player.name = value;
          break;
        case 'position': {
          // Normalize position to shorhand: GK, DF, MF, ST, WG
          const pos = value.toUpperCase();
          if (['GK', 'DF', 'MF', 'ST', 'WG'].includes(pos)) {
            player.position = pos;
          } else if (/goal|gardien|keeper/i.test(pos)) {
            player.position = 'GK';
          } else if (/def|back|centre.?back|full.?back/i.test(pos)) {
            player.position = 'DF';
          } else if (/mid|central|milieu/i.test(pos)) {
            player.position = 'MF';
          } else if (/striker|attack|forward|buteur/i.test(pos)) {
            player.position = 'ST';
          } else if (/wing|winger|aile/i.test(pos)) {
            player.position = 'WG';
          }
          break;
        }
        case 'goals':
          player.goals = parseInt(value, 10) || 0;
          break;
        case 'assists':
          player.assists = parseInt(value, 10) || 0;
          break;
        case 'matchesPlayed':
          player.matchesPlayed = parseInt(value, 10) || 0;
          break;
      }
    }
    return player;
  }).filter(p => p.name.trim().length > 0);
}

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

/**
 * Parse raw delimited text and return a preview with auto-detected mapping.
 * No data is persisted — the caller uses this to show the mapping UI.
 */
/**
 * Parse raw delimited text as match-history data and return a preview.
 */
export async function parseMatchImportPreview(
  raw: string,
  delimiter?: string,
): Promise<ImportPreview> {
  const rows = parseDelimitedText(raw, delimiter);
  if (rows.length === 0) {
    throw new Error('No data found. Make sure your data has a header row and at least one match.');
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);
  const autoMapping = detectColumnMapping(headers, 'match');
  const hasDate = autoMapping.some(m => m.field === 'date');
  const hasOpponent = autoMapping.some(m => m.field === 'opponent');

  if (!hasDate) {
    throw new Error(
      'Could not detect a date column. Make sure the first row has a header like "Date" or "Match Date".',
    );
  }
  if (!hasOpponent) {
    throw new Error(
      'Could not detect an opponent column. Make sure the first row has a header like "Opponent" or "Vs".',
    );
  }

  return {
    headers,
    previewRows: dataRows.slice(0, 5),
    autoMapping,
    totalRows: dataRows.length,
  };
}

/**
 * Parse raw delimited text and return a preview with auto-detected mapping.
 * No data is persisted — the caller uses this to show the mapping UI.
 */
export async function parseImportPreview(
  raw: string,
  delimiter?: string,
): Promise<ImportPreview> {
  const rows = parseDelimitedText(raw, delimiter);
  if (rows.length === 0) {
    throw new Error('No data found. Make sure your spreadsheet has at least a header row and one player.');
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);
  const autoMapping = detectColumnMapping(headers);
  const hasNameColumn = autoMapping.some(m => m.field === 'name');

  if (!hasNameColumn) {
    throw new Error(
      'Could not detect a player name column. Make sure the first row has a header like "Name" or "Player".',
    );
  }

  return {
    headers,
    previewRows: dataRows.slice(0, 5),
    autoMapping,
    totalRows: dataRows.length,
  };
}

// ── Match-history row parser ──

function parseMatches(
  rows: string[][],
  headers: string[],
  mapping: ColumnMapping[],
): ImportedMatch[] {
  return rows.map(row => {
    const match: Partial<ImportedMatch> = {};
    for (let i = 0; i < Math.min(row.length, mapping.length); i++) {
      const field = mapping[i].field as MatchField;
      const value = row[i]?.trim() ?? '';

      switch (field) {
        case 'date':
          match.date = value;
          break;
        case 'opponent':
          match.opponent = value;
          break;
        case 'goalsFor':
          match.goalsFor = parseInt(value, 10) || 0;
          break;
        case 'goalsAgainst':
          match.goalsAgainst = parseInt(value, 10) || 0;
          break;
        case 'competition':
          match.competition = value || undefined;
          break;
        case 'venue': {
          const v = value.toUpperCase();
          if (v === 'HOME' || v === 'H') match.venue = 'home';
          else if (v === 'AWAY' || v === 'A') match.venue = 'away';
          else match.venue = 'neutral';
          break;
        }
      }
    }
    return match as ImportedMatch;
  }).filter(m => m.date && m.date.trim().length > 0 && m.opponent && m.opponent.trim().length > 0);
}

/**
 * Commit a match-history import: create Moment rows for each historical match
 * linked to the given squad. Moments appear in the squad's in-app gallery.
 *
 * @param raw — raw CSV/text input
 * @param mapping — user-verified column mapping
 * @param squadId — the squad to attach moments to
 * @param options.prisma — optional Prisma client (for testing)
 * @param options.delimiter — optional delimiter override
 */
export async function commitMatchHistoryImport(
  raw: string,
  mapping: ColumnMapping[],
  squadId: string,
  options: {
    prisma?: PrismaClient;
    delimiter?: string;
  } = {},
): Promise<{ matches: ImportedMatch[]; momentsCreated: number }> {
  const db = options.prisma ?? defaultPrisma;

  const rows = parseDelimitedText(raw, options.delimiter);
  if (rows.length < 2) throw new Error('No data rows found.');

  const headers = rows[0];
  const dataRows = rows.slice(1);
  const matches = parseMatches(dataRows, headers, mapping);

  if (matches.length === 0) {
    throw new Error('No valid matches found. Each row needs a date and opponent.');
  }

  await db.$transaction(async (tx) => {
    for (const match of matches) {
      const goalDiff = match.goalsFor - match.goalsAgainst;
      const resultLabel = goalDiff > 0 ? 'W' : goalDiff < 0 ? 'L' : 'D';

      await tx.moment.create({
        data: {
          subjectType: 'squad',
          subjectId: squadId,
          kind: 'match_imported',
          tier: 'standard',
          label: `${resultLabel} ${match.goalsFor}-${match.goalsAgainst} vs ${match.opponent}`,
          detail: match.competition
            ? `${match.venue === 'home' ? 'Home' : match.venue === 'away' ? 'Away' : 'Neutral'} · ${match.competition}`
            : match.venue
              ? `${match.venue === 'home' ? 'Home' : match.venue === 'away' ? 'Away' : 'Neutral'}`
              : null,
          createdAt: new Date(match.date),
        },
      });
    }
  });

  return { matches, momentsCreated: matches.length };
}

/**
 * Commit the import: create squad, placeholder users, pending members, and
 * squad-player contexts with imported stats.
 *
 * @param raw — raw CSV/text input
 * @param mapping — user-verified column mapping (from preview step)
 * @param squadName — name for the new squad
 * @param captainUserId — the current user's ID (becomes captain)
 * @param options.prisma — optional Prisma client (for testing)
 * @param options.delimiter — optional delimiter override
 * @param options.origin — origin for invite URLs (e.g. https://sportwarren.com)
 */
export async function commitSquadImport(
  raw: string,
  mapping: ColumnMapping[],
  squadName: string,
  captainUserId: string,
  options: {
    prisma?: PrismaClient;
    delimiter?: string;
    origin?: string;
  } = {},
): Promise<ImportResult> {
  const db = options.prisma ?? defaultPrisma;
  const origin = options.origin ?? 'https://sportwarren.com';

  const rows = parseDelimitedText(raw, options.delimiter);
  if (rows.length < 2) throw new Error('No data rows found.');

  const headers = rows[0];
  const dataRows = rows.slice(1);
  const players = parsePlayers(dataRows, headers, mapping);

  if (players.length === 0) {
    throw new Error('No valid players found. Each row needs a name.');
  }

  const shortName = squadName
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 5)
    .toUpperCase() || squadName.trim().slice(0, 5).toUpperCase();

  // Create squad + captain membership + placeholder users + squad twin in
  // a single transaction for atomicity.
  const result = await db.$transaction(async (tx) => {
    const squad = await tx.squad.create({
      data: {
        name: squadName.trim(),
        shortName,
        members: {
          create: {
            userId: captainUserId,
            role: 'captain',
          },
        },
      },
    });

    // Create squad twin
    await tx.squadTwin.create({
      data: {
        squadId: squad.id,
        baseAttributes: {
          pace: 50,
          shooting: 50,
          passing: 50,
          dribbling: 50,
          defending: 50,
          physical: 50,
        },
      },
    });

    // Create placeholder user + pending membership + context for each player
    const createdPlayers: ImportedPlayer[] = [];

    for (const player of players) {
      const placeholderWallet = `imported_${randomUUID()}`;

      const user = await tx.user.create({
        data: {
          walletAddress: placeholderWallet,
          chain: 'imported',
          name: player.name.trim(),
          position: player.position ?? null,
        },
      });

      await tx.squadMember.create({
        data: {
          squadId: squad.id,
          userId: user.id,
          role: 'player',
          status: 'pending',
        },
      });

      await tx.squadPlayerContext.create({
        data: {
          userId: user.id,
          squadId: squad.id,
          role: 'player',
          position: player.position ?? null,
          goals: player.goals,
          assists: player.assists,
          matchesPlayed: player.matchesPlayed,
          squadXP: (player.goals * 5) + (player.assists * 3) + (player.matchesPlayed * 2),
          sharpness: 50,
          form: 'neutral',
        },
      });

      createdPlayers.push(player);
    }

    return { squad, createdPlayers };
  });

  const captainInviteUrl = `${origin}/join/${result.squad.id}?role=captain`;
  const playerInviteUrls = result.createdPlayers.map(p => ({
    name: p.name,
    url: `${origin}/join/${result.squad.id}?player=${encodeURIComponent(p.name)}`,
  }));

  return {
    squadId: result.squad.id,
    squadName: squadName.trim(),
    players: result.createdPlayers,
    captainInviteUrl,
    playerInviteUrls,
  };
}
