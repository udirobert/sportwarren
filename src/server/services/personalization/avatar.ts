/**
 * Avatar data resolver — single source of truth for resolving a player's
 * illustrated avatar and a squad's crest data.
 *
 * Fallback chain:
 *   1. User's customized fields (avatarKitColor, etc.)
 *   2. Squad defaults (kitColor, accentColor)
 *   3. Palette defaults (V3.RED, V3.NAVY, SKIN_MID, HAIR_DARK, 'short')
 *
 * Consumed by:
 *   - moment-render-v2.ts (card rendering)
 *   - avatar tRPC router (read surface for UI)
 *   - Future: onboarding wizard, captain admin, backfill scripts
 */

import { prisma } from '@/lib/db';
import type { ResolvedAvatar, ResolvedCrest, HairStyle } from '@/components/moments/cards/types';

export type { ResolvedAvatar, ResolvedCrest, HairStyle };

const HAIR_STYLES: ReadonlySet<string> = new Set(['short', 'tall', 'shaved', 'cap']);

const DEFAULTS = {
  kitColor: '#c91022',
  accentColor: '#1c3a5e',
  skinTone: '#c89e7c',
  hairColor: '#2a1a10',
  hairStyle: 'short' as HairStyle,
  number: '0',
};

const POSITION_NUMBER: Record<string, string> = {
  GK: '1',
  DF: '4',
  CB: '5',
  MF: '8',
  CM: '10',
  WG: '7',
  ST: '9',
  CF: '9',
};

function isHairStyle(v: string | null | undefined): v is HairStyle {
  return v != null && HAIR_STYLES.has(v);
}

function initialsFromName(name: string | null | undefined): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function foundedYear(d: Date | null | undefined): string {
  if (!d) return "''00";
  const y = d.getFullYear().toString().slice(-2);
  return `'${y}`;
}

export async function resolveAvatarData(
  userId: string,
  squadId?: string,
): Promise<ResolvedAvatar> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      avatarKitColor: true,
      avatarAccentColor: true,
      avatarSkinTone: true,
      avatarHairColor: true,
      avatarHairStyle: true,
      avatarNumber: true,
      position: true,
    },
  });

  let squadKit: string | null = null;
  let squadAccent: string | null = null;

  if (squadId) {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { kitColor: true, accentColor: true },
    });
    squadKit = squad?.kitColor ?? null;
    squadAccent = squad?.accentColor ?? null;
  } else if (user) {
    const membership = await prisma.squadMember.findFirst({
      where: { userId, status: 'active' },
      select: { squad: { select: { kitColor: true, accentColor: true } } },
    });
    squadKit = membership?.squad.kitColor ?? null;
    squadAccent = membership?.squad.accentColor ?? null;
  }

  const posNumber = user?.position ? POSITION_NUMBER[user.position] : undefined;

  return {
    kitColor: user?.avatarKitColor ?? squadKit ?? DEFAULTS.kitColor,
    accentColor: user?.avatarAccentColor ?? squadAccent ?? DEFAULTS.accentColor,
    skinTone: user?.avatarSkinTone ?? DEFAULTS.skinTone,
    hairColor: user?.avatarHairColor ?? DEFAULTS.hairColor,
    hairStyle: isHairStyle(user?.avatarHairStyle) ? user.avatarHairStyle : DEFAULTS.hairStyle,
    number: user?.avatarNumber ?? posNumber ?? DEFAULTS.number,
  };
}

export async function resolveCrestData(
  squadId: string,
): Promise<ResolvedCrest> {
  const squad = await prisma.squad.findUnique({
    where: { id: squadId },
    select: { name: true, shortName: true, founded: true, kitColor: true, accentColor: true },
  });

  if (!squad) {
    return {
      kitColor: DEFAULTS.kitColor,
      accentColor: DEFAULTS.accentColor,
      initials: '??',
      founded: "''00",
    };
  }

  return {
    kitColor: squad.kitColor ?? DEFAULTS.kitColor,
    accentColor: squad.accentColor ?? DEFAULTS.accentColor,
    initials: initialsFromName(squad.shortName || squad.name),
    founded: foundedYear(squad.founded),
  };
}

/**
 * Resolve the squadId for a player-scoped moment.
 * Returns the first active squad membership, or null.
 */
export async function resolvePlayerSquadId(userId: string): Promise<string | null> {
  const membership = await prisma.squadMember.findFirst({
    where: { userId, status: 'active' },
    select: { squadId: true },
  });
  return membership?.squadId ?? null;
}
