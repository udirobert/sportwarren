import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db';
import { getTwinService } from './twin-service';
import type { AttributeDeltas, AttributeKey } from './twin-types';

export interface HireCoachOpts {
  targetType: 'player' | 'squad';
  targetId: string;
  coachAgentId: string;
  attribute: AttributeKey;
  modifier: number;
  durationDays: number;
  costUsdc: number;
}

export async function hireCoach(
  opts: HireCoachOpts,
  db: PrismaClient = defaultPrisma,
) {
  const expiresAt = new Date(
    Date.now() + opts.durationDays * 24 * 60 * 60 * 1000,
  );

  const effect = await db.coachingEffect.create({
    data: {
      targetType: opts.targetType,
      targetId: opts.targetId,
      coachAgentId: opts.coachAgentId,
      attribute: opts.attribute,
      modifier: opts.modifier,
      expiresAt,
      amountUsdc: opts.costUsdc,
    },
  });

  const twinId = await resolveTwinId(db, opts.targetType, opts.targetId);
  if (!twinId) throw new Error('Twin not found for coaching target');

  const deltas: AttributeDeltas = { [opts.attribute]: opts.modifier };

  await getTwinService().recordEvent({
    kind: 'coaching_hired',
    twinId,
    coachId: opts.coachAgentId,
    effect: {
      deltas,
      durationDays: opts.durationDays,
      costUsdc: opts.costUsdc,
      sessionId: effect.id,
    },
  });

  return effect;
}

export async function cancelEffect(
  effectId: string,
  twinId: string,
  db: PrismaClient = defaultPrisma,
) {
  await db.coachingEffect.update({
    where: { id: effectId },
    data: { active: false },
  });

  await getTwinService().recordEvent({
    kind: 'coaching_expired',
    twinId,
    effectId,
  });
}

export async function getActiveEffects(
  targetType: 'player' | 'squad',
  targetId: string,
  db: PrismaClient = defaultPrisma,
) {
  return db.coachingEffect.findMany({
    where: {
      targetType,
      targetId,
      active: true,
      expiresAt: { gt: new Date() },
    },
    include: { coachAgent: true },
    orderBy: { expiresAt: 'asc' },
  });
}

export async function listAvailableCoaches(
  db: PrismaClient = defaultPrisma,
) {
  return db.aiAgent.findMany({
    where: { type: 'coach_external', serviceActive: true },
    orderBy: { reputation: 'desc' },
  });
}

async function resolveTwinId(
  db: PrismaClient,
  targetType: 'player' | 'squad',
  targetId: string,
): Promise<string | null> {
  if (targetType === 'player') {
    const twin = await db.playerTwin.findUnique({
      where: { profileId: targetId },
    });
    return twin?.id ?? null;
  }
  const twin = await db.squadTwin.findUnique({ where: { squadId: targetId } });
  return twin?.id ?? null;
}
