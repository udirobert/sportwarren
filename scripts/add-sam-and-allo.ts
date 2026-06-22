/**
 * One-off seed: add Sam (CB) and Allo (CAM) to the existing Tuesday
 * Kickabout squad + seed the initial perception data the user shared
 * from their WhatsApp hypothesis test:
 *
 *   Sam (D about Allo)   — Sam thinks Allo launches it long
 *   Allo (A about Sam)   — Allo thinks Sam plays it short to a CB
 *   Kim (C about Fred)   — Kim thinks Fred miscontrols
 *   Fred (D about Kim)   — Fred thinks Kim launches it long
 *
 * Scenario: `ball_own_half`, kind: `descriptive`.
 *
 * Idempotent: looks up existing users by name within the squad and
 * skips creation if they already exist. Perception inserts upsert
 * via the unique (rater, target, scenario, kind) key.
 *
 * Run with:
 *   DATABASE_URL="..." pnpm tsx scripts/add-sam-and-allo.ts
 */

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { randomBytes } from 'node:crypto';
import { baselineForPosition } from '../src/server/services/personalization/position-baselines';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env', override: false });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error', 'warn'] });

const V3_PALETTE = {
  cream: '#f0e8d6',
  red: '#c91022',
  navy: '#1c3a5e',
  sage: '#4a7549',
  mustard: '#d4a437',
};

const SQUAD_NAME = 'Tuesday Kickabout';

// New players to add
const NEW_PLAYERS = [
  {
    name: 'Sam',
    position: 'CB',
    kit: V3_PALETTE.navy,
    accent: V3_PALETTE.cream,
  },
  {
    name: 'Allo',
    position: 'CAM',
    kit: V3_PALETTE.red,
    accent: V3_PALETTE.mustard,
  },
];

// Perception rows to seed.
// Identified by player names — looked up after provisioning.
const PERCEPTIONS = [
  { rater: 'Sam',     target: 'Allo',    scenarioId: 'ball_own_half', choice: 'd', kind: 'descriptive' },
  { rater: 'Allo',    target: 'Sam',     scenarioId: 'ball_own_half', choice: 'a', kind: 'descriptive' },
  { rater: 'Kim',     target: 'Freddie', scenarioId: 'ball_own_half', choice: 'c', kind: 'descriptive' },
  { rater: 'Freddie', target: 'Kim',     scenarioId: 'ball_own_half', choice: 'd', kind: 'descriptive' },
];

function makeToken(name: string): string {
  const suffix = randomBytes(4).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
  return `${name.toLowerCase()}-${suffix}`;
}

function handleFromName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

/**
 * Best-effort handle assignment. Collisions (P2002) are caught and
 * logged — the user record stays valid with handle=null, and the
 * captain can set a custom handle later via Settings → Privacy.
 */
async function safelySetHandle(
  userId: string,
  rawName: string | null | undefined,
): Promise<{ assigned: string | null; collided: boolean }> {
  if (!rawName) return { assigned: null, collided: false };
  const handle = handleFromName(rawName);
  if (!handle || handle.length < 3) return { assigned: null, collided: false };
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { handle },
    });
    return { assigned: handle, collided: false };
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'P2002') {
      console.warn(`  ⚠ Handle @${handle} taken — ${rawName} stays without a handle (set custom via Settings → Privacy)`);
      return { assigned: null, collided: true };
    }
    throw err;
  }
}

async function main() {
  console.log('🔍 Looking up squad…');
  const squad = await prisma.squad.findFirst({ where: { name: SQUAD_NAME } });
  if (!squad) {
    console.error(`❌ Squad "${SQUAD_NAME}" not found. Run the main seed first.`);
    process.exit(1);
  }
  console.log(`✓ Found squad ${squad.name} (id ${squad.id})`);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportwarren.com';

  // 1. Provision Sam + Allo (skip if already exists by name within squad)
  for (const player of NEW_PLAYERS) {
    const existing = await prisma.user.findFirst({
      where: {
        name: player.name,
        squads: { some: { squadId: squad.id } },
      },
    });

    if (existing) {
      console.log(`↺ ${player.name} already exists (userId ${existing.id})`);
      continue;
    }

    const walletAddress = makeToken(player.name);

    // Create user WITHOUT handle first — collisions handled separately
    // by safelySetHandle below so a name clash doesn't block creation.
    const user = await prisma.user.create({
      data: {
        walletAddress,
        chain: 'preview',
        name: player.name,
        position: player.position,
        avatarKitColor: player.kit,
        avatarAccentColor: player.accent,
        avatarSkinTone: '#c89e7c',
        avatarHairColor: '#2a1a10',
        avatarHairStyle: 'short',
        avatarNumber: '',
      },
    });
    await safelySetHandle(user.id, player.name);

    const profile = await prisma.playerProfile.create({
      data: {
        userId: user.id,
        level: 1,
        totalXP: 0,
        seasonXP: 0,
        totalMatches: 0,
        totalGoals: 0,
        totalAssists: 0,
      },
    });

    await prisma.squadMember.create({
      data: {
        squadId: squad.id,
        userId: user.id,
        role: 'player',
      },
    });

    // PlayerTwin — synthetic AiAgent + position-baselined attributes
    const syntheticAgentId = `preview_${profile.id}`;
    const agent = await prisma.aiAgent.upsert({
      where: { agentId: syntheticAgentId },
      update: { name: player.name },
      create: {
        agentId: syntheticAgentId,
        passportId: `preview_passport_${profile.id}`,
        name: player.name,
        type: 'twin_player',
        description: `Preview twin for ${player.name}`,
        ownerType: 'player',
        ownerId: user.id,
        capabilities: [],
      },
    });
    await prisma.playerTwin.create({
      data: {
        profileId: profile.id,
        agentId: agent.id,
        baseAttributes: baselineForPosition(player.position) as object,
      },
    });

    console.log(`  ✓ ${player.name} (${player.position}) → ${baseUrl}/preview/${walletAddress}`);
  }

  // 2. Seed perceptions — map names → profile IDs
  console.log('\n🎯 Seeding perception rows…');
  const memberships = await prisma.squadMember.findMany({
    where: { squadId: squad.id },
    include: { user: { include: { playerProfile: true } } },
  });
  const byName = new Map<string, string>();
  for (const m of memberships) {
    if (m.user.name && m.user.playerProfile) {
      byName.set(m.user.name, m.user.playerProfile.id);
    }
  }

  for (const p of PERCEPTIONS) {
    const raterId = byName.get(p.rater);
    const targetId = byName.get(p.target);
    if (!raterId || !targetId) {
      console.warn(`  ⚠ Skipping ${p.rater} → ${p.target}: profile not found`);
      continue;
    }
    await prisma.playerPerception.upsert({
      where: {
        raterId_targetId_scenarioId_kind: {
          raterId,
          targetId,
          scenarioId: p.scenarioId,
          kind: p.kind,
        },
      },
      update: { choice: p.choice },
      create: {
        raterId,
        targetId,
        scenarioId: p.scenarioId,
        choice: p.choice,
        kind: p.kind,
      },
    });
    console.log(`  ✓ ${p.rater} → ${p.target}: ${p.scenarioId} = ${p.choice.toUpperCase()} (${p.kind})`);
  }

  // 3. Backfill handles for existing users who don't have one
  console.log('\n🔑 Seeding handles…');
  const allUsers = await prisma.user.findMany({
    where: { chain: 'preview', squads: { some: { squadId: squad.id } }, handle: null },
  });
  let assigned = 0;
  let collided = 0;
  for (const u of allUsers) {
    const result = await safelySetHandle(u.id, u.name);
    if (result.assigned) {
      console.log(`  ✓ ${u.name} → @${result.assigned}`);
      assigned++;
    } else if (result.collided) {
      collided++;
    }
  }
  if (allUsers.length === 0) console.log('  (none needed)');
  else console.log(`  → ${assigned} assigned, ${collided} collided (kept null)`);

  // 4. Output preview URLs so the user can grab them for WhatsApp
  console.log('\n========================================================');
  console.log('  PREVIEW LINKS — paste into each player\'s WhatsApp');
  console.log('========================================================');
  const all = await prisma.user.findMany({
    where: { chain: 'preview', squads: { some: { squadId: squad.id } } },
    orderBy: { name: 'asc' },
  });
  for (const u of all) {
    const previewUrl = `${baseUrl}/preview/${u.walletAddress}`;
    const playerUrl = u.handle ? `${baseUrl}/player/${u.handle}` : '—';
    console.log(`\n${u.name} (${u.position ?? '—'})`);
    console.log(`  Preview  → ${previewUrl}`);
    console.log(`  Profile  → ${playerUrl}`);
  }
  console.log('\n========================================================\n');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
