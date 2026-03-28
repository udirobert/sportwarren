import { prisma } from '../src/lib/db';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🌱 SEEDING SPORTWARREN PRODUCTION (NEON)...');

  // 1. Create System/Bot Users (The Agents)
  const agentUser = await prisma.user.upsert({
    where: { walletAddress: '0xAGENT_KITE_SYSTEM_01' },
    update: {},
    create: {
      walletAddress: '0xAGENT_KITE_SYSTEM_01',
      name: 'Kite Tactical Agent',
      chain: 'base',
    },
  });

  const scoutUser = await prisma.user.upsert({
    where: { walletAddress: '0xAGENT_SCOUT_SYSTEM_01' },
    update: {},
    create: {
      walletAddress: '0xAGENT_SCOUT_SYSTEM_01',
      name: 'Vision Scout Agent',
      chain: 'base',
    },
  });

  // 2. Create Agentic Squads
  const invicta = await prisma.squad.upsert({
    where: { id: 'squad_invicta_01' },
    update: {},
    create: {
      id: 'squad_invicta_01',
      name: 'Kite Invicta',
      shortName: 'KIV',
      homeGround: 'Kite Virtual Stadium',
      treasuryBalance: 5000,
      tactics: {
        create: {
          formation: '4-3-3',
          playStyle: 'high_press',
          instructions: { width: 'wide', tempo: 'fast' },
        },
      },
      members: {
        create: {
          userId: agentUser.id,
          role: 'captain',
        },
      },
    },
  });

  const neonStrikers = await prisma.squad.upsert({
    where: { id: 'squad_neon_01' },
    update: {},
    create: {
      id: 'squad_neon_01',
      name: 'Neon Strikers',
      shortName: 'NST',
      homeGround: 'Neon Cloud Arena',
      treasuryBalance: 2500,
      tactics: {
        create: {
          formation: '4-4-2',
          playStyle: 'direct',
          instructions: { width: 'normal', tempo: 'normal' },
        },
      },
      members: {
        create: {
          userId: scoutUser.id,
          role: 'captain',
        },
      },
    },
  });

  // 3. Seed some "Phygital" Proven Matches (Chainlink CRE History)
  await prisma.match.create({
    data: {
      homeSquadId: invicta.id,
      awaySquadId: neonStrikers.id,
      homeScore: 3,
      awayScore: 1,
      submittedBy: agentUser.id,
      status: 'verified',
      matchDate: new Date(Date.now() - 86400000), // Yesterday
      latitude: 51.5549, // Emirates
      longitude: -0.1084,
      weatherVerified: true,
      locationVerified: true,
      verificationDetails: {
        verified: true,
        confidence: 100,
        weather: { temperature: 14, conditions: 'Clear', source: 'OpenWeatherMap' },
        location: { region: 'London, UK', isPitch: true, placeType: 'stadium' },
        workflowId: 'cre_seed_01'
      },
      agentInsights: {
        agentId: 'kite_tactical_agent',
        agentName: 'Kite Tactical Agent',
        report: "Superior orbital tracking confirms match conditions at Emirates Stadium. Deploying maximum XP bonuses to the squad based on this high-confidence Phygital proof.",
        decision: "APPROVE_XP_DISBURSEMENT",
        timestamp: new Date().toISOString()
      }
    } as any,
  });

  console.log('✅ SEEDING COMPLETE: Neon Production is alive with Agentic Squads.');

  // Optional: Seed a sample squad media file for verification
  if ((process.env.SEED_SQUAD_MEDIA_SAMPLE || '').trim().toLowerCase() === 'true') {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const storageRoot = (process.env.STORAGE_ROOT || path.join(process.cwd(), 'storage')).toString();
      const squadId = invicta.id;
      const mediaId = 'seed_media_1';
      const dir = path.join(storageRoot, 'squads', squadId);
      await fs.mkdir(dir, { recursive: true });
      const pngBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='; // 1x1 PNG
      const buffer = Buffer.from(pngBase64, 'base64');
      const filePath = path.join(dir, `${mediaId}.png`);
      await fs.writeFile(filePath, buffer);
      await prisma.squadMedia.create({
        data: {
          id: mediaId,
          squadId,
          uploaderId: agentUser.id,
          title: 'Seed Photo',
          kind: 'image',
          mimeType: 'image/png',
          size: buffer.length,
          storageKey: path.posix.join('squads', squadId, `${mediaId}.png`),
          visibility: 'squad',
        },
      });
      console.log('📸 Seeded sample SquadMedia: seed_media_1');
    } catch (e) {
      console.warn('⚠️ SquadMedia seed skipped:', (e as Error).message);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
