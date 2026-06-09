/**
 * Identity service — one read API for the unified player / squad identity card.
 *
 * The `PlayerIdentityCard` (PR 4) and the squad counterpart both consume the
 * shapes returned here. Every field is the canonical read model for its
 * concept; this service is the only place the join between skin (User /
 * Squad) and brain (PlayerTwin / SquadTwin) happens for read purposes.
 *
 * The brain state is hydrated from the same `TwinState` shape that the
 * appliers consume in `twin-service.ts`. Effective stats are computed by
 * summing base + active coaching modifiers.
 *
 * Narrative: `narrative.ts` generates a one-paragraph summary via the shared
 * `generateInference` orchestrator. The narrative is *not* cached here —
 * it can be heavy and the call site is responsible for the caching policy.
 */

import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db';
import { imageService } from './image';
import { momentService } from './moments';
import { generatePlayerNarrative, generateSquadNarrative } from './narrative';
import type { AttributeDeltas, AttributeKey, MatchStats } from './twin-types';

// ────────────────────────────────────────────────────────────────────────────
// Public types — the shapes consumed by `PlayerIdentityCard` and the squad
// counterpart. Designed for direct JSON serialisation (no Date / Map).
// ────────────────────────────────────────────────────────────────────────────

export interface PlayerSkin {
  userId: string;
  profileId: string;
  name: string;
  avatarKey: string | null;
  avatarUrl: string | null;
  position: string | null;
  chain: string;
  walletAddress: string;
  ensName: string | null;
  walletLabel: string | null;
}

export interface PlayerBrain {
  twinId: string;
  level: number;
  xp: number;
  prestige: number;
  baseAttributes: Record<AttributeKey, number>;
  effectiveAttributes: Record<AttributeKey, number>;
  matchStats: MatchStats;
  reputation: number;
  attestationCount: number;
  lastAttestationAt: string | null;
  activeModifiers: ReadonlyArray<ActiveModifierDto>;
}

export interface ActiveModifierDto {
  id: string;
  source: 'coaching' | 'peer' | 'system';
  expiresAt: string;
  deltas: AttributeDeltas;
}

export interface MomentDto {
  id: string;
  kind: string;
  tier: string;
  label: string;
  detail: string | null;
  renderedKey: string | null;
  renderedAt: string | null;
  createdAt: string;
}

export interface AttestationDto {
  id: string;
  kind: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface PlayerIdentity {
  skin: PlayerSkin;
  brain: PlayerBrain;
  moments: { recent: ReadonlyArray<MomentDto> };
  narrative: string;
  recentAttestations: ReadonlyArray<AttestationDto>;
}

export interface SquadSkin {
  squadId: string;
  name: string;
  shortName: string | null;
  logoKey: string | null;
  logoUrl: string | null;
  founded: string;
  isPlaceholder: boolean;
}

export interface SquadBrain {
  twinId: string;
  level: number;
  xp: number;
  prestige: number;
  baseAttributes: Record<AttributeKey, number>;
  effectiveAttributes: Record<AttributeKey, number>;
  energy: number;
  energyMax: number;
  twinActive: boolean;
  consensusTags: ReadonlyArray<{ tag: string; count: number }>;
  reputation: number;
  attestationCount: number;
}

export interface SquadMemberDigest {
  profileId: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  isCaptain: boolean;
}

export interface SquadIdentity {
  skin: SquadSkin;
  brain: SquadBrain;
  members: {
    captainId: string | null;
    total: number;
    top: ReadonlyArray<SquadMemberDigest>;
  };
  moments: { recent: ReadonlyArray<MomentDto> };
  narrative: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Player identity
// ────────────────────────────────────────────────────────────────────────────

export class IdentityService {
  private db: PrismaClient;

  constructor(db: PrismaClient = defaultPrisma) {
    this.db = db;
  }

  /**
   * Resolve a player by profile id and return the unified identity card
   * payload. Returns null if the profile doesn't exist.
   */
  async getPlayerIdentity(profileId: string): Promise<PlayerIdentity | null> {
    const profile = await this.db.playerProfile.findUnique({
      where: { id: profileId },
      include: {
        user: true,
        twin: {
          include: {
            agent: { select: { id: true } },
          },
        },
      },
    });
    if (!profile || !profile.user) return null;

    const twin = profile.twin;
    const baseAttributes = (twin?.baseAttributes as Record<AttributeKey, number> | null) ?? defaults();
    const activeModifiers = ((twin?.activeModifiers as any[]) ?? []) as ReadonlyArray<ActiveModifierDto>;
    const effective = applyModifiers(baseAttributes, activeModifiers);

    const [moments, attestations, matchAgg] = await Promise.all([
      momentService.listForSubject('player', profileId, 10),
      this.db.attestation.findMany({
        where: { subjectType: 'player', subjectId: profileId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.db.playerMatchStats.aggregate({
        where: { profileId },
        _count: { _all: true },
        _sum: { goals: true, assists: true },
      }),
    ]);

    const matchCount = matchAgg._count._all ?? 0;
    const goals = matchAgg._sum.goals ?? 0;
    const assists = matchAgg._sum.assists ?? 0;

    const narrative = generatePlayerNarrative({
      name: profile.user.name ?? `Player_${profile.user.walletAddress.slice(0, 8)}`,
      twin: twin
        ? {
            level: twin.level,
            xp: twin.xp,
            prestige: twin.prestige,
            baseAttributes,
            reputation: twin.reputation,
            attestationCount: twin.attestationCount,
          }
        : null,
      matches: matchCount,
      goals,
      assists,
    });

    return {
      skin: {
        userId: profile.user.id,
        profileId: profile.id,
        name: profile.user.name ?? `Player_${profile.user.walletAddress.slice(0, 8)}`,
        avatarKey: profile.user.avatar,
        avatarUrl: imageService.resolveUrl(profile.user.avatar),
        position: profile.user.position,
        chain: profile.user.chain,
        walletAddress: profile.user.walletAddress,
        ensName: profile.user.ensName,
        walletLabel: profile.user.walletLabel,
      },
      brain: {
        twinId: twin?.id ?? 'unborn',
        level: twin?.level ?? 1,
        xp: twin?.xp ?? 0,
        prestige: twin?.prestige ?? 0,
        baseAttributes,
        effectiveAttributes: effective,
        matchStats: {
          matches: matchCount,
          goals,
          assists,
          mvp: 0,
          simWins: 0,
          simPodiums: 0,
        },
        reputation: twin?.reputation ?? 0,
        attestationCount: twin?.attestationCount ?? 0,
        lastAttestationAt: twin?.lastAttestationAt
          ? twin.lastAttestationAt.toISOString()
          : null,
        activeModifiers,
      },
      moments: {
        recent: moments.map(toMomentDto),
      },
      narrative,
      recentAttestations: attestations.map((a) => ({
        id: a.id,
        kind: a.kind,
        createdAt: a.createdAt.toISOString(),
        payload: (a.payload as Record<string, unknown>) ?? {},
      })),
    };
  }

  /**
   * Resolve a squad by id and return the unified identity card payload.
   * Returns null if the squad doesn't exist.
   */
  async getSquadIdentity(squadId: string): Promise<SquadIdentity | null> {
    const squad = await this.db.squad.findUnique({
      where: { id: squadId },
      include: {
        squadTwin: true,
        members: {
          orderBy: { joinedAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                playerProfile: {
                  select: { id: true, level: true },
                },
              },
            },
          },
        },
      },
    });
    if (!squad) return null;

    const twin = squad.squadTwin;
    const baseAttributes = (twin?.baseAttributes as Record<AttributeKey, number> | null) ?? defaults();
    const consensus = (twin?.consensusTags as Record<string, number> | null) ?? {};

    const [moments, matchCount] = await Promise.all([
      momentService.listForSubject('squad', squadId, 10),
      this.db.match.count({
        where: { OR: [{ homeSquadId: squadId }, { awaySquadId: squadId }], status: 'verified' },
      }),
    ]);

    const narrative = generateSquadNarrative({
      name: squad.name,
      twin: twin
        ? {
            level: twin.level,
            xp: twin.xp,
            prestige: twin.prestige,
            baseAttributes,
            energy: twin.energy,
            energyMax: twin.energyMax,
            reputation: twin.reputation,
          }
        : null,
      matches: matchCount,
      consensusTags: consensus,
    });

    const captain = squad.members.find((m) => m.role === 'captain');
    const memberDigests: SquadMemberDigest[] = squad.members.slice(0, 8).map((m) => ({
      profileId: m.user.playerProfile?.id ?? m.userId,
      userId: m.userId,
      name: m.user.name ?? 'Member',
      avatarUrl: imageService.resolveUrl(m.user.avatar),
      level: m.user.playerProfile?.level ?? 1,
      isCaptain: m.role === 'captain',
    }));

    return {
      skin: {
        squadId: squad.id,
        name: squad.name,
        shortName: squad.shortName,
        logoKey: squad.logo,
        logoUrl: imageService.resolveUrl(squad.logo),
        founded: squad.founded.toISOString(),
        isPlaceholder: squad.isPlaceholder,
      },
      brain: {
        twinId: twin?.id ?? 'unborn',
        level: twin?.level ?? 1,
        xp: twin?.xp ?? 0,
        prestige: twin?.prestige ?? 0,
        baseAttributes,
        effectiveAttributes: baseAttributes, // squad has no coaching modifiers in PR 3
        energy: twin?.energy ?? 100,
        energyMax: twin?.energyMax ?? 100,
        twinActive: twin?.twinActive ?? true,
        consensusTags: Object.entries(consensus)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count })),
        reputation: twin?.reputation ?? 0,
        attestationCount: twin?.attestationCount ?? 0,
      },
      members: {
        captainId: captain?.userId ?? null,
        total: squad.members.length,
        top: memberDigests,
      },
      moments: {
        recent: moments.map(toMomentDto),
      },
      narrative,
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function defaults(): Record<AttributeKey, number> {
  return { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 };
}

function applyModifiers(
  base: Record<AttributeKey, number>,
  mods: ReadonlyArray<ActiveModifierDto>,
): Record<AttributeKey, number> {
  const out: Record<AttributeKey, number> = { ...base };
  for (const mod of mods) {
    for (const key of Object.keys(mod.deltas) as AttributeKey[]) {
      const delta = mod.deltas[key];
      if (delta === undefined) continue;
      out[key] = Math.max(0, Math.min(99, (out[key] ?? 50) + delta));
    }
  }
  return out;
}

function toMomentDto(row: { id: string; kind: string; tier: string; label: string; detail: string | null; renderedKey: string | null; renderedAt: Date | null; createdAt: Date }): MomentDto {
  return {
    id: row.id,
    kind: row.kind,
    tier: row.tier,
    label: row.label,
    detail: row.detail,
    renderedKey: row.renderedKey,
    renderedAt: row.renderedAt ? row.renderedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export const identityService = new IdentityService();
