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
  return `kickabout_${name.toLowerCase()}_${randomBytes(4).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)}`;
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

  // 3. Output preview URLs so the user can grab them for WhatsApp
  console.log('\n========================================================');
  console.log('  PREVIEW LINKS — paste into each player\'s WhatsApp');
  console.log('========================================================');
  const all = await prisma.user.findMany({
    where: { chain: 'preview', squads: { some: { squadId: squad.id } } },
    orderBy: { name: 'asc' },
  });
  for (const u of all) {
    console.log(`\n${u.name} (${u.position ?? '—'})`);
    console.log(`  ${baseUrl}/preview/${u.walletAddress}`);
  }
  console.log('\n========================================================\n');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
