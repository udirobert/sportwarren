/**
 * Kickabout pre-seed kit.
 *
 *   pnpm tsx scripts/seed-kickabout-session.ts <roster.json>
 *
 * Takes a JSON roster (see seed-kickabout-session.sample.json) and creates:
 *   - 1 Squad ("Tuesday Kickabout" or whatever the group is called)
 *   - N Users (one per player) with illustrated avatar fields populated
 *   - N PlayerProfiles
 *   - N PlayerTwins with attributes derived from position + skill note
 *   - N SquadMembers (everyone in the same group)
 *   - 1 synthetic "last week's session" Match
 *   - N PlayerMatchStats rows (per-player goals/games for last week)
 *
 * Outputs to stdout:
 *   - Per-player preview URL  (https://<host>/preview/<token>)
 *   - Per-player WhatsApp message you can copy-paste
 *
 * The auth model: each User gets walletAddress = "kickabout_<token>" and
 * chain = "preview". The preview route at /preview/[token] resolves the
 * User by that walletAddress and renders a tailored landing surface.
 *
 * Idempotent: re-running on the same roster.json updates existing rows
 * (matched by walletAddress / squad name).
 */

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { baselineForPosition } from '../src/server/services/personalization/position-baselines';
import { generatePrediction } from '../src/server/services/personalization/predictions';

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
  ink: '#0a0a0a',
  red: '#c91022',
  navy: '#1c3a5e',
  sage: '#4a7549',
  mustard: '#d4a437',
  skin: {
    light: '#f0d4b8',
    mid: '#c89e7c',
    dark: '#8b5a3c',
  },
  hair: {
    dark: '#2a1a10',
    brown: '#5c3a1a',
    blond: '#c89048',
    red: '#a64a20',
  },
} as const;

const VALID_HAIR_STYLES = ['short', 'tall', 'shaved', 'cap'] as const;
type HairStyle = (typeof VALID_HAIR_STYLES)[number];

interface RosterPlayer {
  name: string;
  phone?: string;
  position?: string;
  skillNote?: string;
  lastWeekGoals: number;
  lastWeekWins: number;
  lastWeekGames: number;
  look?: {
    skin?: 'light' | 'mid' | 'dark';
    hair?: 'dark' | 'brown' | 'blond' | 'red';
    hairStyle?: HairStyle;
    jerseyNumber?: string;
  };
  isOrganizer?: boolean;
}

interface RosterFile {
  group: {
    name: string;
    shortName: string;
    kitColor?: string;
    accentColor?: string;
    founded?: string;
  };
  session: {
    date: string;
    format: string;
    playersPerSide: number;
    hasKeeper: boolean;
    totalGoals?: number;
    notes?: string;
  };
  organizerWalletAddress?: string;
  roster: RosterPlayer[];
}

function genToken(prefix: string): string {
  const suffix = randomBytes(4).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
  return `${prefix}-${suffix}`;
}

function handleFromName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

/**
 * Best-effort handle assignment. Collisions (P2002) are caught and
 * logged — the user record stays valid with handle=null, and the
 * captain can set a custom handle later via Settings → Privacy.
 * Fail-soft rather than fail-fast because the seed script shouldn't
 * abort on a name collision; it should just skip the handle for that
 * one player and continue.
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
      console.warn(`  ⚠ Handle @${handle} taken — leaving ${rawName} without a handle (set custom via Settings → Privacy)`);
      return { assigned: null, collided: true };
    }
    throw err;
  }
}

/**
 * Derive a believable 6-attribute profile from position + skill note + goals.
 * Tuned for grassroots realism — all values 35–85, no Premier League numbers.
 */
function deriveAttributes(player: RosterPlayer): Record<string, number> {
  const base = { PAC: 55, SHO: 50, PAS: 55, DRI: 55, DEF: 55, PHY: 55 };
  const pos = (player.position ?? '').toUpperCase();

  // Position skews
  if (pos.includes('ST') || pos === 'CF') {
    base.SHO += 18; base.PAC += 8; base.DEF -= 12;
  } else if (pos === 'AM' || pos === 'CAM') {
    base.PAS += 12; base.DRI += 8; base.SHO += 6;
  } else if (pos === 'CM') {
    base.PAS += 10; base.PHY += 5;
  } else if (pos.includes('CB') || pos === 'DEF') {
    base.DEF += 18; base.PHY += 10; base.SHO -= 15; base.PAC -= 5;
  } else if (pos.includes('FB') || pos === 'LB' || pos === 'RB' || pos === 'LM' || pos === 'RM') {
    base.PAC += 10; base.DEF += 6; base.DRI += 5;
  } else if (pos === 'GK') {
    base.DEF += 5; base.PHY += 10; base.SHO -= 25; base.DRI -= 10;
  }

  // Goal-scoring shifts shooting up
  if (player.lastWeekGoals >= 5) base.SHO += 8;
  else if (player.lastWeekGoals >= 3) base.SHO += 4;

  // Skill note keyword heuristics
  const note = (player.skillNote ?? '').toLowerCase();
  if (note.includes('quick') || note.includes('pacy') || note.includes('runs')) base.PAC += 7;
  if (note.includes('clinical') || note.includes('finisher') || note.includes('poacher')) base.SHO += 8;
  if (note.includes('playmaker') || note.includes('passer') || note.includes('vision') || note.includes('through ball')) base.PAS += 8;
  if (note.includes('engine') || note.includes('all night') || note.includes('endless')) base.PHY += 8;
  if (note.includes('dribbler') || note.includes('beats his man') || note.includes('skilful')) base.DRI += 8;
  if (note.includes('physical') || note.includes('tough') || note.includes('strong')) base.PHY += 6;
  if (note.includes('solid') || note.includes('reads the game')) base.DEF += 5;

  // Clamp to grassroots range
  for (const k of Object.keys(base) as (keyof typeof base)[]) {
    base[k] = Math.max(35, Math.min(85, base[k]));
  }
  return base;
}

function resolveAvatar(player: RosterPlayer) {
  const look = player.look ?? {};
  const skin = V3_PALETTE.skin[look.skin ?? 'mid'];
  const hair = V3_PALETTE.hair[look.hair ?? 'dark'];
  const hairStyle: HairStyle = VALID_HAIR_STYLES.includes(look.hairStyle as HairStyle)
    ? (look.hairStyle as HairStyle)
    : 'short';
  return {
    avatarKitColor: V3_PALETTE.red,
    avatarAccentColor: V3_PALETTE.navy,
    avatarSkinTone: skin,
    avatarHairColor: hair,
    avatarHairStyle: hairStyle,
    avatarNumber: look.jerseyNumber ?? '',
    avatarLocked: false,
  };
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: pnpm tsx scripts/seed-kickabout-session.ts <roster.json>');
    process.exit(1);
  }
  const rosterPath = path.resolve(arg);
  const data: RosterFile = JSON.parse(readFileSync(rosterPath, 'utf8'));

  console.log(`\n[kickabout] seeding "${data.group.name}" — ${data.roster.length} players`);

  const sessionDate = new Date(data.session.date);
  if (Number.isNaN(sessionDate.getTime())) {
    console.error(`Invalid session.date: ${data.session.date}`);
    process.exit(1);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportwarren.com';

  // 1. Squad (group identity) — no unique on name, so findFirst-or-create
  const existingSquad = await prisma.squad.findFirst({ where: { name: data.group.name } });
  const squad = existingSquad
    ? await prisma.squad.update({
        where: { id: existingSquad.id },
        data: {
          shortName: data.group.shortName,
          kitColor: data.group.kitColor ?? V3_PALETTE.red,
          accentColor: data.group.accentColor ?? V3_PALETTE.navy,
          ...(data.group.founded ? { founded: new Date(data.group.founded) } : {}),
        },
      })
    : await prisma.squad.create({
        data: {
          name: data.group.name,
          shortName: data.group.shortName,
          kitColor: data.group.kitColor ?? V3_PALETTE.red,
          accentColor: data.group.accentColor ?? V3_PALETTE.navy,
          ...(data.group.founded ? { founded: new Date(data.group.founded) } : {}),
        },
      });
  console.log(`  ✓ Squad: ${squad.name} (id=${squad.id})`);

    // 2. Per-player provisioning
    const provisioned: Array<{ player: RosterPlayer; userId: string; profileId: string; token: string }> = [];

    for (const player of data.roster) {
      const token = genToken('kickabout');
      const walletAddress = player.isOrganizer && data.organizerWalletAddress
        ? data.organizerWalletAddress
        : token;
      const avatar = resolveAvatar(player);

      // Reuse existing user if name + group already exists (idempotent)
      const existing = await prisma.user.findFirst({
        where: {
          name: player.name,
          squads: { some: { squadId: squad.id } },
        },
      });

      // Create/update the user WITHOUT the handle first so collisions
      // don't block the row. Handle is set in a separate try/catch
      // below via safelySetHandle.
      const user = existing
        ? await prisma.user.update({
            where: { id: existing.id },
            data: {
              position: player.position ?? null,
              ...avatar,
            },
          })
        : await prisma.user.create({
            data: {
              walletAddress,
              chain: 'preview',
              name: player.name,
              position: player.position ?? null,
              ...avatar,
            },
          });

      // Best-effort handle — only attempt if existing user doesn't
      // already have one (don't overwrite custom handles).
      if (!existing?.handle && player.name) {
        await safelySetHandle(user.id, player.name);
      }

      // Player profile
      const profile = await prisma.playerProfile.upsert({
        where: { userId: user.id },
        update: {
          totalMatches: { increment: 0 },
        },
        create: {
          userId: user.id,
          level: 1,
          totalXP: 0,
          seasonXP: 0,
          totalMatches: 1,
          totalGoals: player.lastWeekGoals,
          totalAssists: 0,
        },
      });

      // Squad membership
      await prisma.squadMember.upsert({
        where: { squadId_userId: { squadId: squad.id, userId: user.id } },
        update: {
          role: player.isOrganizer ? 'captain' : 'player',
        },
        create: {
          squadId: squad.id,
          userId: user.id,
          role: player.isOrganizer ? 'captain' : 'player',
        },
      });

      // Player twin — position-baselined chess.com-style starting card.
      // Skip Kite agent provisioning (external API), create a synthetic
      // AiAgent row instead so the schema relation is satisfied. The
      // baseAttributes come from baselineForPosition so CBs start
      // strong in DEF/PHY, STs strong in SHO/PAC, etc.
      const existingTwin = await prisma.playerTwin.findUnique({
        where: { profileId: profile.id },
      });
      if (!existingTwin) {
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
      }

      // WhatsApp phone (stored on PlatformIdentity — reuse existing model)
      if (player.phone && player.phone !== '+44...') {
        const normalizedPhone = player.phone.replace(/[^\d+]/g, '');
        await prisma.platformIdentity.upsert({
          where: {
            platform_platformUserId: {
              platform: 'whatsapp',
              platformUserId: normalizedPhone,
            },
          },
          update: { userId: user.id },
          create: {
            userId: user.id,
            platform: 'whatsapp',
            platformUserId: normalizedPhone,
          },
        });
      }

      provisioned.push({ player, userId: user.id, profileId: profile.id, token: walletAddress });
    }
    console.log(`  ✓ ${provisioned.length} users + profiles + squad memberships`);

    // 3. Last week's Session — the Prisma Session model fits the
    // kickabout shape exactly (see comment in schema.prisma: "for
    // ad-hoc 'Bibs vs Non-Bibs' games").
    const session = await prisma.session.create({
      data: {
        squadId: squad.id,
        name: `Session · ${data.session.date}`,
        date: sessionDate,
        status: 'completed',
      },
    });

    // SessionAttendee for each player
    for (const { profileId } of provisioned) {
      await prisma.sessionAttendee.create({
        data: {
          sessionId: session.id,
          profileId,
        },
      });
    }

    // One synthetic Match summarising the night's results (linked to session)
    const totalGoals = data.session.totalGoals
      ?? data.roster.reduce((sum, p) => sum + p.lastWeekGoals, 0);
    const synthMatch = await prisma.match.create({
      data: {
        homeSquadId: squad.id,
        awaySquadId: squad.id,
        playersPerSide: data.session.playersPerSide,
        hasKeeper: data.session.hasKeeper,
        matchFormat: data.session.format,
        homeScore: totalGoals,
        awayScore: 0,
        submittedBy: provisioned.find((p) => p.player.isOrganizer)?.userId ?? provisioned[0].userId,
        status: 'verified',
        matchDate: sessionDate,
        sessionId: session.id,
      },
    });
    console.log(`  ✓ Session + summary match for ${data.session.date}`);

    // 4. PlayerMatchStats for each player
    for (const { player, profileId } of provisioned) {
      await prisma.playerMatchStats.create({
        data: {
          matchId: synthMatch.id,
          profileId,
          teamSide: 'home',
          goals: player.lastWeekGoals,
          assists: 0,
          cleanSheet: false,
          minutesPlayed: Math.max(7, player.lastWeekGames * 7),
        },
      });
    }
    console.log(`  ✓ Per-player session stats logged`);

    // 5. Output preview links + WhatsApp messages
    console.log('\n========================================================');
    console.log('  PREVIEW LINKS — paste each into the player\'s WhatsApp');
    console.log('========================================================');
    for (const { player, profileId, token } of provisioned) {
      const url = `${baseUrl}/preview/${encodeURIComponent(token)}`;
      // Lead with a PERSONAL BET, not a chore. First contact should be a
      // verdict about THEM that they want to argue with in the WhatsApp
      // thread — the debate starts before they even click. The rate-the-
      // lads ask lives on the landing page as the second step, not in the
      // opener. See product-calibration.md → "First-contact pass".
      const firstName = player.name.split(' ')[0];
      const attrs = baselineForPosition(player.position);
      const prediction = generatePrediction({ position: player.position, attrs, seed: profileId });
      const strong = `${prediction.strength.label.toLowerCase()} (${prediction.strength.value})`;
      const weak = `${prediction.weakness.label.toLowerCase()} (${prediction.weakness.value})`;
      const message =
        `${firstName} — your ${data.group.name} card is live and it's got opinions:\n\n` +
        `"${prediction.boldCall}"\n\n` +
        `Backing your ${strong} but that ${weak} is doing you no favours. ` +
        `Prove us wrong on the night — or don't 👀 ${url}`;
      console.log(`\n${player.name} ${player.phone ? `(${player.phone})` : ''}`);
      console.log(`  URL: ${url}`);
      console.log(`  Bold call: "${prediction.boldCall}"`);
      console.log(`  Message:\n  ${message}`);
    }
    console.log('\n========================================================\n');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
