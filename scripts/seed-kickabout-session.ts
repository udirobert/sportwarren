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

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

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
  return `${prefix}_${randomBytes(6).toString('base64url')}`;
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

  await prisma.$transaction(async (tx) => {
    // 1. Squad (group identity) — no unique on name, so findFirst-or-create
    const existingSquad = await tx.squad.findFirst({ where: { name: data.group.name } });
    const squad = existingSquad
      ? await tx.squad.update({
          where: { id: existingSquad.id },
          data: {
            shortName: data.group.shortName,
            kitColor: data.group.kitColor ?? V3_PALETTE.red,
            accentColor: data.group.accentColor ?? V3_PALETTE.navy,
            ...(data.group.founded ? { founded: new Date(data.group.founded) } : {}),
          },
        })
      : await tx.squad.create({
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
      const existing = await tx.user.findFirst({
        where: {
          name: player.name,
          squads: { some: { squadId: squad.id } },
        },
      });

      const user = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: {
              position: player.position ?? null,
              ...avatar,
            },
          })
        : await tx.user.create({
            data: {
              walletAddress,
              chain: 'preview',
              name: player.name,
              position: player.position ?? null,
              ...avatar,
            },
          });

      // Player profile
      const profile = await tx.playerProfile.upsert({
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
      await tx.squadMember.upsert({
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

      // WhatsApp phone (stored on PlatformIdentity — reuse existing model)
      if (player.phone && player.phone !== '+44...') {
        const normalizedPhone = player.phone.replace(/[^\d+]/g, '');
        await tx.platformIdentity.upsert({
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
    const session = await tx.session.create({
      data: {
        squadId: squad.id,
        name: `Session · ${data.session.date}`,
        date: sessionDate,
        status: 'completed',
      },
    });

    // SessionAttendee for each player
    for (const { profileId } of provisioned) {
      await tx.sessionAttendee.create({
        data: {
          sessionId: session.id,
          profileId,
        },
      });
    }

    // One synthetic Match summarising the night's results (linked to session)
    const totalGoals = data.session.totalGoals
      ?? data.roster.reduce((sum, p) => sum + p.lastWeekGoals, 0);
    const synthMatch = await tx.match.create({
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
      await tx.playerMatchStats.create({
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
    for (const { player, token } of provisioned) {
      const url = `${baseUrl}/preview/${encodeURIComponent(token)}`;
      const message = `Hey ${player.name} — I've set you up on a new thing for the ${data.group.name} group. Your stats from last week are already in. Have a look, tweak your avatar, sim a match against the lads if you want. See you Tuesday. ${url}`;
      console.log(`\n${player.name} ${player.phone ? `(${player.phone})` : ''}`);
      console.log(`  URL: ${url}`);
      console.log(`  Message:\n  ${message}`);
    }
    console.log('\n========================================================\n');
  });

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
