/**
 * Daily drill service — generates and completes daily training drills.
 * Each player can complete one drill per day (UTC). Drills award small XP
 * (15-30 based on level) and a +1 attribute boost weighted toward the
 * player's weakest attribute.
 */

import type { PrismaClient } from '@prisma/client';
import type { AttributeKey, TwinState } from './twin-types';
import { ATTRIBUTE_KEYS } from './twin-types';
import { getTwinService } from './twin-service';

const DRILL_TYPES: Record<AttributeKey, string[]> = {
  pace: ['Sprint Intervals', 'Ladder Drills', 'Shuttle Runs'],
  shooting: ['Finishing Practice', 'Penalty Shootout', 'Volley Training'],
  passing: ['Passing Circuit', 'Long Ball Practice', 'One-Touch Drills'],
  dribbling: ['Cone Weave', 'Close Control', '1v1 Skills'],
  defending: ['Defensive Shape', 'Tackle Timing', 'Heading Practice'],
  physical: ['Strength Training', 'Endurance Run', 'Agility Course'],
};

interface DrillResult {
  attribute: AttributeKey;
  xpAwarded: number;
  attributeDelta: number;
  drillType: string;
}

function pickDrillAttribute(baseAttributes: Record<AttributeKey, number>): AttributeKey {
  const values = ATTRIBUTE_KEYS.map(k => ({ key: k, value: baseAttributes[k] ?? 50 }));
  values.sort((a, b) => a.value - b.value);

  const weights = values.map((_, i) => Math.max(1, values.length - i));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < values.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return values[i].key;
    }
  }

  return values[0].key;
}

function generateDrill(baseAttributes: Record<AttributeKey, number>, level: number): DrillResult {
  const attribute = pickDrillAttribute(baseAttributes);
  const drillTypes = DRILL_TYPES[attribute];
  const drillType = drillTypes[Math.floor(Math.random() * drillTypes.length)];

  const baseXP = 15;
  const levelBonus = Math.floor(level / 5) * 2;
  const xpAwarded = Math.min(30, baseXP + levelBonus + Math.floor(Math.random() * 5));

  return {
    attribute,
    xpAwarded,
    attributeDelta: 1,
    drillType,
  };
}

function isSameUTCDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()));
  const d2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()));
  return d1.getTime() === d2.getTime();
}

export async function canDoDrill(userId: string, prisma: PrismaClient): Promise<boolean> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    include: { twin: true },
  });

  if (!profile?.twin) return false;

  if (!profile.twin.lastDailyDrillAt) return true;

  const now = new Date();
  return !isSameUTCDay(profile.twin.lastDailyDrillAt, now);
}

export async function completeDrill(
  userId: string,
  prisma: PrismaClient,
): Promise<{ drill: DrillResult; newLevel: number; newXp: number }> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    include: { twin: true },
  });

  if (!profile?.twin) {
    throw new Error('Player twin not found');
  }

  const now = new Date();
  if (profile.twin.lastDailyDrillAt && isSameUTCDay(profile.twin.lastDailyDrillAt, now)) {
    throw new Error('Daily drill already completed today');
  }

  const baseAttrs = (profile.twin.baseAttributes as Record<AttributeKey, number>) || {
    pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
  };
  const drill = generateDrill(baseAttrs, profile.twin.level);

  const twinService = getTwinService();
  const result = await twinService.recordEvent({
    kind: 'daily_drill',
    twinId: profile.twin.id,
    drill,
  });

  await prisma.playerTwin.update({
    where: { id: profile.twin.id },
    data: { lastDailyDrillAt: now },
  });

  return {
    drill,
    newLevel: result.diff.newLevel,
    newXp: profile.twin.xp + drill.xpAwarded,
  };
}

export async function getDailyDrillStatus(
  userId: string,
  prisma: PrismaClient,
): Promise<{ available: boolean; lastCompletedAt: string | null; currentStreak: number }> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    include: {
      twin: true,
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
    },
  });

  if (!profile?.twin) {
    return { available: false, lastCompletedAt: null, currentStreak: 0 };
  }

  const now = new Date();
  const available = !profile.twin.lastDailyDrillAt || !isSameUTCDay(profile.twin.lastDailyDrillAt, now);

  const drillDates = profile.activities
    .filter(a => a.type === 'daily_drill')
    .map(a => a.createdAt)
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  for (let i = 0; i < drillDates.length; i++) {
    const expected = new Date(today);
    expected.setUTCDate(expected.getUTCDate() - i - (available ? 1 : 0));
    if (isSameUTCDay(drillDates[i], expected)) {
      streak++;
    } else {
      break;
    }
  }

  return {
    available,
    lastCompletedAt: profile.twin.lastDailyDrillAt?.toISOString() ?? null,
    currentStreak: streak,
  };
}
